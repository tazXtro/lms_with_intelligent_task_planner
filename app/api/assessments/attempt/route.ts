import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

// Submit a quiz attempt
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { assessmentId, answers, timeTakenSeconds } = body

    if (!assessmentId || !answers) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get assessment with questions
    const { data: assessment, error: assessmentError } = await supabase
      .from('lesson_assessments')
      .select('*, assessment_questions(*)')
      .eq('id', assessmentId)
      .single()

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      )
    }

    // Verify learner is enrolled in the course
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', assessment.course_id)
      .eq('learner_id', user.id)
      .single()

    if (enrollmentError || !enrollment) {
      return NextResponse.json(
        { error: "Not enrolled in this course" },
        { status: 403 }
      )
    }

    // Check max attempts if applicable
    if (assessment.max_attempts) {
      const { data: previousAttempts } = await supabase
        .from('assessment_attempts')
        .select('id')
        .eq('assessment_id', assessmentId)
        .eq('learner_id', user.id)

      if (previousAttempts && previousAttempts.length >= assessment.max_attempts) {
        return NextResponse.json(
          { error: "Maximum attempts reached" },
          { status: 403 }
        )
      }
    }

    // Calculate score
    const questions = assessment.assessment_questions || []
    let correctCount = 0
    let totalPoints = 0

    questions.forEach((question: any) => {
      totalPoints += question.points || 1
      const userAnswer = answers[question.id]
      if (userAnswer === question.correct_answer) {
        correctCount += question.points || 1
      }
    })

    const score = totalPoints > 0 ? (correctCount / totalPoints) * 100 : 0
    const passed = score >= (assessment.passing_score || 70)

    // Save attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('assessment_attempts')
      .insert({
        assessment_id: assessmentId,
        learner_id: user.id,
        enrollment_id: enrollment.id,
        answers,
        score: score,
        passed: passed,
        time_taken_seconds: timeTakenSeconds,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (attemptError) throw attemptError

    // Return detailed results
    const results = questions.map((question: any) => {
      const userAnswer = answers[question.id]
      const isCorrect = userAnswer === question.correct_answer

      return {
        questionId: question.id,
        questionText: question.question_text,
        options: question.options,
        userAnswer,
        correctAnswer: question.correct_answer,
        isCorrect,
        explanation: question.explanation
      }
    })

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score: score,
      passed: passed,
      correctCount: correctCount,
      totalQuestions: questions.length,
      passingScore: assessment.passing_score || 70,
      results
    })

  } catch (error) {
    console.error("Error submitting assessment attempt:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// Get learner's attempts for an assessment
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const assessmentId = searchParams.get('assessmentId')

    if (!assessmentId) {
      return NextResponse.json(
        { error: "assessmentId is required" },
        { status: 400 }
      )
    }

    // Get all attempts for this assessment by this learner
    const { data: attempts, error: attemptsError } = await supabase
      .from('assessment_attempts')
      .select('*')
      .eq('assessment_id', assessmentId)
      .eq('learner_id', user.id)
      .order('created_at', { ascending: false })

    if (attemptsError) throw attemptsError

    return NextResponse.json({
      success: true,
      attempts: attempts || []
    })

  } catch (error) {
    console.error("Error fetching attempts:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

