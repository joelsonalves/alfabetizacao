from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import auth, modules, progress, images

app = FastAPI(
    title="Alfabetização Multissensorial API",
    description="API do sistema de alfabetização com digitação",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(modules.router, prefix="/api/modules", tags=["modules"])
app.include_router(modules.lesson_router, prefix="/api", tags=["lessons"])
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
app.include_router(images.router, prefix="/api/images", tags=["images"])


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "alfabetizacao-multissensorial"}
