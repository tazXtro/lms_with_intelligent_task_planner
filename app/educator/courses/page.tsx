"use client"

import { useState, useEffect } from "react"
import { EducatorLayout } from "@/components/educator-layout"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { NInput } from "@/components/ui/ninput"
import { Plus, Search, BookOpen, Edit, Eye } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import type { Course } from "@/types/database.types"

interface CourseWithStats extends Course {
  enrollment_count: number
}

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all")
  const [courses, setCourses] = useState<CourseWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Load courses for this educator
      const { data: coursesData, error } = await supabase
        .from("courses")
        .select("*")
        .eq("educator_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Load enrollment counts for each course
      const coursesWithStats = await Promise.all(
        (coursesData || []).map(async (course) => {
          const { count } = await supabase
            .from("enrollments")
            .select("*", { count: "exact", head: true })
            .eq("course_id", course.id)

          return {
            ...course,
            enrollment_count: count || 0,
          }
        })
      )

      setCourses(coursesWithStats)
    } catch (err) {
      console.error("Error loading courses:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || course.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <EducatorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-main border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-heading text-lg">Loading courses...</p>
          </div>
        </div>
      </EducatorLayout>
    )
  }

  return (
    <EducatorLayout>
      <header className="sticky top-0 z-30 bg-background border-b-4 border-border">
        <div className="px-6 py-5 flex items-center justify-between">
          <h1 className="text-3xl font-heading">My Courses</h1>
          <Link href="/educator/courses/create">
            <NButton variant="default" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Create Course
            </NButton>
          </Link>
        </div>
      </header>

      <main className="p-6">
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-foreground/50 pointer-events-none" />
              <NInput
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              {(["all", "published", "draft"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-5 py-2 rounded-base font-heading border-2 border-border transition-all ${
                    filterStatus === status
                      ? "bg-main text-main-foreground shadow-shadow"
                      : "bg-secondary-background text-foreground hover:translate-x-1 hover:translate-y-1"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <NCard key={course.id} className="overflow-hidden hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group">
              <div className="relative h-48 bg-main/10 overflow-hidden border-b-2 border-border">
                <img
                  src={course.thumbnail_url || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-base text-xs font-heading border-2 border-border ${
                      course.status === "published"
                        ? "bg-success text-main-foreground shadow-shadow"
                        : "bg-foreground/10 text-foreground"
                    }`}
                  >
                    {course.status === "published" ? "Published" : course.status === "draft" ? "Draft" : "Archived"}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-heading text-xl mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-foreground/70 mb-4 line-clamp-2 font-base">
                  {course.subtitle || "No description"}
                </p>

                <div className="grid grid-cols-3 gap-3 mb-5 text-center">
                  <div className="p-3 bg-main/5 rounded-base border-2 border-border">
                    <p className="text-xs text-foreground/70 font-base">Students</p>
                    <p className="font-heading text-lg">{course.enrollment_count}</p>
                  </div>
                  <div className="p-3 bg-accent/5 rounded-base border-2 border-border">
                    <p className="text-xs text-foreground/70 font-base">Price</p>
                    <p className="font-heading text-lg">${course.price}</p>
                  </div>
                  <div className="p-3 bg-success/5 rounded-base border-2 border-border">
                    <p className="text-xs text-foreground/70 font-base">Level</p>
                    <p className="font-heading text-sm">{course.level || "All"}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/educator/courses/${course.id}/curriculum`} className="flex-1">
                    <NButton variant="default" className="w-full">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </NButton>
                  </Link>
                </div>
              </div>
            </NCard>
          ))}
        </div>

        {filteredCourses.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-main/10 border-2 border-border rounded-base flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-foreground/50" />
            </div>
            <p className="text-foreground/70 font-base text-lg mb-4">
              {searchQuery || filterStatus !== "all"
                ? "No courses found matching your filters"
                : "No courses yet. Create your first course!"}
            </p>
            {!searchQuery && filterStatus === "all" && (
              <Link href="/educator/courses/create">
                <NButton variant="default">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Course
                </NButton>
              </Link>
            )}
          </div>
        )}
      </main>
    </EducatorLayout>
  )
}
