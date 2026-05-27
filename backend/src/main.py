from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from src.config import get_settings
from src import db
from src.routers import moods, chat, profile, recommendations, export

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        dsn = await db.resolve_database_url()
        await db.get_pool()
        print(f"✅  Connected to {_url_display(dsn)}")
    except Exception as exc:
        if settings.app_env == "development":
            import warnings
            warnings.warn(
                f"Database connection failed: {exc}\n"
                "The API will start but endpoints requiring the database will fail.\n"
                "To start a local PostgreSQL: docker compose up -d postgres",
                stacklevel=2,
            )
        else:
            raise
    yield
    # Shutdown
    await db.close_pool()


def _url_display(url: str) -> str:
    """Return a safe display string for a DB URL (hides password)."""
    if not url:
        return ""
    try:
        proto, rest = url.split("://", 1)
        auth_host = rest.split("/", 1)[0]
        if "@" in auth_host:
            user_pass, host_port = auth_host.rsplit("@", 1)
            return f"{proto}://***@{host_port}"
        return f"{proto}://{auth_host}"
    except Exception:
        return "***"


app = FastAPI(
    title="Calmora API",
    description="Backend API for Calmora mental wellness application",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
origins = [o.strip() for o in settings.allowed_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global rate limit exceeded handler
@app.exception_handler(429)
async def rate_limit_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Please try again later."},
    )

# Routers
app.include_router(moods.router)
app.include_router(chat.router)
app.include_router(profile.router)
app.include_router(recommendations.router)
app.include_router(export.router)


@app.get("/", include_in_schema=False)
async def root():
    return {
        "name": "Calmora API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
async def health_check():
    return {"status": "ok"}
