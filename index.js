require('dotenv').config();

async function fetchBookmarks() {
  const headers = new Headers();
  headers.append("Cookie", process.env.COOKIE);
  headers.append("X-Csrf-token", process.env.CSRF_TOKEN);
  headers.append("Authorization", process.env.AUTH_TOKEN);

  const features = {
	"articles_preview_enabled": true,
	"c9s_tweet_anatomy_moderator_badge_enabled": true,
	"communities_web_enable_tweet_community_results_fetch": true,
	"creator_subscriptions_quote_tweet_preview_enabled": false,
	"creator_subscriptions_tweet_preview_api_enabled": true,
	"freedom_of_speech_not_reach_fetch_enabled": true,
	"graphql_is_translatable_rweb_tweet_is_translatable_enabled": true,
	"graphql_timeline_v2_bookmark_timeline": true,
	"longform_notetweets_consumption_enabled": true,
	"longform_notetweets_inline_media_enabled": true,
	"longform_notetweets_rich_text_read_enabled": true,
	"premium_content_api_read_enabled": false,
	"profile_label_improvements_pcf_label_in_post_enabled": true,
	"responsive_web_edit_tweet_api_enabled": true,
	"responsive_web_enhance_cards_enabled": false,
	"responsive_web_graphql_exclude_directive_enabled": true,
	"responsive_web_graphql_skip_user_profile_image_extensions_enabled": false,
	"responsive_web_graphql_timeline_navigation_enabled": true,
	"responsive_web_grok_analyze_button_fetch_trends_enabled": false,
	"responsive_web_grok_analyze_post_followups_enabled": true,
	"responsive_web_grok_share_attachment_enabled": true,
	"responsive_web_jetfuel_frame": false,
	"responsive_web_twitter_article_tweet_consumption_enabled": true,
	"rweb_tipjar_consumption_enabled": true,
	"rweb_video_timestamps_enabled": true,
	"standardized_nudges_misinfo": true,
	"tweet_awards_web_tipping_enabled": false,
	"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled": true,
	"verified_phone_label_enabled": true,
	"view_counts_everywhere_api_enabled": true
}

  const variables = {
    count: 2,
    includePromotedContent: false,
  };

  const API_URL = `https://x.com/i/api/graphql/${
    process.env.BOOKMARKS_API_ID
  }/Bookmarks?features=${encodeURIComponent(
    JSON.stringify(features)
  )}&variables=${encodeURIComponent(JSON.stringify(variables))}`;

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: headers,
      credentials: 'include'
    });

    if (!response.ok) {
      console.error("API error:", response.status);
      if (response.status === 429) {
        console.log("Rate limited, waiting 60s before retry...");
        await new Promise(resolve => setTimeout(resolve, 60000));
        return await fetchBookmarks(cursor, result);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const entries = data.data?.bookmark_timeline_v2?.timeline?.instructions?.[0]?.entries || [];
    const tweetEntries = entries.filter(entry => entry.entryId.startsWith("tweet-"));
    const parsedTweets = tweetEntries.map(parseTweet);

    console.log("Received data:", parsedTweets);
    return data;
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    throw error;
  }
}

const parseTweet = (entry) => {
  const tweet = entry.content?.itemContent?.tweet_results?.result?.tweet || entry.content?.itemContent?.tweet_results?.result;

  // Safely access media, handling potential undefined values
  const media = tweet?.legacy?.entities?.media?.[0] || null;

  const getBestVideoVariant = (variants) => {
    if (!variants || variants.length === 0) return null;
    const mp4Variants = variants.filter(v => v.content_type === "video/mp4");
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
        type: media.type,
        source: bestVariant?.url || media.media_url_https,
      };
    }

    return {
      type: media.type,
      source: media.media_url_https,
    };
  };

  const author = tweet?.core?.user_results?.result?.legacy || {};
  const tweetId = tweet?.legacy?.id_str || entry.entryId.split('-')[1];
  const url = `https://twitter.com/${author.screen_name}/status/${tweetId}`;

  return {
    id: entry.entryId,
    url: url,
    full_text: tweet?.legacy?.full_text,
    timestamp: tweet?.legacy?.created_at,
    media: getMediaInfo(media),
    author: {
      name: author.name,
      screen_name: author.screen_name,
      profile_image_url: author.profile_image_url_https
    }
  }; 
};

fetchBookmarks();