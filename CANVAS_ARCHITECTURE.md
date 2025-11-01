# 🏗️ Canvas LMS Integration - Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CANVAS LMS INTEGRATION                          │
│                           DigiGyan Platform                             │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE LAYER                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   Settings   │  │   Canvas     │  │ Assignments  │  │Announcements│ │
│  │     Page     │  │  Dashboard   │  │     Page     │  │    Page    │ │
│  │              │  │              │  │              │  │            │ │
│  │ • Connect    │  │ • Overview   │  │ • List       │  │ • List     │ │
│  │ • Token      │  │ • Stats      │  │ • Filter     │  │ • Filter   │ │
│  │ • Sync       │  │ • Quick      │  │ • Search     │  │ • Search   │ │
│  │ • Status     │  │   Links      │  │ • Sync       │  │ • Read     │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │
│         │                 │                 │                 │        │
│  ┌──────────────┐  ┌──────────────┐                                   │
│  │    Grades    │  │     Task     │                                   │
│  │     Page     │  │   Planner    │                                   │
│  │              │  │              │                                   │
│  │ • List       │  │ • Kanban     │                                   │
│  │ • Analytics  │  │ • Canvas     │                                   │
│  │ • Average    │  │   Tasks      │                                   │
│  └──────┬───────┘  └──────┬───────┘                                   │
│         │                 │                                           │
└─────────┼─────────────────┼───────────────────────────────────────────┘
          │                 │
          ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          API ROUTES LAYER                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  /api/canvas/connect                                           │   │
