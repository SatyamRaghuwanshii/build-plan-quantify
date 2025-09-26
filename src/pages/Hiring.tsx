import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Star, 
  MapPin, 
  Clock,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  Award,
  Filter,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Professional {
  id: string;
  name: string;
  specialty: string;
  category: string;
  rating: number;
  reviews: number;
  hourlyRate: number;
  dailyRate: number;
  location: string;
  experience: string;
  avatar: string;
  verified: boolean;
  available: boolean;
  completedProjects: number;
  skills: string[];
  description: string;
}

const Hiring = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("top-rated");

  const categories = [
    "all", "civil-engineer", "structural-engineer", "architect",
    "interior-designer", "exterior-designer", "contractor", "specialist"
  ];

  const professionals: Professional[] = [
    {
      id: "1",
      name: "Dr. Sarah Mitchell",
      specialty: "Structural Engineering",
      category: "structural-engineer",
      rating: 4.9,
      reviews: 127,
      hourlyRate: 85,
      dailyRate: 650,
      location: "Downtown, 2.3 km",
      experience: "12+ years",
      avatar: "👩‍💼",
      verified: true,
      available: true,
      completedProjects: 89,
      skills: ["Steel Structures", "Concrete Design", "Seismic Analysis"],
      description: "Expert in high-rise and commercial building structural design with specialization in earthquake-resistant construction."
    },
    {
      id: "2",
      name: "Michael Chen",
      specialty: "Civil Engineering",
      category: "civil-engineer", 
      rating: 4.8,
      reviews: 203,
      hourlyRate: 75,
      dailyRate: 580,
      location: "Midtown, 4.1 km",
      experience: "10+ years",
      avatar: "👨‍🔬",
      verified: true,
      available: true,
      completedProjects: 156,
      skills: ["Site Planning", "Infrastructure", "Project Management"],
      description: "Comprehensive civil engineering solutions for residential and commercial projects with focus on sustainable development."
    },
    {
      id: "3",
      name: "Emma Rodriguez",
      specialty: "Interior Architecture",
      category: "interior-designer",
      rating: 4.7,
      reviews: 94,
      hourlyRate: 60,
      dailyRate: 450,
      location: "Arts District, 3.5 km",
      experience: "8+ years", 
      avatar: "👩‍🎨",
      verified: true,
      available: false,
      completedProjects: 73,
      skills: ["Space Planning", "3D Visualization", "Sustainable Design"],
      description: "Creating functional and beautiful interior spaces with expertise in modern residential and office design."
    },
    {
      id: "4",
      name: "James Thompson",
      specialty: "General Contractor",
      category: "contractor",
      rating: 4.6,
      reviews: 178,
      hourlyRate: 55,
      dailyRate: 420,
      location: "Industrial Zone, 6.2 km",
      experience: "15+ years",
      avatar: "👷‍♂️",
      verified: true,
      available: true,
      completedProjects: 234,
      skills: ["Construction Management", "Quality Control", "Team Leadership"],
      description: "Experienced general contractor specializing in residential and small commercial construction projects."
    },
    {
      id: "5",
      name: "Dr. Aisha Patel",
      specialty: "Landscape Architecture", 
      category: "exterior-designer",
      rating: 4.8,
      reviews: 86,
      hourlyRate: 70,
      dailyRate: 520,
      location: "Green Valley, 5.7 km",
      experience: "9+ years",
      avatar: "👩‍🌾",
      verified: true,
      available: true,
      completedProjects: 67,
      skills: ["Sustainable Landscaping", "Urban Planning", "Environmental Design"],
      description: "Sustainable landscape architecture with focus on eco-friendly outdoor spaces and urban green infrastructure."
    },
    {
      id: "6",
      name: "Roberto Silva",
      specialty: "Architectural Design",
      category: "architect",
      rating: 4.9,
      reviews: 145,
      hourlyRate: 90,
      dailyRate: 720,
      location: "Historic District, 1.8 km",
      experience: "14+ years",
      avatar: "👨‍💼", 
      verified: true,
      available: true,
      completedProjects: 102,
      skills: ["Modern Design", "Historic Restoration", "Sustainable Architecture"],
      description: "Award-winning architect with expertise in contemporary design and historic building restoration projects."
    }
  ];

  const filteredProfessionals = professionals
    .filter(professional => {
      const matchesSearch = professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           professional.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || professional.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "top-rated":
          return b.rating - a.rating;
        case "most-experienced":
          return parseInt(b.experience) - parseInt(a.experience);
        case "nearest":
          return parseFloat(a.location) - parseFloat(b.location);
        case "price-low":
          return a.hourlyRate - b.hourlyRate;
        case "price-high":
          return b.hourlyRate - a.hourlyRate;
        default:
          return 0;
      }
    });

  const handleHire = (professional: Professional) => {
    toast({
      title: "Hire Request Sent",
      description: `Your hiring request has been sent to ${professional.name}. They will contact you within 24 hours.`,
    });
  };

  const handleMessage = (professional: Professional) => {
    toast({
      title: "Message Sent",
      description: `Your message has been sent to ${professional.name}.`,
    });
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2">Hire Experts</h1>
        <p className="text-lg text-muted-foreground">
          Connect with verified engineers, architects, contractors, and designers for your construction project
        </p>
      </div>

      {/* Filters & Search */}
      <div className="mb-8 space-y-4 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-4">
        <div className="lg:col-span-5">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="lg:col-span-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="civil-engineer">Civil Engineer</SelectItem>
              <SelectItem value="structural-engineer">Structural Engineer</SelectItem>
              <SelectItem value="architect">Architect</SelectItem>
              <SelectItem value="interior-designer">Interior Designer</SelectItem>
              <SelectItem value="exterior-designer">Exterior Designer</SelectItem>
              <SelectItem value="contractor">Contractor</SelectItem>
              <SelectItem value="specialist">Specialist</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="lg:col-span-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top-rated">Top Rated</SelectItem>
              <SelectItem value="most-experienced">Most Experienced</SelectItem>
              <SelectItem value="nearest">Nearest Location</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Professionals Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {filteredProfessionals.map((professional) => (
          <Card key={professional.id} className="card-elevated transition-smooth hover:shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 text-2xl">
                    <AvatarFallback>{professional.avatar}</AvatarFallback>
                  </Avatar>
                  {professional.verified && (
                    <div className="absolute -top-1 -right-1 bg-success rounded-full p-1">
                      <Award className="h-3 w-3 text-success-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{professional.name}</CardTitle>
                      <CardDescription className="text-base font-medium text-primary">
                        {professional.specialty}
                      </CardDescription>
                    </div>
                    <Badge variant={professional.available ? "default" : "secondary"}>
                      {professional.available ? "Available" : "Busy"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(professional.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                      <span className="text-sm font-medium ml-1">
                        {professional.rating} ({professional.reviews})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {professional.description}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{professional.experience} experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{professional.location}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>${professional.hourlyRate}/hr</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{professional.completedProjects} projects</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Skills</div>
                <div className="flex flex-wrap gap-2">
                  {professional.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleMessage(professional)}
                >
                  <Mail className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm"
                  disabled={!professional.available}
                  onClick={() => handleHire(professional)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Hire
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProfessionals.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No professionals found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters to find the right expert for your project.
          </p>
        </div>
      )}
    </div>
  );
};

export default Hiring;