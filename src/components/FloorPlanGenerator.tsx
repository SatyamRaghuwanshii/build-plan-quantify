import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Download } from 'lucide-react';

interface FloorPlanGeneratorProps {}

const generateFloorPlanSVG = (specs: { rooms: string; sqft: string; style: string; prompt?: string }) => {
  const width = 800;
  const height = 600;
  const rooms = parseInt(specs.rooms);
  
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${width}" height="${height}" fill="#ffffff"/>`;
  svg += `<style>.room { fill: #f0f0f0; stroke: #333; stroke-width: 2; } .label { font-family: Arial; font-size: 14px; fill: #333; text-anchor: middle; } .title { font-family: Arial; font-size: 16px; font-weight: bold; fill: #333; }</style>`;
  
  // Title
  svg += `<text x="${width/2}" y="30" class="title">${specs.style.charAt(0).toUpperCase() + specs.style.slice(1)} Floor Plan - ${specs.sqft} sqft</text>`;
  
  // Generate rooms based on count
  const roomConfigs = [
    { x: 50, y: 80, w: 250, h: 200, label: 'Living Room' },
    { x: 320, y: 80, w: 200, h: 150, label: 'Kitchen' },
    { x: 540, y: 80, w: 210, h: 150, label: 'Dining' },
    { x: 50, y: 300, w: 180, h: 250, label: 'Master Bedroom' },
    { x: 250, y: 300, w: 160, h: 120, label: 'Bedroom 2' },
    { x: 430, y: 300, w: 160, h: 120, label: 'Bedroom 3' },
    { x: 610, y: 300, w: 140, h: 120, label: 'Bedroom 4' },
    { x: 250, y: 440, w: 160, h: 110, label: 'Bathroom' },
    { x: 430, y: 440, w: 160, h: 110, label: 'Bathroom 2' },
  ];
  
  // Draw main rooms based on bedroom count
  const roomsToDraw = Math.min(3 + rooms, roomConfigs.length);
  for (let i = 0; i < roomsToDraw; i++) {
    const room = roomConfigs[i];
    svg += `<rect x="${room.x}" y="${room.y}" width="${room.w}" height="${room.h}" class="room"/>`;
    svg += `<text x="${room.x + room.w/2}" y="${room.y + room.h/2}" class="label">${room.label}</text>`;
    
    // Add dimensions
    const dimW = Math.floor(room.w / 10);
    const dimH = Math.floor(room.h / 10);
    svg += `<text x="${room.x + room.w/2}" y="${room.y + room.h/2 + 20}" style="font-size: 11px; fill: #666; text-anchor: middle;">${dimW}'×${dimH}'</text>`;
  }
  
  // Add compass
  svg += `<circle cx="730" cy="530" r="30" fill="none" stroke="#333" stroke-width="2"/>`;
  svg += `<line x1="730" y1="500" x2="730" y2="510" stroke="#333" stroke-width="2"/>`;
  svg += `<text x="730" y="495" style="font-size: 10px; fill: #333; text-anchor: middle;">N</text>`;
  
  svg += `</svg>`;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const FloorPlanGenerator = ({}: FloorPlanGeneratorProps) => {
  const [rooms, setRooms] = useState('3');
  const [sqft, setSqft] = useState('2000');
  const [style, setStyle] = useState('modern');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedImage(null);
    setDescription(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-floor-plan', {
        body: {
          prompt: customPrompt,
          rooms,
          sqft,
          style
        }
      });

      if (error) {
        if (error.message.includes('429')) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else if (error.message.includes('402')) {
          toast.error('Please add credits to your Lovable AI workspace.');
        } else {
          toast.error('Failed to generate floor plan: ' + error.message);
        }
        return;
      }
      console.log('generate-floor-plan response:', data);
      if (data?.description) {
        // Generate SVG floor plan from specs
        const svgDataUrl = generateFloorPlanSVG(data.specs);
        setGeneratedImage(svgDataUrl);
        setDescription(data.description);
        toast.success('Floor plan generated successfully!');
      } else {
        toast.error('No floor plan generated');
      }
    } catch (err) {
      console.error('Error generating floor plan:', err);
      toast.error('An error occurred while generating the floor plan');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container px-4 mx-auto py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">AI Floor Plan Generator</CardTitle>
          <CardDescription>
            Generate professional floor plans using Google's Gemini AI model
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rooms">Number of Bedrooms</Label>
              <Select value={rooms} onValueChange={setRooms}>
                <SelectTrigger id="rooms">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Bedroom</SelectItem>
                  <SelectItem value="2">2 Bedrooms</SelectItem>
                  <SelectItem value="3">3 Bedrooms</SelectItem>
                  <SelectItem value="4">4 Bedrooms</SelectItem>
                  <SelectItem value="5">5 Bedrooms</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sqft">Square Feet</Label>
              <Input
                id="sqft"
                type="number"
                value={sqft}
                onChange={(e) => setSqft(e.target.value)}
                placeholder="2000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="style">Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger id="style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="traditional">Traditional</SelectItem>
                  <SelectItem value="minimalist">Minimalist</SelectItem>
                  <SelectItem value="contemporary">Contemporary</SelectItem>
                  <SelectItem value="open-concept">Open Concept</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-prompt">Custom Requirements (Optional)</Label>
            <Textarea
              id="custom-prompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="E.g., Include a large kitchen, master suite with walk-in closet, home office..."
              rows={3}
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Floor Plan...
              </>
            ) : (
              'Generate Floor Plan'
            )}
          </Button>

          {generatedImage && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Generated Floor Plan</h3>
                <div className="border rounded-lg overflow-hidden bg-white p-4">
                  <img 
                    src={generatedImage} 
                    alt="Generated floor plan" 
                    className="w-full h-auto"
                  />
                </div>
                {description && (
                  <p className="text-sm text-muted-foreground">{description}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = generatedImage;
                    link.download = 'floor-plan.svg';
                    link.click();
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Floor Plan
                </Button>

                <Button 
                  variant="outline" 
                  onClick={handleGenerate}
                >
                  Generate New Plan
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
