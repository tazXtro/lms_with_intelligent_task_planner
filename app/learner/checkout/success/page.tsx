"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"

interface CourseDetails {
  id: string
  title: string
  price: number
}

function CheckoutSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get("session_id")
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [course, setCourse] = useState<CourseDetails | null>(null)
  const [orderId, setOrderId] = useState<string>("")

  useEffect(() => {
    if (sessionId) {
      verifyPaymentAndEnroll()
    } else {
      setError("Invalid session")
      setLoading(false)
    }
  }, [sessionId])

  const verifyPaymentAndEnroll = async () => {
    try {
      setLoading(true)

      // Get authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push("/auth")
        return
      }

      // Verify the payment session with our backend
      const response = await fetch("/api/stripe/verify-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Payment verification failed")
      }

      // Get course details
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, title, price")
        .eq("id", data.courseId)
        .single()

      if (courseError) throw courseError

      setCourse(courseData)
      setOrderId(data.sessionId)

      // Check if already enrolled (to prevent duplicate enrollments)
      const { data: existingEnrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("course_id", courseData.id)
        .eq("learner_id", user.id)
        .single()

      if (!existingEnrollment) {
        // Enroll the user
        const { error: enrollError } = await supabase.from("enrollments").insert({
          course_id: courseData.id,
          learner_id: user.id,
          progress: 0,
        })

        if (enrollError) throw enrollError
      }

      setLoading(false)
    } catch (err: any) {
      console.error("Error verifying payment:", err)
      setError(err.message || "Failed to process enrollment")
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 border-4 border-main text-main animate-spin mx-auto mb-4" />
          <p className="font-heading text-lg">Verifying your payment...</p>
          <p className="text-sm text-foreground/70 mt-2 font-base">Please don't close this page</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <NCard className="p-10 text-center">
            <div className="w-20 h-20 bg-accent border-4 border-border rounded-base flex items-center justify-center mx-auto mb-6 shadow-shadow">
              <AlertCircle className="w-10 h-10 text-main-foreground" />
            </div>
            <h1 className="text-4xl font-heading mb-3">Payment Verification Failed</h1>
            <p className="text-foreground/70 mb-8 font-base text-lg">{error}</p>
            <div className="space-y-3">
              <Link href="/learner/browse" className="block">
                <NButton variant="default" className="w-full" size="lg">
                  Browse Courses
                </NButton>
              </Link>
              <Link href="/learner/dashboard" className="block">
                <NButton variant="neutral" className="w-full" size="lg">
                  Go to Dashboard
                </NButton>
              </Link>
            </div>
          </NCard>
        </div>
      </div>
    )
  }

  if (!course) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <NCard className="p-10 text-center">
          <div className="w-20 h-20 bg-success border-4 border-border rounded-base flex items-center justify-center mx-auto mb-6 shadow-shadow">
            <CheckCircle2 className="w-10 h-10 text-main-foreground" />
          </div>
          <h1 className="text-4xl font-heading mb-3">Payment Successful!</h1>
          <p className="text-foreground/70 mb-8 font-base text-lg">
            You have successfully enrolled in "{course.title}". Your course access is now active.
          </p>

          <NCard className="p-6 mb-8 bg-main/5 text-left">
            <p className="text-sm text-foreground/70 mb-4 font-heading">Order Details</p>
            <div className="space-y-3 text-sm font-base">
              <div className="flex justify-between pb-3 border-b-2 border-border">
                <span className="text-foreground/70">Course:</span>
                <span className="font-heading">{course.title}</span>
              </div>
              <div className="flex justify-between pb-3 border-b-2 border-border">
                <span className="text-foreground/70">Amount Paid:</span>
                <span className="font-heading">${course.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/70">Order ID:</span>
                <span className="font-heading text-xs break-all">{orderId.substring(0, 24)}...</span>
              </div>
            </div>
          </NCard>

          <div className="space-y-3">
            <Link href={`/learner/learn/${course.id}`} className="block">
              <NButton className="w-full" variant="default" size="lg">
                Start Learning
              </NButton>
            </Link>
            <Link href="/learner/dashboard" className="block">
              <NButton variant="neutral" className="w-full" size="lg">
                Go to Dashboard
              </NButton>
            </Link>
          </div>
        </NCard>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 border-4 border-main text-main animate-spin mx-auto mb-4" />
          <p className="font-heading text-lg">Loading...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}

