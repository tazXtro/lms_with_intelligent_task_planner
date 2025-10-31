import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { initGoogleCalendarService } from '@/lib/google-calendar'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has Google OAuth tokens
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.provider_token || !session?.provider_refresh_token) {
      return NextResponse.json({ 
        error: 'No Google OAuth tokens found. Please sign in with Google.' 
      }, { status: 400 })
    }

    // Initialize Google Calendar service
    const calendarService = await initGoogleCalendarService()
    
    if (!calendarService) {
      return NextResponse.json({ 
        error: 'Failed to initialize Google Calendar service' 
      }, { status: 500 })
    }

    // Get or create DigiGyan calendar
    const calendarId = await calendarService.getOrCreateDigigyanCalendar()
    const calendarDetails = await calendarService.getCalendarDetails(calendarId)

    // Store calendar sync settings in database
    const { data: existingSettings } = await supabase
      .from('calendar_sync_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existingSettings) {
      // Update existing settings
      await supabase
        .from('calendar_sync_settings')
        .update({
          google_calendar_id: calendarId,
          calendar_name: calendarDetails.summary || 'DigiGyan Learning Tasks',
          is_connected: true,
          sync_enabled: true,
          last_sync_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
    } else {
      // Create new settings
      await supabase
        .from('calendar_sync_settings')
        .insert({
          user_id: user.id,
          google_calendar_id: calendarId,
          calendar_name: calendarDetails.summary || 'DigiGyan Learning Tasks',
          is_connected: true,
          sync_enabled: true,
          last_sync_at: new Date().toISOString(),
        })
    }

    return NextResponse.json({
      success: true,
      calendarId,
      calendarName: calendarDetails.summary,
    })
  } catch (error: any) {
    console.error('Error connecting Google Calendar:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to connect Google Calendar' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update calendar sync settings
    await supabase
      .from('calendar_sync_settings')
      .update({
        is_connected: false,
        sync_enabled: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    // Optionally, delete all task-event mappings
    await supabase
      .from('task_calendar_events')
      .delete()
      .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      message: 'Google Calendar disconnected successfully',
    })
  } catch (error: any) {
    console.error('Error disconnecting Google Calendar:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to disconnect Google Calendar' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get calendar sync settings
    const { data: settings, error } = await supabase
      .from('calendar_sync_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error
    }

    // Get task event count
    const { count } = await supabase
      .from('task_calendar_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    return NextResponse.json({
      settings: settings || null,
      syncedTasksCount: count || 0,
    })
  } catch (error: any) {
    console.error('Error fetching calendar settings:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch calendar settings' 
    }, { status: 500 })
  }
}

