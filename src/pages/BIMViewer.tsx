import { ModelViewer } from "@/components/ModelViewer";

const BIMViewer = () => {
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2">BIM Integration</h1>
        <p className="text-lg text-muted-foreground">
          View 3D models and perform quantity takeoff for construction projects
        </p>
      </div>

      <ModelViewer />
    </div>
  );
};

export default BIMViewer;