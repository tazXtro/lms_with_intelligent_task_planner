"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { LearnerLayout } from "@/components/learner-layout"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import {
  Play,
  Lock,
  ArrowLeft,
  Clock,
  FileText,
  BookOpen,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import type { Course, CourseLesson } from "@/types/database.types"

interface CourseWithDetails extends Course {
  educator: {
    full_name: string
  } | null
  total_lessons: number
  preview_lessons: number
}

export default function PreviewLessonPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.courseId as string
  const lessonId = params?.lessonId as string
  const supabase = createClient()

  const [course, setCourse] = useState<CourseWithDetails | null>(null)
  const [lesson, setLesson] = useState<CourseLesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    loadPreviewData()
  }, [courseId, lessonId])

  const loadPreviewData = async () => {
    try {
      setLoading(true)

      // Get current user (optional for preview)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Load lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("id", lessonId)
        .single()

      if (lessonError) throw lessonError

      // Check if lesson is actually a preview
      if (!lessonData.is_preview) {
        router.push(`/learner/course/${courseId}`)
        return
      }

      setLesson(lessonData)

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
        .select("full_name")
        .eq("id", courseData.educator_id)
        .single()

      // Get lesson counts
      const { data: sectionsData } = await supabase
        .from("course_sections")
        .select("id")
        .eq("course_id", courseId)

      const sectionIds = (sectionsData || []).map((s) => s.id)
      
      let totalLessons = 0
      let previewLessons = 0
      
      if (sectionIds.length > 0) {
        const { count } = await supabase
          .from("course_lessons")
          .select("*", { count: "exact", head: true })
          .in("section_id", sectionIds)
        
        totalLessons = count || 0

        const { count: previewCount } = await supabase
          .from("course_lessons")
          .select("*", { count: "exact", head: true })
          .in("section_id", sectionIds)
          .eq("is_preview", true)
        
        previewLessons = previewCount || 0
      }

      // Check if user is enrolled
      if (user) {
        const { data: enrollment } = await supabase
          .from("enrollments")
          .select("id")
          .eq("course_id", courseId)
          .eq("learner_id", user.id)
          .single()

        setIsEnrolled(!!enrollment)
      }

      setCourse({
        ...courseData,
        educator: educatorProfile || null,
        total_lessons: totalLessons,
        preview_lessons: previewLessons,
      })
    } catch (err) {
      console.error("Error loading preview:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = () => {
    if (course) {
      router.push(`/learner/course/${course.id}`)
    }
  }

  if (loading) {
    return (
      <LearnerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-main border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-heading text-lg">Loading preview...</p>
          </div>
        </div>
      </LearnerLayout>
    )
  }

  if (!lesson || !course) {
    return (
      <LearnerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Lock className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
            <p className="font-heading text-lg mb-2">Preview not available</p>
            <p className="text-sm text-foreground/70 mb-6">
              This lesson is not available for preview
            </p>
            <Link href="/learner/browse">
              <NButton variant="default">Browse Courses</NButton>
            </Link>
          </div>
        </div>
      </LearnerLayout>
    )
  }

  return (
    <LearnerLayout>
      <div className="min-h-screen bg-background">
        {/* Header with back button */}
        <header className="bg-main/10 border-b-4 border-border">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <Link href={`/learner/course/${courseId}`}>
              <NButton variant="neutral" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Course
              </NButton>
            </Link>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block px-3 py-1 rounded-base text-xs font-heading bg-main text-main-foreground border-2 border-border shadow-shadow">
                FREE PREVIEW
              </span>
              {course.category && (
                <span className="inline-block px-3 py-1 rounded-base text-xs font-heading bg-accent text-accent-foreground border-2 border-border shadow-shadow">
                  {course.category}
                </span>
              )}
            </div>
            
            <h1 className="text-4xl font-heading mb-2">{lesson.title}</h1>
            <p className="text-lg text-foreground/80 font-base">
              From: <strong>{course.title}</strong>
            </p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Section */}
              {lesson.video_url && (
                <div className="relative group">
                  {/* Decorative Background Glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-main/30 via-accent/30 to-main/30 rounded-base blur opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
                  
                  {/* Video Container */}
                  <div className="relative bg-black rounded-base border-4 border-border shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden transition-transform duration-300 group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]">
                    <div className="aspect-video">
                      <video
                        className="w-full h-full"
                        controls
                        src={lesson.video_url}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    
                    {/* Corner Accent */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-main/20 -translate-y-10 translate-x-10 rotate-45 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-accent/20 translate-y-10 -translate-x-10 rotate-45 blur-2xl"></div>
                  </div>
                  
                  {/* Video Type Badge */}
                  <div className="absolute -top-3 -left-3 z-10">
                    <div className="bg-main border-2 border-border rounded-base px-3 py-1.5 shadow-shadow flex items-center gap-2">
                      <Play className="w-4 h-4 text-main-foreground" />
                      <span className="font-heading text-xs text-main-foreground">PREVIEW LESSON</span>
                    </div>
                  </div>
                  
                  {/* Duration Badge */}
                  {lesson.duration_minutes && (
                    <div className="absolute -bottom-3 -right-3 z-10">
                      <div className="bg-accent border-2 border-border rounded-base px-3 py-1.5 shadow-shadow flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent-foreground" />
                        <span className="font-heading text-xs text-accent-foreground">{lesson.duration_minutes} MIN</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Lesson Content */}
              <NCard className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  {lesson.video_url ? (
                    <div className="w-10 h-10 bg-main/10 rounded-full flex items-center justify-center border-2 border-main/20">
                      <Play className="w-5 h-5 text-main" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center border-2 border-accent/20">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                  )}
                  <h2 className="text-2xl md:text-3xl font-heading">{lesson.title}</h2>
                </div>
                
                {lesson.description && (
                  <p className="text-foreground/70 font-base text-lg mb-4 leading-relaxed">
                    {lesson.description}
                  </p>
                )}
                
                {lesson.duration_minutes && (
                  <div className="flex items-center gap-2 mb-6 text-sm text-foreground/60">
                    <Clock className="w-4 h-4" />
                    <span className="font-base">{lesson.duration_minutes} minutes</span>
                  </div>
                )}

                {lesson.content && (
                  <div className="pt-6 border-t-2 border-border">
                    <div
                      className="prose prose-lg max-w-none font-base prose-headings:font-heading prose-p:text-foreground/80 prose-p:leading-relaxed prose-a:text-main prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-main prose-code:bg-main/10 prose-code:px-2 prose-code:py-1 prose-code:rounded"
                      dangerouslySetInnerHTML={{ __html: lesson.content }}
                    />
                  </div>
                )}
              </NCard>

              {/* CTA Card - Enroll */}
              {!isEnrolled && (
                <NCard className="p-8 bg-gradient-to-br from-main/10 to-accent/10 border-2 border-main/30">
                  <div className="text-center">
                    <Lock className="w-12 h-12 text-main mx-auto mb-4" />
                    <h3 className="text-2xl font-heading mb-2">
                      Want to see more?
                    </h3>
                    <p className="text-foreground/70 font-base mb-6">
                      This is just a preview! Enroll in this course to unlock all {course.total_lessons} lessons and start your learning journey.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <NButton
                        variant="default"
                        size="lg"
                        onClick={handleEnroll}
                      >
                        <BookOpen className="w-5 h-5 mr-2" />
                        {course.price === 0 ? "Enroll for Free" : `Enroll Now - $${course.price}`}
                      </NButton>
                      <Link href={`/learner/course/${courseId}`}>
                        <NButton variant="neutral" size="lg">
                          View Course Details
                        </NButton>
                      </Link>
                    </div>
                  </div>
                </NCard>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <NCard className="p-6 sticky top-6">
                {course.thumbnail_url && (
                  <div className="w-full h-40 bg-main/10 rounded-base border-2 border-border overflow-hidden mb-4">
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <h3 className="font-heading text-xl mb-2">{course.title}</h3>
                <p className="text-sm text-foreground/70 mb-4 font-base">
                  By {course.educator?.full_name || "Unknown Educator"}
                </p>

                <div className="space-y-3 mb-6 text-sm font-base">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-main" />
                    <span>{course.total_lessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Play className="w-5 h-5 text-main" />
                    <span>{course.preview_lessons} preview lessons</span>
                  </div>
                  {course.level && (
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-main" />
                      <span className="capitalize">{course.level} level</span>
                    </div>
                  )}
                </div>

                <div className="border-t-2 border-border pt-4 mb-4">
                  <div className="text-3xl font-heading text-main mb-2">
                    {course.price === 0 ? "Free" : `$${course.price}`}
                  </div>
                  {!isEnrolled && (
                    <p className="text-xs text-foreground/60 font-base mb-4">
                      Full lifetime access after enrollment
                    </p>
                  )}
                </div>

                {isEnrolled ? (
                  <Link href={`/learner/learn/${courseId}`}>
                    <NButton variant="default" size="lg" className="w-full">
                      <Play className="w-5 h-5 mr-2" />
                      Continue Learning
                    </NButton>
                  </Link>
                ) : (
                  <NButton
                    variant="default"
                    size="lg"
                    className="w-full"
                    onClick={handleEnroll}
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    {course.price === 0 ? "Enroll for Free" : "Enroll Now"}
                  </NButton>
                )}

                <Link href={`/learner/course/${courseId}`}>
                  <NButton variant="neutral" size="sm" className="w-full mt-2">
                    View Full Course Details
                  </NButton>
                </Link>
              </NCard>
            </div>
          </div>
        </main>
      </div>
    </LearnerLayout>
  )
}

