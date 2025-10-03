import { FloorPlanGenerator } from "@/components/FloorPlanGenerator";

const FloorPlan = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">AI Floor Plan Generator</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Generate professional 2D architectural floor plans and convert them to stunning 3D isometric views using AI.
          </p>
        </div>
        <FloorPlanGenerator />
      </div>
    </div>
  );
};

export default FloorPlan;
