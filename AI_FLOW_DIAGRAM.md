# AI Integration Flow Diagram

## Visual Flow of AI Task Suggestions

```
┌─────────────────────────────────────────────────────────────────┐
│                      LEARNER TASK PAGE                          │
│                  http://localhost:3000/learner/tasks            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ User clicks AI button (✨)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (page.tsx)                         │
│                                                                 │
│  1. handleGenerateAiSuggestions(task) called                   │
│  2. Set loading state (show spinner)                           │
│  3. Clear previous suggestions and errors                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ POST /api/ai/task-suggestions
                              │ Body: { task, allTasks }
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              API ROUTE (route.ts)                               │
│                                                                 │
│  1. Validate request (check task exists)                       │
│  2. Check OPENROUTER_API_KEY                                   │
│  3. Calculate context:                                         │
│     - Days until due                                           │
│     - Task counts (todo/in-progress/completed)                 │
│     - Related tasks in same course                             │
│  4. Build AI prompts (system + user)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ POST to OpenRouter API
                              │ Model: minimax/minimax-m2:free
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OPENROUTER API                               │
│              https://openrouter.ai/api/v1                       │
│                                                                 │
│  1. Authenticate with API key                                  │
│  2. Route to minimax model                                     │
│  3. Generate AI response                                       │
│  4. Return completion                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ AI Response (JSON/Text)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              API ROUTE (route.ts) - Response Processing        │
│                                                                 │
│  1. Parse AI response                                          │
│  2. Extract JSON (handle markdown code blocks)                 │
│  3. Format suggestions:                                        │
│     - Subtasks breakdown                                       │
│     - Study schedule                                           │
│     - Learning strategy                                        │
│     - Resources & prerequisites                                │
│  4. Return formatted JSON                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Return suggestions to frontend
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (page.tsx)                         │
│                                                                 │
│  1. Receive suggestions                                        │
│  2. Update state (setAiSuggestions)                            │
│  3. Clear loading state                                        │
│  4. Render AI suggestions panel                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Display to user
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    UI DISPLAY                                   │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  ✨ AI Suggestions for "Complete React Hooks Module"  [X]│ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │                                                           │ │
│  │  🎯 Break Down Task                                      │ │
│  │  Split into 3 subtasks:                                  │ │
│  │   1. Watch video lectures on React Hooks                 │ │
│  │   2. Complete practice exercises                         │ │
│  │   3. Build mini project using hooks                      │ │
│  │                                                           │ │
│  │  📅 Study Schedule                                       │ │
│  │  Dedicate 2 hours daily for 3 days...                    │ │
│  │                                                           │ │
│  │  🎓 Learning Strategy                                    │ │
│  │  Use active recall and spaced repetition...              │ │
│  │                                                           │ │
│  │  📚 Resources & Prerequisites                            │ │
│  │  Review JavaScript fundamentals first...                 │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Error Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      ERROR SCENARIOS                            │
└─────────────────────────────────────────────────────────────────┘

1. Missing API Key
   ┌──────────────────┐
   │ API Route Check  │ → Error: "OpenRouter API key not configured"
   └──────────────────┘
             │
             ▼
   ┌──────────────────┐
   │ Return 500       │ → Frontend displays error message
   └──────────────────┘

2. Network Error
   ┌──────────────────┐
   │ Fetch Fails      │ → Caught by try/catch
   └──────────────────┘
             │
             ▼
   ┌──────────────────┐
   │ Set Error State  │ → Display user-friendly error
   └──────────────────┘

3. OpenRouter API Error
   ┌──────────────────┐
   │ 400/500 Response │ → Log error, parse error message
   └──────────────────┘
             │
             ▼
   ┌──────────────────┐
   │ Return Error     │ → Show "Failed to generate suggestions"
   └──────────────────┘

4. Invalid AI Response
   ┌──────────────────┐
   │ JSON Parse Fail  │ → Caught by try/catch
   └──────────────────┘
             │
             ▼
   ┌──────────────────┐
   │ Use Raw Text     │ → Display as general suggestion
   └──────────────────┘
```

## Data Flow

### Request Data Structure
```typescript
{
  task: {
    id: string
    title: string
    description: string
    status: "todo" | "in-progress" | "completed"
    priority: "low" | "medium" | "high"
    dueDate: string (ISO date)
    course: string
    subtasks?: string[]
  },
  allTasks: Task[] // All user's tasks for context
}
```

