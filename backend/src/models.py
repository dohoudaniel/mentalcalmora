from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal


# Auth models
class SignupRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=8)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)


class LoginRequest(BaseModel):
    email: str
    password: str


# Mood models
class MoodEntryCreate(BaseModel):
    mood: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=2000)


class MoodEntryOut(BaseModel):
    id: str
    user_id: str
    mood: str
    description: str | None
    text: str
    sentiment: Literal["POSITIVE", "NEGATIVE", "NEUTRAL"]
    score: float
    timestamp: datetime
    insights: str | None


# Recommendation models
class RecommendationOut(BaseModel):
    id: int
    title: str
    description: str
    type: str
    sentiment_target: str | None


# Chat models
class ChatMessageCreate(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=10000)


class ChatMessageOut(BaseModel):
    id: str
    user_id: str
    role: str
    content: str
    timestamp: datetime


class ChatbotRequest(BaseModel):
    messages: list[dict]
    user_data: dict | None = None
    mood_entries: list[dict] | None = None


# Profile models
class ProfileUpdate(BaseModel):
    first_name: str | None = Field(default=None, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)
    avatar_url: str | None = Field(default=None, max_length=1000)


class ProfileOut(BaseModel):
    id: str
    first_name: str
    last_name: str
    avatar_url: str | None
    created_at: datetime | None
    updated_at: datetime | None
    last_login: datetime | None


# Export models
class ExportRequest(BaseModel):
    format: Literal["json", "pdf"] = "json"
