# Google Authentication Setup Guide

This guide will help you set up Google OAuth authentication in your DigiGyan LMS application using Supabase.

## Overview

Google authentication has been integrated alongside your existing email/password authentication. Users can now sign in using either method, and both flows will work seamlessly together.

## Prerequisites

You mentioned you already have Google OAuth credentials (Client ID and Client Secret) from a previous project. You'll use these to configure Supabase.

## Step 1: Configure Google OAuth in Supabase Dashboard

### 1.1 Access Supabase Authentication Settings

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (`digigyan-lms`)
3. Navigate to **Authentication** → **Providers** in the left sidebar
4. Find **Google** in the list of providers

### 1.2 Enable Google Provider

1. Click on **Google** to expand its settings
2. Toggle **Enable Sign in with Google** to ON
3. You'll see fields for:
   - **Client ID (for OAuth)**
   - **Client Secret (for OAuth)**

### 1.3 Add Your Google OAuth Credentials

1. Enter your **Google Client ID** in the Client ID field
2. Enter your **Google Client Secret** in the Client Secret field
3. Click **Save**

### 1.4 Configure Redirect URLs in Google Cloud Console

Important: You need to add your Supabase callback URL to your Google OAuth configuration.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, add:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
   Replace `[YOUR-PROJECT-REF]` with your actual Supabase project reference ID

6. For local development, also add:
   ```
   http://localhost:3000/auth/callback
   http://localhost:54321/auth/v1/callback
   ```

7. Click **Save**

## Step 2: Update Environment Variables (If Needed)

Your existing `.env.local` file should already have Supabase credentials. Ensure it includes:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here

# Other existing variables...
OPENROUTER_API_KEY=your-openrouter-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

No additional environment variables are needed for Google OAuth - it's all configured in Supabase!

## Step 3: Verify Database Setup

The callback route will automatically create user profiles for OAuth users. Ensure your `profiles` table has these columns:

- `id` (uuid, primary key, references auth.users)
- `email` (text)
- `full_name` (text)
- `role` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

This should already be set up from your existing authentication system.

## Step 4: Test the Integration

### 4.1 Start Your Development Server

```bash
npm run dev
```

### 4.2 Test Google Sign-In Flow

1. Navigate to `http://localhost:3000/auth`
2. You should see the new **"Sign in with Google"** button below the email/password form
3. Click the Google button
4. You'll be redirected to Google's consent screen
5. After signing in with Google, you'll be redirected back to your app
6. If you're a new user, you'll be taken to the role selection page
7. After selecting a role (educator or learner), you'll be redirected to your dashboard

### 4.3 Test Existing Email/Password Flow

To ensure nothing is broken:

1. Try signing up with email and password
2. Try signing in with email and password
3. Both should work exactly as before

## How It Works

### Authentication Flow

```
1. User clicks "Sign in with Google"
   ↓
2. Redirected to Google consent screen
   ↓
3. User authorizes the app
   ↓
4. Google redirects to: /auth/callback?code=...
   ↓
5. Callback exchanges code for session
   ↓
6. System checks if user profile exists
   ↓
7a. NEW USER: Create profile → Redirect to /auth/select-role
7b. EXISTING USER (no role): Redirect to /auth/select-role
7c. EXISTING USER (with role): Redirect to home (/)
```

### Key Features

✅ **Non-Breaking**: Email/password authentication continues to work
✅ **Profile Creation**: Automatically creates profiles for OAuth users
✅ **Role Selection**: New OAuth users go through role selection
✅ **Name Extraction**: Pulls user's name from Google profile
✅ **Secure**: Uses PKCE flow with code exchange
✅ **Refresh Tokens**: Configured to receive Google refresh tokens

## Code Changes Made

### 1. `/app/auth/actions.ts`
- Added `signInWithGoogle()` function
- Configured OAuth with proper redirect URL and query parameters

### 2. `/app/auth/page.tsx`
- Added Google sign-in button with official Google colors
- Added divider between email and OAuth methods
- Integrated with existing authentication state

### 3. `/app/auth/callback/route.ts`
- Enhanced to handle OAuth users
- Automatically creates profiles for new OAuth users
- Extracts user name from Google metadata
- Maintains existing role selection flow

## Troubleshooting

### Issue: "Invalid redirect URI"
**Solution**: Ensure you've added the Supabase callback URL to your Google Cloud Console's authorized redirect URIs.

### Issue: "Unable to authenticate" error
**Solution**: 
1. Check that Google provider is enabled in Supabase Dashboard
2. Verify your Client ID and Secret are correct
3. Check browser console for detailed error messages

### Issue: User stuck at "Loading..."
**Solution**: 
1. Open browser DevTools → Network tab
2. Click Google sign-in button
3. Look for failed requests
4. Check if the OAuth redirect is being blocked

### Issue: Profile not created for OAuth users
**Solution**: 
1. Check that your `profiles` table has INSERT permissions for authenticated users
2. Verify the table structure matches the expected schema

## Additional Resources

- [Supabase Google Auth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

## Security Best Practices

1. **Never commit** your Client Secret to version control
2. Keep your Supabase project keys secure
3. Configure proper Row Level Security (RLS) policies on your database
4. Regularly rotate your OAuth credentials
5. Monitor authentication logs in Supabase Dashboard

## Need Help?

If you encounter any issues:
1. Check the Supabase Dashboard → Authentication → Logs
2. Review browser console for JavaScript errors
3. Verify all redirect URLs are correctly configured
4. Ensure your Google Cloud project has the necessary APIs enabled

---

**Setup Complete!** 🎉

Your application now supports both email/password and Google OAuth authentication without breaking any existing functionality.

