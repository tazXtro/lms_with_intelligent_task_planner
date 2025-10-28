"use client"

import type React from "react"

import { useState } from "react"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { NInput } from "@/components/ui/ninput"
import { NLabel } from "@/components/ui/nlabel"
import { BookOpen, ArrowLeft, Lock, CheckCircle2, AlertCircle, Brain } from "lucide-react"
import Link from "next/link"

interface CourseCheckout {
  id: string
  title: string
  instructor: string
  price: number
  image: string
  description: string
}

const courseData: CourseCheckout = {
  id: "1",
  title: "Mobile App Development",
  instructor: "Alex Kumar",
  price: 49.99,
  image: "/mobile-development.jpg",
  description: "Learn to build native mobile apps for iOS and Android",
}

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setPaymentSuccess(true)
    setIsProcessing(false)
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <NCard className="p-10 text-center">
            <div className="w-20 h-20 bg-success border-4 border-border rounded-base flex items-center justify-center mx-auto mb-6 shadow-shadow">
              <CheckCircle2 className="w-10 h-10 text-main-foreground" />
            </div>
            <h1 className="text-4xl font-heading mb-3">Payment Successful!</h1>
            <p className="text-foreground/70 mb-8 font-base text-lg">
              You have successfully enrolled in "{courseData.title}". Your course access is now active.
            </p>

            <NCard className="p-6 mb-8 bg-main/5 text-left">
              <p className="text-sm text-foreground/70 mb-4 font-heading">Order Details</p>
              <div className="space-y-3 text-sm font-base">
                <div className="flex justify-between pb-3 border-b-2 border-border">
                  <span className="text-foreground/70">Course:</span>
                  <span className="font-heading">{courseData.title}</span>
                </div>
                <div className="flex justify-between pb-3 border-b-2 border-border">
                  <span className="text-foreground/70">Amount Paid:</span>
                  <span className="font-heading">${courseData.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Order ID:</span>
                  <span className="font-heading">ORD-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </div>
              </div>
            </NCard>

            <div className="space-y-3">
              <Link href="/learner/dashboard" className="block">
                <NButton className="w-full" variant="default" size="lg">
                  Go to Dashboard
                </NButton>
              </Link>
              <Link href="/learner/courses" className="block">
                <NButton variant="neutral" className="w-full" size="lg">
                  Browse More Courses
                </NButton>
              </Link>
            </div>
          </NCard>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-4 border-border bg-background sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center gap-4">
          <Link href="/learner/courses">
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
              <h1 className="text-4xl font-heading mb-8">Checkout</h1>

              {/* Payment Method Selection */}
              <div className="mb-8">
                <h2 className="text-xl font-heading mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label
                    className={`flex items-center p-4 border-2 rounded-base cursor-pointer transition-all ${
                      paymentMethod === "card" 
                        ? "border-main bg-main/5 shadow-shadow" 
                        : "border-border hover:translate-x-1 hover:translate-y-1"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value as "card" | "paypal")}
                      className="w-5 h-5"
                    />
                    <span className="ml-3 font-heading">Credit/Debit Card</span>
                  </label>
                  <label
                    className={`flex items-center p-4 border-2 rounded-base cursor-pointer transition-all ${
                      paymentMethod === "paypal" 
                        ? "border-main bg-main/5 shadow-shadow" 
                        : "border-border hover:translate-x-1 hover:translate-y-1"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={paymentMethod === "paypal"}
                      onChange={(e) => setPaymentMethod(e.target.value as "card" | "paypal")}
                      className="w-5 h-5"
                    />
                    <span className="ml-3 font-heading">PayPal</span>
                  </label>
                </div>
              </div>

              {/* Card Payment Form */}
              {paymentMethod === "card" && (
                <form onSubmit={handlePayment} className="space-y-5">
                  <div>
                    <NLabel className="mb-2">Email Address</NLabel>
                    <NInput
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <NLabel className="mb-2">Cardholder Name</NLabel>
                    <NInput
                      type="text"
                      name="cardName"
                      placeholder="John Doe"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <NLabel className="mb-2">Card Number</NLabel>
                    <NInput
                      type="text"
                      name="cardNumber"
                      placeholder="4242 4242 4242 4242"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <NLabel className="mb-2">Expiry Date</NLabel>
                      <NInput
                        type="text"
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <NLabel className="mb-2">CVV</NLabel>
                      <NInput
                        type="text"
                        name="cvv"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>

                  <NCard className="p-5 bg-accent/10 border-accent/30">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground font-base">
                        This is a demo checkout. Use test card 4242 4242 4242 4242 for testing.
                      </p>
                    </div>
                  </NCard>

                  <NButton
                    type="submit"
                    disabled={isProcessing}
                    variant="default"
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? "Processing..." : `Pay $${courseData.price}`}
                  </NButton>
                </form>
              )}

              {/* PayPal Payment */}
              {paymentMethod === "paypal" && (
                <div className="space-y-5">
                  <div>
                    <NLabel className="mb-2">Email Address</NLabel>
                    <NInput type="email" placeholder="you@example.com" />
                  </div>
                  <NButton
                    onClick={handlePayment}
                    disabled={isProcessing}
                    variant="accent"
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? "Processing..." : "Pay with PayPal"}
                  </NButton>
                </div>
              )}
            </NCard>
          </div>

          {/* Order Summary */}
          <div>
            <NCard className="p-6 sticky top-32">
              <h2 className="text-xl font-heading mb-6">Order Summary</h2>

              <div className="mb-6">
                <div className="w-full h-48 bg-main/10 rounded-base border-2 border-border overflow-hidden mb-4">
                  <img
                    src={courseData.image || "/placeholder.svg"}
                    alt={courseData.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-heading text-xl mb-1">{courseData.title}</h3>
                <p className="text-sm text-foreground/70 mb-3 font-base">{courseData.instructor}</p>
                <p className="text-sm text-foreground/70 font-base">{courseData.description}</p>
              </div>

              <div className="border-t-2 border-border pt-5 space-y-3 mb-6">
                <div className="flex justify-between text-sm font-base">
                  <span className="text-foreground/70">Course Price</span>
                  <span className="font-heading">${courseData.price}</span>
                </div>
                <div className="flex justify-between text-sm font-base">
                  <span className="text-foreground/70">Tax (0%)</span>
                  <span className="font-heading">$0.00</span>
                </div>
                <div className="border-t-2 border-border pt-3 flex justify-between">
                  <span className="font-heading text-lg">Total</span>
                  <span className="text-2xl font-heading text-main">${courseData.price}</span>
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
