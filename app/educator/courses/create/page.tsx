"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { EducatorLayout } from "@/components/educator-layout"
import { NButton } from "@/components/ui/nbutton"
import { NInput } from "@/components/ui/ninput"
import { NLabel } from "@/components/ui/nlabel"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { RichTextEditor } from "@/components/rich-text-editor"
import { FileUpload } from "@/components/file-upload"
import { createClient } from "@/utils/supabase/client"
import { ArrowLeft, Save, Plus, X } from "lucide-react"
import Link from "next/link"

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

export default function CreateCoursePage() {
  const router = useRouter()
  const supabase = createClient()
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

  const addArrayItem = (
    arr: string[],
    setArr: (arr: string[]) => void
  ) => {
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

  const handleSaveDraft = async () => {
    try {
      setSaving(true)
      setError(null)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("You must be logged in to create a course")
      }

      // Validate required fields
      if (!title.trim()) {
        throw new Error("Course title is required")
      }

      // Filter out empty items from arrays
      const filteredObjectives = objectives.filter((obj) => obj.trim() !== "")
      const filteredRequirements = requirements.filter((req) => req.trim() !== "")
      const filteredTargetAudience = targetAudience.filter((aud) => aud.trim() !== "")

      // Create course
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .insert({
          educator_id: user.id,
          title: title.trim(),
          subtitle: subtitle.trim() || null,
          description: description || null,
          category: category || null,
          level,
          price: parseFloat(price) || 0,
          thumbnail_url: thumbnailUrl || null,
          status: "draft",
          learning_objectives: filteredObjectives.length > 0 ? filteredObjectives : null,
          requirements: filteredRequirements.length > 0 ? filteredRequirements : null,
          target_audience: filteredTargetAudience.length > 0 ? filteredTargetAudience : null,
        })
        .select()
        .single()

      if (courseError) throw courseError

      // Redirect to curriculum builder
      router.push(`/educator/courses/${course.id}/curriculum`)
    } catch (err) {
      console.error("Error saving course:", err)
      setError(err instanceof Error ? err.message : "Failed to save course")
    } finally {
      setSaving(false)
    }
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
            <h1 className="text-3xl font-heading">Create New Course</h1>
          </div>
          <NButton
            variant="default"
            size="lg"
            onClick={handleSaveDraft}
            disabled={saving}
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? "Saving..." : "Save Draft"}
          </NButton>
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

          <div className="flex justify-end gap-3">
            <Link href="/educator/courses">
              <NButton variant="neutral">Cancel</NButton>
            </Link>
            <NButton
              variant="default"
              onClick={handleSaveDraft}
              disabled={saving}
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? "Saving..." : "Save & Continue to Curriculum"}
            </NButton>
          </div>
        </div>
      </main>
    </EducatorLayout>
  )
}

