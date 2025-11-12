# AI Interview Platform - Quick Start Guide

## 🚀 Get Started in 3 Minutes

### Prerequisites
✅ DigiGyan LMS installed  
✅ OpenRouter API key configured  
✅ Supabase database connected

---

## Step 1: Run Database Migration

Execute the interview sessions migration:

```bash
# Navigate to your project directory
cd digigyan-lms

# Run the migration (if using Supabase CLI)
supabase db push

# OR copy the SQL from:
# supabase/migrations/20240112000000_create_interview_sessions.sql
# And run it in Supabase Studio SQL Editor
```

---

## Step 2: Verify Environment Variables

Ensure your `.env.local` has:

```env
OPENROUTER_API_KEY=your_api_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Step 3: Start Your Dev Server

```bash
npm run dev
```

---

## Step 4: Test the Feature

1. **Login as a Learner**
   - Navigate to `/auth`
   - Login with a learner account

2. **Access AI Interview**
   - Click "AI Interview" in the sidebar (mic icon)
   - You should see the interview preparation page

3. **Start Your First Interview**
   - Paste this sample job description:
   ```
   Position: Frontend Developer
   Requirements:
   - 3+ years React experience
   - Strong JavaScript/TypeScript skills
   - Experience with modern UI frameworks
   - Excellent problem-solving abilities
   - Good communication skills
   ```
   - Click "Start AI Interview"
   - Allow microphone access (if prompted)

4. **Conduct Interview**
   - Wait for AI's first question
   - Click "Start Recording" to answer
   - Speak your answer clearly
   - Click "Stop Recording" when done
   - Click "Submit Answer"
   - Repeat for 5-8 questions

5. **View Feedback**
   - Click "View Feedback & Results" when complete
   - Review your comprehensive feedback
   - Check your overall score
   - Read recommendations

---

## 🎤 Voice Setup

### Browser Requirements
- **Best**: Chrome or Edge (full support)
- **Good**: Safari (limited support)
- **Fallback**: Any browser (text input mode)

### Microphone Permissions
1. When prompted, click "Allow" for microphone access
2. If blocked, click the lock icon in address bar
3. Enable microphone permissions
4. Refresh the page

### Audio Troubleshooting
- Ensure system volume is up
- Check microphone is not muted
- Toggle audio button in interview modal
- Try different browser if issues persist

---

## 📱 Feature Overview

### Main Components
- **Interview Page**: `/learner/ai-interview`
- **Interview Modal**: Voice-enabled interview interface
- **Feedback View**: Detailed performance analysis
- **History**: Past interviews with scores

### Key Capabilities
✅ Voice-to-text answer recording  
✅ AI-generated interview questions  
✅ Real-time conversation flow  
✅ Comprehensive performance feedback  
✅ Interview history tracking  
✅ Score and progress analytics

---

## 🎯 User Guide

### For Learners

#### Before Interview
1. Find a quiet environment
2. Have job description ready
3. Test microphone (optional)
4. Review job requirements

#### During Interview
1. Listen to each question carefully
2. Think before answering
3. Speak clearly and at moderate pace
4. Use STAR method for behavioral questions:
   - **S**ituation
   - **T**ask
   - **A**ction
   - **R**esult
5. Be honest and authentic

#### After Interview
1. Review feedback carefully
2. Note strengths to maintain
3. Focus on improvement areas
4. Implement recommendations
5. Practice again with different roles

---

## 🔍 Testing Checklist

### Functional Tests
- [ ] Can create new interview session
- [ ] Microphone permission request works
- [ ] Voice recording captures speech
- [ ] Transcript displays correctly
- [ ] Submit answer processes successfully
- [ ] AI generates relevant follow-up questions
- [ ] Interview completes after 5-8 questions
- [ ] Feedback generation works
- [ ] Scores and assessments display
- [ ] Interview history shows past sessions
- [ ] Can view past interview feedback

### Edge Cases
- [ ] Works without microphone (text fallback)
- [ ] Handles long job descriptions
- [ ] Works with short answers
- [ ] Handles API errors gracefully
- [ ] Audio toggle functions correctly
- [ ] Modal close preserves data
- [ ] Database saves conversation history

---

## 🐛 Common Issues & Fixes

### Issue: "Speech recognition not supported"
**Fix**: Use Chrome, Edge, or Safari. Or use text input mode.

### Issue: Microphone not working
**Fix**: 
1. Check browser permissions
2. Ensure HTTPS (localhost is ok)
3. Try different browser
4. Use text input as alternative

### Issue: Interview won't start
**Fix**:
1. Verify OpenRouter API key in .env.local
2. Check job description is not empty
3. Ensure logged in as learner
4. Check console for errors

### Issue: Feedback not loading
**Fix**:
1. Wait 10-15 seconds (AI processing time)
2. Refresh if stuck over 30 seconds
3. Check OpenRouter API credits
4. Review API logs for errors

### Issue: Audio not playing
**Fix**:
1. Check audio toggle is enabled
2. Verify system volume
3. Try different browser
4. Check browser console for TTS errors

---

## 📊 Sample Interview Flow

### Example Session

**AI**: "Hello! Thank you for joining me today. Let's begin. Can you tell me about your experience with React and why you're interested in this Frontend Developer position?"

**You**: [Record/Type Answer] "I have 4 years of React experience, building several production applications..."

**AI**: "That's great to hear. Can you describe a challenging technical problem you solved using React?"

**You**: [Record/Type Answer] "In my last project, we had performance issues with..."

**AI**: "Excellent problem-solving approach. How do you stay updated with the latest frontend technologies?"

**You**: [Record/Type Answer] "I regularly read tech blogs, contribute to open source..."

[Continue for 5-8 questions total]

**AI**: "Thank you for your time today. That concludes our interview. Best of luck!"

[View Feedback showing 85/100 score with detailed analysis]

---

## 🎓 Tips for Best Results

### Preparation Tips
1. Read job description thoroughly
2. Research company (if specified)
3. Prepare STAR method examples
4. Practice speaking clearly
5. Have notes ready (but don't read)

### During Interview Tips
1. Take a breath before answering
2. Be concise but thorough
3. Show enthusiasm
4. Ask for clarification if needed
5. Stay professional

### After Interview Tips
1. Review all feedback sections
2. Practice weak areas identified
3. Try different job types
4. Track improvement over time
5. Use recommendations actionably

---

## 📈 Progress Tracking

### Metrics to Monitor
- **Overall Score**: Aim for 80+ consistently
- **Skills Breakdown**: Identify weakest area
- **Readiness Level**: Goal is "Interview Ready"
- **Interview Quality**: Aim for "Excellent" or "Good"
- **Completion Rate**: Finish all started interviews

### Improvement Strategy
1. **Week 1-2**: Practice 2-3 interviews
2. **Week 3-4**: Focus on weakest skill area
3. **Week 5-6**: Try various job types
4. **Week 7+**: Maintain with 1 interview/week

---

## 🔗 Related Documentation

- **Full Implementation Guide**: See `AI_INTERVIEW_IMPLEMENTATION.md`
- **API Reference**: Check `app/api/ai/interview/route.ts`
- **Database Schema**: Review `supabase/migrations/20240112000000_create_interview_sessions.sql`

---

## 💡 Pro Tips

1. **Use Real Job Postings**: Copy actual jobs you're applying for
2. **Practice Regularly**: Consistency improves performance
3. **Review Transcripts**: Learn from your answers
4. **Focus on Feedback**: Actionable improvements matter
5. **Track Trends**: Compare scores over time
6. **Vary Practice**: Different roles = different questions
7. **Stay Calm**: Treat it like a real interview

---

## 🎉 Success Stories

### What to Expect
- **First Interview**: Baseline score (typically 50-70)
- **After 3-5 Practices**: Notable improvement (70-80)
- **After 10+ Practices**: Consistent high scores (80-90)
- **Real Interviews**: Increased confidence and performance

---

## 📞 Need Help?

### Resources
- Check browser console for errors
- Review `AI_INTERVIEW_IMPLEMENTATION.md` for details
- Verify all prerequisites are met
- Test with sample job description above

### Debug Mode
Enable detailed logging:
```typescript
// In browser console
localStorage.setItem('debug', 'true')
```

---

## 🚀 You're Ready!

The AI Interview Platform is now fully set up and ready to help your learners ace their job interviews. Start practicing today!

**Remember**: The more you practice, the better you'll perform in real interviews. Good luck! 🎯

---

**Quick Access**: `/learner/ai-interview`  
**Feature Status**: ✅ Fully Operational  
**Support**: See troubleshooting section above

