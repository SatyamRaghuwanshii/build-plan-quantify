# Backend Implementation Guide

Complete backend implementation for the Build Plan Quantify construction management application.

## Overview

This implementation adds:
- **4 Storage Buckets** with RLS policies for file management
- **5 New Database Tables** for files, preferences, costs, and BIM data
- **4 Database Functions** for search, cost calculations, and BIM queries
- **Database Triggers** for automatic cost calculations and notifications
- **2 New Edge Functions** for email notifications and IFC processing
- **Real-Time Subscriptions** setup for live updates

---

## 1. Database Migration

### Running the Migration

The main migration file is: `migrations/20251101000001_complete_backend_implementation.sql`

To apply the migration:

```bash
# Using Supabase CLI
supabase db reset  # Reset and apply all migrations
# OR
supabase migration up  # Apply pending migrations only
```

### What the Migration Creates

#### Storage Buckets (4)
- **floor-plans** - Floor plan images (10MB max, PNG/JPG/PDF)
- **bim-models** - IFC/BIM files (100MB max)
- **vendor-assets** - Vendor logos, product images, documents (5MB max)
- **project-documents** - Project docs, photos, reports (20MB max)

#### New Tables (5)
1. **file_uploads** - Track all uploaded files with metadata
2. **user_preferences** - User notification and display preferences
3. **project_costs** - Detailed project cost tracking by category
4. **bim_models** - BIM/IFC file metadata
5. **bim_elements** - Individual IFC elements with quantities

#### Modified Tables
- **projects** - Added `primary_floor_plan_url`, `primary_bim_model_url`
- **vendor_products** - Added `search_vector` (tsvector) for full-text search
- **bid_requests** - Added `project_id` to link bid requests to projects

#### Database Functions (4)
1. **search_vendor_products()** - Full-text search with filters
2. **calculate_project_total_cost()** - Auto-calculate project totals
3. **get_project_cost_breakdown()** - Cost summary by category
4. **get_bim_quantities_summary()** - BIM quantity takeoff aggregation

#### Database Triggers (3)
1. **bid_accepted_trigger** - Auto-create project_costs when bid accepted
2. **project_costs_change_trigger** - Recalculate project total when costs change
3. **updated_at triggers** - Auto-update timestamps on all tables

---

## 2. Edge Functions

### Deploying Edge Functions

```bash
# Deploy all Edge Functions
supabase functions deploy send-notification-email
supabase functions deploy process-ifc-file

# Verify existing functions
supabase functions deploy ai-chat
supabase functions deploy generate-floor-plan
supabase functions deploy convert-to-3d
```

### Environment Variables

Set the following environment variables in your Supabase project:

```bash
# Required for all Edge Functions
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Required for AI functions (existing)
LOVABLE_API_KEY=your_lovable_api_key

# Optional: For production email sending (Resend, SendGrid, etc.)
RESEND_API_KEY=your_resend_api_key
# OR
SENDGRID_API_KEY=your_sendgrid_api_key
```

To set environment variables:

```bash
supabase secrets set RESEND_API_KEY=your_key_here
```

### send-notification-email Function

**Purpose:** Handle all email notifications based on database events and user preferences.

**Triggered by:** Database webhooks (see section 3)

**Input:**
```typescript
{
  type: 'INSERT' | 'UPDATE' | 'DELETE',
  table: 'bids' | 'tasks' | 'project_members',
  record: { ... },  // New record
  old_record: { ... }  // Old record (for UPDATE)
}
```

**Events Handled:**
- `bid_received` - New bid on user's bid request
- `task_assigned` - Task assigned to user
- `task_reassigned` - Task reassigned to user
- `project_member_added` - User added to project

**Email Service Integration:**

The function is set up to log emails but needs a real email service for production. Uncomment and configure one of these services:

- **Resend** (recommended): Uncomment the Resend section in the code
- **SendGrid**: Add SendGrid integration code
- **AWS SES**: Add AWS SES integration code

### process-ifc-file Function

**Purpose:** Extract metadata and element data from uploaded IFC/BIM files.

**Called by:** Frontend after IFC file upload

**Input:**
```typescript
{
  storage_path: string,  // Path in bim-models bucket
  project_id: uuid,      // Project ID
  file_name: string      // Original filename
}
```

