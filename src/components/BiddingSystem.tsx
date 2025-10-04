import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Gavel, 
  Plus, 
  Clock, 
  DollarSign, 
  MapPin, 
  Calendar,
  TrendingDown,
  Users,
  Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface BidRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  budget: number;
  delivery_location: string;
  delivery_deadline: string;
  status: string;
  created_at: string;
  bid_count?: number;
  lowest_bid?: number;
}

export const BiddingSystem = () => {
  const { toast } = useToast();
  const [bidRequests, setBidRequests] = useState<BidRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "cement",
    quantity: "",
    unit: "bags",
    budget: "",
    deliveryLocation: "",
    deliveryDeadline: "",
  });

  useEffect(() => {
    fetchBidRequests();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('bid_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bid_requests'
        },
        () => {
          fetchBidRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBidRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('bid_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch bid counts for each request
      const requestsWithCounts = await Promise.all(
        (data || []).map(async (request) => {
          const { count } = await supabase
            .from('bids')
            .select('*', { count: 'exact', head: true })
            .eq('bid_request_id', request.id);

          const { data: bids } = await supabase
            .from('bids')
            .select('price')
            .eq('bid_request_id', request.id)
            .order('price', { ascending: true })
            .limit(1);

          return {
            ...request,
            bid_count: count || 0,
            lowest_bid: bids?.[0]?.price
          };
        })
      );

      setBidRequests(requestsWithCounts);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to create a bid request.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('bid_requests')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          delivery_location: formData.deliveryLocation,
          delivery_deadline: formData.deliveryDeadline || null,
        });

      if (error) throw error;

      toast({
        title: "Bid Request Created",
        description: "Vendors can now submit bids for your request.",
      });

      setIsDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        category: "cement",
        quantity: "",
        unit: "bags",
        budget: "",
        deliveryLocation: "",
        deliveryDeadline: "",
      });
      fetchBidRequests();
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'closed': return 'secondary';
      case 'awarded': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Live Bidding System</h2>
          <p className="text-muted-foreground">Request quotes and get competitive bids from vendors</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Bid Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Bid Request</DialogTitle>
              <DialogDescription>
                Describe what you need and vendors will compete with their best offers
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Request Title *</Label>
                <Input
                  id="title"
                  required
                  placeholder="e.g., Need 100 bags of cement for residential project"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  required
                  placeholder="Provide detailed requirements..."
                  className="min-h-24"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cement">Cement</SelectItem>
                      <SelectItem value="steel">Steel</SelectItem>
                      <SelectItem value="bricks">Bricks</SelectItem>
                      <SelectItem value="paint">Paint</SelectItem>
                      <SelectItem value="flooring">Flooring</SelectItem>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bags">Bags</SelectItem>
                      <SelectItem value="kg">Kilograms</SelectItem>
                      <SelectItem value="tons">Tons</SelectItem>
                      <SelectItem value="sqm">Square Meters</SelectItem>
                      <SelectItem value="units">Units</SelectItem>
                      <SelectItem value="gallons">Gallons</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (Optional)</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    placeholder="Enter your budget"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryLocation">Delivery Location *</Label>
                  <Input
                    id="deliveryLocation"
                    required
                    placeholder="City, State"
                    value={formData.deliveryLocation}
                    onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryDeadline">Delivery Deadline (Optional)</Label>
                  <Input
                    id="deliveryDeadline"
                    type="date"
                    value={formData.deliveryDeadline}
                    onChange={(e) => setFormData({ ...formData, deliveryDeadline: e.target.value })}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Gavel className="h-4 w-4 mr-2" />
                    Create Bid Request
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bidRequests.map((request) => (
          <Card key={request.id} className="card-elevated transition-smooth hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-2">
                <Badge variant={getStatusColor(request.status)}>
                  {request.status.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {request.bid_count} bids
                </Badge>
              </div>
              <CardTitle className="text-lg line-clamp-2">{request.title}</CardTitle>
              <CardDescription className="line-clamp-2">{request.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-semibold">{request.quantity} {request.unit}</span>
                </div>
                
                {request.budget && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="font-semibold text-primary">${request.budget.toLocaleString()}</span>
                  </div>
                )}

                {request.lowest_bid && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingDown className="h-3 w-3 text-green-500" />
                      Lowest Bid:
                    </span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      ${request.lowest_bid.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {request.delivery_location}
                </div>

                {request.delivery_deadline && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Deadline: {new Date(request.delivery_deadline).toLocaleDateString()}
                  </div>
                )}

                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Posted {new Date(request.created_at).toLocaleDateString()}
                </div>
              </div>

              <Button className="w-full" variant="outline" size="sm">
                <Gavel className="h-4 w-4 mr-2" />
                View Bids
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {bidRequests.length === 0 && (
        <div className="text-center py-12">
          <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Active Bid Requests</h3>
          <p className="text-muted-foreground mb-4">
            Create your first bid request to start receiving competitive quotes
          </p>
        </div>
      )}
    </div>
  );
};