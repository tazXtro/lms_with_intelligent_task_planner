# Quick Test Guide - Educator Dashboard Chart Fix ✅

## Quick 5-Minute Test

### Step 1: Open Console (F12)
Open browser developer tools to see debug logs

### Step 2: Visit Educator Dashboard
```
http://localhost:3000/educator/dashboard
```

### Step 3: Check Console Logs
You should see logs like:
```
[Educator Dashboard] Enrollment xxx: {
  course: "Course Name",
  totalLessons: 5,
  completedLessons: 5,
  calculatedProgress: 100,
  isCompleted: true
}
✓ Found completed student for course: Course Name
```

### Step 4: Verify Chart
Look at the **Student Status Distribution** pie chart:
- Should show green section for "Completed" students
- Numbers in legend should match console logs
- Should see the "Updated:" timestamp

### Step 5: Click Refresh
Click the **"Refresh Stats"** button and verify:
- Console shows recalculation logs
- Chart updates (if data changed)
- Timestamp updates to current time

---

## Expected Console Output

### If You Have a Completed Student:
```
[Educator Dashboard] Enrollment abc-123:
{
  course: "React Fundamentals",
  totalLessons: 10,
  completedLessons: 10,
  storedProgress: 100,
  calculatedProgress: 100,
  isCompleted: true
}
✓ Found completed student for course: React Fundamentals

[Educator Dashboard] Final Stats:
{
  totalStudents: 3,
  completedStudents: 1,    ← Should match your data
  activeStudents: 1,
  notStarted: 1,
  averageCompletion: 66,
  totalRevenue: 150
}
```

### If Progress Was Updated:
```
[Educator Dashboard] Updating progress for enrollment abc-123 from 80% to 100%
```

---

## What to Look For

### ✅ Good Signs:
- Console logs show detailed calculations
- `isCompleted: true` for completed students
- `completedStudents` count > 0 in final stats
- Chart shows green "Completed" section
- Numbers add up correctly

### ⚠️ Issues to Check:
- Console shows errors → Check database connectivity
- `completedStudents: 0` but learner completed course → Verify learner finished ALL lessons
- Chart not updating → Click "Refresh Stats" button
- `totalLessons: 0` → Course needs lessons created

---

## Quick Database Check

If something seems off, check the database:

```sql
-- Check enrollments and progress
SELECT 
  c.title as course,
  e.progress,
  COUNT(DISTINCT cl.id) as total_lessons,
  COUNT(DISTINCT lp.id) FILTER (WHERE lp.completed = true) as completed_lessons
FROM enrollments e
JOIN courses c ON c.id = e.course_id
LEFT JOIN course_lessons cl ON cl.course_id = c.id
LEFT JOIN lesson_progress lp ON lp.enrollment_id = e.id
GROUP BY c.title, e.progress;
```

Expected result for a completed student:
```
course          | progress | total_lessons | completed_lessons
----------------|----------|---------------|------------------
React Basics    | 100      | 5             | 5
```

---

## Simulate Completion (For Testing)

### Option 1: Complete Course as Learner
1. Login as learner
2. Go to `/learner/learn/[courseId]`
3. Mark all lessons complete
4. Return to educator dashboard
5. Click "Refresh Stats"

### Option 2: Manually Update Database (Testing Only)
```sql
-- Find an enrollment
SELECT id, course_id, progress FROM enrollments WHERE progress < 100 LIMIT 1;

-- Mark all lessons complete for that enrollment
UPDATE lesson_progress
SET completed = true
WHERE enrollment_id = '[enrollment-id]';

-- Update progress to 100
UPDATE enrollments
SET progress = 100
WHERE id = '[enrollment-id]';
```

Then refresh the educator dashboard.

---

## Success Criteria ✅

Your chart is working correctly if:

1. ✅ Console shows detailed logs for each enrollment
2. ✅ `completedStudents` count matches actual completions
3. ✅ Chart displays green section for completed students
4. ✅ Legend numbers match final stats in console
5. ✅ Clicking "Refresh Stats" recalculates everything
6. ✅ Timestamp updates when refreshing

---

## Common Questions

**Q: Chart shows 0 completed but I know a student finished?**
A: Click "Refresh Stats" - it will recalculate from actual data. Check console logs to see if all lessons are marked complete.

**Q: Progress shows 99% instead of 100%?**
A: The dashboard now rounds properly. If completedLessons = totalLessons, it will show 100%. Check console for the calculation.

**Q: Do I need to refresh manually?**
A: The dashboard recalculates on every load. You can also click "Refresh Stats" anytime to force an update.

**Q: Will old data be fixed?**
A: Yes! The dashboard auto-syncs the enrollments table when it detects a difference between stored and calculated progress.

---

## Next Steps

1. Test the chart with your actual data
2. Review console logs to understand calculations
3. Use "Refresh Stats" when you want updated data
4. Report any discrepancies you find

The chart is now fully functional and integrated with the learner progression system! 🎉

