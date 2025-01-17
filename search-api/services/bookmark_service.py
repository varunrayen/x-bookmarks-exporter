from database import DatabaseHandler
from hello import get_embeddings
from config import Config

class BookmarkService:
    @staticmethod
    def search_bookmarks(query, page, per_page):
        if not query.strip():
            return [], 0

        embeddings_model = get_embeddings()
        query_embedding = embeddings_model.embed_query(query)

        # Get total count
        count_query = """
            SELECT COUNT(*)
            FROM bookmarked_tweets bt
            JOIN tweet_embeddings te ON bt.tweet_id = te.tweet_id
            WHERE (te.embedding <-> %s::vector) < %s
        """
        total_results = DatabaseHandler.execute_query(
            count_query, 
            (query_embedding, Config.SIMILARITY_THRESHOLD)
        )[0][0]

        # Get search results
        search_query = """
            SELECT bt.*, te.embedding <-> %s::vector AS distance
            FROM bookmarked_tweets bt
            JOIN tweet_embeddings te ON bt.tweet_id = te.tweet_id
            WHERE (te.embedding <-> %s::vector) < %s
            ORDER BY distance ASC
            LIMIT %s OFFSET %s;
        """
        results = DatabaseHandler.execute_query(
            search_query,
            (query_embedding, query_embedding, Config.SIMILARITY_THRESHOLD, 
             per_page, (page - 1) * per_page)
        )

        return BookmarkService._format_results(results, include_similarity=True), total_results

    @staticmethod
    def get_bookmarks(page, per_page):
        count_query = "SELECT COUNT(*) FROM bookmarked_tweets"
        total_results = DatabaseHandler.execute_query(count_query)[0][0]

        query = """
            SELECT *
            FROM bookmarked_tweets
            ORDER BY timestamp DESC NULLS LAST
            LIMIT %s OFFSET %s;
        """
        results = DatabaseHandler.execute_query(
            query, 
            (per_page, (page - 1) * per_page)
        )

        return BookmarkService._format_results(results), total_results

    @staticmethod
    def _format_results(results, include_similarity=False):
        formatted_results = []
        for result in results:
            bookmark = {
                'tweet_id': result[0],
                'url': result[1],
                'text': result[2],
                'timestamp': result[3].isoformat() if result[3] else None,
                'media_type': result[4],
                'media_source': result[5],
                'author_name': result[6],
                'author_screen_name': result[7],
                'author_profile_image_url': result[8],
                'created_at': result[9].isoformat() if result[9] else None,
                'embeddings': result[10]
            }
            if include_similarity:
                similarity = (1 - float(result[-1])) * 100
                bookmark['similarity'] = similarity
            formatted_results.append(bookmark)
        return formatted_results 