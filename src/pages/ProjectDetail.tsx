import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskBoard } from "@/components/TaskBoard";
import { TeamMembers } from "@/components/TeamMembers";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Building, Calendar, DollarSign } from "lucide-react";

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  description: string | null;
  total_cost: number | null;
  area: number | null;
  rooms: number | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    if (!id) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch project details",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setProject(data);
    setIsOwner(user?.id === data.owner_id);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-green-500";
      case "completed": return "bg-blue-500";
      case "on hold": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="text-center py-12">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Project Not Found</h3>
            <p className="text-muted-foreground mb-6">
              The project you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button asChild>
              <Link to="/projects">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link to="/projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div>
              <CardTitle className="text-3xl mb-2">{project.name}</CardTitle>
              <p className="text-muted-foreground">{project.description}</p>
            </div>
            <Badge className={`${getStatusColor(project.status)} text-white self-start`}>
              {project.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Type</div>
                <div className="font-semibold">{project.type}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Area</div>
                <div className="font-semibold">{project.area ? `${project.area} m²` : 'N/A'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Cost</div>
                <div className="font-semibold">{project.total_cost ? `$${project.total_cost.toLocaleString()}` : 'N/A'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Created</div>
                <div className="font-semibold">{new Date(project.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <TaskBoard projectId={project.id} />
        </TabsContent>

        <TabsContent value="team">
          <TeamMembers projectId={project.id} isOwner={isOwner} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetail;