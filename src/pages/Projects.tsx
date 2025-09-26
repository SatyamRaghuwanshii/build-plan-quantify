import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Calendar,
  DollarSign,
  Building,
  Edit,
  Trash2,
  Download,
  Copy,
  Filter,
  Grid,
  List
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  type: "Residential" | "Commercial" | "Industrial";
  status: "Active" | "Completed" | "On Hold";
  lastUpdated: string;
  totalCost: number;
  area: number;
  rooms: number;
  description: string;
}

const Projects = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Sample project data
  const [projects] = useState<Project[]>([
    {
      id: "1",
      name: "Residential Complex A",
      type: "Residential",
      status: "Active",
      lastUpdated: "2024-01-15",
      totalCost: 45000,
      area: 120.5,
      rooms: 8,
      description: "3-bedroom apartment complex with modern amenities"
    },
    {
      id: "2", 
      name: "Office Building Downtown",
      type: "Commercial",
      status: "Completed",
      lastUpdated: "2024-01-10",
      totalCost: 125000,
      area: 450.0,
      rooms: 25,
      description: "5-story office building with parking garage"
    },
    {
      id: "3",
      name: "Warehouse Facility",
      type: "Industrial", 
      status: "On Hold",
      lastUpdated: "2024-01-08",
      totalCost: 85000,
      area: 800.0,
      rooms: 12,
      description: "Storage and distribution warehouse"
    },
    {
      id: "4",
      name: "Shopping Mall Extension", 
      type: "Commercial",
      status: "Active",
      lastUpdated: "2024-01-12",
      totalCost: 200000,
      area: 650.0,
      rooms: 35,
      description: "Extension of existing shopping center"
    }
  ]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-500";
      case "Completed": return "bg-blue-500"; 
      case "On Hold": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Residential": return "🏠";
      case "Commercial": return "🏢";
      case "Industrial": return "🏭";
      default: return "🏗️";
    }
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    toast({
      title: "Project Deleted",
      description: `"${projectName}" has been removed from your projects.`,
    });
  };

  const handleDuplicateProject = (projectId: string, projectName: string) => {
    toast({
      title: "Project Duplicated",
      description: `"${projectName}" has been copied to your projects.`,
    });
  };

  const handleDownload = (projectId: string, projectName: string) => {
    toast({
      title: "Download Started",
      description: `Report for "${projectName}" is being prepared.`,
    });
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Projects Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Manage and track all your construction quantity surveying projects
          </p>
        </div>
        
        <Button size="lg" asChild className="animate-pulse-glow">
          <Link to="/calculator" className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterStatus("all")}
                className={filterStatus === "all" ? "bg-primary text-primary-foreground" : ""}
              >
                All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterStatus("Active")}
                className={filterStatus === "Active" ? "bg-primary text-primary-foreground" : ""}
              >
                <Filter className="h-4 w-4 mr-1" />
                Active
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterStatus("Completed")}
                className={filterStatus === "Completed" ? "bg-primary text-primary-foreground" : ""}
              >
                Completed
              </Button>

              {/* View Mode Toggle */}
              <div className="border-l pl-3 flex gap-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <Card key={project.id} className="card-elevated transition-smooth hover:shadow-lg hover:-translate-y-1 animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getTypeIcon(project.type)}</div>
                    <div>
                      <CardTitle className="text-lg line-clamp-2">{project.name}</CardTitle>
                      <CardDescription className="text-sm">{project.type}</CardDescription>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(project.status)} text-white`}>
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>

                {/* Project Stats */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Area</div>
                      <div className="font-semibold">{project.area} m²</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Cost</div>
                      <div className="font-semibold">${project.totalCost.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Updated {project.lastUpdated}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/projects/${project.id}`} className="flex items-center gap-2">
                      <Edit className="h-3 w-3" />
                      Edit
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownload(project.id, project.name)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-3 w-3" />
                    Export
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDuplicateProject(project.id, project.name)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-3 w-3" />
                    Duplicate
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteProject(project.id, project.name)}
                    className="flex items-center gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredProjects.map((project, index) => (
            <Card key={project.id} className="transition-smooth hover:shadow-md animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-2xl">{getTypeIcon(project.type)}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{project.name}</h3>
                      <p className="text-muted-foreground text-sm truncate">{project.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {project.area} m²
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${project.totalCost.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {project.lastUpdated}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={`${getStatusColor(project.status)} text-white`}>
                      {project.status}
                    </Badge>
                    
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/projects/${project.id}`}>
                          <Edit className="h-3 w-3" />
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(project.id, project.name)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDuplicateProject(project.id, project.name)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteProject(project.id, project.name)}
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredProjects.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? "No projects match your search criteria." : "You haven't created any projects yet."}
            </p>
            <Button asChild>
              <Link to="/calculator">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Projects;