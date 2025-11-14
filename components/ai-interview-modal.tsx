"use client"

import { useState, useEffect, useRef } from "react"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { createClient } from "@/utils/supabase/client"
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  User,
  Bot,
  StopCircle,
  Play,
  Pause,
} from "lucide-react"
import { useSpeechToText } from "@/hooks/use-speech-to-text"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"

interface AIInterviewModalProps {
  jobDescription: string
  sessionId: string
  onClose: () => void
  onComplete: (sessionId: string) => void
}

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function AIInterviewModal({
  jobDescription,
  sessionId,
  onClose,
  onComplete,
}: AIInterviewModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [interviewStage, setInterviewStage] = useState<"starting" | "ongoing" | "completed">("starting")
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [firstMessageSpoken, setFirstMessageSpoken] = useState(false)
  const [isManuallyEditing, setIsManuallyEditing] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const baseAnswerRef = useRef("") // Base text before starting a new recording (using ref to avoid infinite loops)
  const prevIsListeningRef = useRef(false)
  const supabase = createClient()
  
  const {
    transcript,
    isListening,
    isSupported: isSpeechToTextSupported,
    startListening,
    stopListening,
    resetTranscript,
    error: sttError,
  } = useSpeechToText()

  const {
    speak,
    cancel: cancelSpeech,
    pause: pauseSpeech,
    resume: resumeSpeech,
    isSpeaking,
    isPaused,
    isSupported: isTextToSpeechSupported,
    error: ttsError,
    voicesLoaded,
  } = useTextToSpeech()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Update current answer with transcript (append to base answer when recording)
  useEffect(() => {
    if (isListening && !isManuallyEditing) {
      // Append new transcript to base answer
      const combined = baseAnswerRef.current.trim() 
        ? `${baseAnswerRef.current.trim()} ${transcript}`.trim()
        : transcript
      setCurrentAnswer(combined)
    } else if (!isListening && prevIsListeningRef.current && transcript && !isManuallyEditing) {
      // When recording stops (transition from listening to not listening), append final transcript
      const combined = baseAnswerRef.current.trim()
        ? `${baseAnswerRef.current.trim()} ${transcript}`.trim()
        : transcript
      setCurrentAnswer(combined)
      // Update base answer ref to include the new transcript (only once when recording stops)
      baseAnswerRef.current = combined
    }
    
    // Track previous listening state
    prevIsListeningRef.current = isListening
  }, [transcript, isListening, isManuallyEditing])

  // Speak the first message once TTS is ready
  useEffect(() => {
    if (!firstMessageSpoken && 
        messages.length > 0 && 
        messages[0].role === "assistant" && 
        audioEnabled && 
        isTextToSpeechSupported && 
        voicesLoaded) {
      speak(messages[0].content)
      setFirstMessageSpoken(true)
    }
  }, [messages, audioEnabled, isTextToSpeechSupported, voicesLoaded, firstMessageSpoken, speak])

  // Start the interview when modal opens
  useEffect(() => {
    startInterview()
  }, [])

  const startInterview = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "start",
          jobDescription,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to start interview")
      }

      const interviewerMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      }

      setMessages([interviewerMessage])
      setInterviewStage("ongoing")

      // Save first message to database
      await supabase
        .from("interview_sessions")
        .update({
          conversation_history: [{
            role: "assistant",
            content: data.message,
          }],
          updated_at: new Date().toISOString()
        })
        .eq("id", sessionId)

    } catch (err) {
      console.error("Error starting interview:", err)
      setError(err instanceof Error ? err.message : "Failed to start interview")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStartRecording = () => {
    if (!isSpeechToTextSupported) {
      setError("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.")
      return
    }

    // Pause TTS if speaking
    if (isSpeaking) {
      cancelSpeech()
    }

    // Save current answer as base before starting new recording
    baseAnswerRef.current = currentAnswer.trim()
    resetTranscript()
    setIsManuallyEditing(false)
    setError(null)
    startListening()
  }

  const handleStopRecording = () => {
    stopListening()
  }

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      setError("Please provide an answer before submitting")
      return
    }

    const userMessage: Message = {
      role: "user",
      content: currentAnswer,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setCurrentAnswer("")
    baseAnswerRef.current = ""
    setIsManuallyEditing(false)
    resetTranscript()
    setIsProcessing(true)
    setError(null)

    try {
      const conversationHistory = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      const response = await fetch("/api/ai/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "continue",
          jobDescription,
          conversationHistory,
          sessionId,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to continue interview")
      }

      const interviewerMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, interviewerMessage])

      // Save conversation history to database
      const updatedHistory = [...conversationHistory, {
        role: "assistant",
        content: data.message,
      }]
      
      await supabase
        .from("interview_sessions")
        .update({
          conversation_history: updatedHistory,
          updated_at: new Date().toISOString()
        })
        .eq("id", sessionId)

      // Check if interview is completed
      if (data.stage === "completed") {
        setInterviewStage("completed")
      }

      // Speak the response if audio is enabled
      if (audioEnabled && isTextToSpeechSupported) {
        speak(data.message)
      }

    } catch (err) {
      console.error("Error submitting answer:", err)
      setError(err instanceof Error ? err.message : "Failed to submit answer")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEndInterview = () => {
    if (interviewStage === "completed" && sessionId) {
      onComplete(sessionId)
    } else {
      onClose()
    }
  }

  const toggleAudio = () => {
    if (audioEnabled && isSpeaking) {
      cancelSpeech()
    }
    setAudioEnabled(!audioEnabled)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border-4 border-border rounded-base shadow-shadow max-w-4xl w-full my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b-2 border-border flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-main border-2 border-border rounded-base flex items-center justify-center relative">
              <Mic className="w-6 h-6 text-main-foreground" />
              {interviewStage === "ongoing" && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-success border-2 border-white rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-heading">AI Interview Session</h2>
              <p className="text-sm text-foreground/70 font-base">
                {interviewStage === "starting" && "Initializing interview..."}
                {interviewStage === "ongoing" && "Interview in progress"}
                {interviewStage === "completed" && "Interview completed"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAudio}
              className="p-2 hover:bg-secondary-background rounded-base border-2 border-transparent hover:border-border transition-all"
              title={audioEnabled ? "Disable audio" : "Enable audio"}
            >
              {audioEnabled ? (
                <Volume2 className="w-5 h-5 text-main" />
              ) : (
                <VolumeX className="w-5 h-5 text-foreground/50" />
              )}
            </button>
            <button
              onClick={handleEndInterview}
              className="p-2 hover:bg-destructive/10 rounded-base border-2 border-transparent hover:border-border transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[400px]">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-10 h-10 bg-main border-2 border-border rounded-base flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-main-foreground" />
                </div>
              )}
              <div
                className={`max-w-[70%] p-4 rounded-base border-2 ${
                  message.role === "user"
                    ? "bg-accent border-border ml-auto"
                    : "bg-secondary-background border-border"
                }`}
              >
                <p className="text-sm font-base whitespace-pre-wrap">
                  {message.content}
                </p>
                <p className="text-xs text-foreground/50 mt-2 font-base">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
              {message.role === "user" && (
                <div className="w-10 h-10 bg-accent border-2 border-border rounded-base flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-main-foreground" />
                </div>
              )}
            </div>
          ))}

          {isProcessing && (
            <div className="flex gap-3 justify-start">
              <div className="w-10 h-10 bg-main border-2 border-border rounded-base flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-main-foreground" />
              </div>
              <div className="p-4 rounded-base border-2 bg-secondary-background border-border">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-main" />
                  <span className="text-sm font-base text-foreground/70">
                    Interviewer is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Display */}
        {(error || sttError || ttsError) && (
          <div className="px-6 pb-4">
            <div className="p-3 bg-destructive/10 border-2 border-destructive rounded-base flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm font-base text-destructive">
                {error || sttError || ttsError}
              </p>
            </div>
          </div>
        )}

        {/* Interview Completed Message */}
        {interviewStage === "completed" && (
          <div className="px-6 pb-4">
            <div className="p-4 bg-success/10 border-2 border-success rounded-base flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-success flex-shrink-0" />
              <div>
                <p className="font-heading text-success mb-1">Interview Completed!</p>
                <p className="text-sm font-base text-foreground/70">
                  Great job! Click the button below to view your detailed feedback and performance analysis.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        {interviewStage === "ongoing" && (
          <div className="border-t-2 border-border p-6 flex-shrink-0 bg-secondary-background/30">
            {/* Recording Status */}
            {isListening && (
              <div className="mb-4 p-3 bg-main/10 border-2 border-main rounded-base flex items-center gap-2">
                <div className="w-2 h-2 bg-main rounded-full animate-pulse" />
                <span className="text-sm font-heading text-main">Recording your answer...</span>
              </div>
            )}

            {/* Editable Answer Input */}
            <div className="mb-4">
              <label className="block text-sm font-heading mb-2 text-foreground/70">
                Your Answer:
              </label>
              <textarea
                value={currentAnswer}
                onChange={(e) => {
                  setCurrentAnswer(e.target.value)
                  setIsManuallyEditing(true)
                  // Update base answer ref when manually editing so it stays in sync
                  baseAnswerRef.current = e.target.value.trim()
                }}
                onFocus={() => setIsManuallyEditing(true)}
                placeholder={isSpeechToTextSupported ? "Type your answer here or use voice recording..." : "Type your answer here..."}
                className="w-full px-4 py-3 rounded-base border-2 border-border bg-white font-base text-sm focus:outline-none focus:border-main transition-colors min-h-[120px] resize-y"
                disabled={isProcessing || isListening}
              />
              {isSpeechToTextSupported && currentAnswer && (
                <p className="text-xs text-foreground/50 mt-2 font-base">
                  💡 You can edit your answer before submitting
                </p>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              {isSpeechToTextSupported && (
                <>
                  {!isListening ? (
                    <NButton
                      onClick={handleStartRecording}
                      disabled={isProcessing || isSpeaking}
                      variant="default"
                      size="lg"
                      className="flex-1"
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      Start Recording
                    </NButton>
                  ) : (
                    <NButton
                      onClick={handleStopRecording}
                      variant="destructive"
                      size="lg"
                      className="flex-1"
                    >
                      <StopCircle className="w-5 h-5 mr-2" />
                      Stop Recording
                    </NButton>
                  )}
                </>
              )}

              <NButton
                onClick={handleSubmitAnswer}
                disabled={!currentAnswer.trim() || isProcessing || isListening}
                variant="accent"
                size="lg"
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Submit Answer
                  </>
                )}
              </NButton>
            </div>

            {/* Voice Control Info */}
            {isSpeechToTextSupported && (
              <p className="text-xs text-foreground/50 mt-3 text-center font-base">
                💡 Tip: Click "Start Recording" to answer with your voice, then click "Submit Answer" when done
              </p>
            )}
          </div>
        )}

        {/* Completed State Actions */}
        {interviewStage === "completed" && (
          <div className="border-t-2 border-border p-6 flex gap-3 flex-shrink-0">
            <NButton
              onClick={handleEndInterview}
              variant="default"
              size="lg"
              className="flex-1"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              View Feedback & Results
            </NButton>
          </div>
        )}
      </div>
    </div>
  )
}

