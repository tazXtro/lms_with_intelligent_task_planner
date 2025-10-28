import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

interface Subtask {
  id: string
  title: string
  completed: boolean
  created_at: string
}

export async function POST(
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
    const body = await request.json()
    const { title, subtasks } = body

    // Get current task
    const { data: task, error: fetchError } = await supabase
      .from('learner_tasks')
      .select('subtasks')
      .eq('id', taskId)
      .eq('learner_id', user.id)
      .single()

    if (fetchError || !task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Handle current subtasks
    let currentSubtasks: Subtask[] = []
    if (task.subtasks) {
      if (Array.isArray(task.subtasks)) {
        // Handle old format (array of strings) or new format (array of objects)
        currentSubtasks = task.subtasks.map((item: any, index: number) => {
          if (typeof item === 'string') {
            return {
              id: `subtask-${Date.now()}-${index}`,
              title: item,
              completed: false,
              created_at: new Date().toISOString()
            }
          }
          return item
        })
      }
    }

    // Add new subtask(s)
    if (subtasks && Array.isArray(subtasks)) {
      // Bulk add (from AI suggestions)
      const newSubtasks = subtasks.map((subtaskTitle: string, index: number) => ({
        id: `subtask-${Date.now()}-${index}`,
        title: subtaskTitle,
        completed: false,
        created_at: new Date().toISOString()
      }))
      currentSubtasks = [...currentSubtasks, ...newSubtasks]
    } else if (title) {
      // Single add
      const newSubtask: Subtask = {
        id: `subtask-${Date.now()}`,
        title,
        completed: false,
        created_at: new Date().toISOString()
      }
      currentSubtasks.push(newSubtask)
    }

    // Update task with new subtasks
    const { data: updatedTask, error: updateError } = await supabase
      .from('learner_tasks')
      .update({
        subtasks: currentSubtasks,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('learner_id', user.id)
      .select(`
        *,
        course:courses(id, title)
      `)
      .single()

    if (updateError) {
      console.error('Error updating subtasks:', updateError)
      return NextResponse.json(
        { error: 'Failed to add subtask' },
        { status: 500 }
      )
    }

    return NextResponse.json({ task: updatedTask }, { status: 201 })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const { id: taskId } = await params
    const body = await request.json()
    const { subtaskId, completed, title } = body

    // Get current task
    const { data: task, error: fetchError } = await supabase
      .from('learner_tasks')
      .select('subtasks')
      .eq('id', taskId)
      .eq('learner_id', user.id)
      .single()

    if (fetchError || !task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    let subtasks: Subtask[] = Array.isArray(task.subtasks) ? task.subtasks : []
    
    // Find and update subtask
    const subtaskIndex = subtasks.findIndex(st => st.id === subtaskId)
    if (subtaskIndex === -1) {
      return NextResponse.json(
        { error: 'Subtask not found' },
        { status: 404 }
      )
    }

    if (completed !== undefined) {
      subtasks[subtaskIndex].completed = completed
    }
    if (title !== undefined) {
      subtasks[subtaskIndex].title = title
    }

    // Update task with modified subtasks
    const { data: updatedTask, error: updateError } = await supabase
      .from('learner_tasks')
      .update({
        subtasks,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('learner_id', user.id)
      .select(`
        *,
        course:courses(id, title)
      `)
      .single()

    if (updateError) {
      console.error('Error updating subtask:', updateError)
      return NextResponse.json(
        { error: 'Failed to update subtask' },
        { status: 500 }
      )
    }

    return NextResponse.json({ task: updatedTask })
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
    const { searchParams } = new URL(request.url)
    const subtaskId = searchParams.get('subtaskId')

    if (!subtaskId) {
      return NextResponse.json(
        { error: 'Subtask ID is required' },
        { status: 400 }
      )
    }

    // Get current task
    const { data: task, error: fetchError } = await supabase
      .from('learner_tasks')
      .select('subtasks')
      .eq('id', taskId)
      .eq('learner_id', user.id)
      .single()

    if (fetchError || !task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    let subtasks: Subtask[] = Array.isArray(task.subtasks) ? task.subtasks : []
    
    // Remove subtask
    subtasks = subtasks.filter(st => st.id !== subtaskId)

    // Update task with remaining subtasks
    const { data: updatedTask, error: updateError } = await supabase
      .from('learner_tasks')
      .update({
        subtasks,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('learner_id', user.id)
      .select(`
        *,
        course:courses(id, title)
      `)
      .single()

    if (updateError) {
      console.error('Error deleting subtask:', updateError)
      return NextResponse.json(
        { error: 'Failed to delete subtask' },
        { status: 500 }
      )
    }

    return NextResponse.json({ task: updatedTask })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

