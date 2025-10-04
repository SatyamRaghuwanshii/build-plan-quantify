import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Gavel, Clock, TrendingDown, Users, Plus, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface BidRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  budget: number | null;
  delivery_location: string;
  delivery_deadline: string | null;
  status: string;
  created_at: string;
  bid_count?: number;
  lowest_bid?: number;
}

interface Bid {
  id: string;
  price: number;
  delivery_time_days: number;
  notes: string;
  vendor_id: string;
  created_at: string;
  vendor_profiles: {
    company_name: string;
    rating: number;
  };
}

export const BiddingSystem = () => {
  const { toast } = useToast();
  const [bidRequests, setBidRequests] = useState<BidRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    category: "",
    quantity: "",
    unit: "",
    budget: "",
    delivery_location: "",
    delivery_deadline: ""
  });

  useEffect(() => {
    fetchBidRequests();
  }, []);

  useEffect(() => {
    if (selectedRequest) {
      fetchBidsForRequest(selectedRequest);
    }
  }, [selectedRequest]);

  const fetchBidRequests = async () => {
    const { data, error } = await supabase
      .from('bid_requests')
      .select(`
        *,
        bids(id, price)
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const requestsWithStats = data.map(req => ({
        ...req,
        bid_count: req.bids?.length || 0,
        lowest_bid: req.bids?.length ? Math.min(...req.bids.map((b: any) => b.price)) : null
      }));
      setBidRequests(requestsWithStats);
    }
  };

  const fetchBidsForRequest = async (requestId: string) => {
    const { data, error } = await supabase
      .from('bids')
      .select(`
        *,
        vendor_profiles(company_name, rating)
      `)
      .eq('bid_request_id', requestId)
      .order('price', { ascending: true });

    if (!error && data) {
      setBids(data as any);
    }
  };

  const handleCreateRequest = async () => {
    setIsLoading(true);
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
        .insert([{
          user_id: user.id,
          title: newRequest.title,
          description: newRequest.description,
          category: newRequest.category,
          quantity: parseFloat(newRequest.quantity),
          unit: newRequest.unit,
          budget: newRequest.budget ? parseFloat(newRequest.budget) : null,
          delivery_location: newRequest.delivery_location,
          delivery_deadline: newRequest.delivery_deadline || null
        }]);

      if (error) throw error;

      toast({
        title: "Bid Request Created",
        description: "Vendors can now submit bids for your request.",
      });
      
      setShowCreateDialog(false);
      setNewRequest({
        title: "",
        description: "",
        category: "",
        quantity: "",
        unit: "",
        budget: "",
        delivery_location: "",
        delivery_deadline: ""
      });
      fetchBidRequests();
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Live Bidding System</h2>
          <p className="text-muted-foreground">Post requests and receive competitive bids from verified vendors</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Bid Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Bid Request</DialogTitle>
              <DialogDescription>
                Describe what you need and let vendors compete for your business
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  placeholder="e.g., 500 bags of cement needed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={newRequest.category} onValueChange={(v) => setNewRequest({ ...newRequest, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cement">Cement</SelectItem>
                    <SelectItem value="steel">Steel</SelectItem>
                    <SelectItem value="bricks">Bricks</SelectItem>
                    <SelectItem value="paint">Paint</SelectItem>
                    <SelectItem value="flooring">Flooring</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newRequest.quantity}
                    onChange={(e) => setNewRequest({ ...newRequest, quantity: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Input
                    id="unit"
                    value={newRequest.unit}
                    onChange={(e) => setNewRequest({ ...newRequest, unit: e.target.value })}
                    placeholder="bags, kg, sqm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  placeholder="Provide details about quality requirements, delivery schedule, etc."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (Optional)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={newRequest.budget}
                    onChange={(e) => setNewRequest({ ...newRequest, budget: e.target.value })}
                    placeholder="5000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_deadline">Deadline (Optional)</Label>
                  <Input
                    id="delivery_deadline"
                    type="date"
                    value={newRequest.delivery_deadline}
                    onChange={(e) => setNewRequest({ ...newRequest, delivery_deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery_location">Delivery Location *</Label>
                <Input
                  id="delivery_location"
                  value={newRequest.delivery_location}
                  onChange={(e) => setNewRequest({ ...newRequest, delivery_location: e.target.value })}
                  placeholder="City, State or full address"
                />
              </div>

              <Button 
                onClick={handleCreateRequest} 
                className="w-full"
                disabled={isLoading || !newRequest.title || !newRequest.category || !newRequest.quantity || !newRequest.unit || !newRequest.description || !newRequest.delivery_location}
              >
                {isLoading ? "Creating..." : "Post Bid Request"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bid Requests List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Active Requests</h3>
          <div className="space-y-3">
            {bidRequests.map((request) => (
              <Card 
                key={request.id} 
                className={`cursor-pointer transition-all ${
                  selectedRequest === request.id 
                    ? 'ring-2 ring-primary shadow-lg' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedRequest(request.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-1">{request.title}</CardTitle>
                    <Badge variant="secondary">
                      {request.category}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {request.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-semibold">{request.quantity} {request.unit}</span>
                    </div>
                    {request.budget && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Budget:</span>
                        <span className="font-semibold">${request.budget.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-4 pt-2 border-t">
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-4 w-4 text-primary" />
                        <span>{request.bid_count} bids</span>
                      </div>
                      {request.lowest_bid && (
                        <div className="flex items-center gap-1 text-sm">
                          <TrendingDown className="h-4 w-4 text-green-600" />
                          <span>from ${request.lowest_bid}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-sm ml-auto">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {bidRequests.length === 0 && (
              <Card className="text-center py-12">
                <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No active bid requests yet</p>
                <p className="text-sm text-muted-foreground">Create one to get started</p>
              </Card>
            )}
          </div>
        </div>

        {/* Bids for Selected Request */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">
            {selectedRequest ? "Received Bids" : "Select a Request"}
          </h3>
          
          {selectedRequest ? (
            <div className="space-y-3">
              {bids.map((bid, index) => (
                <Card key={bid.id} className="card-elevated">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold">{bid.vendor_profiles.company_name}</div>
                        <div className="flex items-center gap-1 text-sm">
                          <span>⭐</span>
                          <span>{bid.vendor_profiles.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      {index === 0 && (
                        <Badge className="bg-green-600">Lowest Bid</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Bid Amount:</span>
                        <span className="text-2xl font-bold text-primary">${bid.price.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Delivery:</span>
                        <span className="font-semibold">{bid.delivery_time_days} days</span>
                      </div>
                      {bid.notes && (
                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground">{bid.notes}</p>
                        </div>
                      )}
                      <div className="pt-2">
                        <Button size="sm" className="w-full">
                          <Send className="h-4 w-4 mr-2" />
                          Accept Bid
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {bids.length === 0 && (
                <Card className="text-center py-12">
                  <p className="text-muted-foreground">No bids submitted yet</p>
                  <p className="text-sm text-muted-foreground">Vendors will be notified of this request</p>
                </Card>
              )}
            </div>
          ) : (
            <Card className="text-center py-12">
              <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Select a bid request to view bids</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};