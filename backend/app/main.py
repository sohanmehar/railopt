from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.api import router as api_router

app = FastAPI(
    title="RailBlock AI - Automatic Block Planning Engine",
    description="API for Indian Railways Multi-Department Maintenance Optimization, Shadow Bundling & Timetable Deconfliction.",
    version="1.0.0"
)

# CORS setup for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows localhost:3000 during local hackathon dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
app.include_router(api_router, prefix="", include_in_schema=False)

@app.get("/")
def root():
    return {
        "message": "Welcome to RailBlock AI Backend",
        "docs_url": "/docs",
        "health_check": "/api/v1/health"
    }