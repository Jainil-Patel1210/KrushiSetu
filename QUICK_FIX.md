# Quick Fix: Subsidy Recommendation Errors

## Current Errors
❌ **CORS Error**: "Access-Control-Allow-Origin header is not present"
❌ **502 Bad Gateway**: Backend server not responding

## Root Causes
1. **Backend is DOWN on Render** (502 error means server crashed/not responding)
2. **Missing GROQ_API_KEY** (causes backend to crash on startup)
3. **CORS misconfiguration** (blocking cross-origin requests)

---

## IMMEDIATE FIX (Do This First!)

### Step 1: Check if Backend is Running
Go to: https://kru-backend.onrender.com/admin/

- **If it loads** → Backend is running (skip to Step 2)
- **If it shows 502/error** → Backend crashed (continue below)

### Step 2: Fix Backend Crash (Add GROQ_API_KEY)

1. **Get API Key**:
   - Go to: https://console.groq.com/keys
   - Sign up/login
   - Click "Create API Key"
   - Copy the key (starts with `gsk_`)

2. **Add to Render**:
   - Go to: https://dashboard.render.com/
   - Select your service: `kru-backend`
   - Click **Environment** tab
   - Click **Add Environment Variable**
   - Key: `GROQ_API_KEY`
   - Value: Paste your key (e.g., `gsk_abc123...`)
   - Click **Save Changes**

3. **Wait for Redeploy**:
   - Render will automatically redeploy (~2-3 minutes)
   - Watch the **Logs** tab for "Deploy succeeded"
   - Check if https://kru-backend.onrender.com/admin/ loads

### Step 3: Update CORS Settings (If Still Not Working)

Add this to your Render **Environment Variables**:
```
CORS_ALLOWED_ORIGINS = https://krushi-setu.vercel.app,http://localhost:5173
```

---

## Verify It's Working

### Test Backend Directly:
```bash
curl https://kru-backend.onrender.com/api/subsidy-recommendations/recommend/ \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Origin: https://krushi-setu.vercel.app" \
  -d '{"farmer_profile":{"income":"100000","farmer_type":"Medium Farmer","land_size":"25","crop_type":"Wheat","state":"Gujarat"}}'
```

**Expected Response**:
```json
{
  "success": true,
  "recommendations": [...],
  "total_found": 5
}
```

**If you get 502**: Backend is still crashed - check Render logs
**If you get CORS error**: Add CORS_ALLOWED_ORIGINS environment variable
**If you get "GROQ_API_KEY not set"**: API key not configured properly

---

## Alternative: Temporary Backend URL Check

Your backend URL in frontend should be:
```
https://kru-backend.onrender.com
```

Check this in browser console when error occurs - if it's showing a different URL, that's the problem.

---

## Still Not Working? Debug Steps:

1. **Check Render Dashboard Logs**:
   - Go to Render → Your Service → Logs
   - Look for errors like:
     - "GROQ_API_KEY environment variable is not set"
     - "Application failed to start"
     - Any Python traceback

2. **Check Browser Console**:
   - Press F12 → Console tab
   - Look for the exact error message
   - Check Network tab → Failed request → Response

3. **Common Issues**:
   - ❌ Free tier Render services spin down after inactivity (takes 50s to wake up)
   - ❌ GROQ API key invalid or expired
   - ❌ Backend environment variables not saved properly
   - ❌ Frontend pointing to wrong backend URL

---

## Why 502 Bad Gateway?

A **502 Bad Gateway** means:
- Backend server crashed during startup (most likely: missing GROQ_API_KEY)
- Backend is restarting (wait 2-3 minutes)
- Backend ran out of memory (upgrade Render plan)
- Backend has an uncaught Python exception

**The GROQ_API_KEY is REQUIRED** - without it, the SubsidyRecommander class crashes on initialization.

---

**Time to fix**: 5-10 minutes (including Render redeploy time)
**Cost**: Free (Groq API has free tier)
