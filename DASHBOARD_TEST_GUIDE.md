# Learner Dashboard - Testing Guide

## Quick Test Checklist ✅

### Test the Dashboard Stats
Visit: `http://localhost:3000/learner/dashboard`

### What to Verify

#### 1. **Welcome Section**
- [ ] Shows your actual name (from profile)
- [ ] Shows personalized message based on enrollment status
- [ ] Displays overall progress percentage
- [ ] Progress bar reflects accurate progress
- [ ] Quick action buttons appear (Continue Learning / Browse Courses)

#### 2. **Stat Cards (Top Row)**
- [ ] **Courses Enrolled**: Shows correct count
  - If you have completed courses, shows "X completed"
  - Otherwise shows "Active learning"
  
- [ ] **Lessons Completed**: Shows actual count of completed lessons
  - Should match the number of lessons you've marked complete
  - Shows "Keep going!" if > 0, "Start learning!" if 0
  
- [ ] **Avg Progress**: Shows average across all courses
  - Should be calculated correctly: sum of all progress / number of courses
  - Shows "Across X course(s)" or "No courses yet"
  
- [ ] **Courses Available**: Shows total published courses
  - Shows count of courses you can explore
  - Shows "X to explore" or "All enrolled!" if enrolled in all

#### 3. **Your Courses Section**
- [ ] Each course card shows status badge:
  - **Green "Completed"** for 100% progress
  - **Blue "In Progress"** for >0% and <100%
  - **Gray "Not Started"** for 0% progress
  
- [ ] Progress bars show accurate percentages
- [ ] Lesson counts are correct
- [ ] Button text changes based on status:
  - "Start Learning" for not started
  - "Continue Learning" for in progress
  - "Review Course" for completed

#### 4. **Recommended Courses Section**
- [ ] Shows courses you're not enrolled in
- [ ] Displays enrollment counts
- [ ] Shows prices correctly

---

## Testing Scenarios

### Scenario 1: Fresh Learner (No Enrollments)
**Expected Results:**
- All stats show 0
- Welcome message: "Start your learning journey today!"
- Shows "Browse Courses" button
- No "Your Courses" section visible
- Shows recommended courses

### Scenario 2: Enrolled but Not Started
**Expected Results:**
- Courses Enrolled: 1+ (with "Active learning")
- Lessons Completed: 0 (with "Start learning!")
- Avg Progress: 0%
- Course cards show "Not Started" badge
- Button says "Start Learning"

### Scenario 3: Learning in Progress
**Expected Results:**
- Accurate lesson completion count
- Progress percentages match actual completion
- Course cards show "In Progress" badge
- Button says "Continue Learning"
- "Continue Learning" quick action appears

### Scenario 4: Completed Courses
**Expected Results:**
- Completed count shows in "Courses Enrolled" stat
- 100% progress for completed courses
- Green "Completed" badge on course cards
- Button says "Review Course"
- Average includes 100% in calculation

---

## Manual Testing Steps

### Step 1: Check Initial State
1. Navigate to dashboard
2. Verify all stats load correctly
3. Check that stats match your actual data

### Step 2: Complete a Lesson
1. Go to a course (`/learner/learn/[courseId]`)
2. Mark a lesson as complete
3. Return to dashboard
4. Verify "Lessons Completed" count increased
5. Verify course progress percentage updated

### Step 3: Complete a Course
1. Complete all lessons in a course
2. Return to dashboard
3. Verify progress shows 100%
4. Verify "Completed" badge appears
5. Verify completed count in stats

### Step 4: Enroll in New Course
1. Browse and enroll in a new course
2. Return to dashboard
3. Verify "Courses Enrolled" increased
4. Verify "Courses Available" decreased
5. New course appears in "Your Courses"

---

## Expected Database Queries

The dashboard now makes these queries:

### For Each Enrollment:
```typescript
// Count total lessons
SELECT COUNT(*) FROM course_lessons 
WHERE course_id = ?

// Count completed lessons
SELECT COUNT(*) FROM lesson_progress 
WHERE enrollment_id = ? AND completed = true
```

### For Stats:
```typescript
// Total published courses
SELECT COUNT(*) FROM courses 
WHERE status = 'published'

// User profile
SELECT full_name FROM profiles 
WHERE id = ?
```

---

## Performance Notes

- Dashboard loads all data on mount
- Calculations happen server-side (Supabase counts)
- Progress is auto-synced with enrollment records
- Should load in < 2 seconds with typical data

---

## Troubleshooting

### Stats Show 0 Despite Having Progress
**Solution:** The dashboard now auto-syncs progress. Refresh once and it should update the enrollment records.

### Progress Doesn't Match Course Player
**Solution:** This was the original issue - now fixed! Both now query the same `lesson_progress` table.

### Course Not Appearing
**Check:**
- Is the course published? (Only published courses show)
- Are you enrolled? (Check enrollments table)
- Does the course have lessons? (Check course_lessons table)

### Name Shows "Learner"
**Check:**
- Does your profile have a `full_name` set?
- Are you logged in?

---

## Success Indicators ✅

Your dashboard is working correctly if:
1. ✅ Stats show real numbers (not 0 or approximations)
2. ✅ Progress percentages are accurate
3. ✅ Lesson counts match reality
4. ✅ Course badges reflect actual status
5. ✅ Welcome message is personalized
6. ✅ Quick actions work correctly
7. ✅ Stats update when you complete lessons

---

## Next: Try It Out!

1. Visit `http://localhost:3000/learner/dashboard`
2. Check all the stats
3. Enroll in a course if you haven't
4. Complete some lessons
5. Return to dashboard and see the stats update!

The dashboard is now fully functional and ready to use! 🎉

