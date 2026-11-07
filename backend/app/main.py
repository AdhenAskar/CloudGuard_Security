from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.scans import router as scans_router
from app.routes.health import router as health_router
from app.config import settings

app = FastAPI(
    title="CloudGuard SME API",
    version="0.1.0",
    description="Read-only cloud security assessment API. AWS scans use STS role assumption.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)
app.include_router(health_router, prefix="/api")
app.include_router(scans_router, prefix="/api")

@app.get("/")
def root():
    return {"name": "CloudGuard SME API", "version": "0.1.0", "docs": "/docs"}
