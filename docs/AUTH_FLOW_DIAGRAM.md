# DigiGyan Authentication Flow Diagram

## 🔐 Complete Authentication Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DIGIGYAN LMS AUTH FLOW                          │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                           1. INITIAL ACCESS                               │
└──────────────────────────────────────────────────────────────────────────┘

    User visits Landing Page (/)
           │
           ├─── Not Authenticated ──┐
           │                        │
           │                        ▼
           │              Show "Get Started" & "Log In" buttons
           │                        │
           │                        │
           └─── Authenticated ──────┤
                                    │
                                    ▼
                    Show Avatar + Dropdown Menu
                    ├── User Info (Name, Email, Role)
                    ├── Dashboard Link (Role-specific)
                    └── Sign Out Button


┌──────────────────────────────────────────────────────────────────────────┐
│                          2. SIGN UP FLOW                                  │
└──────────────────────────────────────────────────────────────────────────┘

    User clicks "Get Started"
           │
           ▼
    Navigate to /auth
           │
           ▼
    ┌─────────────────────┐
    │  SELECT USER ROLE   │
    │                     │
    │  ┌─────────────┐   │
    │  │  EDUCATOR   │   │──┐
    │  └─────────────┘   │  │
    │                     │  │
    │  ┌─────────────┐   │  │
    │  │  LEARNER    │   │──┤
    │  └─────────────┘   │  │
    └─────────────────────┘  │
                             │
           ┌─────────────────┘
           │
           ▼
    ┌─────────────────────────┐
    │   SIGN UP FORM          │
    │                         │
    │   • Full Name           │
    │   • Email               │
    │   • Password            │
    │   • Confirm Password    │
    │                         │
    │   [Create Account] ────────────┐
    └─────────────────────────┘      │
                                     │
                                     ▼
                          ┌──────────────────────┐
                          │  Server Action:      │
                          │  signUp(formData)    │
                          └──────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                    ▼                                 ▼
            ┌───────────────┐              ┌─────────────────┐
            │  SUCCESS      │              │     ERROR       │
            └───────────────┘              └─────────────────┘
                    │                                 │
                    ▼                                 ▼
        ┌───────────────────────┐          Show Error Message
        │ Supabase Auth         │          (User stays on form)
        │ creates user account  │
        └───────────────────────┘
                    │
                    ▼
        ┌───────────────────────────┐
        │ Database Trigger:         │
        │ handle_new_user()         │
        │                           │
        │ Creates profile record:   │
        │ - id (from auth.users)    │
        │ - email                   │
        │ - full_name               │
        │ - role (educator/learner) │
        └───────────────────────────┘
                    │
                    ▼
        ┌───────────────────────────┐
        │ Send Confirmation Email   │
        │ (if email verification    │
        │  is enabled)              │
        └───────────────────────────┘
                    │
                    ▼
            Show Success Message
            "Check your email!"


┌──────────────────────────────────────────────────────────────────────────┐
│                     3. EMAIL CONFIRMATION FLOW                            │
└──────────────────────────────────────────────────────────────────────────┘

    User receives email
           │
           ▼
    User clicks confirmation link
           │
           ▼
    Link format: /auth/confirm?token_hash=XXX&type=email
           │
           ▼
    ┌─────────────────────────┐
    │  Route Handler:         │
    │  /auth/confirm/route.ts │
    └─────────────────────────┘
           │
           ▼
    Verify OTP with Supabase
           │
           ├─── Success ───┐
           │               │
           │               ▼
           │      Fetch user profile
           │      to determine role
           │               │
           │               ▼
           │      ┌────────┴────────┐
           │      │                 │
           │      ▼                 ▼
           │   Educator          Learner
           │      │                 │
           │      ▼                 ▼
           │   /educator/       /learner/
           │    dashboard       dashboard
           │
           └─── Error ─────┐
                           │
                           ▼
                   Redirect to /auth
                   with error message


