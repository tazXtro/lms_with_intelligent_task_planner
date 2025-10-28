# 🚨 URGENT: Debug Steps for AI Course Outline Error

## What I Just Did

I added **comprehensive logging** to see EXACTLY what's failing. The error is too generic right now, but the new logs will tell us the real problem.

---

## 📋 What You Need to Do RIGHT NOW

### Step 1: Hard Refresh Your Browser
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

This clears the cache and loads the new logging code.

### Step 2: Open Browser Console
Press **F12** or Right-click → Inspect → Console tab

### Step 3: Clear Console
Click the 🚫 or trash icon to clear old logs

### Step 4: Try Generating Course Outline
1. Go to `/educator/courses/create`
2. Click "AI Generate Course"
3. Fill in:
   ```
   Topic: Python Basics
   Level: Beginner
   Duration: 5
   Category: Programming
   ```
4. Click "Generate Course Outline"

### Step 5: COPY ALL CONSOLE OUTPUT
Copy everything from the console and share it with me.

---

## 🔍 What The Logs Will Show

You'll see one of these scenarios:

### ✅ Scenario 1: Success
```
Calling OpenRouter API with model: meta-llama/llama-3.3-70b-instruct:free
OpenRouter API response status: 200
OpenRouter API response data: {...}
AI Response (first 200 chars): {"courseTitle": ...
Successfully parsed AI response
```
**This means it's working!**

---

### ❌ Scenario 2: API Key Issue
```
Calling OpenRouter API with model: meta-llama/llama-3.3-70b-instruct:free
OpenRouter API response status: 401
OpenRouter API error response: {"error": {"message": "Invalid API key"}}
Parsed error: Invalid API key
```
**Solution:** Check your `.env.local` file, API key might be wrong

---

### ❌ Scenario 3: Model Not Found
```
Calling OpenRouter API with model: meta-llama/llama-3.3-70b-instruct:free
OpenRouter API response status: 404
OpenRouter API error response: {"error": {"message": "Model not found"}}
Parsed error: Model not found
```
**Solution:** The model doesn't exist or isn't available. Need to change model.

---

### ❌ Scenario 4: Rate Limit
```
Calling OpenRouter API with model: meta-llama/llama-3.3-70b-instruct:free
OpenRouter API response status: 429
OpenRouter API error response: {"error": {"message": "Rate limit exceeded"}}
Parsed error: Rate limit exceeded
```
**Solution:** Wait a few minutes or upgrade OpenRouter plan

---

### ❌ Scenario 5: Model Doesn't Support Parameter
```
Calling OpenRouter API with model: meta-llama/llama-3.3-70b-instruct:free
OpenRouter API response status: 400
OpenRouter API error response: {"error": {"message": "Invalid parameter: response_format"}}
Parsed error: Invalid parameter
```
**Solution:** I already removed `response_format`, but if you still see this, we need to adjust other parameters

---

### ❌ Scenario 6: No AI Response
```
Calling OpenRouter API with model: meta-llama/llama-3.3-70b-instruct:free
OpenRouter API response status: 200
OpenRouter API response data: {"choices": []}
No AI response content found in: {...}
```
**Solution:** Model returned empty response, need to adjust prompt or model

---

### ❌ Scenario 7: Parsing Failed
```
Calling OpenRouter API with model: meta-llama/llama-3.3-70b-instruct:free
OpenRouter API response status: 200
OpenRouter API response data: {...}
AI Response (first 200 chars): This is a course about Python...
Failed to parse AI response: No valid JSON found in response
Raw AI response: This is a course about Python basics...
```
**Solution:** AI returned text instead of JSON, need to adjust prompt

---

## 🎯 Quick Fixes Based on What You See

### If it's a 404 (Model Not Found):
Try a different model. Edit `app/api/ai/educator/course-outline/route.ts` line 92:

```typescript
// Try this instead:
model: "google/gemini-2.0-flash-exp:free"
```

or

```typescript
// Or go back to original:
model: "minimax/minimax-m2:free"
```

### If it's 401 (API Key):
Check your `.env.local`:
```env
OPENROUTER_API_KEY=sk-or-v1-YOUR-ACTUAL-KEY-HERE
```

Restart your dev server:
```bash
npm run dev
```

### If it's 429 (Rate Limit):
Wait 5 minutes, then try again.

Or try a less popular model:
```typescript
model: "qwen/qwen-2-7b-instruct:free"
```

---

## 📊 Alternative Models to Try (In Order)

If `meta-llama/llama-3.3-70b-instruct:free` doesn't work:

### 1. Google Gemini (BEST OPTION)
```typescript
model: "google/gemini-2.0-flash-exp:free"
```
✅ Excellent at JSON
✅ Very reliable
✅ Fast
✅ Good for course generation

### 2. Original Minimax (PROVEN TO WORK)
```typescript
model: "minimax/minimax-m2:free"
```
✅ We know this works
✅ Good fallback

### 3. Smaller Llama
```typescript
model: "meta-llama/llama-3.2-3b-instruct:free"
```
✅ More available
✅ Faster

### 4. Qwen
```typescript
model: "qwen/qwen-2-7b-instruct:free"
```
✅ Good alternative

---

## 🔧 How to Change Model

1. Open: `app/api/ai/educator/course-outline/route.ts`
2. Find line 92: `model: "meta-llama/llama-3.3-70b-instruct:free"`
3. Replace with one of the models above
4. Save file
5. Try generating again

---

## 💡 Most Likely Issue

Based on the error, I suspect one of these:

### **95% Likely:** Model availability issue
The `meta-llama/llama-3.3-70b-instruct:free` model might:
- Not exist in OpenRouter's free tier
- Be temporarily unavailable
- Have been renamed or deprecated

**Console logs will confirm this!**

### **4% Likely:** API key issue
Your OpenRouter API key might be invalid or expired.

**Console logs will show "401 Unauthorized" if this is the case**

### **1% Likely:** Everything else
Rate limits, network issues, etc.

---

## 🎯 IMMEDIATE ACTION REQUIRED

1. ✅ **Refresh browser** (Ctrl+Shift+R)
2. ✅ **Open console** (F12)
3. ✅ **Clear console**
4. ✅ **Try generating**
5. ✅ **COPY ALL console output and send to me**

---

## Example of What to Send Me

```
Calling OpenRouter API with model: meta-llama/llama-3.3-70b-instruct:free
OpenRouter API response status: 404
OpenRouter API error response: {"error":{"code":404,"message":"Model 'meta-llama/llama-3.3-70b-instruct:free' not found. Did you mean 'meta-llama/llama-3.3-70b-instruct'?"}}
Response status: 404
Parsed error: Model 'meta-llama/llama-3.3-70b-instruct:free' not found
```

With this info, I can give you the EXACT fix!

---

## 📞 After You Share Logs

Based on what the logs show, I'll:
1. Identify the exact problem
2. Provide the specific fix
3. Update the code if needed
4. Verify it works

---

**The comprehensive logging I added will tell us EXACTLY what's wrong. Please share the console output!** 🙏

