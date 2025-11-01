import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * GET - Get all Canvas courses
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: courses, error } = await supabase
      .from('canvas_courses')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({
      courses: courses || [],
      count: courses?.length || 0,
    })
  } catch (error: any) {
    console.error('Error fetching Canvas courses:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch courses' 
    }, { status: 500 })
  }
}

