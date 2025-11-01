"use client"

import { useState, useEffect } from "react"
import { LearnerLayout } from "@/components/learner-layout"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { 
  BookOpen, 
  Calendar, 
  FileText, 
  Award, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  ExternalLink,
  Clock,
  CheckCircle2,
  TrendingUp
} from "lucide-react"
import Link from "next/link"

interface CanvasStats {
  courses: number
  assignments: number
  announcements: number
}

interface CanvasAssignment {
  id: string
  name: string
  due_at: string | null
  canvas_course_id: string
  html_url: string
  has_submitted: boolean
  canvas_courses?: {
    name: string
    course_code: string
  }
}

interface CanvasAnnouncement {
  id: string
  title: string
  posted_at: string
  canvas_course_id: string
  is_read: boolean
  canvas_courses?: {
    name: string
  }
}

export default function CanvasPage() {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [stats, setStats] = useState<CanvasStats>({ courses: 0, assignments: 0, announcements: 0 })
  const [upcomingAssignments, setUpcomingAssignments] = useState<CanvasAssignment[]>([])
  const [recentAnnouncements, setRecentAnnouncements] = useState<CanvasAnnouncement[]>([])

  useEffect(() => {
    fetchCanvasData()
  }, [])

  const fetchCanvasData = async () => {
    try {
      setLoading(true)
      
      // Check connection status
      const connectionRes = await fetch('/api/canvas/connect')
      const connectionData = await connectionRes.json()
      
      setConnected(connectionData.connected)
      setStats(connectionData.stats)

      if (connectionData.connected) {
        // Fetch upcoming assignments
        const assignmentsRes = await fetch('/api/canvas/assignments?status=upcoming&limit=5')
        const assignmentsData = await assignmentsRes.json()
        setUpcomingAssignments(assignmentsData.assignments || [])

        // Fetch recent announcements
        const announcementsRes = await fetch('/api/canvas/announcements?limit=5')
        const announcementsData = await announcementsRes.json()
        setRecentAnnouncements(announcementsData.announcements || [])
      }
    } catch (error) {
      console.error('Error fetching Canvas data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/canvas/sync', {
        method: 'POST',
      })

      if (response.ok) {
        await fetchCanvasData()
        alert('✅ Canvas data synced successfully!')
      } else {
        throw new Error('Sync failed')
      }
    } catch (error) {
      console.error('Error syncing Canvas:', error)
      alert('❌ Failed to sync Canvas data')
    } finally {
      setSyncing(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

  if (!connected) {
    return (
      <LearnerLayout>
        <div className="p-6">
          <div className="max-w-2xl mx-auto mt-20">
            <NCard className="p-12 text-center">
              <div className="w-20 h-20 bg-accent/10 border-2 border-border rounded-base flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-accent" />
              </div>
              <h1 className="text-3xl font-heading mb-4">Canvas LMS Not Connected</h1>
              <p className="text-foreground/70 font-base text-lg mb-8">
                Connect your Canvas account to access all your courses, assignments, and announcements in one place.
              </p>
              <Link href="/learner/settings">
                <NButton variant="default" size="lg">
                  Go to Settings to Connect
                </NButton>
              </Link>
            </NCard>
          </div>
        </div>
      </LearnerLayout>
    )
  }

  return (
    <LearnerLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-heading mb-2">Canvas LMS</h1>
            <p className="text-foreground/70 font-base text-lg">
              Your Canvas courses and assignments in one place
            </p>
          </div>
          <NButton 
            onClick={handleSync}
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
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Now
              </>
            )}
          </NButton>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <NCard className="p-6 bg-gradient-to-br from-indigo-600 to-blue-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 font-base mb-1">Total Courses</p>
                <p className="text-4xl font-heading">{stats.courses}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-base flex items-center justify-center">
                <BookOpen className="w-7 h-7" />
              </div>
            </div>
          </NCard>

          <NCard className="p-6 bg-gradient-to-br from-amber-600 to-orange-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 font-base mb-1">Assignments</p>
                <p className="text-4xl font-heading">{stats.assignments}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-base flex items-center justify-center">
                <FileText className="w-7 h-7" />
              </div>
            </div>
          </NCard>

          <NCard className="p-6 bg-gradient-to-br from-emerald-600 to-teal-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 font-base mb-1">Announcements</p>
                <p className="text-4xl font-heading">{stats.announcements}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-base flex items-center justify-center">
                <TrendingUp className="w-7 h-7" />
              </div>
            </div>
          </NCard>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link href="/learner/canvas/assignments">
            <NCard className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-main">
              <FileText className="w-8 h-8 text-main mb-3" />
              <h3 className="font-heading text-lg">Assignments</h3>
              <p className="text-sm text-foreground/70 font-base">View all assignments</p>
            </NCard>
          </Link>

          <Link href="/learner/canvas/announcements">
            <NCard className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-main">
              <TrendingUp className="w-8 h-8 text-main mb-3" />
              <h3 className="font-heading text-lg">Announcements</h3>
              <p className="text-sm text-foreground/70 font-base">Latest updates</p>
            </NCard>
          </Link>

          <Link href="/learner/canvas/grades">
            <NCard className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-main">
              <Award className="w-8 h-8 text-main mb-3" />
              <h3 className="font-heading text-lg">Grades</h3>
              <p className="text-sm text-foreground/70 font-base">Check your grades</p>
            </NCard>
          </Link>

          <Link href="/learner/settings">
            <NCard className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-main">
              <RefreshCw className="w-8 h-8 text-main mb-3" />
              <h3 className="font-heading text-lg">Settings</h3>
              <p className="text-sm text-foreground/70 font-base">Manage connection</p>
            </NCard>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Assignments */}
          <NCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading flex items-center gap-2">
                <Clock className="w-6 h-6 text-main" />
                Upcoming Assignments
              </h2>
              <Link href="/learner/canvas/assignments">
                <NButton variant="neutral" size="sm">View All</NButton>
              </Link>
            </div>

            {upcomingAssignments.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
                <p className="text-foreground/70 font-base">No upcoming assignments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAssignments.map((assignment) => (
                  <NCard key={assignment.id} className="p-4 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-heading mb-1">{assignment.name}</h3>
                        <p className="text-sm text-foreground/70 font-base mb-2">
                          {assignment.canvas_courses?.name}
                        </p>
                        {assignment.due_at && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-amber-600" />
                            <span className="text-amber-600 font-heading">
                              Due {formatDate(assignment.due_at)}
                            </span>
                          </div>
                        )}
                      </div>
                      <a 
                        href={assignment.html_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-main hover:text-main/80"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                  </NCard>
                ))}
              </div>
            )}
          </NCard>

          {/* Recent Announcements */}
          <NCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-main" />
                Recent Announcements
              </h2>
              <Link href="/learner/canvas/announcements">
                <NButton variant="neutral" size="sm">View All</NButton>
              </Link>
            </div>

            {recentAnnouncements.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
                <p className="text-foreground/70 font-base">No announcements</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAnnouncements.map((announcement) => (
                  <NCard 
                    key={announcement.id} 
                    className={`p-4 hover:shadow-md transition-all ${
                      !announcement.is_read ? 'bg-main/5 border-main/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-heading">{announcement.title}</h3>
                          {!announcement.is_read && (
                            <span className="px-2 py-0.5 bg-main text-main-foreground text-xs font-heading rounded-base">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground/70 font-base mb-2">
                          {announcement.canvas_courses?.name}
                        </p>
                        <p className="text-xs text-foreground/60 font-base">
                          {formatTimeAgo(announcement.posted_at)}
                        </p>
                      </div>
                    </div>
                  </NCard>
                ))}
              </div>
            )}
          </NCard>
        </div>
      </div>
    </LearnerLayout>
  )
}

