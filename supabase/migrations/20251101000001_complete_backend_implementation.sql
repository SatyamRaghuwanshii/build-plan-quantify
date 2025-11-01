-- Complete Backend Implementation Migration
-- This migration adds storage buckets, new tables, functions, triggers, and RLS policies
-- for the complete construction management backend

-- ============================================================================
-- PART 1: STORAGE BUCKETS
-- ============================================================================

-- Create floor-plans bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'floor-plans',
  'floor-plans',
  false,
  10485760, -- 10MB
  ARRAY['image/png', 'image/jpeg', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Create bim-models bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bim-models',
  'bim-models',
  false,
  104857600, -- 100MB
  ARRAY['application/octet-stream', 'application/x-step', 'model/ifc']
) ON CONFLICT (id) DO NOTHING;

-- Create vendor-assets bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vendor-assets',
  'vendor-assets',
  false,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Create project-documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-documents',
  'project-documents',
  false,
  20971520, -- 20MB
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PART 2: STORAGE RLS POLICIES
-- ============================================================================

-- Floor-plans bucket policies (project members only)
CREATE POLICY "Project members can read floor plans"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'floor-plans' AND
  auth.uid() IN (
    SELECT pm.user_id FROM project_members pm
    WHERE pm.project_id = (storage.objects.path_tokens[1])::uuid
  )
);

CREATE POLICY "Project members can upload floor plans"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'floor-plans' AND
  auth.uid() IN (
    SELECT pm.user_id FROM project_members pm
    WHERE pm.project_id = (storage.objects.path_tokens[1])::uuid
    UNION
    SELECT p.owner_id FROM projects p
    WHERE p.id = (storage.objects.path_tokens[1])::uuid
  )
);

CREATE POLICY "Project members can update floor plans"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'floor-plans' AND
  auth.uid() IN (
    SELECT pm.user_id FROM project_members pm
    WHERE pm.project_id = (storage.objects.path_tokens[1])::uuid
    UNION
    SELECT p.owner_id FROM projects p
    WHERE p.id = (storage.objects.path_tokens[1])::uuid
  )
);

CREATE POLICY "Project members can delete floor plans"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'floor-plans' AND
  auth.uid() IN (
    SELECT pm.user_id FROM project_members pm
    WHERE pm.project_id = (storage.objects.path_tokens[1])::uuid
    UNION
    SELECT p.owner_id FROM projects p
    WHERE p.id = (storage.objects.path_tokens[1])::uuid
  )
);

-- BIM-models bucket policies (project members only)
CREATE POLICY "Project members can read BIM models"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'bim-models' AND
  auth.uid() IN (
    SELECT pm.user_id FROM project_members pm
    WHERE pm.project_id = (storage.objects.path_tokens[1])::uuid
  )
);

CREATE POLICY "Project members can upload BIM models"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'bim-models' AND
  auth.uid() IN (
    SELECT pm.user_id FROM project_members pm
    WHERE pm.project_id = (storage.objects.path_tokens[1])::uuid
    UNION
    SELECT p.owner_id FROM projects p
    WHERE p.id = (storage.objects.path_tokens[1])::uuid
  )
);

CREATE POLICY "Project members can update BIM models"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'bim-models' AND
  auth.uid() IN (
    SELECT pm.user_id FROM project_members pm
    WHERE pm.project_id = (storage.objects.path_tokens[1])::uuid
    UNION
    SELECT p.owner_id FROM projects p
    WHERE p.id = (storage.objects.path_tokens[1])::uuid
  )
);

CREATE POLICY "Project members can delete BIM models"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'bim-models' AND
  auth.uid() IN (
    SELECT pm.user_id FROM project_members pm
    WHERE pm.project_id = (storage.objects.path_tokens[1])::uuid
    UNION
    SELECT p.owner_id FROM projects p
    WHERE p.id = (storage.objects.path_tokens[1])::uuid
  )
);

-- Vendor-assets bucket policies (public read for /public/, vendor write)
CREATE POLICY "Anyone can read public vendor assets"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'vendor-assets' AND
  (storage.objects.path_tokens[1] = 'public')
);

CREATE POLICY "Vendors can read their private assets"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'vendor-assets' AND
  storage.objects.path_tokens[1] = 'private' AND
  auth.uid() IN (
    SELECT vp.user_id FROM vendor_profiles vp
    WHERE vp.id = (storage.objects.path_tokens[2])::uuid
  )
);

CREATE POLICY "Vendors can upload their assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vendor-assets' AND
  auth.uid() IN (
    SELECT vp.user_id FROM vendor_profiles vp
  )
);

