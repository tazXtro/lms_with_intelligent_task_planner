"use client"

import { useState, useEffect } from "react"
import { LearnerLayout } from "@/components/learner-layout"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { NInput } from "@/components/ui/ninput"
import { Search, BookOpen, Star, Filter, Users, Clock } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import type { Course } from "@/types/database.types"

interface CourseWithEducator extends Course {
  educator: {
    full_name: string
  } | null
  enrollment_count: number
  is_enrolled: boolean
}

export default function BrowseCoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [courses, setCourses] = useState<CourseWithEducator[]>([])
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

      // Load all published courses
      const { data: coursesData, error } = await supabase
        .from("courses")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })

      if (error) throw error

      // Get all educator profiles
      const educatorIds = [...new Set(coursesData?.map((c) => c.educator_id) || [])]
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", educatorIds)

      const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || [])

      // Check enrollment status and get counts
      const coursesWithDetails = await Promise.all(
        (coursesData || []).map(async (course) => {
          // Get enrollment count
          const { count } = await supabase
            .from("enrollments")
            .select("*", { count: "exact", head: true })
            .eq("course_id", course.id)

          // Check if current user is enrolled
          let isEnrolled = false
          if (user) {
            const { data: enrollment } = await supabase
              .from("enrollments")
              .select("id")
              .eq("course_id", course.id)
              .eq("learner_id", user.id)
              .single()

            isEnrolled = !!enrollment
          }

          return {
            ...course,
            educator: profilesMap.get(course.educator_id) || null,
            enrollment_count: count || 0,
            is_enrolled: isEnrolled,
          }
        })
      )

      setCourses(coursesWithDetails)
    } catch (err) {
      console.error("Error loading courses:", err)
    } finally {
      setLoading(false)
    }
  }

  const categories = Array.from(new Set(courses.map((c) => c.category).filter(Boolean)))
  const levels = ["beginner", "intermediate", "advanced", "all"]

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || course.category === selectedCategory
    const matchesLevel = !selectedLevel || course.level === selectedLevel
    return matchesSearch && matchesCategory && matchesLevel
  })

  if (loading) {
    return (
      <LearnerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-main border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-heading text-lg">Loading courses...</p>
          </div>
        </div>
      </LearnerLayout>
    )
  }

  return (
    <LearnerLayout>
      <header className="sticky top-0 z-30 bg-background border-b-4 border-border">
        <div className="px-6 py-5">
          <h1 className="text-3xl font-heading mb-5">Explore Courses</h1>
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
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="hidden md:block">
            <NCard className="p-4 sticky top-32">
              <h3 className="font-heading text-lg mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </h3>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-heading text-sm mb-3">Categories</h4>
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
              </div>

              {/* Levels */}
              <div>
                <h4 className="font-heading text-sm mb-3">Level</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedLevel(null)}
                    className={`w-full text-left px-3 py-2 rounded-base transition-all border-2 ${
                      !selectedLevel
                        ? "bg-main/10 text-foreground font-heading border-border"
                        : "text-foreground/70 hover:bg-main/5 border-transparent font-base"
                    }`}
                  >
                    All Levels
                  </button>
                  {levels.map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`w-full text-left px-3 py-2 rounded-base transition-all border-2 capitalize ${
                        selectedLevel === level
                          ? "bg-main/10 text-foreground font-heading border-border"
                          : "text-foreground/70 hover:bg-main/5 border-transparent font-base"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </NCard>
          </div>

          {/* Courses Grid */}
          <div className="md:col-span-3">
            <div className="mb-4 text-sm text-foreground/70 font-base">
              Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Link key={course.id} href={`/learner/course/${course.id}`}>
                  <NCard className="overflow-hidden hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group cursor-pointer h-full">
                    <div className="relative h-48 bg-main/10 overflow-hidden border-b-2 border-border">
                      <img
                        src={course.thumbnail_url || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {course.is_enrolled && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-block px-3 py-1 rounded-base text-xs font-heading bg-success text-main-foreground border-2 border-border shadow-shadow">
                            Enrolled
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="mb-2">
                        {course.category && (
                          <span className="text-xs font-heading text-main bg-main/10 px-3 py-1 rounded-base border-2 border-border">
                            {course.category}
                          </span>
                        )}
                      </div>
                      <h3 className="font-heading text-xl mb-1 line-clamp-2">{course.title}</h3>
                      <p className="text-sm text-foreground/70 mb-3 font-base">
                        {course.educator?.full_name || "Unknown Educator"}
                      </p>
                      <p className="text-sm text-foreground/70 mb-4 font-base line-clamp-2">
                        {course.subtitle || ""}
                      </p>

                      <div className="flex items-center justify-between text-xs text-foreground/70 mb-4 font-base p-3 bg-accent/5 rounded-base border-2 border-border">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {course.enrollment_count} students
                        </span>
                        <span className="capitalize flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {course.level || "all"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-heading text-main">
                          {course.price === 0 ? "Free" : `$${course.price}`}
                        </div>
                        <NButton
                          variant={course.is_enrolled ? "default" : "accent"}
                          size="sm"
                        >
                          {course.is_enrolled ? "Continue" : "Enroll"}
                        </NButton>
                      </div>
                    </div>
                  </NCard>
                </Link>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-main/10 border-2 border-border rounded-base flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-10 h-10 text-foreground/50" />
                </div>
                <p className="text-foreground/70 font-base text-lg">
                  No courses found matching your filters
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </LearnerLayout>
  )
}

