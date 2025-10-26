"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookOpen, Menu, X, LogOut, Settings, Calendar, Bell, Mail, CheckCircle2, AlertCircle } from "lucide-react"
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
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">DigiGyan</span>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            href="/learner/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/10 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            href="/learner/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-destructive/10 transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background border-b border-border">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-2xl font-bold">Settings</h1>
            <div></div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 max-w-4xl">
          <div className="space-y-8">
            {/* Google Calendar Integration */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-primary" />
                    Google Calendar Integration
                  </h2>
                  <p className="text-muted-foreground">
                    Sync your learning tasks with Google Calendar for seamless time management
                  </p>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-6 mb-6">
                {googleConnected ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-accent" />
                      <div>
                        <p className="font-semibold">Connected to Google Calendar</p>
                        <p className="text-sm text-muted-foreground">your.email@gmail.com</p>
                      </div>
                    </div>
                    <div className="bg-accent/10 rounded-lg p-4 text-sm">
                      <p className="text-accent font-medium mb-2">Sync Status: Active</p>
                      <p className="text-muted-foreground">
                        Your learning tasks are automatically synced to your Google Calendar. New tasks will appear
                        within 5 minutes.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-6 h-6 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">Not Connected</p>
                        <p className="text-sm text-muted-foreground">Connect your Google Calendar to sync tasks</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {googleConnected ? (
                  <>
                    <Button onClick={handleGoogleDisconnect} variant="outline" className="bg-transparent">
                      Disconnect
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Manage Sync Settings
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleGoogleConnect}
                    disabled={syncStatus === "syncing"}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {syncStatus === "syncing" ? "Connecting..." : "Connect Google Calendar"}
                  </Button>
                )}
              </div>

              {syncStatus === "success" && (
                <div className="mt-4 p-4 bg-accent/10 rounded-lg flex items-center gap-2 text-accent">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Successfully connected to Google Calendar!</span>
                </div>
              )}
            </Card>

            {/* Notification Settings */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Bell className="w-6 h-6 text-accent" />
                Notification Preferences
              </h2>

              <div className="space-y-6">
                {/* Task Reminders */}
                <div className="border-b border-border pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Task Reminders</h3>
                      <p className="text-sm text-muted-foreground">Get reminded about upcoming tasks and deadlines</p>
                    </div>
                    <button
                      onClick={() => setRemindersEnabled(!remindersEnabled)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        remindersEnabled ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          remindersEnabled ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {remindersEnabled && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Reminder Timing</label>
                        <select
                          value={reminderTiming}
                          onChange={(e) => setReminderTiming(e.target.value)}
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background"
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
                <div className="border-b border-border pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Email Notifications
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Receive email updates about your learning progress
                      </p>
                    </div>
                    <button
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        emailNotifications ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          emailNotifications ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {emailNotifications && (
                    <div className="space-y-3 text-sm">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span>Course completion reminders</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span>Weekly progress summary</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span>New course recommendations</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Push Notifications */}
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">Push Notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive browser notifications for important updates
                      </p>
                    </div>
                    <button
                      onClick={() => setPushNotifications(!pushNotifications)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        pushNotifications ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          pushNotifications ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Calendar Sync Details */}
            {googleConnected && (
              <Card className="p-6 bg-primary/5 border-primary/20">
                <h3 className="font-semibold text-lg mb-4">Sync Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Sync:</span>
                    <span className="font-medium">Just now</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tasks Synced:</span>
                    <span className="font-medium">12 tasks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Calendar:</span>
                    <span className="font-medium">DigiGyan Learning Tasks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sync Frequency:</span>
                    <span className="font-medium">Real-time</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Save Button */}
            <div className="flex gap-3">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Changes</Button>
              <Button variant="outline" className="bg-transparent">
                Cancel
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
