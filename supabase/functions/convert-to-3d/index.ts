import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, prompt } = await req.json();

    if (!imageUrl) {
      throw new Error("Image URL is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured.");
    }

    console.log('Converting floor plan to isometric 3D with Lovable AI (Nano banana)');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{
          role: "user",
          content: [
            {
              type: "text",
              text: prompt || `Convert this 2D architectural floor plan into an isometric 3D view with proper perspective, depth, and architectural details.`
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      let details = errorText;
      try {
        const parsed = JSON.parse(errorText);
        details = parsed.error?.message || errorText;
      } catch (_) {}
      return new Response(
        JSON.stringify({ error: "Lovable AI error", details }),
        { status: response.status || 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log('Lovable AI response received for 3D conversion');

    const convertedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!convertedImageUrl) {
      console.error('No image in response. Full response:', JSON.stringify(data, null, 2));
      return new Response(
        JSON.stringify({ error: 'No 3D image generated in response', details: data }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('3D conversion successful');

    return new Response(
      JSON.stringify({
        imageUrl: convertedImageUrl
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Error in convert-to-3d:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
