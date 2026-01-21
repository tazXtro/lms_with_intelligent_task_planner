"use client"

import { useState, useEffect } from "react"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { Calendar, Bell, Mail, CheckCircle2, AlertCircle, Loader2, GraduationCap } from "lucide-react"
import { LearnerLayout } from "@/components/learner-layout"

export default function SettingsPage() {
  const [googleConnected, setGoogleConnected] = useState(false)
  const [remindersEnabled, setRemindersEnabled] = useState(true)
  const [reminderTiming, setReminderTiming] = useState("24h")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")
  const [calendarSettings, setCalendarSettings] = useState<any>(null)
  const [syncedTasksCount, setSyncedTasksCount] = useState(0)
  const [userEmail, setUserEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  // Canvas integration state
  const [canvasConnected, setCanvasConnected] = useState(false)
  const [canvasUrl, setCanvasUrl] = useState("https://canvas.instructure.com")
  const [canvasToken, setCanvasToken] = useState("")
  const [canvasLoading, setCanvasLoading] = useState(false)
  const [canvasError, setCanvasError] = useState("")
  const [canvasStats, setCanvasStats] = useState({ courses: 0, assignments: 0, announcements: 0 })
  const [canvasSettings, setCanvasSettings] = useState<any>(null)
  const [showCanvasForm, setShowCanvasForm] = useState(false)

  // Fetch calendar settings on mount
  useEffect(() => {
    fetchCalendarSettings()
    fetchUserEmail()
    fetchCanvasSettings()
    fetchNotificationPreferences()
  }, [])

  const fetchUserEmail = async () => {
    try {
      const response = await fetch('/api/auth/user')
      if (response.ok) {
        const data = await response.json()
        setUserEmail(data.user?.email || "")
      }
    } catch (error) {
      console.error('Error fetching user email:', error)
    }
  }

  const fetchNotificationPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences')
      if (response.ok) {
        const data = await response.json()
        if (data.preferences) {
          setRemindersEnabled(data.preferences.reminders_enabled)
          setReminderTiming(data.preferences.reminder_timing)
          setEmailNotifications(data.preferences.email_notifications)
          setPushNotifications(data.preferences.push_notifications)
        }
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error)
    }
  }

  const saveNotificationPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reminders_enabled: remindersEnabled,
          reminder_timing: reminderTiming,
          email_notifications: emailNotifications,
          push_notifications: pushNotifications,
        }),
      })

      if (response.ok) {
        alert('✅ Notification preferences saved successfully!')
      } else {
        throw new Error('Failed to save preferences')
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error)
      alert('❌ Failed to save preferences. Please try again.')
    }
  }

  const fetchCalendarSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/calendar/connect')

      if (response.ok) {
        const data = await response.json()
        setCalendarSettings(data.settings)
        setSyncedTasksCount(data.syncedTasksCount)
        setGoogleConnected(data.settings?.is_connected || false)
      }
    } catch (error) {
      console.error('Error fetching calendar settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleConnect = async () => {
    setSyncStatus("syncing")
    setErrorMessage("")

    try {
      const response = await fetch('/api/calendar/connect', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect')
      }

      setGoogleConnected(true)
      setSyncStatus("success")

      // Fetch updated settings
      await fetchCalendarSettings()

      // Auto-sync tasks after connecting
      await handleSyncTasks()

      setTimeout(() => setSyncStatus("idle"), 3000)
    } catch (error: any) {
      console.error('Error connecting Google Calendar:', error)
      setSyncStatus("error")
      setErrorMessage(error.message || "Failed to connect. Please try again.")
      setTimeout(() => setSyncStatus("idle"), 3000)
    }
  }

  const handleGoogleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Google Calendar? This will remove all synced events.')) {
      return
    }

    try {
      const response = await fetch('/api/calendar/connect', {
        method: 'DELETE',
      })

      if (response.ok) {
        setGoogleConnected(false)
        setCalendarSettings(null)
        setSyncedTasksCount(0)
      }
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error)
      alert('Failed to disconnect. Please try again.')
    }
  }

  const handleSyncTasks = async () => {
    try {
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync tasks')
      }

      // Refresh settings to get updated sync count
      await fetchCalendarSettings()

      if (data.errors && data.errors.length > 0) {
        console.warn('Some tasks failed to sync:', data.errors)
      }
    } catch (error: any) {
      console.error('Error syncing tasks:', error)
      throw error
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Canvas functions
  const fetchCanvasSettings = async () => {
    try {
      const response = await fetch('/api/canvas/connect')

      if (response.ok) {
        const data = await response.json()
        setCanvasConnected(data.connected)
        setCanvasSettings(data.settings)
        setCanvasStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching Canvas settings:', error)
    }
  }

  const handleCanvasConnect = async () => {
    if (!canvasUrl || !canvasToken) {
      setCanvasError('Please provide both Canvas URL and access token')
      return
    }

    setCanvasLoading(true)
    setCanvasError("")

    try {
      const response = await fetch('/api/canvas/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvasUrl, accessToken: canvasToken }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect')
      }

      setCanvasConnected(true)
      setShowCanvasForm(false)
      setCanvasToken("")

      // Fetch updated settings
      await fetchCanvasSettings()

      // Auto-sync Canvas data after connecting
      await handleCanvasSync()

      alert('✅ Successfully connected to Canvas!')
    } catch (error: any) {
      console.error('Error connecting Canvas:', error)
      setCanvasError(error.message || "Failed to connect. Please check your URL and token.")
    } finally {
      setCanvasLoading(false)
    }
  }

  const handleCanvasDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Canvas? This will remove all synced data.')) {
      return
    }

    try {
      const response = await fetch('/api/canvas/connect', {
        method: 'DELETE',
      })

      if (response.ok) {
        setCanvasConnected(false)
        setCanvasSettings(null)
        setCanvasStats({ courses: 0, assignments: 0, announcements: 0 })
        alert('✅ Canvas disconnected successfully')
      }
    } catch (error) {
      console.error('Error disconnecting Canvas:', error)
      alert('❌ Failed to disconnect. Please try again.')
    }
  }

  const handleCanvasSync = async () => {
    setCanvasLoading(true)
    setCanvasError("")

    try {
      const response = await fetch('/api/canvas/sync', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync')
      }

      // Fetch updated settings
      await fetchCanvasSettings()

      alert(`✅ Canvas data synced successfully!\n\nCourses: ${data.results.courses}\nAssignments: ${data.results.assignments}\nAnnouncements: ${data.results.announcements}\nGrades: ${data.results.grades}`)
    } catch (error: any) {
      console.error('Error syncing Canvas:', error)
      setCanvasError(error.message || "Failed to sync. Please try again.")
    } finally {
      setCanvasLoading(false)
    }
  }

  return (
    <LearnerLayout>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background border-b-4 border-border">
        <div className="px-6 py-5">
          <h1 className="text-3xl font-heading">Settings</h1>
        </div>
      </header>

      {/* Content */}
      <main className="p-6 max-w-4xl">
        <div className="space-y-8">
          {/* Google Calendar Integration */}
          <NCard className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-heading mb-3 flex items-center gap-3">
                  <div className="w-12 h-12 bg-main border-2 border-border rounded-base flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-main-foreground" />
                  </div>
                  Google Calendar Integration
                </h2>
                <p className="text-foreground/70 font-base text-lg">
                  Sync your learning tasks with Google Calendar for seamless time management
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-main" />
              </div>
            ) : (
              <>
                <NCard className="p-6 mb-6 bg-main/5 border-main/20">
                  {googleConnected ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-success border-2 border-border rounded-base flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-main-foreground" />
                        </div>
                        <div>
                          <p className="font-heading text-lg">Connected to Google Calendar</p>
                          <p className="text-sm text-foreground/70 font-base">{userEmail}</p>
                        </div>
                      </div>
                      <NCard className="p-5 bg-success/10 border-success/30">
                        <p className="text-success font-heading mb-2">Sync Status: Active</p>
                        <p className="text-foreground/70 font-base text-sm">
                          Your learning tasks are automatically synced to your Google Calendar. New tasks will sync immediately.
                        </p>
                      </NCard>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-foreground/10 border-2 border-border rounded-base flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-foreground" />
                        </div>
                        <div>
                          <p className="font-heading text-lg">Not Connected</p>
                          <p className="text-sm text-foreground/70 font-base">Connect your Google Calendar to sync tasks</p>
                        </div>
                      </div>
                    </div>
                  )}
                </NCard>

                {errorMessage && (
                  <NCard className="mb-5 p-5 bg-destructive/10 border-destructive/30">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm font-base">{errorMessage}</span>
                    </div>
                  </NCard>
                )}

                <div className="flex gap-3">
                  {googleConnected ? (
                    <>
                      <NButton onClick={handleGoogleDisconnect} variant="neutral">
                        Disconnect
                      </NButton>
                      <NButton
                        onClick={async () => {
                          try {
                            await handleSyncTasks()
                            alert('✅ Tasks synced successfully!')
                          } catch (error) {
                            alert('❌ Failed to sync tasks. Please try again.')
                          }
                        }}
                        variant="default"
                      >
                        Sync Now
                      </NButton>
                    </>
                  ) : (
                    <NButton
                      onClick={handleGoogleConnect}
                      disabled={syncStatus === "syncing"}
                      variant="default"
                      size="lg"
                    >
                      {syncStatus === "syncing" ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        "Connect Google Calendar"
                      )}
                    </NButton>
                  )}
                </div>

                {syncStatus === "success" && (
                  <NCard className="mt-5 p-5 bg-success/10 border-success/30">
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-heading">Successfully connected to Google Calendar!</span>
                    </div>
                  </NCard>
                )}
              </>
            )}
          </NCard>

          {/* Calendar Sync Details */}
          {googleConnected && calendarSettings && (
            <NCard className="p-8 bg-main/5 border-main/20">
              <h3 className="font-heading text-xl mb-5">Sync Details</h3>
              <div className="space-y-4 text-sm font-base">
                <div className="flex justify-between p-3 border-b-2 border-border">
                  <span className="text-foreground/70">Last Sync:</span>
                  <span className="font-heading">{formatDate(calendarSettings.last_sync_at)}</span>
                </div>
                <div className="flex justify-between p-3 border-b-2 border-border">
                  <span className="text-foreground/70">Tasks Synced:</span>
                  <span className="font-heading">{syncedTasksCount} tasks</span>
                </div>
                <div className="flex justify-between p-3 border-b-2 border-border">
                  <span className="text-foreground/70">Calendar:</span>
                  <span className="font-heading">{calendarSettings.calendar_name || 'DigiGyan Learning Tasks'}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-foreground/70">Sync Frequency:</span>
                  <span className="font-heading">Real-time</span>
                </div>
              </div>
            </NCard>
          )}

          {/* Canvas LMS Integration */}
          <NCard className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-heading mb-3 flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent border-2 border-border rounded-base flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-main-foreground" />
                  </div>
                  Canvas LMS Integration
                </h2>
                <p className="text-foreground/70 font-base text-lg">
                  Connect your Canvas account to sync courses, assignments, and announcements
                </p>
              </div>
            </div>

            <NCard className="p-6 mb-6 bg-accent/5 border-accent/20">
              {canvasConnected ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-success border-2 border-border rounded-base flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-main-foreground" />
                    </div>
                    <div>
                      <p className="font-heading text-lg">Connected to Canvas</p>
                      <p className="text-sm text-foreground/70 font-base">{canvasSettings?.canvas_url}</p>
                    </div>
                  </div>
                  <NCard className="p-5 bg-success/10 border-success/30">
                    <p className="text-success font-heading mb-2">Sync Status: Active</p>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center">
                        <p className="text-2xl font-heading text-foreground">{canvasStats.courses}</p>
                        <p className="text-sm text-foreground/70 font-base">Courses</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-heading text-foreground">{canvasStats.assignments}</p>
                        <p className="text-sm text-foreground/70 font-base">Assignments</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-heading text-foreground">{canvasStats.announcements}</p>
                        <p className="text-sm text-foreground/70 font-base">Announcements</p>
                      </div>
                    </div>
                  </NCard>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-foreground/10 border-2 border-border rounded-base flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <p className="font-heading text-lg">Not Connected</p>
                      <p className="text-sm text-foreground/70 font-base">Connect your Canvas account to get started</p>
                    </div>
                  </div>
                </div>
              )}
            </NCard>

            {canvasError && (
              <NCard className="mb-5 p-5 bg-destructive/10 border-destructive/30">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-base">{canvasError}</span>
                </div>
              </NCard>
            )}

            {!canvasConnected && showCanvasForm && (
              <NCard className="p-6 mb-6 bg-main/5 border-main/20">
                <h3 className="font-heading text-xl mb-4">Connect to Canvas</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-heading mb-2">Canvas URL</label>
                    <input
                      type="url"
                      value={canvasUrl}
                      onChange={(e) => setCanvasUrl(e.target.value)}
                      placeholder="https://canvas.instructure.com"
                      className="w-full px-4 py-3 rounded-base border-2 border-border bg-background font-base"
                    />
                    <p className="text-xs text-foreground/60 mt-1 font-base">
                      Your Canvas institution URL (e.g., https://yourschool.instructure.com)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-heading mb-2">Access Token</label>
                    <input
                      type="password"
                      value={canvasToken}
                      onChange={(e) => setCanvasToken(e.target.value)}
                      placeholder="Enter your Canvas access token"
                      className="w-full px-4 py-3 rounded-base border-2 border-border bg-background font-base"
                    />
                    <p className="text-xs text-foreground/60 mt-1 font-base">
                      Generate a token from Canvas Settings → Approved Integrations → New Access Token
                    </p>
                  </div>
                </div>
              </NCard>
            )}

            <div className="flex gap-3">
              {canvasConnected ? (
                <>
                  <NButton onClick={handleCanvasDisconnect} variant="neutral">
                    Disconnect
                  </NButton>
                  <NButton
                    onClick={handleCanvasSync}
                    disabled={canvasLoading}
                    variant="default"
                  >
                    {canvasLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      "Sync Now"
                    )}
                  </NButton>
                </>
              ) : (
                <>
                  {showCanvasForm ? (
                    <>
                      <NButton
                        onClick={handleCanvasConnect}
                        disabled={canvasLoading}
                        variant="default"
                      >
                        {canvasLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          "Connect"
                        )}
                      </NButton>
                      <NButton onClick={() => setShowCanvasForm(false)} variant="neutral">
                        Cancel
                      </NButton>
                    </>
                  ) : (
                    <NButton onClick={() => setShowCanvasForm(true)} variant="default" size="lg">
                      Connect Canvas
                    </NButton>
                  )}
                </>
              )}
            </div>
          </NCard>

          {/* Canvas Sync Details */}
          {canvasConnected && canvasSettings && (
            <NCard className="p-8 bg-accent/5 border-accent/20">
              <h3 className="font-heading text-xl mb-5">Canvas Sync Details</h3>
              <div className="space-y-4 text-sm font-base">
                <div className="flex justify-between p-3 border-b-2 border-border">
                  <span className="text-foreground/70">Last Sync:</span>
                  <span className="font-heading">{formatDate(canvasSettings.last_sync_at)}</span>
                </div>
                <div className="flex justify-between p-3 border-b-2 border-border">
                  <span className="text-foreground/70">Canvas URL:</span>
                  <span className="font-heading">{canvasSettings.canvas_url}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-foreground/70">Sync Status:</span>
                  <span className="font-heading text-success">Active</span>
                </div>
              </div>
            </NCard>
          )}

          {/* Notification Settings */}
          <NCard className="p-8">
            <h2 className="text-3xl font-heading mb-8 flex items-center gap-3">
              <div className="w-12 h-12 bg-accent border-2 border-border rounded-base flex items-center justify-center">
                <Bell className="w-6 h-6 text-main-foreground" />
              </div>
              Notification Preferences
            </h2>

            <div className="space-y-8">
              {/* Task Reminders */}
              <div className="border-b-2 border-border pb-8">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-heading text-xl mb-1">Task Reminders</h3>
                    <p className="text-sm text-foreground/70 font-base">Get reminded about upcoming tasks and deadlines</p>
                  </div>
                  <button
                    onClick={() => setRemindersEnabled(!remindersEnabled)}
                    className={`relative inline-flex h-10 w-16 items-center rounded-base border-2 border-border transition-all ${remindersEnabled ? "bg-main" : "bg-foreground/10"
                      }`}
                  >
                    <span
                      className={`inline-block h-7 w-7 transform rounded-base bg-secondary-background border-2 border-border transition-transform ${remindersEnabled ? "translate-x-7" : "translate-x-1"
                        }`}
                    />
                  </button>
                </div>

                {remindersEnabled && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-heading mb-2">Reminder Timing</label>
                      <select
                        value={reminderTiming}
                        onChange={(e) => setReminderTiming(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-border rounded-base bg-secondary-background font-base text-foreground focus:outline-hidden focus:ring-2 focus:ring-black focus:ring-offset-2"
                      >
                        <option value="15m">15 minutes before</option>
                        <option value="1h">1 hour before</option>
                        <option value="24h">1 day before</option>
                        <option value="3d">3 days before</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Email Notifications */}
              <div className="border-b-2 border-border pb-8">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-heading text-xl mb-1 flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Email Notifications
                    </h3>
                    <p className="text-sm text-foreground/70 font-base">
                      Receive email updates about your learning progress
                    </p>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative inline-flex h-10 w-16 items-center rounded-base border-2 border-border transition-all ${emailNotifications ? "bg-main" : "bg-foreground/10"
                      }`}
                  >
                    <span
                      className={`inline-block h-7 w-7 transform rounded-base bg-secondary-background border-2 border-border transition-transform ${emailNotifications ? "translate-x-7" : "translate-x-1"
                        }`}
                    />
                  </button>
                </div>

                {emailNotifications && (
                  <div className="space-y-3 text-sm">
                    <label className="flex items-center gap-3 p-3 rounded-base hover:bg-main/5 transition-colors cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded w-5 h-5" />
                      <span className="font-base">Course completion reminders</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-base hover:bg-main/5 transition-colors cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded w-5 h-5" />
                      <span className="font-base">Weekly progress summary</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-base hover:bg-main/5 transition-colors cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded w-5 h-5" />
                      <span className="font-base">New course recommendations</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Push Notifications */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading text-xl mb-1">Push Notifications</h3>
                    <p className="text-sm text-foreground/70 font-base">
                      Receive browser notifications for important updates
                    </p>
                  </div>
                  <button
                    onClick={() => setPushNotifications(!pushNotifications)}
                    className={`relative inline-flex h-10 w-16 items-center rounded-base border-2 border-border transition-all ${pushNotifications ? "bg-main" : "bg-foreground/10"
                      }`}
                  >
                    <span
                      className={`inline-block h-7 w-7 transform rounded-base bg-secondary-background border-2 border-border transition-transform ${pushNotifications ? "translate-x-7" : "translate-x-1"
                        }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </NCard>

          {/* Save Button */}
          <div className="flex gap-3">
            <NButton onClick={saveNotificationPreferences} variant="default" size="lg">
              Save Changes
            </NButton>
            <NButton onClick={fetchNotificationPreferences} variant="neutral" size="lg">
              Cancel
            </NButton>
          </div>
        </div>
      </main>
    </LearnerLayout>
  )
}
