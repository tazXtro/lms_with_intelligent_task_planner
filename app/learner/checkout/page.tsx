"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BookOpen, ArrowLeft, Lock, CheckCircle2, AlertCircle } from "lucide-react"
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
        <div className="w-full max-w-md">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground mb-6">
              You have successfully enrolled in "{courseData.title}". Your course access is now active.
            </p>

            <div className="bg-muted/30 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-muted-foreground mb-2">Order Details</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Course:</span>
                  <span className="font-medium">{courseData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Paid:</span>
                  <span className="font-medium">${courseData.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span className="font-medium">ORD-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/learner/dashboard">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/learner/courses">
                <Button variant="outline" className="w-full bg-transparent">
                  Browse More Courses
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/learner/courses" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">DigiGyan</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="md:col-span-2">
            <Card className="p-8">
              <h1 className="text-3xl font-bold mb-8">Checkout</h1>

              {/* Payment Method Selection */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label
                    className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50"
                    style={{ borderColor: paymentMethod === "card" ? "var(--color-primary)" : "var(--color-border)" }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value as "card" | "paypal")}
                      className="w-4 h-4"
                    />
                    <span className="ml-3 font-medium">Credit/Debit Card</span>
                  </label>
                  <label
                    className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50"
                    style={{ borderColor: paymentMethod === "paypal" ? "var(--color-primary)" : "var(--color-border)" }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={paymentMethod === "paypal"}
                      onChange={(e) => setPaymentMethod(e.target.value as "card" | "paypal")}
                      className="w-4 h-4"
                    />
                    <span className="ml-3 font-medium">PayPal</span>
                  </label>
                </div>
              </div>

              {/* Card Payment Form */}
              {paymentMethod === "card" && (
                <form onSubmit={handlePayment} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <Input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="bg-background"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                    <Input
                      type="text"
                      name="cardName"
                      placeholder="John Doe"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      required
                      className="bg-background"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Card Number</label>
                    <Input
                      type="text"
                      name="cardNumber"
                      placeholder="4242 4242 4242 4242"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      maxLength={19}
                      required
                      className="bg-background"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Expiry Date</label>
                      <Input
                        type="text"
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        maxLength={5}
                        required
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">CVV</label>
                      <Input
                        type="text"
                        name="cvv"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        maxLength={3}
                        required
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      This is a demo checkout. Use test card 4242 4242 4242 4242 for testing.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base"
                  >
                    {isProcessing ? "Processing..." : `Pay $${courseData.price}`}
                  </Button>
                </form>
              )}

              {/* PayPal Payment */}
              {paymentMethod === "paypal" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <Input type="email" placeholder="you@example.com" className="bg-background" />
                  </div>
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base"
                  >
                    {isProcessing ? "Processing..." : "Pay with PayPal"}
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

              <div className="mb-6">
                <img
                  src={courseData.image || "/placeholder.svg"}
                  alt={courseData.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                <h3 className="font-semibold text-lg mb-1">{courseData.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{courseData.instructor}</p>
                <p className="text-sm text-muted-foreground">{courseData.description}</p>
              </div>

              <div className="border-t border-border pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Course Price</span>
                  <span className="font-medium">${courseData.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (0%)</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">${courseData.price}</span>
                </div>
              </div>

              <div className="bg-accent/10 rounded-lg p-4 flex items-start gap-3">
                <Lock className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-accent mb-1">Secure Payment</p>
                  <p className="text-muted-foreground">Your payment information is encrypted and secure.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
