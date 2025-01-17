import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    DATABASE = {
        'dbname': 'bookmarks',
        'user': 'varunrayen',
        'password': 'varunrayen',
        'host': 'localhost',
        'port': '5432'
    }
    SIMILARITY_THRESHOLD = 0.7
    DEFAULT_PAGE_SIZE = 10 