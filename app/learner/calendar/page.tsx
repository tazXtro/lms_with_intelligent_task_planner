"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FullScreenCalendar } from "@/components/ui/fullscreen-calendar"
import { LearnerLayout } from "@/components/learner-layout"
import { createClient } from "@/utils/supabase/client"
import { format, parseISO } from "date-fns"

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
  subtasks?: any[]
  created_at?: string
  updated_at?: string
}

interface CalendarEvent {
  id: number
  name: string
  time: string
  datetime: string
}

interface CalendarData {
  day: Date
  events: CalendarEvent[]
}

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchTasks()
  }, [])

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

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "🔴 High Priority"
      case "medium":
        return "🟡 Medium Priority"
      case "low":
        return "🟢 Low Priority"
      default:
        return "Task"
    }
  }

  // Transform tasks to calendar events
  const calendarData: CalendarData[] = tasks
    .filter((task) => task.due_date) // Only include tasks with due dates
    .reduce((acc, task) => {
      const dueDate = parseISO(task.due_date!)
      
      // Find if we already have an entry for this date
      const existingEntry = acc.find((entry) => 
        format(entry.day, "yyyy-MM-dd") === format(dueDate, "yyyy-MM-dd")
      )

      const event: CalendarEvent = {
        id: parseInt(task.id.substring(0, 8), 16), // Convert UUID to number for event id
        name: task.title,
        time: getPriorityLabel(task.priority),
        datetime: task.due_date!,
      }

      if (existingEntry) {
        existingEntry.events.push(event)
      } else {
        acc.push({
          day: dueDate,
          events: [event],
        })
      }

      return acc
    }, [] as CalendarData[])

  const handleNewTask = () => {
    router.push('/learner/tasks')
  }

  if (loading) {
    return (
      <LearnerLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-main/30 border-t-main rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-foreground/70 font-base">Loading calendar...</p>
          </div>
        </div>
      </LearnerLayout>
    )
  }

  return (
    <LearnerLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background border-b-4 border-border">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-heading">Task Calendar</h1>
                <p className="text-sm text-foreground/70 mt-1 font-base">
                  View all your tasks organized by due date
                </p>
              </div>
              <div className="hidden md:block">
                <div className="flex items-center gap-4 text-xs font-base">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <span>High Priority</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span>Medium Priority</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span>Low Priority</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Calendar */}
        <main className="p-6">
          {tasks.filter((t) => t.due_date).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-16 h-16 bg-main/10 border-2 border-border rounded-base flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-main"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-heading mb-2">No tasks scheduled</h3>
              <p className="text-sm text-foreground/70 font-base mb-6">
                Create tasks with due dates to see them on your calendar
              </p>
              <button
                onClick={handleNewTask}
                className="px-6 py-3 bg-main text-main-foreground rounded-base border-2 border-border font-heading hover:-translate-y-1 transition-transform shadow-shadow"
              >
                Create Your First Task
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-secondary-background border-2 border-border rounded-base shadow-shadow">
              <FullScreenCalendar data={calendarData} onNewEvent={handleNewTask} />
            </div>
          )}
        </main>

        {/* Stats Footer */}
        {tasks.filter((t) => t.due_date).length > 0 && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-base">
                <div className="text-sm font-base text-blue-700 dark:text-blue-300 mb-1">
                  Total Tasks
                </div>
                <div className="text-3xl font-heading text-blue-900 dark:text-blue-100">
                  {tasks.filter((t) => t.due_date).length}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-200 dark:border-amber-800 rounded-base">
                <div className="text-sm font-base text-amber-700 dark:text-amber-300 mb-1">
                  In Progress
                </div>
                <div className="text-3xl font-heading text-amber-900 dark:text-amber-100">
                  {tasks.filter((t) => t.due_date && t.status === 'in-progress').length}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-base">
                <div className="text-sm font-base text-emerald-700 dark:text-emerald-300 mb-1">
                  Completed
                </div>
                <div className="text-3xl font-heading text-emerald-900 dark:text-emerald-100">
                  {tasks.filter((t) => t.due_date && t.status === 'completed').length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </LearnerLayout>
  )
}

