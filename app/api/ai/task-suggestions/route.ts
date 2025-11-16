import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate: string
  course: string
  subtasks?: string[]
}

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

    const { task, allTasks } = await request.json()

    if (!task) {
      return NextResponse.json(
        { error: "Task is required" },
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

    // Calculate task urgency and context
    const today = new Date()
    const dueDate = new Date(task.dueDate)
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    const todoCount = allTasks?.filter((t: Task) => t.status === "todo").length || 0
    const inProgressCount = allTasks?.filter((t: Task) => t.status === "in-progress").length || 0
    const completedCount = allTasks?.filter((t: Task) => t.status === "completed").length || 0
    
    const relatedTasks = allTasks?.filter(
      (t: Task) => t.id !== task.id && t.course === task.course
    ) || []

    // Build a comprehensive prompt for the AI
    const systemPrompt = `You are an intelligent task planning assistant for an LMS platform. Your role is to help learners optimize their study schedule, break down complex tasks, and provide actionable suggestions based on their workload and deadlines.

Provide specific, actionable suggestions that are:
- Practical and implementable
- Tailored to the learner's context
- Time-aware (considering deadlines)
- Educational (helping them learn better)

Return your response as a JSON object with this exact structure:
{
  "subtasks": ["subtask 1", "subtask 2", "subtask 3"],
  "schedule": "Detailed study schedule recommendation",
  "strategy": "Learning strategy and approach",
  "resources": "Recommended resources or prerequisites"
}`

    const userPrompt = `Analyze this learning task and provide intelligent suggestions:

**Task Details:**
- Title: ${task.title}
- Description: ${task.description || "No description provided"}
- Course: ${task.course}
- Priority: ${task.priority}
- Due Date: ${task.dueDate} (${daysUntilDue} days from now)
- Current Status: ${task.status}
${task.subtasks && task.subtasks.length > 0 ? `- Existing Subtasks: ${task.subtasks.join(", ")}` : ""}

**Learner's Context:**
- Total Tasks: ${allTasks?.length || 1}
- To Do: ${todoCount}
- In Progress: ${inProgressCount}
- Completed: ${completedCount}
${relatedTasks.length > 0 ? `- Related tasks in "${task.course}": ${relatedTasks.map((t: Task) => t.title).join(", ")}` : ""}

**Your Task:**
Generate practical suggestions including:
1. Break down this task into 3-5 manageable subtasks
2. Suggest an optimal study schedule considering the ${daysUntilDue} days until due date
3. Recommend a learning strategy (e.g., active recall, spaced repetition, project-based)
4. Identify any prerequisites or helpful resources

Be specific to the task title and course subject matter.`

    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "DigiGyan LMS"
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
        max_tokens: 1000,
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("OpenRouter API error:", errorData)
      return NextResponse.json(
        { error: "Failed to generate AI suggestions" },
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

    // Try to parse JSON response from AI
    let parsedResponse
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                       aiResponse.match(/```\n([\s\S]*?)\n```/) ||
                       [null, aiResponse]
      const jsonString = jsonMatch[1] || aiResponse
      parsedResponse = JSON.parse(jsonString.trim())
    } catch {
      // If AI didn't return proper JSON, format the text response
      parsedResponse = {
        subtasks: [],
        schedule: "",
        strategy: "",
        resources: "",
        rawResponse: aiResponse
      }
    }

    // Format suggestions for the frontend
    const suggestions = []
    
    if (parsedResponse.subtasks && parsedResponse.subtasks.length > 0) {
      suggestions.push({
        type: "subtasks",
        title: "Break Down Task",
        content: `Split "${task.title}" into ${parsedResponse.subtasks.length} subtasks`,
        subtasks: parsedResponse.subtasks
      })
    }
    
    if (parsedResponse.schedule) {
      suggestions.push({
        type: "schedule",
        title: "Study Schedule",
        content: parsedResponse.schedule
      })
    }
    
    if (parsedResponse.strategy) {
      suggestions.push({
        type: "strategy",
        title: "Learning Strategy",
        content: parsedResponse.strategy
      })
    }
    
    if (parsedResponse.resources) {
      suggestions.push({
        type: "resources",
        title: "Resources & Prerequisites",
        content: parsedResponse.resources
      })
    }

    // If AI returned raw text, create a single suggestion
    if (suggestions.length === 0 && parsedResponse.rawResponse) {
      suggestions.push({
        type: "general",
        title: "AI Suggestion",
        content: parsedResponse.rawResponse
      })
    }

    return NextResponse.json({
      success: true,
      suggestions,
      rawResponse: parsedResponse
    })

  } catch (error) {
    console.error("Error in AI task suggestions:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

