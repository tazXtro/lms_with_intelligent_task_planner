# Route Protection Guide

## Overview

This application implements comprehensive route protection with both authentication and role-based access control (RBAC). All protected routes are secured at the middleware level, ensuring users cannot access pages without proper authentication and authorization.

## Protection Layers

### 1. **Middleware Protection** (Primary Layer)
The `middleware.ts` file provides the first line of defense:

- **Authentication Check**: Verifies if the user has a valid Supabase session
- **Role-Based Access Control**: Ensures users can only access routes matching their role
- **Automatic Redirects**: Redirects unauthorized users to appropriate pages

### 2. **Client-Side Data Loading** (Secondary Layer)
Individual pages check for user authentication when fetching data:
- Pages call `supabase.auth.getUser()` before loading data
- If no user exists, data is not loaded
- This prevents unnecessary API calls and database queries

## Protected Route Structure

### Educator Routes (`/educator/*`)
**Required Role**: `educator`

Protected routes:
- `/educator/dashboard` - Educator dashboard with course stats
- `/educator/courses` - List of educator's courses
- `/educator/courses/create` - Create new course
- `/educator/courses/[courseId]/curriculum` - Edit course curriculum
- `/educator/courses/[courseId]/edit` - Edit course details

**Access Control**:
- ✅ Educators can access these routes
- ❌ Learners are redirected to `/learner/dashboard`
- ❌ Unauthenticated users are redirected to `/auth`

### Learner Routes (`/learner/*`)
**Required Role**: `learner`

Protected routes:
- `/learner/dashboard` - Learner dashboard with enrolled courses
- `/learner/courses` - List of learner's enrolled courses
- `/learner/browse` - Browse all available courses
- `/learner/course/[courseId]` - Course details page
- `/learner/learn/[courseId]` - Course learning interface
- `/learner/tasks` - Task management
- `/learner/settings` - User settings
- `/learner/checkout` - Course checkout
- `/learner/checkout/success` - Checkout success page

**Access Control**:
- ✅ Learners can access these routes
- ❌ Educators are redirected to `/educator/dashboard`
- ❌ Unauthenticated users are redirected to `/auth`

### Public Routes
These routes are accessible without authentication:
- `/` - Landing page
- `/auth` - Authentication page (login/signup)
- `/auth/callback` - OAuth callback handler
- `/auth/confirm` - Email confirmation handler

**Special Behavior**:
- Authenticated users accessing `/auth` are redirected to their role-specific dashboard

### Special Routes
- `/auth/select-role` - Role selection page
  - Accessible only to authenticated users without a role
  - Users with a role are redirected to their dashboard

## How It Works

### 1. Request Flow

```
User Request
    ↓
Middleware (middleware.ts)
    ↓
┌─────────────────────────┐
│ Check Authentication    │
└─────────────────────────┘
    ↓
Is user authenticated?
    ├─ No → Is protected route? → Yes → Redirect to /auth
    └─ Yes → Continue
        ↓
┌─────────────────────────┐
│ Check User Role         │
└─────────────────────────┘
    ↓
Has role?
    ├─ No → Redirect to /auth/select-role
    └─ Yes → Continue
        ↓
┌─────────────────────────┐
│ Verify Role Access      │
└─────────────────────────┘
    ↓
Role matches route?
    ├─ No → Redirect to appropriate dashboard
    └─ Yes → Allow access
        ↓
    Page Loads
        ↓
┌─────────────────────────┐
│ Client-Side Data Load   │
└─────────────────────────┘
```

### 2. Middleware Logic

```typescript
// middleware.ts

1. Get user from Supabase session
2. Identify if route is protected (educator/* or learner/*)
3. If protected and no user → redirect to /auth
4. If user exists:
   a. Get user profile with role
   b. If no role → redirect to /auth/select-role
   c. If educator route and not educator → redirect to /learner/dashboard
   d. If learner route and not learner → redirect to /educator/dashboard
5. Allow request to proceed
```

## Authentication Utilities

A helper library is provided at `lib/auth.ts` for server-side components:

### Available Functions

```typescript
// Get current authenticated user (returns null if not authenticated)
const user = await getAuthUser()

// Require authentication (redirects if not authenticated)
const user = await requireAuth()

// Require specific role (redirects if wrong role)
const user = await requireRole('educator')

// Convenience functions
const educatorUser = await requireEducator()
const learnerUser = await requireLearner()
```

