import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify user is an educator
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'educator') {
      return NextResponse.json(
        { error: "Forbidden - Educator access required" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      lessonId, 
      courseId, 
      title, 
      description, 
      difficulty, 
      questions,
      passingScore,
      timeLimitMinutes,
      maxAttempts,
      isRequired
    } = body

    if (!lessonId || !courseId || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify educator owns the course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .eq('educator_id', user.id)
      .single()

    if (courseError || !course) {
      return NextResponse.json(
        { error: "Course not found or access denied" },
        { status: 404 }
      )
    }

    // Check if assessment already exists for this lesson
    const { data: existingAssessment } = await supabase
      .from('lesson_assessments')
      .select('id')
      .eq('lesson_id', lessonId)
      .single()

    let assessmentId: string

    if (existingAssessment) {
      // Update existing assessment
      const { data: updatedAssessment, error: updateError } = await supabase
        .from('lesson_assessments')
        .update({
          title: title || 'Lesson Assessment',
          description,
          difficulty: difficulty || 'medium',
          passing_score: passingScore || 70,
          time_limit_minutes: timeLimitMinutes,
          max_attempts: maxAttempts,
          is_required: isRequired || false,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAssessment.id)
        .select()
        .single()

      if (updateError) throw updateError
      assessmentId = updatedAssessment.id

      // Delete old questions
      await supabase
        .from('assessment_questions')
        .delete()
        .eq('assessment_id', assessmentId)

    } else {
      // Create new assessment
      const { data: newAssessment, error: insertError } = await supabase
        .from('lesson_assessments')
        .insert({
          lesson_id: lessonId,
          course_id: courseId,
          title: title || 'Lesson Assessment',
          description,
          difficulty: difficulty || 'medium',
          passing_score: passingScore || 70,
          time_limit_minutes: timeLimitMinutes,
          max_attempts: maxAttempts,
          is_required: isRequired || false,
          created_by: user.id
        })
        .select()
        .single()

      if (insertError) throw insertError
      assessmentId = newAssessment.id
    }

    // Insert questions
    const questionsToInsert = questions.map((q: any, index: number) => ({
      assessment_id: assessmentId,
      question_text: q.question,
      question_type: 'multiple_choice',
      options: q.options || [],
      correct_answer: q.correctAnswer,
      explanation: q.explanation,
      points: 1,
      order_index: index
    }))

    const { error: questionsError } = await supabase
      .from('assessment_questions')
      .insert(questionsToInsert)

    if (questionsError) throw questionsError

    return NextResponse.json({
      success: true,
      assessmentId,
      message: `Assessment saved successfully with ${questions.length} questions`
    })

  } catch (error) {
    console.error("Error saving assessment:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch assessment for a lesson
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
    const lessonId = searchParams.get('lessonId')

    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId is required" },
        { status: 400 }
      )
    }

    // Get assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('lesson_assessments')
      .select('*')
      .eq('lesson_id', lessonId)
      .single()

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { success: true, assessment: null }
      )
    }

    // Get questions
    const { data: questions, error: questionsError } = await supabase
      .from('assessment_questions')
      .select('*')
      .eq('assessment_id', assessment.id)
      .order('order_index')

    if (questionsError) throw questionsError

    return NextResponse.json({
      success: true,
      assessment: {
        ...assessment,
        questions
      }
    })

  } catch (error) {
    console.error("Error fetching assessment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

