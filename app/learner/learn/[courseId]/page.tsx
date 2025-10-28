"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { Progress } from "@/components/ui/progress"
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Play,
  FileText,
  Menu,
  X,
  ArrowLeft,
  Book,
  Clock,
  Award,
  BarChart3,
  RotateCcw,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import type {
  Course,
  CourseSection,
  CourseLesson,
  Enrollment,
  LessonProgress,
} from "@/types/database.types"

interface SectionWithLessons extends CourseSection {
  lessons: (CourseLesson & {
    is_completed: boolean
  })[]
}

interface CourseWithSections extends Course {
  sections: SectionWithLessons[]
}

export default function CoursePlayerPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.courseId as string
  const supabase = createClient()

  const [course, setCourse] = useState<CourseWithSections | null>(null)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [currentLesson, setCurrentLesson] = useState<CourseLesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [completingLesson, setCompletingLesson] = useState(false)

  useEffect(() => {
    loadCourseData()
  }, [courseId])

  const loadCourseData = async () => {
    try {
      setLoading(true)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth")
        return
      }

      // Check enrollment
      const { data: enrollmentData, error: enrollError } = await supabase
        .from("enrollments")
        .select("*")
        .eq("course_id", courseId)
        .eq("learner_id", user.id)
        .single()

      if (enrollError || !enrollmentData) {
        router.push(`/learner/course/${courseId}`)
        return
      }

      setEnrollment(enrollmentData)

      // Load course with sections and lessons
      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single()

      const { data: sectionsData } = await supabase
        .from("course_sections")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index")

      // Load lessons with completion status
      const sections = await Promise.all(
        (sectionsData || []).map(async (section) => {
          const { data: lessonsData } = await supabase
            .from("course_lessons")
            .select("*")
            .eq("section_id", section.id)
            .order("order_index")

          const lessonsWithProgress = await Promise.all(
            (lessonsData || []).map(async (lesson) => {
              const { data: progressData } = await supabase
                .from("lesson_progress")
                .select("*")
                .eq("enrollment_id", enrollmentData.id)
                .eq("lesson_id", lesson.id)
                .single()

              return {
                ...lesson,
                is_completed: progressData?.completed || false,
              }
            })
          )

          return {
            ...section,
            lessons: lessonsWithProgress,
          }
        })
      )

      setCourse({
        ...courseData,
        sections,
      })

      // Set first lesson as current if none selected
      if (sections.length > 0 && sections[0].lessons.length > 0) {
        setCurrentLesson(sections[0].lessons[0])
      }
    } catch (err) {
      console.error("Error loading course data:", err)
    } finally {
      setLoading(false)
    }
  }

  const markLessonComplete = async () => {
    if (!currentLesson || !enrollment) return

    try {
      setCompletingLesson(true)

      // Insert or update lesson progress
      const { error: progressError } = await supabase.from("lesson_progress").upsert({
        enrollment_id: enrollment.id,
        lesson_id: currentLesson.id,
        completed: true,
        completed_at: new Date().toISOString(),
      })

      if (progressError) throw progressError

      // Update enrollment progress
      await updateEnrollmentProgress()

      // Reload data to reflect changes
      await loadCourseData()
    } catch (err) {
      console.error("Error marking lesson complete:", err)
      alert("Failed to mark lesson as complete")
    } finally {
      setCompletingLesson(false)
    }
  }

  const markLessonIncomplete = async () => {
    if (!currentLesson || !enrollment) return

    try {
      setCompletingLesson(true)

      // Delete the lesson progress record to mark as incomplete
      const { error: progressError } = await supabase
        .from("lesson_progress")
        .delete()
        .eq("enrollment_id", enrollment.id)
        .eq("lesson_id", currentLesson.id)

      if (progressError) {
        console.error("Delete error:", progressError)
        throw progressError
      }

      // Update enrollment progress
      await updateEnrollmentProgress()

      // Reload data to reflect changes
      await loadCourseData()
    } catch (err) {
      console.error("Error marking lesson incomplete:", err)
      alert("Failed to mark lesson as incomplete. Please try again.")
    } finally {
      setCompletingLesson(false)
    }
  }

  const updateEnrollmentProgress = async () => {
    if (!course || !enrollment) return

    const totalLessons = course.sections.reduce(
      (total, section) => total + section.lessons.length,
      0
    )
    const completedLessons = course.sections.reduce(
      (total, section) =>
        total + section.lessons.filter((l) => l.is_completed).length,
      0
    )

    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    await supabase
      .from("enrollments")
      .update({ progress })
      .eq("id", enrollment.id)
  }

  const goToNextLesson = () => {
    if (!course || !currentLesson) return

    let found = false
    for (const section of course.sections) {
      for (let i = 0; i < section.lessons.length; i++) {
        if (found) {
          setCurrentLesson(section.lessons[i])
          return
        }
        if (section.lessons[i].id === currentLesson.id) {
          found = true
        }
      }
    }
  }

  const goToPreviousLesson = () => {
    if (!course || !currentLesson) return

    let previousLesson: CourseLesson | null = null
    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        if (lesson.id === currentLesson.id) {
          if (previousLesson) {
            setCurrentLesson(previousLesson)
          }
          return
        }
        previousLesson = lesson
      }
    }
  }

  const selectLesson = (lesson: CourseLesson) => {
    setCurrentLesson(lesson)
    setSidebarOpen(false) // Close sidebar on mobile after selection
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-main border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-heading text-lg">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course || !enrollment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="font-heading text-lg mb-4">Course not found or access denied</p>
          <Link href="/learner/courses">
            <NButton variant="default">My Courses</NButton>
          </Link>
        </div>
      </div>
    )
  }

  const totalLessons = course.sections.reduce(
    (total, section) => total + section.lessons.length,
    0
  )
  const completedLessons = course.sections.reduce(
    (total, section) => total + section.lessons.filter((l) => l.is_completed).length,
    0
  )

  const currentLessonCompleted = course.sections
    .flatMap(s => s.lessons)
    .find(l => l.id === currentLesson?.id)?.is_completed

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Elegant Sidebar - Curriculum */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 w-full md:w-96 bg-white dark:bg-secondary-background border-r-4 border-border overflow-y-auto z-40 transform transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } md:h-screen`}
      >
        {/* Header Section */}
        <div className="p-6 border-b-4 border-border sticky top-0 bg-white dark:bg-secondary-background z-10 shadow-sm">
          <Link href="/learner/courses" className="inline-block mb-4">
            <NButton variant="neutral" size="sm" className="group">
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Exit Course
            </NButton>
          </Link>
          
          <h2 className="font-heading text-xl line-clamp-2 mb-6">{course.title}</h2>
          
          {/* Progress Stats */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-foreground/70">
                <BarChart3 className="w-4 h-4" />
                <span className="font-base">Your Progress</span>
              </div>
              <span className="font-heading text-lg text-main">
                {Math.round((completedLessons / totalLessons) * 100)}%
              </span>
            </div>
            <Progress value={(completedLessons / totalLessons) * 100} className="h-3" />
            
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-foreground/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                {completedLessons} completed
              </span>
              <span className="flex items-center gap-1.5 text-foreground/60">
                <Book className="w-3.5 h-3.5 text-main" />
                {totalLessons - completedLessons} remaining
              </span>
            </div>
          </div>
        </div>

        {/* Course Curriculum */}
        <div className="p-4 pb-20 md:pb-4">
          {course.sections.map((section, sectionIndex) => {
            const sectionCompleted = section.lessons.filter(l => l.is_completed).length
            const sectionTotal = section.lessons.length
            
            return (
              <div key={section.id} className="mb-6">
                <div className="flex items-center justify-between px-3 py-2 mb-2">
                  <h3 className="font-heading text-sm uppercase tracking-wide text-foreground/80">
                    Section {sectionIndex + 1}: {section.title}
                  </h3>
                  <span className="text-xs text-foreground/50 font-base">
                    {sectionCompleted}/{sectionTotal}
                  </span>
                </div>
                
                <div className="space-y-1">
                  {section.lessons.map((lesson, lessonIndex) => {
                    const isActive = currentLesson?.id === lesson.id
                    
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(lesson)}
                        className={`w-full text-left p-4 rounded-base flex items-start gap-3 transition-all duration-200 border-2 group ${
                          isActive
                            ? "bg-main/10 border-main shadow-sm scale-[1.02]"
                            : "border-transparent hover:bg-main/5 hover:border-border/50 hover:shadow-sm"
                        }`}
                      >
                        {/* Completion Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          {lesson.is_completed ? (
                            <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center border-2 border-border">
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isActive ? "border-main bg-main/10" : "border-border group-hover:border-main/50"
                            }`}>
                              <span className="text-xs font-heading text-foreground/50">
                                {lessonIndex + 1}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Lesson Info */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm line-clamp-2 mb-1 ${
                            isActive ? "font-heading text-main" : "font-base"
                          }`}>
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-foreground/50">
                            {lesson.duration_minutes && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {lesson.duration_minutes} min
                              </span>
                            )}
                            {lesson.video_url ? (
                              <span className="flex items-center gap-1">
                                <Play className="w-3 h-3" />
                                Video
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                Article
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Active Indicator */}
                        {isActive && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-main rounded-full animate-pulse" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
          
          {/* Completion Message */}
          {completedLessons === totalLessons && (
            <NCard className="p-6 bg-success/10 border-success/30 text-center">
              <Award className="w-12 h-12 text-success mx-auto mb-3" />
              <h3 className="font-heading text-lg mb-2 text-success">Course Completed! 🎉</h3>
              <p className="text-sm text-foreground/70 font-base">
                Congratulations on completing all lessons!
              </p>
            </NCard>
          )}
        </div>
      </aside>

      {/* Main Learning Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Sleek Top Bar */}
        <header className="bg-white dark:bg-background border-b-4 border-border px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-main/10 rounded-base transition-all duration-200 border-2 border-border hover:scale-105 active:scale-95"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="flex-1 flex items-center justify-center md:justify-start gap-3">
            <h1 className="font-heading text-lg md:text-xl line-clamp-1">
              {currentLesson?.title}
            </h1>
            {currentLessonCompleted && (
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 text-sm bg-main/5 px-3 py-1.5 rounded-base border-2 border-border">
              <BarChart3 className="w-4 h-4 text-main" />
              <span className="font-heading text-main">
                {Math.round((completedLessons / totalLessons) * 100)}%
              </span>
            </div>
          </div>
        </header>

        {/* Video/Content Area with Enhanced Design */}
        <div className="flex-1 overflow-y-auto bg-background">
          {currentLesson?.video_url && (
            <div className="w-full py-8 px-4 md:px-6 bg-gradient-to-b from-black/5 to-background">
              <div className="max-w-5xl mx-auto">
                {/* Video Player Card */}
                <div className="relative group">
                  {/* Decorative Background Glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-main/30 via-accent/30 to-main/30 rounded-base blur opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
                  
                  {/* Video Container */}
                  <div className="relative bg-black rounded-base border-4 border-border shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden transition-transform duration-300 group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]">
                    <div className="aspect-video">
                      <video
                        key={currentLesson.id}
                        className="w-full h-full"
                        controls
                        autoPlay
                        src={currentLesson.video_url}
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
                    <div className="bg-main border-2 border-border rounded-base px-3 py-1.5 shadow-shadow flex items-center gap-2 animate-in fade-in slide-in-from-left-5 duration-500">
                      <Play className="w-4 h-4 text-main-foreground" />
                      <span className="font-heading text-xs text-main-foreground">VIDEO LESSON</span>
                    </div>
                  </div>
                  
                  {/* Duration Badge (if available) */}
                  {currentLesson?.duration_minutes && (
                    <div className="absolute -bottom-3 -right-3 z-10">
                      <div className="bg-accent border-2 border-border rounded-base px-3 py-1.5 shadow-shadow flex items-center gap-2 animate-in fade-in slide-in-from-right-5 duration-500 delay-150">
                        <Clock className="w-4 h-4 text-accent-foreground" />
                        <span className="font-heading text-xs text-accent-foreground">{currentLesson.duration_minutes} MIN</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
            {/* Lesson Header Card */}
            <NCard className="p-6 md:p-8 mb-6 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    {currentLesson?.video_url ? (
                      <div className="w-10 h-10 bg-main/10 rounded-full flex items-center justify-center border-2 border-main/20">
                        <Play className="w-5 h-5 text-main" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center border-2 border-accent/20">
                        <FileText className="w-5 h-5 text-accent" />
                      </div>
                    )}
                    <h2 className="text-2xl md:text-3xl font-heading">{currentLesson?.title}</h2>
                  </div>
                  
                  {currentLesson?.description && (
                    <p className="text-foreground/70 font-base text-base md:text-lg leading-relaxed">
                      {currentLesson.description}
                    </p>
                  )}
                  
                  {currentLesson?.duration_minutes && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-foreground/60">
                      <Clock className="w-4 h-4" />
                      <span className="font-base">{currentLesson.duration_minutes} minutes</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-3">
                  {!currentLessonCompleted ? (
                    <NButton
                      variant="default"
                      size="lg"
                      onClick={markLessonComplete}
                      disabled={completingLesson}
                      className="group"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      {completingLesson ? "Marking Complete..." : "Mark as Complete"}
                    </NButton>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 px-4 py-2 bg-success/10 rounded-base border-2 border-success/30">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                        <span className="font-heading text-success">Completed</span>
                      </div>
                      <NButton
                        variant="neutral"
                        size="sm"
                        onClick={markLessonIncomplete}
                        disabled={completingLesson}
                        className="group"
                      >
                        <RotateCcw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                        {completingLesson ? "Unmarking..." : "Mark as Incomplete"}
                      </NButton>
                    </>
                  )}
                </div>
              </div>

              {/* Lesson Content */}
              {currentLesson?.content && (
                <div className="pt-6 border-t-2 border-border">
                  <div
                    className="prose prose-lg max-w-none font-base prose-headings:font-heading prose-p:text-foreground/80 prose-p:leading-relaxed prose-a:text-main prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-main prose-code:bg-main/10 prose-code:px-2 prose-code:py-1 prose-code:rounded"
                    dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                  />
                </div>
              )}
            </NCard>

            {/* Elegant Navigation */}
            <div className="flex items-center justify-between gap-4 pb-12">
              <NButton
                variant="neutral"
                size="lg"
                onClick={goToPreviousLesson}
                disabled={course.sections[0].lessons[0].id === currentLesson?.id}
                className="group flex-1 md:flex-initial"
              >
                <ChevronLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
                Previous
              </NButton>
              
              <NButton 
                variant="default" 
                size="lg" 
                onClick={goToNextLesson}
                className="group flex-1 md:flex-initial"
              >
                Next Lesson
                <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </NButton>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay with smooth transition */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