│  │  • GET    - Get connection status & stats                      │   │
│  │  • POST   - Connect with token                                 │   │
│  │  • DELETE - Disconnect & cleanup                               │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  /api/canvas/sync                                              │   │
│  │  • POST   - Sync all Canvas data                               │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  /api/canvas/assignments                                       │   │
│  │  • GET    - Get assignments with filters                       │   │
│  │  /api/canvas/assignments/sync-to-tasks                         │   │
│  │  • POST   - Sync to Task Planner                               │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  /api/canvas/announcements                                     │   │
│  │  • GET    - Get announcements with filters                     │   │
│  │  • PATCH  - Mark as read/unread                                │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  /api/canvas/courses                                           │   │
│  │  • GET    - Get all courses                                    │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  /api/canvas/grades                                            │   │
│  │  • GET    - Get all grades                                     │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────┬───────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        SERVICE LAYER                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  CanvasAPIService (lib/canvas-api.ts)                          │   │
│  │                                                                 │   │
│  │  • testConnection()         - Validate Canvas connection       │   │
│  │  • getCurrentUser()         - Get user info                    │   │
│  │  • getCourses()             - Fetch all courses                │   │
│  │  • getCourseAssignments()   - Fetch course assignments         │   │
│  │  • getAllAssignments()      - Fetch all assignments            │   │
│  │  • getAssignmentSubmission()- Get submission status            │   │
│  │  • getCourseAnnouncements() - Fetch course announcements       │   │
│  │  • getAllAnnouncements()    - Fetch all announcements          │   │
│  │  • getEnrollments()         - Fetch enrollments with grades    │   │
│  │  • getUpcomingAssignments() - Filter upcoming assignments      │   │
│  │  • getAllGrades()           - Fetch all grades                 │   │
│  │                                                                 │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────┬───────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL API LAYER                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  Canvas LMS API (canvas.instructure.com/api/v1)                │   │
│  │                                                                 │   │
│  │  • /users/self                                                  │   │
│  │  • /courses                                                     │   │
│  │  • /courses/:id/assignments                                     │   │
│  │  • /courses/:id/assignments/:id/submissions/self                │   │
│  │  • /courses/:id/discussion_topics                               │   │
│  │  • /users/self/enrollments                                      │   │
│  │  • /calendar_events                                             │   │
│  │                                                                 │   │
│  │  Authentication: Bearer Token                                   │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                         Supabase PostgreSQL                             │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  canvas_connections                                            │   │
│  │  ├─ id (PK)                                                     │   │
│  │  ├─ user_id (FK → auth.users)                                  │   │
│  │  ├─ canvas_url                                                  │   │
│  │  ├─ access_token (encrypted)                                    │   │
│  │  ├─ is_connected                                                │   │
│  │  ├─ last_sync_at                                                │   │
│  │  └─ sync_enabled                                                │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  canvas_courses                                                │   │
│  │  ├─ id (PK)                                                     │   │
│  │  ├─ user_id (FK → auth.users)                                  │   │
│  │  ├─ canvas_course_id (unique per user)                         │   │
│  │  ├─ name                                                        │   │
│  │  ├─ course_code                                                 │   │
│  │  ├─ workflow_state                                              │   │
│  │  ├─ start_at / end_at                                           │   │
│  │  └─ enrollment_type                                             │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  canvas_assignments                                            │   │
│  │  ├─ id (PK)                                                     │   │
│  │  ├─ user_id (FK → auth.users)                                  │   │
│  │  ├─ canvas_course_id                                            │   │
│  │  ├─ canvas_assignment_id (unique per user)                     │   │
│  │  ├─ name                                                        │   │
│  │  ├─ description                                                 │   │
│  │  ├─ due_at (indexed)                                            │   │
│  │  ├─ points_possible                                             │   │
│  │  ├─ submission_types[]                                          │   │
│  │  ├─ html_url                                                    │   │
│  │  ├─ has_submitted                                               │   │
│  │  ├─ grade / score                                               │   │
│  │  ├─ synced_to_task                                              │   │
│  │  └─ task_id (FK → learner_tasks)                               │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  canvas_announcements                                          │   │
│  │  ├─ id (PK)                                                     │   │
│  │  ├─ user_id (FK → auth.users)                                  │   │
│  │  ├─ canvas_course_id                                            │   │
│  │  ├─ canvas_announcement_id (unique per user)                   │   │
│  │  ├─ title                                                       │   │
│  │  ├─ message                                                     │   │
│  │  ├─ posted_at (indexed)                                         │   │
│  │  ├─ author_name                                                 │   │
│  │  ├─ html_url                                                    │   │
│  │  └─ is_read                                                     │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  canvas_grades                                                 │   │
│  │  ├─ id (PK)                                                     │   │
│  │  ├─ user_id (FK → auth.users)                                  │   │
│  │  ├─ canvas_course_id (unique per user)                         │   │
│  │  ├─ current_grade                                               │   │
│  │  ├─ current_score                                               │   │
│  │  ├─ final_grade                                                 │   │
│  │  └─ final_score                                                 │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  learner_tasks (existing)                                      │   │
│  │  ├─ id (PK)                                                     │   │
│  │  ├─ learner_id (FK → auth.users)                               │   │
│  │  ├─ title                                                       │   │
│  │  ├─ description                                                 │   │
│  │  ├─ status (todo | in-progress | completed)                    │   │
│  │  ├─ priority (low | medium | high)                             │   │
│  │  ├─ due_date                                                    │   │
│  │  └─ subtasks[]                                                  │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  🔒 Row Level Security (RLS) enabled on all tables                     │
│  📊 Indexes on user_id, due_at, posted_at for performance              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Connection Flow

```
User                    DigiGyan                Canvas API           Database
  │                        │                         │                  │
  │  Enter Token          │                         │                  │
  ├──────────────────────>│                         │                  │
  │                        │  Validate Token         │                  │
  │                        ├────────────────────────>│                  │
  │                        │  User Info              │                  │
  │                        │<────────────────────────┤                  │
  │                        │                         │                  │
  │                        │  Store Connection                          │
  │                        ├────────────────────────────────────────────>│
  │                        │                         │                  │
  │  Connection Success    │                         │                  │
  │<───────────────────────┤                         │                  │
  │                        │                         │                  │
  │                        │  Auto Sync              │                  │
  │                        ├────────────────────────>│                  │
  │                        │  Courses, Assignments   │                  │
  │                        │<────────────────────────┤                  │
  │                        │                         │                  │
  │                        │  Store Data                                │
  │                        ├────────────────────────────────────────────>│
  │                        │                         │                  │
  │  Sync Complete         │                         │                  │
  │<───────────────────────┤                         │                  │
```