┌──────────────────────────────────────────────────────────────────────────┐
│                          4. SIGN IN FLOW                                  │
└──────────────────────────────────────────────────────────────────────────┘

    User clicks "Log In"
           │
           ▼
    Navigate to /auth
           │
           ▼
    Select User Role
           │
           ▼
    Click "Sign in" toggle
           │
           ▼
    ┌─────────────────────────┐
    │   SIGN IN FORM          │
    │                         │
    │   • Email               │
    │   • Password            │
    │                         │
    │   [Sign In] ──────────────────┐
    └─────────────────────────┘     │
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │  Server Action:      │
                         │  signIn(formData)    │
                         └──────────────────────┘
                                    │
                   ┌────────────────┴────────────────┐
                   │                                 │
                   ▼                                 ▼
           ┌───────────────┐              ┌─────────────────┐
           │  SUCCESS      │              │     ERROR       │
           └───────────────┘              └─────────────────┘
                   │                                 │
                   ▼                                 ▼
    Supabase authenticates user          Show Error Message
                   │
                   ▼
    Fetch profile to determine role
                   │
                   ▼
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
    Educator              Learner
         │                   │
         ▼                   ▼
    /educator/          /learner/
     dashboard          dashboard


┌──────────────────────────────────────────────────────────────────────────┐
│                       5. SESSION MANAGEMENT                               │
└──────────────────────────────────────────────────────────────────────────┘

    Every Request
           │
           ▼
    ┌─────────────────────────┐
    │  Middleware              │
    │  (middleware.ts)         │
    │                          │
    │  Runs on all routes      │
    │  (except static files)   │
    └─────────────────────────┘
           │
           ▼
    Check auth token validity
           │
           ├─── Token Valid ───┐
           │                   │
           │                   ▼
           │          Continue to route
           │
           └─── Token Expired ─┐
                               │
                               ▼
                      Refresh token
                               │
                               ▼
                    Update cookies with
                     new token
                               │
                               ▼
                      Continue to route


┌──────────────────────────────────────────────────────────────────────────┐
│                        6. DASHBOARD ACCESS                                │
└──────────────────────────────────────────────────────────────────────────┘

    User navigates to dashboard
           │
           ▼
    Server Component loads
           │
           ▼
    ┌─────────────────────────────┐
    │  Create Supabase client      │
    │  (server-side)               │
    └─────────────────────────────┘
           │
           ▼
    Call supabase.auth.getUser()
           │
           ├─── User Found ───┐
           │                  │
           │                  ▼
           │         Fetch user profile
           │         from database
           │                  │
           │                  ▼
           │         Verify role matches
           │         dashboard type
           │                  │
           │                  ▼
           │         Render dashboard
           │
           └─── No User ──────┐
                              │
                              ▼
                      Redirect to /auth


┌──────────────────────────────────────────────────────────────────────────┐
│                         7. SIGN OUT FLOW                                  │
└──────────────────────────────────────────────────────────────────────────┘

    User clicks avatar
           │
           ▼
    User menu opens
           │
           ▼
    Click "Sign Out"
           │
           ▼
    ┌─────────────────────────┐
    │  Server Action:         │
    │  signOut()              │
    └─────────────────────────┘
           │
           ▼
    Supabase destroys session
           │
           ▼
    Clear auth cookies
           │
           ▼
    Revalidate all routes
           │
           ▼
    Redirect to / (landing page)
           │
           ▼
    Show logged-out state


┌──────────────────────────────────────────────────────────────────────────┐
│                    8. CLIENT-SIDE AUTH STATE                              │
└──────────────────────────────────────────────────────────────────────────┘

    Landing Page (Client Component)
           │
           ▼
    ┌─────────────────────────────┐
    │  useEffect() on mount        │
    └─────────────────────────────┘
           │
           ▼
    Create Supabase client (browser)
           │
           ▼
    Fetch current user
           │
           ▼
    If user exists, fetch profile
           │
           ▼
    Update UI state (user, profile)
           │
           ▼
    ┌──────────────────────────────┐
    │  Subscribe to auth changes   │
    │  (onAuthStateChange)         │
    └──────────────────────────────┘
           │
           ▼
    When auth state changes:
    - Update user state
    - Fetch/clear profile
    - Re-render UI


