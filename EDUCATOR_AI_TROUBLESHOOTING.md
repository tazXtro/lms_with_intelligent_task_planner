# Educator AI - Troubleshooting Guide 🔧

## Common Issues & Solutions

### Issue: "Failed to parse AI response"

**Symptoms:**
- Error message: "Failed to parse AI response"
- Occurs when clicking "Generate Course Outline"
- Console shows parsing errors

**Root Cause:**
The AI model (minimax/minimax-m2:free) sometimes returns responses in non-standard JSON formats, including:
- JSON wrapped in markdown code blocks
- JSON with extra explanatory text
- Malformed JSON structure
- JSON with comments

**Solution Implemented:**
We've implemented a **multi-strategy JSON parser** that:

1. **Strategy 1:** Direct JSON parse (fastest)
2. **Strategy 2:** Extract from markdown code blocks (```json...```)
3. **Strategy 3:** Find JSON object in mixed text
4. **Validation:** Verify the parsed object structure
5. **Detailed Logging:** Show exactly what the AI returned

**What Was Fixed:**

```typescript
// Before: Single parsing attempt
parsedResponse = JSON.parse(aiResponse)

// After: Multiple fallback strategies
try {
  parsedResponse = JSON.parse(aiResponse.trim())
} catch {
  // Try markdown extraction
  const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/)
  if (jsonMatch) {
    parsedResponse = JSON.parse(jsonMatch[1].trim())
  } else {
    // Try finding JSON in text
    const objectMatch = aiResponse.match(/\{[\s\S]*\}/)
    parsedResponse = JSON.parse(objectMatch[0])
  }
}
```

**Additional Improvements:**
- Added `response_format: { type: "json_object" }` to API request
- Updated prompt to explicitly request JSON-only output
- Increased `max_tokens` from 2000 to 3000
- Lowered `temperature` from 0.8 to 0.7 for more reliable output
- Added comprehensive error messages with details
- Added console logging to see actual AI responses

**How to Test the Fix:**
1. Navigate to `/educator/courses/create`
2. Click "AI Generate Course"
3. Fill in:
   - Topic: "Introduction to Web Development"
   - Level: Beginner
   - Duration: 10 hours
4. Click "Generate Course Outline"
5. Check browser console for detailed logs
6. Should now work successfully!

---

### Issue: Slow Response Times

**Symptoms:**
- AI takes 10+ seconds to respond
- Sometimes times out

**Causes:**
- Free tier rate limits on OpenRouter
- Complex prompts requiring more processing
- Network latency

**Solutions:**
1. **Wait patiently:** Free tier may be slower during peak times
2. **Simplify input:** Shorter topics generate faster
3. **Upgrade plan:** Consider OpenRouter paid tier for production
4. **Check status:** Verify OpenRouter service status
5. **Retry:** Click "Generate Again" if timeout occurs

---

### Issue: Generic or Poor Quality Responses

**Symptoms:**
- AI generates vague course outlines
- Content lacks detail
- Doesn't match input topic well

**Solutions:**

**1. Provide More Detailed Input:**
```
❌ Bad: "Python"
✅ Good: "Python for Data Science - Focus on pandas, numpy, and visualization"

❌ Bad: "Web Design"
✅ Good: "Modern Web Design with HTML5, CSS3, and Responsive Principles"
```

**2. Specify All Fields:**
- Always fill in topic, level, category, and duration
- More context = better results

**3. Use Specific Categories:**
```
❌ Generic: "Other"
✅ Specific: "Web Development", "Data Science", "UI/UX Design"
```

**4. Set Appropriate Duration:**
- Short course: 5-10 hours
- Medium course: 10-20 hours
- Long course: 20-40 hours
- Comprehensive: 40+ hours

**5. Try Again:**
- AI responses vary due to temperature setting
- Click "Generate Again" for different results

---

### Issue: Missing Fields in Generated Outline

**Symptoms:**
- Some course fields are empty or null
- Sections or lessons not generated

**Solution:**
The AI should generate all fields, but if some are missing:

1. **Check Console:** Look for parsing warnings
2. **Regenerate:** Try generating again
3. **Manual Fill:** Fill in missing fields manually
4. **Report Pattern:** If consistently missing specific fields, let developers know

---

### Issue: API Key Not Configured

**Symptoms:**
- Error: "OpenRouter API key not configured"
- No AI features work

