import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * Helper function to clean and format Canvas HTML description
 */
function formatCanvasDescription(htmlDescription: string, assignmentUrl: string, courseName?: string): string {
  if (!htmlDescription) {
    return courseName 
      ? `Canvas assignment from ${courseName}\n\nView in Canvas: ${assignmentUrl}`
      : `Canvas assignment\n\nView in Canvas: ${assignmentUrl}`
  }

  // Remove HTML tags but preserve structure
  let text = htmlDescription
    // Convert <p> and <br> to line breaks
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    // Extract file links with their titles
    .replace(/<a[^>]*class="instructure_file_link"[^>]*title="([^"]*)"[^>]*>([^<]*)<\/a>/gi, '📄 $1')
    // Extract regular links
    .replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi, '🔗 $2: $1')
    // Remove all other HTML tags
    .replace(/<[^>]*>/g, '')
    // Decode HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Clean up multiple line breaks
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  // Limit description length to prevent overwhelming the UI
  if (text.length > 300) {
    text = text.substring(0, 300) + '...'
  }

  // Add course and Canvas link info
  let formattedDesc = ''
  if (courseName) {
    formattedDesc += `📚 Course: ${courseName}\n\n`
  }
  formattedDesc += text
  formattedDesc += `\n\n🔗 View full assignment in Canvas:\n${assignmentUrl}`

  return formattedDesc
}

/**
 * POST - Sync Canvas assignments to Kanban tasks
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { assignmentIds, syncAll } = body

    let query = supabase
      .from('canvas_assignments')
      .select(`
        *,
        canvas_courses!canvas_assignments_canvas_course_id_fkey (
          name,
          course_code
        )
      `)
      .eq('user_id', user.id)
      .eq('synced_to_task', false)

    // If specific assignment IDs provided, filter by them
    if (assignmentIds && assignmentIds.length > 0) {
      query = query.in('id', assignmentIds)
    }

    // Only sync upcoming assignments if syncAll is not true
    if (!syncAll) {
      const now = new Date().toISOString()
      query = query.gte('due_at', now)
    }

    const { data: assignments, error: fetchError } = await query

    if (fetchError) {
      throw fetchError
    }

    if (!assignments || assignments.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No assignments to sync',
        synced: 0,
      })
    }

    let syncedCount = 0
    const errors: string[] = []

    for (const assignment of assignments) {
      try {
        // Get course name and code from the joined data
        const courseName = (assignment as any).canvas_courses?.name || 'Unknown Course'
        const courseCode = (assignment as any).canvas_courses?.course_code || ''
        
        // Use course code if available (shorter), otherwise use course name
        const courseIdentifier = courseCode || courseName
        
        // Format the description to be clean and informative
        const formattedDescription = formatCanvasDescription(
          assignment.description || '',
          assignment.html_url,
          courseName
        )

        // Calculate priority based on due date urgency
        let priority: 'low' | 'medium' | 'high' = 'medium'
        if (assignment.due_at) {
          const dueDate = new Date(assignment.due_at)
          const now = new Date()
          const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          
          if (daysUntilDue <= 1) priority = 'high'
          else if (daysUntilDue <= 3) priority = 'high'
          else if (daysUntilDue <= 7) priority = 'medium'
          else priority = 'low'
        }

        // Create task in learner_tasks with course identifier in title
        const { data: task, error: taskError } = await supabase
          .from('learner_tasks')
          .insert({
            learner_id: user.id,
            title: `[${courseIdentifier}] ${assignment.name}`,
            description: formattedDescription,
            status: 'todo',
            priority: priority,
            due_date: assignment.due_at ? new Date(assignment.due_at).toISOString().split('T')[0] : null,
          })
          .select()
          .single()

        if (taskError) {
          throw taskError
        }

        // Update assignment to mark as synced
        await supabase
          .from('canvas_assignments')
          .update({
            synced_to_task: true,
            task_id: task.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', assignment.id)

        syncedCount++
      } catch (error: any) {
        console.error(`Error syncing assignment ${assignment.id}:`, error)
        errors.push(`${assignment.name}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedCount} assignment(s) to tasks`,
      synced: syncedCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Error syncing assignments to tasks:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to sync assignments to tasks' 
    }, { status: 500 })
  }
}

