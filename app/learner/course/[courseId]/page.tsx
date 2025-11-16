"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { LearnerLayout } from "@/components/learner-layout"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import {
  Play,
  BookOpen,
  Users,
  Clock,
  Star,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Lock,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import type { Course, CourseSection, CourseLesson } from "@/types/database.types"

interface CourseWithDetails extends Course {
  educator: {
    full_name: string
    email: string
  } | null
  sections: (CourseSection & {
    lessons: CourseLesson[]
  })[]
  enrollment_count: number
  total_duration: number
  is_enrolled: boolean
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.courseId as string
  const supabase = createClient()

  const [course, setCourse] = useState<CourseWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    loadCourse()
  }, [courseId])

  const loadCourse = async () => {
    try {
      setLoading(true)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Load course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single()

      if (courseError) throw courseError

      // Load educator profile
      const { data: educatorProfile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", courseData.educator_id)
        .single()

      // Load sections with lessons
      const { data: sectionsData } = await supabase
        .from("course_sections")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index")

      const sections = await Promise.all(
        (sectionsData || []).map(async (section) => {
          const { data: lessonsData } = await supabase
            .from("course_lessons")
            .select("*")
            .eq("section_id", section.id)
            .order("order_index")

          return {
            ...section,
            lessons: lessonsData || [],
          }
        })
      )

      // Get enrollment count
      const { count } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("course_id", courseId)

      // Check if user is enrolled
      let isEnrolled = false
      if (user) {
        const { data: enrollment } = await supabase
          .from("enrollments")
          .select("id")
          .eq("course_id", courseId)
          .eq("learner_id", user.id)
          .single()

        isEnrolled = !!enrollment
      }

      // Calculate total duration
      const totalDuration = sections.reduce((total, section) => {
        return (
          total +
          section.lessons.reduce((sectionTotal: number, lesson: { duration_minutes?: number }) => {
            return sectionTotal + (lesson.duration_minutes || 0)
          }, 0)
        )
      }, 0)

      setCourse({
        ...courseData,
        educator: educatorProfile || null,
        sections,
        enrollment_count: count || 0,
        total_duration: totalDuration,
        is_enrolled: isEnrolled,
      })

      // Expand first section by default
      if (sections.length > 0) {
        setExpandedSections(new Set([sections[0].id]))
      }
    } catch (err) {
      console.error("Error loading course:", err)
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const handleEnroll = async () => {
    if (!course) return

    // If course is free, enroll directly
    if (course.price === 0 || course.price === null) {
      await enrollInCourse()
    } else {
      // Redirect to checkout with course ID as query parameter
      router.push(`/learner/checkout?course=${course.id}`)
    }
  }

  const enrollInCourse = async () => {
    if (!course) return

    try {
      setEnrolling(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth")
        return
      }

      const { error } = await supabase.from("enrollments").insert({
        course_id: course.id,
        learner_id: user.id,
        progress: 0,
      })

      if (error) throw error

      // Refresh course data
      await loadCourse()
      
      // Redirect to course player
      router.push(`/learner/learn/${course.id}`)
    } catch (err) {
      console.error("Error enrolling:", err)
      alert("Failed to enroll in course")
    } finally {
      setEnrolling(false)
    }
  }

  const startCourse = () => {
    if (!course) return
    router.push(`/learner/learn/${course.id}`)
  }

  if (loading) {
    return (
      <LearnerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-main border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-heading text-lg">Loading course...</p>
          </div>
        </div>
      </LearnerLayout>
    )
  }

  if (!course) {
    return (
      <LearnerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="font-heading text-lg">Course not found</p>
            <Link href="/learner/browse">
              <NButton variant="default" className="mt-4">
                Browse Courses
              </NButton>
            </Link>
          </div>
        </div>
      </LearnerLayout>
    )
  }

  const totalLessons = course.sections.reduce(
    (total, section) => total + section.lessons.length,
    0
  )

  return (
    <LearnerLayout>
      <header className="bg-main/10 border-b-4 border-border">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Link href="/learner/browse">
            <NButton variant="neutral" size="sm" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Browse
            </NButton>
          </Link>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              {course.category && (
                <span className="inline-block px-3 py-1 rounded-base text-sm font-heading bg-main text-main-foreground border-2 border-border shadow-shadow mb-4">
                  {course.category}
                </span>
              )}
              <h1 className="text-5xl font-heading mb-4">{course.title}</h1>
              {course.subtitle && (
                <p className="text-xl text-foreground/80 mb-6 font-base">
                  {course.subtitle}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/70 font-base">
                <span>By {course.educator?.full_name || "Unknown Educator"}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {course.enrollment_count} students
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {Math.floor(course.total_duration / 60)}h {course.total_duration % 60}m
                </span>
                <span>•</span>
                <span className="capitalize">{course.level || "all levels"}</span>
              </div>
            </div>

            <div>
              <NCard className="p-6">
                {course.thumbnail_url && (
                  <div className="w-full h-48 bg-main/10 rounded-base border-2 border-border overflow-hidden mb-4">
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="text-4xl font-heading text-main mb-4">
                  {course.price === 0 ? "Free" : `$${course.price}`}
                </div>
                {course.is_enrolled ? (
                  <NButton
                    variant="default"
                    size="lg"
                    className="w-full"
                    onClick={startCourse}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Learning
                  </NButton>
                ) : (
                  <NButton
                    variant="default"
                    size="lg"
                    className="w-full"
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling
                      ? "Enrolling..."
                      : course.price === 0
                      ? "Enroll for Free"
                      : "Enroll Now"}
                  </NButton>
                )}
              </NCard>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            {course.description && (
              <NCard className="p-6">
                <h2 className="text-2xl font-heading mb-4">About this course</h2>
                <div
                  className="prose max-w-none font-base"
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />
              </NCard>
            )}

            {/* Learning Objectives */}
            {course.learning_objectives && course.learning_objectives.length > 0 && (
              <NCard className="p-6">
                <h2 className="text-2xl font-heading mb-4">What you'll learn</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {course.learning_objectives.map((objective, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-base">{objective}</p>
                    </div>
                  ))}
                </div>
              </NCard>
            )}

            {/* Course Curriculum */}
            <NCard className="p-6">
              <h2 className="text-2xl font-heading mb-4">Course Content</h2>
              <p className="text-sm text-foreground/70 mb-6 font-base">
                {course.sections.length} sections • {totalLessons} lessons • {Math.floor(course.total_duration / 60)}h {course.total_duration % 60}m total
              </p>

              <div className="space-y-2">
                {course.sections.map((section, sectionIndex) => (
                  <div
                    key={section.id}
                    className="border-2 border-border rounded-base overflow-hidden"
                  >
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-main/5 transition-colors"
                    >
                      <div className="flex items-center gap-3 text-left">
                        {expandedSections.has(section.id) ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                        <div>
                          <h3 className="font-heading">
                            Section {sectionIndex + 1}: {section.title}
                          </h3>
                          <p className="text-xs text-foreground/70 font-base mt-1">
                            {section.lessons.length} lessons
                          </p>
                        </div>
                      </div>
                    </button>

                    {expandedSections.has(section.id) && (
                      <div className="border-t-2 border-border bg-secondary-background">
                        {section.lessons.map((lesson, lessonIndex) => {
                          const isClickable = lesson.is_preview || course.is_enrolled
                          const href = isClickable
                            ? (lesson.is_preview && !course.is_enrolled 
                                ? `/learner/preview/${course.id}/${lesson.id}` 
                                : `/learner/learn/${course.id}`)
                            : undefined

                          const className = `p-4 border-b-2 border-border last:border-b-0 flex items-center justify-between ${
                            isClickable 
                              ? 'hover:bg-main/5 cursor-pointer transition-colors' 
                              : ''
                          }`

                          return isClickable && href ? (
                            <Link
                              key={lesson.id}
                              href={href}
                              className={className}
                            >
                              <div className="flex items-center gap-3">
                                {lesson.is_preview || course.is_enrolled ? (
                                  <Play className="w-4 h-4 text-main" />
                                ) : (
                                  <Lock className="w-4 h-4 text-foreground/30" />
                                )}
                                <div>
                                  <p className="font-base text-sm">
                                    {lessonIndex + 1}. {lesson.title}
                                  </p>
                                  {lesson.is_preview && !course.is_enrolled && (
                                    <span className="text-xs text-main font-heading">
                                      Free Preview - Click to watch
                                    </span>
                                  )}
                                </div>
                              </div>
                              {lesson.duration_minutes && (
                                <span className="text-xs text-foreground/70 font-base">
                                  {lesson.duration_minutes} min
                                </span>
                              )}
                            </Link>
                          ) : (
                            <div
                              key={lesson.id}
                              className={className}
                            >
                              <div className="flex items-center gap-3">
                                <Lock className="w-4 h-4 text-foreground/30" />
                                <div>
                                  <p className="font-base text-sm">
                                    {lessonIndex + 1}. {lesson.title}
                                  </p>
                                </div>
                              </div>
                              {lesson.duration_minutes && (
                                <span className="text-xs text-foreground/70 font-base">
                                  {lesson.duration_minutes} min
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </NCard>

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <NCard className="p-6">
                <h2 className="text-2xl font-heading mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {course.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-foreground/50">•</span>
                      <p className="text-sm font-base">{requirement}</p>
                    </li>
                  ))}
                </ul>
              </NCard>
            )}

            {/* Target Audience */}
            {course.target_audience && course.target_audience.length > 0 && (
              <NCard className="p-6">
                <h2 className="text-2xl font-heading mb-4">Who this course is for</h2>
                <ul className="space-y-2">
                  {course.target_audience.map((audience, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-foreground/50">•</span>
                      <p className="text-sm font-base">{audience}</p>
                    </li>
                  ))}
                </ul>
              </NCard>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <NCard className="p-6 sticky top-32">
              <h3 className="font-heading text-lg mb-4">Course includes:</h3>
              <div className="space-y-3 text-sm font-base">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-main" />
                  <span>
                    {Math.floor(course.total_duration / 60)}h {course.total_duration % 60}m on-demand video
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-main" />
                  <span>{totalLessons} lessons</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-main" />
                  <span>Full lifetime access</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t-2 border-border">
                {course.is_enrolled ? (
                  <NButton
                    variant="default"
                    size="lg"
                    className="w-full"
                    onClick={startCourse}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Continue Learning
                  </NButton>
                ) : (
                  <>
                    <div className="text-3xl font-heading text-main mb-4">
                      {course.price === 0 ? "Free" : `$${course.price}`}
                    </div>
                    <NButton
                      variant="default"
                      size="lg"
                      className="w-full"
                      onClick={handleEnroll}
                      disabled={enrolling}
                    >
                      {enrolling
                        ? "Enrolling..."
                        : course.price === 0
                        ? "Enroll for Free"
                        : "Enroll Now"}
                    </NButton>
                  </>
                )}
              </div>
            </NCard>
          </div>
        </div>
      </main>
    </LearnerLayout>
  )
}

