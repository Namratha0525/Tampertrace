import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.api import auth, keys, documents, verification, reports

# Create tables
Base.metadata.create_all(bind=engine)

# Create storage dirs
for dir_name in ['keys', 'documents', 'packages', 'reports']:
    os.makedirs(os.path.join(settings.STORAGE_PATH, dir_name), exist_ok=True)

app = FastAPI(title="TamperTrace API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

app.include_router(auth.router)
app.include_router(keys.router)
app.include_router(documents.router)
app.include_router(verification.router)
app.include_router(reports.router)

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

@app.get("/api")
def api_root():
    return {"message": "Welcome to TamperTrace API"}

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../frontend/dist'))

if os.path.isdir(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Ignore API routes
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
            
        path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(path) and not os.path.isdir(path):
            return FileResponse(path)
        return FileResponse(os.path.join(frontend_dist, 'index.html'))
