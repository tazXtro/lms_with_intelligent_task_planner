import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/utils/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { sessionId } = await req.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      )
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Verify the payment was successful
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      )
    }

    // Verify the user matches
    if (session.metadata?.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to this session" },
        { status: 403 }
      )
    }

    const courseId = session.metadata?.courseId || session.client_reference_id

    if (!courseId) {
      return NextResponse.json(
        { error: "Course information not found" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      courseId,
      sessionId: session.id,
      amountPaid: session.amount_total ? session.amount_total / 100 : 0,
    })
  } catch (error: any) {
    console.error("Session verification error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to verify session" },
      { status: 500 }
    )
  }
}

