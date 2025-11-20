import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET - Fetch Pomodoro statistics for a date range
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0]

    // Fetch statistics for date range
    const { data: stats, error: statsError } = await supabase
      .from('pomodoro_statistics')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (statsError) {
      console.error('Error fetching statistics:', statsError)
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      )
    }

    // Fetch goals
    const { data: goals } = await supabase
      .from('pomodoro_goals')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Calculate aggregated metrics
    const totalSessions = stats?.reduce((sum, s) => sum + s.completed_sessions, 0) || 0
    const totalFocusTime = stats?.reduce((sum, s) => sum + s.total_focus_time_minutes, 0) || 0
    const avgProductivity = stats?.length > 0 
      ? Math.round(stats.reduce((sum, s) => sum + s.productivity_score, 0) / stats.length)
      : 0

    return NextResponse.json({
      stats: stats || [],
      goals: goals || null,
      summary: {
        totalSessions,
        totalFocusTime,
        avgProductivity,
        daysTracked: stats?.length || 0,
      }
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST - Update today's statistics
 */
export async function POST(request: Request) {
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
    const today = new Date().toISOString().split('T')[0]

    // Check if stats exist for today
    const { data: existing } = await supabase
      .from('pomodoro_statistics')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    if (existing) {
      // Update existing stats
      const { data, error } = await supabase
        .from('pomodoro_statistics')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('date', today)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ stats: data })
    } else {
      // Create new stats
      const { data, error } = await supabase
        .from('pomodoro_statistics')
        .insert({
          user_id: user.id,
          date: today,
          ...body,
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ stats: data })
    }
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
