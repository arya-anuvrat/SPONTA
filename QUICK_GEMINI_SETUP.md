# 🚀 Quick Gemini Setup - 3 Steps

## ✅ Code is Already Updated!

All code has been changed from OpenAI to Google Gemini. You just need to add your API key.

---

## Step 1: Get Free API Key (2 minutes)

1. **Go to:** https://aistudio.google.com/
2. **Sign in** with Google account
3. **Click:** "Get API Key" (top right)
4. **Click:** "Create API Key"
5. **Copy** the key (looks like: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

**Free Tier:**
- ✅ 15 requests/minute
- ✅ 1,500 requests/day
- ✅ No credit card needed
- ✅ Free forever

---

## Step 2: Add Key to Backend (1 minute)

```bash
cd backend
```

**Create `.env` file** (if it doesn't exist):
```bash
touch .env
```

**Add this line:**
```
GEMINI_API_KEY=your_actual_key_here
```

**Example:**
```
GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ Important:** Make sure `.env` is in `.gitignore` (don't commit your key!)

---

## Step 3: Test It (30 seconds)

```bash
cd backend
node test-ai-verification.js
```

**Expected output:**
```
✅ GEMINI_API_KEY found
✅ AI Verification Result:
   Verified: true/false
   Confidence: 0.XX
   Reasoning: ...
```

---

## ✅ Done!

Once you add the key, AI verification will work automatically when users complete challenges with photos.

---

## 🐛 Troubleshooting

**"GEMINI_API_KEY not found":**
- Make sure `.env` file is in `backend/` directory
- Check spelling: `GEMINI_API_KEY` (not `OPENAI_API_KEY`)
- Restart server after adding key

**"API key not valid":**
- Make sure you copied the entire key
- No extra spaces or quotes
- Regenerate key if needed

---

## 📝 What Changed

- ✅ Replaced OpenAI with Gemini
- ✅ Using `gemini-1.5-flash` model
- ✅ Changed env var: `OPENAI_API_KEY` → `GEMINI_API_KEY`
- ✅ Removed OpenAI package
- ✅ Added Gemini package

**Everything else works the same!** Just add the key and you're good to go! 🎉

