# 🎓 Canvas LMS Integration - Complete Guide

## Overview

The Canvas LMS integration brings all your Canvas courses, assignments, announcements, and grades into DigiGyan, providing a unified learning experience. This integration allows learners to manage their Canvas coursework alongside their DigiGyan courses in one centralized platform.

---

## 🌟 Key Features

### 1. **Seamless Canvas Connection**
- Connect using Canvas access token
- Support for any Canvas instance (Instructure, institutional)
- Secure token storage with RLS policies
- One-click sync functionality

### 2. **Comprehensive Data Sync**
- **Courses**: All enrolled Canvas courses
- **Assignments**: Full assignment details with due dates, submissions, and grades
- **Announcements**: Course announcements with read/unread status
- **Grades**: Current and final grades for all courses

### 3. **Smart Assignment Integration**
- Sync Canvas assignments to Task Planner (Kanban board)
- Automatic todo creation with due dates
- Assignment status tracking (submitted/not submitted)
- Direct links to Canvas for submission

### 4. **Advanced Filtering & Search**
- Filter by course, due date, submission status
- Search across assignments and announcements
- Sort by relevance and date
- Read/unread tracking for announcements

### 5. **Beautiful UI/UX**
- Dashboard with overview statistics
- Color-coded urgency indicators
- Responsive design for all devices
- Consistent with DigiGyan's neobrutalist design

---

## 📋 Database Schema

### Tables Created

#### 1. `canvas_connections`
Stores Canvas connection settings for each user.

