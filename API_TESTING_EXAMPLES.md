# Google Calendar Sync - API Testing Examples

## 🧪 Testing the Calendar Sync APIs

This guide provides examples for testing all calendar sync endpoints using various tools.

---

## 📋 Prerequisites

1. Development server running: `npm run dev`
2. User authenticated with Google OAuth
3. Browser cookies available (for session authentication)

---

## 🔧 Using cURL

### 1. Get Calendar Settings

```bash
curl http://localhost:3000/api/calendar/connect \
  -H "Cookie: your-session-cookie"
```

**Expected Response:**
```json
{
  "settings": {
    "is_connected": false,
    "google_calendar_id": null,
    "calendar_name": null,
    "last_sync_at": null
  },
  "syncedTasksCount": 0
}
```

### 2. Connect Google Calendar

```bash
curl -X POST http://localhost:3000/api/calendar/connect \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "calendarId": "primary",
  "calendarName": "DigiGyan Learning Tasks"
}
```

### 3. Sync All Tasks

```bash
curl -X POST http://localhost:3000/api/calendar/sync \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "syncedCount": 5,
  "totalTasks": 5,
  "errors": []
}
```

### 4. Sync Specific Task

```bash
curl -X PUT http://localhost:3000/api/calendar/sync \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "your-task-uuid"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "eventId": "google-event-id",
  "message": "Task synced to calendar successfully"
}
```

### 5. Remove Task from Calendar

```bash
curl -X DELETE "http://localhost:3000/api/calendar/sync?taskId=your-task-uuid" \
  -H "Cookie: your-session-cookie"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Task removed from calendar successfully"
}
```

### 6. Disconnect Calendar

```bash
curl -X DELETE http://localhost:3000/api/calendar/connect \
  -H "Cookie: your-session-cookie"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Google Calendar disconnected successfully"
}
```

---

## 🧪 Using Browser DevTools

### Get Session Cookie

1. Open DevTools (F12)
2. Go to Application tab
3. Click on Cookies → http://localhost:3000
4. Copy the value of the session cookie (usually starts with `sb-`)

### Test in Console

```javascript
// Get calendar settings
fetch('/api/calendar/connect')
  .then(res => res.json())
  .then(data => console.log('Settings:', data))

// Connect calendar
fetch('/api/calendar/connect', { method: 'POST' })
  .then(res => res.json())
  .then(data => console.log('Connected:', data))

// Sync all tasks
fetch('/api/calendar/sync', { method: 'POST' })
  .then(res => res.json())
  .then(data => console.log('Synced:', data))

// Sync specific task
fetch('/api/calendar/sync', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ taskId: 'your-task-id' })
})
  .then(res => res.json())
  .then(data => console.log('Task synced:', data))

// Disconnect
fetch('/api/calendar/connect', { method: 'DELETE' })
  .then(res => res.json())
  .then(data => console.log('Disconnected:', data))
```

---

## 🎯 Using Postman

### Setup

1. Import these requests into Postman
2. Create an environment variable for the base URL: `http://localhost:3000`
3. Get cookies from browser and add to request headers

### Collection

#### 1. Get Calendar Settings
- **Method**: GET
- **URL**: `{{baseUrl}}/api/calendar/connect`
- **Headers**: 
  - Cookie: `your-session-cookie`

#### 2. Connect Calendar
- **Method**: POST
- **URL**: `{{baseUrl}}/api/calendar/connect`
- **Headers**: 
  - Cookie: `your-session-cookie`
  - Content-Type: `application/json`

#### 3. Sync All Tasks
- **Method**: POST
- **URL**: `{{baseUrl}}/api/calendar/sync`
- **Headers**: 
  - Cookie: `your-session-cookie`
  - Content-Type: `application/json`

#### 4. Sync Specific Task
- **Method**: PUT
- **URL**: `{{baseUrl}}/api/calendar/sync`
- **Headers**: 
  - Cookie: `your-session-cookie`
  - Content-Type: `application/json`
- **Body** (JSON):
```json
{
  "taskId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### 5. Remove Task from Calendar
- **Method**: DELETE
- **URL**: `{{baseUrl}}/api/calendar/sync?taskId=550e8400-e29b-41d4-a716-446655440000`
- **Headers**: 
  - Cookie: `your-session-cookie`

#### 6. Disconnect Calendar
- **Method**: DELETE
- **URL**: `{{baseUrl}}/api/calendar/connect`
- **Headers**: 
  - Cookie: `your-session-cookie`

---

## 🔍 Testing Task Automation

### Create Task (Should Auto-Sync)

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Auto-Sync Task",
    "description": "This should automatically sync to calendar",
    "priority": "high",
    "due_date": "2025-11-01",
    "course_id": null
  }'
```

**Check**:
1. Task is created in database
2. Event appears in Google Calendar
3. Event has red color (high priority)
4. Event has 📚 emoji

### Update Task (Should Auto-Sync)

```bash
curl -X PATCH http://localhost:3000/api/tasks/your-task-id \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress"
  }'
```

**Check**:
1. Task status updated in database
2. Event emoji changes to ⚡ in Google Calendar

### Complete Task (Should Remove from Calendar)

```bash
curl -X PATCH http://localhost:3000/api/tasks/your-task-id \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

**Check**:
1. Task status updated to "completed"
2. Event is removed from Google Calendar
3. Task still visible in database

### Delete Task (Should Remove from Calendar)

```bash
curl -X DELETE http://localhost:3000/api/tasks/your-task-id \
  -H "Cookie: your-session-cookie"
