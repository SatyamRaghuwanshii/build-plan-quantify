import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ShoppingCart, 
  Star, 
  Truck, 
  Filter,
  Search,
  MapPin,
  DollarSign,
  Package
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Material {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  vendor: string;
  rating: number;
  reviews: number;
  image: string;
  delivery: string;
  location: string;
  inStock: boolean;
  discount?: number;
}

const Marketplace = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("best-deals");
  const [cart, setCart] = useState<{[key: string]: number}>({});

  const categories = [
    "all", "cement", "steel", "bricks", "paint", "flooring", 
    "plumbing", "electrical", "roofing", "insulation"
  ];

  const materials: Material[] = [
    {
      id: "1",
      name: "Premium Portland Cement",
      category: "cement",
      price: 8.50,
      unit: "per bag (50kg)",
      vendor: "BuildMart Supplies",
      rating: 4.8,
      reviews: 245,
      image: "🏗️",
      delivery: "Same Day",
      location: "2.5 km away",
      inStock: true,
      discount: 10
    },
    {
      id: "2", 
      name: "High-Grade Steel Rebar",
      category: "steel",
      price: 1.25,
      unit: "per kg",
      vendor: "MetalCorp Industries",
      rating: 4.9,
      reviews: 189,
      image: "🔩",
      delivery: "Next Day",
      location: "5.2 km away",
      inStock: true
    },
    {
      id: "3",
      name: "Red Clay Bricks",
      category: "bricks", 
      price: 0.45,
      unit: "per brick",
      vendor: "Traditional Brickworks",
      rating: 4.7,
      reviews: 156,
      image: "🧱",
      delivery: "2-3 Days",
      location: "3.8 km away",
      inStock: true,
      discount: 5
    },
    {
      id: "4",
      name: "Weather Shield Exterior Paint",
      category: "paint",
      price: 45.00,
      unit: "per gallon",
      vendor: "ColorTech Solutions", 
      rating: 4.6,
      reviews: 98,
      image: "🎨",
      delivery: "Same Day",
      location: "1.2 km away",
      inStock: false
    },
    {
      id: "5",
      name: "Ceramic Floor Tiles",
      category: "flooring",
      price: 25.50,
      unit: "per sqm",
      vendor: "FloorMaster Ltd",
      rating: 4.8,
      reviews: 203,
      image: "🔲",
      delivery: "Next Day",
      location: "4.1 km away", 
      inStock: true,
      discount: 15
    },
    {
      id: "6",
      name: "PVC Pipes & Fittings",
      category: "plumbing",
      price: 12.75,
      unit: "per meter",
      vendor: "AquaFlow Systems",
      rating: 4.5,
      reviews: 134,
      image: "🚰",
      delivery: "Same Day",
      location: "2.8 km away",
      inStock: true
    }
  ];

  const filteredMaterials = materials
    .filter(material => {
      const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || material.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "best-deals":
          return (b.discount || 0) - (a.discount || 0);
        case "nearest":
          return parseFloat(a.location) - parseFloat(b.location);
        case "top-rated":
          return b.rating - a.rating;
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        default:
          return 0;
      }
    });

  const addToCart = (materialId: string, quantity: number = 1) => {
    setCart(prev => ({
      ...prev,
      [materialId]: (prev[materialId] || 0) + quantity
    }));
    
    toast({
      title: "Added to Cart",
      description: "Material has been added to your cart.",
    });
  };

  const getTotalCartItems = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2">Material Marketplace</h1>
        <p className="text-lg text-muted-foreground">
          Find the best construction materials at competitive prices from trusted suppliers
        </p>
      </div>

      {/* Filters & Search */}
      <div className="mb-8 space-y-4 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-4">
        <div className="lg:col-span-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="lg:col-span-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="best-deals">Best Deals</SelectItem>
              <SelectItem value="nearest">Nearest Supplier</SelectItem>
              <SelectItem value="top-rated">Top Rated</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="lg:col-span-2">
          <Button className="w-full relative">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart
            {getTotalCartItems() > 0 && (
              <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center">
                {getTotalCartItems()}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => (
          <Card key={material.id} className="card-elevated transition-smooth hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="text-4xl mb-2">{material.image}</div>
                <div className="text-right">
                  {material.discount && (
                    <Badge variant="secondary" className="bg-success text-success-foreground mb-1">
                      -{material.discount}% OFF
                    </Badge>
                  )}
                  <Badge variant={material.inStock ? "default" : "secondary"}>
                    {material.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
              </div>
              
              <CardTitle className="text-lg line-clamp-2">{material.name}</CardTitle>
              
              <div className="flex items-center gap-1">
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(material.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {material.rating} ({material.reviews})
                </span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    ${material.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {material.unit}
                  </span>
                </div>
                
                <div className="text-sm font-medium">{material.vendor}</div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Truck className="h-4 w-4" />
                    {material.delivery}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {material.location}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={!material.inStock}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Details
                </Button>
                <Button 
                  size="sm"
                  disabled={!material.inStock}
                  onClick={() => addToCart(material.id)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No materials found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters to find what you need.
          </p>
        </div>
      )}
    </div>
  );
};

export default Marketplace;