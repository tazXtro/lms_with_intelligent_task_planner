import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { initGoogleCalendarService } from '@/lib/google-calendar'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id: taskId } = await params

    // Update task (RLS will ensure user can only update their own tasks)
    const { data: task, error } = await supabase
      .from('learner_tasks')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('learner_id', user.id)
      .select(`
        *,
        course:courses(id, title)
      `)
      .single()

    if (error) {
      console.error('Error updating task:', error)
      return NextResponse.json(
        { error: 'Failed to update task' },
        { status: 500 }
      )
    }

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
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

      if (calendarSettings) {
        const { data: eventMapping } = await supabase
          .from('task_calendar_events')
          .select('*')
          .eq('task_id', taskId)
          .single()

        const calendarService = await initGoogleCalendarService()
        
        if (calendarService && eventMapping) {
          // Update existing event
          await calendarService.updateTaskEvent(
            calendarSettings.google_calendar_id,
            eventMapping.google_event_id,
            task.title,
            task.description,
            task.due_date,
            task.priority,
            task.status
          )

          await supabase
            .from('task_calendar_events')
            .update({
              synced_at: new Date().toISOString(),
            })
            .eq('task_id', taskId)

          await supabase
            .from('learner_tasks')
            .update({
              last_synced_at: new Date().toISOString(),
            })
            .eq('id', taskId)
        } else if (calendarService && !eventMapping && task.status !== 'completed') {
          // Create event if it doesn't exist and task is not completed
          const eventId = await calendarService.createTaskEvent(
            calendarSettings.google_calendar_id,
            task.title,
            task.description,
            task.due_date,
            task.priority
          )

          await supabase
            .from('task_calendar_events')
            .insert({
              task_id: taskId,
              user_id: user.id,
              google_event_id: eventId,
              calendar_id: calendarSettings.google_calendar_id,
            })

          await supabase
            .from('learner_tasks')
            .update({
              calendar_event_id: eventId,
              last_synced_at: new Date().toISOString(),
            })
            .eq('id', taskId)
        } else if (calendarService && eventMapping && task.status === 'completed') {
          // Delete event if task is completed
          try {
            await calendarService.deleteTaskEvent(
              calendarSettings.google_calendar_id,
              eventMapping.google_event_id
            )

            await supabase
              .from('task_calendar_events')
              .delete()
              .eq('task_id', taskId)

            await supabase
              .from('learner_tasks')
              .update({
                calendar_event_id: null,
              })
              .eq('id', taskId)
          } catch (deleteError) {
            console.error('Error deleting completed task from calendar:', deleteError)
          }
        }
      }
    } catch (calendarError) {
      // Log but don't fail the task update if calendar sync fails
      console.error('Error syncing to calendar:', calendarError)
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: taskId } = await params

    // Delete from Google Calendar first if connected
    try {
      const { data: eventMapping } = await supabase
        .from('task_calendar_events')
        .select('*')
        .eq('task_id', taskId)
        .eq('user_id', user.id)
        .single()

      if (eventMapping) {
        const calendarService = await initGoogleCalendarService()
        
        if (calendarService) {
          try {
            await calendarService.deleteTaskEvent(
              eventMapping.calendar_id,
              eventMapping.google_event_id
            )
          } catch (deleteError) {
            console.error('Error deleting event from Google Calendar:', deleteError)
            // Continue even if deletion fails
          }
        }

        // Delete the mapping
        await supabase
          .from('task_calendar_events')
          .delete()
          .eq('task_id', taskId)
      }
    } catch (calendarError) {
      console.error('Error with calendar cleanup:', calendarError)
      // Continue with task deletion even if calendar cleanup fails
    }

    // Delete task (RLS will ensure user can only delete their own tasks)
    const { error } = await supabase
      .from('learner_tasks')
      .delete()
      .eq('id', taskId)
      .eq('learner_id', user.id)

    if (error) {
      console.error('Error deleting task:', error)
      return NextResponse.json(
        { error: 'Failed to delete task' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

