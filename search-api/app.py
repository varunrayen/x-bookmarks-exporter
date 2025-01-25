from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from config import Config
from services.bookmark_service import BookmarkService

app = FastAPI()

# CORS middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/search")
async def search(
    query: str = Query(""),
    page: int = Query(1),
    per_page: int = Query(default=Config.DEFAULT_PAGE_SIZE)
):
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
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/bookmarks")
async def get_bookmarks(
    page: int = Query(1),
    per_page: int = Query(default=Config.DEFAULT_PAGE_SIZE)
):
    try:
        results, total_results = BookmarkService.get_bookmarks(page, per_page)
        
        return {
            'results': results,
            'total': total_results,
            'page': page,
            'per_page': per_page,
            'total_pages': (total_results + per_page - 1) // per_page
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics")
async def get_analytics():
    try:
        analytics = BookmarkService.get_analytics()
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/healthz")
async def healthz():
    """Basic health check endpoint"""
    return {"status": "healthy"}


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=5001)
