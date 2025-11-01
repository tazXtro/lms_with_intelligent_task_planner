import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * GET - Get all Canvas grades
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: grades, error } = await supabase
      .from('canvas_grades')
      .select(`
        *,
        canvas_courses!canvas_grades_canvas_course_id_fkey (
          name,
          course_code
        )
      `)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      grades: grades || [],
      count: grades?.length || 0,
    })
  } catch (error: any) {
    console.error('Error fetching Canvas grades:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch grades' 
    }, { status: 500 })
  }
}

