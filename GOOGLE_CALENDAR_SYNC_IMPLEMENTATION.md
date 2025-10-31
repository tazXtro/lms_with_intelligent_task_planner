# Google Calendar Sync - Implementation Guide

## 🎉 Implementation Complete!

Google Calendar synchronization has been successfully integrated into your DigiGyan LMS application. Tasks are now automatically synced with Google Calendar in real-time!

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Setup Instructions](#setup-instructions)
7. [How It Works](#how-it-works)
8. [Testing Guide](#testing-guide)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The Google Calendar sync feature seamlessly integrates your learner tasks with Google Calendar, providing:

- **Real-time sync**: Tasks are automatically synced when created, updated, or deleted
- **Bidirectional mapping**: Each task is mapped to a unique calendar event
- **Smart status tracking**: Task status changes are reflected in calendar (emoji indicators)
- **Priority-based colors**: High/medium/low priority tasks get different colors
- **Automatic cleanup**: Completed tasks are removed from calendar
- **Dedicated calendar**: Creates a "DigiGyan Learning Tasks" calendar in Google

---

## Features

### ✅ Implemented Features

1. **OAuth Integration**
   - Extended Google OAuth to include Calendar API scopes
   - Requests offline access for refresh tokens
   - Handles token management through Supabase

2. **Database Schema**
   - `calendar_sync_settings`: Stores user's calendar connection status
   - `task_calendar_events`: Maps tasks to Google Calendar events
   - Added sync tracking columns to `learner_tasks` table

3. **API Endpoints**
   - `/api/calendar/connect` - Connect/disconnect/get calendar settings
   - `/api/calendar/sync` - Sync all tasks or individual tasks
   - Enhanced task APIs with automatic calendar sync

4. **UI Components**
   - Updated Settings page with real calendar integration
   - Connection status indicators
   - Sync statistics and details
   - Manual sync trigger

5. **Automatic Sync**
   - Task creation → Creates calendar event
   - Task update → Updates calendar event
   - Task completion → Removes event from calendar
   - Task deletion → Removes event from calendar

---

## Architecture

```
┌─────────────────┐
│   User Action   │
│  (Create Task)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│    Task API                     │
│    (/api/tasks)                 │
└────────┬────────────────────────┘
         │
         ├──► Save to Database
         │
         ▼
┌─────────────────────────────────┐
│  Check Calendar Settings         │
│  (Is sync enabled?)              │
└────────┬────────────────────────┘
         │ YES
         ▼
┌─────────────────────────────────┐
│  Google Calendar Service         │
│  (Create/Update/Delete Event)    │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Store Event Mapping             │
│  (task_calendar_events)          │
└─────────────────────────────────┘
```

---

## Database Schema

### `calendar_sync_settings`

| Column              | Type                     | Description                          |
|---------------------|--------------------------|--------------------------------------|
| id                  | UUID                     | Primary key                          |
| user_id             | UUID                     | References auth.users(id)            |
| google_calendar_id  | TEXT                     | ID of Google Calendar                |
| calendar_name       | TEXT                     | Display name of calendar             |
| is_connected        | BOOLEAN                  | Connection status                    |
| last_sync_at        | TIMESTAMP WITH TIME ZONE | Last sync timestamp                  |
| sync_enabled        | BOOLEAN                  | Whether auto-sync is enabled         |
| created_at          | TIMESTAMP WITH TIME ZONE | Record creation time                 |
| updated_at          | TIMESTAMP WITH TIME ZONE | Record update time                   |

### `task_calendar_events`

| Column           | Type                     | Description                          |
|------------------|--------------------------|--------------------------------------|
| id               | UUID                     | Primary key                          |
| task_id          | UUID                     | References learner_tasks(id)         |
| user_id          | UUID                     | References auth.users(id)            |
| google_event_id  | TEXT                     | Google Calendar event ID             |
| calendar_id      | TEXT                     | Google Calendar ID                   |
| synced_at        | TIMESTAMP WITH TIME ZONE | Last sync timestamp                  |
| created_at       | TIMESTAMP WITH TIME ZONE | Record creation time                 |

### `learner_tasks` (Updated)

Added columns:
- `calendar_event_id`: TEXT - Google Calendar event ID
- `last_synced_at`: TIMESTAMP WITH TIME ZONE - Last sync timestamp

---

## API Endpoints

### 1. Calendar Connection

#### `POST /api/calendar/connect`
Connect Google Calendar and create DigiGyan calendar.

**Response:**
```json
{
  "success": true,
  "calendarId": "calendar-id",
  "calendarName": "DigiGyan Learning Tasks"
}
```

#### `DELETE /api/calendar/connect`
Disconnect Google Calendar and remove all event mappings.

**Response:**
```json
{
  "success": true,
  "message": "Google Calendar disconnected successfully"
}
```

#### `GET /api/calendar/connect`
Get calendar settings and sync statistics.

**Response:**
```json
{
  "settings": {
    "is_connected": true,
    "calendar_name": "DigiGyan Learning Tasks",
    "last_sync_at": "2025-10-31T10:30:00Z"
  },
  "syncedTasksCount": 12
}
```

### 2. Task Synchronization

#### `POST /api/calendar/sync`
Sync all non-completed tasks to Google Calendar.

**Response:**
```json
{
  "success": true,
  "syncedCount": 12,
  "totalTasks": 12,
  "errors": []
}
```

#### `PUT /api/calendar/sync`
Sync a specific task to Google Calendar.

**Request Body:**
```json
{
  "taskId": "task-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "eventId": "google-event-id",
  "message": "Task synced to calendar successfully"
}
```

#### `DELETE /api/calendar/sync?taskId={taskId}`
Remove a specific task from Google Calendar.

**Response:**
```json
{
  "success": true,
  "message": "Task removed from calendar successfully"
}
```

### 3. Task APIs (Enhanced)

All task APIs (`POST /api/tasks`, `PATCH /api/tasks/[id]`, `DELETE /api/tasks/[id]`) now automatically sync with Google Calendar if connected.

---

## Setup Instructions

### Prerequisites

1. ✅ Google OAuth already configured in Supabase
2. ✅ Google Cloud Console project with OAuth credentials
3. ✅ Node.js and npm installed

### Step 1: Environment Variables

Ensure your `.env.local` file contains:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Application URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 2: Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Library**
3. Enable **Google Calendar API**
4. Go to **APIs & Services** → **Credentials**
5. Click on your OAuth 2.0 Client ID
6. Under **Authorized redirect URIs**, ensure you have:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```
7. Click **Save**

### Step 3: Supabase Configuration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication** → **Providers** → **Google**
3. Ensure the provider is **Enabled**
4. Verify your Client ID and Client Secret are configured
5. The scopes are now automatically included in the OAuth request

### Step 4: Database Migration

✅ Already applied! The database migration has been executed with:
- New tables for calendar sync settings and event mappings
- RLS policies for security
- Indexes for performance
- Triggers for updated_at timestamps

### Step 5: Install Dependencies

✅ Already installed! The `googleapis` package has been added to your project.

### Step 6: Test the Implementation

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Sign in with Google:**
   - Go to `http://localhost:3000/auth`
   - Click "Sign in with Google"
   - Authorize the Calendar API scopes

3. **Connect Google Calendar:**
   - Go to `http://localhost:3000/learner/settings`
   - Click "Connect Google Calendar"
   - Wait for the connection to complete

4. **Create a task:**
   - Go to `http://localhost:3000/learner/tasks`
   - Click "New Task"
   - Fill in the details and create
   - The task will automatically sync to Google Calendar!

5. **Verify in Google Calendar:**
   - Open [Google Calendar](https://calendar.google.com/)
   - Look for "DigiGyan Learning Tasks" calendar
   - You should see your task as an event!

---

## How It Works

### Task Creation Flow

1. User creates a task in the Task Planner
2. Task is saved to `learner_tasks` table
3. System checks if calendar sync is enabled
4. If enabled:
   - Initializes Google Calendar service with user's tokens
   - Creates a new event in the DigiGyan calendar
   - Stores the event mapping in `task_calendar_events`
   - Updates task with `calendar_event_id` and `last_synced_at`

### Task Update Flow

1. User updates a task (status, title, description, due date, priority)
2. Task is updated in the database
3. System checks if calendar sync is enabled
4. If enabled:
   - Retrieves the event mapping
   - Updates the corresponding Google Calendar event
   - Updates emoji indicator based on status (📚 → ⚡ → ✅)
   - Updates color based on priority
   - If task is completed: deletes the event from calendar

### Task Deletion Flow

1. User deletes a task
2. System checks if there's a calendar event mapping
3. If mapping exists:
   - Deletes the event from Google Calendar
   - Deletes the mapping from `task_calendar_events`
4. Deletes the task from `learner_tasks`

### Event Details

Each calendar event includes:

- **Title**: Status emoji + Task title
  - 📚 = To Do
  - ⚡ = In Progress
  - ✅ = Completed (then deleted)

- **Description**: Task description or "DigiGyan Learning Task"

- **Date**: Due date (all-day event)

- **Color**:
  - 🔴 Red = High priority
  - 🟡 Yellow = Medium priority
  - 🔵 Cyan = Low priority

- **Reminders**:
  - Popup: 1 hour before
  - Email: 24 hours before

---

## Testing Guide

### Manual Testing Checklist

#### Connection Flow
- [ ] Navigate to Settings page
- [ ] Click "Connect Google Calendar"
- [ ] Verify connection status changes to "Connected"
- [ ] Verify user email is displayed
- [ ] Verify sync details are shown

#### Task Creation
- [ ] Create a new task with a due date
- [ ] Open Google Calendar
- [ ] Verify event appears in "DigiGyan Learning Tasks"
- [ ] Verify event has correct title, date, and color

#### Task Update
- [ ] Update task status from "To Do" to "In Progress"
- [ ] Verify event emoji changes from 📚 to ⚡
- [ ] Update task priority
- [ ] Verify event color changes
- [ ] Update task due date
- [ ] Verify event date changes

#### Task Completion
- [ ] Mark a task as "Completed"
- [ ] Verify event is removed from Google Calendar
- [ ] Verify task still exists in database

#### Task Deletion
- [ ] Delete a task with a calendar event
- [ ] Verify event is removed from Google Calendar
- [ ] Verify task is removed from database

#### Disconnection Flow
- [ ] Click "Disconnect" in Settings
- [ ] Confirm disconnection
- [ ] Verify all event mappings are removed
- [ ] Create a new task
- [ ] Verify it does NOT sync to calendar

#### Manual Sync
- [ ] Create tasks without calendar connected
- [ ] Connect Google Calendar
- [ ] Click "Sync Now"
- [ ] Verify all tasks appear in calendar

### Automated Testing

You can test the API endpoints using curl or Postman:

```bash
# Get calendar settings
curl http://localhost:3000/api/calendar/connect

# Connect calendar (requires authentication)
curl -X POST http://localhost:3000/api/calendar/connect

# Sync all tasks
curl -X POST http://localhost:3000/api/calendar/sync

# Sync specific task
curl -X PUT http://localhost:3000/api/calendar/sync \
  -H "Content-Type: application/json" \
  -d '{"taskId": "your-task-id"}'
```

---

## Troubleshooting

### Issue: "No Google OAuth tokens found"

**Solution:**
- User needs to sign in with Google (not email/password)
- Existing users need to re-authenticate with Google
- Make sure OAuth includes Calendar API scopes

### Issue: Events not appearing in Google Calendar

**Possible causes:**
1. Calendar sync not connected - Check Settings page
2. Sync is disabled - Enable sync in settings
3. Task is already completed - Completed tasks don't sync
4. API quota exceeded - Check Google Cloud Console quotas
5. Token expired - Re-authenticate by disconnecting and reconnecting

**Debug steps:**
```javascript
// Check browser console for errors
// Check server logs for API errors
// Verify calendar settings in database
```

### Issue: "Failed to initialize Google Calendar service"

**Solution:**
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in environment variables
- Restart development server after adding env variables
- Check that Google Calendar API is enabled in Google Cloud Console

### Issue: Existing tasks not syncing

**Solution:**
- Use the "Sync Now" button in Settings
- This will sync all non-completed tasks to calendar

### Issue: Token refresh errors

**Solution:**
- Disconnect and reconnect Google Calendar
- This will generate new tokens with proper permissions
- Ensure `access_type: 'offline'` is set in OAuth request (✅ already configured)

---

## Technical Details

### Token Management

- **Access Token**: Short-lived token for API requests
- **Refresh Token**: Long-lived token to get new access tokens
- Tokens are stored by Supabase in the session
- Retrieved via `session.provider_token` and `session.provider_refresh_token`

### Security

- **Row Level Security (RLS)**: All calendar tables have RLS enabled
- **User isolation**: Users can only access their own calendar settings and events
- **Token encryption**: Tokens are encrypted by Supabase
- **OAuth consent**: Users explicitly authorize Calendar API access

### Performance

- **Indexes**: Added on frequently queried columns
- **Async operations**: Calendar sync doesn't block task operations
- **Error handling**: Task operations succeed even if calendar sync fails
- **Batch sync**: "Sync Now" syncs all tasks efficiently

### Rate Limiting

Google Calendar API has the following limits:
- **Queries per day**: 1,000,000
- **Queries per 100 seconds per user**: 250

For most use cases, these limits are more than sufficient. If you hit limits:
1. Implement exponential backoff
2. Cache calendar data
3. Batch operations where possible

---

## Future Enhancements

Potential improvements for future versions:

1. **Webhook support**: Listen for calendar changes to sync back to tasks
2. **Recurring tasks**: Support for repeating tasks and events
3. **Multiple calendars**: Allow users to choose which calendar to sync to
4. **Selective sync**: Let users choose which tasks to sync
5. **Sync history**: Track sync history and failures
6. **Conflict resolution**: Handle conflicts when event is modified in both places
7. **Bulk operations**: Optimize syncing large numbers of tasks
8. **Custom reminders**: Let users customize reminder timings
9. **Calendar views**: Show calendar view directly in the app
10. **Analytics**: Track sync statistics and performance

---

## Support

If you encounter issues:

1. Check the browser console for client-side errors
2. Check server logs for API errors
3. Verify environment variables are set correctly
4. Ensure Google Calendar API is enabled
5. Verify OAuth scopes are correct
6. Test with a fresh Google authentication

---

## Summary

✅ **Database**: Calendar sync tables created with RLS policies  
✅ **OAuth**: Extended with Calendar API scopes  
✅ **API**: Calendar connection, sync, and management endpoints  
✅ **Service**: Google Calendar service utilities  
✅ **Automation**: Tasks auto-sync on create, update, delete  
✅ **UI**: Settings page with real calendar integration  
✅ **Testing**: Manual testing checklist provided  
✅ **Documentation**: Comprehensive guide created

**The Google Calendar sync feature is now fully functional and ready to use!** 🎉

---

## Quick Start

1. Sign in with Google OAuth
2. Go to Settings → Connect Google Calendar
3. Create a task in Task Planner
4. Open Google Calendar and see your task!

That's it! Your tasks will now automatically sync with Google Calendar in real-time. 🚀

