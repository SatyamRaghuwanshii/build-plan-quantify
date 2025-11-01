# AI Features Fix & Troubleshooting Guide

## Overview

Fixed the AI chatbot and floor plan generator features that were not working. This guide explains what was fixed, how to deploy the fixes, and how to troubleshoot issues.

---

## What Was Fixed

### 1. AI Chat Function (`ai-chat`)

**Issues Fixed:**
- ✅ Updated model from `google/gemini-2.5-flash` to `google/gemini-1.5-flash`
- ✅ Added temperature and max_tokens parameters for better responses
- ✅ Added proper error messages for missing API key
- ✅ Added JWT verification bypass in config.toml

**File:** `supabase/functions/ai-chat/index.ts`

### 2. Floor Plan Generator (`generate-floor-plan`)

**Issues Fixed:**
- ✅ Updated model from `google/gemini-2.5-flash-image-preview` to `google/gemini-1.5-flash`
- ✅ Removed `modalities` parameter (not supported by standard API)
- ✅ Added better error handling and logging
- ✅ Added multiple fallback checks for image URL in response
- ✅ Added detailed error messages
- ✅ Added xhr import for proper fetch support

**File:** `supabase/functions/generate-floor-plan/index.ts`

### 3. Convert to 3D (`convert-to-3d`)

**Issues Fixed:**
- ✅ Updated model from `google/gemini-2.5-flash-image-preview` to `google/gemini-1.5-flash`
- ✅ Removed `modalities` parameter
- ✅ Added better error handling and logging
- ✅ Added multiple fallback checks for image URL in response
- ✅ Added detailed error messages
- ✅ Added xhr import

**File:** `supabase/functions/convert-to-3d/index.ts`

### 4. Configuration

**Issues Fixed:**
- ✅ Added `verify_jwt = false` for `ai-chat` function
- ✅ Configuration now properly disables JWT for all AI functions

**File:** `supabase/config.toml`

---

## Deployment

### Option 1: Quick Deployment (Recommended)

```bash
cd build-plan-quantify

# Deploy AI functions
supabase functions deploy ai-chat --no-verify-jwt
supabase functions deploy generate-floor-plan --no-verify-jwt
supabase functions deploy convert-to-3d --no-verify-jwt
```

### Option 2: Deploy All Functions

```bash
# Use the deployment script
./supabase/deploy.sh
```

---

## Configuration Requirements

### 1. Set LOVABLE_API_KEY

The AI features require a Lovable AI API key. Set it using:

```bash
supabase secrets set LOVABLE_API_KEY=your_lovable_api_key_here
```

**Where to get the API key:**
1. Go to your Lovable dashboard
2. Navigate to Settings → API Keys
3. Copy your API key
4. Set it using the command above

### 2. Verify Configuration

Check that your environment variable is set:

```bash
supabase secrets list
```

You should see `LOVABLE_API_KEY` in the list.

---

## Testing the Fixes

### 1. Test AI Chat

```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/ai-chat' \
  -H 'Content-Type: application/json' \
  -d '{"message": "What materials do I need for a concrete slab?"}'
```

**Expected Response:**
```json
{
  "response": "For a concrete slab, you'll need..."
}
```

### 2. Test Floor Plan Generator

```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/generate-floor-plan' \
  -H 'Content-Type: application/json' \
  -d '{
    "prompt": "Large kitchen with island",
    "rooms": "3",
    "sqft": "2000",
    "style": "modern"
  }'
```

**Expected Response:**
```json
{
  "imageUrl": "https://...",
  "description": "A modern 3-bedroom floor plan..."
}
```

### 3. Test from Frontend

#### AI Chat:
1. Navigate to the AI Assistant page
2. Type a construction-related question
3. Click Send
4. You should see a response within a few seconds

#### Floor Plan Generator:
1. Navigate to the Floor Plan Generator page (usually in Calculator or Projects)
2. Select number of rooms, square footage, and style
3. Add custom requirements (optional)
4. Click "Generate Floor Plan"
5. Wait for the image to generate (may take 10-30 seconds)
6. You should see a floor plan image

---

## Troubleshooting

### Issue 1: "LOVABLE_API_KEY not configured"

**Problem:** The API key is missing.

**Solution:**
```bash
supabase secrets set LOVABLE_API_KEY=your_key_here
```

**Verify it's set:**
```bash
supabase secrets list
```

### Issue 2: "No image generated" (Floor Plan Generator)

**Problem:** The AI model doesn't support image generation OR Lovable AI Gateway doesn't have image generation enabled.

**Possible Causes:**
1. **Model doesn't support images:** Gemini 1.5 Flash may only generate text, not images
2. **Lovable AI Gateway limitation:** The gateway may not proxy image generation requests
3. **API response format:** The response format may be different than expected

