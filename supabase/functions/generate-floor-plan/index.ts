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
    const { prompt, rooms, sqft, style } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      throw new Error("GEMINI_API_KEY is not configured. Please set it in your Supabase project settings.");
    }

    // Construct detailed prompt for image generation
    const basePrompt = `Create a professional architectural floor plan in technical drawing style. 
    
SPECIFICATIONS:
- House size: ${sqft || '2000'} square feet
- Bedrooms: ${rooms || '3'}
- Style: ${style || 'modern'}
${prompt ? `- Additional requirements: ${prompt}` : ''}

DRAWING REQUIREMENTS:
- Use clean black lines on white background
- Draw walls as double lines (8-12 inches thick)
- Show all doors with proper swing arcs
- Include windows as breaks in walls with sill indicators
- Label each room clearly (e.g., "Master Bedroom 14'x16'")
- Add room dimensions in feet and inches
- Include furniture layout (beds, sofas, tables, kitchen appliances)
- Show kitchen counters, bathroom fixtures, and closets
- Add compass rose indicating North direction
- Include scale bar (1/4" = 1'-0")

LAYOUT STANDARDS:
- Main entrance with foyer/entry area
- Open-concept living/dining/kitchen if modern style
- Master bedroom with en-suite bathroom
- Secondary bedrooms with adequate closet space
- Proper hallway widths (36" minimum)
- Standard door widths (30"-36")
- Realistic room proportions and flow

Style: Clean architectural drafting, professional, black and white technical drawing.`;

    console.log('Generating floor plan image with Gemini 2.5 Flash Image');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: basePrompt
          }]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 8192,
          responseMimeType: "image/png"
        }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable workspace." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log('Gemini API response received:', JSON.stringify(data, null, 2));

    if (!data.candidates || !data.candidates[0]) {
      throw new Error("Invalid response from Gemini API");
    }

    const inlineData = data.candidates[0]?.content?.parts?.[0]?.inlineData;
    if (!inlineData?.data) {
      console.error('No image in response. Full response:', JSON.stringify(data, null, 2));
      throw new Error("No image generated in response");
    }

    const imageUrl = `data:${inlineData.mimeType};base64,${inlineData.data}`;

    console.log('Floor plan image generated successfully');

    return new Response(
      JSON.stringify({
        imageUrl: imageUrl,
        specs: { rooms, sqft, style, prompt }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Error in generate-floor-plan:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
