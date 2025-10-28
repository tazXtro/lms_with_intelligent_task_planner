'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export type UserRole = 'educator' | 'learner'

export interface AuthUser {
  id: string
  email: string
  role: UserRole | null
  full_name: string | null
}

/**
 * Get the current authenticated user with their profile
 * Returns null if not authenticated
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email!,
    role: profile?.role as UserRole | null,
    full_name: profile?.full_name || null,
  }
}

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser()
  
  if (!user) {
    redirect('/auth')
  }
  
  return user
}

/**
 * Require authentication with a specific role
 * Redirects to login if not authenticated or wrong role
 */
export async function requireRole(role: UserRole): Promise<AuthUser> {
  const user = await requireAuth()
  
  if (!user.role) {
    redirect('/auth/select-role')
  }
  
  if (user.role !== role) {
    // Redirect to appropriate dashboard based on their actual role
    const dashboardPath = user.role === 'educator' ? '/educator/dashboard' : '/learner/dashboard'
    redirect(dashboardPath)
  }
  
  return user
}

/**
 * Require educator role
 */
export async function requireEducator(): Promise<AuthUser> {
  return requireRole('educator')
}

/**
 * Require learner role
 */
export async function requireLearner(): Promise<AuthUser> {
  return requireRole('learner')
}

