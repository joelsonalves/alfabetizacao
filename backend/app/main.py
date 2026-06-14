import time
import uuid
import logging
from datetime import datetime

import structlog
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.routes import auth, modules, progress, images
from app.services.auth import decode_access_token

logging.basicConfig(level=getattr(logging, settings.log_level.upper(), logging.INFO))

structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.dev.ConsoleRenderer(),
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
    cache_logger_on_first_use=True,
)
logger = structlog.get_logger()

START_TIME = time.time()

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


@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = str(uuid.uuid4())
    user_id = None
    auth_header = request.headers.get("authorization")
    if auth_header:
        scheme, _, token = auth_header.partition(" ")
        if scheme.lower() == "bearer":
            payload = decode_access_token(token)
            if payload:
                user_id = payload.get("sub")

    logger.info("request_start", request_id=request_id, path=request.url.path, method=request.method, user_id=user_id)
    start = time.time()
    try:
        response = await call_next(request)
    except Exception as exc:
        logger.exception("request_error", request_id=request_id, path=request.url.path, method=request.method)
        raise
    duration_ms = int((time.time() - start) * 1000)
    logger.info("request_end", request_id=request_id, path=request.url.path, method=request.method,
                duration_ms=duration_ms, status_code=response.status_code, user_id=user_id)
    response.headers["X-Request-ID"] = request_id
    return response


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(modules.router, prefix="/api/modules", tags=["modules"])
app.include_router(modules.lesson_router, prefix="/api", tags=["lessons"])
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
app.include_router(images.router, prefix="/api/images", tags=["images"])


@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "ok"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "error"

    if db_status == "error":
        raise HTTPException(status_code=503, detail="Database connection failed")

    return {
        "status": "ok",
        "service": "alfabetizacao-multissensorial",
        "database": db_status,
        "uptime_seconds": int(time.time() - START_TIME),
    }


@app.get("/api/metrics")
def get_metrics(db: Session = Depends(get_db)):
    from app.models.user import User
    from app.models.progress import UserProgress, Achievement

    total_users = db.query(User).count()
    lessons_completed = db.query(UserProgress).filter(UserProgress.completed == True).count()
    total_achievements = db.query(Achievement).count()
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    active_today = db.query(User).filter(User.last_active_date >= today_start).count()

    return {
        "total_users": total_users,
        "total_lessons_completed": lessons_completed,
        "total_achievements": total_achievements,
        "active_users_today": active_today,
    }
