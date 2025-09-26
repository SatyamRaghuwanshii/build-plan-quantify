import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator as CalcIcon, 
  Save, 
  Download, 
  RefreshCw,
  Building,
  DollarSign,
  ShoppingCart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface MaterialCosts {
  [key: string]: number;
}

interface CalculationResult {
  concrete?: number;
  cement?: number;
  sand?: number;
  aggregate?: number;
  bricks?: number;
  mortar?: number;
  steel?: number;
  totalCost: number;
}

const Calculator = () => {
  const { toast } = useToast();
  const [dimensions, setDimensions] = useState({
    length: "",
    width: "", 
    height: "",
    thickness: ""
  });

  const [materialType, setMaterialType] = useState("concrete");
  const [mixRatio, setMixRatio] = useState("1:2:4");
  const [results, setResults] = useState<CalculationResult>({ totalCost: 0 });

  // Material costs per unit (example prices)
  const materialCosts: MaterialCosts = {
    cement: 8.5, // per bag (50kg)
    sand: 25, // per cubic meter
    aggregate: 30, // per cubic meter
    concrete: 120, // per cubic meter (ready mix)
    bricks: 0.5, // per brick
    mortar: 95, // per cubic meter
    steel: 1.2 // per kg
  };

  const calculateMaterials = () => {
    const length = parseFloat(dimensions.length) || 0;
    const width = parseFloat(dimensions.width) || 0;
    const height = parseFloat(dimensions.height) || 0;
    const thickness = parseFloat(dimensions.thickness) || 0.15; // default 15cm

    if (!length || !width || !height) {
      toast({
        title: "Input Required",
        description: "Please enter length, width, and height dimensions.",
        variant: "destructive"
      });
      return;
    }

    let newResults: CalculationResult = { totalCost: 0 };

    if (materialType === "concrete") {
      const volume = length * width * thickness;
      
      if (mixRatio === "ready-mix") {
        newResults.concrete = volume;
        newResults.totalCost = volume * materialCosts.concrete;
      } else {
        // Calculate cement, sand, aggregate for different ratios
        const ratios = mixRatio.split(':').map(Number);
        const totalRatio = ratios.reduce((a, b) => a + b, 0);
        
        // Assuming 1 part = 1 bag of cement
        const cementBags = (volume * ratios[0]) / totalRatio * 7; // 7 bags per cubic meter
        const sandVolume = (volume * ratios[1]) / totalRatio;
        const aggregateVolume = (volume * ratios[2]) / totalRatio;
        
        newResults.cement = cementBags;
        newResults.sand = sandVolume;
        newResults.aggregate = aggregateVolume;
        newResults.totalCost = 
          (cementBags * materialCosts.cement) +
          (sandVolume * materialCosts.sand) +
          (aggregateVolume * materialCosts.aggregate);
      }
    } else if (materialType === "brickwork") {
      const wallArea = length * height;
      const bricksPerSqm = 55; // standard bricks per square meter
      const mortarVolume = wallArea * 0.03; // 3cm mortar thickness
      
      newResults.bricks = wallArea * bricksPerSqm;
      newResults.mortar = mortarVolume;
      newResults.totalCost = 
        (newResults.bricks * materialCosts.bricks) +
        (mortarVolume * materialCosts.mortar);
    } else if (materialType === "steel") {
      const concreteVolume = length * width * thickness;
      const steelWeight = concreteVolume * 80; // 80 kg per cubic meter (typical)
      
      newResults.steel = steelWeight;
      newResults.totalCost = steelWeight * materialCosts.steel;
    }

    setResults(newResults);
    
    toast({
      title: "Calculation Complete",
      description: "Material quantities and costs have been calculated.",
    });
  };

  useEffect(() => {
    if (dimensions.length && dimensions.width && dimensions.height) {
      calculateMaterials();
    }
  }, [dimensions, materialType, mixRatio]);

  const handleSaveProject = () => {
    // In a real app, this would save to a backend
    toast({
      title: "Project Saved",
      description: "Your calculations have been saved to projects.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Started", 
      description: "Your calculation report is being prepared for download.",
    });
  };

  const resetCalculator = () => {
    setDimensions({ length: "", width: "", height: "", thickness: "" });
    setResults({ totalCost: 0 });
    setMaterialType("concrete");
    setMixRatio("1:2:4");
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2">Material Calculator</h1>
        <p className="text-lg text-muted-foreground">
          Calculate precise quantities and costs for your construction materials
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalcIcon className="h-5 w-5 text-primary" />
              Project Dimensions
            </CardTitle>
            <CardDescription>
              Enter the dimensions and select material type for accurate calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="length">Length (m)</Label>
                <Input
                  id="length"
                  type="number"
                  step="0.1"
                  placeholder="10.0"
                  value={dimensions.length}
                  onChange={(e) => setDimensions(prev => ({ ...prev, length: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">Width (m)</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.1"
                  placeholder="8.0"
                  value={dimensions.width}
                  onChange={(e) => setDimensions(prev => ({ ...prev, width: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (m)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  placeholder="3.0"
                  value={dimensions.height}
                  onChange={(e) => setDimensions(prev => ({ ...prev, height: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thickness">Thickness (m)</Label>
                <Input
                  id="thickness"
                  type="number"
                  step="0.01"
                  placeholder="0.15"
                  value={dimensions.thickness}
                  onChange={(e) => setDimensions(prev => ({ ...prev, thickness: e.target.value }))}
                />
              </div>
            </div>

            <Separator />

            {/* Material Selection */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Material Type</Label>
                <Select value={materialType} onValueChange={setMaterialType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concrete">Concrete Work</SelectItem>
                    <SelectItem value="brickwork">Brickwork</SelectItem>
                    <SelectItem value="steel">Steel Reinforcement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {materialType === "concrete" && (
                <div className="space-y-2">
                  <Label>Mix Ratio / Type</Label>
                  <Select value={mixRatio} onValueChange={setMixRatio}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:2:4">1:2:4 (Standard)</SelectItem>
                      <SelectItem value="1:1.5:3">1:1.5:3 (High Strength)</SelectItem>
                      <SelectItem value="1:3:6">1:3:6 (Lean Concrete)</SelectItem>
                      <SelectItem value="ready-mix">Ready Mix Concrete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={calculateMaterials} className="flex-1">
                <CalcIcon className="h-4 w-4 mr-2" />
                Calculate
              </Button>
              <Button variant="outline" onClick={resetCalculator}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Calculation Results
              </span>
              <Badge variant="secondary" className="text-lg px-3">
                <DollarSign className="h-4 w-4 mr-1" />
                ${results.totalCost.toLocaleString()}
              </Badge>
            </CardTitle>
            <CardDescription>
              Material quantities and cost breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Material Quantities */}
              <div className="space-y-3">
                {results.concrete && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Concrete Volume</span>
                    <span className="text-primary font-semibold">{results.concrete.toFixed(2)} m³</span>
                  </div>
                )}
                {results.cement && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Cement</span>
                    <span className="text-primary font-semibold">{results.cement.toFixed(0)} bags</span>
                  </div>
                )}
                {results.sand && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Sand</span>
                    <span className="text-primary font-semibold">{results.sand.toFixed(2)} m³</span>
                  </div>
                )}
                {results.aggregate && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Aggregate</span>
                    <span className="text-primary font-semibold">{results.aggregate.toFixed(2)} m³</span>
                  </div>
                )}
                {results.bricks && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Bricks</span>
                    <span className="text-primary font-semibold">{results.bricks.toFixed(0)} units</span>
                  </div>
                )}
                {results.mortar && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Mortar</span>
                    <span className="text-primary font-semibold">{results.mortar.toFixed(2)} m³</span>
                  </div>
                )}
                {results.steel && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Steel Reinforcement</span>
                    <span className="text-primary font-semibold">{results.steel.toFixed(0)} kg</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleSaveProject}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Project
                </Button>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full" size="lg" asChild>
                  <Link to="/marketplace" className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Buy Materials Now
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calculator;