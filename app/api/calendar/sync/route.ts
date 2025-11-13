import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { initGoogleCalendarService } from '@/lib/google-calendar'

/**
 * Sync all tasks to Google Calendar
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get calendar sync settings
    const { data: settings } = await supabase
      .from('calendar_sync_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!settings || !settings.is_connected) {
      return NextResponse.json({ 
        error: 'Google Calendar not connected' 
      }, { status: 400 })
    }

    // Initialize Google Calendar service
    const calendarService = await initGoogleCalendarService()
    
    if (!calendarService) {
      return NextResponse.json({ 
        error: 'Failed to initialize Google Calendar service' 
      }, { status: 500 })
    }

    // Fetch user's notification preferences
    const { data: notificationPrefs } = await supabase
      .from('notification_preferences')
      .select('reminders_enabled, reminder_timing, email_notifications')
      .eq('user_id', user.id)
      .single()

    // Prepare reminder settings for Google Calendar
    const reminderSettings = notificationPrefs ? {
      enabled: notificationPrefs.reminders_enabled,
      timing: notificationPrefs.reminder_timing,
      emailEnabled: notificationPrefs.email_notifications,
    } : undefined

    // Get all tasks that are not completed
    const { data: tasks, error: tasksError } = await supabase
      .from('learner_tasks')
      .select('*')
      .eq('learner_id', user.id)
      .neq('status', 'completed')

    if (tasksError) {
      throw tasksError
    }

    let syncedCount = 0
    const errors: string[] = []

    // Sync each task
    for (const task of tasks || []) {
      try {
        // Check if task already has a calendar event
        const { data: existingEvent } = await supabase
          .from('task_calendar_events')
          .select('*')
          .eq('task_id', task.id)
          .single()

        if (existingEvent) {
          // Update existing event
          await calendarService.updateTaskEvent(
            settings.google_calendar_id,
            existingEvent.google_event_id,
            task.title,
            task.description,
            task.due_date,
            task.priority,
            task.status,
            reminderSettings
          )

          await supabase
            .from('task_calendar_events')
            .update({
              synced_at: new Date().toISOString(),
            })
            .eq('task_id', task.id)
        } else {
          // Create new event
          const eventId = await calendarService.createTaskEvent(
            settings.google_calendar_id,
            task.title,
            task.description,
            task.due_date,
            task.priority,
            reminderSettings
          )

          // Store the mapping
          await supabase
            .from('task_calendar_events')
            .insert({
              task_id: task.id,
              user_id: user.id,
              google_event_id: eventId,
              calendar_id: settings.google_calendar_id,
            })

          await supabase
            .from('learner_tasks')
            .update({
              calendar_event_id: eventId,
              last_synced_at: new Date().toISOString(),
            })
            .eq('id', task.id)
        }

        syncedCount++
      } catch (error: any) {
        console.error(`Error syncing task ${task.id}:`, error)
        errors.push(`Failed to sync task "${task.title}": ${error.message}`)
      }
    }

    // Update last sync time
    await supabase
      .from('calendar_sync_settings')
      .update({
        last_sync_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      syncedCount,
      totalTasks: tasks?.length || 0,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Error syncing tasks to calendar:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to sync tasks to calendar' 
    }, { status: 500 })
  }
}

/**
 * Sync a specific task to Google Calendar
 */
export async function PUT(request: NextRequest) {
  try {
    const { taskId } = await request.json()

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get calendar sync settings
    const { data: settings } = await supabase
      .from('calendar_sync_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!settings || !settings.is_connected || !settings.sync_enabled) {
      return NextResponse.json({ 
        error: 'Google Calendar not connected or sync is disabled' 
      }, { status: 400 })
    }

    // Initialize Google Calendar service
    const calendarService = await initGoogleCalendarService()
    
    if (!calendarService) {
      return NextResponse.json({ 
        error: 'Failed to initialize Google Calendar service' 
      }, { status: 500 })
    }

    // Get the task
    const { data: task, error: taskError } = await supabase
      .from('learner_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('learner_id', user.id)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Fetch user's notification preferences
    const { data: notificationPrefs } = await supabase
      .from('notification_preferences')
      .select('reminders_enabled, reminder_timing, email_notifications')
      .eq('user_id', user.id)
      .single()

    // Prepare reminder settings for Google Calendar
    const reminderSettings = notificationPrefs ? {
      enabled: notificationPrefs.reminders_enabled,
      timing: notificationPrefs.reminder_timing,
      emailEnabled: notificationPrefs.email_notifications,
    } : undefined

    // Check if task already has a calendar event
    const { data: existingEvent } = await supabase
      .from('task_calendar_events')
      .select('*')
      .eq('task_id', task.id)
      .single()

    let eventId: string

    if (existingEvent) {
      // Update existing event
      await calendarService.updateTaskEvent(
        settings.google_calendar_id,
        existingEvent.google_event_id,
        task.title,
        task.description,
        task.due_date,
        task.priority,
        task.status,
        reminderSettings
      )

      await supabase
        .from('task_calendar_events')
        .update({
          synced_at: new Date().toISOString(),
        })
        .eq('task_id', task.id)

      eventId = existingEvent.google_event_id
    } else {
      // Create new event
      eventId = await calendarService.createTaskEvent(
        settings.google_calendar_id,
        task.title,
        task.description,
        task.due_date,
        task.priority,
        reminderSettings
      )

      // Store the mapping
      await supabase
        .from('task_calendar_events')
        .insert({
          task_id: task.id,
          user_id: user.id,
          google_event_id: eventId,
          calendar_id: settings.google_calendar_id,
        })
    }

    // Update task with event ID
    await supabase
      .from('learner_tasks')
      .update({
        calendar_event_id: eventId,
        last_synced_at: new Date().toISOString(),
      })
      .eq('id', task.id)

    return NextResponse.json({
      success: true,
      eventId,
      message: 'Task synced to calendar successfully',
    })
  } catch (error: any) {
    console.error('Error syncing task to calendar:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to sync task to calendar' 
    }, { status: 500 })
  }
}

/**
 * Remove a task from Google Calendar
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the task-event mapping
    const { data: eventMapping } = await supabase
      .from('task_calendar_events')
      .select('*')
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .single()

    if (!eventMapping) {
      return NextResponse.json({ 
        success: true,
        message: 'No calendar event found for this task',
      })
    }

    // Initialize Google Calendar service
    const calendarService = await initGoogleCalendarService()
    
    if (calendarService) {
      try {
        // Delete the event from Google Calendar
        await calendarService.deleteTaskEvent(
          eventMapping.calendar_id,
          eventMapping.google_event_id
        )
      } catch (error) {
        console.error('Error deleting event from Google Calendar:', error)
        // Continue even if deletion fails (event might already be deleted)
      }
    }

    // Delete the mapping from database
    await supabase
      .from('task_calendar_events')
      .delete()
      .eq('task_id', taskId)

    // Clear the calendar event ID from task
    await supabase
      .from('learner_tasks')
      .update({
        calendar_event_id: null,
        last_synced_at: null,
      })
      .eq('id', taskId)

    return NextResponse.json({
      success: true,
      message: 'Task removed from calendar successfully',
    })
  } catch (error: any) {
    console.error('Error removing task from calendar:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to remove task from calendar' 
    }, { status: 500 })
  }
}

