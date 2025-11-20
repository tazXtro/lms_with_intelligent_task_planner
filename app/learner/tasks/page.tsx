"use client"

import { useState, useEffect, DragEvent } from "react"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { NInput } from "@/components/ui/ninput"
import { NLabel } from "@/components/ui/nlabel"
import {
  Plus,
  BookOpen,
  Trash2,
  Sparkles,
  Clock,
  AlertCircle,
  CheckCircle2,
  Menu,
  X,
  LogOut,
  Settings,
  Brain,
  Calendar,
  GripVertical,
  ListTodo,
  Edit2,
  Check,
  Loader2,
  Timer,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { PomodoroTimer } from "@/components/pomodoro/PomodoroTimer"

interface Subtask {
  id: string
  title: string
  completed: boolean
  created_at: string
}

interface Task {
  id: string
  title: string
  description: string | null
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  due_date: string | null
  course_id: string | null
  course?: {
    id: string
    title: string
  } | null
  subtasks?: Subtask[]
  created_at?: string
  updated_at?: string
}

interface NewTaskForm {
  title: string
  description: string
  course_id: string
  priority: "low" | "medium" | "high"
  due_date: string
}

export default function TaskPlannerPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [newTask, setNewTask] = useState<NewTaskForm>({
    title: "",
    description: "",
    course_id: "",
    priority: "medium",
    due_date: "",
  })
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([])
  const [showAiSuggestions, setShowAiSuggestions] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [newSubtaskText, setNewSubtaskText] = useState<{ [taskId: string]: string }>({})
  const [editingSubtask, setEditingSubtask] = useState<{ taskId: string; subtaskId: string } | null>(null)
  const [editSubtaskText, setEditSubtaskText] = useState("")
  const [subtaskLoading, setSubtaskLoading] = useState<string | null>(null)
  const [pomodoroTaskId, setPomodoroTaskId] = useState<string | null>(null)
  const [pomodoroTaskTitle, setPomodoroTaskTitle] = useState<string>("") 
  const [pomodoroSettings, setPomodoroSettings] = useState<any>(null)
  const [isLoadingPomodoroSettings, setIsLoadingPomodoroSettings] = useState(false) 

  const supabase = createClient()

  // Fetch pomodoro settings before opening timer
  const loadPomodoroSettings = async () => {
    setIsLoadingPomodoroSettings(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoadingPomodoroSettings(false)
        return
      }

      const { data, error } = await supabase
        .from('pomodoro_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data && !error) {
        setPomodoroSettings(data)
      }
    } catch (error) {
      console.error('Error loading pomodoro settings:', error)
    } finally {
      setIsLoadingPomodoroSettings(false)
    }
  }

  // Fetch tasks from database
  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (!response.ok) throw new Error('Failed to fetch tasks')
      
      const data = await response.json()
      setTasks(data.tasks || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch enrolled courses for task assignment
  const fetchCourses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('enrollments')
        .select('course:courses(id, title)')
        .eq('learner_id', user.id)

      if (error) throw error
      
      const courseList = data?.map(e => e.course).filter(Boolean) || []
      setCourses(courseList)
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  useEffect(() => {
    fetchTasks()
    fetchCourses()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('learner_tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'learner_tasks',
        },
        () => {
          fetchTasks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        title: newTask.title,
          description: newTask.description || null,
          course_id: newTask.course_id || null,
          priority: newTask.priority,
          due_date: newTask.due_date || null,
          subtasks: [],
        }),
      })

      if (!response.ok) throw new Error('Failed to create task')

      const { task } = await response.json()
      setTasks([task, ...tasks])
      setNewTask({
        title: "",
        description: "",
        course_id: "",
        priority: "medium",
        due_date: "",
      })
      setShowNewTaskForm(false)
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Failed to create task. Please try again.')
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete task')

    setTasks(tasks.filter((t) => t.id !== id))
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Failed to delete task. Please try again.')
    }
  }

  const handleUpdateTaskStatus = async (id: string, newStatus: Task["status"]) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update task')

      const { task } = await response.json()
      setTasks(tasks.map((t) => (t.id === id ? task : t)))
    } catch (error) {
      console.error('Error updating task:', error)
      alert('Failed to update task. Please try again.')
    }
  }

  // Drag and Drop handlers with smooth floating effect
  const handleDragStart = (e: DragEvent<HTMLDivElement>, task: Task) => {
    // Set dragged task after a tiny delay to ensure smooth drag start
    requestAnimationFrame(() => {
      setDraggedTask(task)
    })
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>, status: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverColumn(status)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = async (e: DragEvent<HTMLDivElement>, newStatus: Task["status"]) => {
    e.preventDefault()
    setDragOverColumn(null)

    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null)
      return
    }

    await handleUpdateTaskStatus(draggedTask.id, newStatus)
    setDraggedTask(null)
  }

  const handleGenerateAiSuggestions = async (task: Task) => {
    setSelectedTask(task)
    setShowAiSuggestions(true)
    setAiLoading(true)
    setAiError(null)
    setAiSuggestions([])

    try {
      const response = await fetch("/api/ai/task-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task,
          allTasks: tasks,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate suggestions")
      }

      const data = await response.json()
      
      if (data.success && data.suggestions) {
        setAiSuggestions(data.suggestions)
      } else {
        throw new Error("Invalid response from AI")
      }
    } catch (error) {
      console.error("Error generating AI suggestions:", error)
      setAiError(error instanceof Error ? error.message : "Failed to generate AI suggestions")
      
      // Fallback to basic suggestions
      setAiSuggestions([
        {
          type: "error",
          title: "AI Unavailable",
          content: `Unable to generate AI suggestions. Please check your API configuration.`,
        },
      ])
    } finally {
      setAiLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  // Subtask Management Functions
  const handleAddSubtask = async (taskId: string, text?: string) => {
    const subtaskText = text?.trim() || newSubtaskText[taskId]?.trim()
    if (!subtaskText) return

    setSubtaskLoading(taskId)
    
    // Clear the text immediately to prevent re-render issues
    setNewSubtaskText({ ...newSubtaskText, [taskId]: '' })
    
    try {
      const response = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: subtaskText }),
      })

      if (!response.ok) throw new Error('Failed to add subtask')

      const { task } = await response.json()
      setTasks(tasks.map((t) => (t.id === taskId ? task : t)))
    } catch (error) {
      console.error('Error adding subtask:', error)
      alert('Failed to add subtask. Please try again.')
    } finally {
      setSubtaskLoading(null)
    }
  }

  const handleToggleSubtask = async (taskId: string, subtaskId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subtaskId, completed }),
      })

      if (!response.ok) throw new Error('Failed to update subtask')

      const { task } = await response.json()
      setTasks(tasks.map((t) => (t.id === taskId ? task : t)))

      // Check if all subtasks are completed
      if (task.subtasks && task.subtasks.length > 0) {
        const allCompleted = task.subtasks.every((st: Subtask) => st.completed)
        if (allCompleted && task.status === 'in-progress') {
          // Show suggestion to complete task
          if (confirm('🎉 All subtasks completed! Would you like to mark this task as completed?')) {
            await handleUpdateTaskStatus(taskId, 'completed')
          }
        }
      }
    } catch (error) {
      console.error('Error toggling subtask:', error)
      alert('Failed to update subtask. Please try again.')
    }
  }

  const handleDeleteSubtask = async (taskId: string, subtaskId: string) => {
    if (!confirm('Delete this subtask?')) return

    try {
      const response = await fetch(`/api/tasks/${taskId}/subtasks?subtaskId=${subtaskId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete subtask')

      const { task } = await response.json()
      setTasks(tasks.map((t) => (t.id === taskId ? task : t)))
    } catch (error) {
      console.error('Error deleting subtask:', error)
      alert('Failed to delete subtask. Please try again.')
    }
  }

  const handleEditSubtask = async (taskId: string, subtaskId: string) => {
    if (!editSubtaskText.trim()) {
      setEditingSubtask(null)
      return
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subtaskId, title: editSubtaskText.trim() }),
      })

      if (!response.ok) throw new Error('Failed to edit subtask')

      const { task } = await response.json()
      setTasks(tasks.map((t) => (t.id === taskId ? task : t)))
      setEditingSubtask(null)
      setEditSubtaskText('')
    } catch (error) {
      console.error('Error editing subtask:', error)
      alert('Failed to edit subtask. Please try again.')
    }
  }

  const handleAddAiSubtasks = async (taskId: string, aiSubtasks: string[]) => {
    if (!aiSubtasks || aiSubtasks.length === 0) return

    setSubtaskLoading(taskId)
    try {
      const response = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subtasks: aiSubtasks }),
      })

      if (!response.ok) throw new Error('Failed to add AI subtasks')

      const { task } = await response.json()
      setTasks(tasks.map((t) => (t.id === taskId ? task : t)))
      setShowAiSuggestions(false)
      alert(`✨ Added ${aiSubtasks.length} subtasks from AI suggestions!`)
    } catch (error) {
      console.error('Error adding AI subtasks:', error)
      alert('Failed to add AI subtasks. Please try again.')
    } finally {
      setSubtaskLoading(null)
    }
  }

  const getSubtaskProgress = (task: Task) => {
    if (!task.subtasks || task.subtasks.length === 0) return null
    const completed = task.subtasks.filter((st) => st.completed).length
    const total = task.subtasks.length
    const percentage = Math.round((completed / total) * 100)
    return { completed, total, percentage }
  }

  const todoTasks = tasks.filter((t) => t.status === "todo")
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress")
  const completedTasks = tasks.filter((t) => t.status === "completed")

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-gradient-to-r from-rose-100 to-red-100 dark:from-rose-900/40 dark:to-red-900/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700"
      case "medium":
        return "bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700"
      case "low":
        return "bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800/40 dark:to-gray-800/40 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600"
      default:
        return "bg-foreground/10 text-foreground border-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-success" />
      case "in-progress":
        return <Clock className="w-5 h-5 text-main" />
      default:
        return <AlertCircle className="w-5 h-5 text-foreground/50" />
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const TaskCard = ({ task, draggable = true }: { task: Task; draggable?: boolean }) => {
    const subtasks = task.subtasks || []
    const progress = getSubtaskProgress(task)
    const isExpanded = expandedTaskId === task.id
    const isDragging = draggedTask?.id === task.id

    // Modern color schemes based on status
    const getCardStyle = () => {
      switch (task.status) {
        case 'in-progress':
          return 'bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-900/40 dark:via-indigo-900/40 dark:to-purple-900/40 border-2 border-blue-300 dark:border-blue-600/70 shadow-blue-200/50 dark:shadow-blue-900/30 ring-2 ring-blue-400/20 dark:ring-blue-500/20'
        case 'completed':
          return 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800/50 opacity-80'
        default:
          return 'bg-white dark:bg-secondary-background border-border'
      }
    }

    return (
      <NCard
        key={task.id}
        className={`p-5 group relative overflow-hidden transition-all duration-150 backdrop-blur-sm select-none ${
          getCardStyle()
        } ${
          isDragging ? 'opacity-50 scale-[0.97]' : task.status === 'in-progress' ? 'hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-300/40 dark:hover:shadow-blue-900/40' : 'hover:-translate-y-1 hover:shadow-xl'
        } ${draggable ? 'cursor-grab active:cursor-grabbing touch-none' : ''}`}
        draggable={draggable}
        onDragStart={(e) => draggable && handleDragStart(e, task)}
        onDragEnd={() => setDraggedTask(null)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            {draggable && (
              <div className="group-hover:text-foreground/70 transition-all duration-200 group-hover:scale-110">
                <GripVertical className="w-5 h-5 text-foreground/30 flex-shrink-0 mt-1 group-hover:text-main" />
              </div>
            )}
            <div className={`flex-shrink-0 transition-transform duration-200 ${
              !isDragging && 'group-hover:scale-110'
            }`}>
              {getStatusIcon(task.status)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`font-heading text-lg line-clamp-2 transition-colors ${
                task.status === 'completed' ? 'line-through text-foreground/70' : ''
              }`}>
                {task.title}
              </h4>
              {task.course && (
                <p className="text-xs text-foreground/70 mt-1 font-base flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span className="truncate">{task.course.title}</span>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => handleDeleteTask(task.id)}
            className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 hover:bg-destructive/10 hover:scale-110 rounded-base flex-shrink-0"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </button>
        </div>

        {task.description && (
          <p className="text-sm text-foreground/70 mb-4 font-base">{task.description}</p>
        )}

        <div className="flex items-center justify-between mb-4 gap-2">
          <span
            className={`text-xs font-heading px-3 py-1.5 rounded-lg border transition-all hover:scale-105 hover:shadow-md ${getPriorityColor(task.priority)}`}
          >
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          {task.due_date && (
            <span className="text-xs text-slate-600 dark:text-slate-400 font-base flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800/50 dark:to-gray-800/50 border border-slate-200 dark:border-slate-700">
              <Calendar className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">{formatDate(task.due_date)}</span>
            </span>
          )}
        </div>

        {/* Subtasks Section */}
        {task.status !== 'completed' && (
          <div className="mb-4">
            {/* Subtask Header with Progress */}
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                className="flex items-center gap-2 text-xs font-heading text-foreground/80 hover:text-foreground transition-all duration-200 hover:gap-3"
              >
                <ListTodo className="w-4 h-4" />
                <span>
                  Subtasks {progress && `(${progress.completed}/${progress.total})`}
                </span>
              </button>
              {progress && progress.total > 0 && (
                <span className="text-xs text-foreground/60 font-heading tabular-nums">{progress.percentage}%</span>
              )}
            </div>

            {/* Progress Bar */}
            {progress && progress.total > 0 && (
              <div className="w-full h-2.5 bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 rounded-full overflow-hidden mb-3 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ width: `${progress.percentage}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                </div>
              </div>
            )}

            {/* Expanded Subtasks View */}
            {isExpanded && (
              <div className="space-y-2 mt-3">
                {/* Existing Subtasks */}
                {subtasks.map((subtask) => (
                  <div key={subtask.id} className="group/subtask">
                    {editingSubtask?.subtaskId === subtask.id ? (
                      // Edit Mode
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editSubtaskText}
                          onChange={(e) => setEditSubtaskText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditSubtask(task.id, subtask.id)
                            if (e.key === 'Escape') setEditingSubtask(null)
                          }}
                          className="flex-1 px-2 py-1 text-xs border-2 border-main rounded-base focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleEditSubtask(task.id, subtask.id)}
                          className="p-1 hover:bg-main/10 rounded-base"
                        >
                          <Check className="w-3 h-3 text-main" />
                        </button>
                        <button
                          onClick={() => setEditingSubtask(null)}
                          className="p-1 hover:bg-destructive/10 rounded-base"
                        >
                          <X className="w-3 h-3 text-destructive" />
                        </button>
                      </div>
                    ) : (
                      // View Mode
                      <label className={`flex items-center gap-2 p-2 rounded-base transition-colors ${
                        task.status === 'in-progress' ? 'hover:bg-main/10 cursor-pointer' : 'cursor-default'
                      }`}>
                        <input
                          type="checkbox"
                          checked={subtask.completed}
                          onChange={(e) => task.status === 'in-progress' && handleToggleSubtask(task.id, subtask.id, e.target.checked)}
                          disabled={task.status !== 'in-progress'}
                          className="rounded w-4 h-4 border-2 border-border text-main focus:ring-main flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className={`flex-1 text-xs font-base ${
                          subtask.completed ? 'line-through text-foreground/50' : ''
                        }`}>
                          {subtask.title}
                        </span>
                        {task.status === 'in-progress' && (
                          <div className="opacity-0 group-hover/subtask:opacity-100 flex gap-1">
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                setEditingSubtask({ taskId: task.id, subtaskId: subtask.id })
                                setEditSubtaskText(subtask.title)
                              }}
                              className="p-1 hover:bg-accent/10 rounded-base transition-colors"
                            >
                              <Edit2 className="w-3 h-3 text-accent" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                handleDeleteSubtask(task.id, subtask.id)
                              }}
                              className="p-1 hover:bg-destructive/10 rounded-base transition-colors"
                            >
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </button>
                          </div>
                        )}
                      </label>
                    )}
                  </div>
                ))}

                {/* Add New Subtask */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t-2 border-border">
                  <input
                    key={`subtask-input-${task.id}`}
                    type="text"
                    placeholder="Add a subtask..."
                    defaultValue=""
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.currentTarget
                        const text = input.value.trim()
                        if (text) {
                          handleAddSubtask(task.id, text)
                          input.value = ''
                        }
                      }
                    }}
                    className="flex-1 px-3 py-2 text-xs border-2 border-border rounded-base focus:outline-none focus:border-main transition-colors bg-background"
                    disabled={subtaskLoading === task.id}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      const text = input.value.trim()
                      if (text) {
                        handleAddSubtask(task.id, text)
                        input.value = ''
                      }
                    }}
                    disabled={subtaskLoading === task.id}
                    className="p-2 bg-main text-main-foreground rounded-base border-2 border-border hover:translate-x-0.5 hover:translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {subtaskLoading === task.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Collapsed Subtask Summary for Completed Tasks */}
        {task.status === 'completed' && subtasks.length > 0 && (
          <div className="mb-4 text-xs font-base p-3 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 rounded-base border-2 border-emerald-200 dark:border-emerald-800/50 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-heading text-emerald-700 dark:text-emerald-300">{subtasks.length} subtask{subtasks.length !== 1 ? 's' : ''} completed</span>
          </div>
        )}

        {/* Action Buttons */}
        {task.status !== 'completed' && (
          <div className="flex gap-2">
            {task.status === 'todo' && (
              <>
                <NButton
                  onClick={() => handleUpdateTaskStatus(task.id, "in-progress")}
                  variant="noShadow"
                  size="sm"
                  className="flex-1"
                >
                  Start
                </NButton>
                <NButton
                  onClick={() => handleGenerateAiSuggestions(task)}
                  variant="accent"
                  size="sm"
                  className="flex-1"
                >
                  <Sparkles className="w-3 h-3" />
                  AI
                </NButton>
              </>
            )}
            {task.status === 'in-progress' && (
              <>
                <NButton
                  onClick={() => {
                    setPomodoroTaskId(task.id)
                    setPomodoroTaskTitle(task.title)
                  }}
                  variant="noShadow"
                  size="sm"
                  className="flex-1"
                >
                  <Timer className="w-4 h-4 mr-1" />
                  Focus
                </NButton>
                <NButton
                  onClick={() => handleUpdateTaskStatus(task.id, "completed")}
                  variant="accent"
                  size="sm"
                  className="flex-1"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Complete
                </NButton>
              </>
            )}
          </div>
        )}
      </NCard>
    )
  }

  const ColumnDropZone = ({
    title,
    status,
    tasks: columnTasks,
    color,
    icon: Icon,
  }: {
    title: string
    status: Task["status"]
    tasks: Task[]
    color: string
    icon: any
  }) => {
    const isDragOver = dragOverColumn === status

    return (
      <div
        onDragOver={(e) => handleDragOver(e, status)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, status)}
        className={`transition-all duration-300 ${isDragOver ? 'scale-[1.03] -translate-y-1' : ''}`}
      >
        {/* Column Header */}
        <div className={`mb-5 p-4 rounded-xl border-2 bg-gradient-to-br from-white to-gray-50 dark:from-secondary-background dark:to-background backdrop-blur-sm ${
          isDragOver ? 'border-blue-500 dark:border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 shadow-2xl shadow-blue-500/30 scale-[1.02] ring-4 ring-blue-400/30' : 'border-gray-200 dark:border-border'
        } transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${color} ${status === 'in-progress' ? 'animate-pulse' : ''} shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-heading text-gray-800 dark:text-gray-100">{title}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-base">{columnTasks.length} task{columnTasks.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center text-white font-heading text-sm shadow-lg`}>
              {columnTasks.length}
            </div>
          </div>
        </div>

        {/* Drop Zone */}
        <div className={`space-y-3 min-h-[400px] p-4 rounded-xl border-2 border-dashed transition-all duration-300 ${
          isDragOver 
            ? 'border-blue-500 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 shadow-inner shadow-blue-500/20 scale-[1.01]' 
            : 'border-transparent bg-transparent'
        }`}>
          {columnTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          
          {/* Empty State */}
          {columnTasks.length === 0 && (
            <div className={`text-center py-16 px-4 rounded-lg transition-all duration-300 ${
              isDragOver ? 'bg-main/10 border-2 border-dashed border-main' : 'bg-secondary-background/30'
            }`}>
              <div className="mb-3">
                <Icon className={`w-12 h-12 mx-auto ${isDragOver ? 'text-main' : 'text-foreground/30'} transition-colors`} />
              </div>
              <p className="text-sm font-heading text-foreground/70">
                {isDragOver ? 'Drop task here' : 'No tasks yet'}
              </p>
              <p className="text-xs text-foreground/50 mt-2 font-base">
                {isDragOver ? 'Release to move task' : 'Drag tasks here or create a new one'}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-main/30 border-t-main rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground/70 font-base">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-secondary-background border-r-4 border-border transform transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b-2 border-border">
          <Link href="/" className="flex items-center gap-3 hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 bg-main border-2 border-border rounded-base flex items-center justify-center shadow-shadow">
              <Brain className="w-6 h-6 text-main-foreground" />
            </div>
            <span className="font-heading text-xl">DigiGyan</span>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            href="/learner/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-base text-foreground hover:bg-main/5 transition-colors font-base"
          >
            <BookOpen className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            href="/learner/tasks"
            className="flex items-center gap-3 px-4 py-3 rounded-base bg-main/10 border-2 border-border text-foreground font-heading"
          >
            <Clock className="w-5 h-5" />
            Task Planner
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t-2 border-border space-y-2">
          <Link
            href="/learner/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-base text-foreground hover:bg-main/5 transition-colors font-base"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-base text-foreground hover:bg-destructive/10 transition-colors font-base"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background border-b-4 border-border">
          <div className="px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-main/10 rounded-base transition-colors border-2 border-border"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="text-3xl font-heading">Task Planner</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/learner/productivity">
                <NButton variant="neutral" size="lg">
                  <Timer className="w-5 h-5 mr-2" />
                  Productivity
                </NButton>
              </Link>
              <NButton
                onClick={() => setShowNewTaskForm(true)}
                variant="default"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Task
              </NButton>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {/* AI Suggestions Panel */}
          {showAiSuggestions && selectedTask && (
            <NCard className="mb-8 p-8 bg-main/5 border-main/20">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-main border-2 border-border rounded-base flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-main-foreground" />
                  </div>
                  <h3 className="font-heading text-2xl">AI Suggestions for "{selectedTask.title}"</h3>
                </div>
                <button
                  onClick={() => setShowAiSuggestions(false)}
                  className="p-2 hover:bg-destructive/10 rounded-base border-2 border-transparent hover:border-border transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-16 h-16 border-4 border-main/30 border-t-main rounded-full animate-spin"></div>
                  <p className="text-sm text-foreground/70 font-base">Analyzing task and generating suggestions...</p>
                </div>
              ) : aiError ? (
                <div className="p-6 bg-destructive/10 border-2 border-destructive rounded-base">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-heading text-lg mb-2">Error</h4>
                      <p className="text-sm font-base text-foreground/80">{aiError}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {aiSuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="p-5 bg-secondary-background border-2 border-border rounded-base hover:translate-x-1 transition-transform"
                    >
                      <div className="flex items-start gap-4">
                        <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          {suggestion.title && (
                            <h4 className="font-heading text-lg mb-2">{suggestion.title}</h4>
                          )}
                          <p className="text-sm font-base text-foreground/90 whitespace-pre-wrap">
                            {suggestion.content}
                          </p>
                          {suggestion.subtasks && suggestion.subtasks.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {suggestion.subtasks.map((subtask: string, subIdx: number) => (
                                <div
                                  key={subIdx}
                                  className="flex items-start gap-2 p-2 bg-main/5 rounded-base text-sm font-base"
                                >
                                  <span className="text-main font-heading">{subIdx + 1}.</span>
                                  <span>{subtask}</span>
                                </div>
                              ))}
                              {/* Add AI Subtasks Button */}
                              <div className="mt-4 pt-3 border-t-2 border-border">
                                <NButton
                                  onClick={() => selectedTask && handleAddAiSubtasks(selectedTask.id, suggestion.subtasks)}
                                  disabled={subtaskLoading === selectedTask?.id}
                                  variant="default"
                                  size="sm"
                                  className="w-full"
                                >
                                  {subtaskLoading === selectedTask?.id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Adding Subtasks...
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-4 h-4 mr-2" />
                                      Add These {suggestion.subtasks.length} Subtasks
                                    </>
                                  )}
                                </NButton>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </NCard>
          )}

          {/* New Task Form */}
          {showNewTaskForm && (
            <NCard className="mb-8 p-8 border-main/20">
              <h3 className="font-heading text-2xl mb-5">Create New Task</h3>
              <div className="space-y-5">
                <div>
                  <NLabel className="mb-2">Task Title *</NLabel>
                  <NInput
                    placeholder="Enter task title..."
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                <div>
                  <NLabel className="mb-2">Description</NLabel>
                  <textarea
                    className="w-full px-5 py-3 rounded-base border-2 border-border bg-background font-base text-sm focus:outline-none focus:border-main transition-colors"
                    placeholder="Enter task description..."
                    rows={3}
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <NLabel className="mb-2">Course (Optional)</NLabel>
                    <select
                      className="w-full px-5 py-3 rounded-base border-2 border-border bg-background font-base text-sm focus:outline-none focus:border-main transition-colors"
                      value={newTask.course_id}
                      onChange={(e) => setNewTask({ ...newTask, course_id: e.target.value })}
                    >
                      <option value="">No course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <NLabel className="mb-2">Priority</NLabel>
                    <select
                      className="w-full px-5 py-3 rounded-base border-2 border-border bg-background font-base text-sm focus:outline-none focus:border-main transition-colors"
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <NLabel className="mb-2">Due Date (Optional)</NLabel>
                  <NInput
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
                <div className="flex gap-3">
                  <NButton onClick={handleAddTask} variant="default">
                    Create Task
                  </NButton>
                  <NButton onClick={() => setShowNewTaskForm(false)} variant="neutral">
                    Cancel
                  </NButton>
                </div>
              </div>
            </NCard>
          )}

          {/* Kanban Board */}
          <div className="grid md:grid-cols-3 gap-8">
            <ColumnDropZone
              title="To Do"
              status="todo"
              tasks={todoTasks}
              color="bg-gradient-to-br from-slate-600 to-gray-700"
              icon={AlertCircle}
            />
            <ColumnDropZone
              title="In Progress"
              status="in-progress"
              tasks={inProgressTasks}
              color="bg-gradient-to-br from-indigo-600 to-blue-600"
              icon={Clock}
            />
            <ColumnDropZone
              title="Completed"
              status="completed"
              tasks={completedTasks}
              color="bg-gradient-to-br from-emerald-600 to-teal-600"
              icon={CheckCircle2}
            />
          </div>
        </main>
      </div>

      {/* Pomodoro Timer Modal */}
      {pomodoroTaskId && !isLoadingPomodoroSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <PomodoroTimer
            taskId={pomodoroTaskId}
            taskTitle={pomodoroTaskTitle}
            initialSettings={pomodoroSettings}
            onClose={() => {
              setPomodoroTaskId(null)
              setPomodoroTaskTitle("")
              setPomodoroSettings(null)
            }}
          />
        </div>
      )}
    </div>
  )
}


