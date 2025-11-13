import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/notifications/preferences
 * Get user's notification preferences
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get notification preferences
    const { data: preferences, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Error fetching preferences:', error)
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
    }

    // If no preferences exist, create default ones
    if (!preferences) {
      const { data: newPreferences, error: insertError } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: user.id,
          reminders_enabled: true,
          reminder_timing: '24h',
          email_notifications: true,
          email_course_completion: true,
          email_weekly_summary: true,
          email_recommendations: true,
          push_notifications: true,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating default preferences:', insertError)
        return NextResponse.json({ error: 'Failed to create preferences' }, { status: 500 })
      }

      return NextResponse.json({ preferences: newPreferences })
    }

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/notifications/preferences
 * Update user's notification preferences
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      reminders_enabled,
      reminder_timing,
      email_notifications,
      email_course_completion,
      email_weekly_summary,
      email_recommendations,
      push_notifications,
    } = body

    // Validate reminder_timing if provided
    if (reminder_timing && !['15m', '1h', '24h', '3d'].includes(reminder_timing)) {
      return NextResponse.json(
        { error: 'Invalid reminder_timing value' },
        { status: 400 }
      )
    }

    // Update preferences
    const { data: preferences, error } = await supabase
      .from('notification_preferences')
      .update({
        ...(reminders_enabled !== undefined && { reminders_enabled }),
        ...(reminder_timing && { reminder_timing }),
        ...(email_notifications !== undefined && { email_notifications }),
        ...(email_course_completion !== undefined && { email_course_completion }),
        ...(email_weekly_summary !== undefined && { email_weekly_summary }),
        ...(email_recommendations !== undefined && { email_recommendations }),
        ...(push_notifications !== undefined && { push_notifications }),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      // If preferences don't exist, create them
      if (error.code === 'PGRST116') {
        const { data: newPreferences, error: insertError } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            reminders_enabled: reminders_enabled ?? true,
            reminder_timing: reminder_timing ?? '24h',
            email_notifications: email_notifications ?? true,
            email_course_completion: email_course_completion ?? true,
            email_weekly_summary: email_weekly_summary ?? true,
            email_recommendations: email_recommendations ?? true,
            push_notifications: push_notifications ?? true,
          })
          .select()
          .single()

        if (insertError) {
          console.error('Error creating preferences:', insertError)
          return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
        }

        return NextResponse.json({ 
          preferences: newPreferences,
          message: 'Preferences saved successfully',
        })
      }

      console.error('Error updating preferences:', error)
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
    }

    return NextResponse.json({ 
      preferences,
      message: 'Preferences updated successfully',
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

