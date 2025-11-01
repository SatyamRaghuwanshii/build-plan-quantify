#!/bin/bash

# Backend Deployment Script for Build Plan Quantify
# This script deploys the complete backend implementation to Supabase

set -e  # Exit on any error

echo "=========================================="
echo "Build Plan Quantify - Backend Deployment"
echo "=========================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed."
    echo "Install it from: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo "✓ Supabase CLI found"
echo ""

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Error: Not logged in to Supabase."
    echo "Run: supabase login"
    exit 1
fi

echo "✓ Logged in to Supabase"
echo ""

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Error: supabase/config.toml not found."
    echo "Please run this script from the project root directory."
    exit 1
fi

echo "✓ In correct directory"
echo ""

# Confirmation
echo "This will deploy:"
echo "  - Database migration (storage, tables, functions, triggers)"
echo "  - 5 Edge Functions (ai-chat, generate-floor-plan, convert-to-3d, send-notification-email, process-ifc-file)"
echo ""
read -p "Continue with deployment? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "=========================================="
echo "Step 1: Applying Database Migration"
echo "=========================================="
echo ""

# Apply migrations
supabase db push

echo ""
echo "✓ Database migration applied successfully"
echo ""

echo "=========================================="
echo "Step 2: Deploying Edge Functions"
echo "=========================================="
echo ""

# Deploy Edge Functions
echo "Deploying ai-chat..."
supabase functions deploy ai-chat --no-verify-jwt

echo "Deploying generate-floor-plan..."
supabase functions deploy generate-floor-plan --no-verify-jwt

echo "Deploying convert-to-3d..."
supabase functions deploy convert-to-3d --no-verify-jwt

echo "Deploying send-notification-email..."
supabase functions deploy send-notification-email

echo "Deploying process-ifc-file..."
supabase functions deploy process-ifc-file

echo ""
echo "✓ All Edge Functions deployed successfully"
echo ""

echo "=========================================="
echo "Step 3: Verification"
echo "=========================================="
echo ""

# List storage buckets
echo "Checking storage buckets..."
supabase storage ls 2>/dev/null || echo "Note: Storage buckets created via migration"

# List Edge Functions
echo ""
echo "Deployed Edge Functions:"
supabase functions list

echo ""
echo "=========================================="
echo "Deployment Complete! ✓"
echo "=========================================="
echo ""
echo "Next Steps:"
echo ""
echo "1. Set up environment variables (if not already set):"
echo "   supabase secrets set LOVABLE_API_KEY=your_key"
echo "   supabase secrets set RESEND_API_KEY=your_key (optional, for emails)"
echo ""
echo "2. Set up Database Webhooks in Supabase Dashboard:"
echo "   - Go to Database → Webhooks"
echo "   - Create webhooks for: bids, tasks, project_members"
echo "   - Point to: send-notification-email Edge Function"
echo "   - See BACKEND_IMPLEMENTATION.md for details"
echo ""
echo "3. Test the implementation:"
echo "   - Test storage bucket uploads"
echo "   - Test database functions (search, costs, BIM)"
echo "   - Test Edge Functions"
echo "   - Test real-time subscriptions"
echo ""
echo "4. Update frontend to use new backend features"
echo ""
echo "For detailed documentation, see:"
echo "  supabase/BACKEND_IMPLEMENTATION.md"
echo ""