### 2. Data Sync Flow

```
User                    DigiGyan                Canvas API           Database
  │                        │                         │                  │
  │  Click "Sync Now"      │                         │                  │
  ├──────────────────────>│                         │                  │
  │                        │  Get Connection         │                  │
  │                        ├────────────────────────────────────────────>│
  │                        │  Connection Details     │                  │
  │                        │<────────────────────────────────────────────┤
  │                        │                         │                  │
  │                        │  Fetch Courses          │                  │
  │                        ├────────────────────────>│                  │
  │                        │  Course List            │                  │
  │                        │<────────────────────────┤                  │
  │                        │  Upsert Courses                            │
  │                        ├────────────────────────────────────────────>│
  │                        │                         │                  │
  │                        │  Fetch Assignments      │                  │
  │                        ├────────────────────────>│                  │
  │                        │  Assignment List        │                  │
  │                        │<────────────────────────┤                  │
  │                        │  Upsert Assignments                        │
  │                        ├────────────────────────────────────────────>│
  │                        │                         │                  │
  │                        │  Fetch Announcements    │                  │
  │                        ├────────────────────────>│                  │
  │                        │  Announcement List      │                  │
  │                        │<────────────────────────┤                  │
  │                        │  Upsert Announcements                      │
  │                        ├────────────────────────────────────────────>│
  │                        │                         │                  │
  │                        │  Fetch Grades           │                  │
  │                        ├────────────────────────>│                  │
  │                        │  Grade Data             │                  │
  │                        │<────────────────────────┤                  │
  │                        │  Upsert Grades                             │
  │                        ├────────────────────────────────────────────>│
  │                        │                         │                  │
  │                        │  Update last_sync_at                       │
  │                        ├────────────────────────────────────────────>│
  │                        │                         │                  │
  │  Sync Results          │                         │                  │
  │<───────────────────────┤                         │                  │
```

### 3. Assignment to Task Flow

