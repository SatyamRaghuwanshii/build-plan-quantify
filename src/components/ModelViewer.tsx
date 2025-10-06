import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Grid, Box } from "@react-three/drei";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Upload, Layers, Ruler, Eye, EyeOff } from "lucide-react";

interface ModelElement {
  id: string;
  name: string;
  type: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  volume: number;
  area: number;
  visible: boolean;
}

export const ModelViewer = () => {
  const [elements] = useState<ModelElement[]>([
    {
      id: "1",
      name: "Foundation Slab",
      type: "Concrete",
      dimensions: { width: 12, height: 0.3, depth: 10 },
      volume: 36,
      area: 120,
      visible: true,
    },
    {
      id: "2",
      name: "Wall North",
      type: "Brick",
      dimensions: { width: 12, height: 3, depth: 0.3 },
      volume: 10.8,
      area: 36,
      visible: true,
    },
    {
      id: "3",
      name: "Wall South",
      type: "Brick",
      dimensions: { width: 12, height: 3, depth: 0.3 },
      volume: 10.8,
      area: 36,
      visible: true,
    },
    {
      id: "4",
      name: "Roof Slab",
      type: "Concrete",
      dimensions: { width: 12, height: 0.25, depth: 10 },
      volume: 30,
      area: 120,
      visible: true,
    },
  ]);

  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);

  const getColorForType = (type: string) => {
    switch (type) {
      case "Concrete": return "#95a5a6";
      case "Brick": return "#c0392b";
      case "Steel": return "#34495e";
      default: return "#7f8c8d";
    }
  };

  const Scene3D = () => (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />

      {showGrid && <Grid args={[20, 20]} cellColor="#6e6e6e" sectionColor="#9d4b4b" />}

      {/* Foundation Slab */}
      <Box
        args={[12, 0.3, 10]}
        position={[0, -1.5, 0]}
        onClick={() => setSelectedElement("1")}
      >
        <meshStandardMaterial
          color={selectedElement === "1" ? "#3498db" : getColorForType("Concrete")}
          transparent
          opacity={0.9}
        />
      </Box>

      {/* North Wall */}
      <Box
        args={[12, 3, 0.3]}
        position={[0, 0, -5]}
        onClick={() => setSelectedElement("2")}
      >
        <meshStandardMaterial
          color={selectedElement === "2" ? "#3498db" : getColorForType("Brick")}
        />
      </Box>

      {/* South Wall */}
      <Box
        args={[12, 3, 0.3]}
        position={[0, 0, 5]}
        onClick={() => setSelectedElement("3")}
      >
        <meshStandardMaterial
          color={selectedElement === "3" ? "#3498db" : getColorForType("Brick")}
        />
      </Box>

      {/* Roof Slab */}
      <Box
        args={[12, 0.25, 10]}
        position={[0, 1.5, 0]}
        onClick={() => setSelectedElement("4")}
      >
        <meshStandardMaterial
          color={selectedElement === "4" ? "#3498db" : getColorForType("Concrete")}
          transparent
          opacity={0.9}
        />
      </Box>
    </>
  );

  const selectedElementData = elements.find(e => e.id === selectedElement);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">BIM 3D Model Viewer</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)}>
            <Layers className="mr-2 h-4 w-4" />
            {showGrid ? "Hide Grid" : "Show Grid"}
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import IFC
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 3D Viewer */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>3D Model View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg overflow-hidden">
              <Canvas>
                <PerspectiveCamera makeDefault position={[15, 10, 15]} />
                <OrbitControls
                  enableDamping
                  dampingFactor={0.05}
                  minDistance={5}
                  maxDistance={50}
                />
                <Scene3D />
              </Canvas>
            </div>
            <div className="mt-4 flex gap-2 text-xs text-muted-foreground">
              <span>🖱️ Left-click and drag to rotate</span>
              <span>•</span>
              <span>🖱️ Right-click and drag to pan</span>
              <span>•</span>
              <span>🖱️ Scroll to zoom</span>
            </div>
          </CardContent>
        </Card>

        {/* Element Properties and Quantity Takeoff */}
        <Card>
          <CardHeader>
            <CardTitle>Model Elements</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="elements">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="elements">Elements</TabsTrigger>
                <TabsTrigger value="quantities">Quantities</TabsTrigger>
              </TabsList>

              <TabsContent value="elements" className="space-y-2">
                {elements.map((element) => (
                  <div
                    key={element.id}
                    onClick={() => setSelectedElement(element.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedElement === element.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{element.name}</span>
                      <Badge variant="outline">{element.type}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Volume:</span>
                        <span className="font-medium">{element.volume} m³</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Area:</span>
                        <span className="font-medium">{element.area} m²</span>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="quantities" className="space-y-3">
                {selectedElementData ? (
                  <Card className="border-primary">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{selectedElementData.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground">Dimensions</h4>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="p-2 bg-muted rounded">
                            <div className="text-muted-foreground">Width</div>
                            <div className="font-semibold">{selectedElementData.dimensions.width}m</div>
                          </div>
                          <div className="p-2 bg-muted rounded">
                            <div className="text-muted-foreground">Height</div>
                            <div className="font-semibold">{selectedElementData.dimensions.height}m</div>
                          </div>
                          <div className="p-2 bg-muted rounded">
                            <div className="text-muted-foreground">Depth</div>
                            <div className="font-semibold">{selectedElementData.dimensions.depth}m</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground">Quantities</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                            <span className="flex items-center gap-2">
                              <Ruler className="h-3 w-3" />
                              Volume
                            </span>
                            <span className="font-semibold">{selectedElementData.volume} m³</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                            <span className="flex items-center gap-2">
                              <Ruler className="h-3 w-3" />
                              Surface Area
                            </span>
                            <span className="font-semibold">{selectedElementData.area} m²</span>
                          </div>
                        </div>
                      </div>

                      <Button className="w-full" size="sm">
                        <Ruler className="mr-2 h-4 w-4" />
                        Generate Quantity Report
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Click on an element in the 3D view or list to see quantities
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {elements.reduce((sum, e) => sum + e.volume, 0).toFixed(1)} m³
              </div>
              <div className="text-sm text-muted-foreground mt-1">Total Volume</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {elements.reduce((sum, e) => sum + e.area, 0).toFixed(0)} m²
              </div>
              <div className="text-sm text-muted-foreground mt-1">Total Area</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{elements.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Elements</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {new Set(elements.map(e => e.type)).size}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Material Types</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};