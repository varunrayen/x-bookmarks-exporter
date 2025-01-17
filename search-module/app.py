from flask import Flask, render_template, request
from hello import get_embeddings
import psycopg2
from dotenv import load_dotenv
import os

app = Flask(__name__)
load_dotenv()

def get_db_connection():
    return psycopg2.connect(
        dbname="bookmarks",
        user="varunrayen",
        password="varunrayen",
        host="localhost",
        port="5432"
    )

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('query', '').strip()
    if not query:
        return {'results': []}

    try:
        # Generate embedding for query
        embeddings_model = get_embeddings()
        query_embedding = embeddings_model.embed_query(query)

        # Search in database using embeddings
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT bt.tweet_id, bt.full_text, bt.url, te.embedding <-> %s::vector AS distance
            FROM bookmarked_tweets bt
            JOIN tweet_embeddings te ON bt.tweet_id = te.tweet_id
            ORDER BY distance ASC
            LIMIT 5;
            """,
            (query_embedding,)
        )

        results = cursor.fetchall()
        cursor.close()
        conn.close()

        if not results:
            return {'results': []}

        # Prepare results
        results_list = []
        for tweet_id, text, url, distance in results:
            similarity = (1 - float(distance)) * 100
            
            results_list.append({'text': text, 'similarity': similarity, 'url': url})

        return {'results': results_list}

    except Exception as e:
        return {'error': str(e)}

if __name__ == '__main__':
    app.run(debug=True)
