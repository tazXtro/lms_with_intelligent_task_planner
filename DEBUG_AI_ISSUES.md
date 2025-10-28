# AI Course Outline Generator - Debug Guide 🔍

## Current Issue

Getting error: **"Failed to generate course outline"** with meta-llama/llama-3.3-70b-instruct:free model.

## Potential Causes

### 1. **API Key Issues** 🔑
- Invalid or expired API key
- API key doesn't have access to free models
- Rate limit exceeded

### 2. **Model-Specific Issues** 🤖
- Model might not support `response_format: { type: "json_object" }` parameter
- Model might be unavailable or deprecated
- Model might not be in free tier anymore

### 3. **Request Format Issues** 📝
- Prompt too long
- Invalid parameter combination
- OpenRouter API changes

### 4. **Network/Server Issues** 🌐
- OpenRouter service down
- Network timeout
- CORS issues

---

## Debugging Steps (IN ORDER)

### Step 1: Check Browser Console NOW

After clicking "Generate Course Outline", look for these NEW logs:

```
✅ Good Signs:
"Calling OpenRouter API with model: meta-llama/llama-3.3-70b-instruct:free"
"OpenRouter API response status: 200"
"OpenRouter API response data: {...}"
"AI Response (first 200 chars): {...}"
"Successfully parsed AI response"

❌ Bad Signs:
"OpenRouter API response status: 400" or "401" or "429"
"OpenRouter API error response: {...}"
"No AI response content found in: {...}"
"Failed to parse AI response: {...}"
```

**What to do:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Clear console
4. Try generating again
5. **COPY ALL the logs** and share them with me

---

### Step 2: Check Network Tab

1. Open DevTools → Network tab
2. Clear network log
3. Try generating again
4. Find request to `/api/ai/educator/course-outline`
5. Click on it
6. Check:
   - **Status Code**: Should be 200
   - **Response tab**: What did the server return?
   - **Preview tab**: Is there an error message?

**Common Status Codes:**
- `400` = Bad Request (invalid parameters)
- `401` = Unauthorized (API key issue)
- `403` = Forbidden (no access to model)
- `429` = Too Many Requests (rate limited)
- `500` = Server Error (something crashed)
- `503` = Service Unavailable (OpenRouter down)

---

### Step 3: Verify API Key

```bash
# Test your API key directly
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

**Expected:** List of available models
**If error:** API key is invalid

---

### Step 4: Test Different Model

The `meta-llama/llama-3.3-70b-instruct:free` model might have issues. Try these models:

**Option 1: Go back to original**
```typescript
model: "minimax/minimax-m2:free"
```

**Option 2: Try other free models:**
```typescript
// Option A - Very reliable
model: "google/gemini-2.0-flash-exp:free"

// Option B - Also good
model: "meta-llama/llama-3.2-3b-instruct:free"