```sql
- id: UUID (primary key)
- user_id: UUID (foreign key to auth.users)
- canvas_url: TEXT (Canvas instance URL)
- access_token: TEXT (encrypted access token)
- is_connected: BOOLEAN
- last_sync_at: TIMESTAMPTZ
- sync_enabled: BOOLEAN
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### 2. `canvas_courses`
Synced Canvas courses.

```sql
- id: UUID (primary key)
- user_id: UUID (foreign key)
- canvas_course_id: TEXT (Canvas's course ID)
- name: TEXT
- course_code: TEXT
- workflow_state: TEXT
- start_at: TIMESTAMPTZ
- end_at: TIMESTAMPTZ
- enrollment_type: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### 3. `canvas_assignments`
Synced Canvas assignments with submission tracking.

```sql
- id: UUID (primary key)
- user_id: UUID (foreign key)
- canvas_course_id: TEXT
- canvas_assignment_id: TEXT
- name: TEXT
- description: TEXT
- due_at: TIMESTAMPTZ
- points_possible: NUMERIC
- submission_types: TEXT[]
- workflow_state: TEXT
- html_url: TEXT
- has_submitted: BOOLEAN
- grade: TEXT
- score: NUMERIC
- synced_to_task: BOOLEAN
- task_id: UUID (foreign key to learner_tasks)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### 4. `canvas_announcements`
Synced Canvas announcements.

```sql
- id: UUID (primary key)
- user_id: UUID (foreign key)
- canvas_course_id: TEXT
- canvas_announcement_id: TEXT
- title: TEXT
- message: TEXT
- posted_at: TIMESTAMPTZ
- author_name: TEXT
- html_url: TEXT
- is_read: BOOLEAN
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### 5. `canvas_grades`
Synced Canvas grades.

```sql
- id: UUID (primary key)
- user_id: UUID (foreign key)
- canvas_course_id: TEXT
- current_grade: TEXT
- current_score: NUMERIC
- final_grade: TEXT
- final_score: NUMERIC
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring:
- Users can only view their own data
- Users can only insert/update/delete their own records
- Complete data isolation between users

---

## 🔧 API Routes

### Connection Management

#### `GET /api/canvas/connect`
Get Canvas connection status and statistics.

**Response:**
```json
{
  "connected": true,
  "settings": {
    "canvas_url": "https://canvas.instructure.com",
    "last_sync_at": "2025-11-01T12:00:00Z",
    "sync_enabled": true
  },
  "stats": {
    "courses": 5,
    "assignments": 23,
    "announcements": 12
  }
}
```

#### `POST /api/canvas/connect`
Connect to Canvas with access token.

**Request:**
```json
{
  "canvasUrl": "https://canvas.instructure.com",
  "accessToken": "your-canvas-token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully connected to Canvas",
  "canvasUser": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### `DELETE /api/canvas/connect`
Disconnect Canvas and remove all synced data.

### Data Sync

#### `POST /api/canvas/sync`
Sync all Canvas data (courses, assignments, announcements, grades).

**Response:**
```json
{
  "success": true,
  "message": "Canvas data synced successfully",
  "results": {
    "courses": 5,
    "assignments": 23,
    "announcements": 12,
    "grades": 5,
    "errors": []
  }
}
```

### Assignments

#### `GET /api/canvas/assignments`
Get Canvas assignments with filters.

**Query Parameters:**
- `courseId`: Filter by course (optional)
- `status`: Filter by due date status - `upcoming`, `past`, `all` (optional)
- `submitted`: Filter by submission status - `true`, `false`, `all` (optional)

#### `POST /api/canvas/assignments/sync-to-tasks`
Sync Canvas assignments to Task Planner.

**Request:**
```json
{
  "assignmentIds": ["uuid1", "uuid2"],  // Optional, if not provided syncs all
  "syncAll": false
}
```

### Announcements

#### `GET /api/canvas/announcements`
Get Canvas announcements with filters.

**Query Parameters:**
- `courseId`: Filter by course (optional)
- `isRead`: Filter by read status - `true`, `false`, `all` (optional)
- `limit`: Limit number of results (optional)

#### `PATCH /api/canvas/announcements`
Mark announcement as read/unread.

**Request:**
```json
{
  "announcementId": "uuid",
  "isRead": true
}
```

### Courses & Grades

#### `GET /api/canvas/courses`
Get all synced Canvas courses.

#### `GET /api/canvas/grades`
Get grades for all Canvas courses.

---

## 🎨 User Interface

### Pages Created

#### 1. **Canvas Dashboard** (`/learner/canvas`)
- Overview statistics (courses, assignments, announcements)
- Quick links to all Canvas sections
- Upcoming assignments preview
- Recent announcements preview
- One-click sync button

#### 2. **Assignments Page** (`/learner/canvas/assignments`)
- Complete list of all Canvas assignments
- Advanced filtering (course, due date, submission status)
- Search functionality
- Due date urgency indicators (overdue, today, tomorrow, soon)
- Submission status badges
- Grade display (if graded)
- "Sync to Tasks" functionality (individual or bulk)
- Direct links to Canvas for submission

#### 3. **Announcements Page** (`/learner/canvas/announcements`)
- All course announcements in one place
- Read/unread status tracking
- Filter by course and read status
- Search functionality
- Expandable announcement cards
- Time-ago formatting (e.g., "2h ago", "Yesterday")
- Mark as read/unread functionality
- Direct links to Canvas

#### 4. **Grades Page** (`/learner/canvas/grades`)
- All course grades in one view
- Overall average calculation
- Current and final grades
- Color-coded grade indicators
- Grade scale reference
- Performance insights
- Visual grade cards

#### 5. **Settings Integration** (`/learner/settings`)
- Canvas connection card
- Token input form
- Connection status display
- Sync statistics
- Connect/Disconnect/Sync buttons
- Last sync timestamp

---

## 🚀 How to Use

### For Learners

#### Step 1: Generate Canvas Access Token

1. Log in to your Canvas account
2. Go to **Account** → **Settings**
3. Scroll to **Approved Integrations**
4. Click **+ New Access Token**
5. Enter a purpose (e.g., "DigiGyan Integration")
6. Set expiration date (optional)
7. Click **Generate Token**
8. **Copy the token immediately** (you won't see it again!)

#### Step 2: Connect Canvas to DigiGyan

1. Go to DigiGyan Settings (`/learner/settings`)
2. Find the **Canvas LMS Integration** section
3. Click **Connect Canvas**
4. Enter your Canvas URL (e.g., `https://canvas.instructure.com` or your school's Canvas URL)
5. Paste your access token
6. Click **Connect**
7. Wait for automatic sync to complete

#### Step 3: Explore Canvas Data

1. Navigate to **Canvas LMS** from the sidebar
2. View your dashboard with all statistics
3. Click on any section to explore:
   - **Assignments**: View, filter, and sync to Task Planner
   - **Announcements**: Read and manage course updates
   - **Grades**: Check your performance across all courses

#### Step 4: Sync Assignments to Task Planner

**Option 1: Bulk Sync**
1. Go to Canvas Assignments page
2. Click **Sync All to Tasks**
3. All upcoming assignments will be added to your Kanban board

**Option 2: Individual Sync**
1. Find a specific assignment
2. Click **Add to Tasks**
3. Assignment appears in Task Planner with due date

#### Step 5: Stay Updated

- Click **Sync Now** anytime to refresh Canvas data
- Assignments automatically show urgency (overdue, today, tomorrow)
- Announcements show unread count
- Grades update with each sync

---

## 🔐 Security Features

### 1. **Token Security**
- Access tokens stored securely in database
- Never exposed in client-side code
- RLS policies prevent unauthorized access

### 2. **Data Isolation**
- Each user's Canvas data completely isolated
- RLS policies on all tables
- No cross-user data leakage

### 3. **API Security**
- All routes require authentication
- User verification on every request
- Proper error handling without data exposure

---

## 🎯 Integration with Existing Features

### Task Planner Integration

Canvas assignments can be synced to the existing Kanban Task Planner:

1. **Automatic Todo Creation**
   - Assignment name becomes task title
   - Due date synced to task due date
   - Priority set based on urgency
   - Description includes Canvas assignment details

2. **Bidirectional Tracking**
   - `synced_to_task` flag prevents duplicates
   - `task_id` links Canvas assignment to task
   - Task completion doesn't affect Canvas submission status

3. **Visual Indicators**
   - Canvas assignments prefixed with `[Canvas]`
   - Special badges in Task Planner
   - Due date urgency colors

### Calendar Integration (Future Enhancement)

Canvas assignments can be synced to Google Calendar:
- Assignment due dates as calendar events
- Automatic reminders
- Color coding by course

---

## 📊 Features Comparison

| Feature | Canvas Native | DigiGyan Canvas Integration |
|---------|---------------|----------------------------|
| View Assignments | ✅ | ✅ |
| Filter by Course | ✅ | ✅ |
| Search | ✅ | ✅ |
| Due Date Tracking | ✅ | ✅ Enhanced with urgency |
| Announcements | ✅ | ✅ Unified view |
| Grades | ✅ | ✅ With analytics |
| Task Management | ❌ | ✅ Kanban integration |
| Unified Dashboard | ❌ | ✅ |
| Cross-Course View | Limited | ✅ All courses together |
| Read/Unread Tracking | ✅ | ✅ |
| Calendar Sync | Limited | ✅ Google Calendar |

---

## 🐛 Troubleshooting

### Connection Issues

**Problem**: "Failed to connect to Canvas"
- **Solution**: Verify Canvas URL is correct (include https://)
- **Solution**: Ensure access token is valid and not expired
- **Solution**: Check if Canvas instance is accessible

**Problem**: "Unauthorized" error
- **Solution**: Regenerate Canvas access token
- **Solution**: Ensure token has proper permissions

### Sync Issues

**Problem**: "No data synced"
- **Solution**: Verify you're enrolled in Canvas courses
- **Solution**: Check Canvas courses are active
- **Solution**: Try manual sync from settings

**Problem**: "Some assignments missing"
- **Solution**: Ensure assignments are published in Canvas
- **Solution**: Check assignment workflow state
- **Solution**: Verify course enrollment status

### Performance Issues

**Problem**: "Sync taking too long"
- **Solution**: Normal for first sync with many courses
- **Solution**: Subsequent syncs are faster (only updates)
- **Solution**: Consider syncing during off-peak hours

---

## 🔮 Future Enhancements

### Planned Features

1. **Real-time Sync**
   - Webhook integration for instant updates
   - No manual sync required

2. **Assignment Submissions**
   - Submit assignments directly from DigiGyan
   - File upload support

3. **Discussion Forums**
   - View and participate in Canvas discussions
   - Unified notification system

4. **Calendar Events**
   - Sync Canvas calendar events
   - Integration with Google Calendar

5. **Grade Predictions**
   - AI-powered grade predictions
   - "What-if" grade calculator

6. **Study Groups**
   - Create study groups from Canvas courses
   - Collaborative features

7. **Mobile App**
   - Native mobile experience
   - Push notifications for assignments

---

## 📝 Technical Implementation Details

### Canvas API Service (`lib/canvas-api.ts`)

The `CanvasAPIService` class handles all Canvas API interactions:

**Key Methods:**
- `testConnection()`: Verify Canvas connection
- `getCourses()`: Fetch all enrolled courses
- `getAllAssignments()`: Fetch assignments across all courses
- `getAllAnnouncements()`: Fetch announcements with sorting
- `getEnrollments()`: Fetch enrollments with grades
- `getUpcomingAssignments()`: Filter for upcoming assignments

**Error Handling:**
- Graceful failure for individual course errors
- Continues processing even if one course fails
- Detailed error logging

### Data Flow

1. **Connection**: User provides Canvas URL + token → Validated → Stored
2. **Sync**: Fetch from Canvas API → Transform data → Upsert to database
3. **Display**: Query database → Apply filters → Render UI
4. **Task Sync**: Select assignments → Create tasks → Link records

---

## 🎓 Best Practices

### For Users

1. **Regular Syncing**
   - Sync at least once daily
   - Sync before checking assignments
   - Sync after Canvas updates

2. **Token Management**
   - Set reasonable expiration dates
   - Regenerate tokens periodically
   - Never share your token

3. **Task Organization**
   - Use Task Planner for Canvas assignments
   - Leverage priority and due dates
   - Mark tasks complete when submitted

### For Developers

1. **API Rate Limiting**
   - Respect Canvas API rate limits
   - Implement exponential backoff
   - Cache frequently accessed data

2. **Error Handling**
   - Always handle Canvas API errors
   - Provide user-friendly error messages
   - Log errors for debugging

3. **Data Consistency**
   - Use upsert for idempotent operations
   - Handle duplicate records gracefully
   - Maintain referential integrity

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review error messages carefully
3. Verify Canvas connection and token
4. Check Canvas API status
5. Contact DigiGyan support

---

## ✅ Summary

The Canvas LMS integration provides:
- ✅ Seamless connection to any Canvas instance
- ✅ Comprehensive data sync (courses, assignments, announcements, grades)
- ✅ Beautiful, intuitive UI
- ✅ Advanced filtering and search
- ✅ Task Planner integration
- ✅ Secure and private
- ✅ Easy to use

**Your Canvas data, beautifully organized in DigiGyan!** 🎉

