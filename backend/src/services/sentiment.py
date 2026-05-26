import re
from typing import Literal

POSITIVE_WORDS = [
    "happy", "great", "excellent", "good", "joy", "excited", "calm", "peaceful",
    "relaxed", "wonderful", "amazing", "fantastic", "love", "loved", "loving",
    "grateful", "thankful", "blessed", "content", "satisfied", "proud",
    "confident", "hopeful", "optimistic", "cheerful", "delighted", "thrilled",
    "blissful", "elated", "euphoric", "glad", "pleased", "radiant", "sunny",
    "upbeat", "victorious", "vibrant", "vivacious", "ecstatic", "jubilant",
    "overjoyed", "blessed", "fortunate", "lucky", "smiling", "laughing",
]

NEGATIVE_WORDS = [
    "sad", "angry", "upset", "anxious", "stressed", "worried", "tired",
    "frustrated", "depressed", "miserable", "horrible", "terrible", "awful",
    "bad", "hate", "hated", "hating", "disappointed", "discouraged", "lonely",
    "heartbroken", "devastated", "despair", "hopeless", "helpless", "worthless",
    "guilty", "ashamed", "embarrassed", "humiliated", "jealous", "envious",
    "irritated", "annoyed", "furious", "outraged", "hostile", "bitter",
    "resentful", "disgusted", "nauseated", "revolted", "repulsed", "afraid",
    "scared", "terrified", "panicked", "overwhelmed", "exhausted", "drained",
    "burned", "numb", "empty", "lost", "confused", "insecure", "inferior",
    "inadequate", "rejected", "abandoned", "betrayed", "cheated", "lied",
]

NEGATION_WORDS = [
    "not", "no", "never", "none", "nobody", "nothing", "neither", "nowhere",
    "hardly", "scarcely", "barely", "doesn't", "isn't", "wasn't", "shouldn't",
    "wouldn't", "couldn't", "can't", "don't", "won't", "didn't", "hasn't",
    "haven't", "hadn't", "aren't", "weren't",
]


def analyze_sentiment(text: str) -> dict:
    """Analyze sentiment of text using keyword matching with negation handling."""
    lower_text = text.lower()
    words = re.findall(r"\b\w+\b", lower_text)

    positive_count = 0
    negative_count = 0

    for i, word in enumerate(words):
        # Check for negation in the previous 1-2 words
        negated = False
        start = max(0, i - 2)
        for j in range(start, i):
            if words[j] in NEGATION_WORDS:
                negated = True
                break

        if word in POSITIVE_WORDS:
            if negated:
                negative_count += 1
            else:
                positive_count += 1
        elif word in NEGATIVE_WORDS:
            if negated:
                positive_count += 1
            else:
                negative_count += 1

    sentiment: Literal["POSITIVE", "NEGATIVE", "NEUTRAL"]
    score: float

    if positive_count > negative_count:
        sentiment = "POSITIVE"
        score = min(1.0, 0.5 + (positive_count * 0.1))
    elif negative_count > positive_count:
        sentiment = "NEGATIVE"
        score = max(0.0, 0.5 - (negative_count * 0.1))
    else:
        sentiment = "NEUTRAL"
        score = 0.5

    return {"sentiment": sentiment, "score": round(score, 2)}
