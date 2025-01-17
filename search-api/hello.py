from langchain_openai import OpenAIEmbeddings
import psycopg2
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI embeddings
embeddings_model = OpenAIEmbeddings(openai_api_key=os.getenv("EMBEDDING_OPENAI_API_KEY"))


def get_embeddings():
    return embeddings_model


def process_tweet_embeddings():
    conn = None
    cursor = None
    BATCH_SIZE = 50  # Adjust this based on your needs
    
    try:
        conn = psycopg2.connect(
            dbname="bookmarks", user="varunrayen", password="varunrayen", host="localhost", port="5432"
        )
        cursor = conn.cursor()

        # Create embeddings table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tweet_embeddings (
                tweet_id VARCHAR PRIMARY KEY REFERENCES bookmarked_tweets(tweet_id),
                embedding VECTOR(1536)
            );
        """)

        # Add a boolean flag to the bookmarked_tweets table if it doesn't exist
        cursor.execute("""
            ALTER TABLE bookmarked_tweets
            ADD COLUMN IF NOT EXISTS embeddings BOOLEAN DEFAULT FALSE;
        """)

        # Fetch tweets without embeddings
        cursor.execute("""
            SELECT t.tweet_id, t.full_text 
            FROM bookmarked_tweets t
            WHERE t.embeddings = FALSE
        """)
        tweets = cursor.fetchall()
        
        total_tweets = len(tweets)
        processed_count = 0

        # Process tweets in batches
        for i in range(0, len(tweets), BATCH_SIZE):
            batch = tweets[i:i + BATCH_SIZE]
            try:
                # Generate embeddings for the entire batch
                texts = [text for _, text in batch]
                embeddings = embeddings_model.embed_documents(texts)
                
                # Prepare batch inserts
                embedding_values = [(tweet_id, embedding) for (tweet_id, _), embedding in zip(batch, embeddings)]
                
                # Batch insert embeddings
                cursor.executemany(
                    "INSERT INTO tweet_embeddings (tweet_id, embedding) VALUES (%s, %s)",
                    embedding_values
                )
                
                # Batch update flags
                tweet_ids = [tweet_id for tweet_id, _ in batch]
                cursor.execute(
                    "UPDATE bookmarked_tweets SET embeddings = TRUE WHERE tweet_id = ANY(%s)",
                    (tweet_ids,)
                )
                
                conn.commit()
                
                processed_count += len(batch)
                print(f"Progress: {processed_count}/{total_tweets} tweets processed.")
                
            except Exception as e:
                print(f"Error processing batch: {str(e)}")
                conn.rollback()

    except Exception as e:
        print(f"Database error: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


if __name__ == "__main__":
    process_tweet_embeddings()