CREATE POLICY "Vendors can update their assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'vendor-assets' AND
  auth.uid() IN (
    SELECT vp.user_id FROM vendor_profiles vp
    WHERE vp.id = (storage.objects.path_tokens[2])::uuid
  )
);

CREATE POLICY "Vendors can delete their assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vendor-assets' AND
  auth.uid() IN (
    SELECT vp.user_id FROM vendor_profiles vp
    WHERE vp.id = (storage.objects.path_tokens[2])::uuid
  )
);

-- Project-documents bucket policies (project members only)
CREATE POLICY "Project members can read project documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-documents' AND
  auth.uid() IN (
    SELECT pm.user_id FROM project_members pm
    WHERE pm.project_id = (storage.objects.path_tokens[1])::uuid
  )
);

CREATE POLICY "Project members can upload project documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-documents' AND
  auth.uid() IN (
    SELECT pm.user_id FROM project_members pm
    WHERE pm.project_id = (storage.objects.path_tokens[1])::uuid
    UNION
    SELECT p.owner_id FROM projects p
    WHERE p.id = (storage.objects.path_tokens[1])::uuid
  )
);

CREATE POLICY "Project members can update project documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-documents' AND
  auth.uid() IN (
    SELECT pm.user_id FROM project_members pm
    WHERE pm.project_id = (storage.objects.path_tokens[1])::uuid
    UNION
    SELECT p.owner_id FROM projects p
    WHERE p.id = (storage.objects.path_tokens[1])::uuid
  )
);

CREATE POLICY "Project members can delete project documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-documents' AND
  auth.uid() IN (
    SELECT pm.user_id FROM project_members pm
    WHERE pm.project_id = (storage.objects.path_tokens[1])::uuid
    UNION
    SELECT p.owner_id FROM projects p
    WHERE p.id = (storage.objects.path_tokens[1])::uuid
  )
);

-- ============================================================================
-- PART 3: TABLE MODIFICATIONS
-- ============================================================================

-- Add URL columns to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS primary_floor_plan_url text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS primary_bim_model_url text;

-- Add project_id to bid_requests table
ALTER TABLE public.bid_requests ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS bid_requests_project_id_idx ON public.bid_requests(project_id);

-- Add search vector to vendor_products table
ALTER TABLE public.vendor_products ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED;

CREATE INDEX IF NOT EXISTS vendor_products_search_idx ON public.vendor_products USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS vendor_products_category_idx ON public.vendor_products (category);
CREATE INDEX IF NOT EXISTS vendor_products_price_idx ON public.vendor_products (base_price);

-- ============================================================================
-- PART 4: NEW TABLES
-- ============================================================================

