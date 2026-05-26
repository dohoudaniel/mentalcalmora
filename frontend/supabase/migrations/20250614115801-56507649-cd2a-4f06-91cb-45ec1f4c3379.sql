
-- Add insights column to mood_entries table
ALTER TABLE public.mood_entries 
ADD COLUMN insights TEXT;

-- Create index for better performance when querying entries with insights
CREATE INDEX idx_mood_entries_insights ON public.mood_entries (user_id, insights) WHERE insights IS NOT NULL;
