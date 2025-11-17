# KrushiSetu Deployment Guide

## Issue: Subsidy Recommendation 500 Error on Vercel

The subsidy recommendation feature returns a **500 Internal Server Error** when deployed on Vercel because it requires the backend AI service to be properly configured.

---

## Root Cause

The backend uses **GROQ AI API** for subsidy recommendations, which requires the `GROQ_API_KEY` environment variable to be set in your backend deployment (Render/Railway/etc.).

---

## Solution Steps

### 1. Get Your GROQ API Key

1. Go to [https://console.groq.com/](https://console.groq.com/)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Create a new API key
5. Copy the API key (starts with `gsk_...`)

### 2. Configure Backend Environment (Render)

Since your backend is deployed on **Render** (based on `settings.py`):

1. Go to [https://dashboard.render.com/](https://dashboard.render.com/)
2. Select your backend service
3. Go to **Environment** tab
4. Add a new environment variable:
   - **Key**: `GROQ_API_KEY`
   - **Value**: `gsk_your_actual_api_key_here`
5. Click **Save Changes**
6. The service will automatically redeploy

### 3. Verify CORS Configuration

Make sure your backend's `settings.py` includes your Vercel frontend URL in CORS:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://krushi-setu.vercel.app",  # Your Vercel URL
    "https://your-custom-domain.com",  # If you have a custom domain
]
```

### 4. Update Frontend API Configuration

Check that your frontend points to the correct backend URL:

In `src/Components/User_Profile/api1.js`:

```javascript
const BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://your-backend.onrender.com'  // Your Render backend URL
  : 'http://127.0.0.1:8000';
```

Set this in Vercel environment variables:
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Add: `VITE_BASE_URL` = `https://your-backend.onrender.com`

---

## Testing After Deployment

### Test Backend API Directly

```bash
curl -X POST https://your-backend.onrender.com/api/subsidy-recommendations/recommend/ \
  -H "Content-Type: application/json" \
  -d '{
    "farmer_profile": {
      "income": "50000",
      "farmer_type": "Small Farmer",
      "land_size": "2",
      "crop_type": "Wheat",
      "state": "Gujarat"
    }
  }'
```

Should return:
```json
{
  "success": true,
  "recommendations": [...],
  "total_found": 5
}
```

### Common Errors and Solutions

#### Error: "GROQ_API_KEY environment variable is not set"
- **Solution**: Add `GROQ_API_KEY` to your backend deployment environment variables

#### Error: "Request failed with status code 500"
- **Solution**: Check backend logs on Render for detailed error messages

#### Error: "Network Error" or "CORS"
- **Solution**: Verify CORS_ALLOWED_ORIGINS includes your Vercel URL

#### Error: "timeout"
- **Solution**: The AI model takes time to process. Increased timeout to 120 seconds in the code.

---

## Alternative: Fallback Without AI (Optional)

If you want the app to work without AI recommendations temporarily, you can add a simple rule-based fallback in `views.py`:

```python
# In views.py, add this before calling SubsidyRecommander
if not os.getenv("GROQ_API_KEY"):
    # Simple rule-based fallback
    filtered = [s for s in subsidies_list if 
                farmer_profile['state'].lower() in str(s.get('eligibility_criteria', '')).lower()]
    return Response({
        "success": True,
        "recommendations": filtered[:5],
        "total_found": len(filtered),
        "note": "Using basic filtering (AI not configured)"
    })
```

---

## Deployment Checklist

- [ ] GROQ_API_KEY added to backend environment
- [ ] Backend redeployed successfully
- [ ] CORS includes Vercel frontend URL
- [ ] Frontend VITE_BASE_URL points to backend
- [ ] Test API endpoint directly (curl)
- [ ] Test from deployed frontend
- [ ] Check browser console for errors
- [ ] Check backend logs for errors

---

## Support

If issues persist after following this guide:

1. Check backend logs on Render
2. Check browser DevTools → Network tab
3. Verify all environment variables are set
4. Ensure API key is valid (test it on Groq console)

---

## Architecture

```
Frontend (Vercel)           Backend (Render)           AI Service (Groq)
   │                             │                          │
   │──POST /recommend────────►   │                          │
   │                             │──Query Model────────►   │
   │                             │◄──AI Response──────    │
   │◄──JSON Response──────────   │                          │
   │                             │                          │
```

---

**Last Updated**: November 17, 2025
