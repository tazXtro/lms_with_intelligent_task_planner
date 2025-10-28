"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { NInput } from "@/components/ui/ninput"
import { NLabel } from "@/components/ui/nlabel"
import { Brain, ArrowRight, Mail, Lock, User } from "lucide-react"
import Link from "next/link"
import { signUp, signIn } from "./actions"

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)

    // Validate password confirmation for signup
    if (isSignUp) {
      const password = formData.get('password') as string
      const confirmPassword = formData.get('confirmPassword') as string
      
      if (password !== confirmPassword) {
        setError("Passwords don't match")
        return
      }
    }

    startTransition(async () => {
      const result = isSignUp ? await signUp(formData) : await signIn(formData)
      
      if (result && 'error' in result) {
        setError(result.error)
      } else if (result && 'message' in result) {
        setSuccess(result.message)
      }
    })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 bg-main border-2 border-border rounded-base flex items-center justify-center shadow-shadow">
              <Brain className="w-7 h-7 text-main-foreground" />
            </div>
            <span className="text-3xl font-heading text-foreground">
              DigiGyan
            </span>
          </Link>
          <h1 className="text-4xl font-heading mb-3">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-foreground/70 font-base">
            {isSignUp ? "Join DigiGyan and start your learning journey" : "Sign in to continue your learning"}
          </p>
        </div>

        {/* Auth Form */}
        <div>
          <NCard className="p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-base text-red-700 text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-50 border-2 border-green-200 rounded-base text-green-700 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div>
                  <NLabel className="mb-2">Full Name</NLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-foreground/50 pointer-events-none" />
                    <NInput
                      type="text"
                      name="fullName"
                      placeholder="John Doe"
                      className="pl-10"
                      required
                      disabled={isPending}
                    />
                  </div>
                </div>
              )}

              <div>
                <NLabel className="mb-2">Email Address</NLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-foreground/50 pointer-events-none" />
                  <NInput
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              <div>
                <NLabel className="mb-2">Password</NLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-foreground/50 pointer-events-none" />
                  <NInput
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    className="pl-10"
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              {isSignUp && (
                <div>
                  <NLabel className="mb-2">Confirm Password</NLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-foreground/50 pointer-events-none" />
                    <NInput
                      type="password"
                      name="confirmPassword"
                      placeholder="••••••••"
                      className="pl-10"
                      required
                      disabled={isPending}
                    />
                  </div>
                </div>
              )}

              <NButton
                type="submit"
                variant="default"
                className="w-full"
                size="lg"
                disabled={isPending}
              >
                {isPending ? "Loading..." : isSignUp ? "Create Account" : "Sign In"} 
                {!isPending && <ArrowRight className="ml-2 w-4 h-4" />}
              </NButton>
            </form>

            <div className="mt-6 space-y-4 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-sm text-foreground/70 hover:text-foreground transition-colors font-base"
              >
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            </div>
          </NCard>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-foreground/70 mt-8 font-base">
          By continuing, you agree to our{" "}
          <a href="#" className="text-main hover:underline font-heading">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-main hover:underline font-heading">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}
