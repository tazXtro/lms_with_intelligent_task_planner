"use client"

import { useState, useEffect } from "react"
import { LearnerLayout } from "@/components/learner-layout"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { NLabel } from "@/components/ui/nlabel"
import { AIInterviewModal } from "@/components/ai-interview-modal"
import { AIInterviewFeedback } from "@/components/ai-interview-feedback"
import { InterviewFileUpload } from "@/components/interview-file-upload"
import { createClient } from "@/utils/supabase/client"
import {
  Mic,
  Sparkles,
  FileText,
  TrendingUp,
  Clock,
  Target,
  Briefcase,
  Building2,
  Loader2,
  Play,
  History,
  Award,
  ChevronRight,
  AlertCircle,
  Upload,
} from "lucide-react"

interface InterviewSession {
  id: string
  job_title: string | null
  company_name: string | null
  created_at: string
  status: string
  overall_score: number | null
}

export default function AIInterviewPage() {
  const [jobDescription, setJobDescription] = useState("")
  const [extractedText, setExtractedText] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [pastSessions, setPastSessions] = useState<InterviewSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadPastSessions()
  }, [])

  const loadPastSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("interview_sessions")
        .select("id, job_title, company_name, created_at, status, overall_score")
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error

      setPastSessions(data || [])
    } catch (err) {
      console.error("Error loading past sessions:", err)
    }
  }

  const handleTextExtracted = (text: string, fileName: string) => {
    setExtractedText((prev) => {
      const newText = prev ? `${prev}\n\n--- Extracted from ${fileName} ---\n\n${text}` : `--- Extracted from ${fileName} ---\n\n${text}`
      // Auto-populate the textarea if it's empty (show preview)
      if (!jobDescription.trim()) {
        setJobDescription(newText)
      }
      return newText
    })
  }

  const handleFileError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const handleStartInterview = async () => {
    // Combine manual text input with extracted text from files
    // If jobDescription was auto-populated from extractedText, it will already contain that text
    // So we check if extractedText is different from what's in jobDescription before combining
    let combinedText = jobDescription.trim()
    
    // If we have extracted text that's not already in jobDescription, append it
    if (extractedText.trim() && !combinedText.includes(extractedText.trim())) {
      combinedText = combinedText 
        ? `${combinedText}\n\n--- Additional Information from Files ---\n\n${extractedText.trim()}`
        : extractedText.trim()
    }
    
    // Fallback to extractedText if jobDescription is empty
    if (!combinedText.trim() && extractedText.trim()) {
      combinedText = extractedText.trim()
    }

    if (!combinedText.trim()) {
      setError("Please paste the job description or upload an image file to begin")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create a new interview session in the database
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error("You must be logged in to start an interview")
      }

      const { data, error } = await supabase
        .from("interview_sessions")
        .insert({
          user_id: user.id,
          job_description: combinedText,
          job_title: jobTitle || null,
          company_name: companyName || null,
          status: "in_progress",
        })
        .select()
        .single()

      if (error) throw error

      setCurrentSessionId(data.id)
      setShowModal(true)
    } catch (err) {
      console.error("Error creating interview session:", err)
      setError(err instanceof Error ? err.message : "Failed to start interview")
    } finally {
      setLoading(false)
    }
  }

  const handleInterviewComplete = (sessionId: string) => {
    setShowModal(false)
    setCurrentSessionId(sessionId)
    setShowFeedback(true)
  }

  const handleFeedbackClose = () => {
    setShowFeedback(false)
    setCurrentSessionId(null)
    setJobDescription("")
    setExtractedText("")
    setJobTitle("")
    setCompanyName("")
    loadPastSessions()
  }

  const handleViewPastInterview = (sessionId: string) => {
    setCurrentSessionId(sessionId)
    setShowFeedback(true)
  }

  return (
    <LearnerLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-main border-2 border-border rounded-base flex items-center justify-center shadow-shadow">
              <Mic className="w-8 h-8 text-main-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-heading mb-2">AI Interview Practice</h1>
              <p className="text-foreground/70 font-base">
                Practice with realistic AI-powered interviews to ace your next job opportunity
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* How It Works */}
            <NCard className="p-6 bg-gradient-to-br from-main/5 to-accent/5">
              <div className="flex items-start gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-main mt-1" />
                <div>
                  <h2 className="text-2xl font-heading mb-2">How It Works</h2>
                  <p className="text-sm font-base text-foreground/70">
                    Get a realistic interview experience powered by advanced AI
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-main border-2 border-border rounded-base flex items-center justify-center flex-shrink-0">
                    <span className="text-main-foreground font-heading">1</span>
                  </div>
                  <div>
                    <h3 className="font-heading text-sm mb-1">Paste Job Description</h3>
                    <p className="text-xs font-base text-foreground/70">
                      Copy and paste any job posting you're preparing for
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-accent border-2 border-border rounded-base flex items-center justify-center flex-shrink-0">
                    <span className="text-main-foreground font-heading">2</span>
                  </div>
                  <div>
                    <h3 className="font-heading text-sm mb-1">Voice Interview</h3>
                    <p className="text-xs font-base text-foreground/70">
                      Answer questions using voice or text in real-time
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-success border-2 border-border rounded-base flex items-center justify-center flex-shrink-0">
                    <span className="text-main-foreground font-heading">3</span>
                  </div>
                  <div>
                    <h3 className="font-heading text-sm mb-1">Get Feedback</h3>
                    <p className="text-xs font-base text-foreground/70">
                      Receive detailed analysis and improvement tips
                    </p>
                  </div>
                </div>
              </div>
            </NCard>

            {/* Job Description Input */}
            <NCard className="p-6">
              <h2 className="text-2xl font-heading mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-main" />
                Start New Interview
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <NLabel htmlFor="job-title">Job Title (Optional)</NLabel>
                    <input
                      id="job-title"
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g., Senior Frontend Developer"
                      className="w-full px-5 py-3 rounded-base border-2 border-border bg-background font-base text-sm focus:outline-none focus:border-main transition-colors"
                    />
                  </div>

                  <div>
                    <NLabel htmlFor="company-name">Company Name (Optional)</NLabel>
                    <input
                      id="company-name"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g., Google, Meta, etc."
                      className="w-full px-5 py-3 rounded-base border-2 border-border bg-background font-base text-sm focus:outline-none focus:border-main transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <NLabel htmlFor="job-description">
                    Job Description / Requirements *
                  </NLabel>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-foreground/60 font-base mb-2">
                      <span className="flex-1 border-t border-border"></span>
                      <span>OR</span>
                      <span className="flex-1 border-t border-border"></span>
                    </div>
                    
                    {/* File Upload Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Upload className="w-4 h-4 text-main" />
                        <span className="text-sm font-heading">Upload Image</span>
                      </div>
                      <InterviewFileUpload
                        onTextExtracted={handleTextExtracted}
                        onError={handleFileError}
                        maxSize={10 * 1024 * 1024} // 10MB
                      />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-foreground/60 font-base">
                      <span className="flex-1 border-t border-border"></span>
                      <span>OR</span>
                      <span className="flex-1 border-t border-border"></span>
                    </div>

                    {/* Manual Text Input */}
                    <textarea
                      id="job-description"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the complete job description here. Include responsibilities, requirements, qualifications, and any other details from the job posting..."
                      className="w-full px-5 py-3 rounded-base border-2 border-border bg-background font-base text-sm focus:outline-none focus:border-main transition-colors min-h-[200px] resize-y"
                    />
                  </div>
                  <p className="text-xs text-foreground/50 mt-2 font-base">
                    The more detailed the job description, the more relevant the interview questions will be. You can upload an image or paste text manually.
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-destructive/10 border-2 border-destructive rounded-base flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-base text-destructive">{error}</p>
                  </div>
                )}

                <NButton
                  onClick={handleStartInterview}
                  disabled={(!jobDescription.trim() && !extractedText.trim()) || loading}
                  variant="default"
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Starting Interview...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Start AI Interview
                    </>
                  )}
                </NButton>
              </div>
            </NCard>

            {/* Past Interviews */}
            {pastSessions.length > 0 && (
              <NCard className="p-6">
                <h2 className="text-2xl font-heading mb-4 flex items-center gap-2">
                  <History className="w-6 h-6 text-main" />
                  Interview History
                </h2>

                <div className="space-y-3">
                  {pastSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-4 border-2 border-border rounded-base hover:border-main transition-colors cursor-pointer group"
                      onClick={() => handleViewPastInterview(session.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Briefcase className="w-4 h-4 text-main" />
                            <h3 className="font-heading text-sm">
                              {session.job_title || "Untitled Interview"}
                            </h3>
                            {session.company_name && (
                              <>
                                <span className="text-foreground/30">•</span>
                                <span className="text-sm font-base text-foreground/70">
                                  {session.company_name}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-foreground/60 font-base">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(session.created_at).toLocaleDateString()}
                            </span>
                            {session.overall_score && (
                              <span className="flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                Score: {session.overall_score}/100
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-base text-xs font-heading ${
                                session.status === "completed"
                                  ? "bg-success/20 text-success"
                                  : "bg-main/20 text-main"
                              }`}
                            >
                              {session.status}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-foreground/30 group-hover:text-main transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </NCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Features */}
            <NCard className="p-6">
              <h3 className="text-xl font-heading mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-main" />
                Key Features
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-main rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-heading mb-1">Voice-Enabled</p>
                    <p className="text-xs font-base text-foreground/70">
                      Practice with real voice interactions using speech-to-text
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-heading mb-1">AI-Powered</p>
                    <p className="text-xs font-base text-foreground/70">
                      Questions tailored to your specific job description
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-heading mb-1">Detailed Feedback</p>
                    <p className="text-xs font-base text-foreground/70">
                      Get comprehensive analysis and actionable improvement tips
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-heading mb-1">Realistic Experience</p>
                    <p className="text-xs font-base text-foreground/70">
                      Simulate actual interview conditions and pressure
                    </p>
                  </div>
                </li>
              </ul>
            </NCard>

            {/* Tips */}
            <NCard className="p-6 bg-gradient-to-br from-accent/5 to-main/5">
              <h3 className="text-xl font-heading mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Interview Tips
              </h3>
              <ul className="space-y-3 text-sm font-base text-foreground/80">
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  <span>Find a quiet environment for your practice session</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  <span>Speak clearly and at a moderate pace</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  <span>Use the STAR method for behavioral questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  <span>Review your feedback after each practice session</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  <span>Practice multiple times with different job descriptions</span>
                </li>
              </ul>
            </NCard>

            {/* Browser Compatibility */}
            <NCard className="p-4 bg-warning/5 border-warning/30">
              <p className="text-xs font-base text-foreground/70">
                <strong className="font-heading">Browser Note:</strong> Voice features work best in Chrome, Edge, or Safari. If voice doesn't work, you can type your answers instead.
              </p>
            </NCard>
          </div>
        </div>
      </div>

      {/* Interview Modal */}
      {showModal && currentSessionId && (
        <AIInterviewModal
          jobDescription={[jobDescription.trim(), extractedText.trim()].filter(Boolean).join("\n\n--- Additional Information ---\n\n")}
          sessionId={currentSessionId}
          onClose={() => setShowModal(false)}
          onComplete={handleInterviewComplete}
        />
      )}

      {/* Feedback Modal */}
      {showFeedback && currentSessionId && (
        <AIInterviewFeedback
          sessionId={currentSessionId}
          onClose={handleFeedbackClose}
        />
      )}
    </LearnerLayout>
  )
}

