import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  PenTool, 
  FolderOpen, 
  Menu, 
  X,
  Ruler,
  Building,
  ShoppingCart,
  Users,
  Bot,
  Box
} from "lucide-react";
import { cn } from "@/lib/utils";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Building },
    { name: 'Calculator', href: '/calculator', icon: Calculator },
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingCart },
    { name: 'Hire Experts', href: '/hiring', icon: Users },
    { name: 'AI Assistant', href: '/ai-assistant', icon: Bot },
    { name: 'Projects', href: '/projects', icon: FolderOpen },
    { name: 'BIM Viewer', href: '/bim-viewer', icon: Box },
  ];

  const isActive = (href: string) => {
    return href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Ruler className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary">QSC</span>
              <span className="text-xs text-muted-foreground hidden sm:block">Quantify, Structure, Conquer</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.name}
                  variant={isActive(item.href) ? "default" : "ghost"}
                  className={cn(
                    "transition-smooth",
                    isActive(item.href) && "bg-primary text-primary-foreground"
                  )}
                  asChild
                >
                  <Link to={item.href} className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                </Button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="container px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.name}
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start transition-smooth",
                      isActive(item.href) && "bg-primary text-primary-foreground"
                    )}
                    asChild
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link to={item.href} className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-engineering-gray/50">
        <div className="container px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                <Ruler className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium">QSC - Quantify, Structure, Conquer</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Professional construction quantity surveying platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;