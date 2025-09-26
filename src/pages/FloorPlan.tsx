import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  PenTool, 
  Square, 
  Move, 
  Undo2, 
  Redo2, 
  Grid3x3, 
  Download,
  Calculator,
  Trash2,
  Home
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Tool = "select" | "wall" | "room" | "move";

interface Wall {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Room {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

const FloorPlan = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [showGrid, setShowGrid] = useState(true);
  const [walls, setWalls] = useState<Wall[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({
    totalArea: "0",
    roomCount: "0",
    wallLength: "0"
  });

  const tools = [
    { id: "select" as Tool, icon: Move, label: "Select/Move", color: "bg-blue-500" },
    { id: "wall" as Tool, icon: PenTool, label: "Draw Wall", color: "bg-green-500" },
    { id: "room" as Tool, icon: Square, label: "Add Room", color: "bg-purple-500" },
  ];

  useEffect(() => {
    drawCanvas();
  }, [walls, rooms, showGrid]);

  useEffect(() => {
    // Update dimensions when walls/rooms change
    const totalArea = rooms.reduce((sum, room) => sum + (room.width * room.height / 10000), 0); // Convert to m²
    const wallLength = walls.reduce((sum, wall) => {
      const length = Math.sqrt(Math.pow(wall.x2 - wall.x1, 2) + Math.pow(wall.y2 - wall.y1, 2));
      return sum + (length / 20); // Convert pixels to meters (approximate scale)
    }, 0);

    setDimensions({
      totalArea: totalArea.toFixed(2),
      roomCount: rooms.length.toString(),
      wallLength: wallLength.toFixed(2)
    });
  }, [walls, rooms]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 0.5;
      
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw walls
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    walls.forEach(wall => {
      ctx.beginPath();
      ctx.moveTo(wall.x1, wall.y1);
      ctx.lineTo(wall.x2, wall.y2);
      ctx.stroke();
    });

    // Draw rooms
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    rooms.forEach(room => {
      ctx.fillRect(room.x, room.y, room.width, room.height);
      ctx.strokeRect(room.x, room.y, room.width, room.height);
      
      // Draw room label
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(
        room.label, 
        room.x + room.width / 2, 
        room.y + room.height / 2
      );
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    });
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const snapToGrid = (pos: { x: number; y: number }) => {
    if (!showGrid) return pos;
    return {
      x: Math.round(pos.x / 20) * 20,
      y: Math.round(pos.y / 20) * 20
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = snapToGrid(getMousePos(e));
    
    if (activeTool === "wall") {
      setIsDrawing(true);
      setStartPoint(pos);
    } else if (activeTool === "room") {
      setIsDrawing(true);
      setStartPoint(pos);
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const pos = snapToGrid(getMousePos(e));
    
    if (activeTool === "wall") {
      const newWall: Wall = {
        id: `wall-${Date.now()}`,
        x1: startPoint.x,
        y1: startPoint.y,
        x2: pos.x,
        y2: pos.y
      };
      
      // Only add wall if it has some length
      if (Math.abs(newWall.x2 - newWall.x1) > 10 || Math.abs(newWall.y2 - newWall.y1) > 10) {
        setWalls(prev => [...prev, newWall]);
        toast({
          title: "Wall Added",
          description: "New wall has been drawn on the floor plan.",
        });
      }
    } else if (activeTool === "room") {
      const width = Math.abs(pos.x - startPoint.x);
      const height = Math.abs(pos.y - startPoint.y);
      
      if (width > 20 && height > 20) {
        const newRoom: Room = {
          id: `room-${Date.now()}`,
          x: Math.min(startPoint.x, pos.x),
          y: Math.min(startPoint.y, pos.y),
          width,
          height,
          label: `Room ${rooms.length + 1}`
        };
        
        setRooms(prev => [...prev, newRoom]);
        toast({
          title: "Room Added",
          description: "New room has been added to the floor plan.",
        });
      }
    }
    
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    setWalls([]);
    setRooms([]);
    toast({
      title: "Canvas Cleared",
      description: "All walls and rooms have been removed.",
    });
  };

  const exportToCalculator = () => {
    // In a real app, this would pass data to the calculator
    toast({
      title: "Exported to Calculator",
      description: `Floor plan dimensions exported: ${dimensions.totalArea}m² area, ${dimensions.wallLength}m walls`,
    });
  };

  const exportPlan = () => {
    toast({
      title: "Export Started",
      description: "Floor plan is being prepared for download.",
    });
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2">Floor Plan Designer</h1>
        <p className="text-lg text-muted-foreground">
          Create interactive floor plans with drawing tools and dimension calculations
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Tools Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Drawing Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Drawing Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Button
                    key={tool.id}
                    variant={activeTool === tool.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setActiveTool(tool.id)}
                  >
                    <div className={`w-4 h-4 rounded mr-3 ${tool.color}`}>
                      <Icon className="h-3 w-3 text-white m-0.5" />
                    </div>
                    {tool.label}
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* Canvas Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Canvas Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowGrid(!showGrid)}
              >
                <Grid3x3 className="h-4 w-4 mr-2" />
                {showGrid ? "Hide" : "Show"} Grid
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={clearCanvas}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Redo2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dimensions Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                Dimensions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Total Area</Label>
                <div className="flex items-center gap-2">
                  <Input value={dimensions.totalArea} readOnly />
                  <Badge variant="secondary">m²</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Wall Length</Label>
                <div className="flex items-center gap-2">
                  <Input value={dimensions.wallLength} readOnly />
                  <Badge variant="secondary">m</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Room Count</Label>
                <Input value={dimensions.roomCount} readOnly />
              </div>

              <div className="pt-3 space-y-2">
                <Button onClick={exportToCalculator} className="w-full" size="sm">
                  <Calculator className="h-4 w-4 mr-2" />
                  Export to Calculator
                </Button>
                <Button variant="outline" onClick={exportPlan} className="w-full" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Canvas Area */}
        <div className="lg:col-span-3">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <PenTool className="h-5 w-5 text-primary" />
                  Drawing Canvas
                </span>
                <Badge variant="secondary">
                  Tool: {tools.find(t => t.id === activeTool)?.label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-4 bg-engineering-gray/10">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="w-full h-auto border border-border rounded cursor-crosshair bg-white"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseUp={handleCanvasMouseUp}
                />
                <div className="mt-4 text-sm text-muted-foreground text-center">
                  {activeTool === "wall" && "Click and drag to draw walls"}
                  {activeTool === "room" && "Click and drag to create rooms"}
                  {activeTool === "select" && "Click on elements to select and move them"}
                  {activeTool === "move" && "Drag to move selected elements"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FloorPlan;