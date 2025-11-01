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
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      throw new Error("Image URL is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured. Please set it in your Supabase project settings.");
    }

    console.log('Converting floor plan to isometric 3D view');

    const isometricPrompt = `Transform this 2D architectural floor plan into a professional isometric 3D architectural rendering.

ISOMETRIC VIEW REQUIREMENTS:
- Use true isometric perspective (120° angles between axes)
- View from 45-degree angle from above and slightly to the side
- Maintain exact floor plan layout and room proportions from the 2D plan

3D ARCHITECTURAL ELEMENTS:
- Show walls with realistic height (8-9 feet) and thickness
- Display ceiling/roof structure in the isometric style
- Include all doors in 3D (open or closed positions showing depth)
- Show windows with frames, glass, and depth
- Render furniture pieces in 3D matching the floor plan layout
- Add kitchen cabinets, appliances, and countertops in 3D
- Show bathroom fixtures (toilet, sink, shower/tub) in 3D
- Include closets with depth and shelving if visible

VISUAL STYLING:
- Clean architectural rendering style
- Subtle shadows and ambient occlusion for depth
- Light neutral colors (whites, beiges, light grays)
- Realistic materials (wood floors, tile, carpet textures)
- Professional architectural visualization quality
- Maintain clean lines and geometric precision

TECHNICAL ACCURACY:
- Preserve all room dimensions from the 2D plan
- Keep walls aligned and parallel/perpendicular as appropriate
- Show proper door swing directions from the floor plan
- Maintain furniture placement and scale from 2D layout
- Include any outdoor spaces (patios, decks) if present in plan

Style: Professional architectural isometric rendering, clean and suitable for presentations.`;

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
            content: [
              {
                type: "text",
                text: isometricPrompt
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        modalities: ["image", "text"],
        temperature: 0.8,
        max_tokens: 2000,
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
    console.log('AI response received:', JSON.stringify(data, null, 2));

    // Extract the generated image (check multiple possible response formats)
    let imageUrl3D = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    // Try alternative response format
    if (!imageUrl3D && data.choices?.[0]?.message?.image_url) {
      imageUrl3D = data.choices[0].message.image_url;
    }

    // Try another alternative format
    if (!imageUrl3D && data.images && data.images.length > 0) {
      imageUrl3D = data.images[0].url || data.images[0];
    }

    const textResponse = data.choices?.[0]?.message?.content;

    if (!imageUrl3D) {
      console.error("No image URL found in response. Response structure:", JSON.stringify(data, null, 2));
      throw new Error("No 3D image generated. The AI model may not support image generation from images. Please check your Lovable AI configuration.");
    }

    console.log('3D view generated successfully. Image URL:', imageUrl3D);

    return new Response(
      JSON.stringify({
        imageUrl: imageUrl3D,
        description: textResponse
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
