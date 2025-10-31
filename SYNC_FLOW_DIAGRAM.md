# Google Calendar Sync - Flow Diagrams

## 🔄 Complete Sync Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                     USER AUTHENTICATION                          │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Sign in with    │
                    │ Google OAuth    │
                    └────────┬────────┘
                             │
                    ┌────────▼─────────┐
                    │ Request Scopes:  │
                    │ • openid         │
                    │ • email          │
                    │ • profile        │
                    │ • calendar       │
                    │ • calendar.events│
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │ Supabase stores  │
                    │ access_token &   │
                    │ refresh_token    │
                    └────────┬─────────┘
                             │
┌────────────────────────────▼──────────────────────────────┐
│                   CALENDAR CONNECTION                      │
└────────────────────────────────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │ User clicks      │
                    │ "Connect Google  │
                    │  Calendar"       │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │ POST /api/       │
                    │ calendar/connect │
                    └────────┬─────────┘
                             │
                ┌────────────▼───────────────┐
                │ Initialize Google          │
                │ Calendar Service           │
                │ (with user's tokens)       │
                └────────────┬───────────────┘
                             │
                ┌────────────▼───────────────┐
                │ Get or Create             │
                │ "DigiGyan Learning Tasks" │
                │ calendar                  │
                └────────────┬──────────────┘
                             │
                ┌────────────▼───────────────┐
                │ Store calendar settings   │
                │ in database:              │
                │ • calendar_id             │
                │ • calendar_name           │
                │ • is_connected = true     │
                │ • sync_enabled = true     │
                └────────────┬──────────────┘
                             │
                    ┌────────▼─────────┐
                    │ ✅ Connected!    │
                    └──────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     TASK CREATION SYNC                          │
└─────────────────────────────────────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │ User creates     │
                    │ new task         │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │ POST /api/tasks  │
                    └────────┬─────────┘
                             │
                ┌────────────▼───────────────┐
                │ Save task to database      │
                │ (learner_tasks table)      │
                └────────────┬───────────────┘
                             │
                ┌────────────▼───────────────┐
                │ Check calendar settings:   │
                │ is_connected && sync_enabled│
                └────────────┬───────────────┘
                             │
                    YES      │      NO
            ┌────────────────┼────────────┐
            │                              │
            ▼                              ▼
┌───────────────────────┐      ┌─────────────────┐
│ Initialize Google     │      │ Skip sync       │
│ Calendar Service      │      │ Return task     │
└───────────┬───────────┘      └─────────────────┘
            │
┌───────────▼───────────┐
│ Create calendar event:│
│ • Title: 📚 [title]  │
│ • Date: due_date      │
│ • Color: by priority  │
│ • Reminders: default  │
└───────────┬───────────┘
            │
┌───────────▼───────────┐
│ Store event mapping:  │
│ • task_id             │
│ • google_event_id     │
│ • calendar_id         │
└───────────┬───────────┘
            │
┌───────────▼───────────┐
│ Update task:          │
│ • calendar_event_id   │
│ • last_synced_at      │
└───────────┬───────────┘
            │
            ▼
    ┌───────────────┐
    │ ✅ Task synced│
    │ to calendar!  │
    └───────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     TASK UPDATE SYNC                            │
└─────────────────────────────────────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │ User updates     │
                    │ task (status,    │
                    │ title, etc.)     │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │ PATCH /api/      │
                    │ tasks/[id]       │
                    └────────┬─────────┘
                             │
                ┌────────────▼───────────────┐
                │ Update task in database    │
                └────────────┬───────────────┘
                             │
                ┌────────────▼───────────────┐
                │ Check if calendar sync     │
                │ is enabled                 │
                └────────────┬───────────────┘
                             │
                ┌────────────▼───────────────┐
                │ Get event mapping          │
                │ from task_calendar_events  │
                └────────────┬───────────────┘
                             │
                    Event exists?
                    │           │
             YES────┘           └────NO
              │                       │
              ▼                       ▼
┌─────────────────────┐    ┌──────────────────┐
│ Task completed?     │    │ Task completed?  │
└─────┬───────────────┘    └────────┬─────────┘
      │                              │
  YES │  NO                      YES │  NO
      │  │                           │  │
      ▼  ▼                           ▼  ▼
   ┌────┐┌──────────────┐         Skip  Create
   │Del-││Update event: │         sync  new
   │ete ││• Title emoji │               event
   │evt ││• Color       │
   │    ││• Date        │
   └────┘└──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     TASK DELETION SYNC                          │
└─────────────────────────────────────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │ User deletes     │
                    │ task             │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │ DELETE /api/     │
                    │ tasks/[id]       │
                    └────────┬─────────┘
                             │
                ┌────────────▼───────────────┐
                │ Get event mapping          │
                │ (if exists)                │
                └────────────┬───────────────┘
                             │
                    Mapping exists?
                    │           │
             YES────┘           └────NO
              │                       │
              ▼                       ▼
┌─────────────────────┐    ┌──────────────────┐
│ Delete event from   │    │ Skip to task     │
│ Google Calendar     │    │ deletion         │
└─────────┬───────────┘    └────────┬─────────┘
          │                          │
          ▼                          │
┌─────────────────────┐             │
│ Delete event mapping│             │
│ from database       │             │
└─────────┬───────────┘             │
          │                          │
          └──────────┬───────────────┘
                     │
          ┌──────────▼───────────┐
          │ Delete task from     │
          │ learner_tasks table  │
          └──────────┬───────────┘
                     │
                     ▼
            ┌────────────────┐
            │ ✅ Task deleted│
            │ from both!     │
            └────────────────┘
```

---

## 🎯 Status Change Flow

```
TASK STATUS CHANGES
═══════════════════

📚 To Do
   │
   │ User drags to "In Progress"
   │
   ▼
⚡ In Progress
   │
   │ Calendar event updated:
   │ • Title: 📚 → ⚡
   │ • Color remains same
   │
   │ User drags to "Completed"
   │
   ▼
✅ Completed
   │
   │ Calendar event action:
   │ • DELETE from calendar
   │ • Remove event mapping
   │ • Keep task in database
   │
   ▼
Event removed from Google Calendar
Task visible only in completed column
```

---

## 🎨 Priority Color Mapping

```
PRIORITY COLORS IN GOOGLE CALENDAR
═══════════════════════════════════

High Priority     →  🔴 Red (colorId: 11)
Medium Priority   →  🟡 Yellow (colorId: 5)
Low Priority      →  🔵 Cyan (colorId: 7)

These colors are automatically set when:
• Creating a new event
• Updating task priority
```

---

## 🔐 Authentication Flow

```
GOOGLE OAUTH WITH CALENDAR SCOPES
═════════════════════════════════

User clicks "Sign in with Google"
           │
           ▼
┌──────────────────────────┐
│ Google OAuth Consent     │
│ Screen shows:            │
│                          │
│ DigiGyan LMS requests:   │
│ ✓ View your email        │
│ ✓ View your profile      │
│ ✓ View/edit calendar     │
│ ✓ Create/delete events   │
│                          │
│ [Continue] [Cancel]      │
└────────┬─────────────────┘
         │
         │ User clicks Continue
         │
         ▼
┌──────────────────────────┐
│ Google returns:          │
│ • access_token           │
│ • refresh_token          │
│ • expires_in             │
│ • scope (includes        │
│   calendar APIs)         │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Supabase stores tokens   │
│ in session:              │
│ • provider_token         │
│ • provider_refresh_token │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ App can now access       │
│ Google Calendar API      │
└──────────────────────────┘
```

---

## 🔄 Manual Sync Flow

```
MANUAL "SYNC NOW" BUTTON
════════════════════════

User clicks "Sync Now"
         │
         ▼
POST /api/calendar/sync
         │
         ▼
┌─────────────────────────┐
│ Get all non-completed   │
│ tasks for user          │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ For each task:          │
│                         │
│ • Check if event exists │
│ • If YES: Update it     │
│ • If NO: Create new     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Update last_sync_at     │
│ in calendar_sync_       │
│ settings                │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Return results:         │
│ • syncedCount           │
│ • totalTasks            │
│ • errors (if any)       │
└─────────────────────────┘
```

---

## 🗄️ Database Relationships

```
DATABASE SCHEMA RELATIONSHIPS
═════════════════════════════

auth.users (Supabase)
    │
    │ id
    │
    ├──► profiles
    │     └── role, full_name, etc.
    │
    ├──► learner_tasks
    │     ├── task details
    │     ├── calendar_event_id ◄────┐
    │     └── last_synced_at          │
    │                                  │
    ├──► calendar_sync_settings       │
    │     ├── google_calendar_id      │
    │     ├── is_connected            │
    │     ├── sync_enabled            │
    │     └── last_sync_at            │
    │                                  │
    └──► task_calendar_events ────────┘
          ├── task_id (FK)
          ├── google_event_id
          └── calendar_id

Google Calendar API
    │
    └──► google_event_id stored in
          task_calendar_events table
```

---

## 📡 API Request Flow

```
CLIENT → SERVER → DATABASE → GOOGLE API
═══════════════════════════════════════

1. CREATE TASK
   │
   Client POST /api/tasks
   │
   └─► Server: Create task in DB
       │
       └─► Check sync settings
           │
           └─► Google: Create calendar event
               │
               └─► Store mapping in DB

2. UPDATE TASK
   │
   Client PATCH /api/tasks/[id]
   │
   └─► Server: Update task in DB
       │
       └─► Check sync settings
           │
           └─► Google: Update calendar event
               │
               └─► Update sync timestamp

3. DELETE TASK
   │
   Client DELETE /api/tasks/[id]
   │
   └─► Server: Get event mapping
       │
       └─► Google: Delete calendar event
           │
           └─► Delete mapping & task from DB
```

---

## 🎭 Error Handling

```
ERROR HANDLING STRATEGY
═══════════════════════

Task Operation (Create/Update/Delete)
    │
    ├─► Try: Save to database
    │   │
    │   ├─► Success
    │   │   │
    │   │   └─► Try: Sync to calendar
    │   │       │
    │   │       ├─► Success ✅
    │   │       │   └─► Continue
    │   │       │
    │   │       └─► Fail ⚠️
    │   │           ├─► Log error
    │   │           └─► Continue (don't fail task operation)
    │   │
    │   └─► Fail ❌
    │       └─► Return error to user
    │
    └─► Result: Task operation always succeeds
                even if calendar sync fails
```

---

## 🔔 Event Reminders

```
CALENDAR EVENT REMINDERS
════════════════════════

Every synced task includes:

┌──────────────────────────┐
│ Reminder Settings        │
├──────────────────────────┤
│ Popup Notification:      │
│   • 60 minutes before    │
│                          │
│ Email Notification:      │
│   • 1440 minutes before  │
│     (24 hours)           │
└──────────────────────────┘

These are applied automatically
to all synced events.
```

This visual guide helps understand the complete flow of Google Calendar sync in your DigiGyan LMS! 🎨