-- File uploads table
CREATE TABLE IF NOT EXISTS public.file_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  bucket_name text NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN ('project', 'vendor_product', 'vendor_profile', 'bid_request')),
  entity_id uuid NOT NULL,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS file_uploads_entity_idx ON public.file_uploads (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS file_uploads_uploaded_by_idx ON public.file_uploads (uploaded_by);
CREATE INDEX IF NOT EXISTS file_uploads_bucket_idx ON public.file_uploads (bucket_name);

-- User preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  realtime_notifications text DEFAULT 'important' CHECK (realtime_notifications IN ('all', 'important', 'silent', 'disabled')),
  email_notifications boolean DEFAULT true,
  email_bidding_updates boolean DEFAULT true,
  email_task_updates boolean DEFAULT true,
  email_project_updates boolean DEFAULT true,
  sound_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON public.user_preferences (user_id);

-- Project costs table
CREATE TABLE IF NOT EXISTS public.project_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('materials', 'labor', 'equipment', 'permits', 'other')),
  description text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  bid_id uuid REFERENCES public.bids(id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_costs_project_id_idx ON public.project_costs (project_id);
CREATE INDEX IF NOT EXISTS project_costs_category_idx ON public.project_costs (category);
CREATE INDEX IF NOT EXISTS project_costs_bid_id_idx ON public.project_costs (bid_id);

-- BIM models table
CREATE TABLE IF NOT EXISTS public.bim_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  file_size bigint NOT NULL,
  ifc_schema text,
  project_name text,
  element_count int DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bim_models_project_id_idx ON public.bim_models (project_id);
CREATE INDEX IF NOT EXISTS bim_models_uploaded_by_idx ON public.bim_models (uploaded_by);

-- BIM elements table
CREATE TABLE IF NOT EXISTS public.bim_elements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bim_model_id uuid NOT NULL REFERENCES public.bim_models(id) ON DELETE CASCADE,
  ifc_id text NOT NULL,
  element_type text NOT NULL,
  element_name text,
  material_type text,
  volume numeric,
  area numeric,
  length numeric,
  properties jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bim_elements_model_id_idx ON public.bim_elements (bim_model_id);
CREATE INDEX IF NOT EXISTS bim_elements_type_idx ON public.bim_elements (element_type);
CREATE INDEX IF NOT EXISTS bim_elements_material_idx ON public.bim_elements (material_type);

-- ============================================================================
-- PART 5: RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bim_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bim_elements ENABLE ROW LEVEL SECURITY;

-- File uploads policies
CREATE POLICY "Users can read their accessible files" ON public.file_uploads
FOR SELECT USING (
  CASE entity_type
    WHEN 'project' THEN EXISTS (
      SELECT 1 FROM project_members pm WHERE pm.project_id = entity_id AND pm.user_id = auth.uid()
      UNION
      SELECT 1 FROM projects p WHERE p.id = entity_id AND p.owner_id = auth.uid()
    )
    WHEN 'vendor_product' THEN EXISTS (
      SELECT 1 FROM vendor_products vp
      JOIN vendor_profiles vpr ON vp.vendor_id = vpr.id
      WHERE vp.id = file_uploads.entity_id AND vpr.user_id = auth.uid()
    )
    WHEN 'vendor_profile' THEN EXISTS (
      SELECT 1 FROM vendor_profiles
      WHERE id = file_uploads.entity_id AND user_id = auth.uid()
    )
    WHEN 'bid_request' THEN EXISTS (
      SELECT 1 FROM bid_requests br
      WHERE br.id = file_uploads.entity_id AND br.user_id = auth.uid()
    )
    ELSE false
  END
  OR storage_path LIKE 'vendor-assets/public/%'
);

CREATE POLICY "Users can upload files for their entities" ON public.file_uploads
FOR INSERT WITH CHECK (
  uploaded_by = auth.uid() AND
  CASE entity_type
    WHEN 'project' THEN EXISTS (
      SELECT 1 FROM project_members pm WHERE pm.project_id = entity_id AND pm.user_id = auth.uid()
      UNION
      SELECT 1 FROM projects p WHERE p.id = entity_id AND p.owner_id = auth.uid()
    )
    WHEN 'vendor_product' THEN EXISTS (
      SELECT 1 FROM vendor_products vp
      JOIN vendor_profiles vpr ON vp.vendor_id = vpr.id
      WHERE vp.id = entity_id AND vpr.user_id = auth.uid()
    )
    WHEN 'vendor_profile' THEN EXISTS (
      SELECT 1 FROM vendor_profiles WHERE id = entity_id AND user_id = auth.uid()
    )
    WHEN 'bid_request' THEN EXISTS (
      SELECT 1 FROM bid_requests WHERE id = entity_id AND user_id = auth.uid()
    )
    ELSE false
  END
);

CREATE POLICY "Users can delete their files" ON public.file_uploads
FOR DELETE USING (
  uploaded_by = auth.uid()
  OR (entity_type = 'project' AND EXISTS (
    SELECT 1 FROM projects WHERE id = entity_id AND owner_id = auth.uid()
  ))
  OR (entity_type IN ('vendor_product', 'vendor_profile') AND EXISTS (
    SELECT 1 FROM vendor_profiles WHERE id = entity_id AND user_id = auth.uid()
  ))
);

-- User preferences policies
CREATE POLICY "Users can read their own preferences" ON public.user_preferences
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
FOR UPDATE USING (user_id = auth.uid());

-- Project costs policies
CREATE POLICY "Project members can read costs" ON public.project_costs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM project_members pm WHERE pm.project_id = project_costs.project_id AND pm.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM projects p WHERE p.id = project_costs.project_id AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Project members can add costs" ON public.project_costs
FOR INSERT WITH CHECK (
  created_by = auth.uid() AND
  (
    EXISTS (
      SELECT 1 FROM project_members pm WHERE pm.project_id = project_costs.project_id AND pm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM projects p WHERE p.id = project_costs.project_id AND p.owner_id = auth.uid()
    )
  )
);

CREATE POLICY "Project members can update costs" ON public.project_costs
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM project_members pm WHERE pm.project_id = project_costs.project_id AND pm.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM projects p WHERE p.id = project_costs.project_id AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Project owners can delete costs" ON public.project_costs
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM projects p WHERE p.id = project_costs.project_id AND p.owner_id = auth.uid()
  )
);

