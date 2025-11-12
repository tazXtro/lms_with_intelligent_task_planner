"use client"

import { useState, useEffect } from "react"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { createClient } from "@/utils/supabase/client"
import {
  X,
  Loader2,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Target,
  Award,
  MessageSquare,
  Download,
  Share2,
  BarChart3,
} from "lucide-react"

interface FeedbackData {
  overallScore: number
  overallFeedback: string
  strengths: string[]
  areasForImprovement: string[]
  skillsAssessment: {
    technical: { score: number; feedback: string }
    communication: { score: number; feedback: string }
    problemSolving: { score: number; feedback: string }
    experience: { score: number; feedback: string }
  }
  recommendations: string[]
  interviewQuality: "excellent" | "good" | "fair" | "needs_improvement"
  readinessLevel: "ready" | "almost_ready" | "needs_practice" | "needs_significant_work"
}

interface AIInterviewFeedbackProps {
  sessionId: string
  onClose: () => void
}

export function AIInterviewFeedback({
  sessionId,
  onClose,
}: AIInterviewFeedbackProps) {
  const [feedback, setFeedback] = useState<FeedbackData | null>(null)
  const [conversationHistory, setConversationHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [jobDescription, setJobDescription] = useState("")

  const supabase = createClient()

  useEffect(() => {
    loadSessionData()
  }, [sessionId])

  const loadSessionData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Load session from database
      const { data: session, error: sessionError } = await supabase
        .from("interview_sessions")
        .select("*")
        .eq("id", sessionId)
        .single()

      if (sessionError) throw sessionError

      setJobDescription(session.job_description)
      setConversationHistory(session.conversation_history || [])

      // Check if feedback already exists
      if (session.feedback) {
        setFeedback(session.feedback)
        setLoading(false)
      } else {
        // Generate feedback
        await generateFeedback(session.job_description, session.conversation_history)
      }
    } catch (err) {
      console.error("Error loading session:", err)
      setError(err instanceof Error ? err.message : "Failed to load interview data")
      setLoading(false)
    }
  }

  const generateFeedback = async (jobDesc: string, history: any[]) => {
    try {
      const response = await fetch("/api/ai/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "feedback",
          jobDescription: jobDesc,
          conversationHistory: history,
          sessionId: sessionId,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate feedback")
      }

      setFeedback(data.feedback)

      // Update session with overall score
      if (data.feedback.overallScore) {
        await supabase
          .from("interview_sessions")
          .update({ overall_score: data.feedback.overallScore })
          .eq("id", sessionId)
      }
    } catch (err) {
      console.error("Error generating feedback:", err)
      setError(err instanceof Error ? err.message : "Failed to generate feedback")
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success"
    if (score >= 60) return "text-main"
    if (score >= 40) return "text-warning"
    return "text-destructive"
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-success"
    if (score >= 60) return "bg-main"
    if (score >= 40) return "bg-warning"
    return "bg-destructive"
  }

  const getReadinessDisplay = (level: string) => {
    const displays = {
      ready: { text: "Interview Ready", color: "success", icon: CheckCircle2 },
      almost_ready: { text: "Almost Ready", color: "main", icon: TrendingUp },
      needs_practice: { text: "Needs More Practice", color: "warning", icon: AlertTriangle },
      needs_significant_work: { text: "Needs Significant Work", color: "destructive", icon: AlertTriangle },
    }
    return displays[level as keyof typeof displays] || displays.needs_practice
  }

  const getQualityDisplay = (quality: string) => {
    const displays = {
      excellent: { text: "Excellent", color: "success" },
      good: { text: "Good", color: "main" },
      fair: { text: "Fair", color: "warning" },
      needs_improvement: { text: "Needs Improvement", color: "destructive" },
    }
    return displays[quality as keyof typeof displays] || displays.fair
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white border-4 border-border rounded-base shadow-shadow p-12 max-w-md">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-main mx-auto mb-4" />
            <h3 className="text-xl font-heading mb-2">Analyzing Your Performance</h3>
            <p className="text-sm font-base text-foreground/70">
              Our AI is carefully reviewing your interview responses...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white border-4 border-border rounded-base shadow-shadow p-8 max-w-md">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-heading mb-2 text-destructive">Error</h3>
            <p className="text-sm font-base text-foreground/70 mb-6">{error}</p>
            <NButton onClick={onClose} variant="neutral">
              Close
            </NButton>
          </div>
        </div>
      </div>
    )
  }

  if (!feedback) {
    return null
  }

  const readinessInfo = getReadinessDisplay(feedback.readinessLevel)
  const qualityInfo = getQualityDisplay(feedback.interviewQuality)
  const ReadinessIcon = readinessInfo.icon

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border-4 border-border rounded-base shadow-shadow max-w-5xl w-full my-8">
        {/* Header */}
        <div className="p-6 border-b-2 border-border flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-main to-accent border-2 border-border rounded-base flex items-center justify-center relative">
              <Award className="w-8 h-8 text-main-foreground" />
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-success border-2 border-white rounded-full flex items-center justify-center">
                <span className="text-xs font-heading text-white">
                  {feedback.overallScore}
                </span>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-heading mb-1">Interview Feedback</h2>
              <p className="text-sm text-foreground/70 font-base">
                Comprehensive analysis of your performance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-destructive/10 rounded-base border-2 border-transparent hover:border-border transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Overall Score & Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NCard className="p-6 text-center bg-gradient-to-br from-main/5 to-main/10">
                <div className="mb-2">
                  <div
                    className={`text-5xl font-heading mb-2 ${getScoreColor(
                      feedback.overallScore
                    )}`}
                  >
                    {feedback.overallScore}
                    <span className="text-2xl">/100</span>
                  </div>
                  <p className="text-sm font-base text-foreground/70">Overall Score</p>
                </div>
                <div className="w-full bg-secondary-background border-2 border-border rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full ${getScoreBackground(feedback.overallScore)} transition-all duration-1000`}
                    style={{ width: `${feedback.overallScore}%` }}
                  />
                </div>
              </NCard>

              <NCard className={`p-6 text-center bg-${readinessInfo.color}/5 border-${readinessInfo.color}/30`}>
                <ReadinessIcon className={`w-8 h-8 mx-auto mb-2 text-${readinessInfo.color}`} />
                <h3 className="font-heading text-lg mb-1">{readinessInfo.text}</h3>
                <p className="text-xs font-base text-foreground/70">Readiness Level</p>
              </NCard>

              <NCard className={`p-6 text-center bg-${qualityInfo.color}/5 border-${qualityInfo.color}/30`}>
                <BarChart3 className={`w-8 h-8 mx-auto mb-2 text-${qualityInfo.color}`} />
                <h3 className="font-heading text-lg mb-1">{qualityInfo.text}</h3>
                <p className="text-xs font-base text-foreground/70">Interview Quality</p>
              </NCard>
            </div>

            {/* Overall Feedback */}
            <NCard className="p-6 bg-accent/5">
              <h3 className="text-xl font-heading mb-3 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-accent" />
                Overall Assessment
              </h3>
              <p className="text-base font-base text-foreground/90 leading-relaxed">
                {feedback.overallFeedback}
              </p>
            </NCard>

            {/* Skills Assessment */}
            <NCard className="p-6">
              <h3 className="text-xl font-heading mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-main" />
                Skills Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(feedback.skillsAssessment).map(([skill, data]) => (
                  <div key={skill} className="p-4 border-2 border-border rounded-base">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-heading text-sm capitalize">
                        {skill.replace(/([A-Z])/g, " $1").trim()}
                      </h4>
                      <span className={`text-xl font-heading ${getScoreColor(data.score)}`}>
                        {data.score}
                      </span>
                    </div>
                    <div className="w-full bg-secondary-background border-2 border-border rounded-full h-2 overflow-hidden mb-2">
                      <div
                        className={`h-full ${getScoreBackground(data.score)} transition-all`}
                        style={{ width: `${data.score}%` }}
                      />
                    </div>
                    <p className="text-xs font-base text-foreground/70">{data.feedback}</p>
                  </div>
                ))}
              </div>
            </NCard>

            {/* Strengths */}
            {feedback.strengths.length > 0 && (
              <NCard className="p-6 bg-success/5 border-success/30">
                <h3 className="text-xl font-heading mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                  Key Strengths
                </h3>
                <ul className="space-y-3">
                  {feedback.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-success border-2 border-border rounded-base flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-main-foreground font-heading">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-sm font-base text-foreground/90 flex-1">
                        {strength}
                      </p>
                    </li>
                  ))}
                </ul>
              </NCard>
            )}

            {/* Areas for Improvement */}
            {feedback.areasForImprovement.length > 0 && (
              <NCard className="p-6 bg-warning/5 border-warning/30">
                <h3 className="text-xl font-heading mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-warning" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  {feedback.areasForImprovement.map((area, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-warning border-2 border-border rounded-base flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-main-foreground font-heading">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-sm font-base text-foreground/90 flex-1">{area}</p>
                    </li>
                  ))}
                </ul>
              </NCard>
            )}

            {/* Recommendations */}
            {feedback.recommendations.length > 0 && (
              <NCard className="p-6 bg-main/5 border-main/30">
                <h3 className="text-xl font-heading mb-4 flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-main" />
                  Action Plan & Recommendations
                </h3>
                <ul className="space-y-3">
                  {feedback.recommendations.map((rec, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 p-3 bg-white rounded-base border-2 border-border"
                    >
                      <Lightbulb className="w-5 h-5 text-main flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-base text-foreground/90 flex-1">{rec}</p>
                    </li>
                  ))}
                </ul>
              </NCard>
            )}

            {/* Interview Transcript Preview */}
            {conversationHistory.length > 0 && (
              <NCard className="p-6">
                <h3 className="text-xl font-heading mb-4 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-accent" />
                  Interview Transcript ({conversationHistory.length} messages)
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {conversationHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-base border-2 ${
                        msg.role === "assistant"
                          ? "bg-secondary-background border-border"
                          : "bg-accent/10 border-accent/30"
                      }`}
                    >
                      <p className="text-xs font-heading mb-1 text-foreground/70">
                        {msg.role === "assistant" ? "Interviewer" : "You"}
                      </p>
                      <p className="text-sm font-base text-foreground/90">
                        {msg.content}
                      </p>
                    </div>
                  ))}
                </div>
              </NCard>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t-2 border-border flex gap-3 justify-end">
          <NButton onClick={onClose} variant="default" size="lg">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Done
          </NButton>
        </div>
      </div>
    </div>
  )
}

