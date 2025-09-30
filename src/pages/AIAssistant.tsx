import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Send, 
  Mic, 
  Calculator,
  ShoppingCart,
  Users,
  Lightbulb,
  MessageCircle,
  Zap,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: QuickAction[];
}

interface QuickAction {
  label: string;
  action: string;
  icon: any;
  href?: string;
}

const AIAssistant = () => {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI Construction Assistant. I can help you with material calculations, finding the best deals, hiring experts, and planning your construction project. What would you like to know?",
      timestamp: new Date(),
      suggestions: [
        { label: "Calculate Materials", action: "calculate", icon: Calculator, href: "/calculator" },
        { label: "Find Best Deals", action: "deals", icon: ShoppingCart, href: "/marketplace" },
        { label: "Hire Experts", action: "hire", icon: Users, href: "/hiring" },
        { label: "Project Planning", action: "plan", icon: Target }
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const quickActions: QuickAction[] = [
    { label: "Calculate Again", action: "calculate", icon: Calculator },
    { label: "Best Deals", action: "deals", icon: ShoppingCart },
    { label: "Hire Experts", action: "hire", icon: Users },
    { label: "Get Ideas", action: "ideas", icon: Lightbulb }
  ];

  // Helper function to render text with bold markdown
  const renderFormattedText = (text: string) => {
    // Split by ** for bold text
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove ** and render as bold
        return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      // Split by * for bullet points and render with proper spacing
      return part.split('\n').map((line, lineIndex) => (
        <span key={`${index}-${lineIndex}`}>
          {line}
          {lineIndex < part.split('\n').length - 1 && <br />}
        </span>
      ));
    });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user", 
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Call the Supabase edge function using the client
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { message: inputMessage }
      });

      if (error) {
        throw error;
      }

      const aiResponse: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data?.response || "Sorry, I couldn't generate a response.",
        timestamp: new Date(),
        suggestions: generateSuggestionsFromAI(data?.response || "")
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error calling AI:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
      
      // Fallback to mock response
      const fallbackResponse = generateAIResponse(inputMessage);
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  // Generate suggestions based on AI response content
  const generateSuggestionsFromAI = (aiResponse: string): QuickAction[] => {
    const lowerResponse = aiResponse.toLowerCase();
    const suggestions: QuickAction[] = [];
    
    // Check for different topics mentioned in the AI response
    if (lowerResponse.includes("material") || lowerResponse.includes("calculation") || lowerResponse.includes("quantity")) {
      suggestions.push({ label: "Open Calculator", action: "calculate", icon: Calculator, href: "/calculator" });
    }
    
    if (lowerResponse.includes("price") || lowerResponse.includes("deal") || lowerResponse.includes("supplier") || lowerResponse.includes("cost")) {
      suggestions.push({ label: "Browse Marketplace", action: "deals", icon: ShoppingCart, href: "/marketplace" });
    }
    
    if (lowerResponse.includes("hire") || lowerResponse.includes("engineer") || lowerResponse.includes("contractor") || lowerResponse.includes("professional")) {
      suggestions.push({ label: "Find Experts", action: "hire", icon: Users, href: "/hiring" });
    }
    
    if (lowerResponse.includes("plan") || lowerResponse.includes("project") || lowerResponse.includes("timeline")) {
      suggestions.push({ label: "View Projects", action: "projects", icon: Target, href: "/projects" });
    }
    
    // Add generic helpful suggestions if none matched
    if (suggestions.length === 0) {
      suggestions.push(
        { label: "Calculate Materials", action: "calculate", icon: Calculator, href: "/calculator" },
        { label: "Find Best Deals", action: "deals", icon: ShoppingCart, href: "/marketplace" }
      );
    }
    
    // Limit to 3 suggestions
    return suggestions.slice(0, 3);
  };

  const generateSuggestions = (userInput: string): QuickAction[] => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes("material") || lowerInput.includes("calculate")) {
      return [
        { label: "Open Calculator", action: "calculate", icon: Calculator, href: "/calculator" },
        { label: "Find Suppliers", action: "deals", icon: ShoppingCart, href: "/marketplace" }
      ];
    } else if (lowerInput.includes("price") || lowerInput.includes("cost") || lowerInput.includes("deal")) {
      return [
        { label: "View Best Deals", action: "deals", icon: ShoppingCart, href: "/marketplace" },
        { label: "Compare Prices", action: "compare", icon: Target }
      ];
    } else if (lowerInput.includes("hire") || lowerInput.includes("engineer") || lowerInput.includes("contractor")) {
      return [
        { label: "Browse Experts", action: "hire", icon: Users, href: "/hiring" },
        { label: "Filter by Specialty", action: "filter", icon: Target }
      ];
    } else if (lowerInput.includes("plan") || lowerInput.includes("project") || lowerInput.includes("start")) {
      return [
        { label: "Start Planning", action: "plan", icon: Target },
        { label: "Calculate Materials", action: "calculate", icon: Calculator, href: "/calculator" },
        { label: "View Projects", action: "projects", icon: Target, href: "/projects" }
      ];
    }
    
    return quickActions;
  };

  const generateAIResponse = (userInput: string): Message => {
    const lowerInput = userInput.toLowerCase();
    
    let response = "";

    if (lowerInput.includes("material") || lowerInput.includes("calculate")) {
      response = "I can help you calculate materials for your construction project. Based on your project dimensions, I'll estimate quantities for concrete, steel, bricks, and other materials. Would you like me to guide you through the calculator or help you find the best suppliers for these materials?";
    } else if (lowerInput.includes("price") || lowerInput.includes("cost") || lowerInput.includes("deal")) {
      response = "For the best material prices, I recommend checking our marketplace where you can compare prices from multiple suppliers. Currently, we have great deals on cement (10% off), ceramic tiles (15% off), and steel rebar from top-rated vendors. Would you like me to show you the best deals available?";
    } else if (lowerInput.includes("hire") || lowerInput.includes("engineer") || lowerInput.includes("contractor")) {
      response = "I can help you find qualified engineers and contractors for your project. We have verified professionals including structural engineers, civil engineers, architects, and contractors with ratings and reviews. What type of expert are you looking for?";
    } else if (lowerInput.includes("plan") || lowerInput.includes("project") || lowerInput.includes("start")) {
      response = "Great! Let me help you plan your construction project step by step: 1) First, calculate your material requirements 2) Get quotes from suppliers 3) Hire qualified professionals 4) Create a timeline and budget. Which step would you like to start with?";
    } else {
      response = "I understand you're working on a construction project. I can assist you with material calculations, finding the best prices from suppliers, connecting you with qualified professionals, and providing project planning advice. What specific area would you like help with?";
    }

    return {
      id: Date.now().toString(),
      role: "assistant",
      content: response,
      timestamp: new Date(),
      suggestions: generateSuggestions(userInput)
    };
  };

  const handleQuickAction = (action: QuickAction) => {
    if (action.href) {
      // Navigation will be handled by Link component
      return;
    }

    const actionMessages: {[key: string]: string} = {
      calculate: "I'd like help with material calculations",
      deals: "Show me the best deals available",
      hire: "Help me find qualified professionals", 
      plan: "Help me plan my construction project",
      ideas: "Give me some construction project ideas"
    };

    const message = actionMessages[action.action] || action.label;
    setInputMessage(message);
    handleSendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="container px-4 py-8 mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl mb-4 shadow-lg">
          <Bot className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          AI Construction Assistant
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get intelligent recommendations for materials, pricing, hiring, and project planning powered by AI
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="border-2 shadow-xl h-[650px] flex flex-col bg-gradient-to-br from-background to-muted/20">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <MessageCircle className="h-6 w-6 text-primary" />
                Chat with AI Assistant
              </CardTitle>
              <CardDescription className="text-base">
                Ask questions about materials, costs, hiring, or project planning
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-6 overflow-hidden">
              {/* Messages Area */}
              <ScrollArea className="flex-1 mb-4 pr-2">
                <div className="space-y-6 pr-2">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] min-w-0 ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                        {message.role === 'assistant' && (
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mb-2 shadow-md flex-shrink-0">
                            <Bot className="h-5 w-5 text-primary-foreground" />
                          </div>
                        )}
                        
                        <div className={`p-4 rounded-2xl shadow-sm break-words overflow-wrap-anywhere ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground ml-10' 
                            : 'bg-card border-2'
                        }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{renderFormattedText(message.content)}</p>
                        </div>
                        
                        {message.suggestions && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, idx) => {
                              const IconComponent = suggestion.icon;
                              const content = (
                                <Button
                                  key={idx}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => !suggestion.href && handleQuickAction(suggestion)}
                                  className="text-xs"
                                >
                                  <IconComponent className="h-3 w-3 mr-1" />
                                  {suggestion.label}
                                </Button>
                              );
                              
                              return suggestion.href ? (
                                <Link key={idx} to={suggestion.href}>
                                  {content}
                                </Link>
                              ) : content;
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md">
                        <Bot className="h-5 w-5 text-primary-foreground animate-pulse" />
                      </div>
                      <div className="bg-card border-2 p-4 rounded-2xl shadow-sm">
                        <div className="flex space-x-2">
                          <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"></div>
                          <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Auto-scroll anchor */}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              {/* Input Area */}
              <div className="border-t-2 pt-4">
                <div className="flex gap-3">
                  <Input
                    placeholder="Ask me about materials, costs, hiring, or project planning..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 h-12 text-base border-2 focus-visible:ring-2"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!inputMessage.trim() || isTyping}
                    size="lg"
                    className="px-6"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="lg" className="border-2">
                    <Mic className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <Card className="border-2 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Zap className="h-6 w-6 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action, idx) => {
                const IconComponent = action.icon;
                return (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-full justify-start h-12 border-2 hover:bg-primary hover:text-primary-foreground transition-all"
                    onClick={() => handleQuickAction(action)}
                  >
                    <IconComponent className="h-5 w-5 mr-3" />
                    {action.label}
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">AI Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                  <Calculator className="h-5 w-5 text-primary" />
                  <span className="font-medium">Material Calculations</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <span className="font-medium">Price Comparisons</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium">Expert Recommendations</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <span className="font-medium">Project Planning</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Recent Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <p className="text-muted-foreground">Cement deals - 10% off this week</p>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <p className="text-muted-foreground">Steel prices trending up - order soon</p>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <p className="text-muted-foreground">5 new verified contractors available</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;