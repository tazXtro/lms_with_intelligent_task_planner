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

    const { courseData, enrollmentStats, lessonProgress } = await request.json()

    if (!courseData) {
      return NextResponse.json(
        { error: "Course data is required" },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      )
    }

    const systemPrompt = `You are an expert educational data analyst and instructor coach. Analyze course performance data and provide actionable insights to help educators improve student outcomes.

Provide insights that are:
- Data-driven and specific
- Actionable with clear next steps
- Focused on student success
- Pedagogically sound
- Encouraging and constructive

Return your response as a JSON object with this exact structure:
{
  "overallHealth": "excellent|good|needs_attention|critical",
  "keyMetrics": {
    "studentEngagement": "High|Medium|Low",
    "completionRate": "X%",
    "averageProgress": "X%",
    "retentionRisk": "Low|Medium|High"
  },
  "insights": [
    {
      "type": "strength|concern|opportunity",
      "title": "Insight title",
      "description": "Detailed description",
      "priority": "high|medium|low"
    }
  ],
  "recommendations": [
    {
      "action": "Specific action to take",
      "impact": "Expected positive outcome",
      "effort": "low|medium|high"
    }
  ],
  "trends": {
    "positive": ["Positive trend 1", "Positive trend 2"],
    "negative": ["Concerning trend 1", "Concerning trend 2"]
  }
}`

    const userPrompt = `Analyze the following course data and provide comprehensive insights:

**Course Information:**
- Title: ${courseData.title}
- Total Enrolled: ${enrollmentStats?.totalEnrolled || 0}
- Active Students: ${enrollmentStats?.activeStudents || 0}
- Completed: ${enrollmentStats?.completed || 0}
- Average Progress: ${enrollmentStats?.averageProgress || 0}%

**Course Structure:**
- Total Sections: ${courseData.totalSections || 0}
- Total Lessons: ${courseData.totalLessons || 0}
- Price: $${courseData.price || 0}

**Lesson Performance:**
${lessonProgress ? JSON.stringify(lessonProgress, null, 2) : 'No detailed lesson data available'}

**Your Task:**
1. Assess overall course health
2. Identify strengths and areas for improvement
3. Spot concerning patterns or drop-off points
4. Provide specific, actionable recommendations
5. Suggest engagement strategies
6. Identify high-performing and low-performing content

Focus on helping the educator maximize student success and course effectiveness.`

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
        temperature: 0.6,
        max_tokens: 2000,
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("OpenRouter API error:", errorData)
      return NextResponse.json(
        { error: "Failed to generate insights" },
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
      insights: parsedResponse
    })

  } catch (error) {
    console.error("Error in AI student insights generation:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

