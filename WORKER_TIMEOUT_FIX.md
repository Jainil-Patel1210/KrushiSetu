# 🚨 CRITICAL FIX: Worker Timeout & Memory Issues

## What the Logs Showed

### Critical Errors:
1. ❌ **WORKER TIMEOUT (pid:57)** - Process took too long
2. ❌ **Worker sent SIGKILL** - Out of memory or timeout
3. ❌ **429 Too Many Requests** - Groq rate limit hit repeatedly

### What Was Happening:
- Backend was checking **ALL subsidies** (could be 50-100+ subsidies)
- Each subsidy = 1 AI API call to Groq
- 50 subsidies × 2-3 seconds each = **100-150 seconds** (exceeds 30-second timeout)
- Hitting rate limit (30 requests/min) → Retries → More delays → **TIMEOUT**

---

## Fixes Applied

### Fix 1: Limit Subsidies to 10 Max ✅
```python
MAX_SUBSIDIES_TO_CHECK = 10
```
- **Before**: Checked ALL subsidies (50-100+)
- **After**: Only check 10 most relevant ones
- **Result**: ~20-30 seconds instead of 100+ seconds

### Fix 2: Smart Filtering ✅
- First filters by user's state
- Then limits to 10 subsidies
- Prioritizes most relevant results

### Fix 3: Increased Timeout ✅
Created `Procfile` with:
```
--timeout 180 (3 minutes)
--graceful-timeout 180
```
- Prevents worker from being killed during AI processing

---

## Deploy These Changes

```powershell
git add .
git commit -m "critical: Limit subsidies to 10, increase timeout to prevent worker kills"
git push origin feature-sr
```

Then:
1. Go to Render Dashboard
2. Wait for auto-deploy (or manual deploy)
3. Check logs for "Deploy succeeded"

---

## Expected Behavior After Fix

### Before:
- ❌ Checks 50+ subsidies
- ❌ Takes 100+ seconds
- ❌ Worker timeout/killed
- ❌ 502 errors

### After:
- ✅ Checks only 10 subsidies
- ✅ Takes 20-30 seconds
- ✅ Completes successfully  
- ✅ Returns recommendations

---

## Testing

After deployment:

```powershell
# Test status
Invoke-RestMethod -Uri "https://kru-backend.onrender.com/api/subsidy-recommendations/status/"

# Test recommendation (will take 20-30 seconds)
Invoke-RestMethod -Uri "https://kru-backend.onrender.com/api/subsidy-recommendations/recommend/" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"farmer_profile":{"income":"50000","farmer_type":"Small Farmer","land_size":"2","crop_type":"Wheat","state":"Gujarat"}}' -TimeoutSec 60
```

---

## Why This Works

**Groq Free Tier Limits:**
- 30 requests per minute
- Each eligibility check = 1 request

**Math:**
- 10 subsidies × 1 request each = 10 requests
- Well under 30/min limit ✅
- ~2-3 seconds per request = 20-30 seconds total ✅
- Under 180 second timeout ✅

---

## Long-term Solutions

### Option 1: Upgrade Groq Plan ($20/month)
- Higher rate limits
- Check more subsidies
- Faster recommendations

### Option 2: Optimize AI Calls
- Batch multiple subsidies in one AI call
- Use simpler prompts
- Cache more aggressively

### Option 3: Hybrid Approach
- Use rule-based filtering for 90% of subsidies
- Only use AI for final 10-15 candidates
- Much faster and cheaper

---

## Summary

🎯 **Root Cause**: Too many AI API calls → Rate limits → Timeouts → Worker killed

✅ **Solution**: 
1. Limit to 10 subsidies max
2. Increase timeout to 3 minutes
3. Smart state-based filtering

🚀 **Next**: Commit, push, deploy, test!

⏱️ **Expected**: Feature will work but take 20-30 seconds (acceptable for AI-powered recommendations)
