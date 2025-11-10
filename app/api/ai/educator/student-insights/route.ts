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

    const systemPrompt = `You are an expert educational data analyst and online course business consultant. Analyze teaching performance data and provide strategic, actionable insights to help educators improve student outcomes AND grow their teaching business.

CRITICAL RULES:
- NEVER complain about course structure, sections, or lessons - educators already know their content
- Focus ONLY on student behavior, engagement patterns, and business metrics
- Provide specific, data-driven insights based on the actual numbers
- Give actionable recommendations that educators can implement immediately
- Be encouraging and constructive, highlighting both strengths and opportunities
- Think like a business coach AND educational expert

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
      "title": "Insight title (focused on students/business, NOT course structure)",
      "description": "Detailed description with specific numbers and actionable advice",
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
    "negative": ["Concerning trend 1 (about students, not content)", "Concerning trend 2"]
  }
}`

    const userPrompt = `Analyze this educator's teaching performance and provide strategic insights:

**📊 TEACHING PORTFOLIO:**
${courseData.totalCourses ? `
- Total Courses: ${courseData.totalCourses}
- Published Courses: ${courseData.publishedCourses}
- Total Content: ${courseData.totalSections} sections, ${courseData.totalLessons} lessons
- Average Course Price: $${courseData.averagePrice}
` : `
- Single Course: ${courseData.title}
- Price: $${courseData.price || 0}
`}

**👥 STUDENT METRICS (REAL DATA):**
- Total Enrolled: ${enrollmentStats?.totalEnrolled || 0} students
- Currently Active (learning): ${enrollmentStats?.activeStudents || 0} students (${enrollmentStats?.totalEnrolled > 0 ? Math.round((enrollmentStats.activeStudents / enrollmentStats.totalEnrolled) * 100) : 0}%)
- Completed Courses: ${enrollmentStats?.completed || 0} students (${enrollmentStats?.totalEnrolled > 0 ? Math.round((enrollmentStats.completed / enrollmentStats.totalEnrolled) * 100) : 0}%)
- Not Yet Started: ${enrollmentStats?.notStarted || 0} students (${enrollmentStats?.totalEnrolled > 0 ? Math.round((enrollmentStats.notStarted / enrollmentStats.totalEnrolled) * 100) : 0}%)
- Average Student Progress: ${enrollmentStats?.averageProgress || 0}%

**💰 BUSINESS IMPACT:**
${enrollmentStats?.totalEnrolled > 0 ? `
- Completion Rate: ${Math.round((enrollmentStats.completed / enrollmentStats.totalEnrolled) * 100)}%
- Student Activation Rate: ${Math.round(((enrollmentStats.activeStudents + enrollmentStats.completed) / enrollmentStats.totalEnrolled) * 100)}%
- Total Revenue Generated: $${enrollmentStats.totalRevenue || 0}
- Average Revenue Per Student: $${enrollmentStats.totalRevenue && enrollmentStats.totalEnrolled ? Math.round(enrollmentStats.totalRevenue / enrollmentStats.totalEnrolled) : 0}
` : '- New educator starting their journey'}

**🎯 YOUR ANALYSIS TASKS:**

1. **Student Engagement Analysis:**
   - Evaluate the ${Math.round(((enrollmentStats.activeStudents + enrollmentStats.completed) / enrollmentStats.totalEnrolled) * 100)}% activation rate
   - Assess the ${enrollmentStats.notStarted} students who haven't started
   - Analyze the ${enrollmentStats.averageProgress}% average progress

2. **Completion Performance:**
   - The ${Math.round((enrollmentStats.completed / enrollmentStats.totalEnrolled) * 100)}% completion rate - is this good/bad/average?
   - What's causing students to complete or drop off?
   - Are students making it past the initial lessons?

3. **Business Opportunities:**
   - Revenue optimization strategies based on $${enrollmentStats.totalRevenue} total revenue
   - Growth opportunities based on current performance
   - Pricing effectiveness analysis (currently averaging $${enrollmentStats.totalRevenue && enrollmentStats.totalEnrolled ? Math.round(enrollmentStats.totalRevenue / enrollmentStats.totalEnrolled) : 0} per student)

4. **Actionable Recommendations:**
   - How to activate the ${enrollmentStats.notStarted} inactive students
   - How to improve the ${enrollmentStats.averageProgress}% average progress
   - Strategies to increase completion from ${Math.round((enrollmentStats.completed / enrollmentStats.totalEnrolled) * 100)}%
   - Ways to maintain engagement with ${enrollmentStats.activeStudents} active students

**IMPORTANT:**
- DO NOT mention course structure, sections, or lessons
- Focus on student behavior and business metrics
- Use the REAL numbers provided above in your insights
- Be specific about the actual percentages and counts
- Provide actionable strategies the educator can implement TODAY`

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

