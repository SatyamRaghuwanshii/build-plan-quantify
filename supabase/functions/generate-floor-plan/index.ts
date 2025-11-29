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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured.");
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

    console.log('Generating floor plan image with Lovable AI (Nano banana)');

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
          content: basePrompt
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
    console.log('Lovable AI response received');

    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error('No image in response. Full response:', JSON.stringify(data, null, 2));
      return new Response(
        JSON.stringify({ error: 'No image generated in response', details: data }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
