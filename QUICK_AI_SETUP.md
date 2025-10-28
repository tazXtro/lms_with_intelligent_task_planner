# Quick AI Setup Guide

## 🚀 Get Started in 3 Steps

### Step 1: Get API Key
Visit https://openrouter.ai/keys and create a new API key

### Step 2: Create `.env.local`
```bash
OPENROUTER_API_KEY=sk-or-v1-your-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 3: Restart Server
```bash
npm run dev
```

## ✅ Test It

1. Go to http://localhost:3000/learner/tasks
2. Click the **AI** button (✨) on any task
3. Watch the AI generate intelligent suggestions!

## 🤖 What the AI Does

- **Breaks down tasks** into manageable subtasks
- **Suggests study schedules** based on deadlines
- **Recommends learning strategies** for better retention
- **Identifies prerequisites** and helpful resources

## 📊 Model Details

- **Provider**: OpenRouter
- **Model**: minimax/minimax-m2:free
- **Cost**: FREE tier available
- **Speed**: Fast responses (~2-5 seconds)

## 💡 Tips for Best Results

1. Use descriptive task titles (e.g., "Complete React Hooks Module" not "Module 3")
2. Set accurate due dates
3. Link tasks to course names
4. Add task descriptions when available

## 🐛 Troubleshooting

**Error: "OpenRouter API key not configured"**
- Make sure `.env.local` exists in the project root
- Verify your API key is correct
- Restart the dev server

**Error: "Failed to generate AI suggestions"**
- Check your internet connection
- Verify your OpenRouter account has credits
- Check browser console for details

## 📚 Full Documentation

For detailed information, see:
- `AI_INTEGRATION_GUIDE.md` - Complete implementation guide
- `ENV_SETUP.md` - Environment variables reference

