# Authentication API Reference

Quick reference guide for using authentication in your DigiGyan LMS application.

## Server Actions

Import from: `@/app/auth/actions`

### `signUp(formData: FormData)`

Creates a new user account with role-based onboarding.

**FormData fields:**
- `email` (string, required)
- `password` (string, required)
- `fullName` (string, required)
- `role` ('educator' | 'learner', required)

**Returns:**
```typescript
{
  success?: boolean
  message?: string
  error?: string
  requiresEmailConfirmation?: boolean
}
```

**Example:**
```typescript
import { signUp } from '@/app/auth/actions'

async function handleSignUp(formData: FormData) {
  const result = await signUp(formData)
  
  if (result?.error) {
    console.error(result.error)
  } else if (result?.success) {
    console.log(result.message)
  }
}
```

---

### `signIn(formData: FormData)`

Authenticates a user and redirects to their role-specific dashboard.

**FormData fields:**
- `email` (string, required)
- `password` (string, required)

**Returns:**
```typescript
{
  error?: string
}
```

**Redirects to:**
- `/educator/dashboard` for educators
- `/learner/dashboard` for learners

**Example:**
```typescript
import { signIn } from '@/app/auth/actions'

async function handleSignIn(formData: FormData) {
  const result = await signIn(formData)
  
  if (result?.error) {
    console.error(result.error)
  }
  // If successful, user is automatically redirected
}
```

---

### `signOut()`

Signs out the current user and redirects to the landing page.

**Returns:** void (redirects to `/`)

**Example:**
```typescript
import { signOut } from '@/app/auth/actions'

async function handleSignOut() {
  await signOut()
  // User is automatically redirected to '/'
}
```

---

### `getUser()`

Fetches the current authenticated user with their profile.

**Returns:**
```typescript
{
  id: string
  email?: string
  profile: {
    id: string
    email: string | null
    full_name: string | null
    role: 'educator' | 'learner' | null
    avatar_url: string | null
    created_at: string
    updated_at: string
  } | null
} | null
```

**Example (Server Component):**
```typescript
import { getUser } from '@/app/auth/actions'

export default async function ProtectedPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/auth')
  }
  
  return (
    <div>
      <h1>Welcome, {user.profile?.full_name}</h1>
      <p>Role: {user.profile?.role}</p>
    </div>
  )
}
```

---

## Supabase Clients

### Client-Side Usage (Client Components)

Import from: `@/utils/supabase/client`

**Example:**
```typescript
'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function ClientComponent() {
  const [user, setUser] = useState(null)
  const supabase = createClient()
  
  useEffect(() => {
    // Fetch current user
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    
    fetchUser()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )
    
    return () => subscription.unsubscribe()
  }, [])
  
  return <div>User: {user?.email}</div>
}
```

---

### Server-Side Usage (Server Components)

Import from: `@/utils/supabase/server`

**Example:**
```typescript
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function ServerComponent() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth')
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return (
    <div>
      <h1>Welcome, {profile?.full_name}</h1>
    </div>
  )
}
```

---

## Common Patterns

### Protecting a Server Component

```typescript
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth')
  }
  
  // Your protected content here
  return <div>Protected Content</div>
}
```

---

### Protecting a Route Handler

```typescript
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Your API logic here
  return NextResponse.json({ data: 'Your data' })
}
```

---

### Role-Based Access Control

```typescript
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function EducatorOnlyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth')
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'educator') {
    redirect('/learner/dashboard') // Redirect to appropriate page
  }
  
  // Educator-only content
  return <div>Educator Dashboard</div>
}
```

---

### Fetching User Profile

```typescript
'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function ProfileComponent() {
  const [profile, setProfile] = useState(null)
  const supabase = createClient()
  
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setProfile(data)
      }
    }
    
    fetchProfile()
  }, [])
  
  if (!profile) return <div>Loading...</div>
  
  return (
    <div>
      <h2>{profile.full_name}</h2>
      <p>Email: {profile.email}</p>
      <p>Role: {profile.role}</p>
    </div>
  )
}
```

---

### Updating User Profile

```typescript
import { createClient } from '@/utils/supabase/server'

export async function updateProfile(formData: FormData) {
  'use server'
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }
  
  const fullName = formData.get('fullName') as string
  
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq('id', user.id)
  
  if (error) {
    return { error: error.message }
  }
  
  return { success: true }
}
```

---

## TypeScript Types

Import from: `@/types/database.types`

```typescript
import type { Profile, UserRole, UserWithProfile } from '@/types/database.types'

// Use in your components
const profile: Profile = {
  id: '...',
  email: 'user@example.com',
  full_name: 'John Doe',
  role: 'learner',
  avatar_url: null,
  created_at: '...',
  updated_at: '...'
}
```

---

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

---

## Route Handlers

### Email Confirmation

**Route:** `/auth/confirm`

Handles email verification from confirmation links.

**Query Parameters:**
- `token_hash` (string)
- `type` ('email' | 'recovery' | 'signup')
- `next` (string, optional) - Redirect path after confirmation

---

### OAuth Callback

**Route:** `/auth/callback`

Handles OAuth and magic link callbacks.

**Query Parameters:**
- `code` (string) - Auth code to exchange for session
- `next` (string, optional) - Redirect path after authentication

---

## Security Best Practices

1. **Always use `getUser()` in server code**
   - Never trust `getSession()` alone
   - `getUser()` validates the token with Supabase

2. **Implement Row Level Security (RLS)**
   - Already configured for `profiles` table
   - Add RLS policies for new tables

3. **Validate user input**
   - Check form data before processing
   - Sanitize user-provided content

4. **Use HTTPS in production**
   - Configure site URL properly
   - Enable secure cookies

5. **Enable email verification**
   - Recommended for production
   - Configure in Supabase dashboard

---

## Debugging Tips

### Check Current User

```typescript
const supabase = await createClient()
const { data: { user }, error } = await supabase.auth.getUser()
console.log('Current user:', user)
console.log('Auth error:', error)
```

### Check Session

```typescript
const supabase = await createClient()
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)
```

### Check Profile

```typescript
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()
console.log('Profile:', profile)
console.log('Profile error:', error)
```

---

## Need Help?

- Check `AUTHENTICATION_SETUP.md` for setup instructions
- Review [Supabase Documentation](https://supabase.com/docs)
- Check browser console for errors
- Verify environment variables are loaded