```
User                    DigiGyan                                    Database
  │                        │                                            │
  │  Click "Add to Tasks"  │                                            │
  ├──────────────────────>│                                            │
  │                        │  Get Assignment Details                   │
  │                        ├───────────────────────────────────────────>│
  │                        │  Assignment Data                          │
  │                        │<───────────────────────────────────────────┤
  │                        │                                            │
  │                        │  Create Task in learner_tasks             │
  │                        ├───────────────────────────────────────────>│
  │                        │  Task Created (task_id)                   │
  │                        │<───────────────────────────────────────────┤
  │                        │                                            │
  │                        │  Update Assignment                        │
  │                        │  (synced_to_task = true, task_id)         │
  │                        ├───────────────────────────────────────────>│
  │                        │  Updated                                  │
  │                        │<───────────────────────────────────────────┤
  │                        │                                            │
  │  Task Created          │                                            │
  │<───────────────────────┤                                            │
  │                        │                                            │
  │  View in Task Planner  │                                            │
  ├──────────────────────>│                                            │
  │                        │  Get Tasks                                │
  │                        ├───────────────────────────────────────────>│
  │                        │  Task List (including Canvas tasks)       │
  │                        │<───────────────────────────────────────────┤
  │  Kanban Board          │                                            │
  │<───────────────────────┤                                            │
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SECURITY LAYERS                                 │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  Layer 1: Authentication                                                │
│  ─────────────────────────                                              │
│  • Supabase Auth (auth.users)                                           │
│  • Session-based authentication                                         │
│  • JWT tokens                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Layer 2: API Authorization                                             │
│  ──────────────────────────                                             │
│  • Check user authentication on every request                           │
│  • Verify user_id matches authenticated user                            │
│  • Return 401 Unauthorized if not authenticated                         │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Layer 3: Row Level Security (RLS)                                      │
│  ──────────────────────────────────                                     │
│  • Enabled on all Canvas tables                                         │
│  • SELECT: WHERE auth.uid() = user_id                                   │
│  • INSERT: WITH CHECK auth.uid() = user_id                              │
│  • UPDATE: WHERE auth.uid() = user_id                                   │
│  • DELETE: WHERE auth.uid() = user_id                                   │
│  • Complete data isolation between users                                │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Layer 4: Data Encryption                                               │
│  ─────────────────────────                                              │
│  • Canvas access tokens stored securely                                 │
│  • HTTPS for all API communications                                     │
│  • Encrypted database connections                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      COMPONENT HIERARCHY                                │
└─────────────────────────────────────────────────────────────────────────┘

LearnerLayout
  │
  ├─ Sidebar
  │   ├─ Navigation Items
  │   │   ├─ Dashboard
  │   │   ├─ My Courses
  │   │   ├─ Browse Courses
  │   │   ├─ Task Planner
  │   │   └─ Canvas LMS ⭐ NEW
  │   └─ Settings
  │
  └─ Main Content
      │
      ├─ CanvasPage (Dashboard)
      │   ├─ Header (title, sync button)
      │   ├─ Stats Cards (courses, assignments, announcements)
      │   ├─ Quick Links (4 cards)
      │   ├─ Upcoming Assignments (preview)
      │   └─ Recent Announcements (preview)
      │
      ├─ CanvasAssignmentsPage
      │   ├─ Header (title, sync all button)
      │   ├─ Filters (search, course, status, submission)
      │   └─ Assignment List
      │       └─ Assignment Card
      │           ├─ Title & Course
      │           ├─ Due Date (with urgency)
      │           ├─ Status Badges
      │           ├─ Description Preview
      │           └─ Actions (open, sync)
      │
      ├─ CanvasAnnouncementsPage
      │   ├─ Header (title, unread count)
      │   ├─ Filters (search, course, read status)
      │   └─ Announcement List
      │       └─ Announcement Card
      │           ├─ Read/Unread Icon
      │           ├─ Title & Course
      │           ├─ Author & Time
      │           ├─ Message (expandable)
      │           └─ Actions (read more, open)
      │
      ├─ CanvasGradesPage
      │   ├─ Header (title)
      │   ├─ Overall Average Card
      │   ├─ Grade Cards (grid)
      │   │   └─ Grade Card
      │   │       ├─ Course Name
      │   │       ├─ Current Grade
      │   │       ├─ Final Grade (if different)
      │   │       └─ Performance Message
      │   └─ Grade Scale Reference
      │
      └─ SettingsPage
          └─ Canvas Integration Section
              ├─ Connection Status
              ├─ Token Input Form (if not connected)
              ├─ Stats Display (if connected)
              ├─ Actions (connect/disconnect/sync)
              └─ Sync Details (if connected)
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TECHNOLOGY STACK                                │
└─────────────────────────────────────────────────────────────────────────┘

Frontend
  ├─ Next.js 14 (App Router)
  ├─ React 18
  ├─ TypeScript
  ├─ Tailwind CSS
  └─ Lucide Icons

Backend
  ├─ Next.js API Routes
  ├─ Supabase Client
  └─ Canvas API Service

Database
  ├─ Supabase (PostgreSQL)
  ├─ Row Level Security (RLS)
  └─ Indexes for Performance

External APIs
  └─ Canvas LMS API v1

Authentication
  └─ Supabase Auth

State Management
  ├─ React useState
  ├─ React useEffect
  └─ Client-side caching
```

---

## Summary

This architecture provides:

✅ **Scalability**: Designed to handle many users and courses
✅ **Security**: Multi-layer security with RLS
✅ **Performance**: Optimized queries with indexes
✅ **Maintainability**: Clean separation of concerns
✅ **Extensibility**: Easy to add new features
✅ **Reliability**: Proper error handling throughout

**A robust, production-ready Canvas LMS integration!** 🎓✨

