from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config import get_settings
from src import db
from src.routers import moods, chat, profile, recommendations, export

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await db.get_pool()
    yield
    # Shutdown
    await db.close_pool()


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

# Routers
app.include_router(moods.router)
app.include_router(chat.router)
app.include_router(profile.router)
app.include_router(recommendations.router)
app.include_router(export.router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
