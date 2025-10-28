"use client"

import { useState } from "react"
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
} from "lucide-react"
import Link from "next/link"

interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate: string
  course: string
  subtasks?: string[]
}

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Complete React Hooks Module",
    description: "Learn and practice React Hooks patterns",
    status: "in-progress",
    priority: "high",
    dueDate: "2025-10-25",
    course: "Advanced React Patterns",
    subtasks: ["Watch video lectures", "Complete exercises", "Build mini project"],
  },
  {
    id: "2",
    title: "Data Science Assignment 3",
    description: "Analyze dataset and create visualizations",
    status: "todo",
    priority: "high",
    dueDate: "2025-10-28",
    course: "Python for Data Science",
    subtasks: ["Load dataset", "Exploratory analysis", "Create visualizations"],
  },
  {
    id: "3",
    title: "Design System Documentation",
    description: "Document UI components and design tokens",
    status: "todo",
    priority: "medium",
    dueDate: "2025-11-02",
    course: "UI/UX Design Masterclass",
  },
  {
    id: "4",
    title: "Review CSS Flexbox",
    description: "Refresh CSS Flexbox concepts",
    status: "completed",
    priority: "low",
    dueDate: "2025-10-20",
    course: "Web Development",
  },
]

export default function TaskPlannerPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [newTask, setNewTask] = useState({ title: "", course: "" })
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [showAiSuggestions, setShowAiSuggestions] = useState(false)

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        description: "",
        status: "todo",
        priority: "medium",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        course: newTask.course || "General",
      }
      setTasks([...tasks, task])
      setNewTask({ title: "", course: "" })
      setShowNewTaskForm(false)
    }
  }

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  const handleUpdateTaskStatus = (id: string, newStatus: Task["status"]) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t)))
  }

  const handleGenerateAiSuggestions = (task: Task) => {
    const suggestions = [
      `Break "${task.title}" into 3-4 manageable subtasks`,
      `Suggest optimal study schedule: 2 hours daily for 3 days`,
      `Identify prerequisites: Review ${task.course} fundamentals first`,
      `Recommend resources: Video tutorials, practice exercises, peer review`,
    ]
    setAiSuggestions(suggestions)
    setShowAiSuggestions(true)
    setSelectedTask(task)
  }

  const todoTasks = tasks.filter((t) => t.status === "todo")
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress")
  const completedTasks = tasks.filter((t) => t.status === "completed")

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/20 text-destructive border-destructive"
      case "medium":
        return "bg-accent/20 text-accent border-accent"
      case "low":
        return "bg-main/20 text-main border-main"
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
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-base text-foreground hover:bg-destructive/10 transition-colors font-base">
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
            <NButton
              onClick={() => setShowNewTaskForm(true)}
              variant="default"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Task
            </NButton>
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
              <div className="grid gap-4">
                {aiSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-secondary-background border-2 border-border rounded-base">
                    <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-base">{suggestion}</p>
                  </div>
                ))}
              </div>
            </NCard>
          )}

          {/* New Task Form */}
          {showNewTaskForm && (
            <NCard className="mb-8 p-8 border-main/20">
              <h3 className="font-heading text-2xl mb-5">Create New Task</h3>
              <div className="space-y-5">
                <div>
                  <NLabel className="mb-2">Task Title</NLabel>
                  <NInput
                    placeholder="Enter task title..."
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                <div>
                  <NLabel className="mb-2">Course</NLabel>
                  <NInput
                    placeholder="Select or enter course..."
                    value={newTask.course}
                    onChange={(e) => setNewTask({ ...newTask, course: e.target.value })}
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
          <div className="grid md:grid-cols-3 gap-6">
            {/* To Do Column */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-heading">To Do ({todoTasks.length})</h2>
                <div className="w-4 h-4 bg-foreground/50 rounded-full"></div>
              </div>
              <div className="space-y-4">
                {todoTasks.map((task) => (
                  <NCard key={task.id} className="p-5 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-move group" draggable>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(task.status)}
                        <div className="flex-1">
                          <h4 className="font-heading text-lg line-clamp-2">{task.title}</h4>
                          <p className="text-xs text-foreground/70 mt-1 font-base">{task.course}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/10 rounded-base"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>

                    {task.description && <p className="text-sm text-foreground/70 mb-4 font-base">{task.description}</p>}

                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`text-xs font-heading px-3 py-1 rounded-base border-2 ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                      <span className="text-xs text-foreground/70 font-base">{task.dueDate}</span>
                    </div>

                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="mb-4 text-xs text-foreground/70 font-base p-2 bg-main/5 rounded-base border-2 border-border">
                        Subtasks: {task.subtasks.length}
                      </div>
                    )}

                    <div className="flex gap-2">
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
                    </div>
                  </NCard>
                ))}
              </div>
            </div>

            {/* In Progress Column */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-heading">In Progress ({inProgressTasks.length})</h2>
                <div className="w-4 h-4 bg-main rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-4">
                {inProgressTasks.map((task) => (
                  <NCard
                    key={task.id}
                    className="p-5 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-move group border-main/30 bg-main/5"
                    draggable
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(task.status)}
                        <div className="flex-1">
                          <h4 className="font-heading text-lg line-clamp-2">{task.title}</h4>
                          <p className="text-xs text-foreground/70 mt-1 font-base">{task.course}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/10 rounded-base"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>

                    {task.description && <p className="text-sm text-foreground/70 mb-4 font-base">{task.description}</p>}

                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`text-xs font-heading px-3 py-1 rounded-base border-2 ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                      <span className="text-xs text-foreground/70 font-base">{task.dueDate}</span>
                    </div>

                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs text-foreground/70 mb-2 font-heading">Subtasks: {task.subtasks.length}</div>
                        <div className="space-y-2">
                          {task.subtasks.map((subtask, idx) => (
                            <label key={idx} className="flex items-center gap-2 text-xs font-base p-2 rounded-base hover:bg-main/10 cursor-pointer">
                              <input type="checkbox" className="rounded w-4 h-4" />
                              <span>{subtask}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <NButton
                        onClick={() => handleUpdateTaskStatus(task.id, "completed")}
                        variant="accent"
                        size="sm"
                        className="flex-1"
                      >
                        Complete
                      </NButton>
                      <NButton
                        onClick={() => handleGenerateAiSuggestions(task)}
                        variant="noShadow"
                        size="sm"
                        className="flex-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        AI
                      </NButton>
                    </div>
                  </NCard>
                ))}
              </div>
            </div>

            {/* Completed Column */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-heading">Completed ({completedTasks.length})</h2>
                <div className="w-4 h-4 bg-success rounded-full"></div>
              </div>
              <div className="space-y-4">
                {completedTasks.map((task) => (
                  <NCard
                    key={task.id}
                    className="p-5 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-move group opacity-75 bg-success/5"
                    draggable
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(task.status)}
                        <div className="flex-1">
                          <h4 className="font-heading text-lg line-clamp-2 line-through text-foreground/70">{task.title}</h4>
                          <p className="text-xs text-foreground/70 mt-1 font-base">{task.course}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/10 rounded-base"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-heading px-3 py-1 rounded-base border-2 ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                      <span className="text-xs text-foreground/70 font-base">{task.dueDate}</span>
                    </div>
                  </NCard>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
