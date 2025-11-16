"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { ArrowLeft, Lock, CheckCircle2, AlertCircle, Brain, CreditCard } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import type { Course } from "@/types/database.types"

interface CourseWithEducator extends Course {
  educator: {
    full_name: string
  } | null
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams?.get("course")
  const supabase = createClient()

  const [course, setCourse] = useState<CourseWithEducator | null>(null)
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canceled = searchParams?.get("canceled")

  useEffect(() => {
    if (courseId) {
      loadCourse()
    }
  }, [courseId])

  const loadCourse = async () => {
    try {
      setLoading(true)
      const { data: courseData, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single()

      if (error) throw error

      // Get educator profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", courseData.educator_id)
        .single()

      setCourse({
        ...courseData,
        educator: profile || null,
      })
    } catch (err) {
      console.error("Error loading course:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async () => {
    if (!course || isProcessing) return

    setIsProcessing(true)
    setError(null)

    try {
      // Check authentication
      const {
        data: { user },
      } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/auth")
        return
      }

      // Create Stripe checkout session
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: course.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      console.error("Checkout error:", err)
      setError(err.message || "Failed to initiate checkout. Please try again.")
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-main border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-heading text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="font-heading text-lg mb-4">Course not found</p>
          <Link href="/learner/browse">
            <NButton variant="default">Browse Courses</NButton>
          </Link>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-4 border-border bg-background sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center gap-4">
          <Link href={`/learner/course/${course.id}`}>
            <NButton variant="neutral" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </NButton>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-main border-2 border-border rounded-base flex items-center justify-center shadow-shadow">
              <Brain className="w-6 h-6 text-main-foreground" />
            </div>
            <span className="font-heading text-xl">DigiGyan</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="md:col-span-2">
            <NCard className="p-8">
              <h1 className="text-4xl font-heading mb-8">Secure Checkout</h1>

              {/* Canceled Message */}
              {canceled && (
                <NCard className="p-5 bg-accent/10 border-accent/30 mb-6">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-foreground font-base">
                      <p className="font-heading mb-1">Payment Canceled</p>
                      <p>Your payment was canceled. You can try again when you're ready.</p>
                    </div>
                  </div>
                </NCard>
              )}

              {/* Error Message */}
              {error && (
                <NCard className="p-5 bg-accent/10 border-accent/30 mb-6">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-foreground font-base">
                      <p className="font-heading mb-1">Error</p>
                      <p>{error}</p>
                    </div>
                  </div>
                </NCard>
              )}

              <div className="space-y-6">
                <div className="bg-background border-2 border-border rounded-base p-6">
                  <h2 className="font-heading text-xl mb-4">Payment Details</h2>
                  <div className="space-y-3 text-sm font-base">
                    <div className="flex items-center gap-3 text-foreground/70">
                      <Lock className="w-5 h-5 text-success" />
                      <span>Secure payment powered by Stripe</span>
                    </div>
                    <div className="flex items-center gap-3 text-foreground/70">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <span>SSL encrypted checkout</span>
                    </div>
                    <div className="flex items-center gap-3 text-foreground/70">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <span>Instant course access after payment</span>
                    </div>
                  </div>
                </div>

                <NCard className="p-5 bg-main/5">
                  <div className="text-sm text-foreground font-base">
                    <p className="font-heading mb-2">What happens next:</p>
                    <ol className="list-decimal list-inside space-y-1 text-foreground/70">
                      <li>Click "Proceed to Payment" below</li>
                      <li>Complete your payment securely with Stripe</li>
                      <li>Get instant access to the course</li>
                      <li>Start learning immediately!</li>
                    </ol>
                  </div>
                </NCard>

                <NButton
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  variant="default"
                  className="w-full"
                  size="lg"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {isProcessing ? "Redirecting to Stripe..." : `Proceed to Payment - $${course.price}`}
                </NButton>

                <p className="text-xs text-center text-foreground/60 font-base">
                  By proceeding, you agree to our terms of service and privacy policy.
                </p>
              </div>
            </NCard>
          </div>

          {/* Order Summary */}
          <div>
            <NCard className="p-6 sticky top-32">
              <h2 className="text-xl font-heading mb-6">Order Summary</h2>

              <div className="mb-6">
                <div className="w-full h-48 bg-main/10 rounded-base border-2 border-border overflow-hidden mb-4">
                  <img
                    src={course.thumbnail_url || "/placeholder.svg"}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-heading text-xl mb-1">{course.title}</h3>
                <p className="text-sm text-foreground/70 mb-3 font-base">
                  {course.educator?.full_name || "Unknown Educator"}
                </p>
                {course.subtitle && (
                  <p className="text-sm text-foreground/70 font-base">{course.subtitle}</p>
                )}
              </div>

              <div className="border-t-2 border-border pt-5 space-y-3 mb-6">
                <div className="flex justify-between text-sm font-base">
                  <span className="text-foreground/70">Course Price</span>
                  <span className="font-heading">${course.price}</span>
                </div>
                <div className="flex justify-between text-sm font-base">
                  <span className="text-foreground/70">Tax (0%)</span>
                  <span className="font-heading">$0.00</span>
                </div>
                <div className="border-t-2 border-border pt-3 flex justify-between">
                  <span className="font-heading text-lg">Total</span>
                  <span className="text-2xl font-heading text-main">${course.price}</span>
                </div>
              </div>

              <NCard className="p-5 bg-success/10 border-success/30">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-heading text-success mb-1">Secure Payment</p>
                    <p className="text-foreground/70 font-base">Your payment information is encrypted and secure.</p>
                  </div>
                </div>
              </NCard>
            </NCard>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-main border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-heading text-lg">Loading...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
