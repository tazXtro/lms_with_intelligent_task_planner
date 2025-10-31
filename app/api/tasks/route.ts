import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { initGoogleCalendarService } from '@/lib/google-calendar'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch tasks for the authenticated user
    const { data: tasks, error } = await supabase
      .from('learner_tasks')
      .select(`
        *,
        course:courses(id, title)
      `)
      .eq('learner_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tasks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      )
    }

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, course_id, priority, due_date, subtasks } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Create new task
    const { data: task, error } = await supabase
      .from('learner_tasks')
      .insert({
        learner_id: user.id,
        title,
        description: description || null,
        course_id: course_id || null,
        priority: priority || 'medium',
        due_date: due_date || null,
        subtasks: subtasks || [],
        status: 'todo'
      })
      .select(`
        *,
        course:courses(id, title)
      `)
      .single()

    if (error) {
      console.error('Error creating task:', error)
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 500 }
      )
    }

    // Auto-sync to Google Calendar if connected
    try {
      const { data: calendarSettings } = await supabase
        .from('calendar_sync_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_connected', true)
        .eq('sync_enabled', true)
        .single()

      if (calendarSettings && task) {
        const calendarService = await initGoogleCalendarService()
        
        if (calendarService) {
          const eventId = await calendarService.createTaskEvent(
            calendarSettings.google_calendar_id,
            task.title,
            task.description,
            task.due_date,
            task.priority
          )

          // Store the mapping
          await supabase
            .from('task_calendar_events')
            .insert({
              task_id: task.id,
              user_id: user.id,
              google_event_id: eventId,
              calendar_id: calendarSettings.google_calendar_id,
            })

          // Update task with event ID
          await supabase
            .from('learner_tasks')
            .update({
              calendar_event_id: eventId,
              last_synced_at: new Date().toISOString(),
            })
            .eq('id', task.id)
        }
      }
    } catch (calendarError) {
      // Log but don't fail the task creation if calendar sync fails
      console.error('Error syncing to calendar:', calendarError)
    }

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

