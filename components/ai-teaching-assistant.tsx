"use client"

import { useState } from "react"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { NInput } from "@/components/ui/ninput"
import { NLabel } from "@/components/ui/nlabel"
import {
  Sparkles,
  X,
  Loader2,
  BookOpen,
  FileText,
  ClipboardCheck,
  TrendingUp,
  Copy,
  Check,
  Lightbulb,
  Zap,
  Target,
} from "lucide-react"

interface AITeachingAssistantProps {
  mode: "course-outline" | "content-enhancer" | "assessment-generator" | "student-insights"
  onClose?: () => void
  onApply?: (data: any) => void
  initialData?: any
}

export function AITeachingAssistant({
  mode,
  onClose,
  onApply,
  initialData,
}: AITeachingAssistantProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Course Outline Generator State
  const [topic, setTopic] = useState("")
  const [level, setLevel] = useState("beginner")
  const [category, setCategory] = useState("")
  const [duration, setDuration] = useState("")

  // Content Enhancer State
  const [textToEnhance, setTextToEnhance] = useState(initialData?.text || "")
  const [enhancementType, setEnhancementType] = useState(initialData?.type || "description")

  // Assessment Generator State
  const [lessonContent, setLessonContent] = useState(initialData?.content || "")
  const [lessonTitle, setLessonTitle] = useState(initialData?.title || "")
  const [questionCount, setQuestionCount] = useState(5)
  const [difficulty, setDifficulty] = useState("medium")

  // Student Insights State
  const [courseData, setCourseData] = useState(initialData?.courseData || null)

  const handleGenerateCourseOutline = async () => {
    if (!topic.trim()) {
      setError("Please enter a course topic")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/ai/educator/course-outline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          level,
          category,
          duration,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        const errorMsg = data.error || "Failed to generate course outline"
        const details = data.details ? `\n\nDetails: ${data.details}` : ""
        throw new Error(errorMsg + details)
      }

      if (!data.outline) {
        throw new Error("No outline data received from AI")
      }

      setResult(data.outline)
    } catch (err) {
      console.error("Error generating course outline:", err)
      setError(err instanceof Error ? err.message : "Failed to generate course outline")
    } finally {
      setLoading(false)
    }
  }

  const handleEnhanceContent = async () => {
    if (!textToEnhance.trim()) {
      setError("Please enter text to enhance")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/ai/educator/content-enhancer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: textToEnhance,
          enhancementType,
          context: initialData?.context,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to enhance content")
      }

      setResult(data.enhanced)
    } catch (err) {
      console.error("Error enhancing content:", err)
      setError(err instanceof Error ? err.message : "Failed to enhance content")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAssessment = async () => {
    if (!lessonContent.trim()) {
      setError("Please enter lesson content")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/ai/educator/assessment-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonContent,
          lessonTitle,
          questionCount,
          difficulty,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate assessment")
      }

      setResult(data.assessment)
    } catch (err) {
      console.error("Error generating assessment:", err)
      setError(err instanceof Error ? err.message : "Failed to generate assessment")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateInsights = async () => {
    if (!courseData) {
      setError("Course data is required")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/ai/educator/student-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseData: courseData,
          enrollmentStats: initialData?.enrollmentStats,
          lessonProgress: initialData?.lessonProgress,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate insights")
      }

      setResult(data.insights)
    } catch (err) {
      console.error("Error generating insights:", err)
      setError(err instanceof Error ? err.message : "Failed to generate insights")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderCourseOutlineForm = () => (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-main/5 rounded-base border-2 border-main/20">
        <Lightbulb className="w-5 h-5 text-main flex-shrink-0 mt-0.5" />
        <div className="text-sm font-base">
          <p className="font-heading text-foreground mb-1">AI Course Outline Generator</p>
          <p className="text-foreground/70">
            Generate a comprehensive course structure with sections, lessons, and learning objectives based on your topic.
          </p>
        </div>
      </div>

      <div>
        <NLabel htmlFor="topic">Course Topic *</NLabel>
        <NInput
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Complete Python Programming, UI/UX Design Fundamentals"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <NLabel htmlFor="level">Difficulty Level</NLabel>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full px-5 py-3 rounded-base border-2 border-border bg-background font-base text-sm focus:outline-none focus:border-main transition-colors"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="all">All Levels</option>
          </select>
        </div>
        <div>
          <NLabel htmlFor="duration">Target Duration (hours)</NLabel>
          <NInput
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g., 10"
          />
        </div>
      </div>

      <div>
        <NLabel htmlFor="category">Category (Optional)</NLabel>
        <NInput
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g., Web Development, Data Science"
        />
      </div>

      <NButton
        onClick={handleGenerateCourseOutline}
        disabled={loading || !topic.trim()}
        variant="default"
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generating Course Outline...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Course Outline
          </>
        )}
      </NButton>
    </div>
  )

  const renderContentEnhancerForm = () => (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-accent/5 rounded-base border-2 border-accent/20">
        <Zap className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
        <div className="text-sm font-base">
          <p className="font-heading text-foreground mb-1">AI Content Enhancer</p>
          <p className="text-foreground/70">
            Improve your course descriptions, learning objectives, or lesson content with AI-powered enhancements.
          </p>
        </div>
      </div>

      <div>
        <NLabel htmlFor="enhancement-type">Enhancement Type</NLabel>
        <select
          id="enhancement-type"
          value={enhancementType}
          onChange={(e) => setEnhancementType(e.target.value)}
          className="w-full px-5 py-3 rounded-base border-2 border-border bg-background font-base text-sm focus:outline-none focus:border-main transition-colors"
        >
          <option value="description">Course Description</option>
          <option value="objectives">Learning Objectives</option>
          <option value="lessonContent">Lesson Content</option>
          <option value="marketing">Marketing Copy</option>
        </select>
      </div>

      <div>
        <NLabel htmlFor="text-to-enhance">Text to Enhance *</NLabel>
        <textarea
          id="text-to-enhance"
          value={textToEnhance}
          onChange={(e) => setTextToEnhance(e.target.value)}
          className="w-full px-5 py-3 rounded-base border-2 border-border bg-background font-base text-sm focus:outline-none focus:border-main transition-colors min-h-[200px]"
          placeholder={
            enhancementType === "objectives"
              ? "Enter your learning objectives, one per line..."
              : "Enter the text you want to enhance..."
          }
        />
      </div>

      <NButton
        onClick={handleEnhanceContent}
        disabled={loading || !textToEnhance.trim()}
        variant="accent"
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Enhancing Content...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Enhance Content
          </>
        )}
      </NButton>
    </div>
  )

  const renderAssessmentGeneratorForm = () => (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-success/5 rounded-base border-2 border-success/20">
        <ClipboardCheck className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
        <div className="text-sm font-base">
          <p className="font-heading text-foreground mb-1">AI Assessment Generator</p>
          <p className="text-foreground/70">
            Generate quiz questions automatically from your lesson content to test student understanding.
          </p>
        </div>
      </div>

      <div>
        <NLabel htmlFor="lesson-title">Lesson Title</NLabel>
        <NInput
          id="lesson-title"
          value={lessonTitle}
          onChange={(e) => setLessonTitle(e.target.value)}
          placeholder="e.g., Introduction to Variables"
        />
      </div>

      <div>
        <NLabel htmlFor="lesson-content">Lesson Content *</NLabel>
        <div className="relative">
          <textarea
            id="lesson-content"
            value={lessonContent}
            onChange={(e) => setLessonContent(e.target.value)}
            className="w-full px-5 py-3 rounded-base border-2 border-border bg-background font-base text-sm focus:outline-none focus:border-main transition-colors min-h-[200px] font-mono"
            placeholder="Paste your lesson content here (HTML tags will be processed)..."
          />
          {lessonContent && lessonContent.includes('<') && (
            <div className="mt-2 p-3 bg-warning/10 rounded-base border-2 border-warning/30">
              <p className="text-xs text-warning flex items-center gap-2">
                <span>⚠️</span>
                <span>HTML detected. The AI will extract text content from HTML/iframes for question generation.</span>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <NLabel htmlFor="question-count">Number of Questions</NLabel>
          <NInput
            id="question-count"
            type="number"
            min="1"
            max="10"
            value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value) || 5)}
          />
        </div>
        <div>
          <NLabel htmlFor="difficulty">Difficulty</NLabel>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-5 py-3 rounded-base border-2 border-border bg-background font-base text-sm focus:outline-none focus:border-main transition-colors"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
      </div>

      <NButton
        onClick={handleGenerateAssessment}
        disabled={loading || !lessonContent.trim()}
        variant="default"
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generating Questions...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Assessment
          </>
        )}
      </NButton>
    </div>
  )

  const renderStudentInsightsForm = () => (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-main/5 rounded-base border-2 border-main/20">
        <TrendingUp className="w-5 h-5 text-main flex-shrink-0 mt-0.5" />
        <div className="text-sm font-base">
          <p className="font-heading text-foreground mb-1">AI Student Insights</p>
          <p className="text-foreground/70">
            Get AI-powered analysis of your course performance and actionable recommendations.
          </p>
        </div>
      </div>

      {courseData && (
        <NButton
          onClick={handleGenerateInsights}
          disabled={loading}
          variant="default"
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing Course Data...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Insights
            </>
          )}
        </NButton>
      )}
    </div>
  )

  const renderCourseOutlineResult = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-heading">Generated Course Outline</h3>
        <NButton
          variant="neutral"
          size="sm"
          onClick={() => onApply?.(result)}
        >
          <Check className="w-4 h-4 mr-2" />
          Use This Outline
        </NButton>
      </div>

      <NCard className="p-6 bg-main/5 border-main/20">
        <h4 className="text-xl font-heading mb-2">{result.courseTitle}</h4>
        {result.subtitle && (
          <p className="text-sm text-foreground/80 font-base mb-4">{result.subtitle}</p>
        )}
        {result.description && (
          <p className="text-sm text-foreground/70 font-base whitespace-pre-wrap">{result.description}</p>
        )}
      </NCard>

      {result.learningObjectives && result.learningObjectives.length > 0 && (
        <div>
          <h5 className="font-heading text-lg mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-main" />
            Learning Objectives
          </h5>
          <ul className="space-y-2">
            {result.learningObjectives.map((obj: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3 p-3 bg-secondary-background rounded-base border-2 border-border">
                <span className="text-main font-heading">{idx + 1}.</span>
                <span className="text-sm font-base">{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.sections && result.sections.length > 0 && (
        <div>
          <h5 className="font-heading text-lg mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-main" />
            Course Structure ({result.sections.length} Sections)
          </h5>
          <div className="space-y-4">
            {result.sections.map((section: any, sectionIdx: number) => (
              <NCard key={sectionIdx} className="p-5">
                <h6 className="font-heading text-base mb-2">
                  Section {sectionIdx + 1}: {section.title}
                </h6>
                {section.description && (
                  <p className="text-xs text-foreground/70 font-base mb-3">{section.description}</p>
                )}
                {section.lessons && section.lessons.length > 0 && (
                  <ul className="space-y-2">
                    {section.lessons.map((lesson: any, lessonIdx: number) => (
                      <li key={lessonIdx} className="flex items-start gap-2 text-sm font-base">
                        <FileText className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span>{lesson.title}</span>
                          {lesson.estimatedDuration && (
                            <span className="text-xs text-foreground/60 ml-2">({lesson.estimatedDuration} min)</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </NCard>
            ))}
          </div>
        </div>
      )}

      {result.suggestedPrice && (
        <div className="flex items-center justify-between p-4 bg-success/10 rounded-base border-2 border-success/30">
          <span className="font-heading text-sm">Suggested Price:</span>
          <span className="text-xl font-heading text-success">${result.suggestedPrice}</span>
        </div>
      )}
    </div>
  )

  const renderContentEnhancerResult = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-heading">Enhanced Content</h3>
        <div className="flex gap-2">
          <NButton
            variant="neutral"
            size="sm"
            onClick={() => handleCopy(Array.isArray(result) ? result.join('\n') : result)}
          >
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Copied!" : "Copy"}
          </NButton>
          <NButton
            variant="default"
            size="sm"
            onClick={() => onApply?.(result)}
          >
            <Check className="w-4 h-4 mr-2" />
            Use This
          </NButton>
        </div>
      </div>

      <NCard className="p-6 bg-accent/5 border-accent/20">
        {Array.isArray(result) ? (
          <ul className="space-y-2">
            {result.map((item: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-accent font-heading">{idx + 1}.</span>
                <span className="text-sm font-base">{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm font-base whitespace-pre-wrap">{result}</p>
        )}
      </NCard>
    </div>
  )

  const renderAssessmentResult = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-heading">Generated Assessment</h3>
        <NButton
          variant="default"
          size="sm"
          onClick={() => onApply?.(result)}
        >
          <Check className="w-4 h-4 mr-2" />
          Save Assessment
        </NButton>
      </div>

      {result.questions && result.questions.length > 0 && (
        <div className="space-y-4">
          {result.questions.map((q: any, idx: number) => (
            <NCard key={idx} className="p-5">
              <div className="mb-4">
                <span className="text-xs font-heading text-foreground/70">Question {idx + 1}</span>
                <p className="font-heading text-base mt-1">{q.question}</p>
              </div>

              <div className="space-y-2 mb-4">
                {q.options?.map((option: string, optIdx: number) => (
                  <div
                    key={optIdx}
                    className={`p-3 rounded-base border-2 ${
                      optIdx === q.correctAnswer
                        ? "bg-success/10 border-success/30"
                        : "bg-secondary-background border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-sm">{String.fromCharCode(65 + optIdx)}.</span>
                      <span className="text-sm font-base">{option}</span>
                      {optIdx === q.correctAnswer && (
                        <Check className="w-4 h-4 text-success ml-auto" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {q.explanation && (
                <div className="p-3 bg-main/5 rounded-base border-2 border-main/20">
                  <p className="text-xs font-heading text-foreground/70 mb-1">Explanation:</p>
                  <p className="text-sm font-base text-foreground/80">{q.explanation}</p>
                </div>
              )}

              {q.difficulty && (
                <div className="mt-3">
                  <span className={`text-xs font-heading px-2 py-1 rounded-base ${
                    q.difficulty === 'easy' ? 'bg-success/20 text-success' :
                    q.difficulty === 'hard' ? 'bg-destructive/20 text-destructive' :
                    'bg-main/20 text-main'
                  }`}>
                    {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
                  </span>
                </div>
              )}
            </NCard>
          ))}
        </div>
      )}
    </div>
  )

  const renderStudentInsightsResult = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-heading">Course Insights & Recommendations</h3>

      {result.overallHealth && (
        <NCard className={`p-5 ${
          result.overallHealth === 'excellent' ? 'bg-success/10 border-success/30' :
          result.overallHealth === 'good' ? 'bg-main/5 border-main/20' :
          result.overallHealth === 'needs_attention' ? 'bg-amber-50 border-amber-300' :
          'bg-destructive/10 border-destructive/30'
        }`}>
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6" />
            <div>
              <p className="text-sm font-base text-foreground/70">Overall Course Health</p>
              <p className="text-xl font-heading capitalize">{result.overallHealth.replace('_', ' ')}</p>
            </div>
          </div>
        </NCard>
      )}

      {result.insights && result.insights.length > 0 && (
        <div>
          <h4 className="font-heading text-lg mb-4">Key Insights</h4>
          <div className="space-y-3">
            {result.insights.map((insight: any, idx: number) => (
              <NCard key={idx} className={`p-4 ${
                insight.type === 'strength' ? 'border-success/30' :
                insight.type === 'concern' ? 'border-destructive/30' :
                'border-main/30'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    insight.type === 'strength' ? 'bg-success' :
                    insight.type === 'concern' ? 'bg-destructive' :
                    'bg-main'
                  }`} />
                  <div className="flex-1">
                    <h5 className="font-heading text-sm mb-1">{insight.title}</h5>
                    <p className="text-xs font-base text-foreground/70">{insight.description}</p>
                  </div>
                  {insight.priority && (
                    <span className={`text-xs px-2 py-1 rounded-base font-heading ${
                      insight.priority === 'high' ? 'bg-destructive/20 text-destructive' :
                      insight.priority === 'medium' ? 'bg-main/20 text-main' :
                      'bg-foreground/10 text-foreground/70'
                    }`}>
                      {insight.priority}
                    </span>
                  )}
                </div>
              </NCard>
            ))}
          </div>
        </div>
      )}

      {result.recommendations && result.recommendations.length > 0 && (
        <div>
          <h4 className="font-heading text-lg mb-4">Actionable Recommendations</h4>
          <div className="space-y-3">
            {result.recommendations.map((rec: any, idx: number) => (
              <NCard key={idx} className="p-4 hover:translate-x-1 transition-transform">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-main flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-heading text-sm mb-1">{rec.action}</p>
                    <p className="text-xs font-base text-foreground/70 mb-2">{rec.impact}</p>
                    {rec.effort && (
                      <span className="text-xs px-2 py-1 bg-secondary-background rounded-base font-base">
                        Effort: {rec.effort}
                      </span>
                    )}
                  </div>
                </div>
              </NCard>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border-4 border-border rounded-base shadow-shadow max-w-4xl w-full my-8">
        <div className="p-6 border-b-2 border-border flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-main border-2 border-border rounded-base flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-main-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-heading">AI Teaching Assistant</h2>
              <p className="text-sm text-foreground/70 font-base">
                {mode === "course-outline" && "Generate course structures instantly"}
                {mode === "content-enhancer" && "Enhance your course content"}
                {mode === "assessment-generator" && "Create assessments automatically"}
                {mode === "student-insights" && "Get AI-powered insights"}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-destructive/10 rounded-base border-2 border-transparent hover:border-border transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive rounded-base">
              <p className="text-destructive font-base text-sm">{error}</p>
            </div>
          )}

          {!result ? (
            <>
              {mode === "course-outline" && renderCourseOutlineForm()}
              {mode === "content-enhancer" && renderContentEnhancerForm()}
              {mode === "assessment-generator" && renderAssessmentGeneratorForm()}
              {mode === "student-insights" && renderStudentInsightsForm()}
            </>
          ) : (
            <>
              {mode === "course-outline" && renderCourseOutlineResult()}
              {mode === "content-enhancer" && renderContentEnhancerResult()}
              {mode === "assessment-generator" && renderAssessmentResult()}
              {mode === "student-insights" && renderStudentInsightsResult()}
            </>
          )}
        </div>

        {result && (
          <div className="p-6 border-t-2 border-border flex justify-end gap-3">
            <NButton
              variant="neutral"
              onClick={() => setResult(null)}
            >
              Generate Again
            </NButton>
            {onClose && (
              <NButton
                variant="neutral"
                onClick={onClose}
              >
                Close
              </NButton>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

