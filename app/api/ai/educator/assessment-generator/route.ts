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

    const { lessonContent, lessonTitle, questionCount, difficulty } = await request.json()

    if (!lessonContent) {
      return NextResponse.json(
        { error: "Lesson content is required" },
        { status: 400 }
      )
    }

    // Strip HTML tags and clean content for better AI processing
    const cleanContent = lessonContent
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '[Video Content]') // Replace iframes with placeholder
      .replace(/<style[^>]*>.*?<\/style>/gi, '') // Remove style tags
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]+>/g, ' ') // Remove remaining HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      )
    }

    const systemPrompt = `You are an expert assessment designer for online education. Create high-quality quiz questions that:
- Test understanding, not just memorization
- Are clear and unambiguous
- Have one correct answer and 3 plausible distractors
- Cover key concepts from the lesson
- Match the specified difficulty level
- Include explanations for correct answers

Return your response as a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct and what concept it tests",
      "difficulty": "easy|medium|hard"
    }
  ]
}`

    const userPrompt = `Based on the following lesson content, generate ${questionCount || 5} assessment questions.

**Lesson Title:** ${lessonTitle || "Untitled Lesson"}
**Difficulty Level:** ${difficulty || "medium"}

**Lesson Content:**
${cleanContent}

**Requirements:**
1. Create exactly ${questionCount || 5} multiple-choice questions
2. Each question should have 4 options (A, B, C, D)
3. Include a mix of difficulty levels if not specified
4. Cover different aspects of the lesson content
5. Provide clear explanations for correct answers
6. Ensure questions test comprehension and application, not just recall
7. Make distractors plausible but clearly wrong

Generate questions that will help students validate their understanding of the key concepts.`

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "DigiGyan LMS - Educator AI"
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
        temperature: 0.7,
        max_tokens: 2000,
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("OpenRouter API error:", errorData)
      return NextResponse.json(
        { error: "Failed to generate assessment" },
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

    // Try to parse JSON response from AI with multiple strategies
    let parsedResponse
    try {
      // Strategy 1: Try direct JSON parse
      try {
        parsedResponse = JSON.parse(aiResponse.trim())
      } catch {
        // Strategy 2: Extract from markdown code blocks
        const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                         aiResponse.match(/```\n([\s\S]*?)\n```/)
        
        if (jsonMatch && jsonMatch[1]) {
          parsedResponse = JSON.parse(jsonMatch[1].trim())
        } else {
          // Strategy 3: Try to find JSON object in text
          const objectMatch = aiResponse.match(/\{[\s\S]*\}/)
          if (objectMatch) {
            parsedResponse = JSON.parse(objectMatch[0])
          } else {
            throw new Error("No valid JSON found in response")
          }
        }
      }

      console.log("Successfully parsed AI response")
      
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      console.error("Raw AI response:", aiResponse)
      
      return NextResponse.json(
        { 
          success: false,
          error: "The AI returned an invalid format. Please try again.",
          details: parseError instanceof Error ? parseError.message : "Unknown error",
          rawResponse: aiResponse.substring(0, 500)
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      assessment: parsedResponse
    })

  } catch (error) {
    console.error("Error in AI assessment generation:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

