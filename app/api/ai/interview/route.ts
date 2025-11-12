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

    // Verify user is a learner
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'learner') {
      return NextResponse.json(
        { error: "Forbidden - Learner access required" },
        { status: 403 }
      )
    }

    const { action, jobDescription, conversationHistory, sessionId } = await request.json()

    // Check for OpenRouter API key
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      )
    }

    // Handle different actions
    if (action === "start") {
      // Start a new interview
      if (!jobDescription) {
        return NextResponse.json(
          { error: "Job description is required" },
          { status: 400 }
        )
      }

      const systemPrompt = `You are a professional and experienced technical interviewer conducting a realistic job interview. Your role is to:

1. **Analyze the job description** provided and conduct a comprehensive interview based on the requirements
2. **Ask relevant technical and behavioral questions** that match the job role
3. **Be professional, encouraging, and constructive** - create a realistic interview experience
4. **Listen carefully** to the candidate's responses and ask thoughtful follow-up questions
5. **Adapt your questions** based on the candidate's answers and experience level
6. **Cover multiple areas**: technical skills, problem-solving, past experiences, soft skills
7. **Keep responses concise** (2-3 sentences per question) to maintain natural conversation flow
8. **Provide brief feedback** when appropriate to keep the candidate engaged

IMPORTANT GUIDELINES:
- Ask ONE question at a time
- Keep your responses conversational and natural (like a real interviewer would speak)
- Don't overwhelm with multiple questions in one response
- Be encouraging and professional
- If the answer is good, acknowledge it briefly before moving to the next question
- Conduct 5-8 questions total for a complete interview
- After sufficient questions, wrap up the interview naturally

Current interview stage: OPENING - Start with a warm greeting and first question.`

      const userPrompt = `Job Description:
${jobDescription}

Begin the interview with a professional greeting and your first question based on this job description.`

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": "DigiGyan LMS - AI Interview"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-0528:free",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: userPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("OpenRouter API error:", errorData)
        return NextResponse.json(
          { error: "Failed to start interview" },
          { status: response.status }
        )
      }

      const data = await response.json()
      const aiResponse = data.choices?.[0]?.message?.content

      if (!aiResponse) {
        return NextResponse.json(
          { error: "No response from AI" },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: aiResponse,
        stage: "ongoing"
      })

    } else if (action === "continue") {
      // Continue the interview with conversation history
      if (!conversationHistory || !Array.isArray(conversationHistory)) {
        return NextResponse.json(
          { error: "Conversation history is required" },
          { status: 400 }
        )
      }

      const questionCount = conversationHistory.filter((msg: any) => msg.role === "assistant").length

      let stageInstruction = ""
      if (questionCount >= 7) {
        stageInstruction = "\n\nINTERVIEW STAGE: CLOSING - This should be your final question or wrap up the interview professionally. Thank the candidate and indicate the interview is complete."
      } else if (questionCount >= 5) {
        stageInstruction = "\n\nINTERVIEW STAGE: LATE - You're near the end. Ask 1-2 more meaningful questions before wrapping up."
      } else {
        stageInstruction = "\n\nINTERVIEW STAGE: ONGOING - Continue with relevant questions based on the job requirements and previous answers."
      }

      const systemPrompt = `You are a professional and experienced technical interviewer conducting a realistic job interview. Your role is to:

1. **Analyze the candidate's previous answers** and ask relevant follow-up or new questions
2. **Ask ONE question at a time** to maintain natural conversation flow
3. **Be professional, encouraging, and constructive**
4. **Adapt questions** based on the candidate's experience level and previous responses
5. **Keep responses concise** (2-3 sentences per question)
6. **Provide brief acknowledgment** of good answers before next question
7. **Cover diverse areas**: technical skills, problem-solving, experiences, soft skills

${stageInstruction}

Remember: Keep it conversational and natural, like a real interviewer.`

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": "DigiGyan LMS - AI Interview"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.3-70b-instruct:free",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            ...conversationHistory
          ],
          temperature: 0.7,
          max_tokens: 500,
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("OpenRouter API error:", errorData)
        return NextResponse.json(
          { error: "Failed to continue interview" },
          { status: response.status }
        )
      }

      const data = await response.json()
      const aiResponse = data.choices?.[0]?.message?.content

      if (!aiResponse) {
        return NextResponse.json(
          { error: "No response from AI" },
          { status: 500 }
        )
      }

      // Detect if interview is ending
      const isEnding = aiResponse.toLowerCase().includes("thank you for") ||
                       aiResponse.toLowerCase().includes("that concludes") ||
                       aiResponse.toLowerCase().includes("best of luck") ||
                       aiResponse.toLowerCase().includes("we'll be in touch") ||
                       questionCount >= 8

      return NextResponse.json({
        success: true,
        message: aiResponse,
        stage: isEnding ? "completed" : "ongoing"
      })

    } else if (action === "feedback") {
      // Generate comprehensive feedback based on the interview
      if (!conversationHistory || !Array.isArray(conversationHistory)) {
        return NextResponse.json(
          { error: "Conversation history is required" },
          { status: 400 }
        )
      }

      if (!jobDescription) {
        return NextResponse.json(
          { error: "Job description is required for feedback" },
          { status: 400 }
        )
      }

      const systemPrompt = `You are an expert interview evaluator. Analyze the interview conversation and provide comprehensive, constructive feedback in JSON format.

CRITICAL: Return ONLY a valid JSON object with no additional text or markdown formatting.

Evaluate the candidate's performance across multiple dimensions and provide actionable feedback.

Return your response as a JSON object with this EXACT structure:
{
  "overallScore": 85,
  "overallFeedback": "Brief 2-3 sentence overall assessment",
  "strengths": [
    "Specific strength 1",
    "Specific strength 2",
    "Specific strength 3"
  ],
  "areasForImprovement": [
    "Specific area 1 with actionable advice",
    "Specific area 2 with actionable advice",
    "Specific area 3 with actionable advice"
  ],
  "skillsAssessment": {
    "technical": { "score": 80, "feedback": "Brief assessment" },
    "communication": { "score": 90, "feedback": "Brief assessment" },
    "problemSolving": { "score": 75, "feedback": "Brief assessment" },
    "experience": { "score": 85, "feedback": "Brief assessment" }
  },
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2",
    "Actionable recommendation 3"
  ],
  "interviewQuality": "excellent",
  "readinessLevel": "ready"
}

interviewQuality options: "excellent", "good", "fair", "needs_improvement"
readinessLevel options: "ready", "almost_ready", "needs_practice", "needs_significant_work"`

      const userPrompt = `Job Description:
${jobDescription}

Interview Conversation:
${conversationHistory.map((msg: any) => `${msg.role === "assistant" ? "Interviewer" : "Candidate"}: ${msg.content}`).join("\n\n")}

Provide comprehensive feedback for this interview performance.`

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": "DigiGyan LMS - AI Interview Feedback"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.3-70b-instruct:free",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: userPrompt
            }
          ],
          temperature: 0.5,
          max_tokens: 2000,
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("OpenRouter API error:", errorData)
        return NextResponse.json(
          { error: "Failed to generate feedback" },
          { status: response.status }
        )
      }

      const data = await response.json()
      const aiResponse = data.choices?.[0]?.message?.content

      if (!aiResponse) {
        return NextResponse.json(
          { error: "No response from AI" },
          { status: 500 }
        )
      }

      // Parse JSON response
      let parsedFeedback
      try {
        // Try direct JSON parse
        try {
          parsedFeedback = JSON.parse(aiResponse.trim())
        } catch {
          // Try to extract from markdown code blocks
          const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                           aiResponse.match(/```\n([\s\S]*?)\n```/)
          
          if (jsonMatch && jsonMatch[1]) {
            parsedFeedback = JSON.parse(jsonMatch[1].trim())
          } else {
            // Try to find JSON object in text
            const objectMatch = aiResponse.match(/\{[\s\S]*\}/)
            if (objectMatch) {
              parsedFeedback = JSON.parse(objectMatch[0])
            } else {
              throw new Error("No valid JSON found in response")
            }
          }
        }
      } catch (parseError) {
        console.error("Failed to parse feedback:", parseError)
        console.error("Raw response:", aiResponse)
        
        return NextResponse.json(
          { error: "Failed to parse feedback" },
          { status: 500 }
        )
      }

      // Save feedback to database if sessionId provided
      if (sessionId) {
        await supabase
          .from('interview_sessions')
          .update({
            feedback: parsedFeedback,
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', sessionId)
      }

      return NextResponse.json({
        success: true,
        feedback: parsedFeedback
      })

    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error("Error in AI interview:", error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

