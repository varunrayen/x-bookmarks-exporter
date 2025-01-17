import psycopg2
from config import Config

class DatabaseHandler:
    @staticmethod
    def get_connection():
        return psycopg2.connect(**Config.DATABASE)

    @staticmethod
    def execute_query(query, params=None):
        conn = DatabaseHandler.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(query, params)
            results = cursor.fetchall()
            return results
        finally:
            cursor.close()
            conn.close() 