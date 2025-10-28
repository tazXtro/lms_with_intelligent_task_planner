import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth',
    '/auth/callback',
    '/auth/confirm',
  ]

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => path === route || path.startsWith(`${route}/`))

  // Protected routes that require authentication
  const isEducatorRoute = path.startsWith('/educator')
  const isLearnerRoute = path.startsWith('/learner')
  const isProtectedRoute = isEducatorRoute || isLearnerRoute

  // If user is not logged in and trying to access protected routes, redirect to auth
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/auth', request.url)
    redirectUrl.searchParams.set('redirectTo', path)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is logged in, check role-based access
  if (user && (isEducatorRoute || isLearnerRoute)) {
    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // If no role is set, redirect to role selection
    if (!profile?.role) {
      // Allow access to select-role page
      if (path === '/auth/select-role') {
        return supabaseResponse
      }
      // Redirect to role selection
      return NextResponse.redirect(new URL('/auth/select-role', request.url))
    }

    // Check role-based access
    if (isEducatorRoute && profile.role !== 'educator') {
      // Redirect learners trying to access educator routes to learner dashboard
      return NextResponse.redirect(new URL('/learner/dashboard', request.url))
    }

    if (isLearnerRoute && profile.role !== 'learner') {
      // Redirect educators trying to access learner routes to educator dashboard
      return NextResponse.redirect(new URL('/educator/dashboard', request.url))
    }
  }

  // If user is logged in and trying to access auth page, redirect to appropriate dashboard
  if (user && path === '/auth') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'educator') {
      return NextResponse.redirect(new URL('/educator/dashboard', request.url))
    } else if (profile?.role === 'learner') {
      return NextResponse.redirect(new URL('/learner/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/auth/select-role', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

