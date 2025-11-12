"use client"

import { useState, useEffect } from "react"
import { EducatorLayout } from "@/components/educator-layout"
import { NButton } from "@/components/ui/nbutton"
import { NCard, NCardHeader, NCardTitle, NCardDescription, NCardContent } from "@/components/ui/ncard"
import { AITeachingAssistant } from "@/components/ai-teaching-assistant"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  Plus,
  BookOpen,
  Users,
  DollarSign,
  Edit,
  Eye,
  Star,
  Sparkles,
  TrendingUp,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import type { Course } from "@/types/database.types"

interface CourseWithStats extends Course {
  enrollment_count: number
}

export default function EducatorDashboard() {
  const [courses, setCourses] = useState<CourseWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showAI, setShowAI] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRevenue: 0,
    activeCourses: 0,
    avgRating: 0,
    averageCompletion: 0,
    activeStudents: 0,
    completedStudents: 0,
  })
  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Load courses for this educator
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .eq("educator_id", user.id)
        .order("created_at", { ascending: false })

      if (coursesError) throw coursesError

      // Load enrollment counts and calculate stats
      let totalStudents = 0
      let totalRevenue = 0
      let activeCourses = 0
      let totalProgress = 0
      let activeStudents = 0
      let completedStudents = 0

      const coursesWithStats = await Promise.all(
        (coursesData || []).map(async (course) => {
          // Get all enrollments for this course
          const { data: enrollments, error: enrollmentError } = await supabase
            .from("enrollments")
            .select("id, progress, learner_id")
            .eq("course_id", course.id)

          if (enrollmentError) {
            console.error("Error fetching enrollments for course", course.id, enrollmentError)
          }

          const enrollmentCount = enrollments?.length || 0
          totalStudents += enrollmentCount
          totalRevenue += (course.price || 0) * enrollmentCount
          if (course.status === "published") activeCourses++

          // Calculate progress statistics for this course with actual data
          if (enrollments && enrollments.length > 0) {
            // Get total lesson count for this course
            const { count: totalLessons } = await supabase
              .from("course_lessons")
              .select("*", { count: "exact", head: true })
              .eq("course_id", course.id)

            for (const enrollment of enrollments) {
              // Count completed lessons for this enrollment
              const { count: completedLessons } = await supabase
                .from("lesson_progress")
                .select("*", { count: "exact", head: true })
                .eq("enrollment_id", enrollment.id)
                .eq("completed", true)

              // Calculate actual progress
              const actualProgress = totalLessons && totalLessons > 0
                ? Math.round((completedLessons || 0) / totalLessons * 100)
                : 0

              // Debug logging
              console.log(`[Educator Dashboard] Enrollment ${enrollment.id}:`, {
                course: course.title,
                totalLessons,
                completedLessons,
                storedProgress: enrollment.progress,
                calculatedProgress: actualProgress,
                isCompleted: actualProgress === 100
              })

              // Update stored progress if it differs
              if (actualProgress !== (enrollment.progress || 0)) {
                console.log(`[Educator Dashboard] Updating progress for enrollment ${enrollment.id} from ${enrollment.progress}% to ${actualProgress}%`)
                await supabase
                  .from("enrollments")
                  .update({ progress: actualProgress })
                  .eq("id", enrollment.id)
              }

              // Use actual progress for stats
              totalProgress += actualProgress
              
              // Consider "active" if progress > 0 and < 100
              if (actualProgress > 0 && actualProgress < 100) {
                activeStudents++
              }
              
              // Count completed students (100% progress)
              if (actualProgress === 100) {
                completedStudents++
                console.log(`[Educator Dashboard] ✓ Found completed student for course: ${course.title}`)
              }
            }
          }

          return {
            ...course,
            enrollment_count: enrollmentCount,
          }
        })
      )

      const averageCompletion = totalStudents > 0 ? Math.round(totalProgress / totalStudents) : 0
      const notStarted = totalStudents - activeStudents - completedStudents

      console.log('[Educator Dashboard] Final Stats:', {
        totalStudents,
        completedStudents,
        activeStudents,
        notStarted,
        averageCompletion,
        totalRevenue
      })

      setCourses(coursesWithStats.slice(0, 4)) // Top 4 courses for table
      setStats({
        totalStudents,
        totalRevenue,
        activeCourses,
        avgRating: 4.8, // TODO: Calculate from reviews when implemented
        averageCompletion,
        activeStudents,
        completedStudents,
      })

      // Note: AI insights are now only generated when educator clicks "AI Insights" button
      // This prevents automatic/random generation on every page load
    } catch (err) {
      console.error("Error loading dashboard data:", err)
    } finally {
      setLoading(false)
      setLastUpdated(new Date())
    }
  }


  if (loading) {
    return (
      <EducatorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-main border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-heading text-lg">Loading dashboard...</p>
          </div>
        </div>
      </EducatorLayout>
    )
  }

  return (
    <EducatorLayout>
      <header className="sticky top-0 z-30 bg-background border-b-4 border-border">
        <div className="px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading">Educator Dashboard</h1>
            <p className="text-sm text-foreground/70 font-base mt-1">
              Real-time analytics and student progress tracking
            </p>
          </div>
          <div className="flex gap-3">
            <NButton 
              variant="neutral" 
              size="lg" 
              onClick={() => loadDashboardData()}
              disabled={loading}
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              {loading ? "Refreshing..." : "Refresh Stats"}
            </NButton>
            {courses.length > 0 && (
              <NButton 
                variant="accent" 
                size="lg" 
                onClick={() => setShowAI(true)}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                AI Insights
              </NButton>
            )}
            <Link href="/educator/courses/create">
              <NButton variant="default" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create Course
              </NButton>
            </Link>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          <NCard className="p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground/70 mb-2 font-base">Total Students</p>
                <p className="text-4xl font-heading">{stats.totalStudents.toLocaleString()}</p>
                <p className="text-xs text-foreground/70 mt-2 font-base">
                  Across all your courses
                </p>
              </div>
              <div className="w-14 h-14 bg-main border-2 border-border rounded-base flex items-center justify-center">
                <Users className="w-7 h-7 text-main-foreground" />
              </div>
            </div>
          </NCard>

          <NCard className="p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground/70 mb-2 font-base">Total Revenue</p>
                <p className="text-4xl font-heading">${stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-foreground/70 mt-2 font-base">
                  From course enrollments
                </p>
              </div>
              <div className="w-14 h-14 bg-accent border-2 border-border rounded-base flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-main-foreground" />
              </div>
            </div>
          </NCard>

          <NCard className="p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground/70 mb-2 font-base">Active Courses</p>
                <p className="text-4xl font-heading">{stats.activeCourses}</p>
                <p className="text-xs text-foreground/70 mt-2 font-base">
                  Published and live
                </p>
              </div>
              <div className="w-14 h-14 bg-success border-2 border-border rounded-base flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-main-foreground" />
              </div>
            </div>
          </NCard>

          <NCard className="p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground/70 mb-2 font-base">Avg Completion</p>
                <p className="text-4xl font-heading">{stats.averageCompletion}%</p>
                <p className="text-xs text-foreground/70 mt-2 font-base">
                  Student progress rate
                </p>
              </div>
              <div className="w-14 h-14 bg-success border-2 border-border rounded-base flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-main-foreground" />
              </div>
            </div>
          </NCard>
        </div>

        {/* Student Progress Analytics - Beautiful Charts */}
        {stats.totalStudents > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Student Status Distribution - Pie Chart */}
            <NCard className="p-6">
              <div className="mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-heading mb-1">Student Status Distribution</h3>
                    <p className="text-sm text-foreground/70 font-base">
                      Breakdown of {stats.totalStudents} enrolled students
                    </p>
                  </div>
                  {lastUpdated && (
                    <div className="text-xs text-foreground/50 font-base">
                      Updated: {lastUpdated.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { 
                        name: 'Completed', 
                        value: stats.completedStudents,
                        color: '#10b981' 
                      },
                      { 
                        name: 'In Progress', 
                        value: stats.activeStudents,
                        color: '#3b82f6'
                      },
                      { 
                        name: 'Not Started', 
                        value: stats.totalStudents - stats.activeStudents - stats.completedStudents,
                        color: '#94a3b8'
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => 
                      value > 0 ? `${name}: ${value} (${(percent * 100).toFixed(0)}%)` : ''
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={3}
                    stroke="#000"
                  >
                    {[
                      { color: '#10b981' },
                      { color: '#3b82f6' },
                      { color: '#94a3b8' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '3px solid #000',
                      borderRadius: '0.5rem',
                      fontFamily: 'var(--font-heading)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend with Icons */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2 p-3 bg-success/10 rounded-base border-2 border-border">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  <div>
                    <p className="text-xs text-foreground/70 font-base">Completed</p>
                    <p className="text-lg font-heading">{stats.completedStudents}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-main/10 rounded-base border-2 border-border">
                  <TrendingUp className="w-5 h-5 text-main flex-shrink-0" />
                  <div>
                    <p className="text-xs text-foreground/70 font-base">Active</p>
                    <p className="text-lg font-heading">{stats.activeStudents}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-foreground/5 rounded-base border-2 border-border">
                  <BookOpen className="w-5 h-5 text-foreground/50 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-foreground/70 font-base">Not Started</p>
                    <p className="text-lg font-heading">
                      {stats.totalStudents - stats.activeStudents - stats.completedStudents}
                    </p>
                  </div>
                </div>
              </div>
            </NCard>

            {/* Completion Progress - Bar Chart */}
            <NCard className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-heading mb-1">Course Performance</h3>
                <p className="text-sm text-foreground/70 font-base">
                  Student enrollment and completion by course
                </p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={courses.map(course => ({
                    name: course.title.length > 20 
                      ? course.title.substring(0, 20) + '...' 
                      : course.title,
                    students: course.enrollment_count,
                  }))}
                  margin={{ top: 5, right: 10, left: 0, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeWidth={2} />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ 
                      fill: '#64748b', 
                      fontFamily: 'var(--font-base)',
                      fontSize: 12 
                    }}
                  />
                  <YAxis 
                    tick={{ 
                      fill: '#64748b', 
                      fontFamily: 'var(--font-base)',
                      fontSize: 12 
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '3px solid #000',
                      borderRadius: '0.5rem',
                      fontFamily: 'var(--font-heading)',
                    }}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  />
                  <Bar 
                    dataKey="students" 
                    fill="#3b82f6" 
                    radius={[8, 8, 0, 0]}
                    stroke="#000"
                    strokeWidth={2}
                  />
                </BarChart>
              </ResponsiveContainer>

              {/* Quick Stats Below Chart */}
              <div className="mt-6 pt-4 border-t-2 border-border">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-xs text-foreground/70 font-base mb-1">Avg Completion Rate</p>
                    <p className="text-2xl font-heading text-main">{stats.averageCompletion}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground/70 font-base mb-1">Total Revenue</p>
                    <p className="text-2xl font-heading text-accent">${stats.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </NCard>
          </div>
        )}

        {/* Quick Stats */}
        {courses.length > 0 && (
          <NCard>
            <NCardHeader>
              <NCardTitle>Recent Course Activity</NCardTitle>
              <NCardDescription>Overview of your latest courses</NCardDescription>
            </NCardHeader>
            <NCardContent>
              <div className="space-y-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-4 bg-secondary-background border-2 border-border rounded-base hover:bg-main/5 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-main/10 border-2 border-border rounded-base overflow-hidden">
                        {course.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading text-lg">{course.title}</h3>
                        <p className="text-sm text-foreground/70 font-base">
                          {course.enrollment_count} student{course.enrollment_count !== 1 ? "s" : ""} • ${course.price}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-base text-xs font-heading border-2 border-border ${
                          course.status === "published"
                            ? "bg-success text-main-foreground"
                            : "bg-foreground/10 text-foreground"
                        }`}
                      >
                        {course.status === "published" ? "Published" : "Draft"}
                      </span>
                      <Link href={`/educator/courses/${course.id}/curriculum`}>
                        <NButton variant="neutral" size="sm">
                          <Edit className="w-4 h-4" />
                        </NButton>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </NCardContent>
          </NCard>
        )}

        {/* Empty State */}
        {courses.length === 0 && (
          <div className="text-center py-16 bg-white border-2 border-border rounded-base">
            <div className="w-20 h-20 bg-main/10 border-2 border-border rounded-base flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-foreground/50" />
            </div>
            <p className="text-foreground/70 font-base text-lg mb-4">
              Welcome! Start by creating your first course
            </p>
            <Link href="/educator/courses/create">
              <NButton variant="default" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Course
              </NButton>
            </Link>
          </div>
        )}

        {courses.length > 0 && (
          <div className="text-center">
            <Link href="/educator/courses">
              <NButton variant="neutral">
                View All Courses
              </NButton>
            </Link>
          </div>
        )}
      </main>

      {/* AI Insights Modal */}
      {showAI && (
        <AITeachingAssistant
          mode="student-insights"
          onClose={() => setShowAI(false)}
          initialData={{
            courseData: courses.length > 0 ? {
              title: "Overall Teaching Performance",
              totalCourses: courses.length,
              totalSections: 0, // Will be calculated by AI insights
              totalLessons: 0, // Will be calculated by AI insights
              averagePrice: Math.round(courses.reduce((sum, c) => sum + (c.price || 0), 0) / courses.length),
              publishedCourses: courses.filter(c => c.status === "published").length,
            } : null,
            enrollmentStats: {
              totalEnrolled: stats.totalStudents,
              activeStudents: stats.activeStudents,
              completed: stats.completedStudents,
              averageProgress: stats.averageCompletion,
              notStarted: stats.totalStudents - stats.activeStudents - stats.completedStudents,
              totalRevenue: stats.totalRevenue,
            },
          }}
        />
      )}
    </EducatorLayout>
  )
}
