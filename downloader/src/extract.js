require('dotenv').config();
const fs = require('fs');
const { MongoClient } = require('mongodb');

const BATCH_SIZE = 100;
const MAX_RETRIES = 3;
const RETRY_DELAY = 60000; // 60 seconds

class BookmarkExtractor {
  constructor() {
    this.mongoClient = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 1,
    });
    this.database = null;
    this.collection = null;
  }

  async connect() {
    console.log('Connecting to MongoDB...');
    await this.mongoClient.connect();
    this.database = this.mongoClient.db('production');
    this.collection = this.database.collection('bookmarked_tweets');
    console.log('Successfully connected to MongoDB');
  }

  async disconnect() {
    console.log('Disconnecting from MongoDB...');
    await this.mongoClient.close();
    console.log('MongoDB connection closed');
  }

  async fetchAllBookmarks() {
    let cursor = null;

    try {
      await this.connect();

      while (true) {
        const data = await this.fetchBookmarksWithRetry(cursor);
        const entries = data.data?.bookmark_timeline_v2?.timeline?.instructions?.[0]?.entries || [];

        const tweetEntries = await this.processTweetBatch(entries);

        // If we found any existing tweets, stop processing
        const foundExistingTweets =
          entries.length > 0 &&
          (await this.collection.findOne({
            _id: {
              $in: tweetEntries
                .filter((entry) => entry.entryId.startsWith('tweet-'))
                .map((entry) => entry.content?.itemContent?.tweet_results?.result?.rest_id)
                .filter(Boolean),
            },
          }));

        if (foundExistingTweets) {
          console.log('Found existing tweets, stopping execution');
          break;
        }

        cursor = getNextCursor(entries);
        if (!cursor) {
          console.log('No more bookmarks to fetch');
          break;
        }

        console.log('Moving to next page');
      }
    } finally {
      await this.disconnect();
    }
  }

  async fetchBookmarksWithRetry(cursor = null, retryCount = 0) {
    try {
      const headers = new Headers({
        Authorization: process.env.AUTH_TOKEN,
        Cookie: process.env.COOKIE,
        'X-Csrf-token': process.env.CSRF_TOKEN,
      });

      const features = {
        articles_preview_enabled: true,
        c9s_tweet_anatomy_moderator_badge_enabled: true,
        communities_web_enable_tweet_community_results_fetch: true,
        creator_subscriptions_quote_tweet_preview_enabled: false,
        creator_subscriptions_tweet_preview_api_enabled: true,
        freedom_of_speech_not_reach_fetch_enabled: true,
        graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
        graphql_timeline_v2_bookmark_timeline: true,
        longform_notetweets_consumption_enabled: true,
        longform_notetweets_inline_media_enabled: true,
        longform_notetweets_rich_text_read_enabled: true,
        premium_content_api_read_enabled: false,
        profile_label_improvements_pcf_label_in_post_enabled: true,
        responsive_web_edit_tweet_api_enabled: true,
        responsive_web_enhance_cards_enabled: false,
        responsive_web_graphql_exclude_directive_enabled: true,
        responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
        responsive_web_graphql_timeline_navigation_enabled: true,
        responsive_web_grok_analyze_button_fetch_trends_enabled: false,
        responsive_web_grok_analyze_post_followups_enabled: true,
        responsive_web_grok_share_attachment_enabled: true,
        responsive_web_jetfuel_frame: false,
        responsive_web_twitter_article_tweet_consumption_enabled: true,
        rweb_tipjar_consumption_enabled: true,
        rweb_video_timestamps_enabled: true,
        standardized_nudges_misinfo: true,
        tweet_awards_web_tipping_enabled: false,
        tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
        verified_phone_label_enabled: true,
        view_counts_everywhere_api_enabled: true,
      };

      const variables = {
        count: BATCH_SIZE,
        cursor: cursor,
        includePromotedContent: false,
      };

      const API_URL = `https://x.com/i/api/graphql/${
        process.env.BOOKMARKS_API_ID
      }/Bookmarks?features=${encodeURIComponent(
        JSON.stringify(features)
      )}&variables=${encodeURIComponent(JSON.stringify(variables))}`;

      const response = await fetch(API_URL, {
        credentials: 'include',
        headers: headers,
        method: 'GET',
      });

      if (!response.ok) {
        if (response.status === 429 && retryCount < MAX_RETRIES) {
          console.log(
            `Rate limited, attempt ${retryCount + 1}/${MAX_RETRIES}, waiting ${RETRY_DELAY / 1000}s...`
          );
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          return this.fetchBookmarksWithRetry(cursor, retryCount + 1);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      throw error;
    }
  }

  async processTweetBatch(entries) {
    const tweetEntries = entries.filter((entry) => entry.entryId.startsWith('tweet-'));

    if (tweetEntries.length === 0) return;

    const tweetResults = tweetEntries
      .map((entry) => {
        // More robust tweet extraction with error handling
        const tweetResult = entry.content?.itemContent?.tweet_results?.result;
        if (!tweetResult) {
          console.warn(`Skipping tweet due to missing data structure: ${entry.entryId}`);
          return null;
        }

        const tweet = tweetResult.tweet || tweetResult;
        if (!tweet) {
          console.warn(`Skipping tweet due to invalid structure: ${entry.entryId}`);
          return null;
        }

        return {
          ...tweet,
          _id: tweet.rest_id || tweet.legacy?.id_str || tweet.id_str || tweet.id,
          bookmarked_at: new Date(),
          last_updated: new Date(),
        };
      })
      .filter((tweet) => tweet !== null);

    console.log(`Fetched ${tweetResults.length} tweets`);

    // Check which tweets already exist in the database
    const tweetIds = tweetResults.map((tweet) => tweet._id);
    const existingTweets = await this.collection.find({ _id: { $in: tweetIds } }).toArray();
    const existingTweetIds = new Set(existingTweets.map((tweet) => tweet._id));

    console.log(`Found ${existingTweets.length} existing tweets in database`);

    // Filter out existing tweets and only process new ones
    const newTweets = tweetResults.filter((tweet) => !existingTweetIds.has(tweet._id));
    console.log(`Processing ${newTweets.length} new tweets`);

    if (newTweets.length > 0) {
      const operations = newTweets.map((tweet) => ({
        insertOne: {
          document: {
            ...tweet,
            first_bookmarked_at: new Date(),
          },
        },
      }));

      const result = await this.collection.bulkWrite(operations);
      console.log(`Successfully inserted ${result.insertedCount} new tweets`);
    }

    return tweetEntries;
  }
}

const getNextCursor = (entries) => {
  const cursorEntry = entries.find((entry) => entry.entryId.startsWith('cursor-bottom-'));
  return cursorEntry ? cursorEntry.content.value : null;
};

async function main() {
  const extractor = new BookmarkExtractor();
  await extractor.fetchAllBookmarks();
}

main().catch(console.error);
