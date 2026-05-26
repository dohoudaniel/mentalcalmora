import httpx
from src.config import get_settings


async def generate_insight(mood: str, text: str, sentiment: str, score: float) -> str:
    settings = get_settings()
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY not configured")

    prompt = (
        f"You are a compassionate AI wellness coach analyzing a mood entry. "
        f"Provide personalized, actionable insights based on this mood data:\n\n"
        f"Mood: {mood}\n"
        f"Text: {text}\n"
        f"Sentiment: {sentiment}\n"
        f"Sentiment Score: {score}\n\n"
        f"Please provide:\n"
        f"1. A brief, empathetic acknowledgment of their current emotional state\n"
        f"2. 2-3 specific, actionable suggestions tailored to their mood and situation\n"
        f"3. An encouraging note about their emotional awareness journey\n\n"
        f"Keep the response warm, supportive, and under 150 words."
    )

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.gemini_api_key}",
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.7, "maxOutputTokens": 200},
            },
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()

    insight = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text")
    if not insight:
        raise RuntimeError("No insight generated")
    return insight


async def chat_with_calmobot(
    messages: list[dict],
    user_data: dict | None = None,
    mood_entries: list[dict] | None = None,
) -> str:
    settings = get_settings()
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY not configured")

    system_prompt = (
        "You are Calmobot, an AI wellness assistant integrated into Calmora - a mood tracking and wellness application.\n\n"
        "IMPORTANT RESTRICTIONS:\n"
        "- You MUST ONLY answer questions related to health, mental health, wellness, mood management, emotional well-being\n"
        "- If users ask about topics outside of health/mental health, politely redirect them back to wellness topics\n"
        "- You can discuss physical health as it relates to mental well-being (exercise, nutrition, sleep, etc.)\n"
        "- Always stay within your scope as a wellness and mental health support assistant\n\n"
        "Guidelines:\n"
        "- Always be warm, empathetic, and non-judgmental\n"
        "- Use the user's name when appropriate to personalize responses\n"
        "- Reference their mood history when relevant to provide context-aware advice\n"
        "- Encourage users to track their moods regularly in Calmora\n"
        "- Suggest practical coping strategies like breathing exercises, journaling, physical activity\n"
        "- Remind users that you're not a replacement for professional medical or mental health care\n"
        "- If someone expresses serious mental health concerns, gently encourage them to seek professional help\n"
        "- Keep responses conversational but informative\n"
        "- Focus on emotional wellness, mood management, and general health tips\n"
        "- Be encouraging and supportive while maintaining appropriate boundaries"
    )

    if user_data and user_data.get("firstName"):
        system_prompt += f"\n\nUser Information:\n- Name: {user_data.get('firstName')} {user_data.get('lastName', '')}"

        if mood_entries and len(mood_entries) > 0:
            system_prompt += f"\n\nRecent Mood History (last {len(mood_entries)} entries):"
            for idx, entry in enumerate(mood_entries, 1):
                from datetime import datetime
                ts = entry.get("timestamp", "")
                date_str = ""
                if ts:
                    try:
                        date_str = datetime.fromisoformat(ts.replace("Z", "+00:00")).strftime("%Y-%m-%d")
                    except Exception:
                        date_str = str(ts)
                system_prompt += (
                    f"\n{idx}. {date_str}: Mood '{entry.get('mood')}', Sentiment: {entry.get('sentiment')}, "
                    f"Score: {entry.get('score')}/1.0"
                )
                if entry.get("description"):
                    system_prompt += f", Description: '{entry['description']}'"
                if entry.get("insights"):
                    system_prompt += f", Insights: '{entry['insights']}'"
            system_prompt += "\n\nUse this mood history to provide personalized insights and recommendations."
        else:
            system_prompt += "\n\nThis user hasn't recorded any mood entries yet. Encourage them to start tracking their moods."

    gemini_messages = []
    gemini_messages.append({"role": "user", "parts": [{"text": f"System: {system_prompt}"}]})

    for msg in messages:
        role = "model" if msg.get("role") == "assistant" else "user"
        gemini_messages.append({"role": role, "parts": [{"text": msg.get("content", "")}]})

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.gemini_api_key}",
            json={
                "contents": gemini_messages,
                "generationConfig": {"temperature": 0.7, "maxOutputTokens": 1000},
            },
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()

    text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text")
    if not text:
        raise RuntimeError("No response from AI")
    return text
