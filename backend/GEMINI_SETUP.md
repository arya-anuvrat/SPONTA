# Google Gemini API Setup Guide

## ✅ Step-by-Step Instructions

### Step 1: Get Your Free Gemini API Key

1. **Go to Google AI Studio:**
   - Visit: https://aistudio.google.com/
   - Sign in with your Google account

2. **Get API Key:**
   - Click **"Get API Key"** button (top right)
   - Click **"Create API Key"**
   - Select your Google Cloud project (or create a new one)
   - Copy the API key that appears

3. **Free Tier Limits:**
   - ✅ 15 requests per minute
   - ✅ 1,500 requests per day
   - ✅ No credit card required
   - ✅ Free forever (with limits)

### Step 2: Add API Key to Backend

1. **Create or edit `.env` file:**
   ```bash
   cd backend
   ```

2. **Add your Gemini API key:**
   ```bash
   # Create .env file if it doesn't exist
   touch .env
   
   # Add this line (replace YOUR_KEY_HERE with your actual key)
   GEMINI_API_KEY=YOUR_KEY_HERE
   ```

   **Example:**
   ```
   GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **Make sure `.env` is in `.gitignore`:**
   - Never commit your API key to git!

### Step 3: Test the Setup

1. **Start the backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Test AI verification:**
   ```bash
   node test-ai-verification.js
   ```

   You should see:
   ```
   ✅ GEMINI_API_KEY found
   ✅ AI Verification Result: ...
   ```

### Step 4: Verify It's Working

The AI verification will automatically run when:
- A user completes a challenge
- They upload a photo
- The backend processes the completion

Check the response for:
```json
{
  "aiVerification": {
    "verified": true,
    "confidence": 0.95,
    "reasoning": "..."
  }
}
```

---

## 🔧 Troubleshooting

### Error: "GEMINI_API_KEY is not set"
- Make sure `.env` file exists in `backend/` directory
- Check that the key is spelled correctly: `GEMINI_API_KEY` (not `OPENAI_API_KEY`)
- Restart the server after adding the key

### Error: "API key not valid"
- Make sure you copied the entire key from Google AI Studio
- Check for extra spaces or quotes
- Regenerate the key if needed

### Error: "Rate limit exceeded"
- You've hit the free tier limit (15 requests/minute)
- Wait a minute and try again
- Consider adding rate limiting to your app

### Image fetch errors
- Make sure photo URLs are publicly accessible
- Firebase Storage URLs should be public or signed
- Check that the URL is a valid image format (jpg, png, etc.)

---

## 📊 Free Tier Limits

| Limit | Value |
|-------|-------|
| Requests per minute | 15 |
| Requests per day | 1,500 |
| Cost | **FREE** |
| Credit card required | **NO** |

**Note:** These limits are generous for testing and small-scale use. For production, you may need to upgrade.

---

## 🎯 What Changed

- ✅ Replaced OpenAI with Google Gemini
- ✅ Using `gemini-1.5-flash` model (fast and free)
- ✅ Changed environment variable: `OPENAI_API_KEY` → `GEMINI_API_KEY`
- ✅ Updated image handling for Gemini API format

---

## 📚 Resources

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Gemini Pricing](https://ai.google.dev/pricing) (Free tier available!)

---

## ✅ You're All Set!

Once you add the `GEMINI_API_KEY` to your `.env` file, the AI verification will work automatically. No code changes needed - just add the key and restart the server!

