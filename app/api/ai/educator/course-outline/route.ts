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

    const { topic, level, category, duration } = await request.json()

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      )
    }

    // Check for OpenRouter API key
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      )
    }

    const systemPrompt = `You are an expert instructional designer and curriculum developer. Your role is to create comprehensive, well-structured course outlines that maximize student learning outcomes.

Create course outlines that are:
- Pedagogically sound with clear learning progression
- Engaging and practical
- Properly scoped for the given duration
- Aligned with industry standards and best practices

CRITICAL: You MUST return ONLY a valid JSON object with no additional text, explanations, or markdown formatting.

Return your response as a JSON object with this EXACT structure (no code blocks, no markdown, just the JSON):
{
  "courseTitle": "Engaging course title",
  "subtitle": "Compelling one-line description",
  "description": "Detailed 2-3 paragraph course description",
  "learningObjectives": ["objective 1", "objective 2", "objective 3", "objective 4"],
  "prerequisites": ["prerequisite 1", "prerequisite 2"],
  "targetAudience": ["audience 1", "audience 2", "audience 3"],
  "sections": [
    {
      "title": "Section title",
      "description": "What this section covers",
      "lessons": [
        {
          "title": "Lesson title",
          "description": "Brief lesson description",
          "estimatedDuration": 15,
          "type": "video"
        }
      ]
    }
  ],
  "suggestedPrice": 49.99,
  "estimatedTotalDuration": 120
}

IMPORTANT: Return ONLY the JSON object above. Do not include any other text or formatting.`

    const userPrompt = `Create a comprehensive course outline for the following:

**Course Topic:** ${topic}
**Difficulty Level:** ${level || "all levels"}
**Category:** ${category || "general"}
**Target Duration:** ${duration || "flexible"} hours

**Requirements:**
1. Create 4-8 sections that build progressively
2. Each section should have 3-6 lessons
3. Mix video lessons with text-based content and practical exercises
4. Include clear learning objectives (4-6 objectives)
5. Define prerequisites (if any)
6. Identify target audience (2-4 groups)
7. Suggest a competitive price based on content depth
8. Estimate lesson durations (in minutes)

Make the course practical, engaging, and market-ready. Consider current industry trends and learner needs.`

    // Call OpenRouter API
    console.log("Calling OpenRouter API with model:", "meta-llama/llama-3.3-70b-instruct:free")
    
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
        max_tokens: 3000,
        // Note: response_format may not be supported by all models
      })
    })

    console.log("OpenRouter API response status:", response.status)

    if (!response.ok) {
      const errorData = await response.text()
      console.error("OpenRouter API error response:", errorData)
      console.error("Response status:", response.status)
      
      // Try to parse error message
      let errorMessage = "Failed to generate course outline"
      try {
        const errorJson = JSON.parse(errorData)
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage
        console.error("Parsed error:", errorMessage)
      } catch {
        console.error("Could not parse error response")
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage,
          details: `Status ${response.status}: ${errorData.substring(0, 200)}`,
          statusCode: response.status
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("OpenRouter API response data:", JSON.stringify(data, null, 2))
    
    const aiResponse = data.choices?.[0]?.message?.content

    if (!aiResponse) {
      console.error("No AI response content found in:", data)
      return NextResponse.json(
        { 
          success: false,
          error: "No response from AI",
          details: "The AI did not return any content. This might be a model or API issue.",
          rawData: data
        },
        { status: 500 }
      )
    }
    
    console.log("AI Response (first 200 chars):", aiResponse.substring(0, 200))

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

      // Validate that we have the expected structure
      if (!parsedResponse || typeof parsedResponse !== 'object') {
        throw new Error("Parsed response is not a valid object")
      }

      console.log("Successfully parsed AI response:", JSON.stringify(parsedResponse, null, 2))
      
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      console.error("Raw AI response:", aiResponse)
      
      return NextResponse.json(
        { 
          success: false,
          error: "The AI returned an invalid format. Please try again.",
          details: parseError instanceof Error ? parseError.message : "Unknown error",
          rawResponse: aiResponse.substring(0, 500) // First 500 chars for debugging
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      outline: parsedResponse
    })

  } catch (error) {
    console.error("Error in AI course outline generation:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error occurred",
        type: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    )
  }
}

