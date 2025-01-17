require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');

async function fetchBookmarks(cursor = null) {
  if (!cursor) {
    // Try to read last cursor from temporary storage
    try {
      const lastCursor = fs.readFileSync('.bookmark_cursor', 'utf8');
      cursor = lastCursor;
      console.log('Resuming from cursor:', cursor);
    } catch (err) {
      console.log('No saved cursor found, starting from beginning');
    }
  }

  const headers = new Headers();
  headers.append('Cookie', process.env.COOKIE);
  headers.append('X-Csrf-token', process.env.CSRF_TOKEN);
  headers.append('Authorization', process.env.AUTH_TOKEN);

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
    count: 100,
    cursor: cursor,
    includePromotedContent: false,
  };

  const API_URL = `https://x.com/i/api/graphql/${
    process.env.BOOKMARKS_API_ID
  }/Bookmarks?features=${encodeURIComponent(
    JSON.stringify(features)
  )}&variables=${encodeURIComponent(JSON.stringify(variables))}`;

  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: headers,
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('API error:', response.status);
      if (response.status === 429) {
        console.log('Rate limited, waiting 60s before retry...');
        await new Promise((resolve) => setTimeout(resolve, 60000));
        return await fetchBookmarks(cursor, result);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const entries = data.data?.bookmark_timeline_v2?.timeline?.instructions?.[0]?.entries || [];

    const tweetEntries = entries.filter((entry) => entry.entryId.startsWith('tweet-'));

    // Save tweet entries to JSON file
    const jsonData = JSON.stringify(tweetEntries, null, 2);
    fs.writeFileSync('tweet_entries.json', jsonData);
    console.log('Tweet entries saved to tweet_entries.json');

    // Extract tweet results and save to MongoDB
    const tweetResults = tweetEntries.map(
      (entry) =>
        entry.content.itemContent.tweet_results.result.tweet ||
        entry.content.itemContent.tweet_results.result
    );
    await saveTweetsToMongoDB(tweetResults);

    const nextCursor = getNextCursor(entries);
    if (nextCursor) {
      fs.writeFileSync('.bookmark_cursor', nextCursor);
      return await fetchBookmarks(nextCursor, false);
    } else {
      console.log('No more bookmarks to fetch');
    }

    return tweetEntries;
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    throw error;
  }
}

const getNextCursor = (entries) => {
  const cursorEntry = entries.find((entry) => entry.entryId.startsWith('cursor-bottom-'));
  return cursorEntry ? cursorEntry.content.value : null;
};

async function saveTweetsToMongoDB(tweets) {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const database = client.db('production'); // You can change the database name
    const collection = database.collection('bookmarked_tweets');

    // Insert tweets into collection
    const result = await collection.insertMany(tweets);
    console.log(`${result.insertedCount} tweets saved to MongoDB`);
  } catch (error) {
    console.error('Error saving to MongoDB:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Example usage:
async function main() {
  await fetchBookmarks();
}

main().catch(console.error);
