/* eslint-disable */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('bookmarked_tweets', {
    tweet_id: { type: 'VARCHAR', primaryKey: true },
    url: { type: 'TEXT', notNull: true },
    full_text: { type: 'TEXT' },
    timestamp: { type: 'TIMESTAMP' },
    media_type: { type: 'VARCHAR' },
    media_source: { type: 'TEXT' },
    author_name: { type: 'VARCHAR' },
    author_screen_name: { type: 'VARCHAR' },
    author_profile_image_url: { type: 'TEXT' },
    created_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Optional: Add indexes for frequently queried columns
  pgm.createIndex('bookmarked_tweets', 'author_screen_name');
  pgm.createIndex('bookmarked_tweets', 'timestamp');
};

exports.down = (pgm) => {
  pgm.dropIndex('bookmarked_tweets', 'author_screen_name');
  pgm.dropIndex('bookmarked_tweets', 'timestamp');
  pgm.dropTable('bookmarked_tweets');
};