**Output:**
```typescript
{
  success: true,
  bim_model_id: uuid,
  element_count: number,
  processing_time_ms: number,
  metadata: {
    schema: string,      // IFC schema version
    projectName: string,
    totalElements: number
  }
}
```

**Features:**
- Validates IFC file format
- Extracts project metadata (name, description, schema)
- Parses IFC elements (Walls, Slabs, Beams, Columns, etc.)
- Stores elements in bim_elements table
- Sets as primary BIM model if first upload

**Note:** Uses simplified IFC parsing. For production, integrate with `web-ifc` library for accurate geometry and quantity extraction.

---

## 3. Database Webhooks Setup

Database webhooks automatically trigger the send-notification-email Edge Function when events occur.

### Setting Up Webhooks

#### Option A: Using Supabase Dashboard

1. Go to **Database → Webhooks** in Supabase Dashboard
2. Create the following webhooks:

**Webhook 1: Bids**
- **Name:** `notify_bid_received`
- **Table:** `public.bids`
- **Events:** INSERT
- **HTTP Request:**
  - Method: POST
  - URL: `https://YOUR_PROJECT.supabase.co/functions/v1/send-notification-email`
  - Headers:
    ```
    Content-Type: application/json
    Authorization: Bearer YOUR_SERVICE_ROLE_KEY
    ```

**Webhook 2: Tasks**
- **Name:** `notify_task_updates`
- **Table:** `public.tasks`
- **Events:** INSERT, UPDATE
- **HTTP Request:**
  - Method: POST
  - URL: `https://YOUR_PROJECT.supabase.co/functions/v1/send-notification-email`
  - Headers:
    ```
    Content-Type: application/json
    Authorization: Bearer YOUR_SERVICE_ROLE_KEY
    ```

**Webhook 3: Project Members**
- **Name:** `notify_member_added`
- **Table:** `public.project_members`
- **Events:** INSERT
- **HTTP Request:**
  - Method: POST
  - URL: `https://YOUR_PROJECT.supabase.co/functions/v1/send-notification-email`
  - Headers:
    ```
    Content-Type: application/json
    Authorization: Bearer YOUR_SERVICE_ROLE_KEY
    ```

#### Option B: Using pg_net (Alternative)

If Database Webhooks are not available, use PostgreSQL's pg_net extension:

```sql
-- Enable pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create trigger function that calls Edge Function via HTTP
CREATE OR REPLACE FUNCTION notify_via_edge_function()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/send-notification-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
    ),
    body := jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'record', row_to_json(NEW),
      'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER notify_bid_insert
AFTER INSERT ON public.bids
FOR EACH ROW
EXECUTE FUNCTION notify_via_edge_function();

CREATE TRIGGER notify_task_insert
AFTER INSERT ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION notify_via_edge_function();

CREATE TRIGGER notify_task_update
AFTER UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION notify_via_edge_function();

CREATE TRIGGER notify_member_insert
AFTER INSERT ON public.project_members
FOR EACH ROW
EXECUTE FUNCTION notify_via_edge_function();
```

---

## 4. Real-Time Subscriptions

Supabase real-time is automatically enabled. Frontend can subscribe to changes.

### Frontend Integration Examples

#### Subscribe to Bid Updates

```typescript
import { supabase } from '@/integrations/supabase/client';

// Subscribe to new bids for a specific bid request
const subscription = supabase
  .channel('bids')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'bids',
      filter: `bid_request_id=eq.${bidRequestId}`
    },
    (payload) => {
      console.log('New bid received:', payload.new);
      // Update UI with new bid
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

#### Subscribe to Task Updates

```typescript
// Subscribe to task changes for a project
const subscription = supabase
  .channel('tasks')
  .on(
    'postgres_changes',
    {
      event: '*',  // All events (INSERT, UPDATE, DELETE)
      schema: 'public',
      table: 'tasks',
      filter: `project_id=eq.${projectId}`
    },
    (payload) => {
      console.log('Task updated:', payload);
      // Update UI
    }
  )
  .subscribe();
```

#### Subscribe to Project Costs

```typescript
// Subscribe to cost changes
const subscription = supabase
  .channel('project_costs')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'project_costs',
      filter: `project_id=eq.${projectId}`
    },
    (payload) => {
      console.log('Cost updated:', payload);
      // Refresh cost breakdown
    }
  )
  .subscribe();
