"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { NInput } from "@/components/ui/ninput"
import { NLabel } from "@/components/ui/nlabel"
import { Brain, ArrowRight, Mail, Lock, User } from "lucide-react"
import Link from "next/link"
import { signUp, signIn, signInWithGoogle } from "./actions"
import Image from "next/image"

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
        setError(result.error ?? null)
      } else if (result && 'message' in result) {
        setSuccess(result.message ?? null)
      }
    })
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setSuccess(null)
    
    startTransition(async () => {
      const result = await signInWithGoogle()
      if (result && 'error' in result) {
        setError(result.error)
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

            <div className="mt-6 space-y-4">
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-foreground/70 font-base">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <NButton
                type="button"
                variant="noShadow"
                className="w-full bg-white hover:bg-gray-50"
                size="lg"
                onClick={handleGoogleSignIn}
                disabled={isPending}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isPending ? "Loading..." : `${isSignUp ? "Sign up" : "Sign in"} with Google`}
              </NButton>

              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-sm text-foreground/70 hover:text-foreground transition-colors font-base text-center"
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
