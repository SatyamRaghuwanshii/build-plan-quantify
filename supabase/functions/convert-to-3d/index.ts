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

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      throw new Error("GEMINI_API_KEY is not configured. Please set it in your Supabase project settings.");
    }

    console.log('Analyzing floor plan with Gemini (Note: 3D image generation not available)');

    const isometricPrompt = `Based on the floor plan image provided, create a detailed textual description of how it would look as a professional isometric 3D architectural rendering.

DESCRIBE THE ISOMETRIC VIEW:
- How the view would look from 45-degree angle from above
- The 3D appearance of walls with realistic height (8-9 feet) and thickness
- How doors and windows would appear in 3D
- The furniture pieces in 3D perspective
- Kitchen cabinets, appliances, and countertops in 3D
- Bathroom fixtures in 3D
- Materials and textures (wood floors, tile, carpet)
- Lighting and shadows

Provide a comprehensive description suitable for visualization, since actual 3D image generation is not available.`;

    return new Response(
      JSON.stringify({
        imageUrl: null,
        description: "3D image generation is not available with Google Gemini API. To generate actual 3D isometric images, you would need to integrate with DALL-E 3, Stable Diffusion, or similar image generation services.",
        note: "Consider using DALL-E 3 or Stable Diffusion for actual image generation."
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