### Usage Example

For server components that need authentication:

```typescript
// app/some-page/page.tsx
import { requireEducator } from '@/lib/auth'

export default async function Page() {
  // This will automatically redirect if not authenticated or not an educator
  const user = await requireEducator()
  
  return (
    <div>
      <h1>Welcome, {user.full_name}!</h1>
    </div>
  )
}
```

## API Route Protection

API routes (`/api/*`) are excluded from middleware to allow for custom authentication logic.

To protect API routes, add authentication checks within the route handler:

```typescript
// app/api/some-endpoint/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // Check role if needed
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'educator') {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }
  
  // Handle request...
}
```

## Testing Route Protection

### Test Cases

1. **Unauthenticated Access**
   - Try accessing `/educator/dashboard` without logging in
   - Expected: Redirect to `/auth`

2. **Wrong Role Access**
   - Log in as learner, try accessing `/educator/dashboard`
   - Expected: Redirect to `/learner/dashboard`
   
   - Log in as educator, try accessing `/learner/dashboard`
   - Expected: Redirect to `/educator/dashboard`

3. **Correct Access**
   - Log in as educator, access `/educator/dashboard`
   - Expected: Page loads successfully
   
   - Log in as learner, access `/learner/dashboard`
   - Expected: Page loads successfully

4. **No Role Set**
   - Log in but don't select a role
   - Try accessing any protected route
   - Expected: Redirect to `/auth/select-role`

5. **Authenticated User on Auth Page**
   - Log in and try to access `/auth`
   - Expected: Redirect to role-specific dashboard

### Manual Testing

1. **Open an incognito/private browser window**
2. **Navigate to protected routes directly**:
   ```
   http://localhost:3000/educator/dashboard
   http://localhost:3000/learner/dashboard
   http://localhost:3000/educator/courses
   http://localhost:3000/learner/courses
   ```
3. **Verify you're redirected to `/auth`**
4. **Log in with different roles and test cross-access**

## Security Considerations

### What's Protected
✅ All `/educator/*` routes require educator role
✅ All `/learner/*` routes require learner role
✅ Session is validated on every protected request
✅ Role is checked from database on every request
✅ Automatic redirects prevent unauthorized access

### What's NOT Protected by Middleware
❌ API routes (`/api/*`) - must add custom auth
❌ Static files (images, CSS, JS)
❌ Public assets in `/public`

### Best Practices

1. **Never rely on client-side checks alone** - Always use middleware or server-side checks
2. **Validate role on sensitive operations** - Even within protected routes, verify role for critical actions
3. **Use server-side data fetching** - Where possible, use Server Components to fetch data server-side
4. **Audit API routes** - Ensure all API routes have proper authentication checks
5. **Regular security reviews** - Periodically review protected routes and access controls

## Troubleshooting

### Issue: "I can still access pages without logging in"

**Solution**: 
- Clear browser cache and cookies
- Check if middleware matcher is correct
- Verify Supabase environment variables are set
- Restart development server

### Issue: "I'm getting infinite redirects"

**Solution**:
- Check if role is properly set in database
- Verify middleware logic doesn't create redirect loops
- Check browser console for errors

### Issue: "Wrong role but not being redirected"

**Solution**:
- Clear Supabase session cookies
- Check if profile has correct role in database
- Verify middleware is running (add console.log)

## Updates and Maintenance

### Adding New Protected Routes

1. Create the route file in appropriate directory (`/educator` or `/learner`)
2. Route is automatically protected by existing middleware patterns
3. No additional configuration needed

### Adding New Roles

If you need to add additional roles (e.g., `admin`):

1. Update database schema to allow new role values
2. Update `middleware.ts` to handle new role routes
3. Update `lib/auth.ts` to add helper functions
4. Update this documentation

### Modifying Protection Logic

To modify how routes are protected:

1. Edit `middleware.ts`
2. Test all route access scenarios
3. Update this documentation
4. Notify team of changes

## Summary

✅ **Comprehensive Protection**: All educator and learner routes are protected
✅ **Role-Based Access**: Users can only access routes for their role  
✅ **Automatic Redirects**: Unauthorized access automatically redirects to appropriate pages
✅ **Session Validation**: Every request validates authentication status
✅ **Easy to Use**: No additional code needed for new routes in protected directories

Your application is now fully secured with enterprise-grade route protection! 🔒