-- BIM models policies
CREATE POLICY "Project members can read BIM models" ON public.bim_models
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM project_members pm WHERE pm.project_id = bim_models.project_id AND pm.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM projects p WHERE p.id = bim_models.project_id AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Project members can upload BIM models" ON public.bim_models
FOR INSERT WITH CHECK (
  uploaded_by = auth.uid() AND
  (
    EXISTS (
      SELECT 1 FROM project_members pm WHERE pm.project_id = bim_models.project_id AND pm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM projects p WHERE p.id = bim_models.project_id AND p.owner_id = auth.uid()
    )
  )
);

CREATE POLICY "Project owners can delete BIM models" ON public.bim_models
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM projects p WHERE p.id = bim_models.project_id AND p.owner_id = auth.uid()
  )
);

-- BIM elements policies
CREATE POLICY "Project members can read BIM elements" ON public.bim_elements
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM bim_models bm
    JOIN project_members pm ON bm.project_id = pm.project_id
    WHERE bm.id = bim_elements.bim_model_id AND pm.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM bim_models bm
    JOIN projects p ON bm.project_id = p.id
    WHERE bm.id = bim_elements.bim_model_id AND p.owner_id = auth.uid()
  )
);

-- ============================================================================
-- PART 6: DATABASE FUNCTIONS
-- ============================================================================

