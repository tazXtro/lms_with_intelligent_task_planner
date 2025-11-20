import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET - Fetch user's Pomodoro goals
 */
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: goals, error } = await supabase
      .from('pomodoro_goals')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching goals:', error)
      return NextResponse.json(
        { error: 'Failed to fetch goals' },
        { status: 500 }
      )
    }

    // If no goals exist, create default goals
    if (!goals) {
      const { data: newGoals, error: insertError } = await supabase
        .from('pomodoro_goals')
        .insert({
          user_id: user.id,
          daily_session_goal: 8,
          daily_focus_time_goal_minutes: 200,
          current_streak: 0,
          longest_streak: 0,
          total_lifetime_sessions: 0,
          total_lifetime_focus_minutes: 0,
        })
        .select()
        .single()

      if (insertError) throw insertError
      return NextResponse.json({ goals: newGoals })
    }

    return NextResponse.json({ goals })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Update user's Pomodoro goals
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { daily_session_goal, daily_focus_time_goal_minutes } = body

    const { data: goals, error } = await supabase
      .from('pomodoro_goals')
      .upsert({
        user_id: user.id,
        daily_session_goal,
        daily_focus_time_goal_minutes,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating goals:', error)
      return NextResponse.json(
        { error: 'Failed to update goals' },
        { status: 500 }
      )
    }

    return NextResponse.json({ goals })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
