import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IsometricHouse } from "@/components/IsometricHouse";
import { 
  Calculator, 
  PenTool, 
  FolderOpen, 
  ArrowRight,
  CheckCircle,
  Building2,
  Ruler,
  BarChart3,
  ShoppingCart,
  Users,
  Bot
} from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: Calculator,
      title: "Advanced Calculator",
      description: "Calculate precise quantities for concrete, bricks, steel, and other construction materials with real-time cost estimation.",
      href: "/calculator",
      color: "bg-blue-500",
    },
    {
      icon: ShoppingCart,
      title: "Material Marketplace",
      description: "Buy construction materials at the best prices from verified suppliers with price comparison and delivery tracking.",
      href: "/marketplace",
      color: "bg-emerald-500",
    },
    {
      icon: Users,
      title: "Hire Experts",
      description: "Connect with verified engineers, architects, contractors, and designers with ratings and reviews.",
      href: "/hiring",
      color: "bg-purple-500",
    },
    {
      icon: Bot,
      title: "AI Assistant",
      description: "Get intelligent recommendations for materials, pricing, hiring experts, and construction planning guidance.",
      href: "/ai-assistant",
      color: "bg-orange-500",
    },
  ];

  const benefits = [
    "Accurate quantity calculations",
    "Real-time cost estimation",
    "Professional PDF reports",
    "Mobile-responsive design",
    "Interactive floor planning",
    "Project history tracking"
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-90"></div>
        <div className="absolute inset-0 grid-pattern opacity-20"></div>
        
        <div className="relative container px-4 mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 animate-slide-in">
                Quantify,
                <br />
                <span className="text-primary-glow">Structure,</span>
                <br />
                Conquer
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl animate-slide-in">
                Professional construction quantity surveying and project management platform. 
                Calculate materials, design floor plans, and manage projects with precision.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-scale-in">
                <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
                  <Link to="/calculator" className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Start Calculation
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 border-white/30 text-white hover:bg-white/20" asChild>
                  <Link to="/marketplace" className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Buy Materials
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 border-white/30 text-white hover:bg-white/20" asChild>
                  <Link to="/hiring" className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Hire Experts
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 border-white/30 text-white hover:bg-white/20" asChild>
                  <Link to="/ai-assistant" className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    Ask AI
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="flex-1 lg:pl-12">
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 animate-scale-in delay-100">
                    <Building2 className="h-8 w-8 text-white mb-2" />
                    <div className="text-2xl font-bold text-white">500+</div>
                    <div className="text-white/80">Projects</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 animate-scale-in delay-200">
                    <BarChart3 className="h-8 w-8 text-white mb-2" />
                    <div className="text-2xl font-bold text-white">95%</div>
                    <div className="text-white/80">Accuracy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3D House Building Section */}
      <section className="py-20 bg-background">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Watch Your Vision Come to Life
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Scroll down to see how we build your construction projects step by step - 
              from foundation to finishing touches.
            </p>
          </div>
          <IsometricHouse />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-engineering-gray/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Complete Construction Platform
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Calculate materials, buy at best prices, hire verified experts, and get AI-powered 
            guidance for your construction projects - all in one platform.
          </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="card-elevated transition-smooth hover:shadow-lg hover:-translate-y-1 animate-scale-in" style={{ animationDelay: `${index * 150}ms` }}>
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline" asChild>
                      <Link to={feature.href} className="flex items-center justify-center gap-2">
                        Get Started
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Why Choose QSC?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Built specifically for construction professionals who need precision, 
                efficiency, and reliability in their quantity surveying and project management.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-sm font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-primary/5 rounded-2xl transform rotate-3"></div>
              <Card className="relative bg-white shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ruler className="h-5 w-5 text-primary" />
                    Professional Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm">Concrete (m³)</span>
                    <span className="font-semibold">25.6</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm">Steel Reinforcement (kg)</span>
                    <span className="font-semibold">1,250</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm">Bricks (units)</span>
                    <span className="font-semibold">3,840</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 text-primary font-bold">
                    <span>Total Cost</span>
                    <span>$12,450</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Construction Projects?
          </h2>
          <p className="text-xl text-primary-glow mb-8 max-w-2xl mx-auto">
            Join thousands of construction professionals who trust QSC for accurate 
            quantity surveying and efficient project management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
              <Link to="/calculator" className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Start Your First Project
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent border-white text-white hover:bg-white hover:text-primary" asChild>
              <Link to="/projects" className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                View Projects
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;