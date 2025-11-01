# 🚀 Canvas LMS Integration - Quick Start Guide

Get your Canvas courses, assignments, and grades into DigiGyan in 5 minutes!

---

## 📋 Prerequisites

- Active Canvas account (student account)
- Access to Canvas settings
- DigiGyan learner account

---

## ⚡ Quick Setup (5 Steps)

### Step 1: Get Your Canvas Access Token (2 minutes)

1. **Log in to Canvas**
   - Go to your Canvas instance (e.g., `https://canvas.instructure.com`)
   - Sign in with your credentials

2. **Navigate to Settings**
   - Click on **Account** (top left)
   - Click on **Settings**

3. **Create Access Token**
   - Scroll down to **Approved Integrations**
   - Click **+ New Access Token**
   - Purpose: `DigiGyan Integration`
   - Expiration: Choose a date (or leave blank for no expiration)
   - Click **Generate Token**

4. **Copy Token**
   - ⚠️ **IMPORTANT**: Copy the token immediately!
   - You won't be able to see it again
   - Keep it secure (don't share with anyone)

### Step 2: Connect Canvas to DigiGyan (1 minute)

1. **Go to DigiGyan Settings**
   - Navigate to `http://localhost:3000/learner/settings`
   - Scroll to **Canvas LMS Integration** section

2. **Click "Connect Canvas"**
   - A form will appear

3. **Enter Your Details**
   - **Canvas URL**: Your Canvas instance URL
     - Examples:
       - `https://canvas.instructure.com` (if using Canvas Free)
       - `https://yourschool.instructure.com` (your school's Canvas)
   - **Access Token**: Paste the token you copied

4. **Click "Connect"**
   - Wait for validation (a few seconds)
   - Automatic sync will start

### Step 3: Wait for Initial Sync (1-2 minutes)

The system will automatically sync:
- ✅ All your Canvas courses
- ✅ All assignments (with due dates and grades)
- ✅ All announcements
- ✅ Your grades

You'll see a success message with sync statistics!

### Step 4: Explore Your Canvas Data (1 minute)

1. **Go to Canvas Dashboard**
   - Click **Canvas LMS** in the sidebar
   - View your overview dashboard

2. **Check Out Different Sections**
   - **Assignments**: See all your assignments with due dates
   - **Announcements**: Read course updates
   - **Grades**: Check your performance

### Step 5: Sync Assignments to Task Planner (30 seconds)

1. **Go to Canvas Assignments**
   - Click on **Assignments** from Canvas dashboard

2. **Sync to Tasks**
   - Click **Sync All to Tasks** (top right)
   - Or click **Add to Tasks** on individual assignments

3. **View in Task Planner**
   - Go to **Task Planner** in sidebar
   - See your Canvas assignments as tasks with due dates!

---

## 🎯 What You Can Do Now

### View Everything in One Place
- All courses from Canvas
- All assignments with due dates
- All announcements from all courses
- All grades with averages

### Smart Filtering
- Filter assignments by course
- Filter by due date (upcoming, past)
- Filter by submission status
- Search across all data

### Task Management
- Sync Canvas assignments to Kanban board
- Track progress visually
- Get due date reminders
- Organize with priorities

### Stay Updated
- Click "Sync Now" anytime to refresh
- See unread announcements
- Track assignment submissions
- Monitor grade changes

---

## 💡 Pro Tips

### 1. **Regular Syncing**
- Sync once daily for latest data
- Sync before checking assignments
- Sync after submitting work

### 2. **Use Filters**
- Filter assignments by "Upcoming" to focus on what's due soon
- Filter announcements by "Unread" to catch up on updates
- Use course filter to focus on one class

### 3. **Task Planner Integration**
- Sync all upcoming assignments to Task Planner
- Use Kanban board to track progress
- Move tasks through "To Do" → "In Progress" → "Completed"

### 4. **Urgency Indicators**
- 🔴 Red = Overdue
- 🟡 Yellow = Due today or tomorrow
- ⚪ Gray = Future assignments

### 5. **Quick Actions**
- Click "Open in Canvas" to submit assignments
- Mark announcements as read after viewing
- Check grades regularly for updates

---

## 🔄 Daily Workflow

### Morning Routine (2 minutes)
1. Open DigiGyan Canvas dashboard
2. Click "Sync Now"
3. Check unread announcements
4. Review upcoming assignments
5. Update Task Planner

### Before Class (1 minute)
1. Filter assignments by course
2. Check for new announcements
3. Review assignment due dates

### After Submitting Work (30 seconds)
1. Sync Canvas data
2. Verify submission status
3. Update task status in Task Planner

### End of Week (3 minutes)
1. Full sync of all data
2. Review grades
3. Plan next week's assignments
4. Sync new assignments to tasks

---

## 🎨 UI Features

### Dashboard
- **Stats Cards**: Quick overview of courses, assignments, announcements
- **Quick Links**: Fast access to all sections
- **Recent Activity**: Upcoming assignments and announcements preview

### Assignments Page
- **Color-Coded Urgency**: Visual indicators for due dates
- **Status Badges**: Submitted, graded, synced to tasks
- **Bulk Actions**: Sync all or selected assignments
- **Direct Links**: Open in Canvas for submission

### Announcements Page
- **Read/Unread**: Track what you've seen
- **Expandable Cards**: Read more without leaving page
- **Time Stamps**: See how recent announcements are
- **Course Labels**: Know which class posted what

### Grades Page
- **Overall Average**: See your GPA across all courses
- **Color Coding**: Visual grade indicators
- **Performance Insights**: Motivational messages
- **Grade Scale**: Reference for understanding grades

---

## ❓ Common Questions

### Q: Is my Canvas token secure?
**A:** Yes! Your token is stored securely in the database with Row Level Security. Only you can access it.

### Q: How often should I sync?
**A:** Once daily is good. Sync more frequently if you're actively working on assignments.

### Q: Can I disconnect Canvas?
**A:** Yes! Go to Settings → Canvas Integration → Disconnect. This removes all synced data.

### Q: What if my token expires?
**A:** You'll see connection errors. Simply generate a new token and reconnect.

### Q: Does syncing to Task Planner submit assignments?
**A:** No! It only creates tasks for tracking. You still submit through Canvas.

### Q: Can I edit Canvas data in DigiGyan?
**A:** No, DigiGyan is read-only. All changes must be made in Canvas.

### Q: What happens if I delete a task synced from Canvas?
**A:** The Canvas assignment remains unchanged. Only the task is deleted.

---

## 🐛 Troubleshooting

### "Failed to connect to Canvas"
- ✅ Check Canvas URL format (must include `https://`)
- ✅ Verify access token is correct
- ✅ Ensure token hasn't expired

### "No data synced"
- ✅ Verify you're enrolled in Canvas courses
- ✅ Check courses are active (not concluded)
- ✅ Try manual sync again

### "Assignments not showing"
- ✅ Ensure assignments are published in Canvas
- ✅ Check assignment workflow state
- ✅ Verify course enrollment

### "Sync taking too long"
- ✅ Normal for first sync (lots of data)
- ✅ Subsequent syncs are faster
- ✅ Wait patiently, don't refresh

---

## 🎉 You're All Set!

You now have:
- ✅ Canvas connected to DigiGyan
- ✅ All your courses, assignments, and grades synced
- ✅ Assignments in your Task Planner
- ✅ A unified learning dashboard

**Enjoy your streamlined learning experience!**

---

## 📚 Need More Help?

- **Full Documentation**: See `CANVAS_INTEGRATION_GUIDE.md`
- **Task Planner Guide**: See `TASK_PLANNER_IMPLEMENTATION.md`
- **Settings**: Visit `/learner/settings` for connection management

---

## 🚀 Next Steps

1. **Explore Features**: Try all the filters and search
2. **Customize Task Planner**: Organize your Canvas assignments
3. **Set Up Reminders**: Use notification settings
4. **Sync Google Calendar**: Connect for calendar integration
5. **Check Daily**: Make it part of your routine

**Happy Learning! 🎓**