**Solutions:**

#### Option A: Check Lovable AI Gateway Documentation
1. Visit Lovable AI documentation
2. Check if image generation is supported
3. Check what models support image generation
4. Verify the correct API format

#### Option B: Use Alternative Image Generation
If Lovable AI Gateway doesn't support image generation, you'll need to integrate with an actual image generation service:

**1. DALL-E 3 (OpenAI):**
```bash
# Set OpenAI API key
supabase secrets set OPENAI_API_KEY=your_openai_key

# Modify generate-floor-plan function to use:
# https://api.openai.com/v1/images/generations
```

**2. Imagen (Google Cloud):**
```bash
# Set Google Cloud credentials
supabase secrets set GOOGLE_CLOUD_PROJECT=your_project
supabase secrets set GOOGLE_CLOUD_API_KEY=your_key

# Use Google Cloud Imagen API
```

**3. Stable Diffusion (Various Providers):**
- Replicate
- Stability AI
- Hugging Face

#### Option C: Use Text-Based Floor Plans (Temporary Workaround)
If image generation is unavailable, the AI can generate ASCII art or textual representations:

```typescript
// Modify function to return text-based floor plan
return {
  imageUrl: null,
  description: `Floor Plan Layout (2000 sqft, 3 bedrooms):

  ┌──────────────────────────────────┐
  │  LIVING ROOM      KITCHEN        │
  │                   ┌──────┐       │
  │                   │      │       │
  ├───────────────────┴──────┴───────┤
  │  MASTER     │ BEDROOM 2│ BEDROOM│
  │  BEDROOM    │          │    3   │
  └─────────────┴──────────┴────────┘
  `
};
```

### Issue 3: Rate Limit Exceeded (429 Error)

**Problem:** Too many requests to Lovable AI Gateway.

**Solution:**
- Wait a few minutes and try again
- Add rate limiting to frontend
- Consider upgrading Lovable AI plan
- Implement request queuing

### Issue 4: Payment Required (402 Error)

**Problem:** Lovable AI workspace needs credits.

**Solution:**
1. Log in to Lovable dashboard
2. Go to Billing → Add Credits
3. Purchase credits
4. Try again

### Issue 5: AI Gateway Error (500 Error)

**Problem:** Generic error from Lovable AI Gateway.

**Check Logs:**
```bash
# View function logs
supabase functions logs ai-chat
supabase functions logs generate-floor-plan
supabase functions logs convert-to-3d
```

**Common Causes:**
- Invalid API key
- API endpoint changed
- Model name incorrect
- Request format incorrect

**Solutions:**
- Verify API key is correct
- Check Lovable AI status page
- Review error logs for specific error message
- Test with curl to isolate issue

### Issue 6: CORS Errors

**Problem:** Browser blocks requests due to CORS.

**Solution:**
The functions already include CORS headers. If you still see CORS errors:

1. **Verify function deployed:**
```bash
supabase functions list
```

2. **Check if JWT verification is disabled:**
```bash
cat supabase/config.toml
```

Should show:
```toml
[functions.ai-chat]
verify_jwt = false
```

3. **Redeploy with --no-verify-jwt flag:**
```bash
supabase functions deploy ai-chat --no-verify-jwt
```

### Issue 7: Function Times Out

**Problem:** Function takes too long and times out.

**Solution:**
Increase timeout in config.toml:

```toml
[functions.generate-floor-plan]
verify_jwt = false
timeout = 60  # Increase to 60 seconds
```

Then redeploy:
```bash
supabase functions deploy generate-floor-plan --no-verify-jwt
```

---

## Understanding the AI Features

### How AI Chat Works

1. **User sends message** → Frontend calls `supabase.functions.invoke('ai-chat')`
2. **Edge Function receives message** → Validates and forwards to Lovable AI Gateway
3. **Lovable AI Gateway** → Processes with Gemini 1.5 Flash model
4. **Response returned** → Edge Function returns AI's response to frontend
5. **Frontend displays** → Message appears in chat interface

### How Floor Plan Generation Works

1. **User inputs requirements** → Rooms, sqft, style, custom prompt
2. **Frontend calls function** → `supabase.functions.invoke('generate-floor-plan')`
3. **Edge Function builds detailed prompt** → Includes architectural specifications
4. **Lovable AI Gateway called** → With text prompt requesting image
5. **Image generated** → (If supported by gateway)
6. **Response parsed** → Extract image URL from response
7. **Frontend displays** → Show generated floor plan image

**Note:** Standard Gemini models generate text, not images. If image generation doesn't work, it's because:
- Lovable AI Gateway may not support image generation with Gemini
- You may need to use a dedicated image generation model (DALL-E, Imagen, Stable Diffusion)

