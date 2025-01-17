from flask import Flask, render_template, request
from hello import get_embeddings
import psycopg2
from dotenv import load_dotenv
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
load_dotenv()

# Semantic search configuration
SIMILARITY_THRESHOLD = 0.7

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
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    
    if not query:
        return {'results': [], 'total': 0, 'page': page, 'per_page': per_page}

    try:
        # Generate embedding for query
        embeddings_model = get_embeddings()
        query_embedding = embeddings_model.embed_query(query)

        # Search in database using embeddings
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # First get total count of matching results
        cursor.execute(
            """
            SELECT COUNT(*)
            FROM bookmarked_tweets bt
            JOIN tweet_embeddings te ON bt.tweet_id = te.tweet_id
            WHERE (te.embedding <-> %s::vector) < %s
            """,
            (query_embedding, SIMILARITY_THRESHOLD))
        total_results = cursor.fetchone()[0]
        
        # Then get paginated results with similarity threshold
        cursor.execute(
            """
            SELECT bt.tweet_id, bt.url, bt.full_text, bt.timestamp, bt.media_type, 
                   bt.media_source, bt.author_name, bt.author_screen_name, 
                   bt.author_profile_image_url, bt.created_at, bt.embeddings,
                   te.embedding <-> %s::vector AS distance
            FROM bookmarked_tweets bt
            JOIN tweet_embeddings te ON bt.tweet_id = te.tweet_id
            WHERE (te.embedding <-> %s::vector) < %s
            ORDER BY distance ASC
            LIMIT %s OFFSET %s;
            """,
            (query_embedding, query_embedding, SIMILARITY_THRESHOLD, per_page, (page - 1) * per_page)
        )

        results = cursor.fetchall()
        cursor.close()
        conn.close()

        if not results:
            return {
                'results': [],
                'total': total_results,
                'page': page,
                'per_page': per_page,
                'total_pages': (total_results + per_page - 1) // per_page
            }

        # Prepare results
        results_list = []
        for (tweet_id, url, full_text, timestamp, media_type, media_source, 
             author_name, author_screen_name, author_profile_image_url, 
             created_at, embeddings, distance) in results:
            similarity = (1 - float(distance)) * 100
            
            results_list.append({
                'tweet_id': tweet_id,
                'url': url,
                'text': full_text,
                'timestamp': timestamp.isoformat() if timestamp else None,
                'media_type': media_type,
                'media_source': media_source,
                'author_name': author_name,
                'author_screen_name': author_screen_name,
                'author_profile_image_url': author_profile_image_url,
                'created_at': created_at.isoformat() if created_at else None,
                'embeddings': embeddings,
                'similarity': similarity
            })

        return {
            'results': results_list,
            'total': total_results,
            'page': page,
            'per_page': per_page,
            'total_pages': (total_results + per_page - 1) // per_page
        }

    except Exception as e:
        return {'error': str(e)}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
