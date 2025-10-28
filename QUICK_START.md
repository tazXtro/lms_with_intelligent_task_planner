# 🚀 Quick Start Guide - DigiGyan Authentication

Get up and running with authentication in 5 minutes!

## ⚡ Prerequisites

- Node.js installed
- DigiGyan LMS project cloned
- Supabase project created (DigiGyan)

## 📝 Step-by-Step Setup

### 1. Install Dependencies (Already Done ✅)

The required packages are already installed:
- `@supabase/supabase-js`
- `@supabase/ssr`

### 2. Create Environment Variables

Create a `.env.local` file in your project root:

```bash
# Copy the example file
cp .env.local.example .env.local
```

The file should contain:
```env
NEXT_PUBLIC_SUPABASE_URL=https://mvoczcofumiocahbktdy.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12b2N6Y29mdW1pb2NhaGJrdGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTI5NDYsImV4cCI6MjA3NzIyODk0Nn0.c0NuSJ1chZo2OZBWRMBBMzqI7oi2qZkpEKsY-Y5hOYE
```

### 3. Configure Supabase Email Templates

🔗 **Go to**: [Supabase Auth Templates](https://supabase.com/dashboard/project/mvoczcofumiocahbktdy/auth/templates)

1. Click on **"Confirm signup"** template
2. Find this line:
   ```
   {{ .ConfirmationURL }}
   ```
3. Replace it with:
   ```
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
   ```
4. Click **Save**

### 4. Configure Site URL (Optional)

🔗 **Go to**: [Supabase Auth Settings](https://supabase.com/dashboard/project/mvoczcofumiocahbktdy/settings/auth)

Set **Site URL** to:
- Development: `http://localhost:3000`
- Production: Your production domain

### 5. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## 🎯 Test Authentication

### Test Sign Up

1. Click **"Get Started"** on landing page
2. Select **"I'm a Learner"** or **"I'm an Educator"**
3. Fill in the form:
   - Full Name: John Doe
   - Email: your-email@example.com
   - Password: YourSecurePassword123
   - Confirm Password: YourSecurePassword123
4. Click **"Create Account"**
5. You should see: "Check your email to confirm your account!"

### Check Your Email

1. Open your email inbox
2. Look for email from Supabase
3. Click the confirmation link
4. You should be redirected to your dashboard

### Test Dashboard Access

After email confirmation:
- **Learners** → Redirected to `/learner/dashboard`
- **Educators** → Redirected to `/educator/dashboard`

### Test Landing Page Auth State

1. After signing in, go back to landing page: http://localhost:3000
2. You should see:
   - Avatar with your initial in the top-right
   - Your name displayed
   - Dropdown menu with:
     - Profile info
     - Dashboard link
     - Sign out button

### Test Sign Out

1. Click on your avatar
2. Click **"Sign Out"**
3. You should be redirected to landing page
4. Auth buttons should now show "Log In" and "Get Started"

### Test Sign In

1. Click **"Log In"**
2. Select your role (Educator or Learner)
3. Toggle to **"Sign in"** view
4. Enter your credentials
5. Click **"Sign In"**
6. You should be redirected to your dashboard

## 📊 Database Verification

You can verify the setup by checking your Supabase database:

🔗 **Go to**: [Supabase Table Editor](https://supabase.com/dashboard/project/mvoczcofumiocahbktdy/editor)

### Check Profiles Table

You should see:
- A `profiles` table under `public` schema
- Columns: `id`, `email`, `full_name`, `role`, `avatar_url`, `created_at`, `updated_at`
- Row Level Security enabled (🔒 icon)

### Check Your Profile

After signing up:
1. Go to Table Editor → `profiles`
2. You should see your profile record with:
   - Your email
   - Your full name
   - Your selected role (educator/learner)

## 🐛 Troubleshooting

### Issue: "Unable to authenticate"

**Solution**: 
- Verify `.env.local` exists and has correct values
- Restart dev server after creating `.env.local`

### Issue: Email not sending

**Solution**:
- Check Supabase email template is configured
- For development, check Supabase Dashboard → Authentication → Users
- The user will be created even without email confirmation

### Issue: Redirect not working

**Solution**:
- Verify Site URL in Supabase settings
- Check redirect URLs include your domain + `/auth/callback`

### Issue: "User not found" in dashboard

**Solution**:
- Clear browser cookies
- Sign out and sign in again
- Check if middleware.ts is running

## 📚 Next Steps

Now that authentication is working:

1. **Customize Dashboards**
   - Edit `/app/educator/dashboard/page.tsx`
   - Edit `/app/learner/dashboard/page.tsx`

2. **Add Profile Settings**
   - Create `/app/settings/page.tsx`
   - Allow users to update profile info

3. **Add Avatar Upload**
   - Integrate Supabase Storage
   - Allow users to upload profile pictures

4. **Add Password Reset**
   - Implement forgot password flow
   - Add reset password page

5. **Enable OAuth Providers**
   - Add Google Sign-In
   - Add GitHub authentication

## 📖 Documentation

- **Full Setup Guide**: `AUTHENTICATION_SETUP.md`
- **API Reference**: `AUTH_API_REFERENCE.md`
- **Flow Diagrams**: `docs/AUTH_FLOW_DIAGRAM.md`

## ✅ Checklist

- [ ] `.env.local` file created with correct values
- [ ] Email template configured in Supabase
- [ ] Site URL configured in Supabase
- [ ] Dev server running
- [ ] Successfully signed up a test user
- [ ] Email confirmation received and clicked
- [ ] Redirected to correct dashboard
- [ ] Avatar showing on landing page
- [ ] Sign out working correctly
- [ ] Sign in working correctly

## 🎊 You're Ready!

Your authentication system is fully functional. Start building your LMS features!

Need help? Check the troubleshooting section or review the full documentation.

---

**Happy Coding! 🚀**

