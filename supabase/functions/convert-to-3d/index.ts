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

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      throw new Error("GEMINI_API_KEY not configured. Please add it in Supabase Edge Functions secrets.");
    }

    console.log('Converting floor plan to isometric 3D with Gemini 2.5 Flash Image');

    // Fetch the image and convert to base64 if it's a URL
    let imageData = imageUrl;
    if (imageUrl.startsWith('http')) {
      const imgResponse = await fetch(imageUrl);
      const blob = await imgResponse.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      imageData = `data:${blob.type};base64,${base64}`;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: prompt || `Convert this 2D architectural floor plan into an isometric 3D view with proper perspective, depth, and architectural details. Show walls with height, add shadows, and create a professional isometric projection.`
              },
              {
                inlineData: {
                  mimeType: imageData.split(';')[0].split(':')[1],
                  data: imageData.split(',')[1]
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: "image/png"
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded", 
            details: "Gemini API rate limit reached. Please wait a moment and try again, or upgrade your quota at https://aistudio.google.com/apikey" 
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Gemini API error", details: errorText }),
        { status: response.status || 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log('Gemini response received for 3D conversion');

    const convertedImageData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const mimeType = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || "image/png";
    
    if (!convertedImageData) {
      console.error('No image in response. Full response:', JSON.stringify(data, null, 2));
      return new Response(
        JSON.stringify({ error: 'No 3D image generated in response', details: data }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const convertedImageUrl = `data:${mimeType};base64,${convertedImageData}`;

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
