# AI Integration Guide - Task Planner

This guide explains how to set up and use the AI-powered task suggestions feature in DigiGyan LMS.

## Overview

The AI integration uses **OpenRouter** with the **minimax/minimax-m2:free** model to provide intelligent task planning assistance. The AI analyzes learner tasks and provides:

- **Subtask Breakdown**: Breaks complex tasks into manageable steps
- **Study Schedules**: Suggests optimal study schedules based on deadlines
- **Learning Strategies**: Recommends effective learning approaches
- **Resources**: Identifies prerequisites and helpful resources

## Setup Instructions

### 1. Get OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up or log in to your account
3. Navigate to [API Keys](https://openrouter.ai/keys)
4. Create a new API key
5. Copy your API key

### 2. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your OpenRouter API key:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. Save the file

### 3. Restart Development Server

```bash
npm run dev
```

## How It Works

### Frontend Flow

1. **User clicks AI button** on any task card
2. **Loading state** is displayed with a spinner
3. **API call** is made to `/api/ai/task-suggestions`
4. **AI analyzes** the task with context about all tasks
5. **Suggestions displayed** in a panel above the Kanban board

### API Route

The API route at `app/api/ai/task-suggestions/route.ts`:

- Receives task data and all tasks for context
- Calculates task urgency based on due dates
- Analyzes learner's workload (todo, in-progress, completed counts)
- Finds related tasks in the same course
- Sends a detailed prompt to OpenRouter's minimax model
- Parses and formats the AI response
- Returns structured suggestions to the frontend

### AI Prompt Structure

The AI receives:

**System Prompt**: Defines the AI's role as an intelligent task planning assistant

**User Prompt**: Includes:
- Task details (title, description, course, priority, due date, status)
- Learner's context (total tasks, workload distribution)
- Related tasks in the same course
- Specific instructions for generating subtasks, schedules, strategies, and resources

## Features

### 1. Intelligent Subtask Generation

The AI breaks down complex tasks into 3-5 actionable subtasks:

```json
{
  "subtasks": [
    "Watch video lectures on React Hooks",
    "Complete practice exercises",
    "Build a mini project using hooks"
  ]
}
```

### 2. Smart Study Scheduling

Based on the due date and task complexity, the AI suggests an optimal study schedule:

```
"Dedicate 2 hours daily for the next 3 days:
Day 1: Watch lectures and take notes
Day 2: Complete exercises
Day 3: Build project and review"
```

### 3. Learning Strategy Recommendations

The AI recommends effective learning approaches:

```
"Use active recall and spaced repetition. 
After watching lectures, test yourself without notes.
Review concepts again before starting exercises."
```

### 4. Resource Identification

The AI identifies prerequisites and helpful resources:

```
"Prerequisites: JavaScript fundamentals, ES6 syntax
Resources: React official docs, interactive coding challenges"
```

## Model Information

**Model**: `minimax/minimax-m2:free`

**Advantages**:
- Free tier available
- Good for educational applications
- Supports structured JSON responses
- Fast response times

**Parameters**:
- Temperature: 0.7 (balanced creativity and consistency)
- Max Tokens: 1000 (sufficient for detailed suggestions)

## Error Handling

The implementation includes robust error handling:

1. **Missing API Key**: Returns 500 error with clear message
2. **OpenRouter API Error**: Logs error and returns graceful failure
3. **Invalid Response**: Falls back to error message
4. **Network Issues**: Shows user-friendly error in UI

## UI/UX Features

### Loading State
- Animated spinner
- Informative loading message
- Prevents multiple simultaneous requests

### Error State
- Clear error messages
- Styled error panel with AlertCircle icon
- Suggests checking API configuration

### Success State
- Organized suggestion cards
- Expandable subtasks
- Hover effects for better interaction
- Easy-to-read formatting

## Customization

### Adjust AI Behavior

Edit `app/api/ai/task-suggestions/route.ts`:

```typescript
// Change temperature for more/less creative suggestions
temperature: 0.7, // 0.0 = deterministic, 1.0 = creative

// Adjust max tokens for longer/shorter responses
max_tokens: 1000,

// Modify the prompt for different suggestion types
const systemPrompt = `Your custom instructions...`
```

### Change Model

To use a different model:

```typescript
model: "openai/gpt-3.5-turbo", // or any OpenRouter supported model
```

See [OpenRouter Models](https://openrouter.ai/models) for available options.

## Usage Example

1. Navigate to http://localhost:3000/learner/tasks
2. Find any task card (in To Do or In Progress columns)
3. Click the **AI** button (with Sparkles icon)
4. Wait for AI suggestions to generate
5. Review the suggestions:
   - Subtasks to complete
   - Study schedule
   - Learning strategy
   - Recommended resources
6. Apply suggestions to your learning plan

## Troubleshooting

### "OpenRouter API key not configured"

**Solution**: Make sure `.env.local` exists and contains:
```env
OPENROUTER_API_KEY=sk-or-v1-...
```

### "Failed to generate AI suggestions"

**Possible causes**:
1. Invalid API key
2. OpenRouter service issues
3. Network connectivity problems

**Solution**: Check browser console for detailed error messages

### AI returns generic suggestions

**Solution**: Ensure tasks have:
- Descriptive titles
- Relevant course names
- Accurate due dates

## Future Enhancements

Potential improvements:

1. **Apply Suggestions**: One-click apply subtasks to task
2. **Calendar Integration**: Sync suggested schedule to Google Calendar
3. **Learning Analytics**: Track suggestion effectiveness
4. **Personalization**: Learn from user preferences over time
5. **Multi-language Support**: Suggestions in user's preferred language
6. **Voice Input**: Describe tasks verbally for AI analysis

## API Costs

**minimax/minimax-m2:free** is currently free on OpenRouter, but:

- Check [OpenRouter Pricing](https://openrouter.ai/models) for current rates
- Monitor your usage on the OpenRouter dashboard
- Consider upgrading to paid models for higher limits
- Set up rate limiting if needed for production

## Best Practices

1. **Descriptive Task Titles**: Help AI understand the task context
2. **Accurate Due Dates**: Enable better schedule suggestions
3. **Course Names**: Link tasks to courses for better context
4. **Regular Usage**: Build up task history for better AI insights
5. **Review Suggestions**: AI assists but doesn't replace human judgment

## Support

For issues or questions:
- Check this guide first
- Review error messages in browser console
- Check OpenRouter status page
- Consult OpenRouter documentation

---

**Note**: This implementation is designed for educational purposes. For production use, consider:
- Rate limiting
- User authentication for API calls
- Caching frequently requested suggestions
- Monitoring and analytics
- Error tracking (e.g., Sentry)

