# ✅ DigiGyan Authentication - Setup Checklist

Use this checklist to ensure your authentication system is fully configured and working.

---

## 📋 Pre-Launch Checklist

### 1. Environment Configuration

- [ ] **Create `.env.local` file** in project root
  - [ ] Add `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] Add `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - [ ] Verify file is in `.gitignore` (it should be automatically)

```env
NEXT_PUBLIC_SUPABASE_URL=https://mvoczcofumiocahbktdy.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12b2N6Y29mdW1pb2NhaGJrdGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTI5NDYsImV4cCI6MjA3NzIyODk0Nn0.c0NuSJ1chZo2OZBWRMBBMzqI7oi2qZkpEKsY-Y5hOYE
```

### 2. Supabase Configuration

- [ ] **Update Email Templates**
  - [ ] Go to: [Supabase Auth Templates](https://supabase.com/dashboard/project/mvoczcofumiocahbktdy/auth/templates)
  - [ ] Edit "Confirm signup" template
  - [ ] Change `{{ .ConfirmationURL }}` to:
    ```
    {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
    ```
  - [ ] Click Save

- [ ] **Configure Site URL** (Optional but recommended)
  - [ ] Go to: [Auth Settings](https://supabase.com/dashboard/project/mvoczcofumiocahbktdy/settings/auth)
  - [ ] Set Site URL to:
    - Development: `http://localhost:3000`
    - Production: Your production domain

- [ ] **Add Redirect URLs** (Optional but recommended)
  - [ ] In Auth Settings → Redirect URLs
  - [ ] Add: `http://localhost:3000/auth/callback`
  - [ ] Add: Your production domain + `/auth/callback`

### 3. Development Setup

- [ ] **Install dependencies** (Already done ✅)
- [ ] **Restart development server**
  ```bash
  npm run dev
  ```
- [ ] **Verify server starts without errors**

---

## 🧪 Testing Checklist

### Test 1: Sign Up Flow

- [ ] Visit http://localhost:3000
- [ ] Click "Get Started" button
- [ ] Role selection page loads
- [ ] Click "I'm a Learner"
- [ ] Sign up form appears
- [ ] Fill in all fields:
  - [ ] Full Name: Test User
  - [ ] Email: your-email@example.com
  - [ ] Password: TestPassword123
  - [ ] Confirm Password: TestPassword123
- [ ] Click "Create Account"
- [ ] See success message: "Check your email to confirm your account!"
- [ ] No errors in browser console

### Test 2: Email Confirmation

- [ ] Check email inbox
- [ ] Email received from Supabase
- [ ] Click confirmation link in email
- [ ] Redirected to dashboard (learner/dashboard)
- [ ] No errors on dashboard page

### Test 3: Landing Page Auth State

- [ ] Navigate back to http://localhost:3000
- [ ] Avatar visible in top-right corner
- [ ] Avatar shows first letter of name
- [ ] Click on avatar
- [ ] Dropdown menu appears with:
  - [ ] Your full name
  - [ ] Your email
  - [ ] Role badge (learner)
  - [ ] Dashboard link
  - [ ] Sign Out button

### Test 4: Dashboard Access

- [ ] Click "Dashboard" in dropdown
- [ ] Redirected to `/learner/dashboard`
- [ ] Dashboard page loads
- [ ] No authentication errors

### Test 5: Sign Out

- [ ] Click avatar → "Sign Out"
- [ ] Redirected to landing page (/)
- [ ] Avatar no longer visible
- [ ] "Log In" and "Get Started" buttons visible
- [ ] Cannot access `/learner/dashboard` (should redirect)

### Test 6: Sign In

- [ ] Click "Log In" button
- [ ] Select "I'm a Learner"
- [ ] Click toggle to "Sign in" view
- [ ] Enter credentials:
  - [ ] Email: your-email@example.com
  - [ ] Password: TestPassword123
- [ ] Click "Sign In"
- [ ] Redirected to `/learner/dashboard`
- [ ] User info correct

### Test 7: Educator Flow

- [ ] Sign out (if signed in)
- [ ] Click "Get Started"
- [ ] Select "I'm an Educator"
- [ ] Complete sign up form
- [ ] Verify redirects to `/educator/dashboard`
- [ ] Check avatar shows educator role

### Test 8: Session Persistence

- [ ] Sign in as any user
- [ ] Refresh page (F5)
- [ ] User still logged in
- [ ] Avatar still visible
- [ ] Navigate to different pages
- [ ] User stays logged in

---

## 🔍 Database Verification

- [ ] **Check Supabase Dashboard**
  - [ ] Go to: [Table Editor](https://supabase.com/dashboard/project/mvoczcofumiocahbktdy/editor)
  - [ ] `profiles` table exists
  - [ ] Table has RLS enabled (🔒 icon)
  - [ ] Your test user(s) appear in table
  - [ ] Roles are correct (learner/educator)

- [ ] **Verify RLS Policies**
  - [ ] In Table Editor → profiles → RLS Policies
  - [ ] "Users can view their own profile" policy exists
  - [ ] "Users can update their own profile" policy exists
  - [ ] "Users can insert their own profile" policy exists

---

## 🔒 Security Verification

- [ ] **Check Security Advisories**
  - [ ] Go to: [Supabase Advisors](https://supabase.com/dashboard/project/mvoczcofumiocahbktdy/advisors)
  - [ ] No security warnings (should be clean)

- [ ] **Verify Code Security**
  - [ ] No `.env.local` in git (check with `git status`)
  - [ ] No hardcoded secrets in code
  - [ ] All auth operations use Server Actions
  - [ ] Protected routes use `getUser()` not `getSession()`

---

## 📱 Browser Testing (Optional)

- [ ] **Chrome/Edge**
  - [ ] Sign up works
  - [ ] Sign in works
  - [ ] Avatar displays correctly
  - [ ] Dropdown menu works

- [ ] **Firefox**
  - [ ] Sign up works
  - [ ] Sign in works
  - [ ] Avatar displays correctly
  - [ ] Dropdown menu works

- [ ] **Safari** (if on Mac)
  - [ ] Sign up works
  - [ ] Sign in works
  - [ ] Avatar displays correctly
  - [ ] Dropdown menu works

---

## 📖 Documentation Review

- [ ] Read `START_HERE.md`
- [ ] Bookmark `AUTH_API_REFERENCE.md` for development
- [ ] Keep `QUICK_START.md` handy for troubleshooting
- [ ] Review `docs/AUTH_FLOW_DIAGRAM.md` for architecture understanding

---

## 🚀 Production Preparation (When Ready)

### Environment Variables

- [ ] Add environment variables to production environment:
  - [ ] Vercel/Netlify/Your host dashboard
  - [ ] Same variables as `.env.local`

### Supabase Configuration

- [ ] Update Site URL to production domain
- [ ] Add production redirect URLs
- [ ] Enable email provider (or configure custom SMTP)
- [ ] Review auth settings for production

### Security

- [ ] Enable email verification (recommended)
- [ ] Set up proper error monitoring
- [ ] Configure rate limiting (Supabase does this by default)
- [ ] Review and update auth templates with your branding

### Performance

- [ ] Test sign up/in flow on production
- [ ] Verify session refresh works
- [ ] Check redirect speeds
- [ ] Monitor database performance

---

## ✅ Final Verification

Once all items above are checked:

- [ ] **Authentication is fully functional**
- [ ] **No errors in console**
- [ ] **All user flows work smoothly**
- [ ] **Documentation reviewed**
- [ ] **Ready to build LMS features**

---

## 🎊 Congratulations!

If all items are checked, your authentication system is:
- ✅ Fully configured
- ✅ Thoroughly tested
- ✅ Production ready
- ✅ Documented

**You're ready to start building your LMS features!** 🚀

---

## 📞 Need Help?

If any checklist item fails:

1. Check the error message in browser console
2. Review `QUICK_START.md` troubleshooting section
3. Verify `.env.local` exists and is correct
4. Restart development server
5. Clear browser cookies and try again

---

**Last Updated**: October 28, 2025
**Version**: 1.0.0