```

**Check**:
1. Task is deleted from database
2. Event is removed from Google Calendar
3. Event mapping is removed

---

## 📊 Test Scenarios

### Scenario 1: New User Flow

```javascript
// 1. Check initial state (not connected)
fetch('/api/calendar/connect')

// 2. Connect calendar
fetch('/api/calendar/connect', { method: 'POST' })

// 3. Create first task
fetch('/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My First Task',
    priority: 'medium',
    due_date: '2025-11-05'
  })
})

// 4. Verify in Google Calendar
// Open https://calendar.google.com
// Look for "DigiGyan Learning Tasks" calendar
// See task as yellow event with 📚 emoji
```

### Scenario 2: Existing Tasks Sync

```javascript
// 1. Create tasks while disconnected
// (Create 3-5 tasks using the UI)

// 2. Connect calendar
fetch('/api/calendar/connect', { method: 'POST' })

// 3. Manual sync all tasks
fetch('/api/calendar/sync', { method: 'POST' })

// 4. Check Google Calendar
// All tasks should appear as events
```

### Scenario 3: Status Change Flow

```javascript
// 1. Create task (📚 To Do)
const taskResponse = await fetch('/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Status Test Task',
    priority: 'high',
    due_date: '2025-11-10'
  })
})
const task = await taskResponse.json()

// 2. Update to In Progress (⚡)
await fetch(`/api/tasks/${task.task.id}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'in-progress' })
})
// Check: Emoji changes to ⚡

// 3. Complete task (✅ then removed)
await fetch(`/api/tasks/${task.task.id}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'completed' })
})
// Check: Event removed from calendar
```

### Scenario 4: Priority Colors

```javascript
// Create tasks with different priorities
const priorities = ['low', 'medium', 'high']

for (const priority of priorities) {
  await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: `${priority.toUpperCase()} Priority Task`,
      priority: priority,
      due_date: '2025-11-15'
    })
  })
}

// Check Google Calendar:
// - Low priority = Cyan (🔵)
// - Medium priority = Yellow (🟡)
// - High priority = Red (🔴)
```

---

## ⚠️ Error Cases to Test

### 1. Not Authenticated
```bash
curl http://localhost:3000/api/calendar/connect
```
**Expected**: 401 Unauthorized

### 2. No Google Tokens
```bash
# Sign in with email/password (not Google)
curl -X POST http://localhost:3000/api/calendar/connect
```
**Expected**: Error message about missing OAuth tokens

### 3. Calendar API Not Enabled
```bash
# Disable Calendar API in Google Cloud Console
curl -X POST http://localhost:3000/api/calendar/connect
```
**Expected**: Error from Google API

### 4. Invalid Task ID
```bash
curl -X PUT http://localhost:3000/api/calendar/sync \
  -H "Content-Type: application/json" \
  -d '{"taskId": "invalid-uuid"}'
```
**Expected**: 404 Task not found

### 5. Sync Without Connection
```bash
# Ensure calendar is disconnected
curl -X POST http://localhost:3000/api/calendar/sync
```
**Expected**: Error about calendar not connected

---

## 📈 Performance Testing

### Bulk Create and Sync

```javascript
// Create 100 tasks
const tasks = []
for (let i = 0; i < 100; i++) {
  const task = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: `Bulk Test Task ${i + 1}`,
      priority: ['low', 'medium', 'high'][i % 3],
      due_date: `2025-11-${(i % 28) + 1}`
    })
  })
  tasks.push(await task.json())
  
  // Small delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 100))
}

console.log(`Created ${tasks.length} tasks`)
```

**Monitor**:
- Server response times
- Google Calendar API quota usage
- Database performance
- Any errors or failures

---

## 🔐 Security Testing

### 1. Cross-User Access
```bash
# Try to access another user's calendar settings
curl http://localhost:3000/api/calendar/connect \
  -H "Cookie: user-a-session"
  
# Try to sync another user's task
curl -X PUT http://localhost:3000/api/calendar/sync \
  -H "Cookie: user-a-session" \
  -H "Content-Type: application/json" \
  -d '{"taskId": "user-b-task-id"}'
```
**Expected**: No access to other users' data (RLS protection)

### 2. SQL Injection
```bash
curl -X PUT http://localhost:3000/api/calendar/sync \
  -H "Content-Type: application/json" \
  -d '{"taskId": "1; DROP TABLE tasks;"}'
```
**Expected**: Sanitized input, no SQL execution

### 3. Token Validation
```bash
# Revoke Google tokens in Google Account settings
curl -X POST http://localhost:3000/api/calendar/sync
```
**Expected**: Proper error handling, no token leak

---

## 📋 Validation Checklist

After testing, verify:

- [ ] All API endpoints return expected responses
- [ ] Error cases are handled gracefully
- [ ] Tasks sync automatically on create/update/delete
- [ ] Calendar events match task details (title, date, color)
- [ ] Completed tasks are removed from calendar
- [ ] Deleted tasks are removed from calendar
- [ ] Manual sync works for bulk tasks
- [ ] Disconnect removes all event mappings
- [ ] Reconnect allows syncing again
- [ ] No sensitive data exposed in responses
- [ ] RLS policies protect user data
- [ ] Performance is acceptable for typical usage

---

## 🎉 Success Criteria

✅ All API endpoints functional  
✅ Automatic sync working  
✅ Manual sync working  
✅ Status changes reflected  
✅ Priority colors correct  
✅ Error handling robust  
✅ Security measures effective  
✅ Performance acceptable  

**Your Google Calendar sync is production-ready!** 🚀

