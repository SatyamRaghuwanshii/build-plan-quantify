import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator as CalcIcon, 
  Save, 
  Download, 
  RefreshCw,
  Building,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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

interface StructuralAnalysis {
  deadLoad: number;
  liveLoad: number;
  totalLoad: number;
  beamCapacity: number;
  safetyFactor: number;
  status: "safe" | "warning" | "unsafe";
  recommendations: string[];
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
  const [structuralAnalysis, setStructuralAnalysis] = useState<StructuralAnalysis | null>(null);
  
  // Structural parameters
  const [loadType, setLoadType] = useState("residential");
  const [beamSpan, setBeamSpan] = useState("");
  const [beamWidth, setBeamWidth] = useState("");
  const [beamDepth, setBeamDepth] = useState("");

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
    setStructuralAnalysis(null);
    setBeamSpan("");
    setBeamWidth("");
    setBeamDepth("");
  };

  // Cost forecasting data (6 months historical + 6 months projection)
  const costForecastData = [
    { month: "Oct '24", actual: results.totalCost * 0.85, projected: null },
    { month: "Nov '24", actual: results.totalCost * 0.88, projected: null },
    { month: "Dec '24", actual: results.totalCost * 0.92, projected: null },
    { month: "Jan '25", actual: results.totalCost * 0.95, projected: null },
    { month: "Feb '25", actual: results.totalCost * 0.97, projected: null },
    { month: "Mar '25", actual: results.totalCost, projected: null },
    { month: "Apr '25", actual: null, projected: results.totalCost * 1.03 },
    { month: "May '25", actual: null, projected: results.totalCost * 1.05 },
    { month: "Jun '25", actual: null, projected: results.totalCost * 1.08 },
    { month: "Jul '25", actual: null, projected: results.totalCost * 1.10 },
    { month: "Aug '25", actual: null, projected: results.totalCost * 1.12 },
    { month: "Sep '25", actual: null, projected: results.totalCost * 1.15 },
  ];

  // Cost breakdown for chart
  const costBreakdownData = [
    { category: "Materials", cost: results.totalCost * 0.55 },
    { category: "Labor", cost: results.totalCost * 0.30 },
    { category: "Equipment", cost: results.totalCost * 0.10 },
    { category: "Overhead", cost: results.totalCost * 0.05 },
  ];

  const performStructuralAnalysis = () => {
    const span = parseFloat(beamSpan) || 0;
    const width = parseFloat(beamWidth) || 0;
    const depth = parseFloat(beamDepth) || 0;

    if (!span || !width || !depth) {
      toast({
        title: "Input Required",
        description: "Please enter all structural dimensions.",
        variant: "destructive"
      });
      return;
    }

    // Load calculations (simplified)
    const loadFactors = {
      residential: 2.0, // kN/m²
      commercial: 4.0,
      industrial: 6.0,
    };

    const liveLoad = loadFactors[loadType as keyof typeof loadFactors] || 2.0;
    const deadLoad = 1.5; // kN/m² (typical for concrete)
    const totalLoad = (liveLoad + deadLoad) * span;

    // Beam capacity (simplified - actual would need full structural engineering)
    const concreteStrength = 30; // MPa
    const effectiveDepth = depth - 0.05; // m
    const momentCapacity = 0.138 * concreteStrength * width * effectiveDepth * effectiveDepth * 1000; // kNm
    const actualMoment = (totalLoad * span * span) / 8; // kNm
    
    const safetyFactor = momentCapacity / actualMoment;
    
    let status: "safe" | "warning" | "unsafe";
    const recommendations: string[] = [];

    if (safetyFactor >= 1.5) {
      status = "safe";
      recommendations.push("Structure meets safety requirements");
      recommendations.push("Design is adequate for specified loads");
    } else if (safetyFactor >= 1.0) {
      status = "warning";
      recommendations.push("Safety factor is below recommended 1.5");
      recommendations.push("Consider increasing beam depth or width");
      recommendations.push("Review load assumptions");
    } else {
      status = "unsafe";
      recommendations.push("CRITICAL: Beam is undersized");
      recommendations.push("Immediate redesign required");
      recommendations.push("Consult a structural engineer");
    }

    setStructuralAnalysis({
      deadLoad,
      liveLoad,
      totalLoad,
      beamCapacity: momentCapacity,
      safetyFactor,
      status,
      recommendations
    });

    toast({
      title: "Analysis Complete",
      description: "Structural analysis results are ready.",
    });
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2">Advanced Construction Calculator</h1>
        <p className="text-lg text-muted-foreground">
          Material calculations, cost forecasting, and structural analysis tools
        </p>
      </div>

      <Tabs defaultValue="materials" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="materials">
            <CalcIcon className="h-4 w-4 mr-2" />
            Materials
          </TabsTrigger>
          <TabsTrigger value="forecasting">
            <TrendingUp className="h-4 w-4 mr-2" />
            Cost Forecasting
          </TabsTrigger>
          <TabsTrigger value="structural">
            <Activity className="h-4 w-4 mr-2" />
            Structural Analysis
          </TabsTrigger>
        </TabsList>

        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-8">
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
        </TabsContent>

        {/* Cost Forecasting Tab */}
        <TabsContent value="forecasting" className="space-y-8">
          <div className="grid gap-8">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Cost Trend Analysis
                </CardTitle>
                <CardDescription>
                  Historical data and projected costs for the next 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={costForecastData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => `$${value.toLocaleString()}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        name="Actual Cost"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="projected" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Projected Cost"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle>Cost Breakdown</CardTitle>
                  <CardDescription>Distribution of project costs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={costBreakdownData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number) => `$${value.toLocaleString()}`}
                        />
                        <Bar dataKey="cost" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle>Budget Scenarios</CardTitle>
                  <CardDescription>Best, expected, and worst case scenarios</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                      <span className="font-medium text-green-900 dark:text-green-100">Best Case (-10%)</span>
                      <span className="text-lg font-semibold text-green-700 dark:text-green-300">
                        ${(results.totalCost * 0.9).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                      <span className="font-medium text-blue-900 dark:text-blue-100">Expected Case</span>
                      <span className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                        ${results.totalCost.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
                      <span className="font-medium text-orange-900 dark:text-orange-100">Worst Case (+15%)</span>
                      <span className="text-lg font-semibold text-orange-700 dark:text-orange-300">
                        ${(results.totalCost * 1.15).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Key Factors</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Material price volatility: ±8%</li>
                      <li>• Labor availability: ±5%</li>
                      <li>• Supply chain delays: ±7%</li>
                      <li>• Seasonal variations: ±3%</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Structural Analysis Tab */}
        <TabsContent value="structural" className="space-y-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Beam Analysis Parameters
                </CardTitle>
                <CardDescription>
                  Enter structural dimensions and load requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Load Type</Label>
                  <Select value={loadType} onValueChange={setLoadType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential (2.0 kN/m²)</SelectItem>
                      <SelectItem value="commercial">Commercial (4.0 kN/m²)</SelectItem>
                      <SelectItem value="industrial">Industrial (6.0 kN/m²)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="span">Span (m)</Label>
                    <Input
                      id="span"
                      type="number"
                      step="0.1"
                      placeholder="5.0"
                      value={beamSpan}
                      onChange={(e) => setBeamSpan(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="beam-width">Width (m)</Label>
                    <Input
                      id="beam-width"
                      type="number"
                      step="0.01"
                      placeholder="0.30"
                      value={beamWidth}
                      onChange={(e) => setBeamWidth(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="beam-depth">Depth (m)</Label>
                    <Input
                      id="beam-depth"
                      type="number"
                      step="0.01"
                      placeholder="0.50"
                      value={beamDepth}
                      onChange={(e) => setBeamDepth(e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <Button onClick={performStructuralAnalysis} className="w-full">
                  <Activity className="h-4 w-4 mr-2" />
                  Analyze Structure
                </Button>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    Analysis Results
                  </span>
                  {structuralAnalysis && (
                    <Badge 
                      variant={
                        structuralAnalysis.status === "safe" ? "default" :
                        structuralAnalysis.status === "warning" ? "secondary" : "destructive"
                      }
                    >
                      {structuralAnalysis.status === "safe" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {structuralAnalysis.status === "warning" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {structuralAnalysis.status === "unsafe" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {structuralAnalysis.status.toUpperCase()}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Structural integrity assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {structuralAnalysis ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium">Dead Load</span>
                        <span className="text-primary font-semibold">{structuralAnalysis.deadLoad.toFixed(2)} kN/m²</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium">Live Load</span>
                        <span className="text-primary font-semibold">{structuralAnalysis.liveLoad.toFixed(2)} kN/m²</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium">Total Load</span>
                        <span className="text-primary font-semibold">{structuralAnalysis.totalLoad.toFixed(2)} kN</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium">Beam Capacity</span>
                        <span className="text-primary font-semibold">{structuralAnalysis.beamCapacity.toFixed(2)} kNm</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium">Safety Factor</span>
                        <span className={`font-semibold ${
                          structuralAnalysis.safetyFactor >= 1.5 ? "text-green-600 dark:text-green-400" :
                          structuralAnalysis.safetyFactor >= 1.0 ? "text-orange-600 dark:text-orange-400" :
                          "text-red-600 dark:text-red-400"
                        }`}>
                          {structuralAnalysis.safetyFactor.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="font-semibold">Recommendations</h4>
                      <ul className="space-y-2">
                        {structuralAnalysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground">
                        Note: This is a simplified analysis. Always consult a licensed structural engineer for actual construction projects.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Enter parameters and click "Analyze Structure" to see results
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Calculator;