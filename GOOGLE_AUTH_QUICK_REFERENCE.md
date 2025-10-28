# Google Auth - Quick Reference

## ⚡ Quick Setup (5 Minutes)

### 1. Supabase Dashboard
```
Dashboard → Authentication → Providers → Google
- Enable: ✓
- Client ID: [Your Google Client ID]
- Client Secret: [Your Google Client Secret]
- Save
```

### 2. Google Cloud Console
```
APIs & Services → Credentials → OAuth 2.0 Client ID
Add to Authorized redirect URIs:
  - https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
  - http://localhost:3000/auth/callback
  - http://localhost:54321/auth/v1/callback
```

### 3. Test
```bash
npm run dev
# Visit: http://localhost:3000/auth
# Click: "Sign in with Google" button
```

---

## 📝 Supabase Configuration Checklist

- [ ] Google provider enabled in Supabase Dashboard
- [ ] Client ID configured
- [ ] Client Secret configured
- [ ] Redirect URLs added to Google Cloud Console
- [ ] Tested sign-in flow
- [ ] Tested sign-up flow
- [ ] Existing email/password auth still works

---

## 🔑 Find Your Supabase Project Reference

1. Go to Supabase Dashboard
2. Look at the URL: `https://supabase.com/dashboard/project/[YOUR-PROJECT-REF]`
3. Or find it in: Project Settings → General → Reference ID

---

## 🎨 UI Changes

**Before:**
```
┌─────────────────────────┐
│ Email & Password Form   │
│ [Sign In]              │
└─────────────────────────┘
```

**After:**
```
┌─────────────────────────┐
│ Email & Password Form   │
│ [Sign In]              │
│ ─── Or continue with ───│
│ [🔴🔵🟡🟢 Google]       │
└─────────────────────────┘
```

---

## 🔄 Authentication Flow

### Email/Password (Unchanged)
```
Login → Check Profile → Role? → Dashboard
```

### Google OAuth (New)
```
Google Button → Google Consent → Callback → 
Create/Check Profile → Role? → Dashboard
```

Both flows converge at the same role selection and dashboard logic!

---

## 🚨 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Invalid redirect URI" | Add Supabase callback URL to Google Console |
| "Unable to authenticate" | Check Client ID/Secret in Supabase |
| Stuck at "Loading..." | Check browser console for errors |
| No profile created | Verify profiles table RLS policies |

---

## 📁 Files Modified

```
✓ app/auth/actions.ts        (Added signInWithGoogle)
✓ app/auth/page.tsx           (Added Google button)
✓ app/auth/callback/route.ts  (OAuth profile handling)
✓ GOOGLE_AUTH_SETUP.md        (Full documentation)
```

---

## 🧪 Testing Script

```bash
# Test 1: Email Sign Up (existing)
✓ Create account with email
✓ Select role
✓ Access dashboard

# Test 2: Email Sign In (existing)
✓ Sign in with email
✓ Access dashboard

# Test 3: Google Sign Up (new)
✓ Click Google button
✓ Authorize on Google
✓ Select role
✓ Access dashboard

# Test 4: Google Sign In (new)
✓ Click Google button
✓ Already has role
✓ Direct to dashboard
```

---

## 🔗 Quick Links

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Full Setup Guide](./GOOGLE_AUTH_SETUP.md)

---

**Status: ✅ Implementation Complete**

Your app now supports Google authentication without breaking existing features!

