"use client"

import { useState, useEffect } from "react"
import { LearnerLayout } from "@/components/learner-layout"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { 
  Filter,
  ExternalLink,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Mail,
  MailOpen,
  Clock
} from "lucide-react"
import Link from "next/link"

interface CanvasAnnouncement {
  id: string
  title: string
  message: string
  posted_at: string
  author_name: string
  html_url: string
  is_read: boolean
  canvas_course_id: string
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

export default function CanvasAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<CanvasAnnouncement[]>([])
  const [courses, setCourses] = useState<CanvasCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  // Filters
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [readFilter, setReadFilter] = useState<string>("all") // all, read, unread
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchData()
  }, [selectedCourse, readFilter])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch courses
      const coursesRes = await fetch('/api/canvas/courses')
      const coursesData = await coursesRes.json()
      setCourses(coursesData.courses || [])

      // Fetch announcements with filters
      const params = new URLSearchParams()
      if (selectedCourse !== 'all') params.append('courseId', selectedCourse)
      if (readFilter !== 'all') {
        params.append('isRead', readFilter === 'read' ? 'true' : 'false')
      }

      const announcementsRes = await fetch(`/api/canvas/announcements?${params.toString()}`)
      const announcementsData = await announcementsRes.json()
      setAnnouncements(announcementsData.announcements || [])
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (announcementId: string, isRead: boolean) => {
    try {
      const response = await fetch('/api/canvas/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcementId, isRead }),
      })

      if (response.ok) {
        // Update local state
        setAnnouncements(prev => 
          prev.map(a => a.id === announcementId ? { ...a, is_read: isRead } : a)
        )
      }
    } catch (error) {
      console.error('Error marking announcement:', error)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
  }

  const filteredAnnouncements = announcements.filter(announcement => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        announcement.title.toLowerCase().includes(query) ||
        announcement.message.toLowerCase().includes(query) ||
        announcement.canvas_courses?.name.toLowerCase().includes(query)
      )
    }
    return true
  })

  const unreadCount = announcements.filter(a => !a.is_read).length

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
              <h1 className="text-4xl font-heading mb-2">Canvas Announcements</h1>
              <p className="text-foreground/70 font-base text-lg">
                {filteredAnnouncements.length} announcement(s) • {unreadCount} unread
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <NCard className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-main" />
            <h2 className="text-xl font-heading">Filters</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-heading mb-2">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search announcements..."
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

            {/* Read Status Filter */}
            <div>
              <label className="block text-sm font-heading mb-2">Status</label>
              <select
                value={readFilter}
                onChange={(e) => setReadFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-base border-2 border-border bg-background font-base"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>
        </NCard>

        {/* Announcements List */}
        {filteredAnnouncements.length === 0 ? (
          <NCard className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
            <p className="text-foreground/70 font-base text-lg">No announcements found</p>
          </NCard>
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => {
              const isExpanded = expandedId === announcement.id
              const messagePreview = stripHtml(announcement.message)
              
              return (
                <NCard 
                  key={announcement.id} 
                  className={`p-6 hover:shadow-lg transition-all ${
                    !announcement.is_read ? 'bg-main/5 border-main/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Read/Unread Icon */}
                    <button
                      onClick={() => handleMarkAsRead(announcement.id, !announcement.is_read)}
                      className="mt-1 text-foreground/50 hover:text-main transition-colors"
                    >
                      {announcement.is_read ? (
                        <MailOpen className="w-5 h-5" />
                      ) : (
                        <Mail className="w-5 h-5 text-main" />
                      )}
                    </button>

                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <h3 className="text-xl font-heading mb-1">{announcement.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-foreground/70 font-base">
                            <span>{announcement.canvas_courses?.name}</span>
                            <span>•</span>
                            <span>{announcement.author_name}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimeAgo(announcement.posted_at)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {!announcement.is_read && (
                          <span className="px-3 py-1 bg-main text-main-foreground text-sm font-heading rounded-base">
                            New
                          </span>
                        )}
                      </div>

                      {/* Message */}
                      <div className="mb-3">
                        {isExpanded ? (
                          <div 
                            className="text-foreground/80 font-base prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: announcement.message }}
                          />
                        ) : (
                          <p className="text-foreground/70 font-base line-clamp-2">
                            {messagePreview}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <NButton 
                          onClick={() => {
                            setExpandedId(isExpanded ? null : announcement.id)
                            if (!announcement.is_read) {
                              handleMarkAsRead(announcement.id, true)
                            }
                          }}
                          variant="neutral" 
                          size="sm"
                        >
                          {isExpanded ? 'Show Less' : 'Read More'}
                        </NButton>
                        
                        <a 
                          href={announcement.html_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <NButton variant="default" size="sm">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open in Canvas
                          </NButton>
                        </a>
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