```

---

## 5. Using Database Functions

### Vendor Product Search

```typescript
const { data, error } = await supabase.rpc('search_vendor_products', {
  search_query: 'concrete',
  categories: ['materials', 'cement'],
  min_price: 50,
  max_price: 500,
  min_rating: 4.0,
  in_stock_only: true,
  sort_by: 'price_asc',
  limit_count: 20,
  offset_count: 0
});
```

### Project Cost Calculations

```typescript
// Get cost breakdown by category
const { data: breakdown, error } = await supabase.rpc(
  'get_project_cost_breakdown',
  { project_id_param: projectId }
);

// breakdown = [
//   { category: 'materials', total_amount: 15000, cost_count: 5 },
//   { category: 'labor', total_amount: 8000, cost_count: 3 },
//   ...
// ]

// Manually recalculate total (usually automatic via triggers)
const { data: total, error } = await supabase.rpc(
  'calculate_project_total_cost',
  { project_id_param: projectId }
);
```

### BIM Quantities Summary

```typescript
const { data: quantities, error } = await supabase.rpc(
  'get_bim_quantities_summary',
  { bim_model_id_param: bimModelId }
);

// quantities = [
//   {
//     element_type: 'Wall',
//     material_type: 'Concrete',
//     total_volume: 120.5,
//     total_area: 450.2,
//     total_length: 0,
//     element_count: 15
//   },
//   ...
// ]
```

---

## 6. File Upload Workflows

### Floor Plan Upload

```typescript
// 1. Upload file to storage
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('floor-plans')
  .upload(`${projectId}/${fileName}`, file);

// 2. Create file_uploads record
const { data: fileRecord, error: fileError } = await supabase
  .from('file_uploads')
  .insert({
    storage_path: uploadData.path,
    file_name: fileName,
    file_type: file.type,
    file_size: file.size,
    bucket_name: 'floor-plans',
    entity_type: 'project',
    entity_id: projectId,
    uploaded_by: userId,
    is_primary: true
  });

// 3. Update project's primary floor plan URL
await supabase
  .from('projects')
  .update({ primary_floor_plan_url: uploadData.path })
  .eq('id', projectId);
```

### BIM Model Upload & Processing

```typescript
// 1. Upload IFC file to storage
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('bim-models')
  .upload(`${projectId}/${fileName}`, ifcFile);

// 2. Call process-ifc-file Edge Function
const { data: processData, error: processError } = await supabase.functions
  .invoke('process-ifc-file', {
    body: {
      storage_path: uploadData.path,
      project_id: projectId,
      file_name: fileName
    }
  });

// 3. Processing complete, BIM model and elements are in database
console.log('BIM Model ID:', processData.bim_model_id);
console.log('Elements extracted:', processData.element_count);
```

### Vendor Asset Upload

```typescript
// Public vendor asset (product image)
const { data: uploadData, error } = await supabase.storage
  .from('vendor-assets')
  .upload(`public/${vendorId}/${fileName}`, file);

// Private vendor asset (business documents)
const { data: uploadData, error } = await supabase.storage
  .from('vendor-assets')
  .upload(`private/${vendorId}/${fileName}`, file);
```

---

## 7. User Preferences

### Getting User Preferences

```typescript
const { data: preferences, error } = await supabase
  .from('user_preferences')
  .select('*')
  .eq('user_id', userId)
  .single();

// If no preferences exist, defaults are:
// - realtime_notifications: 'important'
// - email_notifications: true
// - email_bidding_updates: true
// - email_task_updates: true
// - email_project_updates: true
// - sound_enabled: false
```

### Updating Preferences

```typescript
const { data, error } = await supabase
  .from('user_preferences')
  .upsert({
    user_id: userId,
    realtime_notifications: 'all',  // 'all', 'important', 'silent', 'disabled'
    email_notifications: true,
    email_bidding_updates: true,
    email_task_updates: false,
    email_project_updates: true,
    sound_enabled: true
  });
```

---

## 8. Testing & Verification

### Test Storage Buckets

```bash
# Using Supabase CLI
supabase storage ls floor-plans
supabase storage ls bim-models
supabase storage ls vendor-assets
supabase storage ls project-documents
```

### Test Database Functions

```sql
-- Test vendor product search
SELECT * FROM search_vendor_products(
  'concrete',
  ARRAY['materials'],
  NULL,
  NULL,
  NULL,
  false,
  NULL,
  NULL,
  'relevance',
  10,
  0
);

