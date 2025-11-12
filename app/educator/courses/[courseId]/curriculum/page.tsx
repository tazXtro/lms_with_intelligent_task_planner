"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { EducatorLayout } from "@/components/educator-layout"
import { NButton } from "@/components/ui/nbutton"
import { NInput } from "@/components/ui/ninput"
import { NLabel } from "@/components/ui/nlabel"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "@/components/rich-text-editor"
import { FileUpload } from "@/components/file-upload"
import { AITeachingAssistant } from "@/components/ai-teaching-assistant"
import { createClient } from "@/utils/supabase/client"
import {
  ArrowLeft,
  Plus,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Edit,
  Trash2,
  Video,
  FileText,
  Save,
  Eye,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import type { Course, CourseSection, CourseLesson } from "@/types/database.types"

interface SectionWithLessons extends CourseSection {
  lessons: CourseLesson[]
}

export default function CurriculumBuilderPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params?.courseId as string
  const supabase = createClient()

  const [course, setCourse] = useState<Course | null>(null)
  const [sections, setSections] = useState<SectionWithLessons[]>([])
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // AI Assistant State
  const [showAI, setShowAI] = useState(false)
  const [aiMode, setAiMode] = useState<"course-outline" | "content-enhancer" | "assessment-generator" | "student-insights">("assessment-generator")

  // Section form state
  const [showSectionForm, setShowSectionForm] = useState(false)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [sectionTitle, setSectionTitle] = useState("")
  const [sectionDescription, setSectionDescription] = useState("")

  // Lesson form state
  const [showLessonForm, setShowLessonForm] = useState(false)
  const [editingLesson, setEditingLesson] = useState<string | null>(null)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [lessonTitle, setLessonTitle] = useState("")
  const [lessonDescription, setLessonDescription] = useState("")
  const [lessonContent, setLessonContent] = useState("")
  const [lessonVideoUrl, setLessonVideoUrl] = useState("")
  const [lessonDuration, setLessonDuration] = useState("")
  const [lessonIsPreview, setLessonIsPreview] = useState(false)

  useEffect(() => {
    loadCourseData()
  }, [courseId])

  const loadCourseData = async () => {
    try {
      setLoading(true)

      // Load course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single()

      if (courseError) throw courseError
      setCourse(courseData)

      // Load sections with lessons
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("course_sections")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true })

      if (sectionsError) throw sectionsError

      // Load lessons for each section
      const sectionsWithLessons = await Promise.all(
        (sectionsData || []).map(async (section) => {
          const { data: lessonsData } = await supabase
            .from("course_lessons")
            .select("*")
            .eq("section_id", section.id)
            .order("order_index", { ascending: true })

          return {
            ...section,
            lessons: lessonsData || [],
          }
        })
      )

      setSections(sectionsWithLessons)
    } catch (err) {
      console.error("Error loading course data:", err)
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

  const openSectionForm = (section?: SectionWithLessons) => {
    if (section) {
      setEditingSection(section.id)
      setSectionTitle(section.title)
      setSectionDescription(section.description || "")
    } else {
      setEditingSection(null)
      setSectionTitle("")
      setSectionDescription("")
    }
    setShowSectionForm(true)
  }

  const saveSectionForm = async () => {
    try {
      setSaving(true)

      if (editingSection) {
        // Update existing section
        const { error } = await supabase
          .from("course_sections")
          .update({
            title: sectionTitle,
            description: sectionDescription,
          })
          .eq("id", editingSection)

        if (error) throw error
      } else {
        // Create new section
        const { error } = await supabase.from("course_sections").insert({
          course_id: courseId,
          title: sectionTitle,
          description: sectionDescription,
          order_index: sections.length,
        })

        if (error) throw error
      }

      setShowSectionForm(false)
      setSectionTitle("")
      setSectionDescription("")
      setEditingSection(null)
      await loadCourseData()
    } catch (err) {
      console.error("Error saving section:", err)
      alert("Failed to save section")
    } finally {
      setSaving(false)
    }
  }

  const deleteSection = async (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this section and all its lessons?")) {
      return
    }

    try {
      const { error } = await supabase.from("course_sections").delete().eq("id", sectionId)

      if (error) throw error
      await loadCourseData()
    } catch (err) {
      console.error("Error deleting section:", err)
      alert("Failed to delete section")
    }
  }

  const openLessonForm = (sectionId: string, lesson?: CourseLesson) => {
    setSelectedSectionId(sectionId)
    if (lesson) {
      setEditingLesson(lesson.id)
      setLessonTitle(lesson.title)
      setLessonDescription(lesson.description || "")
      setLessonContent(lesson.content || "")
      setLessonVideoUrl(lesson.video_url || "")
      setLessonDuration(lesson.duration_minutes?.toString() || "")
      setLessonIsPreview(lesson.is_preview || false)
    } else {
      setEditingLesson(null)
      setLessonTitle("")
      setLessonDescription("")
      setLessonContent("")
      setLessonVideoUrl("")
      setLessonDuration("")
      setLessonIsPreview(false)
    }
    setShowLessonForm(true)
  }

  const saveLessonForm = async () => {
    if (!selectedSectionId) return

    try {
      setSaving(true)

      const section = sections.find((s) => s.id === selectedSectionId)
      if (!section) return

      if (editingLesson) {
        // Update existing lesson
        const { error } = await supabase
          .from("course_lessons")
          .update({
            title: lessonTitle,
            description: lessonDescription,
            content: lessonContent,
            video_url: lessonVideoUrl || null,
            duration_minutes: lessonDuration ? parseInt(lessonDuration) : null,
            is_preview: lessonIsPreview,
          })
          .eq("id", editingLesson)

        if (error) throw error
      } else {
        // Create new lesson
        const { error } = await supabase.from("course_lessons").insert({
          course_id: courseId,
          section_id: selectedSectionId,
          title: lessonTitle,
          description: lessonDescription,
          content: lessonContent,
          video_url: lessonVideoUrl || null,
          duration_minutes: lessonDuration ? parseInt(lessonDuration) : null,
          is_preview: lessonIsPreview,
          order_index: section.lessons.length,
        })

        if (error) throw error
      }

      setShowLessonForm(false)
      setSelectedSectionId(null)
      setLessonTitle("")
      setLessonDescription("")
      setLessonContent("")
      setLessonVideoUrl("")
      setLessonDuration("")
      setLessonIsPreview(false)
      setEditingLesson(null)
      await loadCourseData()
    } catch (err) {
      console.error("Error saving lesson:", err)
      alert("Failed to save lesson")
    } finally {
      setSaving(false)
    }
  }

  const deleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) {
      return
    }

    try {
      const { error } = await supabase.from("course_lessons").delete().eq("id", lessonId)

      if (error) throw error
      await loadCourseData()
    } catch (err) {
      console.error("Error deleting lesson:", err)
      alert("Failed to delete lesson")
    }
  }

  const handleEnhanceLessonContent = () => {
    if (!lessonContent.trim()) {
      alert("Please add some lesson content first")
      return
    }
    
    setAiMode("content-enhancer")
    setShowAI(true)
  }

  const handleGenerateAssessment = () => {
    if (!lessonContent.trim()) {
      alert("Please add some lesson content first to generate questions")
      return
    }
    
    setAiMode("assessment-generator")
    setShowAI(true)
  }

  const handleEnhancedContentApply = (enhanced: any) => {
    if (typeof enhanced === 'string') {
      setLessonContent(enhanced)
    }
    setShowAI(false)
  }

  const handleAssessmentApply = async (assessment: any) => {
    if (!editingLesson && !selectedSectionId) {
      alert("Please save the lesson first before creating an assessment")
      return
    }

    try {
      setSaving(true)

      // If we're editing an existing lesson, use its ID
      // Otherwise, we need to save the lesson first
      let lessonIdToUse = editingLesson

      if (!lessonIdToUse) {
        alert("Please save the lesson first, then generate the assessment")
        setShowAI(false)
        setSaving(false)
        return
      }

      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId: lessonIdToUse,
          courseId: courseId,
          title: `${lessonTitle} - Quiz`,
          description: `Assessment for ${lessonTitle}`,
          difficulty: assessment.difficulty || 'medium',
          questions: assessment.questions,
          passingScore: 70,
          isRequired: false
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save assessment')
      }

      alert(`✅ Assessment saved successfully with ${assessment.questions?.length || 0} questions!\n\nLearners can now take this quiz when they view this lesson.`)
      setShowAI(false)
      await loadCourseData()
    } catch (error) {
      console.error("Error saving assessment:", error)
      alert(`Failed to save assessment: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const publishCourse = async () => {
    if (!confirm("Are you sure you want to publish this course? It will be visible to learners.")) {
      return
    }

    try {
      setSaving(true)
      const { error } = await supabase
        .from("courses")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
        })
        .eq("id", courseId)

      if (error) throw error

      alert("Course published successfully!")
      router.push("/educator/courses")
    } catch (err) {
      console.error("Error publishing course:", err)
      alert("Failed to publish course")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <EducatorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-main border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-heading text-lg">Loading course...</p>
          </div>
        </div>
      </EducatorLayout>
    )
  }

  return (
    <EducatorLayout>
      <header className="sticky top-0 z-30 bg-background border-b-4 border-border">
        <div className="px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/educator/courses">
              <NButton variant="neutral" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </NButton>
            </Link>
            <div>
              <h1 className="text-3xl font-heading">{course?.title}</h1>
              <p className="text-sm text-foreground/70 font-base">Build your course curriculum</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href={`/educator/courses/${courseId}/edit`}>
              <NButton variant="neutral" size="lg">
                <Edit className="w-5 h-5 mr-2" />
                Edit Details
              </NButton>
            </Link>
            <NButton variant="default" size="lg" onClick={publishCourse} disabled={saving}>
              {saving ? "Publishing..." : "Publish Course"}
            </NButton>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-5xl mx-auto">
        {/* Add Section Button */}
        <div className="mb-6">
          <NButton variant="default" size="lg" onClick={() => openSectionForm()}>
            <Plus className="w-5 h-5 mr-2" />
            Add Section
          </NButton>
        </div>

        {/* Sections List */}
        <div className="space-y-4">
          {sections.map((section, sectionIndex) => (
            <div
              key={section.id}
              className="bg-white border-2 border-border rounded-base shadow-shadow overflow-hidden"
            >
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-main/5 transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <GripVertical className="w-5 h-5 text-foreground/30" />
                  {expandedSections.has(section.id) ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-heading text-lg">
                      Section {sectionIndex + 1}: {section.title}
                    </h3>
                    {section.description && (
                      <p className="text-sm text-foreground/70 font-base">
                        {section.description}
                      </p>
                    )}
                    <p className="text-xs text-foreground/50 font-base mt-1">
                      {section.lessons.length} lesson{section.lessons.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <NButton
                    variant="neutral"
                    size="sm"
                    onClick={() => openSectionForm(section)}
                  >
                    <Edit className="w-4 h-4" />
                  </NButton>
                  <NButton
                    variant="neutral"
                    size="sm"
                    onClick={() => deleteSection(section.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </NButton>
                </div>
              </div>

              {expandedSections.has(section.id) && (
                <div className="border-t-2 border-border bg-secondary-background p-4">
                  <div className="space-y-2 mb-4">
                    {section.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className="bg-white border-2 border-border rounded-base p-3 flex items-center justify-between hover:bg-main/5 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <GripVertical className="w-4 h-4 text-foreground/30" />
                          {lesson.video_url ? (
                            <Video className="w-5 h-5 text-main" />
                          ) : (
                            <FileText className="w-5 h-5 text-accent" />
                          )}
                          <div className="flex-1">
                            <p className="font-heading text-sm">
                              Lesson {lessonIndex + 1}: {lesson.title}
                            </p>
                            <div className="flex gap-3 text-xs text-foreground/70 font-base mt-1">
                              {lesson.duration_minutes && (
                                <span>{lesson.duration_minutes} min</span>
                              )}
                              {lesson.is_preview && (
                                <span className="text-main font-heading">Preview</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <NButton
                            variant="neutral"
                            size="sm"
                            onClick={() => openLessonForm(section.id, lesson)}
                          >
                            <Edit className="w-3 h-3" />
                          </NButton>
                          <NButton
                            variant="neutral"
                            size="sm"
                            onClick={() => deleteLesson(lesson.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </NButton>
                        </div>
                      </div>
                    ))}
                  </div>
                  <NButton
                    variant="default"
                    size="sm"
                    onClick={() => openLessonForm(section.id)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lesson
                  </NButton>
                </div>
              )}
            </div>
          ))}
        </div>

        {sections.length === 0 && (
          <div className="text-center py-16 bg-white border-2 border-border rounded-base">
            <div className="w-20 h-20 bg-main/10 border-2 border-border rounded-base flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-foreground/50" />
            </div>
            <p className="text-foreground/70 font-base text-lg mb-4">
              No sections yet. Start building your course curriculum!
            </p>
            <NButton variant="default" onClick={() => openSectionForm()}>
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Section
            </NButton>
          </div>
        )}
      </main>

      {/* Section Form Modal */}
      {showSectionForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-border rounded-base shadow-shadow max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b-2 border-border">
              <h2 className="text-2xl font-heading">
                {editingSection ? "Edit Section" : "Add New Section"}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <NLabel htmlFor="section-title">Section Title *</NLabel>
                <NInput
                  id="section-title"
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  placeholder="e.g., Getting Started"
                />
              </div>
              <div>
                <NLabel htmlFor="section-description">Section Description</NLabel>
                <Textarea
                  id="section-description"
                  value={sectionDescription}
                  onChange={(e) => setSectionDescription(e.target.value)}
                  placeholder="Optional description of what this section covers"
                  rows={3}
                />
              </div>
            </div>
            <div className="p-6 border-t-2 border-border flex justify-end gap-3">
              <NButton
                variant="neutral"
                onClick={() => {
                  setShowSectionForm(false)
                  setEditingSection(null)
                }}
              >
                Cancel
              </NButton>
              <NButton variant="default" onClick={saveSectionForm} disabled={saving || !sectionTitle}>
                {saving ? "Saving..." : "Save Section"}
              </NButton>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Form Modal */}
      {showLessonForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-border rounded-base shadow-shadow max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b-2 border-border">
              <h2 className="text-2xl font-heading">
                {editingLesson ? "Edit Lesson" : "Add New Lesson"}
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <NLabel htmlFor="lesson-title">Lesson Title *</NLabel>
                <NInput
                  id="lesson-title"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g., Introduction to the Course"
                />
              </div>

              <div>
                <NLabel htmlFor="lesson-description">Lesson Description</NLabel>
                <Textarea
                  id="lesson-description"
                  value={lessonDescription}
                  onChange={(e) => setLessonDescription(e.target.value)}
                  placeholder="Brief description of the lesson"
                  rows={2}
                />
              </div>

              <div>
                <NLabel>Lesson Video</NLabel>
                <FileUpload
                  bucket="course-videos"
                  accept={{ "video/*": [".mp4", ".webm", ".mov"] }}
                  maxSize={500 * 1024 * 1024}
                  onUploadComplete={setLessonVideoUrl}
                  existingUrl={lessonVideoUrl}
                  label="Upload lesson video"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <NLabel htmlFor="lesson-content">Lesson Content</NLabel>
                  <div className="flex gap-2">
                    {lessonContent && (
                      <>
                        <NButton
                          variant="neutral"
                          size="sm"
                          onClick={handleEnhanceLessonContent}
                        >
                          <Sparkles className="w-3 h-3 mr-2" />
                          Enhance Content
                        </NButton>
                        <NButton
                          variant="accent"
                          size="sm"
                          onClick={handleGenerateAssessment}
                        >
                          <Sparkles className="w-3 h-3 mr-2" />
                          Generate Quiz
                        </NButton>
                      </>
                    )}
                  </div>
                </div>
                <RichTextEditor
                  content={lessonContent}
                  onChange={setLessonContent}
                  placeholder="Write your lesson content here..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <NLabel htmlFor="lesson-duration">Duration (minutes)</NLabel>
                  <NInput
                    id="lesson-duration"
                    type="number"
                    min="0"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(e.target.value)}
                    placeholder="e.g., 15"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lessonIsPreview}
                      onChange={(e) => setLessonIsPreview(e.target.checked)}
                      className="w-5 h-5 border-2 border-border rounded"
                    />
                    <span className="font-base text-sm">
                      Make this lesson free to preview
                    </span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t-2 border-border flex justify-end gap-3">
              <NButton
                variant="neutral"
                onClick={() => {
                  setShowLessonForm(false)
                  setEditingLesson(null)
                  setSelectedSectionId(null)
                }}
              >
                Cancel
              </NButton>
              <NButton variant="default" onClick={saveLessonForm} disabled={saving || !lessonTitle}>
                {saving ? "Saving..." : "Save Lesson"}
              </NButton>
            </div>
          </div>
        </div>
      )}

      {/* AI Teaching Assistant Modal */}
      {showAI && (
        <AITeachingAssistant
          mode={aiMode}
          onClose={() => setShowAI(false)}
          onApply={aiMode === "assessment-generator" ? handleAssessmentApply : handleEnhancedContentApply}
          initialData={
            aiMode === "assessment-generator"
              ? { content: lessonContent, title: lessonTitle }
              : aiMode === "content-enhancer"
              ? { text: lessonContent, type: "lessonContent" }
              : undefined
          }
        />
      )}
    </EducatorLayout>
  )
}

