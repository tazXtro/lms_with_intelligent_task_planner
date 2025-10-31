# Google Calendar Sync - Setup Checklist

## ✅ Pre-Implementation Checklist

### Before You Start
- [x] Google OAuth configured in Supabase ✅
- [x] Google Client ID and Secret available ✅
- [x] Development environment set up ✅

---

## 🎯 Post-Implementation Checklist

### Step 1: Google Cloud Console Configuration

- [ ] **Enable Google Calendar API**
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Navigate to **APIs & Services** → **Library**
  3. Search for "Google Calendar API"
  4. Click **Enable**

- [ ] **Verify OAuth Redirect URIs**
  1. Go to **APIs & Services** → **Credentials**
  2. Click on your OAuth 2.0 Client ID
  3. Ensure these redirect URIs are present:
     - `https://mvoczcofumiocahbktdy.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback`
  4. Click **Save**

### Step 2: Environment Variables

- [ ] **Check `.env.local` file exists**
  - If not, create it in the project root

- [ ] **Verify environment variables**
  ```env
  # Supabase
  NEXT_PUBLIC_SUPABASE_URL=https://mvoczcofumiocahbktdy.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
  
  # Google OAuth
  GOOGLE_CLIENT_ID=[your-client-id]
  GOOGLE_CLIENT_SECRET=[your-client-secret]
  
  # Application
  NEXT_PUBLIC_SITE_URL=http://localhost:3000
  ```

- [ ] **Get Google credentials if needed**
  - From Supabase Dashboard → Your Project → Settings → Authentication → Google
  - Copy Client ID and Client Secret

### Step 3: Supabase Configuration

- [ ] **Verify Google Provider Settings**
  1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
  2. Navigate to **Authentication** → **Providers** → **Google**
  3. Ensure:
     - ✅ Provider is **Enabled**
     - ✅ Client ID is configured
     - ✅ Client Secret is configured
     - ✅ Authorized Client IDs (if any) includes your Client ID

**Note**: The Calendar API scopes are now automatically requested in the code, so no manual scope configuration is needed in Supabase!

### Step 4: Database Verification

- [x] **Database migration applied** ✅
  - Tables created: `calendar_sync_settings`, `task_calendar_events`
  - Columns added to `learner_tasks`: `calendar_event_id`, `last_synced_at`
  - RLS policies configured
  - Indexes created

You can verify by running:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('calendar_sync_settings', 'task_calendar_events');
```

### Step 5: Dependencies

- [x] **Install googleapis package** ✅
  ```bash
  npm install googleapis
  ```

### Step 6: Restart & Test

- [ ] **Restart development server**
  ```bash
  npm run dev
  ```

- [ ] **Test authentication flow**
  1. Go to `http://localhost:3000/auth`
  2. Click "Sign in with Google"
  3. You should see a Google OAuth consent screen
  4. **IMPORTANT**: Check that it requests Calendar API permissions
  5. Click "Allow"

- [ ] **Test calendar connection**
  1. After signing in, go to `http://localhost:3000/learner/settings`
  2. You should see "Google Calendar Integration" section
  3. Click "Connect Google Calendar"
  4. Wait for connection status to change to "Connected"
  5. Verify your email is shown
  6. Check "Sync Details" section for statistics

