
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { entryId, mood, text, sentiment, score } = await req.json();

    console.log('Generating insights for mood entry:', entryId);

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Create a prompt for personalized insights
    const prompt = `You are a compassionate AI wellness coach analyzing a mood entry. Provide personalized, actionable insights based on this mood data:

Mood: ${mood}
Text: ${text}
Sentiment: ${sentiment}
Sentiment Score: ${score}

Please provide:
1. A brief, empathetic acknowledgment of their current emotional state
2. 2-3 specific, actionable suggestions tailored to their mood and situation
3. A encouraging note about their emotional awareness journey

Keep the response warm, supportive, and under 150 words. Focus on practical wellness advice that feels personal and relevant to their specific entry.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        },
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', data);
      throw new Error(data.error?.message || 'Gemini API request failed');
    }

    const insights = data.candidates[0].content.parts[0].text;

    // Update the mood entry with the generated insights
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { error: updateError } = await supabase
      .from('mood_entries')
      .update({ insights })
      .eq('id', entryId);

    if (updateError) {
      console.error('Error updating mood entry with insights:', updateError);
      throw updateError;
    }

    console.log('Insights generated and saved successfully for entry:', entryId);

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-insights function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
