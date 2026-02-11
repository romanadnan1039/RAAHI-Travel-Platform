# Deploy Custom AI Agent to Railway

## Step 1: Push to GitHub

```bash
git push origin main
```

## Step 2: Update AI Agent on Railway

### A. Update Environment Variables

Go to your **AI Agent service** on Railway:

1. Click on **Variables** tab
2. Update or add:
   ```
   BACKEND_URL=https://your-backend.railway.app
   ```
   *(No need for `/api` suffix or `_API` - the code handles this)*

### B. Redeploy

Railway will automatically detect the changes and redeploy. If not:
1. Go to **Deployments** tab
2. Click **Deploy** on the latest commit

## Step 3: Update Backend Service

Go to your **Backend service** on Railway:

1. Click on **Variables** tab
2. Update:
   ```
   AI_AGENT_URL=https://your-ai-agent.railway.app
   ```

## Step 4: Update Frontend on Vercel

Go to Vercel dashboard:

1. Select your project
2. Go to **Settings** → **Environment Variables**
3. Update:
   ```
   VITE_AI_AGENT_URL=https://your-ai-agent.railway.app
   ```
4. Go to **Deployments** tab
5. Click **Redeploy** on the latest deployment

## Step 5: Verify Deployment

### Check AI Agent Health

```bash
curl https://your-ai-agent.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-11T...",
  "version": "2.0.0",
  "features": [
    "Custom NLP Query Parser",
    "Enhanced Recommendation Engine",
    "Multi-language Support (English + Urdu)",
    "Conversation Context Management",
    "Template-based Responses"
  ]
}
```

### Test AI Chat

```bash
curl -X POST https://your-ai-agent.railway.app/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me Hunza packages under 30k"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "response": "Great! I found X packages to Hunza under PKR 30,000! ...",
    "recommendations": [
      {
        "id": "...",
        "title": "Hunza Valley Adventure",
        "price": 25000,
        "duration": 2,
        "matchScore": 95
      }
    ],
    "conversationId": "conv_...",
    "parsedQuery": {
      "destination": "Hunza",
      "budget": 30000,
      "language": "english"
    }
  }
}
```

## Step 6: Test from Frontend

1. Open your deployed website
2. Navigate to the AI Chat section
3. Try these queries:
   - "Show me Hunza packages"
   - "2 day trip to Swat under 20k"
   - "Family package to Murree"
   - "Sasta Naran tour"

## Common Issues

### Issue: "connect ECONNREFUSED"

**Cause**: Environment variables not set correctly

**Fix**:
1. Verify `BACKEND_URL` is set in AI Agent service
2. Verify `AI_AGENT_URL` is set in Backend service
3. Check the URLs are correct (https://, no typos)

### Issue: "No packages found"

**Cause**: Database might be empty or filters too strict

**Fix**:
1. Check backend logs to ensure database has data
2. Try a broader query: "Show me packages"
3. Check if backend is connected to database

### Issue: Build fails on Railway

**Cause**: TypeScript compilation errors

**Fix**:
1. Check Railway build logs
2. Ensure `typescript` is in `dependencies` (not `devDependencies`)
3. Run `npm run build` locally to test

## Monitoring

### Check Logs

**AI Agent logs:**
```
=== RAAHI AI Agent v2.0 - Custom Intelligence ===
✅ Server running on port 5001
✅ No OpenAI dependency - 100% custom AI
✅ Multi-language support: English + Urdu
✅ Enhanced scoring algorithm
✅ Conversation context tracking
```

**Query processing logs:**
```
============================================================
🤖 RAAHI AI Agent - Processing Query
============================================================
Query: Show me Hunza packages under 30k
Conversation ID: conv_123456789

📋 Initial Parse: {
  "destination": "Hunza",
  "budget": 30000,
  "language": "english",
  "intent": "browse"
}

🔍 Searching packages with filters: {...}
📦 Found 15 packages from database
   Package: Hunza Valley Adventure - Score: 95% (destination match, within budget, highly rated)
   Package: Hunza Weekend Special - Score: 88% (destination match, within budget)
   ...

✅ Returning top 5 recommendations
💬 Response: Great! I found 15 packages to Hunza...
============================================================
```

## Performance Expectations

- **Response time**: < 500ms (vs 2-5s with OpenAI)
- **Success rate**: > 95% for common queries
- **Language detection**: > 90% accuracy
- **Recommendation accuracy**: ~85%+

## Next Steps

Once deployed successfully:

1. ✅ Test all query types (see `ai-agent/TEST-QUERIES.md`)
2. ✅ Monitor logs for errors
3. ✅ Collect user feedback
4. ✅ Track performance metrics
5. ✅ Prepare FYP presentation demo

## FYP Demo Script

**Demo Flow:**

1. **Simple Query**: "Show me Hunza packages"
   - Highlight: Destination extraction

2. **Budget Query**: "Under 30k"
   - Highlight: Context memory (remembers Hunza)

3. **Urdu Query**: "2 din ke liye Swat sasta"
   - Highlight: Multi-language support

4. **Complex Query**: "Family trip to Naran for 3 days under 50k"
   - Highlight: Multiple entity extraction

5. **Show Logs**: Display the query parsing and scoring
   - Highlight: Custom algorithm

## Support

If you encounter any issues:
1. Check Railway logs (Build Logs & Deploy Logs)
2. Verify environment variables
3. Test API endpoints manually with curl
4. Check `AI-AGENT-IMPLEMENTATION-COMPLETE.md` for details

---

**Status**: Ready to deploy! 🚀
