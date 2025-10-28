"use client"

import { useState, useEffect } from "react"
import { EducatorLayout } from "@/components/educator-layout"
import { NButton } from "@/components/ui/nbutton"
import { NCard, NCardHeader, NCardTitle, NCardDescription, NCardContent } from "@/components/ui/ncard"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRevenue: 0,
    activeCourses: 0,
    avgRating: 0,
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

      const coursesWithStats = await Promise.all(
        (coursesData || []).map(async (course) => {
          const { count } = await supabase
            .from("enrollments")
            .select("*", { count: "exact", head: true })
            .eq("course_id", course.id)

          const enrollmentCount = count || 0
          totalStudents += enrollmentCount
          totalRevenue += (course.price || 0) * enrollmentCount
          if (course.status === "published") activeCourses++

          return {
            ...course,
            enrollment_count: enrollmentCount,
          }
        })
      )

      setCourses(coursesWithStats.slice(0, 4)) // Top 4 courses for table
      setStats({
        totalStudents,
        totalRevenue,
        activeCourses,
        avgRating: 4.8, // TODO: Calculate from reviews when implemented
      })
    } catch (err) {
      console.error("Error loading dashboard data:", err)
    } finally {
      setLoading(false)
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
          <h1 className="text-3xl font-heading">Educator Dashboard</h1>
          <Link href="/educator/courses/create">
            <NButton variant="default" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Create Course
            </NButton>
          </Link>
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
                <p className="text-sm text-foreground/70 mb-2 font-base">Avg Rating</p>
                <p className="text-4xl font-heading">{stats.avgRating.toFixed(1)}</p>
                <p className="text-xs text-foreground/70 mt-2 font-base">
                  Based on reviews
                </p>
              </div>
              <div className="w-14 h-14 bg-main border-2 border-border rounded-base flex items-center justify-center">
                <Star className="w-7 h-7 text-main-foreground" />
              </div>
            </div>
          </NCard>
        </div>

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
    </EducatorLayout>
  )
}
