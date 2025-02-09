-- CreateTable
CREATE TABLE "bookmarked_tweets" (
    "tweet_id" VARCHAR NOT NULL,
    "url" TEXT NOT NULL,
    "full_text" TEXT,
    "timestamp" TIMESTAMP(6),
    "media_type" VARCHAR,
    "media_source" TEXT,
    "author_name" VARCHAR,
    "author_screen_name" VARCHAR,
    "author_profile_image_url" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "embeddings" BOOLEAN DEFAULT false,

    CONSTRAINT "bookmarked_tweets_pkey" PRIMARY KEY ("tweet_id")
);

-- CreateTable
CREATE TABLE "tweet_embeddings" (
    "tweet_id" VARCHAR NOT NULL,
    "embedding" vector,

    CONSTRAINT "tweet_embeddings_pkey" PRIMARY KEY ("tweet_id")
);

-- CreateIndex
CREATE INDEX "bookmarked_tweets_author_screen_name_index" ON "bookmarked_tweets"("author_screen_name");

-- CreateIndex
CREATE INDEX "bookmarked_tweets_timestamp_index" ON "bookmarked_tweets"("timestamp");

-- AddForeignKey
ALTER TABLE "tweet_embeddings" ADD CONSTRAINT "tweet_embeddings_tweet_id_fkey" FOREIGN KEY ("tweet_id") REFERENCES "bookmarked_tweets"("tweet_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
