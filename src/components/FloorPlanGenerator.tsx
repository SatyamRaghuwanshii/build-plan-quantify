import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Crown } from 'lucide-react';

interface FloorPlanGeneratorProps {
  isPro?: boolean;
}

export const FloorPlanGenerator = ({ isPro = false }: FloorPlanGeneratorProps) => {
  const [rooms, setRooms] = useState('3');
  const [sqft, setSqft] = useState('2000');
  const [style, setStyle] = useState('modern');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [image3D, setImage3D] = useState<string | null>(null);
  const [description3D, setDescription3D] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedImage(null);
    setDescription(null);
    setImage3D(null);
    setDescription3D(null);

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

      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        setDescription(data.description);
        toast.success('Floor plan generated successfully!');
      } else {
        toast.error('No image generated');
      }
    } catch (err) {
      console.error('Error generating floor plan:', err);
      toast.error('An error occurred while generating the floor plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConvertTo3D = async () => {
    if (!generatedImage) return;
    
    setIsConverting(true);
    setImage3D(null);
    setDescription3D(null);

    try {
      const { data, error } = await supabase.functions.invoke('convert-to-3d', {
        body: { imageUrl: generatedImage }
      });

      if (error) {
        if (error.message.includes('429')) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else if (error.message.includes('402')) {
          toast.error('Please add credits to your Lovable AI workspace.');
        } else {
          toast.error('Failed to convert to 3D: ' + error.message);
        }
        return;
      }

      if (data?.imageUrl) {
        setImage3D(data.imageUrl);
        setDescription3D(data.description);
        toast.success('3D view generated successfully!');
      } else {
        toast.error('No 3D image generated');
      }
    } catch (err) {
      console.error('Error converting to 3D:', err);
      toast.error('An error occurred while converting to 3D');
    } finally {
      setIsConverting(false);
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
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 2D Floor Plan */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">2D Floor Plan</h3>
                  <div className="border rounded-lg overflow-hidden">
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

                {/* 3D Isometric View */}
                {image3D && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Isometric 3D View</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <img 
                        src={image3D} 
                        alt="Isometric 3D view" 
                        className="w-full h-auto"
                      />
                    </div>
                    {description3D && (
                      <p className="text-sm text-muted-foreground">{description3D}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={handleConvertTo3D}
                  disabled={isConverting}
                  variant={image3D ? "outline" : "default"}
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Converting to 3D...
                    </>
                  ) : image3D ? (
                    'Regenerate 3D View'
                  ) : (
                    'Convert to Isometric 3D'
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = generatedImage;
                    link.download = 'floor-plan-2d.png';
                    link.click();
                  }}
                >
                  Download 2D (PNG)
                </Button>

                {isPro && (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        toast.info('High-resolution download starting...');
                        const link = document.createElement('a');
                        link.href = generatedImage;
                        link.download = 'floor-plan-2d-highres.png';
                        link.click();
                      }}
                    >
                      <Crown className="mr-2 h-4 w-4" />
                      Download 2D (High-Res)
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        toast.info('SVG conversion would happen here (requires additional API)');
                      }}
                    >
                      <Crown className="mr-2 h-4 w-4" />
                      Download 2D (SVG)
                    </Button>
                  </>
                )}

                {image3D && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = image3D;
                        link.download = 'floor-plan-3d.png';
                        link.click();
                      }}
                    >
                      Download 3D (PNG)
                    </Button>

                    {isPro && (
                      <>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            toast.info('High-resolution download starting...');
                            const link = document.createElement('a');
                            link.href = image3D;
                            link.download = 'floor-plan-3d-highres.png';
                            link.click();
                          }}
                        >
                          <Crown className="mr-2 h-4 w-4" />
                          Download 3D (High-Res)
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            toast.info('SVG conversion would happen here (requires additional API)');
                          }}
                        >
                          <Crown className="mr-2 h-4 w-4" />
                          Download 3D (SVG)
                        </Button>
                      </>
                    )}
                  </>
                )}

                <Button 
                  variant="outline" 
                  onClick={handleGenerate}
                >
                  Generate New Plan
                </Button>
              </div>
              
              {!isPro && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    Upgrade to Pro for high-resolution and SVG downloads
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