**Solution:**
```bash
# 1. Create .env.local file in project root
touch .env.local

# 2. Add your API key
echo "OPENROUTER_API_KEY=sk-or-v1-your-key-here" >> .env.local
echo "NEXT_PUBLIC_SITE_URL=http://localhost:3000" >> .env.local

# 3. Restart development server
npm run dev
```

Get your free API key at: https://openrouter.ai/

---

### Issue: Content Enhancer Not Working

**Symptoms:**
- "Enhance with AI" button doesn't improve content
- Returns similar or worse text

**Solutions:**

**1. Provide Better Source Material:**
```
❌ Too short: "Learn Python"
✅ Better: "This course teaches Python programming basics including variables, functions, and object-oriented concepts."
```

**2. Use Correct Enhancement Type:**
- **Description:** Full course descriptions (2-3 paragraphs)
- **Objectives:** List of learning objectives
- **Lesson Content:** Detailed lesson text
- **Marketing:** Promotional copy with CTAs

**3. Give Context:**
The component passes context automatically, but ensure:
- Course topic is set
- Level is appropriate
- Target audience is defined

---

### Issue: Assessment Generator Creates Poor Questions

**Symptoms:**
- Questions are too easy/hard
- Options don't make sense
- Explanations are vague

**Solutions:**

**1. Provide Rich Lesson Content:**
```
❌ Minimal: "Variables store data"
✅ Detailed: "Variables in Python are containers that store data values. Unlike other languages, Python variables don't need explicit declaration. You can create a variable by assigning a value: x = 5. Variables can store different data types including integers, strings, and lists."
```

**2. Adjust Difficulty:**
- Easy: Basic recall questions
- Medium: Application and understanding
- Hard: Analysis and synthesis

**3. Adjust Question Count:**
- Start with 3-5 questions
- More questions require more content

**4. Review and Edit:**
- Always review generated questions
- Edit for clarity and accuracy
- Verify correct answers

---

### Issue: Student Insights Show No Data

**Symptoms:**
- Dashboard shows "AI Insights" button but clicking shows empty insights
- Insights panel doesn't load

**Causes:**
- No enrollment data yet
- New course without students
- Insufficient data for analysis

**Solutions:**
1. **Wait for Data:** Insights require actual student enrollments
2. **Test Mode:** Use with courses that have enrollments
3. **Check Console:** Look for API errors
4. **Manual Trigger:** Click "AI Insights" button to force generation

---

## Debugging Tips

### Enable Detailed Logging

**1. Check Browser Console:**
```javascript
// Look for these logs:
"Successfully parsed AI response"
"Raw AI response: ..."
"Failed to parse AI response: ..."
```

**2. Check Network Tab:**
- Open DevTools → Network
- Filter: "ai/educator"
- Inspect request/response
- Check status codes

**3. Server Logs:**
```bash
# Terminal where Next.js is running
# Look for:
console.error("OpenRouter API error:", errorData)
console.error("Failed to parse AI response:", parseError)
console.log("Successfully parsed AI response:", ...)
```

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check input validation |
| 401 | Unauthorized | Verify API key |
| 429 | Rate Limit | Wait or upgrade plan |
| 500 | Server Error | Check logs, retry |
| 503 | Service Unavailable | OpenRouter down, retry later |

### Testing Each Feature

**Course Outline Generator:**
```bash
# Test with simple input
Topic: "Python Basics"
Level: Beginner
Duration: 10
Category: Programming

# Expected: Complete outline in 5-8 seconds
```

**Content Enhancer:**
```bash
# Test with basic text
Text: "This course teaches web development using HTML and CSS."
Type: Description

# Expected: Enhanced 2-3 paragraph description
```

**Assessment Generator:**
```bash
# Test with lesson content
Content: "Variables in Python store data. Use x = 5 to assign."
Questions: 3
Difficulty: Easy

# Expected: 3 multiple-choice questions
```

**Student Insights:**
```bash
# Requires course with enrollments
# Check dashboard after course has students

# Expected: Health status, insights, recommendations
```

---

## Performance Optimization

### If Responses Are Slow:

**1. Reduce Token Limits:**
```typescript
// In API route
max_tokens: 2000  // Instead of 3000
```

**2. Lower Temperature:**
```typescript
temperature: 0.6  // Instead of 0.7
```

