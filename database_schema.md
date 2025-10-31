# Database Schema Documentation

**Generated:** October 28, 2025  
**Database:** Digigyan LMS (Learning Management System)  
**Platform:** Supabase (PostgreSQL)

---

## Table of Contents

1. [Overview](#overview)
2. [Database Extensions](#database-extensions)
3. [Migration History](#migration-history)
4. [Database Tables](#database-tables)
5. [Entity Relationship Diagram](#entity-relationship-diagram)
6. [Security & RLS Policies](#security--rls-policies)
7. [Database Statistics](#database-statistics)

---

## Overview

The Digigyan LMS database is built on Supabase/PostgreSQL and supports a learning management system with two primary user roles: **Educators** and **Learners**. The database enables course creation, enrollment, progress tracking, and task management.

**Key Features:**
- Role-based access control (Educators & Learners)
- Course management with sections and lessons
- Student enrollment and progress tracking
- Task management with subtasks (JSONB)
- Row-Level Security (RLS) enabled on all tables
- Comprehensive indexing for performance

---

## Database Extensions

### Currently Installed Extensions

| Extension | Version | Schema | Description |
|-----------|---------|--------|-------------|
| `plpgsql` | 1.0 | pg_catalog | PL/pgSQL procedural language |
| `uuid-ossp` | 1.1 | extensions | Generate universally unique identifiers (UUIDs) |
| `pgcrypto` | 1.3 | extensions | Cryptographic functions |
| `pg_stat_statements` | 1.11 | extensions | Track planning and execution statistics of all SQL statements |
| `supabase_vault` | 0.3.1 | vault | Supabase Vault Extension |
| `pg_graphql` | 1.5.11 | graphql | GraphQL support |

### Available Extensions (Not Installed)

The database has access to 70+ additional PostgreSQL extensions including:
- PostGIS (spatial data)
- pg_cron (job scheduler)
- pg_net (async HTTP)
- vector (vector data type for AI/ML)
- And many more...

---

## Migration History

| Version | Name | Description |
|---------|------|-------------|
| `20251028122813` | create_profiles_table | Initial user profiles table |
| `20251028123323` | fix_handle_new_user_search_path | Fix for user creation trigger |
| `20251028132203` | create_courses_schema | Core course tables (courses, sections, lessons, materials) |
| `20251028132227` | add_rls_policies_for_courses | Row-level security policies for courses |
| `20251028152217` | create_learner_tasks_table | Task management system for learners |

---

## Database Tables

### 1. `profiles`

**Purpose:** User profile information for both educators and learners.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | - | Primary key, references auth.users |
| `email` | text | YES | - | User email address |
| `full_name` | text | YES | - | User's full name |
| `role` | text | YES | - | User role: 'educator' or 'learner' |
| `avatar_url` | text | YES | - | Profile picture URL |
| `created_at` | timestamptz | YES | now() | Record creation timestamp |
| `updated_at` | timestamptz | YES | now() | Last update timestamp |

**Constraints:**
- Primary Key: `id`
- Foreign Key: `id` → `auth.users.id`
- Check: `role IN ('educator', 'learner')`

**Indexes:**
- `profiles_pkey` (UNIQUE) on `id`

**RLS Enabled:** ✅ Yes

**Current Rows:** 3

---

### 2. `courses`

**Purpose:** Store course information created by educators.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `educator_id` | uuid | NO | - | Course creator (educator) |
| `title` | text | NO | - | Course title |
| `subtitle` | text | YES | - | Course subtitle |
| `description` | text | YES | - | Detailed course description |
| `category` | text | YES | - | Course category |
| `level` | text | YES | - | Difficulty: 'beginner', 'intermediate', 'advanced', 'all' |
| `language` | text | YES | 'english' | Course language |
| `price` | numeric | YES | 0 | Course price |
| `thumbnail_url` | text | YES | - | Course thumbnail image |
| `preview_video_url` | text | YES | - | Preview/promo video URL |
| `status` | text | YES | 'draft' | Status: 'draft', 'published', 'archived' |
| `learning_objectives` | text[] | YES | - | Array of learning objectives |
| `requirements` | text[] | YES | - | Course prerequisites |
| `target_audience` | text[] | YES | - | Intended audience |
| `created_at` | timestamptz | YES | now() | Creation timestamp |
| `updated_at` | timestamptz | YES | now() | Last update timestamp |
| `published_at` | timestamptz | YES | - | Publication timestamp |

**Constraints:**
- Primary Key: `id`
- Foreign Key: `educator_id` → `auth.users.id`
- Check: `level IN ('beginner', 'intermediate', 'advanced', 'all')`
- Check: `status IN ('draft', 'published', 'archived')`

**Indexes:**
- `courses_pkey` (UNIQUE) on `id`
- `idx_courses_educator` on `educator_id`
- `idx_courses_status` on `status`

**RLS Enabled:** ✅ Yes

**Current Rows:** 2

---

### 3. `course_sections`

**Purpose:** Organize courses into logical sections/modules.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `course_id` | uuid | NO | - | Parent course |
| `title` | text | NO | - | Section title |
| `description` | text | YES | - | Section description |
| `order_index` | integer | NO | - | Display order within course |
| `created_at` | timestamptz | YES | now() | Creation timestamp |
| `updated_at` | timestamptz | YES | now() | Last update timestamp |

**Constraints:**
- Primary Key: `id`
- Foreign Key: `course_id` → `courses.id`
- Unique: `(course_id, order_index)` - ensures unique ordering per course

**Indexes:**
- `course_sections_pkey` (UNIQUE) on `id`
- `course_sections_course_id_order_index_key` (UNIQUE) on `(course_id, order_index)`
- `idx_sections_course` on `course_id`

**RLS Enabled:** ✅ Yes

**Current Rows:** 2

---

### 4. `course_lessons`

**Purpose:** Individual lessons/lectures within course sections.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `section_id` | uuid | NO | - | Parent section |
| `course_id` | uuid | NO | - | Parent course |
| `title` | text | NO | - | Lesson title |
| `description` | text | YES | - | Lesson description |
| `content` | text | YES | - | Lesson content/transcript |
| `video_url` | text | YES | - | Video lecture URL |
| `duration_minutes` | integer | YES | - | Lesson duration in minutes |
| `order_index` | integer | NO | - | Display order within section |
| `is_preview` | boolean | YES | false | Whether lesson is free preview |
| `created_at` | timestamptz | YES | now() | Creation timestamp |
| `updated_at` | timestamptz | YES | now() | Last update timestamp |

**Constraints:**
- Primary Key: `id`
- Foreign Key: `section_id` → `course_sections.id`
- Foreign Key: `course_id` → `courses.id`
- Unique: `(section_id, order_index)` - ensures unique ordering per section

**Indexes:**
- `course_lessons_pkey` (UNIQUE) on `id`
- `course_lessons_section_id_order_index_key` (UNIQUE) on `(section_id, order_index)`
- `idx_lessons_course` on `course_id`
- `idx_lessons_section` on `section_id`

**RLS Enabled:** ✅ Yes

**Current Rows:** 2

---

### 5. `course_materials`

**Purpose:** Downloadable resources and files attached to lessons.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `lesson_id` | uuid | NO | - | Parent lesson |
| `title` | text | NO | - | Material title |
| `description` | text | YES | - | Material description |
| `file_url` | text | NO | - | File download URL |
| `file_type` | text | YES | - | MIME type or file extension |
| `file_size` | bigint | YES | - | File size in bytes |
| `created_at` | timestamptz | YES | now() | Upload timestamp |

**Constraints:**
- Primary Key: `id`
- Foreign Key: `lesson_id` → `course_lessons.id`

**Indexes:**
- `course_materials_pkey` (UNIQUE) on `id`
- `idx_materials_lesson` on `lesson_id`

**RLS Enabled:** ✅ Yes

**Current Rows:** 0

---

### 6. `enrollments`

**Purpose:** Track learner enrollment in courses.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `course_id` | uuid | NO | - | Enrolled course |
| `learner_id` | uuid | NO | - | Enrolled learner |
| `enrolled_at` | timestamptz | YES | now() | Enrollment timestamp |
| `progress` | integer | YES | 0 | Overall progress percentage (0-100) |
| `completed_at` | timestamptz | YES | - | Course completion timestamp |

**Constraints:**
- Primary Key: `id`
- Foreign Key: `course_id` → `courses.id`
- Foreign Key: `learner_id` → `auth.users.id`
- Unique: `(course_id, learner_id)` - prevents duplicate enrollments

**Indexes:**
- `enrollments_pkey` (UNIQUE) on `id`
- `enrollments_course_id_learner_id_key` (UNIQUE) on `(course_id, learner_id)`
- `idx_enrollments_course` on `course_id`
- `idx_enrollments_learner` on `learner_id`

**RLS Enabled:** ✅ Yes

**Current Rows:** 1

---

### 7. `lesson_progress`

**Purpose:** Track individual lesson completion status for enrolled learners.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `enrollment_id` | uuid | NO | - | Related enrollment |
| `lesson_id` | uuid | NO | - | Tracked lesson |
| `completed` | boolean | YES | false | Whether lesson is completed |
| `completed_at` | timestamptz | YES | - | Completion timestamp |
| `last_watched_position` | integer | YES | 0 | Video position in seconds |
| `created_at` | timestamptz | YES | now() | First access timestamp |
| `updated_at` | timestamptz | YES | now() | Last update timestamp |

**Constraints:**
- Primary Key: `id`
- Foreign Key: `enrollment_id` → `enrollments.id`
- Foreign Key: `lesson_id` → `course_lessons.id`
- Unique: `(enrollment_id, lesson_id)` - one progress record per lesson per enrollment

**Indexes:**
- `lesson_progress_pkey` (UNIQUE) on `id`
- `lesson_progress_enrollment_id_lesson_id_key` (UNIQUE) on `(enrollment_id, lesson_id)`
- `idx_lesson_progress_enrollment` on `enrollment_id`

**RLS Enabled:** ✅ Yes

**Current Rows:** 0

---

### 8. `learner_tasks`

**Purpose:** Task management system for learners with subtask support.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `learner_id` | uuid | NO | - | Task owner (learner) |
| `course_id` | uuid | YES | - | Associated course (optional) |
| `title` | text | NO | - | Task title |
| `description` | text | YES | - | Task description |
| `status` | text | NO | 'todo' | Status: 'todo', 'in-progress', 'completed' |
| `priority` | text | NO | 'medium' | Priority: 'low', 'medium', 'high' |
| `due_date` | date | YES | - | Task deadline |
| `subtasks` | jsonb | YES | '[]' | Subtasks array (JSONB format) |
| `created_at` | timestamptz | YES | now() | Creation timestamp |
| `updated_at` | timestamptz | YES | now() | Last update timestamp |

**Constraints:**
- Primary Key: `id`
- Foreign Key: `learner_id` → `auth.users.id`
- Foreign Key: `course_id` → `courses.id` (nullable)
- Check: `status IN ('todo', 'in-progress', 'completed')`
- Check: `priority IN ('low', 'medium', 'high')`

**Indexes:**
- `learner_tasks_pkey` (UNIQUE) on `id`
- `idx_learner_tasks_learner_id` on `learner_id`
- `idx_learner_tasks_course_id` on `course_id`
- `idx_learner_tasks_status` on `status`

**RLS Enabled:** ✅ Yes

**Current Rows:** 1

**Subtasks Format (JSONB):**
```json
[
  {
    "id": "uuid",
    "title": "Subtask title",
    "completed": false
  }
]
```

---

## Entity Relationship Diagram

```
┌──────────────┐
│  auth.users  │
│  (Supabase)  │
└──────┬───────┘
       │
       │ 1:1
       ▼
┌──────────────┐
│   profiles   │──────────────────────────────────────┐
│              │                                      │
│ - role       │                                      │
│   (educator/ │                                      │
│    learner)  │                                      │
└──────┬───────┘                                      │
       │                                              │
       │ educator_id (1:N)           learner_id (1:N)│
       │                                              │
       ▼                                              ▼
┌──────────────┐                              ┌──────────────┐
│   courses    │                              │ enrollments  │
│              │◄─────────────────────────────┤              │
│ - status     │      course_id (N:1)         │ - progress   │
│ - price      │                              │              │
│ - level      │                              └──────┬───────┘
└──────┬───────┘                                     │
       │                                             │
       │ 1:N                                         │ 1:N
       ▼                                             ▼
┌──────────────┐                              ┌──────────────┐
│course_       │                              │lesson_       │
│sections      │                              │progress      │
│              │                              │              │
│ - order_idx  │                              │ - completed  │
└──────┬───────┘                              │ - last_pos   │
       │                                      └──────┬───────┘
       │ 1:N                                         │
       ▼                                             │
┌──────────────┐                                     │
│course_       │◄────────────────────────────────────┘
│lessons       │        lesson_id (N:1)
│              │
│ - video_url  │
│ - duration   │
│ - order_idx  │
│ - is_preview │
└──────┬───────┘
       │
       │ 1:N
       ▼
┌──────────────┐
│course_       │
│materials     │
│              │
│ - file_url   │
│ - file_size  │
└──────────────┘

┌──────────────┐
│ learner_     │
│ tasks        │◄──── learner_id (N:1) ──── profiles (learners)
│              │
│ - status     │◄──── course_id (N:1, optional) ──── courses
│ - priority   │
│ - subtasks   │
│   (JSONB)    │
└──────────────┘
```

---

## Security & RLS Policies

All tables have Row-Level Security (RLS) **ENABLED**. Below are the active policies:

### `profiles`
- **Users can view their own profile** (SELECT) - `auth.uid() = id`
- **Users can insert their own profile** (INSERT) - `auth.uid() = id`
- **Users can update their own profile** (UPDATE) - `auth.uid() = id`

### `courses`
- **Anyone can view published courses** (SELECT) - `status = 'published'`
- **Educators can view their own courses** (SELECT) - `auth.uid() = educator_id`
- **Educators can create courses** (INSERT) - `auth.uid() = educator_id`
- **Educators can update their own courses** (UPDATE) - `auth.uid() = educator_id`
- **Educators can delete their own courses** (DELETE) - `auth.uid() = educator_id`

### `course_sections`
- **Anyone can view sections of published courses** (SELECT) - course is published
- **Educators can manage sections of their courses** (ALL) - owns the course

### `course_lessons`
- **Anyone can view lessons of published courses** (SELECT) - course is published
- **Educators can manage lessons of their courses** (ALL) - owns the course

### `course_materials`
- **Enrolled learners can view materials** (SELECT) - enrolled in the course
- **Educators can manage materials of their courses** (ALL) - owns the course

### `enrollments`
- **Learners can view their own enrollments** (SELECT) - `auth.uid() = learner_id`
- **Learners can enroll in courses** (INSERT) - `auth.uid() = learner_id`
- **Educators can view enrollments in their courses** (SELECT) - owns the course

### `lesson_progress`
- **Learners can manage their own progress** (ALL) - enrolled in the course
- **Educators can view progress in their courses** (SELECT) - owns the course

### `learner_tasks`
- **Users can view their own tasks** (SELECT) - `auth.uid() = learner_id`
- **Users can insert their own tasks** (INSERT) - `auth.uid() = learner_id`
- **Users can update their own tasks** (UPDATE) - `auth.uid() = learner_id`
- **Users can delete their own tasks** (DELETE) - `auth.uid() = learner_id`

---

## Database Statistics

### Current State

| Table | Rows | RLS Enabled | Indexes | Policies |
|-------|------|-------------|---------|----------|
| `profiles` | 3 | ✅ | 1 | 3 |
| `courses` | 2 | ✅ | 3 | 5 |
| `course_sections` | 2 | ✅ | 3 | 2 |
| `course_lessons` | 2 | ✅ | 4 | 2 |
| `course_materials` | 0 | ✅ | 2 | 2 |
| `enrollments` | 1 | ✅ | 4 | 3 |
| `lesson_progress` | 0 | ✅ | 3 | 2 |
| `learner_tasks` | 1 | ✅ | 4 | 4 |

**Total Tables:** 8  
**Total Rows:** 11  
**Total Indexes:** 24  
**Total RLS Policies:** 23

### Key Relationships

- **Foreign Keys:** 13 relationships
- **Unique Constraints:** 6 (preventing duplicates)
- **Check Constraints:** Multiple for data integrity (status, level, priority, role validation)

---

## Database Health & Best Practices

### ✅ Strengths

1. **Security First**: RLS enabled on all tables with comprehensive policies
2. **Proper Indexing**: Foreign keys and frequently queried columns are indexed
3. **Data Integrity**: Check constraints ensure valid enum values
4. **Audit Trail**: Created_at and updated_at timestamps on all tables
5. **UUID Primary Keys**: Better for distributed systems and security
6. **Normalized Structure**: Well-designed relationships with proper foreign keys
7. **Flexible Features**: JSONB for subtasks allows schema flexibility

### 🔍 Observations

1. **Low Data Volume**: Currently in development/testing phase (11 total rows)
2. **No lesson_progress records**: No active learner progress tracking yet
3. **No course_materials**: No downloadable resources uploaded yet
4. **Array Columns**: Using PostgreSQL arrays for learning_objectives, requirements, target_audience

### 📋 Potential Improvements

1. **Add full-text search**: Consider adding GIN indexes for text search on course titles/descriptions
2. **Soft Deletes**: Consider adding `deleted_at` columns instead of hard deletes
3. **Course Analytics**: Consider adding tables for:
   - Course views/impressions
   - Quiz/assessment results
   - Student ratings/reviews
4. **Notifications**: Consider adding a notifications table for user alerts
5. **Media Management**: Consider Supabase Storage integration for course materials

---

## Notes

- **Database Type**: PostgreSQL (via Supabase)
- **Authentication**: Managed by Supabase Auth (`auth.users` table)
- **All timestamps use timezone-aware `timestamptz`**
- **Default UUID generation**: Uses `gen_random_uuid()` function
- **Migration-based**: Schema changes tracked via migration files

---

**End of Database Schema Documentation**

