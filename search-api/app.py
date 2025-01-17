from flask import Flask, render_template, request
from flask_cors import CORS
from config import Config
from services.bookmark_service import BookmarkService

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('query', '')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', Config.DEFAULT_PAGE_SIZE))
    
    try:
        results, total_results = BookmarkService.search_bookmarks(query, page, per_page)
        
        return {
            'results': results,
            'total': total_results,
            'page': page,
            'per_page': per_page,
            'total_pages': (total_results + per_page - 1) // per_page
        }
    except Exception as e:
        return {'error': str(e)}

@app.route('/bookmarks', methods=['GET'])
def get_bookmarks():
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', Config.DEFAULT_PAGE_SIZE))
        
        results, total_results = BookmarkService.get_bookmarks(page, per_page)
        
        return {
            'results': results,
            'total': total_results,
            'page': page,
            'per_page': per_page,
            'total_pages': (total_results + per_page - 1) // per_page
        }
    except Exception as e:
        return {'error': str(e)}

@app.route('/analytics', methods=['GET'])
def get_analytics():
    try:
        analytics = BookmarkService.get_analytics()
        return analytics
    except Exception as e:
        return {'error': str(e)}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
