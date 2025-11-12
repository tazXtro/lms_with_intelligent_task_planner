"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { EducatorLayout } from "@/components/educator-layout"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { NInput } from "@/components/ui/ninput"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
  Search,
  BookOpen,
  Award,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import type { Course, Enrollment } from "@/types/database.types"

interface EnrollmentWithDetails extends Enrollment {
  learner: {
    full_name: string
    email: string
  } | null
  total_lessons: number
  completed_lessons: number
  last_activity: string
}

interface CourseStats {
  total_students: number
  average_completion: number
  completed_students: number
  active_students: number
  total_lessons: number
}

export default function CourseStudentsPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.courseId as string
  const supabase = createClient()

  const [course, setCourse] = useState<Course | null>(null)
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([])
  const [stats, setStats] = useState<CourseStats>({
    total_students: 0,
    average_completion: 0,
    completed_students: 0,
    active_students: 0,
    total_lessons: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadStudentData()
  }, [courseId])

  const loadStudentData = async () => {
    try {
      setLoading(true)

      // Get current user and verify they're the educator for this course
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth")
        return
      }

      // Load course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .eq("educator_id", user.id)
        .single()

      if (courseError || !courseData) {
        router.push("/educator/courses")
        return
      }

      setCourse(courseData)

      // Get total lessons count for this course
      const { data: sectionsData } = await supabase
        .from("course_sections")
        .select("id")
        .eq("course_id", courseId)

      const sectionIds = (sectionsData || []).map((s) => s.id)
      
      let totalLessons = 0
      if (sectionIds.length > 0) {
        const { count } = await supabase
          .from("course_lessons")
          .select("*", { count: "exact", head: true })
          .in("section_id", sectionIds)
        
        totalLessons = count || 0
      }

      // Load all enrollments for this course
      const { data: enrollmentsData } = await supabase
        .from("enrollments")
        .select("*")
        .eq("course_id", courseId)
        .order("enrolled_at", { ascending: false })

      if (!enrollmentsData || enrollmentsData.length === 0) {
        setStats({
          total_students: 0,
          average_completion: 0,
          completed_students: 0,
          active_students: 0,
          total_lessons: totalLessons,
        })
        setEnrollments([])
        return
      }

      // Get learner profiles
      const learnerIds = enrollmentsData.map((e) => e.learner_id)
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", learnerIds)

      const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || [])

      // Enrich enrollments with student details and calculate actual progress
      let totalProgress = 0
      let completedStudents = 0
      let activeStudents = 0

      const enrichedEnrollments = await Promise.all(
        enrollmentsData.map(async (enrollment) => {
          // Count actual completed lessons from lesson_progress table
          const { count: completedLessonsCount } = await supabase
            .from("lesson_progress")
            .select("*", { count: "exact", head: true })
            .eq("enrollment_id", enrollment.id)
            .eq("completed", true)

          // Calculate actual progress based on real data
          const actualProgress = totalLessons > 0
            ? Math.round((completedLessonsCount || 0) / totalLessons * 100)
            : 0

          console.log(`[Course Students] Enrollment ${enrollment.id}:`, {
            learner: profilesMap.get(enrollment.learner_id)?.full_name,
            totalLessons,
            completedLessons: completedLessonsCount,
            storedProgress: enrollment.progress,
            calculatedProgress: actualProgress,
            isCompleted: actualProgress === 100
          })

          // Update stored progress if it differs (keep DB in sync)
          if (actualProgress !== (enrollment.progress || 0)) {
            console.log(`[Course Students] Updating progress from ${enrollment.progress}% to ${actualProgress}%`)
            await supabase
              .from("enrollments")
              .update({ progress: actualProgress })
              .eq("id", enrollment.id)
          }

          // Use actual progress for stats
          totalProgress += actualProgress

          if (actualProgress === 100) {
            completedStudents++
            console.log(`[Course Students] ✓ Student completed: ${profilesMap.get(enrollment.learner_id)?.full_name}`)
          }
          if (actualProgress > 0 && actualProgress < 100) activeStudents++

          // Get last activity timestamp
          const { data: lastCompletedLesson } = await supabase
            .from("lesson_progress")
            .select("completed_at")
            .eq("enrollment_id", enrollment.id)
            .eq("completed", true)
            .order("completed_at", { ascending: false })
            .limit(1)

          const lastActivity = lastCompletedLesson?.[0]?.completed_at || enrollment.enrolled_at

          return {
            ...enrollment,
            progress: actualProgress, // Use calculated progress
            learner: profilesMap.get(enrollment.learner_id) || null,
            total_lessons: totalLessons,
            completed_lessons: completedLessonsCount || 0, // Use actual count, not approximation
            last_activity: lastActivity,
          }
        })
      )

      setEnrollments(enrichedEnrollments)
      
      const finalStats = {
        total_students: enrollmentsData.length,
        average_completion: Math.round(totalProgress / enrollmentsData.length),
        completed_students: completedStudents,
        active_students: activeStudents,
        total_lessons: totalLessons,
      }

      console.log('[Course Students] Final Stats:', {
        course: courseData.title,
        ...finalStats,
        notStarted: enrollmentsData.length - activeStudents - completedStudents
      })

      setStats(finalStats)
    } catch (err) {
      console.error("Error loading student data:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const learnerName = enrollment.learner?.full_name?.toLowerCase() || ""
    const learnerEmail = enrollment.learner?.email?.toLowerCase() || ""
    const query = searchQuery.toLowerCase()
    return learnerName.includes(query) || learnerEmail.includes(query)
  })

  const getProgressColor = (progress: number) => {
    if (progress === 100) return "text-success"
    if (progress >= 50) return "text-main"
    if (progress > 0) return "text-accent"
    return "text-foreground/50"
  }

  const getStatusBadge = (progress: number) => {
    if (progress === 100) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-base text-xs font-heading bg-success/10 text-success border-2 border-success/20">
          <CheckCircle2 className="w-3 h-3" />
          Completed
        </span>
      )
    }
    if (progress > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-base text-xs font-heading bg-main/10 text-main border-2 border-main/20">
          <TrendingUp className="w-3 h-3" />
          In Progress
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-base text-xs font-base bg-foreground/5 text-foreground/50 border-2 border-border">
        <Clock className="w-3 h-3" />
        Not Started
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <EducatorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-main border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-heading text-lg">Loading student data...</p>
          </div>
        </div>
      </EducatorLayout>
    )
  }

  if (!course) {
    return (
      <EducatorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="font-heading text-lg mb-4">Course not found</p>
            <Link href="/educator/courses">
              <NButton variant="default">Back to Courses</NButton>
            </Link>
          </div>
        </div>
      </EducatorLayout>
    )
  }

  return (
    <EducatorLayout>
      <header className="bg-main/10 border-b-4 border-border">
        <div className="px-6 py-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <Link href="/educator/courses">
              <NButton variant="neutral" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Courses
              </NButton>
            </Link>
            <NButton 
              variant="default" 
              size="sm" 
              onClick={() => loadStudentData()}
              disabled={loading}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              {loading ? "Refreshing..." : "Refresh Data"}
            </NButton>
          </div>

          <h1 className="text-4xl font-heading mb-2">{course.title}</h1>
          <p className="text-lg text-foreground/70 font-base">
            Student Progress & Analytics
            {stats.total_students > 0 && (
              <span className="ml-2 text-sm">• Real-time data from lesson completions</span>
            )}
          </p>
        </div>
      </header>

      <main className="p-6">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <NCard className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-foreground/70 font-base">Total Students</p>
              <Users className="w-5 h-5 text-main" />
            </div>
            <p className="text-3xl font-heading mb-1">{stats.total_students}</p>
            <p className="text-xs text-foreground/60 font-base">Enrolled in this course</p>
          </NCard>

          <NCard className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-foreground/70 font-base">Avg Completion</p>
              <BarChart3 className="w-5 h-5 text-main" />
            </div>
            <p className="text-3xl font-heading mb-1">{stats.average_completion}%</p>
            <p className="text-xs text-foreground/60 font-base">Overall progress rate</p>
          </NCard>

          <NCard className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-foreground/70 font-base">Completed</p>
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <p className="text-3xl font-heading mb-1">{stats.completed_students}</p>
            <p className="text-xs text-foreground/60 font-base">Finished all lessons</p>
          </NCard>

          <NCard className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-foreground/70 font-base">Active</p>
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <p className="text-3xl font-heading mb-1">{stats.active_students}</p>
            <p className="text-xs text-foreground/60 font-base">Currently learning</p>
          </NCard>
        </div>

        {/* Student List */}
        <NCard className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-heading mb-1">Student List</h2>
              <p className="text-sm text-foreground/70 font-base">
                {filteredEnrollments.length} student{filteredEnrollments.length !== 1 ? "s" : ""}
              </p>
            </div>
            
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-3 w-5 h-5 text-foreground/50 pointer-events-none" />
              <NInput
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredEnrollments.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
              <p className="text-foreground/70 font-base text-lg mb-2">
                {searchQuery ? "No students found" : "No students enrolled yet"}
              </p>
              {searchQuery && (
                <p className="text-sm text-foreground/50 font-base">
                  Try adjusting your search query
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEnrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="p-4 border-2 border-border rounded-base hover:bg-main/5 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-main/10 border-2 border-border rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="font-heading text-sm">
                            {enrollment.learner?.full_name?.charAt(0).toUpperCase() || "?"}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-heading text-base truncate">
                            {enrollment.learner?.full_name || "Unknown Student"}
                          </h3>
                          <p className="text-xs text-foreground/60 font-base truncate">
                            {enrollment.learner?.email || "No email"}
                          </p>
                        </div>
                        {getStatusBadge(enrollment.progress || 0)}
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-base text-foreground/70">
                            {enrollment.completed_lessons} of {enrollment.total_lessons} lessons
                          </span>
                          <span className={`text-sm font-heading ${getProgressColor(enrollment.progress || 0)}`}>
                            {enrollment.progress || 0}%
                          </span>
                        </div>
                        <Progress value={enrollment.progress || 0} className="h-2" />
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-xs text-foreground/60 font-base">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Enrolled {formatDate(enrollment.enrolled_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Last activity {formatDate(enrollment.last_activity)}
                        </span>
                      </div>
                    </div>

                    {/* Achievement Badge */}
                    {enrollment.progress === 100 && (
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-success/10 border-2 border-success/30 rounded-base flex items-center justify-center">
                          <Award className="w-8 h-8 text-success" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </NCard>
      </main>
    </EducatorLayout>
  )
}