**3. Simplify Prompts:**
- Shorter system prompts
- More concise user prompts
- Fewer examples

**4. Cache Common Requests:**
(Future enhancement)

### If Rate Limited:

**1. Implement Retry Logic:**
```typescript
// Exponential backoff
await new Promise(r => setTimeout(r, 2000))
retry()
```

**2. Upgrade Plan:**
- Free tier: Limited requests/minute
- Paid tier: Higher limits
- Enterprise: Unlimited

---

## Known Limitations

### Current Limitations:

1. **Free Model Constraints:**
   - May be slow during peak hours
   - Limited context window
   - JSON formatting inconsistent

2. **No Persistence:**
   - Generated assessments not saved to database (yet)
   - Must copy/paste quiz questions

3. **No Real-Time Data:**
   - Student insights use estimated data
   - Actual lesson progress not integrated (yet)

4. **Language:**
   - English only currently
   - Multi-language support planned

### Workarounds:

1. **For Slow Responses:** Use paid tier or retry during off-peak
2. **For Assessments:** Copy questions and save manually
3. **For Insights:** Use with actual enrollment data
4. **For Languages:** Use English, translate manually

---

## Best Practices

### Do's ✅

- ✅ **Provide detailed input** - More context = better results
- ✅ **Review AI output** - Always verify before using
- ✅ **Customize generated content** - Add your expertise
- ✅ **Test with real data** - Use actual course scenarios
- ✅ **Check console logs** - Helps diagnose issues
- ✅ **Report bugs** - Help improve the system

### Don'ts ❌

- ❌ **Don't trust blindly** - AI can make mistakes
- ❌ **Don't use without editing** - Personalize content
- ❌ **Don't ignore errors** - Check logs for details
- ❌ **Don't overload requests** - Respect rate limits
- ❌ **Don't share API keys** - Keep credentials secure
- ❌ **Don't expect perfection** - AI assists, doesn't replace you

---

## Getting Help

### If Issues Persist:

1. **Check Documentation:**
   - `EDUCATOR_AI_IMPLEMENTATION.md`
   - `EDUCATOR_AI_QUICK_START.md`
   - This troubleshooting guide

2. **Review Console:**
   - Browser DevTools console
   - Server terminal logs
   - Network requests

3. **Test API Key:**
   ```bash
   # Verify key works
   curl https://openrouter.ai/api/v1/models \
     -H "Authorization: Bearer $OPENROUTER_API_KEY"
   ```

4. **Check OpenRouter Status:**
   - Visit https://openrouter.ai/
   - Check status page
   - Review API documentation

5. **Simplify Test:**
   - Use minimal input
   - One feature at a time
   - Rule out complexity

---

## Recent Fixes

### Version 1.1 (Current)

**Fixed:**
- ✅ Multi-strategy JSON parsing
- ✅ Better error messages with details
- ✅ Increased token limits
- ✅ Improved prompts for JSON output
- ✅ Added comprehensive logging
- ✅ Response format specification

**Improved:**
- ✅ All 4 AI endpoints now use robust parsing
- ✅ Better validation of parsed responses
- ✅ Detailed error reporting
- ✅ Console debugging information

---

## FAQ

**Q: Why does it sometimes fail to parse?**
A: Free AI models can return non-standard JSON. We've added multiple parsing strategies to handle this.

**Q: Can I use a different AI model?**
A: Yes! Edit the API routes and change `model: "minimax/minimax-m2:free"` to any OpenRouter-supported model.

**Q: Is my data sent to OpenRouter?**
A: Yes, but only the content you're generating. OpenRouter doesn't store it per their privacy policy.

**Q: Can I run this offline?**
A: No, it requires internet connection to OpenRouter API.

**Q: How much does it cost?**
A: The free tier is $0. Paid models range from $0.001 to $0.03 per request.

**Q: Can I customize the prompts?**
A: Yes! Edit the system prompts in the API route files.

---

## Success Checklist

Before reporting an issue, verify:

- [ ] API key is configured in `.env.local`
- [ ] Development server is running
- [ ] Browser console shows no errors
- [ ] Network requests complete successfully
- [ ] Input fields are filled correctly
- [ ] OpenRouter service is online
- [ ] Using latest code version

If all checked and still having issues, proceed with debugging steps above.

---

**Last Updated:** October 2025  
**Version:** 1.1 (Multi-strategy parsing)

For additional help, refer to main documentation files.

