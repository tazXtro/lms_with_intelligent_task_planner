# Google Calendar Sync - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Enable Google Calendar API (2 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Library**
4. Search for "Google Calendar API"
5. Click **Enable**

### Step 2: Verify Environment Variables (1 minute)

Make sure your `.env.local` file has:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

If these are missing, get them from:
- [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → Settings → Authentication → Google

### Step 3: Restart Development Server (30 seconds)

```bash
npm run dev
```

### Step 4: Test It! (1.5 minutes)

1. Go to `http://localhost:3000/auth`
2. Click "Sign in with Google"
3. Authorize the Calendar API scopes
4. Go to `http://localhost:3000/learner/settings`
5. Click "Connect Google Calendar"
6. Go to `http://localhost:3000/learner/tasks`
7. Create a new task with a due date
8. Open [Google Calendar](https://calendar.google.com/)
9. See your task in "DigiGyan Learning Tasks" calendar! 🎉

---

## 📝 Important Notes

### For Existing Users

If you signed up with email/password before:
- You need to **link your Google account** first
- In Settings, click "Connect Google Calendar"
- Follow the Google OAuth flow
- Your tasks will sync automatically

### For New Users

If you sign in with Google:
- Everything is ready to go!
- Just connect in Settings and start creating tasks

### Scopes Included

The following Google Calendar scopes are automatically requested:
- `https://www.googleapis.com/auth/calendar` - Full calendar access
- `https://www.googleapis.com/auth/calendar.events` - Event management

---

## 🎯 What Gets Synced

### ✅ Synced Automatically

- ✅ New tasks → Creates calendar event
- ✅ Task updates → Updates calendar event
- ✅ Task status changes → Updates emoji (📚 → ⚡ → ✅)
- ✅ Task completion → Removes from calendar
- ✅ Task deletion → Removes from calendar
- ✅ Priority changes → Updates event color

### ❌ Not Synced

- ❌ Subtasks (only main task is synced)
- ❌ Completed tasks (removed from calendar)
- ❌ Course information (included in description)

---

## 🎨 Visual Indicators

### Status Emojis
- 📚 **To Do** - Pending task
- ⚡ **In Progress** - Active task
- ✅ **Completed** - Removed from calendar

### Priority Colors
- 🔴 **Red** - High priority
- 🟡 **Yellow** - Medium priority
- 🔵 **Cyan** - Low priority

### Event Details
- **Date**: Due date (all-day event)
- **Reminders**: 
  - Popup: 1 hour before
  - Email: 24 hours before

---

## 🔧 Troubleshooting

### "No Google OAuth tokens found"
**Solution**: Sign out and sign in with Google (not email/password)

### Events not appearing?
**Solution**: Check Settings → Click "Sync Now"

### "Failed to initialize Google Calendar service"
**Solution**: 
1. Verify environment variables
2. Restart dev server
3. Check Google Calendar API is enabled

### Token expired?
**Solution**: Disconnect and reconnect in Settings

---

## 🚀 Pro Tips

1. **Bulk sync**: Create tasks while disconnected, then connect and click "Sync Now"
2. **Status tracking**: Change task status to see emoji updates in real-time
3. **Calendar name**: Look for "DigiGyan Learning Tasks" in your calendar list
4. **Manual control**: Use "Sync Now" button to force sync all tasks
5. **Clean calendar**: Completed tasks are automatically removed

---

## 📱 Mobile & Desktop

The sync works across:
- ✅ Web (calendar.google.com)
- ✅ Google Calendar mobile app
- ✅ Any device with Google Calendar access
- ✅ Calendar widgets on Android/iOS

---

## 🎉 You're All Set!

Start creating tasks and watch them magically appear in your Google Calendar!

**Need help?** Check `GOOGLE_CALENDAR_SYNC_IMPLEMENTATION.md` for detailed documentation.

