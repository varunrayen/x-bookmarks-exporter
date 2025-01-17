from hello import get_embeddings
import numpy as np
import psycopg2  # Import the psycopg2 library for PostgreSQL

# Establish a connection to the database
conn = psycopg2.connect(
    dbname="bookmarks", 
    user="varunrayen", 
    password="varunrayen", 
    host="localhost", 
    port="5432"
)

embeddings_model = get_embeddings()

# Query string
query = "huggingface"

# Generate embedding for query
query_embedding = embeddings_model.embed_query(query)

print(query_embedding)

# Perform similarity search in Postgres
cursor = conn.cursor()
cursor.execute(
    """
    SELECT bt.tweet_id, bt.full_text, te.embedding <-> %s::vector AS distance
    FROM bookmarked_tweets bt
    JOIN tweet_embeddings te ON bt.tweet_id = te.tweet_id
    ORDER BY distance ASC
    LIMIT 5;
    """,
    (query_embedding,)
)

results = cursor.fetchall()
for tweet_id, text, distance in results:
    print(f"Tweet ID: {tweet_id}, Text: {text}, Distance: {distance}")

cursor.close()
conn.close()