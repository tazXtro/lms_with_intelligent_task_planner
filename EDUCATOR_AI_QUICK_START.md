# Educator AI - Quick Start Guide ⚡

## Setup (2 minutes)

### 1. Add API Key
```env
# Add to .env.local
OPENROUTER_API_KEY=your_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Get your free key at: https://openrouter.ai/

### 2. Verify Installation
All files should already be in place:
- ✅ API routes in `app/api/ai/educator/`
- ✅ UI component at `components/ai-teaching-assistant.tsx`
- ✅ Integrations in educator pages

---

## Features at a Glance

### 🎯 Course Outline Generator
**Where:** Course Creation Page → "AI Generate Course" button

**What it does:**
- Generates complete course structure from a topic
- Creates sections, lessons, objectives, pricing
- Saves hours of planning

**Try it:**
1. Go to `/educator/courses/create`
2. Click "AI Generate Course"
3. Enter: "Python for Beginners"
4. Get instant course outline!

---

### ✨ Content Enhancer
**Where:** Course Creation & Curriculum Builder

**What it does:**
- Polishes descriptions
- Improves learning objectives
- Enhances lesson content
- Creates marketing copy

**Try it:**
1. Write a basic course description
2. Click "Enhance with AI"
3. Get professional copy!

---

### 📝 Assessment Generator
**Where:** Curriculum Builder → Lesson Editor

**What it does:**
- Creates quiz questions from lesson content
- Generates 4-option multiple choice
- Includes explanations and difficulty levels

**Try it:**
1. Add lesson content
2. Click "Generate Quiz"
3. Get 5 instant questions!

---

### 📊 Student Insights
**Where:** Educator Dashboard → "AI Insights" button

**What it does:**
- Analyzes course performance
- Provides actionable recommendations
- Shows trends and health metrics

**Try it:**
1. Go to `/educator/dashboard`
2. Click "AI Insights"
3. Get personalized recommendations!

---

## Common Workflows

### Workflow 1: Create a Course in 10 Minutes
```
1. Navigate to /educator/courses/create
2. Click "AI Generate Course"
3. Enter topic, level, duration
4. Review generated outline
5. Click "Use This Outline"
6. Adjust if needed
7. Save Draft
8. Done! ✅
```

### Workflow 2: Enhance Existing Content
```
1. Open course or lesson
2. Select text to enhance
3. Click "Enhance with AI"
4. Review enhanced version
5. Click "Use This"
6. Save changes
7. Done! ✅
```

### Workflow 3: Add Quizzes to Lessons
```
1. Open lesson in curriculum builder
2. Ensure lesson has content
3. Click "Generate Quiz"
4. Review 5 generated questions
5. Copy or save
6. Done! ✅
```

---

## Tips & Tricks

### 💡 Getting Best Results

**For Course Outlines:**
- Be specific with topic names
- Include target skill level
- Specify duration if known
- Add category for better context

**For Content Enhancement:**
- Start with a decent draft
- The better your input, the better the output
- Use for polishing, not creating from scratch

**For Assessments:**
- Lesson content should be detailed
- Include examples and explanations
- Specify desired difficulty

**For Insights:**
- More course data = better analysis
- Check insights regularly
- Implement recommendations

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Close AI Modal | `Esc` |
| Copy Content | Click Copy button |

---

## Troubleshooting

### ❌ "API key not configured"
→ Add `OPENROUTER_API_KEY` to `.env.local`

### ❌ "Failed to generate"
→ Check internet connection
→ Verify API key is valid
→ Try again (API might be busy)

### ❌ Content seems generic
→ Provide more detailed input
→ Add specific context
→ Try generating again

---

## Cost & Limits

**Model Used:** Minimax M2 (Free tier)

**Free Tier:**
- Rate limits apply
- Good for testing and moderate use
- Check OpenRouter for details

**Paid Tier:**
- Faster responses
- Higher rate limits
- Better for production

---

## Next Steps

1. ✅ Set up API key
2. ✅ Try each feature once
3. ✅ Create a test course with AI
4. ✅ Read full documentation
5. ✅ Start creating real courses!

---

## Support

- **Full Documentation:** See `EDUCATOR_AI_IMPLEMENTATION.md`
- **OpenRouter Docs:** https://openrouter.ai/docs
- **Issues:** Check troubleshooting section

---

**Ready to supercharge your course creation?** 🚀

Start at: `/educator/courses/create` → Click "AI Generate Course"