### AI Prompt Structure
```
SYSTEM PROMPT (defines AI's role)
↓
USER PROMPT (provides context):
  - Task details
  - Learner's workload
  - Related tasks
  - Specific requests
↓
AI RESPONSE (structured JSON):
  {
    subtasks: string[]
    schedule: string
    strategy: string
    resources: string
  }
```

### Response Data Structure
```typescript
{
  success: boolean
  suggestions: [
    {
      type: "subtasks" | "schedule" | "strategy" | "resources"
      title: string
      content: string
      subtasks?: string[] // Only for subtasks type
    }
  ],
  rawResponse?: object // Original AI response
}
```

## State Management Flow

```
Initial State
  aiSuggestions = []
  aiLoading = false
  aiError = null
  showAiSuggestions = false
  selectedTask = null

User Clicks AI Button
  ↓
  selectedTask = task
  showAiSuggestions = true
  aiLoading = true
  aiError = null
  aiSuggestions = []

API Call In Progress
  ↓
  (Loading state shown to user)

Success Response
  ↓
  aiSuggestions = data.suggestions
  aiLoading = false
  (Suggestions displayed)

Error Response
  ↓
  aiError = error.message
  aiSuggestions = [fallback error message]
  aiLoading = false
  (Error state displayed)
```

## Component Interaction

```
┌────────────────────────────────────────────────────────────┐
│                    TaskPlannerPage                         │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  To Do       │  │ In Progress  │  │  Completed   │    │
│  │  Column      │  │  Column      │  │  Column      │    │
│  │              │  │              │  │              │    │
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │    │
│  │ │ Task Card│ │  │ │ Task Card│ │  │ │ Task Card│ │    │
│  │ │          │ │  │ │          │ │  │ │          │ │    │
│  │ │ [AI] btn │ │  │ │ [AI] btn │ │  │ │ (no AI)  │ │    │
│  │ └──────────┘ │  │ └──────────┘ │  │ └──────────┘ │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │         AI Suggestions Panel                       │   │
│  │  (Conditionally rendered when showAiSuggestions)   │   │
│  │                                                     │   │
│  │  - Loading State (spinner)                         │   │
│  │  - Error State (error message)                     │   │
│  │  - Success State (suggestion cards)                │   │
│  └────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

## Timing Diagram

```
Time     Action                           State
─────────────────────────────────────────────────────────────
0ms      User clicks AI button            Normal
         │
10ms     State updates                    Loading starts
         │                                 Panel opens
         │                                 Spinner shows
         │
50ms     API request sent                 Loading continues
         │
         │
2000ms   OpenRouter processing            Loading...
         │
         │
2500ms   Response received                Loading...
         │
2550ms   Response parsed                  Loading...
         │
2600ms   State updated                    Success!
         │                                 Suggestions shown
         │                                 Spinner removed
```

## Security Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY MEASURES                        │
└─────────────────────────────────────────────────────────────┘

1. API Key Protection
   ├─ Stored in .env.local (server-side only)
   ├─ Never exposed to client
   ├─ Validated before API call
   └─ Used in Authorization header

2. Request Validation
   ├─ Check task object exists
   ├─ Validate task structure
   ├─ Sanitize user input
   └─ Limit request size

3. Response Validation
   ├─ Parse JSON safely
   ├─ Handle malformed responses
   ├─ Sanitize AI output
   └─ Validate structure

4. Error Handling
   ├─ Don't expose sensitive errors
   ├─ Log errors securely
   ├─ Return generic user messages
   └─ Monitor for abuse
```

## Performance Optimization

```
┌─────────────────────────────────────────────────────────────┐
│                PERFORMANCE CONSIDERATIONS                   │
└─────────────────────────────────────────────────────────────┘

Current Implementation:
├─ Loading state prevents duplicate requests
├─ Error state allows retry
├─ Response caching: None (future enhancement)
└─ Request debouncing: Single request at a time

Future Optimizations:
├─ Cache similar suggestions (based on task similarity)
├─ Implement request queue
├─ Add optimistic UI updates
├─ Stream AI responses for faster perception
├─ Batch analyze multiple tasks
└─ Client-side rate limiting
```

---

This diagram illustrates the complete flow of the AI integration from user interaction to displayed suggestions, including error handling and state management.

