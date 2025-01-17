from langchain_community.embeddings.openai import OpenAIEmbeddings
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

        # Fetch tweets without embeddings
        cursor.execute("""
            SELECT t.tweet_id, t.full_text 
            FROM bookmarked_tweets t
        """)
        tweets = cursor.fetchall()

        # Generate embeddings and store them
        for tweet_id, text in tweets:
            try:
                embedding = embeddings_model.embed_query(text)
                cursor.execute(
                    "INSERT INTO tweet_embeddings (tweet_id, embedding) VALUES (%s, %s)",
                    (tweet_id, embedding)
                )
                conn.commit()  # Commit after each successful insertion
            except Exception as e:
                print(f"Error processing tweet {tweet_id}: {str(e)}")
                conn.rollback()

    except Exception as e:
        print(f"Database error: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()