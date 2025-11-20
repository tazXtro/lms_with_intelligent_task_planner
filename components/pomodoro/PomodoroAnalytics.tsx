"use client"

import { useState, useEffect } from "react"
import { NCard } from "@/components/ui/ncard"
import { NButton } from "@/components/ui/nbutton"
import {
  TrendingUp,
  Target,
  Flame,
  Clock,
  Calendar,
  Award,
  BarChart3,
  Zap,
  CheckCircle2,
  X,
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"

interface Stats {
  date: string
  total_sessions: number
  completed_sessions: number
  interrupted_sessions: number
  total_focus_time_minutes: number
  total_break_time_minutes: number
  productivity_score: number
}

interface Goals {
  daily_session_goal: number
  daily_focus_time_goal_minutes: number
  current_streak: number
  longest_streak: number
  total_lifetime_sessions: number
  total_lifetime_focus_minutes: number
}

export function PomodoroAnalytics() {
  const supabase = createClient()
  
  const [stats, setStats] = useState<Stats[]>([])
  const [goals, setGoals] = useState<Goals | null>(null)
  const [todayStats, setTodayStats] = useState<Stats | null>(null)
  const [weeklyTotal, setWeeklyTotal] = useState({
    sessions: 0,
    focusTime: 0,
    avgProductivity: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showGoalsModal, setShowGoalsModal] = useState(false)
  const [editedGoals, setEditedGoals] = useState({
    dailySessionGoal: 8,
    dailyFocusTimeGoal: 200,
  })

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      // Get last 30 days of stats
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const response = await fetch(`/api/pomodoro/stats?startDate=${startDate}&endDate=${endDate}`)
      const data = await response.json()

      if (data.stats) {
        setStats(data.stats)
        
        // Get today's stats
        const today = new Date().toISOString().split('T')[0]
        const todayStat = data.stats.find((s: Stats) => s.date === today)
        setTodayStats(todayStat || null)

        // Calculate weekly totals (last 7 days)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const weekStats = data.stats.filter((s: Stats) => s.date >= weekAgo)
        
        const weeklySessionTotal = weekStats.reduce((sum: number, s: Stats) => sum + s.completed_sessions, 0)
        const weeklyFocusTotal = weekStats.reduce((sum: number, s: Stats) => sum + s.total_focus_time_minutes, 0)
        const avgProd = weekStats.length > 0 
          ? Math.round(weekStats.reduce((sum: number, s: Stats) => sum + s.productivity_score, 0) / weekStats.length)
          : 0

        setWeeklyTotal({
          sessions: weeklySessionTotal,
          focusTime: weeklyFocusTotal,
          avgProductivity: avgProd,
        })
      }

      if (data.goals) {
        setGoals(data.goals)
        setEditedGoals({
          dailySessionGoal: data.goals.daily_session_goal,
          dailyFocusTimeGoal: data.goals.daily_focus_time_goal_minutes,
        })
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveGoals = async () => {
    try {
      const response = await fetch('/api/pomodoro/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          daily_session_goal: editedGoals.dailySessionGoal,
          daily_focus_time_goal_minutes: editedGoals.dailyFocusTimeGoal,
        }),
      })

      if (response.ok) {
        await loadAnalytics()
        setShowGoalsModal(false)
      }
    } catch (error) {
      console.error('Error saving goals:', error)
    }
  }

  const formatHours = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getStreakColor = (streak: number): string => {
    if (streak >= 30) return "from-blue-600 to-cyan-600"
    if (streak >= 14) return "from-orange-500 to-red-500"
    if (streak >= 7) return "from-yellow-500 to-orange-500"
    return "from-blue-500 to-cyan-500"
  }

  const getProductivityLevel = (score: number): { label: string; color: string } => {
    if (score >= 90) return { label: "Excellent", color: "text-blue-600 dark:text-blue-400" }
    if (score >= 70) return { label: "Great", color: "text-green-600 dark:text-green-400" }
    if (score >= 50) return { label: "Good", color: "text-cyan-600 dark:text-cyan-400" }
    if (score >= 30) return { label: "Fair", color: "text-yellow-600 dark:text-yellow-400" }
    return { label: "Building", color: "text-gray-600 dark:text-gray-400" }
  }

  const todayProgress = todayStats && goals ? {
    sessions: Math.min(100, (todayStats.completed_sessions / goals.daily_session_goal) * 100),
    focusTime: Math.min(100, (todayStats.total_focus_time_minutes / goals.daily_focus_time_goal_minutes) * 100),
  } : { sessions: 0, focusTime: 0 }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-main border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid - Modern Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Current Streak */}
        <NCard className="group hover:scale-[1.02] transition-all duration-300 cursor-pointer border-4">
          <div className="px-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getStreakColor(goals?.current_streak || 0)} flex items-center justify-center shadow-md`}>
                <Flame className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-base px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-700 dark:text-orange-400">
                Current
              </span>
            </div>
            <div className="text-4xl font-heading mb-1">{goals?.current_streak || 0}</div>
            <div className="text-sm text-foreground/60 font-base">Day Streak 🔥</div>
          </div>
        </NCard>

        {/* Longest Streak */}
        <NCard className="group hover:scale-[1.02] transition-all duration-300 cursor-pointer border-4">
          <div className="px-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-md">
                <Award className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-base px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 rounded-full text-cyan-700 dark:text-cyan-400">
                Best
              </span>
            </div>
            <div className="text-4xl font-heading mb-1">{goals?.longest_streak || 0}</div>
            <div className="text-sm text-foreground/60 font-base">Longest Streak 🏆</div>
          </div>
        </NCard>

        {/* Total Sessions */}
        <NCard className="group hover:scale-[1.02] transition-all duration-300 cursor-pointer border-4">
          <div className="px-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-base px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-400">
                Lifetime
              </span>
            </div>
            <div className="text-4xl font-heading mb-1">{goals?.total_lifetime_sessions || 0}</div>
            <div className="text-sm text-foreground/60 font-base">Total Sessions 📊</div>
          </div>
        </NCard>

        {/* Total Focus Time */}
        <NCard className="group hover:scale-[1.02] transition-all duration-300 cursor-pointer border-4">
          <div className="px-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-base px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-400">
                Lifetime
              </span>
            </div>
            <div className="text-4xl font-heading mb-1">
              {Math.round((goals?.total_lifetime_focus_minutes || 0) / 60)}h
            </div>
            <div className="text-sm text-foreground/60 font-base">Focus Time ⏱️</div>
          </div>
        </NCard>
      </div>

      {/* Today's Progress */}
      <NCard className="border-4">
        <div className="px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-heading text-xl">Today's Progress</h3>
          </div>
          <div className="flex items-center gap-3">
            <NButton
              variant="neutral"
              size="sm"
              onClick={() => setShowGoalsModal(true)}
              className="border-2"
            >
              <Target className="w-4 h-4" />
              Edit Goals
            </NButton>
            {todayStats && (
              <div className={`px-3 py-1.5 rounded-full text-xs font-heading ${getProductivityLevel(todayStats.productivity_score).color} bg-current/10 border-2 border-current/20`}>
                {getProductivityLevel(todayStats.productivity_score).label}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          {/* Sessions Goal */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-base">Focus Sessions</span>
              </div>
              <span className="text-sm font-heading tabular-nums">
                {todayStats?.completed_sessions || 0} / {goals?.daily_session_goal || 8}
              </span>
            </div>
            <div className="relative w-full h-4 bg-secondary-background rounded-full overflow-hidden border-2 border-border">
              <div
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(todayProgress.sessions, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Focus Time Goal */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-base">Focus Time</span>
              </div>
              <span className="text-sm font-heading tabular-nums">
                {formatHours(todayStats?.total_focus_time_minutes || 0)} / {formatHours(goals?.daily_focus_time_goal_minutes || 200)}
              </span>
            </div>
            <div className="relative w-full h-4 bg-secondary-background rounded-full overflow-hidden border-2 border-border">
              <div
                className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(todayProgress.focusTime, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
        </div>
      </NCard>

      {/* Weekly Summary */}
      <NCard className="border-4">
        <div className="px-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-heading text-xl">Last 7 Days Summary</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="group hover:scale-[1.02] transition-all">
            <div className="text-center p-5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border-3 border-blue-300 dark:border-blue-700">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-4xl font-heading mb-2">{weeklyTotal.sessions}</div>
              <div className="text-xs text-foreground/60 font-base uppercase tracking-wide">Sessions</div>
            </div>
          </div>

          <div className="group hover:scale-[1.02] transition-all">
            <div className="text-center p-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border-3 border-emerald-300 dark:border-emerald-700">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-4xl font-heading mb-2">{formatHours(weeklyTotal.focusTime)}</div>
              <div className="text-xs text-foreground/60 font-base uppercase tracking-wide">Focus Time</div>
            </div>
          </div>

          <div className="group hover:scale-[1.02] transition-all">
            <div className="text-center p-5 rounded-xl bg-teal-50 dark:bg-teal-950/20 border-3 border-teal-300 dark:border-teal-700">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-4xl font-heading mb-2">{weeklyTotal.avgProductivity}%</div>
              <div className="text-xs text-foreground/60 font-base uppercase tracking-wide">Avg Score</div>
            </div>
          </div>
        </div>
        </div>
      </NCard>

      {/* Activity Heatmap - GitHub Style */}
      <NCard className="border-4">
        <div className="px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-heading text-xl">Activity Graph</h3>
              <p className="text-xs text-foreground/60 font-base mt-1">Your last 12 weeks of focus sessions</p>
            </div>
          </div>
        </div>

        {/* GitHub-style Heatmap */}
        <div className="space-y-4">
          <div className="grid grid-cols-[auto_1fr] gap-3">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] text-xs text-foreground/60 font-base pt-1">
              <div className="h-3.5 flex items-center">Mon</div>
              <div className="h-3.5 flex items-center">Tue</div>
              <div className="h-3.5 flex items-center">Wed</div>
              <div className="h-3.5 flex items-center">Thu</div>
              <div className="h-3.5 flex items-center">Fri</div>
              <div className="h-3.5 flex items-center">Sat</div>
              <div className="h-3.5 flex items-center">Sun</div>
            </div>

            {/* Heatmap grid */}
            <div className="grid grid-cols-12 gap-[3px]">
                {(() => {
                  const today = new Date()
                  const weeks = []
                  
                  // Calculate the start of the current week (Monday)
                  const currentDay = today.getDay()
                  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1
                  const startOfWeek = new Date(today)
                  startOfWeek.setDate(today.getDate() - daysFromMonday)
                  
                  // Generate 12 weeks of data
                  for (let weekIndex = 11; weekIndex >= 0; weekIndex--) {
                    const week = []
                    
                    // Generate 7 days (Monday to Sunday)
                    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                      const date = new Date(startOfWeek)
                      date.setDate(startOfWeek.getDate() - (weekIndex * 7) + dayIndex)
                      const dateStr = date.toISOString().split('T')[0]
                      
                      // Find stats for this date
                      const dayStat = stats.find(s => s.date === dateStr)
                      const sessions = dayStat?.completed_sessions || 0
                      const focusMinutes = dayStat?.total_focus_time_minutes || 0
                      
                      // Calculate intensity
                      const goalSessions = goals?.daily_session_goal || 8
                      const intensity = Math.min(100, (sessions / goalSessions) * 100)
                      
                      let bgColor = 'bg-gray-100 dark:bg-gray-800/40'
                      
                      if (intensity > 0) {
                        if (intensity < 25) {
                          bgColor = 'bg-emerald-200 dark:bg-emerald-500/20'
                        } else if (intensity < 50) {
                          bgColor = 'bg-emerald-400 dark:bg-emerald-500/40'
                        } else if (intensity < 75) {
                          bgColor = 'bg-emerald-500 dark:bg-emerald-500/60'
                        } else {
                          bgColor = 'bg-emerald-600 dark:bg-emerald-500/80'
                        }
                      }
                      
                      week.push({ date, dateStr, sessions, focusMinutes, bgColor })
                    }
                    
                    weeks.push(week)
                  }
                  
                  return weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="flex flex-col gap-[3px]">
                      {week.map((day, dayIdx) => (
                        <div
                          key={dayIdx}
                          className={`w-full h-3.5 rounded-sm ${day.bgColor} border border-border/50 hover:ring-2 hover:ring-emerald-500 hover:scale-105 hover:z-60 transition-all cursor-pointer group relative`}
                          title={`${day.date.toLocaleDateString()}: ${day.sessions} sessions`}
                        >
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-70">
                            <div className="bg-foreground text-background text-xs px-3 py-2 rounded-lg shadow-xl border-2 border-border whitespace-nowrap">
                              <div className="font-heading mb-1">
                                {day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                              <div className="text-[10px] text-background/80">
                                {day.sessions === 0 ? 'No sessions' : `${day.sessions} ${day.sessions === 1 ? 'session' : 'sessions'}`}
                                {day.focusMinutes > 0 && ` • ${day.focusMinutes} min`}
                              </div>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 bg-foreground border-r-2 border-b-2 border-border rotate-45"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                })()}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-border">
            <span className="text-xs text-foreground/60 font-base mr-1">Less</span>
            <div className="w-3.5 h-3.5 rounded-sm bg-gray-100 dark:bg-gray-800/40 border border-border/50"></div>
            <div className="w-3.5 h-3.5 rounded-sm bg-emerald-200 dark:bg-emerald-500/20 border border-border/50"></div>
            <div className="w-3.5 h-3.5 rounded-sm bg-emerald-400 dark:bg-emerald-500/40 border border-border/50"></div>
            <div className="w-3.5 h-3.5 rounded-sm bg-emerald-500 dark:bg-emerald-500/60 border border-border/50"></div>
            <div className="w-3.5 h-3.5 rounded-sm bg-emerald-600 dark:bg-emerald-500/80 border border-border/50"></div>
            <span className="text-xs text-foreground/60 font-base ml-1">More</span>
          </div>
        </div>
      </NCard>

      {/* Productivity Insights */}
      {todayStats && (
        <NCard className="border-4 border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/10 dark:to-cyan-950/10">
          <div className="px-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shrink-0 border-2 border-border">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-heading text-lg mb-2">💡 Daily Insight</h4>
              <p className="text-sm text-foreground/80 font-base leading-relaxed">
                {todayStats.completed_sessions === 0 && "🚀 Start your first focus session today! Even one Pomodoro makes a difference."}
                {todayStats.completed_sessions > 0 && todayStats.completed_sessions < (goals?.daily_session_goal || 8) / 2 && 
                  `⚡ Building momentum! ${todayStats.completed_sessions} session${todayStats.completed_sessions !== 1 ? 's' : ''} completed. Keep the streak alive!`}
                {todayStats.completed_sessions >= (goals?.daily_session_goal || 8) / 2 && todayStats.completed_sessions < (goals?.daily_session_goal || 8) &&
                  `🎯 Great progress! You're over halfway with ${todayStats.completed_sessions} sessions. Push through to your goal!`}
                {todayStats.completed_sessions >= (goals?.daily_session_goal || 8) &&
                  `🔥 Crushing it! You've reached your daily goal with ${todayStats.completed_sessions} sessions. You're unstoppable!`}
              </p>
            </div>
          </div>
          </div>
        </NCard>
      )}

      {/* Edit Goals Modal */}
      {showGoalsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <NCard className="w-full max-w-lg border-4 shadow-2xl">
            <div className="px-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-heading text-xl">Edit Daily Goals</h3>
                </div>
                <button
                  onClick={() => setShowGoalsModal(false)}
                  className="w-8 h-8 rounded-lg hover:bg-secondary-background flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Goals Form */}
              <div className="space-y-6">
                {/* Session Goal */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-heading mb-3">
                    <Target className="w-4 h-4 text-blue-500" />
                    Daily Session Goal
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={editedGoals.dailySessionGoal}
                    onChange={(e) => setEditedGoals(prev => ({ ...prev, dailySessionGoal: parseInt(e.target.value) || 1 }))}
                    className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background font-base text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-foreground/60 font-base mt-2">
                    Number of focus sessions you want to complete each day (1-20)
                  </p>
                </div>

                {/* Focus Time Goal */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-heading mb-3">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    Daily Focus Time Goal (minutes)
                  </label>
                  <input
                    type="number"
                    min="25"
                    max="500"
                    step="25"
                    value={editedGoals.dailyFocusTimeGoal}
                    onChange={(e) => setEditedGoals(prev => ({ ...prev, dailyFocusTimeGoal: parseInt(e.target.value) || 25 }))}
                    className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background font-base text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-xs text-foreground/60 font-base mt-2">
                    Total focus time in minutes (25-500). Approximately {Math.round(editedGoals.dailyFocusTimeGoal / 60 * 10) / 10} hours
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-3 mt-8 pt-6 border-t-2 border-border">
                <NButton
                  variant="neutral"
                  onClick={() => setShowGoalsModal(false)}
                  className="flex-1 border-2"
                >
                  Cancel
                </NButton>
                <NButton
                  onClick={saveGoals}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white border-2 border-blue-600"
                >
                  Save Goals
                </NButton>
              </div>
            </div>
          </NCard>
        </div>
      )}
    </div>
  )
}