// Option C - Smaller but fast
model: "qwen/qwen-2-7b-instruct:free"
```

---

### Step 5: Check OpenRouter Status

Visit: https://openrouter.ai/

Look for:
- Service status
- Model availability
- Any announcements about the llama-3.3 model

---

### Step 6: Simplify Request (Test)

Try with minimal input to rule out prompt issues:

```
Topic: "Python"
Level: Beginner
Duration: 5
Category: Programming
```

If this works but longer topics don't, it's a token limit issue.

---

## Most Likely Causes (Ranked)

### 1. **response_format Not Supported** ⭐⭐⭐⭐⭐

The `response_format: { type: "json_object" }` parameter might not be supported by Llama 3.3.

**I've already removed it in the latest code!** It now says:
```typescript
// Note: response_format may not be supported by all models
```

### 2. **Model Not Available in Free Tier** ⭐⭐⭐⭐

The `meta-llama/llama-3.3-70b-instruct:free` model might:
- Not exist
- Be paid-only
- Be temporarily unavailable

**Solution:** Check console logs for the actual error message!

### 3. **API Key Issue** ⭐⭐⭐

Your API key might:
- Be invalid
- Not have access to this model
- Be rate-limited

**Solution:** Test with `curl` command above

### 4. **Max Tokens Too High** ⭐⭐

`max_tokens: 3000` might exceed free tier limits for this model.

**Solution:** Try `max_tokens: 1000`

---

## Quick Fixes to Try

### Fix 1: Remove response_format (DONE)
Already removed in latest code.

### Fix 2: Lower max_tokens

```typescript
max_tokens: 1000  // Instead of 3000
```

### Fix 3: Change Model Back

```typescript
model: "minimax/minimax-m2:free"  // Known working model
```

### Fix 4: Add Timeout

```typescript
// In the fetch call
signal: AbortSignal.timeout(30000)  // 30 second timeout
```

---

## What The New Logs Will Show

With the comprehensive logging I added, you'll now see:

### Before API Call:
```
Calling OpenRouter API with model: meta-llama/llama-3.3-70b-instruct:free
```

### After API Call:
```
OpenRouter API response status: 200
```

### Full Response:
```
OpenRouter API response data: {
  "choices": [...],
  "model": "...",
  "usage": {...}
}
```

### AI Content:
```
AI Response (first 200 chars): {"courseTitle": "...
```

### Success or Error:
```
Successfully parsed AI response
```

### OR if error:
```
OpenRouter API error response: {"error": {"message": "..."}}
Response status: 400
Parsed error: Model not found
```

---

## Action Items for You

### RIGHT NOW:

1. **Refresh your page** (hard refresh: Ctrl+Shift+R)
2. **Open Console** (F12)
3. **Clear console**
4. **Try generating** a course outline
5. **Copy ALL console output**
6. **Share it with me**

### The console output will tell us EXACTLY what's failing:
- Is it the API key?
- Is it the model?
- Is it the response format?
- Is it parsing?
- Is it something else?

---

## Expected Console Output (Success)

```
Calling OpenRouter API with model: meta-llama/llama-3.3-70b-instruct:free
OpenRouter API response status: 200
OpenRouter API response data: {
  "id": "gen-...",
  "model": "meta-llama/llama-3.3-70b-instruct",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "{\"courseTitle\": \"Introduction to Web Development\", ...}"
      }
    }
  ]
}
AI Response (first 200 chars): {"courseTitle": "Introduction to Web Development", "subtitle": "Learn HTML, CSS, and JavaScript", "description": "This comprehensive course will teach you the fundamentals of web dev...
Successfully parsed AI response: {
  "courseTitle": "Introduction to Web Development",
  "subtitle": "...",
  ...
}
```

---

## Expected Console Output (Error)

If you see this, we know it's a model issue:
```
Calling OpenRouter API with model: meta-llama/llama-3.3-70b-instruct:free
OpenRouter API response status: 400
OpenRouter API error response: {"error": {"message": "Model not found", "code": 404}}
Response status: 400
Parsed error: Model not found
```

If you see this, it's an API key issue:
```
Calling OpenRouter API with model: meta-llama/llama-3.3-70b-instruct:free
OpenRouter API response status: 401
OpenRouter API error response: {"error": {"message": "Invalid API key"}}
Response status: 401
Parsed error: Invalid API key
```

---

## Alternative Models to Try

If `meta-llama/llama-3.3-70b-instruct:free` doesn't work, try these (in order):

### 1. Gemini (Google) - HIGHLY RECOMMENDED
```typescript
model: "google/gemini-2.0-flash-exp:free"
```
- Very good at JSON
- Fast
- Reliable
- Good for course generation

### 2. Original Minimax
```typescript
model: "minimax/minimax-m2:free"
```
- We know this works
- Good fallback

### 3. Smaller Llama
```typescript
model: "meta-llama/llama-3.2-3b-instruct:free"
```
- Smaller, faster
- Better availability

### 4. Qwen
```typescript
model: "qwen/qwen-2-7b-instruct:free"
```
- Good alternative
- Fast responses

---

## Next Steps

1. **Share console logs** (most important!)
2. I'll analyze the exact error
3. We'll apply the specific fix needed
4. Test again

The comprehensive logging I added will give us the EXACT error, not just "Failed to generate course outline".

---

**Let's find out what's actually happening!** 🔍

