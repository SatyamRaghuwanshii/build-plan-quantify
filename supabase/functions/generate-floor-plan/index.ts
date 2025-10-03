import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Reference floor plan images (hidden from users, used for style guidance)
// Replace these URLs with your actual hosted reference images
const REFERENCE_IMAGES = [
  "https://example.com/reference-floorplan-1.png",
  "https://example.com/reference-floorplan-2.png",
  "https://example.com/reference-floorplan-3.png",
  "https://example.com/reference-floorplan-4.png",
  "https://example.com/reference-floorplan-5.png",
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, rooms, sqft, style } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Construct detailed prompt with consistent brand style
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

Style: Clean architectural drafting, professional, suitable for construction documentation.`;

    console.log('Generating floor plan with architectural specifications');

    // Build message content with reference images and prompt
    const messageContent = [
      {
        type: "text",
        text: `${basePrompt}\n\nIMPORTANT: Use the following reference images as style guides. Match their professional architectural drawing style, line weights, annotation format, and visual presentation:`
      },
      // Add reference images to guide the AI
      ...REFERENCE_IMAGES.map((url: string) => ({
        type: "image_url",
        image_url: { url }
      })),
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: messageContent
          }
        ],
        modalities: ["image", "text"]
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
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log('Floor plan generated successfully');
    
    // Extract the generated image
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textResponse = data.choices?.[0]?.message?.content;

    if (!imageUrl) {
      throw new Error("No image generated");
    }

    return new Response(
      JSON.stringify({ 
        imageUrl,
        description: textResponse 
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
