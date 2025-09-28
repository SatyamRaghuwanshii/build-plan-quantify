import { useState } from "react";
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

  const quickActions: QuickAction[] = [
    { label: "Calculate Again", action: "calculate", icon: Calculator },
    { label: "Best Deals", action: "deals", icon: ShoppingCart },
    { label: "Hire Experts", action: "hire", icon: Users },
    { label: "Get Ideas", action: "ideas", icon: Lightbulb }
  ];

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
      // Call the Supabase edge function
      const response = await fetch('https://krwahbbojypmjuzklovh.supabase.co/functions/v1/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const aiResponse: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        suggestions: generateSuggestions(inputMessage)
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
    <div className="container px-4 py-8 mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Bot className="h-6 w-6 text-primary-foreground" />
          </div>
          AI Construction Assistant
        </h1>
        <p className="text-lg text-muted-foreground">
          Get intelligent recommendations for materials, pricing, hiring, and project planning
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="card-elevated h-[600px] flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Chat with AI Assistant
              </CardTitle>
              <CardDescription>
                Ask questions about materials, costs, hiring, or project planning
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              {/* Messages Area */}
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mb-2">
                            <Bot className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                        
                        <div className={`p-3 rounded-lg ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground ml-8' 
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm">{message.content}</p>
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
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-75"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-150"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              {/* Input Area */}
              <div className="border-t pt-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask me about materials, costs, hiring, or project planning..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, idx) => {
                const IconComponent = action.icon;
                return (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleQuickAction(action)}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {action.label}
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg">AI Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Badge variant="secondary" className="w-full justify-start">
                  <Calculator className="h-3 w-3 mr-2" />
                  Material Calculations
                </Badge>
                <Badge variant="secondary" className="w-full justify-start">
                  <ShoppingCart className="h-3 w-3 mr-2" />
                  Price Comparisons
                </Badge>
                <Badge variant="secondary" className="w-full justify-start">
                  <Users className="h-3 w-3 mr-2" />
                  Expert Recommendations  
                </Badge>
                <Badge variant="secondary" className="w-full justify-start">
                  <Lightbulb className="h-3 w-3 mr-2" />
                  Project Planning
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg">Recent Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">• Check cement deals - 10% off this week</p>
              <p className="text-muted-foreground">• Steel prices trending up - order soon</p>
              <p className="text-muted-foreground">• 5 new verified contractors available</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;