
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    console.log('Calmobot chat request received');

    // Convert messages to Gemini format
    const geminiMessages = messages.map((msg: any) => {
      if (msg.role === 'system') {
        return {
          role: 'user',
          parts: [{ text: `System: ${msg.content}` }]
        };
      }
      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      };
    });

    // Add system prompt as first message if not present
    const systemPrompt = `You are Calmobot, an AI wellness assistant integrated into Calmora - a mood tracking and wellness application. Your purpose is to:

1. Help users understand and process their emotions and moods
2. Provide supportive, empathetic responses to mood-related concerns
3. Offer practical wellness advice, coping strategies, and mindfulness techniques
4. Suggest healthy lifestyle habits that can improve mental well-being
5. Provide general wellness information and emotional support

Guidelines:
- Always be warm, empathetic, and non-judgmental
- Encourage users to track their moods regularly in Calmora
- Suggest practical coping strategies like breathing exercises, journaling, physical activity
- Remind users that you're not a replacement for professional medical or mental health care
- If someone expresses serious mental health concerns, gently encourage them to seek professional help
- Keep responses conversational but informative
- Focus on emotional wellness, mood management, and general health tips
- Be encouraging and supportive while maintaining appropriate boundaries

Remember: You're part of the Calmora wellness ecosystem, so feel free to reference mood tracking, wellness journeys, and the importance of self-care.`;

    // Ensure system prompt is included
    if (geminiMessages.length === 0 || !geminiMessages[0].parts[0].text.includes('System:')) {
      geminiMessages.unshift({
        role: 'user',
        parts: [{ text: `System: ${systemPrompt}` }]
      });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', data);
      throw new Error(data.error?.message || 'Gemini API request failed');
    }

    const assistantMessage = data.candidates[0].content.parts[0].text;

    console.log('Calmobot response generated successfully');

    return new Response(JSON.stringify({ message: assistantMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in calmobot-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