┌──────────────────────────────────────────────────────────────────────────┐
│                      DATABASE RELATIONSHIPS                               │
└──────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────┐           ┌─────────────────────┐
    │   auth.users        │           │  public.profiles    │
    │   (Supabase Auth)   │           │   (Custom Table)    │
    │                     │           │                     │
    │  • id (UUID)        │───────────│  • id (FK)          │
    │  • email            │    1:1    │  • email            │
    │  • encrypted_pwd    │  CASCADE  │  • full_name        │
    │  • raw_user_meta   │  DELETE   │  • role             │
    │  • created_at       │           │  • avatar_url       │
    │  • updated_at       │           │  • created_at       │
    │  • last_sign_in     │           │  • updated_at       │
    └─────────────────────┘           └─────────────────────┘
            │                                   │
            │                                   │
            └────── Trigger: ──────────────────┘
                on_auth_user_created
                (Auto-creates profile)


┌──────────────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYERS                                    │
└──────────────────────────────────────────────────────────────────────────┘

    1. Row Level Security (RLS)
       └─ Enabled on profiles table
          ├─ Users can SELECT their own row
          ├─ Users can UPDATE their own row
          └─ Users can INSERT their own row

    2. Server-Side Validation
       └─ All auth operations via Server Actions
          └─ No sensitive logic in client code

    3. Token Verification
       └─ Always use getUser() in server code
          └─ Validates token with Supabase

    4. Middleware Protection
       └─ Automatic session refresh
          └─ Prevents session hijacking

    5. Email Verification (Optional)
       └─ Confirms user owns email
          └─ Prevents fake accounts


┌──────────────────────────────────────────────────────────────────────────┐
│                         FILE STRUCTURE                                    │
└──────────────────────────────────────────────────────────────────────────┘

    digigyan-lms/
    │
    ├── app/
    │   ├── auth/
    │   │   ├── page.tsx              (Auth UI)
    │   │   ├── actions.ts            (Server Actions)
    │   │   ├── callback/
    │   │   │   └── route.ts         (OAuth callback)
    │   │   └── confirm/
    │   │       └── route.ts         (Email confirmation)
    │   │
    │   ├── educator/
    │   │   └── dashboard/
    │   │       └── page.tsx         (Educator dashboard)
    │   │
    │   ├── learner/
    │   │   └── dashboard/
    │   │       └── page.tsx         (Learner dashboard)
    │   │
    │   └── page.tsx                 (Landing page with auth state)
    │
    ├── utils/
    │   └── supabase/
    │       ├── client.ts            (Browser client)
    │       ├── server.ts            (Server client)
    │       └── middleware.ts        (Session refresh)
    │
    ├── types/
    │   └── database.types.ts        (TypeScript types)
    │
    ├── middleware.ts                (Request interceptor)
    │
    └── .env.local                   (Environment variables)


┌──────────────────────────────────────────────────────────────────────────┐
│                      KEY IMPLEMENTATION NOTES                             │
└──────────────────────────────────────────────────────────────────────────┘

    ✓ Role-based onboarding (educator vs learner)
    ✓ Automatic profile creation via database trigger
    ✓ Email confirmation support
    ✓ Server-side authentication with Server Actions
    ✓ Client-side auth state management
    ✓ Automatic session refresh via middleware
    ✓ Row Level Security for data protection
    ✓ Role-specific dashboard routing
    ✓ Avatar display with initials
    ✓ User dropdown menu with profile info
    ✓ Protected routes with server-side checks
    ✓ TypeScript type safety
    ✓ Error handling and validation
    ✓ Loading states for better UX
```

## 📌 Quick Navigation

- **Setup Instructions**: See `AUTHENTICATION_SETUP.md`
- **API Reference**: See `AUTH_API_REFERENCE.md`
- **Type Definitions**: See `types/database.types.ts`

---

**Built with**: Next.js 15 + Supabase SSR + TypeScript
**Security**: RLS, Server Actions, Token Validation
**UX**: Role-based onboarding, Auto session refresh, Real-time auth state

