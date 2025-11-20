"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  X,
  Coffee,
  Brain,
  TrendingUp,
  Target,
  Zap,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Clock,
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"

interface PomodoroSettings {
  work_duration: number
  short_break_duration: number
  long_break_duration: number
  long_break_interval: number
  auto_start_breaks: boolean
  auto_start_pomodoros: boolean
}

interface PomodoroTimerProps {
  taskId: string
  taskTitle: string
  onClose: () => void
  compact?: boolean
  initialSettings?: PomodoroSettings | null
}

type SessionType = "work" | "short_break" | "long_break"
type TimerStatus = "idle" | "running" | "paused"

export function PomodoroTimer({
  taskId,
  taskTitle,
  onClose,
  compact = false,
  initialSettings = null,
}: PomodoroTimerProps) {
  const supabase = createClient()
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState<number | null>(
    initialSettings ? initialSettings.work_duration * 60 : null
  ) // seconds - null until settings loaded
  const [status, setStatus] = useState<TimerStatus>("idle")
  const [sessionType, setSessionType] = useState<SessionType>("work")
  const [sessionCount, setSessionCount] = useState(0)
  const [todayStats, setTodayStats] = useState({
    sessions: 0,
    focusTime: 0,
    productivity: 0,
  })
  
  // Settings
  const [settings, setSettings] = useState<PomodoroSettings | null>(initialSettings)
  const [isLoadingSettings, setIsLoadingSettings] = useState(!initialSettings)
  const [showSettings, setShowSettings] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Session tracking
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const isCompletingRef = useRef(false)

  // Load settings and stats
  useEffect(() => {
    if (!initialSettings) {
      loadSettings()
    }
    loadTodayStats()
    
    // Create audio context for soothing chime sound
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const playNotificationSound = () => {
    if (!soundEnabled || !audioContextRef.current) return
    
    try {
      const audioContext = audioContextRef.current
      const duration = 1.2
      const sampleRate = audioContext.sampleRate
      const numSamples = duration * sampleRate
      const buffer = audioContext.createBuffer(1, numSamples, sampleRate)
      const data = buffer.getChannelData(0)
      
      // Create pleasant harmonics (C major chord with reverb-like decay)
      const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5
      
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate
        let sample = 0
        
        // Add each frequency with exponential decay
        frequencies.forEach((freq, index) => {
          const envelope = Math.exp(-3 * t) * (1 - index * 0.2)
          sample += Math.sin(2 * Math.PI * freq * t) * envelope
        })
        
        // Normalize and add subtle reverb
        data[i] = sample * 0.15 * Math.exp(-2 * t)
      }
      
      const source = audioContext.createBufferSource()
      const gainNode = audioContext.createGain()
      
      source.buffer = buffer
      gainNode.gain.value = 0.5
      
      source.connect(gainNode)
      gainNode.connect(audioContext.destination)
      source.start(0)
    } catch (e) {
      console.log('Audio play failed:', e)
    }
  }

  const loadSettings = async () => {
    if (initialSettings) {
      return
    }
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Set default settings if no user
        const defaultSettings = {
          work_duration: 25,
          short_break_duration: 5,
          long_break_duration: 15,
          long_break_interval: 4,
          auto_start_breaks: false,
          auto_start_pomodoros: false,
        }
        setSettings(defaultSettings)
        setTimeLeft(defaultSettings.work_duration * 60)
        setIsLoadingSettings(false)
        return
      }

      const { data, error } = await supabase
        .from('pomodoro_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data && !error) {
        setSettings(data)
        setTimeLeft(data.work_duration * 60)
      } else if (error && error.code === 'PGRST116') {
        // No settings found, create default
        const defaultSettings = {
          work_duration: 25,
          short_break_duration: 5,
          long_break_duration: 15,
          long_break_interval: 4,
          auto_start_breaks: false,
          auto_start_pomodoros: false,
        }
        await supabase.from('pomodoro_settings').insert({
          user_id: user.id,
          ...defaultSettings,
        })
        setSettings(defaultSettings)
        setTimeLeft(defaultSettings.work_duration * 60)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      // Set default on error
      const defaultSettings = {
        work_duration: 25,
        short_break_duration: 5,
        long_break_duration: 15,
        long_break_interval: 4,
        auto_start_breaks: false,
        auto_start_pomodoros: false,
      }
      setSettings(defaultSettings)
      setTimeLeft(defaultSettings.work_duration * 60)
    } finally {
      setIsLoadingSettings(false)
    }
  }

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings)
      setTimeLeft(initialSettings.work_duration * 60)
      setIsLoadingSettings(false)
    }
  }, [initialSettings])

  const loadTodayStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('pomodoro_statistics')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      if (data) {
        setTodayStats({
          sessions: data.completed_sessions,
          focusTime: data.total_focus_time_minutes,
          productivity: data.productivity_score,
        })
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const startTimer = useCallback(async () => {
    if (!settings) return
    
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    setStatus("running")
    
    // Create session record
    if (!currentSessionId && sessionType === 'work') {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase
            .from('pomodoro_sessions')
            .insert({
              task_id: taskId,
              user_id: user.id,
              type: sessionType,
              duration_seconds: settings.work_duration * 60,
              status: 'completed', // Will update on completion
            })
            .select()
            .single()

          if (data) {
            setCurrentSessionId(data.id)
            setSessionStartTime(new Date())
          }
        }
      } catch (error) {
        console.error('Error creating session:', error)
      }
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (!prev || prev <= 1) {
          handleTimerComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [sessionType, currentSessionId, taskId, settings])

  const pauseTimer = () => {
    setStatus("paused")
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const resetTimer = () => {
    if (!settings) return
    
    setStatus("idle")
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    const duration = sessionType === 'work' 
      ? settings.work_duration 
      : sessionType === 'short_break'
      ? settings.short_break_duration
      : settings.long_break_duration
    
    setTimeLeft(duration * 60)
    setCurrentSessionId(null)
  }

  const handleTimerComplete = async () => {
    // Prevent double-calling
    if (isCompletingRef.current) return
    isCompletingRef.current = true
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setStatus("idle")

    // Play notification sound
    playNotificationSound()

    // Show browser notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Pomodoro Complete!', {
          body: sessionType === 'work' 
            ? 'Great focus session! Time for a break.' 
            : 'Break over! Ready to focus?',
          icon: '/icon.png',
        })
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission()
      }
    }

    // Update session record
    if (currentSessionId && sessionType === 'work') {
      try {
        await supabase
          .from('pomodoro_sessions')
          .update({
            end_time: new Date().toISOString(),
            status: 'completed',
          })
          .eq('id', currentSessionId)

        // Update statistics
        await updateStatistics()
        await updateGoals()
        setCurrentSessionId(null)
      } catch (error) {
        console.error('Error updating session:', error)
      }
    }

    // Auto-transition to next session
    if (!settings) {
      setTimeout(() => {
        isCompletingRef.current = false
      }, 100)
      return
    }
    
    if (sessionType === 'work') {
      const newCount = sessionCount + 1
      setSessionCount(newCount)
      
      const nextType = newCount % settings.long_break_interval === 0 
        ? 'long_break' 
        : 'short_break'
      
      setSessionType(nextType)
      const nextDuration = nextType === 'long_break' 
        ? settings.long_break_duration 
        : settings.short_break_duration
      setTimeLeft(nextDuration * 60)
      
      if (settings.auto_start_breaks) {
        // Small delay to ensure state has settled
        setTimeout(() => {
          isCompletingRef.current = false
          startTimer()
        }, 100)
      } else {
        setTimeout(() => {
          isCompletingRef.current = false
        }, 100)
      }
    } else {
      setSessionType('work')
      setTimeLeft(settings.work_duration * 60)
      
      if (settings.auto_start_pomodoros) {
        // Small delay to ensure state has settled
        setTimeout(() => {
          isCompletingRef.current = false
          startTimer()
        }, 100)
      } else {
        setTimeout(() => {
          isCompletingRef.current = false
        }, 100)
      }
    }

    loadTodayStats()
  }

  const updateStatistics = async () => {
    if (!settings) return
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date().toISOString().split('T')[0]
      const focusMinutes = Math.round(settings.work_duration)

      const { data: existing } = await supabase
        .from('pomodoro_statistics')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      if (existing) {
        await supabase
          .from('pomodoro_statistics')
          .update({
            total_sessions: existing.total_sessions + 1,
            completed_sessions: existing.completed_sessions + 1,
            total_focus_time_minutes: existing.total_focus_time_minutes + focusMinutes,
            productivity_score: Math.min(100, existing.productivity_score + 5),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('date', today)
      } else {
        await supabase.from('pomodoro_statistics').insert({
          user_id: user.id,
          date: today,
          total_sessions: 1,
          completed_sessions: 1,
          total_focus_time_minutes: focusMinutes,
          productivity_score: 10,
        })
      }
    } catch (error) {
      console.error('Error updating statistics:', error)
    }
  }

  const updateGoals = async () => {
    if (!settings) return
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: goal } = await supabase
        .from('pomodoro_goals')
        .select('*')
        .eq('user_id', user.id)
        .single()

      const today = new Date().toISOString().split('T')[0]
      const lastCompleted = goal?.last_completed_date

      let newStreak = 1
      if (lastCompleted) {
        const daysSince = Math.floor(
          (new Date(today).getTime() - new Date(lastCompleted).getTime()) / (1000 * 60 * 60 * 24)
        )
        if (daysSince === 0) {
          newStreak = goal.current_streak
        } else if (daysSince === 1) {
          newStreak = goal.current_streak + 1
        }
      }

      if (goal) {
        await supabase
          .from('pomodoro_goals')
          .update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, goal.longest_streak),
            last_completed_date: today,
            total_lifetime_sessions: goal.total_lifetime_sessions + 1,
            total_lifetime_focus_minutes: goal.total_lifetime_focus_minutes + settings.work_duration,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
      } else {
        await supabase.from('pomodoro_goals').insert({
          user_id: user.id,
          current_streak: 1,
          longest_streak: 1,
          last_completed_date: today,
          total_lifetime_sessions: 1,
          total_lifetime_focus_minutes: settings.work_duration,
        })
      }
    } catch (error) {
      console.error('Error updating goals:', error)
    }
  }

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgress = (): number => {
    if (!settings || timeLeft === null) return 0
    
    const totalSeconds = sessionType === 'work' 
      ? settings.work_duration * 60 
      : sessionType === 'short_break'
      ? settings.short_break_duration * 60
      : settings.long_break_duration * 60
    return ((totalSeconds - timeLeft) / totalSeconds) * 100
  }

  const getSessionColor = () => {
    switch (sessionType) {
      case 'work':
        return 'from-blue-500 via-cyan-500 to-teal-500'
      case 'short_break':
        return 'from-emerald-500 via-teal-500 to-cyan-500'
      case 'long_break':
        return 'from-sky-500 via-blue-500 to-indigo-500'
    }
  }

  const getSessionIcon = () => {
    switch (sessionType) {
      case 'work':
        return <Brain className="w-6 h-6" />
      case 'short_break':
        return <Coffee className="w-6 h-6" />
      case 'long_break':
        return <Zap className="w-6 h-6" />
    }
  }

  // Show loading state while settings are being fetched
  if (isLoadingSettings || !settings || timeLeft === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-base border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 flex-1">
          {getSessionIcon()}
          <span className="text-lg font-heading font-bold tabular-nums">{formatTime(timeLeft)}</span>
        </div>
        
        <div className="flex gap-1">
          {status === 'running' ? (
            <button
              onClick={pauseTimer}
              className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-base transition-colors"
            >
              <Pause className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={startTimer}
              className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-base transition-colors"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-base transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background flex items-center justify-center p-4' : ''}`}>
      <NCard className={`${isFullscreen ? 'max-w-xl w-full max-h-[90vh] overflow-y-auto' : 'w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto'}`}>
        <div className="px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getSessionColor()} flex items-center justify-center text-white shadow-lg`}>
              {getSessionIcon()}
            </div>
            <div>
              <h3 className="font-heading text-xl">
                {sessionType === 'work' ? 'Focus Time' : sessionType === 'short_break' ? 'Short Break' : 'Long Break'}
              </h3>
              <p className="text-xs text-foreground/60 font-base truncate max-w-[200px]">{taskTitle}</p>
            </div>
          </div>
          
          <div className="flex gap-1">
            {isFullscreen && (
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 hover:bg-secondary-background rounded-base transition-colors"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 hover:bg-secondary-background rounded-base transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-secondary-background rounded-base transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary-background rounded-base transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Session Type Selector */}
        <div className="flex gap-2 mb-6 p-1 bg-secondary-background/50 rounded-xl">
          <button
            onClick={() => {
              if (status === 'idle') {
                // Clear any existing interval and reset flags
                if (intervalRef.current) {
                  clearInterval(intervalRef.current)
                  intervalRef.current = null
                }
                isCompletingRef.current = false
                
                setSessionType('work')
                setTimeLeft(settings.work_duration * 60)
              }
            }}
            disabled={status !== 'idle'}
            className={`flex-1 px-3 py-3 rounded-lg transition-all text-sm font-medium flex flex-col items-center justify-center gap-1.5 ${
              sessionType === 'work'
                ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md scale-[1.02]'
                : 'hover:bg-background/50 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <Brain className="w-5 h-5" />
            <span className="text-xs">Focus</span>
            <span className="text-[10px] opacity-70">{settings.work_duration}m</span>
          </button>
          
          <button
            onClick={() => {
              if (status === 'idle') {
                // Clear any existing interval and reset flags
                if (intervalRef.current) {
                  clearInterval(intervalRef.current)
                  intervalRef.current = null
                }
                isCompletingRef.current = false
                
                setSessionType('short_break')
                setTimeLeft(settings.short_break_duration * 60)
              }
            }}
            disabled={status !== 'idle'}
            className={`flex-1 px-3 py-3 rounded-lg transition-all text-sm font-medium flex flex-col items-center justify-center gap-1.5 ${
              sessionType === 'short_break'
                ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md scale-[1.02]'
                : 'hover:bg-background/50 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <Coffee className="w-5 h-5" />
            <span className="text-xs">Short</span>
            <span className="text-[10px] opacity-70">{settings.short_break_duration}m</span>
          </button>
          
          <button
            onClick={() => {
              if (status === 'idle') {
                // Clear any existing interval and reset flags
                if (intervalRef.current) {
                  clearInterval(intervalRef.current)
                  intervalRef.current = null
                }
                isCompletingRef.current = false
                
                setSessionType('long_break')
                setTimeLeft(settings.long_break_duration * 60)
              }
            }}
            disabled={status !== 'idle'}
            className={`flex-1 px-3 py-3 rounded-lg transition-all text-sm font-medium flex flex-col items-center justify-center gap-1.5 ${
              sessionType === 'long_break'
                ? 'bg-gradient-to-br from-sky-500 to-blue-500 text-white shadow-md scale-[1.02]'
                : 'hover:bg-background/50 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <Zap className="w-5 h-5" />
            <span className="text-xs">Long</span>
            <span className="text-[10px] opacity-70">{settings.long_break_duration}m</span>
          </button>
        </div>

        {/* Timer Display */}
        <div className="relative mb-6">
          <div className={`w-56 h-56 mx-auto rounded-full bg-gradient-to-br ${getSessionColor()} p-1.5 shadow-xl`}>
            <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-heading tabular-nums mb-1">{formatTime(timeLeft)}</div>
                <div className="text-sm text-foreground/50 font-base">
                  Session {sessionCount + 1}
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Ring */}
          <svg 
            key={`progress-${sessionType}-${status}`}
            className="absolute inset-0 w-56 h-56 mx-auto -rotate-90"
          >
            <circle
              cx="112"
              cy="112"
              r="108"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-secondary-background/50"
            />
            <circle
              cx="112"
              cy="112"
              r="108"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 108}`}
              strokeDashoffset={`${2 * Math.PI * 108 * (1 - getProgress() / 100)}`}
              className={status === 'running' ? 'transition-all duration-1000 ease-linear' : ''}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className="text-blue-500" stopColor="currentColor" />
                <stop offset="100%" className="text-teal-500" stopColor="currentColor" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-6">
          {status === 'running' ? (
            <NButton onClick={pauseTimer} variant="neutral" className="flex-1 h-12 text-base">
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </NButton>
          ) : (
            <NButton onClick={startTimer} variant="noShadow" className="flex-1 h-12 text-base">
              <Play className="w-5 h-5 mr-2" />
              {status === 'paused' ? 'Resume' : 'Start'}
            </NButton>
          )}
          
          <NButton onClick={resetTimer} variant="accent" className="flex-1 h-12 text-base">
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </NButton>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/50">
          <div className="text-center p-3 rounded-lg bg-secondary-background/30">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Target className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-heading mb-1">{todayStats.sessions}</div>
            <div className="text-xs text-foreground/60 font-base">Sessions</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary-background/30">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Clock className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="text-2xl font-heading mb-1">{todayStats.focusTime}</div>
            <div className="text-xs text-foreground/60 font-base">Minutes</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary-background/30">
            <div className="flex items-center justify-center gap-1 mb-2">
              <TrendingUp className="w-4 h-4 text-teal-500" />
            </div>
            <div className="text-2xl font-heading mb-1">{todayStats.productivity}%</div>
            <div className="text-xs text-foreground/60 font-base">Score</div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
            <h4 className="font-heading text-base mb-2">Timer Settings</h4>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-foreground/70 font-base mb-1 block">Focus (min)</label>
                <input
                  type="number"
                  value={settings.work_duration}
                  onChange={(e) => setSettings({ ...settings!, work_duration: parseInt(e.target.value) || 25 })}
                  className="w-full px-2 py-1.5 border-2 border-border rounded-base text-sm"
                  min="1"
                  max="60"
                />
              </div>
              <div>
                <label className="text-xs text-foreground/70 font-base mb-1 block">Short Break (min)</label>
                <input
                  type="number"
                  value={settings.short_break_duration}
                  onChange={(e) => setSettings({ ...settings!, short_break_duration: parseInt(e.target.value) || 5 })}
                  className="w-full px-2 py-1.5 border-2 border-border rounded-base text-sm"
                  min="1"
                  max="30"
                />
              </div>
              <div>
                <label className="text-xs text-foreground/70 font-base mb-1 block">Long Break (min)</label>
                <input
                  type="number"
                  value={settings.long_break_duration}
                  onChange={(e) => setSettings({ ...settings!, long_break_duration: parseInt(e.target.value) || 15 })}
                  className="w-full px-2 py-1.5 border-2 border-border rounded-base text-sm"
                  min="1"
                  max="60"
                />
              </div>
              <div>
                <label className="text-xs text-foreground/70 font-base mb-1 block">Long Break After</label>
                <input
                  type="number"
                  value={settings.long_break_interval}
                  onChange={(e) => setSettings({ ...settings!, long_break_interval: parseInt(e.target.value) || 4 })}
                  className="w-full px-2 py-1.5 border-2 border-border rounded-base text-sm"
                  min="2"
                  max="10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.auto_start_breaks}
                  onChange={(e) => setSettings({ ...settings!, auto_start_breaks: e.target.checked })}
                  className="rounded border-2 border-border"
                />
                <span className="text-sm font-base">Auto-start breaks</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.auto_start_pomodoros}
                  onChange={(e) => setSettings({ ...settings!, auto_start_pomodoros: e.target.checked })}
                  className="rounded border-2 border-border"
                />
                <span className="text-sm font-base">Auto-start focus sessions</span>
              </label>
            </div>
            
            <NButton
              onClick={async () => {
                try {
                  const { data: { user } } = await supabase.auth.getUser()
                  if (user) {
                    await supabase
                      .from('pomodoro_settings')
                      .upsert({
                        user_id: user.id,
                        ...settings,
                        updated_at: new Date().toISOString(),
                      })
                    
                    // Apply settings to current timer
                    const duration = sessionType === 'work' 
                      ? settings.work_duration 
                      : sessionType === 'short_break'
                      ? settings.short_break_duration
                      : settings.long_break_duration
                    
                    // Only reset time if timer is idle
                    if (status === 'idle') {
                      setTimeLeft(duration * 60)
                    }
                    
                    setShowSettings(false)
                  }
                } catch (error) {
                  console.error('Error saving settings:', error)
                }
              }}
              variant="noShadow"
              size="sm"
              className="w-full"
            >
              Save Settings
            </NButton>
          </div>
        )}
        </div>
      </NCard>
    </div>
  )
}
