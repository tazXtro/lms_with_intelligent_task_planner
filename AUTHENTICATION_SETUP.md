# DigiGyan Authentication Setup Guide

## 🎉 Implementation Complete!

Your DigiGyan LMS now has a fully functional Supabase SSR authentication system with role-based onboarding.

## ✅ What's Been Implemented

### 1. **Database Schema**
- Created `profiles` table with:
  - User ID (linked to auth.users)
  - Email, Full Name, Role (educator/learner)
  - Avatar URL (for future enhancement)
  - Row Level Security (RLS) policies
  - Automatic profile creation trigger

### 2. **Supabase Client Utilities**
- **Client-side client** (`utils/supabase/client.ts`) - For browser/Client Components
- **Server-side client** (`utils/supabase/server.ts`) - For Server Components, Actions, and Route Handlers
- **Middleware utilities** (`utils/supabase/middleware.ts`) - For session refresh

### 3. **Authentication Flow**
- **Sign Up**: Creates user account with role selection (educator/learner)
- **Sign In**: Authenticates and redirects to role-specific dashboard
- **Email Confirmation**: Supports email verification flow
- **Session Management**: Automatic token refresh via middleware

### 4. **Route Handlers**
- `/auth/callback` - OAuth and email confirmation callback
- `/auth/confirm` - Email OTP verification

### 5. **Server Actions** (`app/auth/actions.ts`)
- `signUp()` - User registration with role
- `signIn()` - User authentication
- `signOut()` - User logout
- `getUser()` - Fetch current user with profile

### 6. **Landing Page Integration**
- User avatar display (shows first letter of name/email)
- Dropdown menu with:
  - User profile info
  - Role display
  - Dashboard link (role-specific)
  - Sign out button
- Dynamic CTA buttons based on auth state

## 🔧 Required Setup

### Step 1: Create `.env.local` File

Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://mvoczcofumiocahbktdy.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12b2N6Y29mdW1pb2NhaGJrdGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTI5NDYsImV4cCI6MjA3NzIyODk0Nn0.c0NuSJ1chZo2OZBWRMBBMzqI7oi2qZkpEKsY-Y5hOYE
```

> **Note**: This file is gitignored for security. Never commit it to version control.

### Step 2: Configure Supabase Email Templates

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/mvoczcofumiocahbktdy/auth/templates)
2. Navigate to **Authentication** → **Email Templates**
3. Edit the **"Confirm signup"** template
4. Change the confirmation URL from:
   ```
   {{ .ConfirmationURL }}
   ```
   to:
   ```
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
   ```

### Step 3: Configure Site URL (Optional for Production)

In Supabase Dashboard → **Settings** → **Auth** → **Site URL**, set:
- Development: `http://localhost:3000`
- Production: Your production URL

### Step 4: Configure Redirect URLs

In Supabase Dashboard → **Settings** → **Auth** → **Redirect URLs**, add:
- `http://localhost:3000/auth/callback`
- Your production URL + `/auth/callback`

## 🚀 How It Works

### User Flow: Sign Up

1. User visits `/auth`
2. Selects role: **Educator** or **Learner**
3. Fills in registration form (name, email, password)
4. Submits form → `signUp()` server action
5. Supabase creates auth user with metadata
6. Database trigger creates profile record with role
7. User receives confirmation email
8. Clicks email link → `/auth/confirm` route
9. Email verified → Redirected to role-specific dashboard:
   - **Educator** → `/educator/dashboard`
   - **Learner** → `/learner/dashboard`

### User Flow: Sign In

1. User visits `/auth`
2. Selects role and clicks "Sign in"
3. Enters email and password
4. Submits form → `signIn()` server action
5. Profile fetched to determine role
6. Redirected to appropriate dashboard

### Session Management

The middleware (`middleware.ts`) runs on every request to:
- Refresh expired auth tokens
- Update cookies with fresh tokens
- Ensure seamless user experience

## 🎨 UI Components

### Landing Page Features

**When Not Authenticated:**
- "Log In" and "Get Started" buttons
- Links to `/auth` page

**When Authenticated:**
- Avatar button (shows first letter of name)
- User dropdown menu with:
  - Full name and email
  - User role badge
  - "Dashboard" link (role-specific)
  - "Sign Out" button
- Dynamic hero CTA: "Go to Dashboard"

### Auth Page Features

- **Role Selection**: Choose between Educator or Learner
- **Sign Up Form**: Name, Email, Password, Confirm Password
- **Sign In Form**: Email, Password
- **Error Handling**: Real-time validation and error messages
- **Loading States**: Disabled inputs during submission
- **Success Messages**: Confirmation for email verification

## 🔒 Security Features

1. **Row Level Security (RLS)**
   - Users can only access their own profile
   - Enforced at database level

2. **Server-Side Validation**
   - All auth operations use Server Actions
   - No sensitive operations in client code

3. **Token Refresh**
   - Automatic via middleware
   - Prevents session expiration

4. **Email Verification**
   - Optional but recommended for production
   - Can be enabled/disabled in Supabase dashboard

## 📊 Database Structure

### `profiles` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, references auth.users(id) |
| `email` | TEXT | User email |
| `full_name` | TEXT | User's full name |
| `role` | TEXT | 'educator' or 'learner' |
| `avatar_url` | TEXT | Profile picture URL (future) |
| `created_at` | TIMESTAMP | Account creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

## 🎯 Next Steps

### Recommended Enhancements

1. **Avatar Upload**
   - Integrate Supabase Storage
   - Allow users to upload profile pictures
   - Update `avatar_url` in profiles

2. **Password Reset**
   - Add "Forgot Password?" link
   - Implement password reset flow
   - Update email templates

3. **Profile Editing**
   - Create `/settings` page
   - Allow users to update name, email
   - Add email change confirmation

4. **OAuth Providers**
   - Enable Google Sign-In
   - Add GitHub authentication
   - Configure social auth providers

5. **Protected Routes**
   - Add middleware checks for dashboard routes
   - Redirect unauthenticated users
   - Role-based access control

## 🧪 Testing the Implementation

### Test Sign Up Flow

1. Start dev server: `npm run dev`
2. Visit `http://localhost:3000`
3. Click "Get Started"
4. Select "Educator" or "Learner"
5. Fill in registration form
6. Check email for confirmation (if enabled)
7. Verify redirect to dashboard

### Test Sign In Flow

1. Visit `/auth`
2. Select role
3. Toggle to "Sign in"
4. Enter credentials
5. Verify dashboard redirect

### Test Session Persistence

1. Sign in
2. Refresh page
3. Navigate to different pages
4. Verify user stays logged in

### Test Sign Out

1. While logged in, click avatar
2. Click "Sign Out"
3. Verify redirect to landing page
4. Verify logged-out state

## 🐛 Troubleshooting

### "Unable to authenticate" Error

- Check `.env.local` file exists and is correct
- Verify Supabase project is active
- Check email confirmation settings

### Email Not Sending

- Verify email templates are configured
- Check Supabase Auth settings
- Consider using custom SMTP in production

### Redirect Issues

- Verify redirect URLs in Supabase dashboard
- Check site URL configuration
- Ensure no trailing slashes

### Session Not Persisting

- Check middleware is running
- Verify cookie settings
- Check browser privacy settings

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js SSR with Supabase](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🎊 You're All Set!

Your authentication system is now fully functional with:
- ✅ User registration and login
- ✅ Role-based onboarding (educator/learner)
- ✅ Email confirmation support
- ✅ Secure session management
- ✅ Role-specific dashboard routing
- ✅ User profile display with avatar
- ✅ Sign out functionality

Happy coding! 🚀

