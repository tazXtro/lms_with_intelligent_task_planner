"use client"

import { useState, useEffect } from "react"
import { LearnerLayout } from "@/components/learner-layout"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { 
  Calendar, 
  Filter,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Download
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"

interface CanvasAssignment {
  id: string
  name: string
  description: string
  due_at: string | null
  canvas_course_id: string
  html_url: string
  has_submitted: boolean
  points_possible: number
  grade: string | null
  score: number | null
  synced_to_task: boolean
  canvas_courses?: {
    name: string
    course_code: string
  }
}

interface CanvasCourse {
  canvas_course_id: string
  name: string
  course_code: string
}

export default function CanvasAssignmentsPage() {
  const [assignments, setAssignments] = useState<CanvasAssignment[]>([])
  const [courses, setCourses] = useState<CanvasCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  
  // Filters
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all") // all, upcoming, past
  const [submittedFilter, setSubmittedFilter] = useState<string>("all") // all, submitted, not-submitted
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchData()
  }, [selectedCourse, statusFilter, submittedFilter])

  // Real-time subscription for canvas_assignments updates
  useEffect(() => {
    const supabase = createClient()
    
    // Subscribe to changes in canvas_assignments table
    const channel = supabase
      .channel('canvas_assignments_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'canvas_assignments'
        },
        (payload) => {
          console.log('Canvas assignment changed:', payload)
          // Refresh data when any assignment is updated
          fetchData()
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedCourse, statusFilter, submittedFilter])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch courses
      const coursesRes = await fetch('/api/canvas/courses')
      const coursesData = await coursesRes.json()
      setCourses(coursesData.courses || [])

      // Fetch assignments with filters
      const params = new URLSearchParams()
      if (selectedCourse !== 'all') params.append('courseId', selectedCourse)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (submittedFilter !== 'all') {
        params.append('submitted', submittedFilter === 'submitted' ? 'true' : 'false')
      }

      const assignmentsRes = await fetch(`/api/canvas/assignments?${params.toString()}`)
      const assignmentsData = await assignmentsRes.json()
      setAssignments(assignmentsData.assignments || [])
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSyncToTasks = async (assignmentIds?: string[]) => {
    setSyncing(true)
    try {
      const response = await fetch('/api/canvas/assignments/sync-to-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentIds,
          syncAll: !assignmentIds,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(`✅ ${data.synced} assignment(s) synced to Task Planner!`)
        await fetchData()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      console.error('Error syncing to tasks:', error)
      alert('❌ Failed to sync assignments')
    } finally {
      setSyncing(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    let urgency = ''
    if (diffDays < 0) urgency = 'overdue'
    else if (diffDays === 0) urgency = 'today'
    else if (diffDays === 1) urgency = 'tomorrow'
    else if (diffDays <= 3) urgency = 'soon'

    const formatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    })

    return { formatted, urgency, diffDays }
  }

  const filteredAssignments = assignments.filter(assignment => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        assignment.name.toLowerCase().includes(query) ||
        assignment.canvas_courses?.name.toLowerCase().includes(query)
      )
    }
    return true
  })

  const getDueDateColor = (urgency: string) => {
    switch (urgency) {
      case 'overdue': return 'text-destructive'
      case 'today': return 'text-amber-600'
      case 'tomorrow': return 'text-amber-500'
      case 'soon': return 'text-amber-400'
      default: return 'text-foreground/70'
    }
  }

  if (loading) {
    return (
      <LearnerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-12 h-12 animate-spin text-main" />
        </div>
      </LearnerLayout>
    )
  }

  return (
    <LearnerLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/learner/canvas">
            <NButton variant="neutral" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Canvas
            </NButton>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-heading mb-2">Canvas Assignments</h1>
              <p className="text-foreground/70 font-base text-lg">
                {filteredAssignments.length} assignment(s) found
              </p>
            </div>
            <NButton 
              onClick={() => handleSyncToTasks()}
              disabled={syncing}
              variant="default"
            >
              {syncing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Sync All to Tasks
                </>
              )}
            </NButton>
          </div>
        </div>

        {/* Filters */}
        <NCard className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-main" />
            <h2 className="text-xl font-heading">Filters</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-heading mb-2">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assignments..."
                className="w-full px-4 py-2 rounded-base border-2 border-border bg-background font-base"
              />
            </div>

            {/* Course Filter */}
            <div>
              <label className="block text-sm font-heading mb-2">Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-2 rounded-base border-2 border-border bg-background font-base"
              >
                <option value="all">All Courses</option>
                {courses.map((course) => (
                  <option key={course.canvas_course_id} value={course.canvas_course_id}>
                    {course.course_code}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-heading mb-2">Due Date</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-base border-2 border-border bg-background font-base"
              >
                <option value="all">All</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past Due</option>
              </select>
            </div>

            {/* Submission Filter */}
            <div>
              <label className="block text-sm font-heading mb-2">Submission</label>
              <select
                value={submittedFilter}
                onChange={(e) => setSubmittedFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-base border-2 border-border bg-background font-base"
              >
                <option value="all">All</option>
                <option value="submitted">Submitted</option>
                <option value="not-submitted">Not Submitted</option>
              </select>
            </div>
          </div>
        </NCard>

        {/* Assignments List */}
        {filteredAssignments.length === 0 ? (
          <NCard className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
            <p className="text-foreground/70 font-base text-lg">No assignments found</p>
          </NCard>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => {
              const dueDate = formatDate(assignment.due_at)
              
              return (
                <NCard 
                  key={assignment.id} 
                  className={`p-6 hover:shadow-lg transition-all ${
                    (typeof dueDate === 'object' && dueDate.urgency === 'overdue') ? 'border-destructive/50' : ''
                  } ${(typeof dueDate === 'object' && dueDate.urgency === 'today') ? 'border-amber-600/50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Assignment Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-heading mb-1">{assignment.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-foreground/70 font-base">
                            <span>{assignment.canvas_courses?.name}</span>
                            <span>•</span>
                            <span>{assignment.points_possible} points</span>
                          </div>
                        </div>
                        
                        {/* Status Badges */}
                        <div className="flex gap-2">
                          {assignment.has_submitted && (
                            <span className="px-3 py-1 bg-success/10 text-success text-sm font-heading rounded-base border-2 border-success/30">
                              Submitted
                            </span>
                          )}
                          {assignment.grade && (
                            <span className="px-3 py-1 bg-main/10 text-main text-sm font-heading rounded-base border-2 border-main/30">
                              Grade: {assignment.grade}
                            </span>
                          )}
                          {assignment.synced_to_task && (
                            <span className="px-3 py-1 bg-accent/10 text-accent text-sm font-heading rounded-base border-2 border-accent/30">
                              In Tasks
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Due Date */}
                      {assignment.due_at && (
                        <div className={`flex items-center gap-2 mb-3 ${typeof dueDate === 'object' ? getDueDateColor(dueDate.urgency) : ''}`}>
                          <Calendar className="w-4 h-4" />
                          <span className="font-heading text-sm">
                            Due {typeof dueDate === 'object' ? dueDate.formatted : dueDate}
                            {typeof dueDate === 'object' && dueDate.urgency === 'overdue' && ' (Overdue)'}
                            {typeof dueDate === 'object' && dueDate.urgency === 'today' && ' (Today!)'}
                            {typeof dueDate === 'object' && dueDate.urgency === 'tomorrow' && ' (Tomorrow)'}
                          </span>
                        </div>
                      )}

                      {/* Description Preview */}
                      {assignment.description && (
                        <p className="text-sm text-foreground/70 font-base line-clamp-2 mb-3">
                          {assignment.description.replace(/<[^>]*>/g, '').substring(0, 150)}...
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        <a 
                          href={assignment.html_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <NButton variant="default" size="sm">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open in Canvas
                          </NButton>
                        </a>
                        
                        {!assignment.synced_to_task && (
                          <NButton 
                            onClick={() => handleSyncToTasks([assignment.id])}
                            variant="neutral" 
                            size="sm"
                            disabled={syncing}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Add to Tasks
                          </NButton>
                        )}
                      </div>
                    </div>
                  </div>
                </NCard>
              )
            })}
          </div>
        )}
      </div>
    </LearnerLayout>
  )
}