-- Test cost calculation
SELECT calculate_project_total_cost('YOUR_PROJECT_UUID');

-- Test cost breakdown
SELECT * FROM get_project_cost_breakdown('YOUR_PROJECT_UUID');
```

### Test Triggers

```sql
-- Test bid acceptance trigger
-- 1. Create a bid request linked to a project
INSERT INTO bid_requests (title, description, category, project_id, user_id)
VALUES ('Test Materials', 'Test description', 'materials', 'PROJECT_UUID', 'USER_UUID');

-- 2. Create a bid
INSERT INTO bids (bid_request_id, vendor_id, price, delivery_time_days, status)
VALUES ('BID_REQUEST_UUID', 'VENDOR_UUID', 1000, 7, 'pending');

-- 3. Accept the bid (should create project_cost entry)
UPDATE bids SET status = 'accepted' WHERE id = 'BID_UUID';

-- 4. Verify project_costs was created
SELECT * FROM project_costs WHERE bid_id = 'BID_UUID';

-- 5. Verify project total_cost was updated
SELECT total_cost FROM projects WHERE id = 'PROJECT_UUID';
```

### Test Edge Functions

```bash
# Test send-notification-email
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/send-notification-email' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "INSERT",
    "table": "bids",
    "record": {
      "id": "test-uuid",
      "bid_request_id": "request-uuid",
      "vendor_id": "vendor-uuid",
      "price": 1000
    }
  }'

# Test process-ifc-file (after uploading an IFC file)
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/process-ifc-file' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "storage_path": "project-uuid/model.ifc",
    "project_id": "project-uuid",
    "file_name": "model.ifc"
  }'
```

---

## 9. Production Checklist

Before deploying to production:

### Database
- [ ] Run migration on production database
- [ ] Verify all tables created successfully
- [ ] Test RLS policies with different user roles
- [ ] Create indexes on large tables if needed
- [ ] Set up database backups

### Storage
- [ ] Verify all 4 buckets exist
- [ ] Test RLS policies for each bucket
- [ ] Configure CORS if needed
- [ ] Set up CDN for public assets (optional)

### Edge Functions
- [ ] Deploy all 5 Edge Functions
- [ ] Set all required environment variables
- [ ] Configure email service (Resend/SendGrid/AWS SES)
- [ ] Test each function with production data
- [ ] Monitor function logs for errors

### Webhooks
- [ ] Set up database webhooks for bids, tasks, project_members
- [ ] Test webhook triggers
- [ ] Verify email notifications are sent
- [ ] Monitor webhook delivery logs

### Real-Time
- [ ] Test real-time subscriptions in production
- [ ] Verify RLS policies work with real-time
- [ ] Monitor real-time connection limits

### Frontend Integration
- [ ] Update frontend to use new database functions
- [ ] Implement file upload UI for all buckets
- [ ] Add real-time subscription code
- [ ] Implement user preferences settings page
- [ ] Add cost breakdown display components
- [ ] Integrate BIM viewer with storage

### Monitoring
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Monitor Edge Function performance
- [ ] Monitor database query performance
- [ ] Set up alerts for failed webhooks
- [ ] Monitor storage usage and costs

---

## 10. Troubleshooting

### Common Issues

**Storage RLS Policies Not Working**
- Verify path structure matches policy expectations
- Check bucket_id is correct in policies
- Ensure user is authenticated (auth.uid() is not null)

**Edge Functions Timing Out**
- Increase function timeout in config.toml
- Optimize IFC parsing for large files
- Consider background job queue for heavy processing

**Webhooks Not Firing**
- Verify webhook URL is correct
- Check service role key is valid
- Look at Database → Webhooks → Logs in dashboard
- Ensure Edge Function is deployed

**Email Notifications Not Sending**
- Verify email service API key is set
- Check user_preferences table for email_notifications = true
- Look at Edge Function logs for errors
- Ensure email service is configured (uncommented in code)

**Real-Time Not Working**
- Verify real-time is enabled in project settings
- Check RLS policies allow SELECT on subscribed tables
- Ensure proper channel configuration in frontend

---

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Review migration file for detailed implementation
- Check Edge Function logs in Supabase Dashboard
- Review RLS policies if permission errors occur
