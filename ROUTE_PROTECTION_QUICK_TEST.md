# Quick Route Protection Testing Guide

## Test Your Route Protection in 5 Minutes

Follow these steps to verify that all routes are properly protected:

### Prerequisites
- Development server running (`npm run dev`)
- Access to an incognito/private browser window
- Test accounts (one educator, one learner)

---

## Test 1: Unauthenticated Access ❌ → ✅ Redirect to Auth

**Expected**: All protected routes redirect to `/auth`

### Steps:
1. Open **incognito/private browser window**
2. Try to access these URLs directly:
   ```
   http://localhost:3000/educator/dashboard
   http://localhost:3000/learner/dashboard
   http://localhost:3000/educator/courses
   http://localhost:3000/learner/courses
   ```

### ✅ Pass Criteria:
- All URLs redirect to `/auth` page
- URL includes `redirectTo` parameter (e.g., `/auth?redirectTo=/educator/dashboard`)

### ❌ Fail If:
- Any page loads without redirecting
- You see dashboard content or course lists

---

## Test 2: Educator Role Access ✅ Educator Routes, ❌ Learner Routes

**Expected**: Educators can access educator routes but are redirected from learner routes

### Steps:
1. **Log in as Educator**
2. Try accessing educator routes:
   ```
   http://localhost:3000/educator/dashboard  ✅ Should load
   http://localhost:3000/educator/courses    ✅ Should load
   ```
3. Try accessing learner routes:
   ```
   http://localhost:3000/learner/dashboard   ❌ Should redirect
   http://localhost:3000/learner/courses     ❌ Should redirect
   ```

### ✅ Pass Criteria:
- Educator routes load successfully
- Learner routes redirect to `/educator/dashboard`

### ❌ Fail If:
- Educator can see learner dashboard
- Educator can see "My Courses" as a learner

---

## Test 3: Learner Role Access ✅ Learner Routes, ❌ Educator Routes

**Expected**: Learners can access learner routes but are redirected from educator routes

### Steps:
1. **Log in as Learner**
2. Try accessing learner routes:
   ```
   http://localhost:3000/learner/dashboard   ✅ Should load
   http://localhost:3000/learner/courses     ✅ Should load
   http://localhost:3000/learner/browse      ✅ Should load
   ```
3. Try accessing educator routes:
   ```
   http://localhost:3000/educator/dashboard  ❌ Should redirect
   http://localhost:3000/educator/courses    ❌ Should redirect
   ```

### ✅ Pass Criteria:
- Learner routes load successfully
- Educator routes redirect to `/learner/dashboard`

### ❌ Fail If:
- Learner can see educator dashboard
- Learner can see "Create Course" button

---

## Test 4: Auth Page Redirect for Logged-in Users

**Expected**: Logged-in users accessing `/auth` are redirected to their dashboard

### Steps:
1. **While logged in** (as either role)
2. Navigate to:
   ```
   http://localhost:3000/auth
   ```

### ✅ Pass Criteria:
- Educators → redirected to `/educator/dashboard`
- Learners → redirected to `/learner/dashboard`

### ❌ Fail If:
- Logged-in user sees the auth/login page
- No redirect occurs

---

## Test 5: No Role Set - Redirect to Role Selection

**Expected**: Users without a role are redirected to role selection

### Steps:
1. Create a new account but **don't select a role**
2. Try accessing any protected route:
   ```
   http://localhost:3000/educator/dashboard
   http://localhost:3000/learner/dashboard
   ```

### ✅ Pass Criteria:
- Redirected to `/auth/select-role`
- After selecting role, can access appropriate routes

### ❌ Fail If:
- Can access routes without selecting role
- Gets stuck in redirect loop

---

## Test 6: Session Persistence

**Expected**: Sessions persist across page refreshes

### Steps:
1. **Log in** as any role
2. **Access dashboard** (educator or learner)
3. **Refresh the page** (F5 or Cmd+R)
4. **Close tab and reopen** same URL

### ✅ Pass Criteria:
- Dashboard loads immediately after refresh
- No redirect to auth page
- User data loads correctly

### ❌ Fail If:
- Redirected to auth after refresh
- Have to log in again

---

## Test 7: Direct URL Navigation

**Expected**: Protection works even with direct URL access

### Steps:
1. **While logged in as Learner**
2. Type this directly in browser:
   ```
   http://localhost:3000/educator/courses/create
   ```
3. **While logged in as Educator**
4. Type this directly in browser:
   ```
   http://localhost:3000/learner/tasks
   ```

### ✅ Pass Criteria:
- Immediately redirected to appropriate dashboard
- No flash of protected content

### ❌ Fail If:
- Page starts to load before redirect
- Can see any protected content

---

## Quick Visual Checklist

Copy this checklist and mark as you test:

```
[ ] Test 1: Unauthenticated users redirected to /auth
[ ] Test 2: Educators cannot access learner routes
[ ] Test 3: Learners cannot access educator routes
[ ] Test 4: Logged-in users redirected from /auth
[ ] Test 5: No-role users redirected to role selection
[ ] Test 6: Sessions persist across refreshes
[ ] Test 7: Direct URL navigation is protected
```

---

## Troubleshooting

### Issue: Tests Failing

1. **Restart dev server**:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Clear browser data**:
   - Clear cache and cookies
   - Or use new incognito window

3. **Check environment variables**:
   ```bash
   # In .env.local
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-key
   ```

4. **Verify database**:
   - Check `profiles` table has `role` column
   - Verify user has role set correctly

### Issue: Infinite Redirects

1. Check browser console for errors
2. Verify middleware.ts doesn't have logic errors
3. Clear Supabase session:
   ```javascript
   // In browser console
   localStorage.clear()
   location.reload()
   ```

---

## Automated Testing (Optional)

For CI/CD, you can add these Playwright tests:

```typescript
// tests/auth.spec.ts
import { test, expect } from '@playwright/test'

test('unauthenticated users redirected', async ({ page }) => {
  await page.goto('/educator/dashboard')
  await expect(page).toHaveURL(/.*auth.*/)
})

test('educators cannot access learner routes', async ({ page, context }) => {
  // Login as educator first
  await page.goto('/auth')
  // ... login logic ...
  
  await page.goto('/learner/dashboard')
  await expect(page).toHaveURL('/educator/dashboard')
})
```

---

## Success Criteria

**All tests passing means:**
✅ No unauthorized access to any route
✅ Role-based access control working
✅ Proper redirects for all scenarios
✅ Session management functioning correctly

**Your application is now SECURE! 🔒**

---

## Next Steps After Testing

1. ✅ Mark all tests as passing
2. 📝 Document any custom routes you add
3. 🔄 Test after major updates
4. 👥 Train team on route protection
5. 🔐 Regularly audit access controls

---

## Quick Reference

| Route | Educator | Learner | Unauthenticated |
|-------|----------|---------|-----------------|
| `/` | ✅ | ✅ | ✅ |
| `/auth` | → Dashboard | → Dashboard | ✅ |
| `/educator/*` | ✅ | → `/learner/dashboard` | → `/auth` |
| `/learner/*` | → `/educator/dashboard` | ✅ | → `/auth` |

---

**Need Help?** Check the full documentation in `ROUTE_PROTECTION_GUIDE.md`

