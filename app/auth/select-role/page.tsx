"use client"

import { useState, useTransition } from "react"
import { NButton } from "@/components/ui/nbutton"
import { Brain, BookOpen, ArrowRight } from "lucide-react"
import Link from "next/link"
import { setUserRole } from "../actions"

export default function SelectRolePage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleRoleSelection = (role: 'educator' | 'learner') => {
    setError(null)
    
    startTransition(async () => {
      const result = await setUserRole(role)
      
      if (result && 'error' in result) {
        setError(result.error)
      }
      // If successful, the action will redirect automatically
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
            Choose Your Role
          </h1>
          <p className="text-foreground/70 font-base">
            Select how you&apos;ll be using DigiGyan
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border-2 border-red-200 rounded-base text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Role Selection Cards */}
        <div className="space-y-5">
          <button
            onClick={() => handleRoleSelection("educator")}
            disabled={isPending}
            className="w-full p-6 border-2 border-border rounded-base bg-secondary-background shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-main border-2 border-border rounded-base flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-main-foreground" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-heading text-xl mb-1">I&apos;m an Educator</h3>
                <p className="text-sm text-foreground/70">Create and sell courses, track student progress</p>
              </div>
              <ArrowRight className="w-5 h-5 text-foreground/50 group-hover:text-foreground transition-colors" />
            </div>
          </button>

          <button
            onClick={() => handleRoleSelection("learner")}
            disabled={isPending}
            className="w-full p-6 border-2 border-border rounded-base bg-secondary-background shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-accent border-2 border-border rounded-base flex items-center justify-center">
                <Brain className="w-7 h-7 text-main-foreground" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-heading text-xl mb-1">I&apos;m a Learner</h3>
                <p className="text-sm text-foreground/70">Enroll in courses, manage learning tasks with AI</p>
              </div>
              <ArrowRight className="w-5 h-5 text-foreground/50 group-hover:text-foreground transition-colors" />
            </div>
          </button>
        </div>

        {isPending && (
          <p className="text-center mt-6 text-foreground/70 font-base">
            Setting up your account...
          </p>
        )}
      </div>
    </div>
  )
}

