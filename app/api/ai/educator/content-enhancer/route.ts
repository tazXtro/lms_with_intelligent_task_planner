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

    const { text, enhancementType, context } = await request.json()

    if (!text || !enhancementType) {
      return NextResponse.json(
        { error: "Text and enhancement type are required" },
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

    const enhancementPrompts: Record<string, string> = {
      description: `You are an expert copywriter specializing in educational content. Transform the following course description into compelling, professional copy that:
- Clearly communicates value and learning outcomes
- Uses engaging, benefit-driven language
- Addresses the target audience directly
- Includes specific details about what students will achieve
- Maintains a professional yet approachable tone
- Is 2-3 well-structured paragraphs

Return ONLY the enhanced description text, no JSON or extra formatting.`,

      objectives: `You are an instructional designer. Rewrite the following learning objectives to be:
- Specific and measurable
- Action-oriented (using Bloom's taxonomy verbs)
- Clear and concise
- Focused on student outcomes
- Professional and compelling

Return your response as a JSON array of strings:
["Enhanced objective 1", "Enhanced objective 2", ...]`,

      lessonContent: `You are an expert educator. Enhance the following lesson content to be:
- More engaging and conversational
- Better structured with clear sections
- Includes practical examples and analogies
- Uses formatting for readability (headings, bullet points)
- Maintains educational rigor
- Approachable for the target skill level

Return ONLY the enhanced lesson content in markdown format.`,

      marketing: `You are a marketing copywriter for online courses. Create compelling marketing copy that:
- Grabs attention with a strong hook
- Highlights unique value propositions
- Addresses pain points and solutions
- Creates urgency and desire
- Includes social proof elements
- Ends with a clear call-to-action

Return ONLY the marketing copy text, no JSON or extra formatting.`
    }

    const systemPrompt = enhancementPrompts[enhancementType] || enhancementPrompts.description

    const contextInfo = context ? `\n\n**Additional Context:**\n${JSON.stringify(context, null, 2)}` : ""
    
    const userPrompt = `${text}${contextInfo}`

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
        max_tokens: 1500,
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("OpenRouter API error:", errorData)
      return NextResponse.json(
        { error: "Failed to enhance content" },
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

    // For objectives, try to parse as JSON array with multiple strategies
    if (enhancementType === 'objectives') {
      try {
        let parsedObjectives
        
        // Try direct JSON parse first
        try {
          parsedObjectives = JSON.parse(aiResponse.trim())
        } catch {
          // Try extracting from markdown code blocks
          const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                           aiResponse.match(/```\n([\s\S]*?)\n```/)
          
          if (jsonMatch && jsonMatch[1]) {
            parsedObjectives = JSON.parse(jsonMatch[1].trim())
          } else {
            // Try finding array in text
            const arrayMatch = aiResponse.match(/\[([\s\S]*?)\]/)
            if (arrayMatch) {
              parsedObjectives = JSON.parse(arrayMatch[0])
            } else {
              throw new Error("No valid array found")
            }
          }
        }
        
        return NextResponse.json({
          success: true,
          enhanced: parsedObjectives
        })
      } catch {
        // If parsing fails, try to extract bullet points
        const lines = aiResponse.split('\n').filter((line: string) => line.trim())
        const objectives = lines
          .filter((line: string) => line.match(/^[-*•]\s+/) || line.match(/^\d+\.\s+/))
          .map((line: string) => line.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '').trim())
        
        return NextResponse.json({
          success: true,
          enhanced: objectives.length > 0 ? objectives : [aiResponse]
        })
      }
    }

    // For other types, return text as is
    return NextResponse.json({
      success: true,
      enhanced: aiResponse.trim()
    })

  } catch (error) {
    console.error("Error in AI content enhancement:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

