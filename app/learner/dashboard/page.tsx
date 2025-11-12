"use client"

import { useState, useEffect } from "react"
import { LearnerLayout } from "@/components/learner-layout"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Star,
  Play,
  ArrowRight,
  Users,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import type { Course, Enrollment } from "@/types/database.types"

interface EnrolledCourse extends Enrollment {
  course: Course & {
    educator: {
      full_name: string
    } | null
    total_lessons: number
  }
}

interface RecommendedCourse extends Course {
  educator: {
    full_name: string
  } | null
  enrollment_count: number
}

export default function LearnerDashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
  const [recommendedCourses, setRecommendedCourses] = useState<RecommendedCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [totalLessonsCompleted, setTotalLessonsCompleted] = useState(0)
  const [totalProgress, setTotalProgress] = useState(0)
  const [completedCoursesCount, setCompletedCoursesCount] = useState(0)
  const [totalAvailableCourses, setTotalAvailableCourses] = useState(0)
  const [userName, setUserName] = useState("Learner")
  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Get user profile for name
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single()
      
      if (profileData?.full_name) {
        setUserName(profileData.full_name)
      }

      // Load enrolled courses
      const { data: enrollmentsData } = await supabase
        .from("enrollments")
        .select("*, course:courses!enrollments_course_id_fkey(*)")
        .eq("learner_id", user.id)
        .order("enrolled_at", { ascending: false })

      if (!enrollmentsData || enrollmentsData.length === 0) {
        // Load recommended courses if no enrollments
        await loadRecommendedCourses([])
        setLoading(false)
        return
      }

      // Get educator profiles for enrolled courses
      const enrolledEducatorIds = [...new Set(enrollmentsData?.map((e) => e.course.educator_id) || [])]
      const { data: enrolledProfiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", enrolledEducatorIds)

      const enrolledProfilesMap = new Map(enrolledProfiles?.map((p) => [p.id, p]) || [])

      // Get lesson counts and progress for enrolled courses
      const enrollmentsWithLessons = await Promise.all(
        (enrollmentsData || []).map(async (enrollment) => {
          // Count total lessons
          const { count: totalLessons } = await supabase
            .from("course_lessons")
            .select("*", { count: "exact", head: true })
            .eq("course_id", enrollment.course.id)

          // Count completed lessons
          const { count: completedLessons } = await supabase
            .from("lesson_progress")
            .select("*", { count: "exact", head: true })
            .eq("enrollment_id", enrollment.id)
            .eq("completed", true)

          // Calculate actual progress
          const actualProgress = totalLessons && totalLessons > 0
            ? Math.round((completedLessons || 0) / totalLessons * 100)
            : 0

          // Update enrollment progress if it differs (keep DB in sync)
          if (actualProgress !== (enrollment.progress || 0)) {
            await supabase
              .from("enrollments")
              .update({ progress: actualProgress })
              .eq("id", enrollment.id)
          }

          return {
            ...enrollment,
            progress: actualProgress, // Use calculated progress
            course: {
              ...enrollment.course,
              educator: enrolledProfilesMap.get(enrollment.course.educator_id) || null,
              total_lessons: totalLessons || 0,
            },
          }
        })
      )

      setEnrolledCourses(enrollmentsWithLessons)

      // Calculate accurate total stats
      const totalCompleted = enrollmentsWithLessons.reduce(
        (sum, e) => sum + Math.round((e.progress || 0) / 100 * e.course.total_lessons),
        0
      )
      setTotalLessonsCompleted(totalCompleted)

      const avgProgress = enrollmentsWithLessons.length > 0
        ? Math.round(
            enrollmentsWithLessons.reduce((sum, e) => sum + (e.progress || 0), 0) /
              enrollmentsWithLessons.length
          )
        : 0
      setTotalProgress(avgProgress)

      // Count completed courses (100% progress)
      const completedCount = enrollmentsWithLessons.filter(e => e.progress === 100).length
      setCompletedCoursesCount(completedCount)

      // Load recommended courses
      const enrolledIds = enrollmentsData?.map((e) => e.course_id) || []
      await loadRecommendedCourses(enrolledIds)
    } catch (err) {
      console.error("Error loading dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadRecommendedCourses = async (enrolledIds: string[]) => {
    // Get total count of available published courses
    const { count: totalPublished } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("status", "published")
    
    setTotalAvailableCourses(totalPublished || 0)

    // Load recommended courses (published courses not enrolled in)
    const { data: recommendedData } = await supabase
      .from("courses")
      .select("*")
      .eq("status", "published")
      .not("id", "in", `(${enrolledIds.length > 0 ? enrolledIds.join(",") : "null"})`)
      .limit(6)

    // Get educator profiles for recommended courses
    const recommendedEducatorIds = [...new Set(recommendedData?.map((c) => c.educator_id) || [])]
    const { data: recommendedProfiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", recommendedEducatorIds)

    const recommendedProfilesMap = new Map(recommendedProfiles?.map((p) => [p.id, p]) || [])

    // Get enrollment counts
    const recommendedWithCounts = await Promise.all(
      (recommendedData || []).map(async (course) => {
        const { count } = await supabase
          .from("enrollments")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course.id)

        return {
          ...course,
          educator: recommendedProfilesMap.get(course.educator_id) || null,
          enrollment_count: count || 0,
        }
      })
    )

    setRecommendedCourses(recommendedWithCounts)
  }

  if (loading) {
    return (
      <LearnerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-main border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-heading text-lg">Loading dashboard...</p>
          </div>
        </div>
      </LearnerLayout>
    )
  }

  return (
    <LearnerLayout>
      <header className="sticky top-0 z-30 bg-background border-b-4 border-border">
        <div className="px-6 py-5">
          <h1 className="text-3xl font-heading">Learning Dashboard</h1>
        </div>
      </header>

      <main className="p-6 space-y-8">
          {/* Welcome Section */}
          <NCard className="p-8 bg-main/5 border-main/20">
            <h2 className="text-4xl font-heading mb-3">Welcome back, {userName}!</h2>
            <p className="text-foreground/70 mb-6 font-base text-lg">
              {enrolledCourses.length > 0 
                ? "You're making great progress. Keep up the momentum and continue learning!"
                : "Start your learning journey today! Browse courses and enroll to begin."}
            </p>
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                <p className="text-sm text-foreground/70 font-base mb-1">Overall Progress</p>
                <p className="text-5xl font-heading text-main">{totalProgress}%</p>
              </div>
              <div className="flex-1">
                <div className="mb-2 flex items-center justify-between text-sm font-base text-foreground/70">
                  <span>
                    {totalProgress === 0 
                      ? "Start your first lesson" 
                      : totalProgress === 100 
                        ? "All courses completed! 🎉" 
                        : `${totalLessonsCompleted} lesson${totalLessonsCompleted !== 1 ? 's' : ''} completed`}
                  </span>
                  {enrolledCourses.length > 0 && (
                    <span>
                      {enrolledCourses.length} course{enrolledCourses.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <Progress value={totalProgress} className="h-6" />
              </div>
            </div>
            {enrolledCourses.length > 0 && (
              <div className="mt-6 flex gap-3">
                <Link href={`/learner/learn/${enrolledCourses[0].course.id}`}>
                  <NButton variant="default" className="gap-2">
                    <Play className="w-4 h-4" /> Continue Learning
                  </NButton>
                </Link>
                <Link href="/learner/browse">
                  <NButton variant="neutral" className="gap-2">
                    <BookOpen className="w-4 h-4" /> Browse More Courses
                  </NButton>
                </Link>
              </div>
            )}
            {enrolledCourses.length === 0 && (
              <div className="mt-6">
                <Link href="/learner/browse">
                  <NButton variant="default" className="gap-2">
                    <BookOpen className="w-4 h-4" /> Browse Courses
                  </NButton>
                </Link>
              </div>
            )}
          </NCard>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          <NCard className="p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground/70 mb-2 font-base">Courses Enrolled</p>
                <p className="text-4xl font-heading">{enrolledCourses.length}</p>
                <p className="text-xs text-success mt-2 font-base">
                  {completedCoursesCount > 0 
                    ? `${completedCoursesCount} completed` 
                    : "Active learning"}
                </p>
              </div>
              <div className="w-14 h-14 bg-main border-2 border-border rounded-base flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-main-foreground" />
              </div>
            </div>
          </NCard>

          <NCard className="p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground/70 mb-2 font-base">Lessons Completed</p>
                <p className="text-4xl font-heading">{totalLessonsCompleted}</p>
                <p className="text-xs text-success mt-2 font-base">
                  {totalLessonsCompleted > 0 ? "Keep going!" : "Start learning!"}
                </p>
              </div>
              <div className="w-14 h-14 bg-accent border-2 border-border rounded-base flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-main-foreground" />
              </div>
            </div>
          </NCard>

          <NCard className="p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground/70 mb-2 font-base">Avg Progress</p>
                <p className="text-4xl font-heading">{totalProgress}%</p>
                <p className="text-xs text-foreground/70 mt-2 font-base">
                  {enrolledCourses.length > 0 
                    ? `Across ${enrolledCourses.length} course${enrolledCourses.length !== 1 ? 's' : ''}`
                    : "No courses yet"}
                </p>
              </div>
              <div className="w-14 h-14 bg-success border-2 border-border rounded-base flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-main-foreground" />
              </div>
            </div>
          </NCard>

          <NCard className="p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground/70 mb-2 font-base">Courses Available</p>
                <p className="text-4xl font-heading">{totalAvailableCourses}</p>
                <p className="text-xs text-foreground/70 mt-2 font-base">
                  {totalAvailableCourses - enrolledCourses.length > 0 
                    ? `${totalAvailableCourses - enrolledCourses.length} to explore`
                    : "All enrolled!"}
                </p>
              </div>
              <div className="w-14 h-14 bg-main border-2 border-border rounded-base flex items-center justify-center">
                <Star className="w-7 h-7 text-main-foreground" />
              </div>
            </div>
          </NCard>
        </div>

        {/* Enrolled Courses */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-3xl font-heading">Your Courses</h3>
            <Link href="/learner/courses">
              <NButton variant="neutral">View All</NButton>
            </Link>
          </div>

          {enrolledCourses.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {enrolledCourses.slice(0, 3).map((enrollment) => (
                <Link
                  key={enrollment.id}
                  href={`/learner/learn/${enrollment.course.id}`}
                >
                  <NCard className="overflow-hidden hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group cursor-pointer">
                    <div className="relative h-48 bg-main/10 overflow-hidden border-b-2 border-border">
                      <img
                        src={enrollment.course.thumbnail_url || "/placeholder.svg"}
                        alt={enrollment.course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-main border-2 border-border rounded-base flex items-center justify-center">
                          <Play className="w-8 h-8 text-main-foreground" />
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-heading text-xl line-clamp-2 flex-1">
                          {enrollment.course.title}
                        </h4>
                        {enrollment.progress === 100 ? (
                          <span className="ml-2 px-2 py-1 bg-success/20 text-success border-2 border-success rounded text-xs font-heading whitespace-nowrap">
                            Completed
                          </span>
                        ) : enrollment.progress > 0 ? (
                          <span className="ml-2 px-2 py-1 bg-main/20 text-main border-2 border-main rounded text-xs font-heading whitespace-nowrap">
                            In Progress
                          </span>
                        ) : (
                          <span className="ml-2 px-2 py-1 bg-foreground/10 text-foreground/70 border-2 border-border rounded text-xs font-heading whitespace-nowrap">
                            Not Started
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground/70 mb-4 font-base">
                        {enrollment.course.educator?.full_name || "Unknown Educator"}
                      </p>

                      <div className="mb-4 p-3 bg-main/5 rounded-base border-2 border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-heading">Progress</span>
                          <span className={`text-xs font-heading ${enrollment.progress === 100 ? 'text-success' : 'text-main'}`}>
                            {enrollment.progress || 0}%
                          </span>
                        </div>
                        <Progress value={enrollment.progress || 0} className="h-3" />
                        {enrollment.progress > 0 && enrollment.progress < 100 && (
                          <p className="text-xs text-foreground/60 mt-2 font-base">
                            {Math.round((enrollment.progress / 100) * enrollment.course.total_lessons)} of {enrollment.course.total_lessons} lessons
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-foreground/70 mb-4 font-base">
                        <span>{enrollment.course.total_lessons} lessons</span>
                        <span className="capitalize">{enrollment.course.level || "all"}</span>
                      </div>

                      <NButton className="w-full" variant="default">
                        {enrollment.progress === 100 
                          ? "Review Course" 
                          : enrollment.progress > 0 
                            ? "Continue Learning" 
                            : "Start Learning"
                        } <ArrowRight className="ml-2 w-4 h-4" />
                      </NButton>
                    </div>
                  </NCard>
                </Link>
              ))}
            </div>
          ) : (
            <NCard className="p-12 text-center">
              <div className="w-20 h-20 bg-main/10 border-2 border-border rounded-base flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-foreground/50" />
              </div>
              <p className="text-foreground/70 font-base text-lg mb-4">
                You haven't enrolled in any courses yet
              </p>
              <Link href="/learner/browse">
                <NButton variant="default">Browse Courses</NButton>
              </Link>
            </NCard>
          )}
        </div>

        {/* Recommended Courses */}
        {recommendedCourses.length > 0 && (
          <div>
            <h3 className="text-3xl font-heading mb-6">Recommended For You</h3>

            <div className="grid md:grid-cols-3 gap-6">
              {recommendedCourses.slice(0, 3).map((course) => (
                <Link key={course.id} href={`/learner/course/${course.id}`}>
                  <NCard className="overflow-hidden hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group cursor-pointer">
                    <div className="relative h-48 bg-main/10 overflow-hidden border-b-2 border-border">
                      <img
                        src={course.thumbnail_url || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="p-5">
                      <h4 className="font-heading text-xl mb-1 line-clamp-2">{course.title}</h4>
                      <p className="text-sm text-foreground/70 mb-4 font-base">
                        {course.educator?.full_name || "Unknown Educator"}
                      </p>

                      <div className="flex items-center justify-between mb-4 p-3 bg-accent/5 rounded-base border-2 border-border">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-foreground/70" />
                          <span className="text-sm font-base">{course.enrollment_count} students</span>
                        </div>
                        <span className="text-xl font-heading text-main">
                          {course.price === 0 ? "Free" : `$${course.price}`}
                        </span>
                      </div>

                      <NButton className="w-full" variant="accent">
                        Enroll Now <ArrowRight className="ml-2 w-4 h-4" />
                      </NButton>
                    </div>
                  </NCard>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </LearnerLayout>
  )
}
