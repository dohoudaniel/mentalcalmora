import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const getAllowedOrigins = (): string[] => {
  const env = Deno.env.get("ALLOWED_ORIGINS");
  if (env) return env.split(",").map((o) => o.trim());
  return ["http://localhost:8080", "http://localhost:3000", "http://127.0.0.1:3000"];
};

const corsHeaders = (origin: string | null) => {
  const allowed = getAllowedOrigins();
  const allowedOrigin = origin && allowed.includes(origin) ? origin : allowed[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

interface GenerateInsightsRequest {
  entryId: string;
  mood: string;
  text: string;
  sentiment: string;
  score: number;
}

serve(async (req) => {
  const requestOrigin = req.headers.get("origin");
  const headers = corsHeaders(requestOrigin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    // Extract auth token from request to identify the user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    const { entryId, mood, text, sentiment, score }: GenerateInsightsRequest = await req.json();

    if (!entryId || !mood || !sentiment || typeof score !== "number") {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    // Create a client with the user's JWT to enforce RLS ownership check
    const userToken = authHeader.replace("Bearer ", "");
    const userClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: `Bearer ${userToken}` } },
    });

    // Verify the entry exists and belongs to the authenticated user
    const { data: entryData, error: entryError } = await userClient
      .from("mood_entries")
      .select("id")
      .eq("id", entryId)
      .maybeSingle();

    if (entryError || !entryData) {
      return new Response(
        JSON.stringify({ error: "Entry not found or access denied" }),
        { status: 404, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Gemini API request failed");
    }

    const insights = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!insights) {
      throw new Error("No insights generated");
    }

    // Update the mood entry with the generated insights using the user client (RLS enforced)
    const { error: updateError } = await userClient
      .from("mood_entries")
      .update({ insights })
      .eq("id", entryId);

    if (updateError) {
      throw updateError;
    }

    return new Response(JSON.stringify({ insights }), {
      headers: { ...headers, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }
});
