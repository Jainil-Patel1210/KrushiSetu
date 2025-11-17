# Quick Fix: 502 Bad Gateway + CORS Errors

## Current Status
✅ GROQ_API_KEY is set in Render environment variables
❌ Still getting 502 Bad Gateway error
❌ CORS error (secondary issue - happens because backend is down)

---

## The REAL Problem

**502 Bad Gateway** means one of these:

1. **Render Free Tier Spin-Down** (50+ seconds to wake up)
2. **Backend crashed during startup** (dependency/import error)
3. **Port binding issue** (backend not listening on correct port)
4. **Timeout** (request taking too long)

---

## IMMEDIATE ACTIONS

### Action 1: Check if Backend is Alive

Open these URLs in browser **right now**:

#### Test A: Admin Panel
```
https://kru-backend.onrender.com/admin/
```
- ✅ Loads → Backend is running
- ❌ 502 Error → Backend crashed

#### Test B: Status Check (NEW!)
```
https://kru-backend.onrender.com/api/subsidy-recommendations/status/
```
- ✅ Shows JSON → Service is working
- ❌ 502 Error → Service crashed

**Try these now and report back what you see!**

---

### Action 2: Check Render Logs

1. Go to: https://dashboard.render.com/
2. Select: `kru-backend` service
3. Click: **Logs** tab (top navigation)
4. Scroll to the bottom
5. Look for errors (red text)

**Common errors to look for:**
```
❌ "ModuleNotFoundError: No module named 'langchain_groq'"
❌ "Failed to initialize ChatGroq model"
❌ "Application failed to start"
❌ "Web process failed to bind to $PORT"
❌ Any Python traceback/exception
```

**Copy-paste the error here!**

---

### Action 3: Force Redeploy

Environment variables sometimes don't reload properly:

1. Go to Render Dashboard
2. Your service → **Manual Deploy** (left sidebar)
3. Click **Clear build cache & deploy**
4. Wait 3-5 minutes
5. Check logs for "Deploy succeeded"
6. Try accessing `/admin/` again

---

### Action 4: Test Status Endpoint

After redeploy, test this NEW endpoint:
```
https://kru-backend.onrender.com/api/subsidy-recommendations/status/
```

Expected response:
```json
{
  "success": true,
  "message": "Subsidy Recommendation Service Status",
  "groq_api_key_configured": true,
  "groq_key_prefix": "gsk_abc",
  "service_operational": true
}
```

If you see `"groq_api_key_configured": false`, the API key isn't loading properly.

---

## Common Issues & Solutions

### Issue 1: Render Free Tier Spin-Down
**Symptom:** First request fails, second request works
**Solution:** Wait 60 seconds and try again, or upgrade to paid tier

### Issue 2: Wrong Port
**Check logs for:** `Web process failed to bind to $PORT`
**Solution:** Make sure `Procfile` or `gunicorn` command uses `$PORT`

### Issue 3: Dependency Missing
**Check logs for:** `ModuleNotFoundError`
**Solution:** I've updated `requirements.txt` - commit and push changes, then redeploy

### Issue 4: API Key Not Loading
**Check:** Environment variable name is exactly `GROQ_API_KEY` (case sensitive)
**Solution:** Double-check spelling in Render dashboard

---

## What I've Fixed in Code

1. ✅ Better error handling in `SubsidyRecommander.py`
2. ✅ Added diagnostic `/status/` endpoint
3. ✅ Specified package versions in `requirements.txt`
4. ✅ Improved error messages in `views.py`

**You need to:**
1. Commit these changes
2. Push to GitHub
3. Render will auto-deploy
4. Wait for deploy to finish
5. Test again

---

## Commands to Run

```powershell
# Commit the changes
git add .
git commit -m "Fix: Add better error handling and diagnostics for subsidy recommendations"
git push

# Then wait for Render to auto-deploy (check Render dashboard)
```

---

## Test Immediately

Run this in PowerShell to test directly:

```powershell
# Test status endpoint
curl https://kru-backend.onrender.com/api/subsidy-recommendations/status/

# Test admin (should show HTML)
curl https://kru-backend.onrender.com/admin/
```

---

## Report Back

Please provide:
1. ✅ Does `/admin/` load in browser? (Yes/No)
2. ✅ What does `/status/` endpoint return? (Copy the JSON)
3. ✅ What do Render logs show? (Copy last 20 lines)
4. ✅ Screenshot of Render environment variables

This will help identify the exact issue!

