const { PrismaClient } = require('@prisma/client');

const logger = require('../config/logger');

class BookmarkService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async fetchBookmarks(cursor = null, isFirstIteration = true) {
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
      count: 10,
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
        credentials: 'include',
        headers: headers,
        method: 'GET',
      });

      logger.info(response);

      if (!response.ok) {
        logger.error('API error:', response.status);
        if (response.status === 429) {
          logger.info('Rate limited, waiting 60s before retry...');
          await new Promise((resolve) => setTimeout(resolve, 60000));
          return await fetchBookmarks(cursor, result);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const entries = data.data?.bookmark_timeline_v2?.timeline?.instructions?.[0]?.entries || [];
      const tweetEntries = entries.filter((entry) => entry.entryId.startsWith('tweet-'));

      //   if (!tweetEntries || tweetEntries.length === 0) {
      //     logger.info('No entries found, stopping program');
      //     process.exit(0);
      //   }

      // Check which tweets are already in the database
      const tweetIds = tweetEntries.map((entry) => {
        const tweet =
          entry.content?.itemContent?.tweet_results?.result?.tweet ||
          entry.content?.itemContent?.tweet_results?.result;
        const id = tweet?.legacy?.id_str || entry.entryId.split('-')[1];
        return `tweet-${id}`;
      });

      const existingTweets = await this.prisma.bookmarked_tweets.findMany({
        where: {
          tweetId: { in: tweetIds },
        },
      });
      const existingTweetIds = new Set(existingTweets.map((row) => row.tweetId));

      // Filter out already processed tweets
      const unprocessedEntries = tweetEntries.filter((entry) => {
        const tweetId =
          entry.content?.itemContent?.tweet_results?.result?.tweet?.legacy?.id_str ||
          entry.content?.itemContent?.tweet_results?.result?.legacy?.id_str ||
          entry.entryId.split('-')[1];
        return !existingTweetIds.has(`tweet-${tweetId}`);
      });

      if (unprocessedEntries.length === 0 && isFirstIteration) {
        logger.info('No new bookmarks found in first iteration, stopping');
        return {
          code: 202,
          message: 'No new bookmarks found in first iteration, stopping',
          success: true,
          timestamp: new Date().toISOString(),
        };
      }

      if (unprocessedEntries.length > 0) {
        const parsedTweets = await Promise.all(
          unprocessedEntries.map((entry) => this.parseTweet(entry))
        );
        await this.saveTweetsToDatabase(parsedTweets);
        logger.info(
          `Processed ${unprocessedEntries.length} new tweets out of ${tweetEntries.length} total`
        );
      } else {
        logger.info(`No new tweets to process out of ${tweetEntries.length} tweets`);
        return {
          message: 'No new tweets to process, stopping',
          timestamp: new Date().toISOString(),
        };
      }

      const nextCursor = this.getNextCursor(entries);
      if (nextCursor) {
        // fs.writeFileSync('.bookmark_cursor', nextCursor);
        return await this.fetchBookmarks(nextCursor, false);
      } else {
        logger.info('No more bookmarks to fetch');
      }

      return data;
    } catch (error) {
      logger.error('Error fetching bookmarks:', error);
      throw error;
    }
  }

  async getNextCursor(entries) {
    const cursorEntry = entries.find((entry) => entry.entryId.startsWith('cursor-bottom-'));
    return cursorEntry ? cursorEntry.content.value : null;
  }

  async parseTweet(entry) {
    const tweet =
      entry.content?.itemContent?.tweet_results?.result?.tweet ||
      entry.content?.itemContent?.tweet_results?.result;

    // Safely access media, handling potential undefined values
    const media = tweet?.legacy?.entities?.media?.[0] || null;

    const getBestVideoVariant = (variants) => {
      if (!variants || variants.length === 0) return null;
      const mp4Variants = variants.filter((v) => v.content_type === 'video/mp4');
      return mp4Variants.reduce((best, current) => {
        if (!best || (current.bitrate && current.bitrate > best.bitrate)) {
          return current;
        }
        return best;
      }, null);
    };

    const getMediaInfo = (media) => {
      if (!media) return null;

      if (media.type === 'video' || media.type === 'animated_gif') {
        const videoInfo = tweet?.legacy?.extended_entities?.media?.[0]?.video_info;
        const bestVariant = getBestVideoVariant(videoInfo?.variants);
        return {
          source: bestVariant?.url || media.media_url_https,
          type: media.type,
        };
      }

      return {
        source: media.media_url_https,
        type: media.type,
      };
    };

    const author = tweet?.core?.user_results?.result?.legacy || {};
    const tweetId = tweet?.legacy?.id_str || entry.entryId.split('-')[1];
    const url = `https://twitter.com/${author.screen_name}/status/${tweetId}`;

    // Ensure we have a valid timestamp or use null
    const timestamp = tweet?.legacy?.created_at
      ? new Date(tweet.legacy.created_at).toISOString()
      : null;

    return {
      author: {
        name: author.name,
        profile_image_url: author.profile_image_url_https,
        screen_name: author.screen_name,
      },
      full_text: tweet?.legacy?.full_text,
      id: entry.entryId,
      media: getMediaInfo(media),
      timestamp: timestamp,
      url: url,
    };
  }

  async saveTweetsToDatabase(tweets) {
    logger.info(`Saving ${tweets.length} tweets to database`);
    try {
      for (const tweet of tweets) {
        await this.prisma.bookmarked_tweets.upsert({
          create: {
            authorName: tweet.author.name,
            authorProfileImageUrl: tweet.author.profile_image_url,
            authorScreenName: tweet.author.screen_name,
            fullText: tweet.full_text,
            mediaSource: tweet.media?.source || null,
            mediaType: tweet.media?.type || null,
            timestamp: new Date(tweet.timestamp),
            tweetId: tweet.id,
            url: tweet.url,
          },
          update: {},
          where: {
            tweetId: tweet.id,
          },
        });
        logger.info(`Saved tweet ${tweet.id}`);
      }
      logger.info(`Processing complete for ${tweets.length} tweets`);
    } catch (error) {
      logger.error('Error saving tweets to database:', error);
      throw error;
    }
  }

  //   async getBookmarks({
  //     page = 1,
  //     limit = 10,
  //     orderBy = 'timestamp',
  //     order = 'desc',
  //     filter = {},
  //   } = {}) {
  //     try {
  //       const skip = (page - 1) * limit;

  //       // Build where clause based on filters
  //       const where = {};
  //       if (filter.startDate) {
  //         where.timestamp = {
  //           ...where.timestamp,
  //           gte: new Date(filter.startDate),
  //         };
  //       }
  //       if (filter.endDate) {
  //         where.timestamp = {
  //           ...where.timestamp,
  //           lte: new Date(filter.endDate),
  //         };
  //       }
  //       if (filter.authorScreenName) {
  //         where.authorScreenName = filter.authorScreenName;
  //       }
  //       if (filter.mediaType) {
  //         where.mediaType = filter.mediaType;
  //       }

  //       // Fetch bookmarks with pagination and filters
  //       const [bookmarks, total] = await Promise.all([
  //         this.prisma.bookmarked_tweets.findMany({
  //           where,
  //           skip,
  //           take: limit,
  //           orderBy: {
  //             [orderBy]: order,
  //           },
  //           select: {
  //             tweetId: true,
  //             url: true,
  //             fullText: true,
  //             timestamp: true,
  //             mediaType: true,
  //             mediaSource: true,
  //             authorName: true,
  //             authorScreenName: true,
  //             authorProfileImageUrl: true,
  //             createdAt: true,
  //             embeddings: true,
  //           },
  //         }),
  //         this.prisma.bookmarked_tweets.count({ where }),
  //       ]);

  //       return {
  //         bookmarks,
  //         pagination: {
  //           page,
  //           limit,
  //           total,
  //           totalPages: Math.ceil(total / limit),
  //           hasNextPage: skip + bookmarks.length < total,
  //           hasPreviousPage: page > 1,
  //         },
  //         meta: {
  //           orderBy,
  //           order,
  //           filter,
  //         },
  //       };
  //     } catch (error) {
  //       logger.error('Error fetching bookmarks:', error);
  //       throw error;
  //     }
  //   }

  //   async getBookmarkById(tweetId) {
  //     try {
  //       const bookmark = await this.prisma.bookmarked_tweets.findUnique({
  //         where: {
  //           tweetId,
  //         },
  //       });

  //       if (!bookmark) {
  //         throw new Error(`Bookmark with ID ${tweetId} not found`);
  //       }

  //       return bookmark;
  //     } catch (error) {
  //       logger.error(`Error fetching bookmark ${tweetId}:`, error);
  //       throw error;
  //     }
  //   }

  //   async searchBookmarks({ query, page = 1, limit = 10 }) {
  //     try {
  //       const skip = (page - 1) * limit;
  //       const bookmarks = await this.prisma.bookmarked_tweets.findMany({
  //         where: {
  //           OR: [
  //             { fullText: { contains: query, mode: 'insensitive' } },
  //             { authorName: { contains: query, mode: 'insensitive' } },
  //             { authorScreenName: { contains: query, mode: 'insensitive' } },
  //           ],
  //         },
  //         skip,
  //         take: limit,
  //         orderBy: {
  //           timestamp: 'desc',
  //         },
  //       });

  //       const total = await this.prisma.bookmarked_tweets.count({
  //         where: {
  //           OR: [
  //             { fullText: { contains: query, mode: 'insensitive' } },
  //             { authorName: { contains: query, mode: 'insensitive' } },
  //             { authorScreenName: { contains: query, mode: 'insensitive' } },
  //           ],
  //         },
  //       });

  //       return {
  //         bookmarks,
  //         pagination: {
  //           page,
  //           limit,
  //           total,
  //           totalPages: Math.ceil(total / limit),
  //         },
  //       };
  //     } catch (error) {
  //       logger.error('Error searching bookmarks:', error);
  //       throw error;
  //     }
  //   }

  //   async getBookmarksByAuthor(authorScreenName, { page = 1, limit = 10 }) {
  //     try {
  //       const skip = (page - 1) * limit;
  //       const bookmarks = await this.prisma.bookmarked_tweets.findMany({
  //         where: {
  //           authorScreenName,
  //         },
  //         skip,
  //         take: limit,
  //         orderBy: {
  //           timestamp: 'desc',
  //         },
  //       });

  //       const total = await this.prisma.bookmarked_tweets.count({
  //         where: {
  //           authorScreenName,
  //         },
  //       });

  //       return {
  //         bookmarks,
  //         pagination: {
  //           page,
  //           limit,
  //           total,
  //           totalPages: Math.ceil(total / limit),
  //         },
  //       };
  //     } catch (error) {
  //       logger.error(`Error fetching bookmarks for author ${authorScreenName}:`, error);
  //       throw error;
  //     }
  //   }
}

module.exports = new BookmarkService();
