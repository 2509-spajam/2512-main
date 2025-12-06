import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image1, image2 } = await req.json()
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

    console.log(`[Request] Received request to compare images.`);
    console.log(`[Request] Image1: ${image1?.substring(0, 50)}...`);
    console.log(`[Request] Image2: ${image2?.substring(0, 50)}...`);
    console.log(`[Config] OPENAI_API_KEY exists: ${!!OPENAI_API_KEY}`);

    if (!OPENAI_API_KEY) {
      console.error("[Error] Missing OPENAI_API_KEY");
      throw new Error("Missing OPENAI_API_KEY in environment variables.");
    }

    if (!image1 || !image2) {
      console.error("[Error] Missing image1 or image2");
      throw new Error("Missing image1 or image2 in request body.");
    }

    console.log("[OpenAI] Sending request to GPT-4o...");

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a judge for a photo travel game. Compare the user's photo with the original spot photo. Evaluate based on: 1. Location (Is it the same place?), 2. Angle/Composition, 3. Lighting/Brightness, 4. Season/Atmosphere. Be lenient with temporary factors (weather, lighting, season) if the location and angle are correct. Provide a score (0-100). Return ONLY a JSON object with keys 'score' (number) and 'reason' (string). The 'reason' must be in Japanese, explaining what matches and what differs."
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Original Photo:" },
              { type: "image_url", image_url: { url: image1 } },
              { type: "text", text: "User Photo (Captured):" },
              { type: "image_url", image_url: { url: image2 } }
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 300,
      })
    })

    console.log(`[OpenAI] Response Status: ${response.status}`);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[OpenAI Error] Status: ${response.status}, Body: ${errText}`);
      throw new Error(`OpenAI API Error: ${response.status} ${response.statusText} - ${errText}`);
    }

    const data = await response.json()
    const content = JSON.parse(data.choices[0].message.content)
    console.log(`[OpenAI] Result:`, JSON.stringify(content));


    return new Response(JSON.stringify(content), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error(`[Function Error] ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    return new Response(JSON.stringify({
      error: error.message,
      details: error.toString()
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
