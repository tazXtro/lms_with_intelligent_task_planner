"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
    // Simulate AI generating task breakdowns
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
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "medium":
        return "bg-accent/10 text-accent border-accent/20"
      case "low":
        return "bg-primary/10 text-primary border-primary/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-accent" />
      case "in-progress":
        return <Clock className="w-5 h-5 text-primary" />
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">DigiGyan</span>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            href="/learner/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/10 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            href="/learner/tasks"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium"
          >
            <Clock className="w-5 h-5" />
            Task Planner
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border space-y-2">
          <Link
            href="/learner/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/10 transition-colors"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-destructive/10 transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background border-b border-border">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-2xl font-bold">Task Planner</h1>
            <Button
              onClick={() => setShowNewTaskForm(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {/* AI Suggestions Panel */}
          {showAiSuggestions && selectedTask && (
            <Card className="mb-6 p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">AI Suggestions for "{selectedTask.title}"</h3>
                </div>
                <button
                  onClick={() => setShowAiSuggestions(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                {aiSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                    <Sparkles className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{suggestion}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* New Task Form */}
          {showNewTaskForm && (
            <Card className="mb-6 p-6 border-primary/20">
              <h3 className="font-semibold text-lg mb-4">Create New Task</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Task Title</label>
                  <Input
                    placeholder="Enter task title..."
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Course</label>
                  <Input
                    placeholder="Select or enter course..."
                    value={newTask.course}
                    onChange={(e) => setNewTask({ ...newTask, course: e.target.value })}
                    className="bg-background"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddTask} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Create Task
                  </Button>
                  <Button onClick={() => setShowNewTaskForm(false)} variant="outline" className="bg-transparent">
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Kanban Board */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* To Do Column */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">To Do ({todoTasks.length})</h2>
                <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
              </div>
              <div className="space-y-3">
                {todoTasks.map((task) => (
                  <Card key={task.id} className="p-4 hover:shadow-md transition-shadow cursor-move group" draggable>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-2 flex-1">
                        {getStatusIcon(task.status)}
                        <div className="flex-1">
                          <h4 className="font-medium line-clamp-2">{task.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{task.course}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>

                    {task.description && <p className="text-sm text-muted-foreground mb-3">{task.description}</p>}

                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded border ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                    </div>

                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="mb-3 text-xs text-muted-foreground">Subtasks: {task.subtasks.length}</div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateTaskStatus(task.id, "in-progress")}
                        className="flex-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                      >
                        Start
                      </button>
                      <button
                        onClick={() => handleGenerateAiSuggestions(task)}
                        className="flex-1 px-2 py-1 text-xs bg-accent/10 text-accent rounded hover:bg-accent/20 transition-colors flex items-center justify-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        AI Help
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* In Progress Column */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">In Progress ({inProgressTasks.length})</h2>
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-3">
                {inProgressTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-move group border-primary/20 bg-primary/5"
                    draggable
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-2 flex-1">
                        {getStatusIcon(task.status)}
                        <div className="flex-1">
                          <h4 className="font-medium line-clamp-2">{task.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{task.course}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>

                    {task.description && <p className="text-sm text-muted-foreground mb-3">{task.description}</p>}

                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded border ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                    </div>

                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs text-muted-foreground mb-2">Subtasks: {task.subtasks.length}</div>
                        <div className="space-y-1">
                          {task.subtasks.map((subtask, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <input type="checkbox" className="rounded" />
                              <span>{subtask}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateTaskStatus(task.id, "completed")}
                        className="flex-1 px-2 py-1 text-xs bg-accent/10 text-accent rounded hover:bg-accent/20 transition-colors"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleGenerateAiSuggestions(task)}
                        className="flex-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        AI Help
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Completed Column */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Completed ({completedTasks.length})</h2>
                <div className="w-3 h-3 bg-accent rounded-full"></div>
              </div>
              <div className="space-y-3">
                {completedTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-move group opacity-75 bg-accent/5"
                    draggable
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-2 flex-1">
                        {getStatusIcon(task.status)}
                        <div className="flex-1">
                          <h4 className="font-medium line-clamp-2 line-through text-muted-foreground">{task.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{task.course}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded border ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
