# Backend Diagnostic Test

## Issue: 502 Bad Gateway + CORS Error

You have the GROQ_API_KEY set in Render, but still getting errors. Let's diagnose:

---

## Step 1: Check if Backend is Actually Running

Open these URLs in your browser (one at a time):

### A. Backend Health Check
```
https://kru-backend.onrender.com/
```
**Expected**: Should show Django page or "Hello World"
**If you get 502**: Backend crashed - check Render logs

### B. Admin Panel
```
https://kru-backend.onrender.com/admin/
```
**Expected**: Django admin login page
**If you get 502**: Backend is down

### C. API Test Endpoint
```
https://kru-backend.onrender.com/api/subsidy-recommendations/recommendation_status/
```
**Expected**: `{"success": true, "message": "Subsidy Recommendation Service is operational."}`
**If you get 502**: Subsidy recommendation service crashed

---

## Step 2: Check Render Logs (CRITICAL!)

1. Go to: https://dashboard.render.com/
2. Click your backend service
3. Click **Logs** tab
4. Look for errors like:
   - `"GROQ_API_KEY environment variable is not set"`
   - `ImportError` or `ModuleNotFoundError`
   - `Application failed to start`
   - Any Python traceback

**Common Issues in Logs:**
```
❌ "GROQ_API_KEY environment variable is not set"
   → API key not actually loaded (typo in variable name?)

❌ "ModuleNotFoundError: No module named 'langchain_groq'"
   → Missing dependencies in requirements.txt

❌ "Failed to initialize ChatGroq model"
   → Invalid API key or Groq service issue

❌ "Web process failed to bind to $PORT"
   → Gunicorn configuration issue
```

---

## Step 3: Verify Environment Variable Name

The code expects exactly: `GROQ_API_KEY`

In Render Environment tab, verify:
- Variable name is: `GROQ_API_KEY` (not `GROQ_API`, not `GROQAPI_KEY`)
- Value starts with: `gsk_`
- No extra spaces before/after the key

---

## Step 4: Test with cURL (Bypass CORS)

Run this in PowerShell:

```powershell
curl -X POST "https://kru-backend.onrender.com/api/subsidy-recommendations/recommend/" `
  -H "Content-Type: application/json" `
  -H "Origin: https://krushi-setu.vercel.app" `
  -d '{\"farmer_profile\":{\"income\":\"100000\",\"farmer_type\":\"Small Farmer\",\"land_size\":\"2\",\"crop_type\":\"Wheat\",\"state\":\"Gujarat\"}}'
```

**If this works**: CORS issue (backend running fine)
**If this fails with 502**: Backend is actually down

---

## Step 5: Check Render Free Tier Spin Down

Render free tier services **spin down after 15 minutes** of inactivity.

**Symptoms:**
- First request takes 50+ seconds
- Returns 502 during spin-up
- Eventually works after waiting

**Solution:** 
- Wait 1-2 minutes and try again
- Or upgrade to paid Render tier ($7/month)

---

## Step 6: Common Fixes

### Fix 1: Redeploy Backend
Sometimes environment variables don't load properly:

1. Go to Render Dashboard
2. Your service → **Manual Deploy** tab
3. Click **Deploy latest commit**
4. Wait for deploy to finish
5. Check logs for "Deploy succeeded"

### Fix 2: Check requirements.txt

Make sure your `back/requirements.txt` includes:
```
langchain-groq==0.0.1
langchain-core
langgraph
groq
```

If missing, add them and redeploy.

### Fix 3: Add Fallback in Code

If Groq keeps failing, add this temporary fix to `views.py`:

```python
# At top of recommend_subsidies function
if not os.getenv("GROQ_API_KEY"):
    # Simple rule-based fallback
    filtered = [s for s in subsidies_list if 
                farmer_profile['state'].lower() in str(s.get('eligibility_criteria', '')).lower()]
    return Response({
        "success": True,
        "recommendations": filtered[:10],
        "total_found": len(filtered),
        "note": "Using basic filtering (AI service unavailable)"
    })
```

---

## What to Check RIGHT NOW:

1. ✅ Open: https://kru-backend.onrender.com/admin/
   - **Works?** Backend is running
   - **502?** Backend crashed - check logs

2. ✅ Render Logs show any errors?
   - Post the error here

3. ✅ Environment variable name is exactly `GROQ_API_KEY`?
   - Not `GROQ_API` or `GROQAPI_KEY`

4. ✅ API key starts with `gsk_`?
   - Test it at https://console.groq.com/playground

---

**Report back with:**
1. Does `/admin/` URL load?
2. What do Render logs show?
3. Screenshot of environment variables in Render
