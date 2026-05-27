-- Calmora local development schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL DEFAULT '',
    last_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS mood_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    mood TEXT NOT NULL,
    description TEXT,
    text TEXT NOT NULL,
    sentiment TEXT NOT NULL CHECK (sentiment IN ('POSITIVE', 'NEGATIVE', 'NEUTRAL')),
    score REAL NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    insights TEXT
);

CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_timestamp ON mood_entries(timestamp);

CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);

CREATE TABLE IF NOT EXISTS recommendations (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL,
    sentiment_target TEXT CHECK (sentiment_target IN ('POSITIVE', 'NEGATIVE', 'NEUTRAL', 'ANY'))
);

-- Seed some sample recommendations
INSERT INTO recommendations (title, description, type, sentiment_target) VALUES
    ('Take a walk', 'Go for a 10-minute walk outside to clear your mind.', 'exercise', 'NEGATIVE'),
    ('Deep breathing', 'Practice 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s.', 'mindfulness', 'NEGATIVE'),
    ('Journal your thoughts', 'Write down what is on your mind without filtering.', 'mindfulness', 'NEGATIVE'),
    ('Call a friend', 'Reach out to someone you trust and share how you feel.', 'social', 'NEGATIVE'),
    ('Gratitude list', 'Write down 3 things you are grateful for today.', 'mindfulness', 'POSITIVE'),
    ('Celebrate small wins', 'Acknowledge something you accomplished recently.', 'mindfulness', 'POSITIVE'),
    ('Stretching routine', 'Do a 5-minute full-body stretch to release tension.', 'exercise', 'ANY'),
    ('Listen to music', 'Play your favorite calming or uplifting playlist.', 'relaxation', 'ANY')
ON CONFLICT DO NOTHING;
