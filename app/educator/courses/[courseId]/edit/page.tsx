"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { EducatorLayout } from "@/components/educator-layout"
import { NButton } from "@/components/ui/nbutton"
import { NInput } from "@/components/ui/ninput"
import { NLabel } from "@/components/ui/nlabel"
import { Select } from "@/components/ui/select"
import { RichTextEditor } from "@/components/rich-text-editor"
import { FileUpload } from "@/components/file-upload"
import { createClient } from "@/utils/supabase/client"
import { ArrowLeft, Save, Plus, X, Trash2 } from "lucide-react"
import Link from "next/link"
import type { Course } from "@/types/database.types"

const categories = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "UI/UX Design",
  "Business",
  "Marketing",
  "Other",
]

const levels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "all", label: "All Levels" },
]

export default function EditCoursePage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params?.courseId as string
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Course basic info
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [level, setLevel] = useState("beginner")
  const [price, setPrice] = useState("0")
  const [thumbnailUrl, setThumbnailUrl] = useState("")

  // Arrays for objectives, requirements, and target audience
  const [objectives, setObjectives] = useState<string[]>([""])
  const [requirements, setRequirements] = useState<string[]>([""])
  const [targetAudience, setTargetAudience] = useState<string[]>([""])

  useEffect(() => {
    loadCourse()
  }, [courseId])

  const loadCourse = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single()

      if (error) throw error

      // Populate form with course data
      setTitle(data.title)
      setSubtitle(data.subtitle || "")
      setDescription(data.description || "")
      setCategory(data.category || "")
      setLevel(data.level || "beginner")
      setPrice(data.price?.toString() || "0")
      setThumbnailUrl(data.thumbnail_url || "")
      setObjectives(data.learning_objectives || [""])
      setRequirements(data.requirements || [""])
      setTargetAudience(data.target_audience || [""])
    } catch (err) {
      console.error("Error loading course:", err)
      setError("Failed to load course")
    } finally {
      setLoading(false)
    }
  }

  const addArrayItem = (arr: string[], setArr: (arr: string[]) => void) => {
    setArr([...arr, ""])
  }

  const removeArrayItem = (
    arr: string[],
    setArr: (arr: string[]) => void,
    index: number
  ) => {
    setArr(arr.filter((_, i) => i !== index))
  }

  const updateArrayItem = (
    arr: string[],
    setArr: (arr: string[]) => void,
    index: number,
    value: string
  ) => {
    const newArr = [...arr]
    newArr[index] = value
    setArr(newArr)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      if (!title.trim()) {
        throw new Error("Course title is required")
      }

      const filteredObjectives = objectives.filter((obj) => obj.trim() !== "")
      const filteredRequirements = requirements.filter((req) => req.trim() !== "")
      const filteredTargetAudience = targetAudience.filter((aud) => aud.trim() !== "")

      const { error: updateError } = await supabase
        .from("courses")
        .update({
          title: title.trim(),
          subtitle: subtitle.trim() || null,
          description: description || null,
          category: category || null,
          level,
          price: parseFloat(price) || 0,
          thumbnail_url: thumbnailUrl || null,
          learning_objectives: filteredObjectives.length > 0 ? filteredObjectives : null,
          requirements: filteredRequirements.length > 0 ? filteredRequirements : null,
          target_audience: filteredTargetAudience.length > 0 ? filteredTargetAudience : null,
        })
        .eq("id", courseId)

      if (updateError) throw updateError

      router.push(`/educator/courses/${courseId}/curriculum`)
    } catch (err) {
      console.error("Error saving course:", err)
      setError(err instanceof Error ? err.message : "Failed to save course")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this course? This action cannot be undone."
      )
    ) {
      return
    }

    try {
      setSaving(true)
      const { error: deleteError } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId)

      if (deleteError) throw deleteError

      router.push("/educator/courses")
    } catch (err) {
      console.error("Error deleting course:", err)
      setError("Failed to delete course")
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
            <Link href={`/educator/courses/${courseId}/curriculum`}>
              <NButton variant="neutral" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </NButton>
            </Link>
            <h1 className="text-3xl font-heading">Edit Course</h1>
          </div>
          <div className="flex gap-3">
            <NButton variant="neutral" size="lg" onClick={handleDelete} disabled={saving}>
              <Trash2 className="w-5 h-5 mr-2" />
              Delete
            </NButton>
            <NButton variant="default" size="lg" onClick={handleSave} disabled={saving}>
              <Save className="w-5 h-5 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </NButton>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-5xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive rounded-base">
            <p className="text-destructive font-base">{error}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Basic Information */}
          <section className="bg-white border-2 border-border rounded-base p-6 shadow-shadow">
            <h2 className="text-2xl font-heading mb-6">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <NLabel htmlFor="title">Course Title *</NLabel>
                <NInput
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Complete Web Development Bootcamp"
                  required
                />
              </div>

              <div>
                <NLabel htmlFor="subtitle">Course Subtitle</NLabel>
                <NInput
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Brief description of your course"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <NLabel htmlFor="category">Category</NLabel>
                  <Select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <NLabel htmlFor="level">Level</NLabel>
                  <Select
                    id="level"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                  >
                    {levels.map((lvl) => (
                      <option key={lvl.value} value={lvl.value}>
                        {lvl.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <NLabel htmlFor="price">Price ($)</NLabel>
                  <NInput
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <NLabel htmlFor="description">Course Description</NLabel>
                <RichTextEditor
                  content={description}
                  onChange={setDescription}
                  placeholder="Describe what students will learn in this course..."
                />
              </div>

              <div>
                <NLabel>Course Thumbnail</NLabel>
                <FileUpload
                  bucket="course-thumbnails"
                  accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
                  maxSize={5 * 1024 * 1024}
                  onUploadComplete={setThumbnailUrl}
                  existingUrl={thumbnailUrl}
                  label="Upload course thumbnail"
                />
              </div>
            </div>
          </section>

          {/* Learning Objectives */}
          <section className="bg-white border-2 border-border rounded-base p-6 shadow-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading">Learning Objectives</h2>
              <NButton
                type="button"
                variant="default"
                size="sm"
                onClick={() => addArrayItem(objectives, setObjectives)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Objective
              </NButton>
            </div>
            <div className="space-y-3">
              {objectives.map((objective, index) => (
                <div key={index} className="flex gap-2">
                  <NInput
                    value={objective}
                    onChange={(e) =>
                      updateArrayItem(objectives, setObjectives, index, e.target.value)
                    }
                    placeholder="What will students learn?"
                  />
                  {objectives.length > 1 && (
                    <NButton
                      type="button"
                      variant="neutral"
                      size="sm"
                      onClick={() => removeArrayItem(objectives, setObjectives, index)}
                    >
                      <X className="w-4 h-4" />
                    </NButton>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Requirements */}
          <section className="bg-white border-2 border-border rounded-base p-6 shadow-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading">Requirements</h2>
              <NButton
                type="button"
                variant="default"
                size="sm"
                onClick={() => addArrayItem(requirements, setRequirements)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Requirement
              </NButton>
            </div>
            <div className="space-y-3">
              {requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2">
                  <NInput
                    value={requirement}
                    onChange={(e) =>
                      updateArrayItem(requirements, setRequirements, index, e.target.value)
                    }
                    placeholder="What do students need before starting?"
                  />
                  {requirements.length > 1 && (
                    <NButton
                      type="button"
                      variant="neutral"
                      size="sm"
                      onClick={() => removeArrayItem(requirements, setRequirements, index)}
                    >
                      <X className="w-4 h-4" />
                    </NButton>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Target Audience */}
          <section className="bg-white border-2 border-border rounded-base p-6 shadow-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading">Target Audience</h2>
              <NButton
                type="button"
                variant="default"
                size="sm"
                onClick={() => addArrayItem(targetAudience, setTargetAudience)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Audience
              </NButton>
            </div>
            <div className="space-y-3">
              {targetAudience.map((audience, index) => (
                <div key={index} className="flex gap-2">
                  <NInput
                    value={audience}
                    onChange={(e) =>
                      updateArrayItem(targetAudience, setTargetAudience, index, e.target.value)
                    }
                    placeholder="Who is this course for?"
                  />
                  {targetAudience.length > 1 && (
                    <NButton
                      type="button"
                      variant="neutral"
                      size="sm"
                      onClick={() =>
                        removeArrayItem(targetAudience, setTargetAudience, index)
                      }
                    >
                      <X className="w-4 h-4" />
                    </NButton>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-between gap-3">
            <NButton variant="neutral" onClick={handleDelete} disabled={saving}>
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Course
            </NButton>
            <div className="flex gap-3">
              <Link href={`/educator/courses/${courseId}/curriculum`}>
                <NButton variant="neutral">Cancel</NButton>
              </Link>
              <NButton variant="default" onClick={handleSave} disabled={saving}>
                <Save className="w-5 h-5 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </NButton>
            </div>
          </div>
        </div>
      </main>
    </EducatorLayout>
  )
}