- [ ] **Test task sync**
  1. Go to `http://localhost:3000/learner/tasks`
  2. Click "New Task"
  3. Create a task with:
     - Title: "Test Calendar Sync"
     - Priority: High
     - Due Date: Tomorrow's date
  4. Click "Create Task"
  5. Open [Google Calendar](https://calendar.google.com/)
  6. Look for "DigiGyan Learning Tasks" calendar in the left sidebar
  7. You should see your task as a red event!

- [ ] **Test task update**
  1. In Task Planner, drag the task to "In Progress"
  2. Refresh Google Calendar
  3. The emoji should change from 📚 to ⚡

- [ ] **Test task completion**
  1. In Task Planner, drag the task to "Completed"
  2. Refresh Google Calendar
  3. The event should disappear

- [ ] **Test task deletion**
  1. Create a new task
  2. Verify it appears in Google Calendar
  3. Delete the task
  4. Refresh Google Calendar
  5. The event should be removed

### Step 7: User Experience

- [ ] **Test disconnect flow**
  1. Go to Settings
  2. Click "Disconnect"
  3. Confirm disconnection
  4. Verify connection status changes to "Not Connected"

- [ ] **Test manual sync**
  1. Disconnect Google Calendar
  2. Create 2-3 tasks
  3. Reconnect Google Calendar
  4. Click "Sync Now"
  5. Verify all tasks appear in calendar

---

## 🔍 Verification Points

### Database Check
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%calendar%';

-- Check calendar settings (after connecting)
SELECT * FROM calendar_sync_settings;

-- Check event mappings (after creating tasks)
SELECT * FROM task_calendar_events;
```

### API Endpoints Check
```bash
# Test calendar connection endpoint
curl http://localhost:3000/api/calendar/connect

# Test user endpoint
curl http://localhost:3000/api/auth/user
```

### Browser Console Check
- [ ] No JavaScript errors
- [ ] No 404 errors
- [ ] No authentication errors
- [ ] Successful API responses

---

## 🐛 Common Issues & Solutions

### Issue: OAuth doesn't request Calendar permissions
**Solution**: 
- Clear browser cache and cookies
- Sign out completely
- Sign in with Google again
- The consent screen should now show Calendar API permissions

### Issue: "GOOGLE_CLIENT_ID is not defined"
**Solution**: 
- Check `.env.local` file exists in root directory
- Verify environment variables are set correctly
- Restart development server
- Environment variables are loaded on server start

### Issue: Calendar API calls fail with 403
**Solution**: 
- Verify Google Calendar API is **enabled** in Google Cloud Console
- Check API quotas in Google Cloud Console
- Ensure OAuth scopes include Calendar API

### Issue: Tokens not available
**Solution**: 
- User must sign in with Google (not email/password)
- For existing users: disconnect and reconnect
- Verify `access_type: 'offline'` is set in OAuth request (✅ already configured)

### Issue: Events not appearing in calendar
**Solution**: 
- Check Settings page shows "Connected"
- Click "Sync Now" to force sync
- Verify task is not already completed
- Check browser console for errors
- Verify calendar name is "DigiGyan Learning Tasks"

---

## 📊 Success Criteria

✅ All checklist items completed  
✅ No linter errors  
✅ Database tables created successfully  
✅ OAuth requests Calendar API permissions  
✅ Can connect Google Calendar  
✅ Tasks automatically sync on create  
✅ Tasks automatically sync on update  
✅ Tasks automatically removed on completion  
✅ Manual sync works  
✅ Disconnect works  

---

## 🎉 Ready to Deploy?

Before deploying to production:

1. [ ] Update `NEXT_PUBLIC_SITE_URL` to your production URL
2. [ ] Add production URL to Google OAuth redirect URIs
3. [ ] Test with production Supabase project
4. [ ] Verify environment variables in deployment platform
5. [ ] Test end-to-end in production environment
6. [ ] Monitor error logs for any issues

---

## 📞 Support

If you encounter issues not covered here:

1. Check `GOOGLE_CALENDAR_SYNC_IMPLEMENTATION.md` for detailed documentation
2. Review browser console errors
3. Check server logs
4. Verify all environment variables
5. Test with a fresh Google account

---

## 🎯 Next Steps

After successful setup:

1. ✅ Create user documentation
2. ✅ Add onboarding flow for calendar sync
3. ✅ Consider adding analytics to track sync usage
4. ✅ Monitor Google Calendar API quotas
5. ✅ Gather user feedback

**Happy syncing!** 🚀