-- Function: Search vendor products with filters and sorting
CREATE OR REPLACE FUNCTION public.search_vendor_products(
  search_query text DEFAULT NULL,
  categories text[] DEFAULT NULL,
  min_price numeric DEFAULT NULL,
  max_price numeric DEFAULT NULL,
  min_rating numeric DEFAULT NULL,
  in_stock_only boolean DEFAULT false,
  vendor_city text DEFAULT NULL,
  vendor_state text DEFAULT NULL,
  sort_by text DEFAULT 'relevance',
  limit_count int DEFAULT 50,
  offset_count int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  category text,
  base_price numeric,
  unit text,
  stock_quantity int,
  image_url text,
  vendor_id uuid,
  vendor_name text,
  vendor_rating numeric,
  vendor_city text,
  vendor_state text,
  search_rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    vp.id,
    vp.name,
    vp.description,
    vp.category,
    vp.base_price,
    vp.unit,
    vp.stock_quantity,
    vp.image_url,
    vp.vendor_id,
    vpr.company_name as vendor_name,
    vpr.rating as vendor_rating,
    vpr.city as vendor_city,
    vpr.state as vendor_state,
    CASE
      WHEN search_query IS NOT NULL THEN
        ts_rank(vp.search_vector, plainto_tsquery('english', search_query))
      ELSE 0
    END as search_rank
  FROM vendor_products vp
  JOIN vendor_profiles vpr ON vp.vendor_id = vpr.id
  WHERE
    (search_query IS NULL OR vp.search_vector @@ plainto_tsquery('english', search_query))
    AND (categories IS NULL OR vp.category = ANY(categories))
    AND (min_price IS NULL OR vp.base_price >= min_price)
    AND (max_price IS NULL OR vp.base_price <= max_price)
    AND (min_rating IS NULL OR vpr.rating >= min_rating)
    AND (NOT in_stock_only OR vp.stock_quantity > 0)
    AND (vendor_city IS NULL OR vpr.city ILIKE vendor_city)
    AND (vendor_state IS NULL OR vpr.state ILIKE vendor_state)
  ORDER BY
    CASE
      WHEN sort_by = 'relevance' AND search_query IS NOT NULL THEN
        ts_rank(vp.search_vector, plainto_tsquery('english', search_query))
      ELSE NULL
    END DESC NULLS LAST,
    CASE WHEN sort_by = 'price_asc' THEN vp.base_price END ASC NULLS LAST,
    CASE WHEN sort_by = 'price_desc' THEN vp.base_price END DESC NULLS LAST,
    CASE WHEN sort_by = 'rating_desc' THEN vpr.rating END DESC NULLS LAST,
    CASE WHEN sort_by = 'newest' THEN vp.created_at END DESC NULLS LAST,
    vp.name ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function: Calculate project total cost
CREATE OR REPLACE FUNCTION public.calculate_project_total_cost(project_id_param uuid)
RETURNS numeric AS $$
DECLARE
  total numeric;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total
  FROM public.project_costs
  WHERE project_id = project_id_param;

  UPDATE public.projects
  SET total_cost = total, updated_at = now()
  WHERE id = project_id_param;

  RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get project cost breakdown by category
CREATE OR REPLACE FUNCTION public.get_project_cost_breakdown(project_id_param uuid)
RETURNS TABLE (
  category text,
  total_amount numeric,
  cost_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pc.category,
    COALESCE(SUM(pc.amount), 0) as total_amount,
    COUNT(*) as cost_count
  FROM public.project_costs pc
  WHERE pc.project_id = project_id_param
  GROUP BY pc.category
  ORDER BY total_amount DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function: Get BIM quantities summary
CREATE OR REPLACE FUNCTION public.get_bim_quantities_summary(bim_model_id_param uuid)
RETURNS TABLE (
  element_type text,
  material_type text,
  total_volume numeric,
  total_area numeric,
  total_length numeric,
  element_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    be.element_type,
    be.material_type,
    COALESCE(SUM(be.volume), 0) as total_volume,
    COALESCE(SUM(be.area), 0) as total_area,
    COALESCE(SUM(be.length), 0) as total_length,
    COUNT(*) as element_count
  FROM public.bim_elements be
  WHERE be.bim_model_id = bim_model_id_param
  GROUP BY be.element_type, be.material_type
  ORDER BY element_count DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- PART 7: DATABASE TRIGGERS
-- ============================================================================

-- Trigger function: Handle accepted bids and create project costs
CREATE OR REPLACE FUNCTION public.handle_accepted_bid()
RETURNS TRIGGER AS $$
DECLARE
  bid_req RECORD;
  cost_category TEXT;
  proj_id uuid;
BEGIN
  -- Only proceed if status changed to accepted
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    -- Get bid request details
    SELECT * INTO bid_req FROM public.bid_requests WHERE id = NEW.bid_request_id;

    -- Get project_id from bid_request
    proj_id := bid_req.project_id;

    -- Only proceed if bid_request is linked to a project
    IF proj_id IS NOT NULL THEN
      -- Determine category from bid_request.category
      IF bid_req.category ~* '(material|cement|steel|brick|concrete|wood|sand|gravel)' THEN
        cost_category := 'materials';
      ELSIF bid_req.category ~* '(labor|worker|contractor|service|installation)' THEN
        cost_category := 'labor';
      ELSIF bid_req.category ~* '(equipment|machinery|rental|tool)' THEN
        cost_category := 'equipment';
      ELSIF bid_req.category ~* '(permit|license|inspection|approval)' THEN
        cost_category := 'permits';
      ELSE
        cost_category := 'other';
      END IF;

      -- Create project_cost entry
      INSERT INTO public.project_costs (
        project_id,
        category,
        description,
        amount,
        bid_id,
        created_by
      )
      VALUES (
        proj_id,
        cost_category,
        COALESCE(bid_req.title, 'Bid') || ' - ' || COALESCE(bid_req.description, ''),
        NEW.price,
        NEW.id,
        bid_req.user_id
      );

      -- Update project total cost
      PERFORM public.calculate_project_total_cost(proj_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for accepted bids
DROP TRIGGER IF EXISTS bid_accepted_trigger ON public.bids;
CREATE TRIGGER bid_accepted_trigger
AFTER UPDATE ON public.bids
FOR EACH ROW
EXECUTE FUNCTION public.handle_accepted_bid();

-- Trigger function: Recalculate project total when costs change
CREATE OR REPLACE FUNCTION public.recalculate_project_total()
RETURNS TRIGGER AS $$
BEGIN
  -- For INSERT and UPDATE, use NEW.project_id
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    PERFORM public.calculate_project_total_cost(NEW.project_id);
  -- For DELETE, use OLD.project_id
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM public.calculate_project_total_cost(OLD.project_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for project_costs changes
DROP TRIGGER IF EXISTS project_costs_change_trigger ON public.project_costs;
CREATE TRIGGER project_costs_change_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.project_costs
FOR EACH ROW
EXECUTE FUNCTION public.recalculate_project_total();

-- Trigger function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to new tables
DROP TRIGGER IF EXISTS update_file_uploads_updated_at ON public.file_uploads;
CREATE TRIGGER update_file_uploads_updated_at
BEFORE UPDATE ON public.file_uploads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_costs_updated_at ON public.project_costs;
CREATE TRIGGER update_project_costs_updated_at
BEFORE UPDATE ON public.project_costs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_bim_models_updated_at ON public.bim_models;
CREATE TRIGGER update_bim_models_updated_at
BEFORE UPDATE ON public.bim_models
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
