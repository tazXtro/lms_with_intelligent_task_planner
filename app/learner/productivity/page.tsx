"use client"

import { PomodoroAnalytics } from "@/components/pomodoro/PomodoroAnalytics"
import { NButton } from "@/components/ui/nbutton"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"

export default function ProductivityPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header with Gradient */}
      <div className="relative overflow-hidden border-b-4 border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-teal-500/5"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(var(--border) / 0.1) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}></div>
        
        <div className="relative container mx-auto px-6 py-12 max-w-7xl">
          <Link href="/learner/tasks" className="inline-block mb-6">
            <NButton variant="neutral" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tasks
            </NButton>
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg border-4 border-border">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-5xl font-heading">
                  Productivity Dashboard
                </h1>
              </div>
              <p className="text-lg text-foreground/70 font-base max-w-2xl">
                Track your focus sessions, maintain streaks, and analyze your productivity patterns over time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <PomodoroAnalytics />
      </div>
    </div>
  )
}