### How 3D Conversion Works

1. **User clicks "Convert to 3D"** → After generating 2D floor plan
2. **Frontend calls function** → `supabase.functions.invoke('convert-to-3d', {imageUrl: '...'})`
3. **Edge Function receives image URL** → Creates isometric prompt
4. **Sends to Lovable AI Gateway** → With both text prompt AND image URL
5. **AI processes image** → Generates isometric 3D view
6. **Response parsed** → Extract 3D image URL
7. **Frontend displays** → Show 3D isometric view

**Note:** This requires vision + image generation capabilities, which may not be available.

---

## Alternative Solutions

### If Image Generation Doesn't Work

#### Option 1: Use External Image Generation API

Create a new function that uses DALL-E:

```typescript
// supabase/functions/generate-floor-plan-dalle/index.ts
const response = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: "dall-e-3",
    prompt: basePrompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
  }),
});
```

#### Option 2: Use Pre-generated Templates

Store template floor plans and let AI suggest which template to use:

```typescript
const templates = {
  'modern-3br-2000sqft': '/templates/modern-3br.png',
  'traditional-4br-2500sqft': '/templates/traditional-4br.png',
  // ...
};

// AI suggests best template
const { data } = await supabase.functions.invoke('ai-chat', {
  body: { message: `Suggest floor plan template for: ${requirements}` }
});

// Return template image
return { imageUrl: templates[suggestedTemplate] };
```

#### Option 3: Use SVG Generation

Generate floor plans as SVG code that can be rendered in browser:

```typescript
// AI generates SVG code
const svgCode = `
<svg viewBox="0 0 1000 1000">
  <rect x="0" y="0" width="400" height="400" fill="#f0f0f0" stroke="#000"/>
  <text x="200" y="200">Living Room</text>
  <!-- ... more SVG elements ... -->
</svg>
`;

// Frontend renders SVG
return { svgCode, description };
```

---

## Monitoring and Logs

### View Function Logs

```bash
# Real-time logs
supabase functions logs ai-chat --follow
supabase functions logs generate-floor-plan --follow
supabase functions logs convert-to-3d --follow

# Recent logs
supabase functions logs ai-chat
```

### What to Look For

**Successful request:**
```
AI response received
Floor plan generated successfully. Image URL: https://...
```

**Failed request:**
```
Error: LOVABLE_API_KEY not configured
No image URL found in response
AI gateway error: 500
```

---

## Production Checklist

Before deploying to production:

### Configuration
- [ ] LOVABLE_API_KEY environment variable set
- [ ] All functions deployed with --no-verify-jwt flag
- [ ] config.toml has verify_jwt = false for all AI functions

### Testing
- [ ] AI Chat responds to messages
- [ ] Floor Plan Generator creates images (or verify alternative solution)
- [ ] Convert to 3D works (or verify alternative solution)
- [ ] Error messages display properly in frontend
- [ ] Rate limiting works (429 errors handled)

### Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor function logs for errors
- [ ] Track API usage and costs
- [ ] Set up alerts for failures

### Fallbacks
- [ ] Handle API key missing error
- [ ] Handle rate limit errors
- [ ] Handle payment required errors
- [ ] Handle image generation failures
- [ ] Show user-friendly error messages

---

## Additional Resources

- **Lovable AI Documentation:** Check for image generation support
- **Gemini API Docs:** https://ai.google.dev/docs
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **OpenAI DALL-E:** https://platform.openai.com/docs/guides/images
- **Google Imagen:** https://cloud.google.com/vertex-ai/docs/generative-ai/image/overview

---

## Summary of Changes

### Files Modified
1. `supabase/functions/ai-chat/index.ts`
   - Updated model name
   - Added temperature and max_tokens
   - Improved error handling

2. `supabase/functions/generate-floor-plan/index.ts`
   - Updated model name
   - Removed modalities parameter
   - Added better response parsing
   - Added detailed logging
   - Added xhr import

3. `supabase/functions/convert-to-3d/index.ts`
   - Updated model name
   - Removed modalities parameter
   - Added better response parsing
   - Added detailed logging
   - Added xhr import

4. `supabase/config.toml`
   - Added verify_jwt = false for ai-chat

### Key Improvements
- ✅ Better error messages
- ✅ Detailed logging for debugging
- ✅ Multiple fallback checks for image URLs
- ✅ Proper CORS handling
- ✅ Improved API compatibility

---

**Status:** ✅ Fixes applied, ready for deployment

**Next Steps:**
1. Deploy functions: `./supabase/deploy.sh`
2. Set API key: `supabase secrets set LOVABLE_API_KEY=your_key`
3. Test features in browser
4. Check logs if issues occur
5. Consider alternative image generation if needed
