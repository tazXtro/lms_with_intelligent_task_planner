"use client"

import { useState } from "react"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { BookOpen, Menu, X, LogOut, Settings, Calendar, Bell, Mail, CheckCircle2, AlertCircle, Brain } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [googleConnected, setGoogleConnected] = useState(false)
  const [remindersEnabled, setRemindersEnabled] = useState(true)
  const [reminderTiming, setReminderTiming] = useState("24h")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")

  const handleGoogleConnect = async () => {
    setSyncStatus("syncing")
    // Simulate Google OAuth connection
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setGoogleConnected(true)
    setSyncStatus("success")
    setTimeout(() => setSyncStatus("idle"), 3000)
  }

  const handleGoogleDisconnect = () => {
    setGoogleConnected(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-secondary-background border-r-4 border-border transform transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b-2 border-border">
          <Link href="/" className="flex items-center gap-3 hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 bg-main border-2 border-border rounded-base flex items-center justify-center shadow-shadow">
              <Brain className="w-6 h-6 text-main-foreground" />
            </div>
            <span className="font-heading text-xl">DigiGyan</span>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            href="/learner/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-base text-foreground hover:bg-main/5 transition-colors font-base"
          >
            <BookOpen className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            href="/learner/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-base bg-main/10 border-2 border-border text-foreground font-heading"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t-2 border-border space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-base text-foreground hover:bg-destructive/10 transition-colors font-base">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background border-b-4 border-border">
          <div className="px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-main/10 rounded-base transition-colors border-2 border-border"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="text-3xl font-heading">Settings</h1>
            </div>
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

              <NCard className="p-6 mb-6 bg-main/5 border-main/20">
                {googleConnected ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-success border-2 border-border rounded-base flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-main-foreground" />
                      </div>
                      <div>
                        <p className="font-heading text-lg">Connected to Google Calendar</p>
                        <p className="text-sm text-foreground/70 font-base">your.email@gmail.com</p>
                      </div>
                    </div>
                    <NCard className="p-5 bg-success/10 border-success/30">
                      <p className="text-success font-heading mb-2">Sync Status: Active</p>
                      <p className="text-foreground/70 font-base text-sm">
                        Your learning tasks are automatically synced to your Google Calendar. New tasks will appear
                        within 5 minutes.
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

              <div className="flex gap-3">
                {googleConnected ? (
                  <>
                    <NButton onClick={handleGoogleDisconnect} variant="neutral">
                      Disconnect
                    </NButton>
                    <NButton variant="default">
                      Manage Sync Settings
                    </NButton>
                  </>
                ) : (
                  <NButton
                    onClick={handleGoogleConnect}
                    disabled={syncStatus === "syncing"}
                    variant="default"
                    size="lg"
                  >
                    {syncStatus === "syncing" ? "Connecting..." : "Connect Google Calendar"}
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
            </NCard>

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
                      className={`relative inline-flex h-10 w-16 items-center rounded-base border-2 border-border transition-all ${
                        remindersEnabled ? "bg-main" : "bg-foreground/10"
                      }`}
                    >
                      <span
                        className={`inline-block h-7 w-7 transform rounded-base bg-secondary-background border-2 border-border transition-transform ${
                          remindersEnabled ? "translate-x-7" : "translate-x-1"
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
                      className={`relative inline-flex h-10 w-16 items-center rounded-base border-2 border-border transition-all ${
                        emailNotifications ? "bg-main" : "bg-foreground/10"
                      }`}
                    >
                      <span
                        className={`inline-block h-7 w-7 transform rounded-base bg-secondary-background border-2 border-border transition-transform ${
                          emailNotifications ? "translate-x-7" : "translate-x-1"
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
                      className={`relative inline-flex h-10 w-16 items-center rounded-base border-2 border-border transition-all ${
                        pushNotifications ? "bg-main" : "bg-foreground/10"
                      }`}
                    >
                      <span
                        className={`inline-block h-7 w-7 transform rounded-base bg-secondary-background border-2 border-border transition-transform ${
                          pushNotifications ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </NCard>

            {/* Calendar Sync Details */}
            {googleConnected && (
              <NCard className="p-8 bg-main/5 border-main/20">
                <h3 className="font-heading text-xl mb-5">Sync Details</h3>
                <div className="space-y-4 text-sm font-base">
                  <div className="flex justify-between p-3 border-b-2 border-border">
                    <span className="text-foreground/70">Last Sync:</span>
                    <span className="font-heading">Just now</span>
                  </div>
                  <div className="flex justify-between p-3 border-b-2 border-border">
                    <span className="text-foreground/70">Tasks Synced:</span>
                    <span className="font-heading">12 tasks</span>
                  </div>
                  <div className="flex justify-between p-3 border-b-2 border-border">
                    <span className="text-foreground/70">Calendar:</span>
                    <span className="font-heading">DigiGyan Learning Tasks</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-foreground/70">Sync Frequency:</span>
                    <span className="font-heading">Real-time</span>
                  </div>
                </div>
              </NCard>
            )}

            {/* Save Button */}
            <div className="flex gap-3">
              <NButton variant="default" size="lg">Save Changes</NButton>
              <NButton variant="neutral" size="lg">
                Cancel
              </NButton>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
