-- Create vendor_profiles table
CREATE TABLE public.vendor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  business_license TEXT,
  tax_id TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendor_products table
CREATE TABLE public.vendor_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  min_order_quantity INTEGER DEFAULT 1,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bid_requests table
CREATE TABLE public.bid_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  budget DECIMAL(10,2),
  delivery_location TEXT NOT NULL,
  delivery_deadline TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'awarded', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bids table
CREATE TABLE public.bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bid_request_id UUID NOT NULL REFERENCES public.bid_requests(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  delivery_time_days INTEGER NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bid_request_id, vendor_id)
);

-- Enable Row Level Security
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor_profiles
CREATE POLICY "Vendor profiles are viewable by everyone"
ON public.vendor_profiles FOR SELECT
USING (true);

CREATE POLICY "Users can create their own vendor profile"
ON public.vendor_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendor profile"
ON public.vendor_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for vendor_products
CREATE POLICY "Vendor products are viewable by everyone"
ON public.vendor_products FOR SELECT
USING (true);

CREATE POLICY "Vendors can create their own products"
ON public.vendor_products FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vendor_profiles
    WHERE id = vendor_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Vendors can update their own products"
ON public.vendor_products FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.vendor_profiles
    WHERE id = vendor_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Vendors can delete their own products"
ON public.vendor_products FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.vendor_profiles
    WHERE id = vendor_id AND user_id = auth.uid()
  )
);

-- RLS Policies for bid_requests
CREATE POLICY "Bid requests are viewable by everyone"
ON public.bid_requests FOR SELECT
USING (true);

CREATE POLICY "Users can create their own bid requests"
ON public.bid_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bid requests"
ON public.bid_requests FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for bids
CREATE POLICY "Bids are viewable by request owner and bid vendor"
ON public.bids FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bid_requests
    WHERE id = bid_request_id AND user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.vendor_profiles
    WHERE id = vendor_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Vendors can create bids"
ON public.bids FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vendor_profiles
    WHERE id = vendor_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Vendors can update their own bids"
ON public.bids FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.vendor_profiles
    WHERE id = vendor_id AND user_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_vendor_profiles_updated_at
BEFORE UPDATE ON public.vendor_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_products_updated_at
BEFORE UPDATE ON public.vendor_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bid_requests_updated_at
BEFORE UPDATE ON public.bid_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bids_updated_at
BEFORE UPDATE ON public.bids
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();