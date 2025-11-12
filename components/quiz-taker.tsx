"use client"

import { useState, useEffect } from "react"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { Check, X, Clock, Trophy, AlertCircle, RefreshCw } from "lucide-react"

interface Question {
  id: string
  question_text: string
  options: string[]
  correct_answer: number
  explanation: string
  points: number
  order_index: number
}

interface Assessment {
  id: string
  title: string
  description: string
  difficulty: string
  passing_score: number
  time_limit_minutes: number | null
  max_attempts: number | null
  questions: Question[]
}

interface QuizTakerProps {
  assessment: Assessment
  onComplete: (results: any) => void
  onCancel: () => void
  previousAttempts?: any[]
}

export function QuizTaker({ assessment, onComplete, onCancel, previousAttempts = [] }: QuizTakerProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    assessment.time_limit_minutes ? assessment.time_limit_minutes * 60 : null
  )
  const [startTime] = useState(Date.now())
  const [submitting, setSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<any>(null)

  const questions = assessment.questions || []
  const totalQuestions = questions.length
  const answeredCount = Object.keys(answers).length
  const canAttempt = !assessment.max_attempts || previousAttempts.length < assessment.max_attempts

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || showResults) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(timer)
          handleSubmit() // Auto-submit when time runs out
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, showResults])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
  }

  const handleSubmit = async () => {
    if (answeredCount < totalQuestions) {
      if (!confirm(`You have only answered ${answeredCount} out of ${totalQuestions} questions. Submit anyway?`)) {
        return
      }
    }

    setSubmitting(true)

    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000)

      const response = await fetch('/api/assessments/attempt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessmentId: assessment.id,
          answers,
          timeTakenSeconds: timeTaken
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit quiz')
      }

      setResults(data)
      setShowResults(true)
      onComplete(data)

    } catch (error) {
      console.error("Error submitting quiz:", error)
      alert(`Failed to submit quiz: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (!canAttempt) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <NCard className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-warning mx-auto mb-4" />
          <h3 className="text-2xl font-heading mb-2">Maximum Attempts Reached</h3>
          <p className="text-foreground/70 mb-6">
            You have already completed the maximum number of attempts ({assessment.max_attempts}) for this quiz.
          </p>
          <NButton onClick={onCancel} variant="neutral">
            Back to Lesson
          </NButton>
        </NCard>
      </div>
    )
  }

  if (showResults && results) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <NCard className="p-8">
          {/* Results Header */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              results.passed ? 'bg-success/10' : 'bg-destructive/10'
            }`}>
              {results.passed ? (
                <Trophy className="w-10 h-10 text-success" />
              ) : (
                <X className="w-10 h-10 text-destructive" />
              )}
            </div>
            <h2 className="text-3xl font-heading mb-2">
              {results.passed ? 'Congratulations!' : 'Keep Trying!'}
            </h2>
            <p className="text-xl font-heading text-foreground/70">
              You scored {results.score.toFixed(1)}%
            </p>
            <p className="text-sm text-foreground/60 mt-2">
              Passing score: {results.passingScore}% | 
              You got {results.correctCount} out of {results.totalQuestions} questions correct
            </p>
          </div>

          {/* Question Results */}
          <div className="space-y-4 mb-6">
            <h3 className="font-heading text-lg mb-4">Review Your Answers</h3>
            {results.results.map((result: any, idx: number) => (
              <NCard key={result.questionId} className={`p-5 border-2 ${
                result.isCorrect ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'
              }`}>
                <div className="flex items-start gap-3 mb-3">
                  {result.isCorrect ? (
                    <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-heading text-sm mb-2">Question {idx + 1}</p>
                    <p className="font-base mb-3">{result.questionText}</p>

                    <div className="space-y-2">
                      {result.options.map((option: string, optIdx: number) => {
                        const isUserAnswer = result.userAnswer === optIdx
                        const isCorrect = result.correctAnswer === optIdx

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-base border-2 ${
                              isCorrect 
                                ? 'bg-success/10 border-success/30' 
                                : isUserAnswer 
                                ? 'bg-destructive/10 border-destructive/30'
                                : 'bg-secondary-background border-border'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-heading text-sm">{String.fromCharCode(65 + optIdx)}.</span>
                              <span className="text-sm flex-1">{option}</span>
                              {isCorrect && <Check className="w-4 h-4 text-success" />}
                              {isUserAnswer && !isCorrect && <X className="w-4 h-4 text-destructive" />}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {result.explanation && (
                      <div className="mt-3 p-3 bg-main/5 rounded-base border-2 border-main/20">
                        <p className="text-sm text-foreground/80">
                          <span className="font-heading">Explanation:</span> {result.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </NCard>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <NButton onClick={onCancel} variant="neutral">
              Back to Lesson
            </NButton>
            {!results.passed && assessment.max_attempts && previousAttempts.length + 1 < assessment.max_attempts && (
              <NButton onClick={() => window.location.reload()} variant="default">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again ({assessment.max_attempts - previousAttempts.length - 1} attempts left)
              </NButton>
            )}
          </div>
        </NCard>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Quiz Header */}
      <NCard className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-heading mb-1">{assessment.title}</h2>
            {assessment.description && (
              <p className="text-sm text-foreground/70">{assessment.description}</p>
            )}
          </div>
          {timeRemaining !== null && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-base border-2 ${
              timeRemaining < 60 ? 'bg-destructive/10 border-destructive/30' : 'bg-main/10 border-main/30'
            }`}>
              <Clock className={`w-5 h-5 ${timeRemaining < 60 ? 'text-destructive' : 'text-main'}`} />
              <span className={`font-heading text-lg ${timeRemaining < 60 ? 'text-destructive' : 'text-main'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-secondary-background rounded-full h-2">
            <div
              className="bg-main h-2 rounded-full transition-all"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>
          <span className="text-sm font-heading text-foreground/70">
            {answeredCount}/{totalQuestions} answered
          </span>
        </div>
      </NCard>

      {/* Current Question */}
      <NCard className="p-8 mb-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-heading text-main">
              Question {currentQuestion + 1} of {totalQuestions}
            </span>
            <span className={`px-3 py-1 rounded-base text-xs font-heading ${
              assessment.difficulty === 'easy' ? 'bg-success/10 text-success' :
              assessment.difficulty === 'hard' ? 'bg-destructive/10 text-destructive' :
              'bg-warning/10 text-warning'
            }`}>
              {assessment.difficulty}
            </span>
          </div>
          <h3 className="text-xl font-heading mb-6">{currentQ.question_text}</h3>

          <div className="space-y-3">
            {currentQ.options.map((option: string, idx: number) => {
              const isSelected = answers[currentQ.id] === idx

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(currentQ.id, idx)}
                  className={`w-full p-4 rounded-base border-2 text-left transition-all ${
                    isSelected
                      ? 'bg-main/10 border-main shadow-md'
                      : 'bg-secondary-background border-border hover:border-main/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-main bg-main' : 'border-border'
                    }`}>
                      {isSelected && <div className="w-3 h-3 rounded-full bg-white" />}
                    </div>
                    <span className="font-heading text-sm mr-2">{String.fromCharCode(65 + idx)}.</span>
                    <span className="flex-1">{option}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t-2 border-border">
          <NButton
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            variant="neutral"
          >
            Previous
          </NButton>

          <div className="flex gap-2">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-8 h-8 rounded-base text-sm font-heading transition-all ${
                  idx === currentQuestion
                    ? 'bg-main text-white'
                    : answers[questions[idx].id] !== undefined
                    ? 'bg-success/20 text-success border-2 border-success/30'
                    : 'bg-secondary-background text-foreground/70 border-2 border-border'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentQuestion === totalQuestions - 1 ? (
            <NButton
              onClick={handleSubmit}
              disabled={submitting}
              variant="default"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </NButton>
          ) : (
            <NButton
              onClick={() => setCurrentQuestion(prev => Math.min(totalQuestions - 1, prev + 1))}
              variant="default"
            >
              Next
            </NButton>
          )}
        </div>
      </NCard>

      {/* Cancel Button */}
      <div className="text-center">
        <NButton onClick={onCancel} variant="neutral" size="sm">
          Cancel Quiz
        </NButton>
      </div>
    </div>
  )
}

