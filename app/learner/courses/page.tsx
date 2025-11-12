"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { NInput } from "@/components/ui/ninput"
import { Progress } from "@/components/ui/progress"
import { Search, BookOpen, Star, Filter, Brain, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import type { Course } from "@/types/database.types"

interface EnrichedCourse extends Course {
  instructor: string
  enrolled: boolean
  progress: number
  totalLessons: number
  completedLessons: number
  enrollmentId?: string
}

export default function CoursesPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [enrolledCourses, setEnrolledCourses] = useState<EnrichedCourse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)

      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        console.error("Auth error:", authError)
        throw authError
      }

      if (!user) {
        router.push("/auth")
        return
      }

      // Fetch ONLY enrolled courses for this user
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select("*, course:courses!enrollments_course_id_fkey(*)")
        .eq("learner_id", user.id)
        .order("enrolled_at", { ascending: false })

      if (enrollmentsError) {
        console.error("Enrollments fetch error:", enrollmentsError)
        throw enrollmentsError
      }

      if (!enrollmentsData || enrollmentsData.length === 0) {
        setEnrolledCourses([])
        return
      }

      // Get all educator profiles in one query
      const educatorIds = [...new Set(enrollmentsData.map((e) => e.course.educator_id))]
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", educatorIds)

      const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || [])

      // Enrich enrolled courses with additional data
      const enrichedCourses = await Promise.all(
        enrollmentsData.map(async (enrollment) => {
          try {
            const course = enrollment.course
            
            // Get educator info from map
            const educator = profilesMap.get(course.educator_id)

            // Get total lessons count
            const { data: sectionsData } = await supabase
              .from("course_sections")
              .select("id")
              .eq("course_id", course.id)

            const sectionIds = (sectionsData || []).map((s) => s.id)
            
            let totalLessons = 0
            if (sectionIds.length > 0) {
              const { count: lessonsCount } = await supabase
                .from("course_lessons")
                .select("*", { count: "exact", head: true })
                .in("section_id", sectionIds)
              
              totalLessons = lessonsCount || 0
            }

            // Get completed lessons count
            const { count: completedLessonsCount } = await supabase
              .from("lesson_progress")
              .select("*", { count: "exact", head: true })
              .eq("enrollment_id", enrollment.id)
              .eq("completed", true)
            
            const completedLessons = completedLessonsCount || 0

            // Calculate actual progress
            const actualProgress = totalLessons > 0
              ? Math.round((completedLessons / totalLessons) * 100)
              : 0

            // Update stored progress if it differs (keep DB in sync)
            if (actualProgress !== (enrollment.progress || 0)) {
              console.log(`[My Courses] Syncing progress for ${course.title}: ${enrollment.progress}% → ${actualProgress}%`)
              await supabase
                .from("enrollments")
                .update({ progress: actualProgress })
                .eq("id", enrollment.id)
            }

            return {
              ...course,
              instructor: educator?.full_name || "Unknown Instructor",
              enrolled: true, // Always true for this page
              progress: actualProgress, // Use calculated progress
              totalLessons,
              completedLessons,
              enrollmentId: enrollment.id,
            }
          } catch (courseErr) {
            console.error(`Error enriching course ${enrollment.course.id}:`, courseErr)
            // Return minimal course data if enrichment fails
            return {
              ...enrollment.course,
              instructor: "Unknown Instructor",
              enrolled: true,
              progress: enrollment.progress || 0,
              totalLessons: 0,
              completedLessons: 0,
              enrollmentId: enrollment.id,
            }
          }
        })
      )

      setEnrolledCourses(enrichedCourses)
    } catch (err: any) {
      console.error("Error loading courses:", err)
      console.error("Error details:", {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
      })
    } finally {
      setLoading(false)
    }
  }

  const categories = Array.from(new Set(enrolledCourses.map((c) => c.category).filter(Boolean)))

  const filteredCourses = enrolledCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || course.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCourseClick = (course: EnrichedCourse) => {
    router.push(`/learner/learn/${course.id}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen w-64 bg-secondary-background border-r-4 border-border">
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
            href="/learner/courses"
            className="flex items-center gap-3 px-4 py-3 rounded-base bg-main/10 border-2 border-border text-foreground font-heading"
          >
            <BookOpen className="w-5 h-5" />
            My Courses
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="md:ml-64">
        <header className="sticky top-0 z-30 bg-background border-b-4 border-border">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-5">
              <h1 className="text-3xl font-heading">My Courses</h1>
              <Link href="/learner/browse">
                <NButton variant="accent">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse All Courses
                </NButton>
              </Link>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-foreground/50 pointer-events-none" />
                <NInput
                  placeholder="Search your courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-main mx-auto mb-4" />
                <p className="font-heading text-lg">Loading courses...</p>
              </div>
            </div>
          ) : (
          <div className="grid md:grid-cols-4 gap-6">
            {/* Sidebar Filters */}
            <div className="hidden md:block">
              <NCard className="p-4 sticky top-32">
                <h3 className="font-heading text-lg mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Categories
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-3 py-2 rounded-base transition-all border-2 ${
                      !selectedCategory
                        ? "bg-main/10 text-foreground font-heading border-border"
                        : "text-foreground/70 hover:bg-main/5 border-transparent font-base"
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-base transition-all border-2 ${
                        selectedCategory === category
                          ? "bg-main/10 text-foreground font-heading border-border"
                          : "text-foreground/70 hover:bg-main/5 border-transparent font-base"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </NCard>
            </div>

            {/* Courses Grid */}
            <div className="md:col-span-3">
                {filteredCourses.length === 0 && !loading ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-main/10 border-2 border-border rounded-base flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-10 h-10 text-foreground/50" />
                    </div>
                    <p className="text-foreground/70 font-base text-lg mb-2">
                      {searchQuery || selectedCategory ? "No courses found" : "You haven't enrolled in any courses yet"}
                    </p>
                    <p className="text-sm text-foreground/50 font-base mb-6">
                      {searchQuery || selectedCategory 
                        ? "Try adjusting your filters or search query"
                        : "Start your learning journey by exploring our course catalog"}
                    </p>
                    {!searchQuery && !selectedCategory && (
                      <Link href="/learner/browse">
                        <NButton variant="default" size="lg">
                          <BookOpen className="w-5 h-5 mr-2" />
                          Browse Courses
                        </NButton>
                      </Link>
                    )}
                  </div>
                ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <NCard
                    key={course.id}
                        onClick={() => handleCourseClick(course)}
                    className="overflow-hidden hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group cursor-pointer"
                  >
                        <div className="relative h-48 bg-main/10 overflow-hidden border-b-2 border-border">
                          <img
                            src={course.thumbnail_url || "/placeholder.svg"}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {course.progress === 100 && (
                            <div className="absolute top-3 right-3">
                              <span className="inline-block px-3 py-1 rounded-base text-xs font-heading bg-success text-main-foreground border-2 border-border shadow-shadow">
                                Completed
                              </span>
                            </div>
                          )}
                        </div>

                    <div className="p-5">
                          {course.category && (
                      <div className="mb-2">
                        <span className="text-xs font-heading text-main bg-main/10 px-3 py-1 rounded-base border-2 border-border">
                          {course.category}
                        </span>
                      </div>
                          )}
                      <h3 className="font-heading text-xl mb-1 line-clamp-2">{course.title}</h3>
                      <p className="text-sm text-foreground/70 mb-4 font-base">{course.instructor}</p>

                      {course.enrolled && (
                        <div className="mb-4 p-3 bg-main/5 rounded-base border-2 border-border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-heading">Progress</span>
                            <span className="text-xs font-heading text-main">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-foreground/70 mb-4 font-base p-3 bg-accent/5 rounded-base border-2 border-border">
                        <span>
                          {course.enrolled
                                ? `${course.completedLessons}/${course.totalLessons} lessons`
                                : `${course.totalLessons} lessons`}
                        </span>
                            <span className="text-foreground/70">${course.price}</span>
                      </div>

                          <NButton
                            className="w-full"
                            variant="default"
                          >
                            {course.progress === 100 ? "Review Course" : course.progress > 0 ? "Continue Learning" : "Start Learning"}
                          </NButton>
                    </div>
                  </NCard>
                ))}
                </div>
              )}
            </div>
          </div>
          )}
        </main>
      </div>
    </div>
  )
}
