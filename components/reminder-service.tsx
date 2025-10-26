"use client"

import { useEffect, useState } from "react"

export interface ReminderConfig {
  enabled: boolean
  timing: "15m" | "1h" | "24h" | "3d"
  emailNotifications: boolean
  pushNotifications: boolean
}

export function useReminderService(config: ReminderConfig) {
  const [scheduledReminders, setScheduledReminders] = useState<Map<string, NodeJS.Timeout>>(new Map())

  useEffect(() => {
    if (!config.enabled) {
      // Clear all reminders if disabled
      scheduledReminders.forEach((timeout) => clearTimeout(timeout))
      setScheduledReminders(new Map())
    }
  }, [config.enabled])

  const scheduleReminder = (taskId: string, taskTitle: string, dueDate: Date) => {
    if (!config.enabled) return

    // Calculate reminder time based on config
    const timingMs = {
      "15m": 15 * 60 * 1000,
      "1h": 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "3d": 3 * 24 * 60 * 60 * 1000,
    }[config.timing]

    const reminderTime = new Date(dueDate.getTime() - timingMs)
    const now = new Date()
    const delayMs = reminderTime.getTime() - now.getTime()

    if (delayMs > 0) {
      const timeout = setTimeout(() => {
        sendReminder(taskTitle, config)
      }, delayMs)

      setScheduledReminders((prev) => {
        const newMap = new Map(prev)
        newMap.set(taskId, timeout)
        return newMap
      })
    }
  }

  const cancelReminder = (taskId: string) => {
    const timeout = scheduledReminders.get(taskId)
    if (timeout) {
      clearTimeout(timeout)
      setScheduledReminders((prev) => {
        const newMap = new Map(prev)
        newMap.delete(taskId)
        return newMap
      })
    }
  }

  const sendReminder = (taskTitle: string, config: ReminderConfig) => {
    // Send email notification
    if (config.emailNotifications) {
      console.log(`Email reminder: ${taskTitle}`)
      // In production, this would call an API to send email
    }

    // Send push notification
    if (config.pushNotifications && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("DigiGyan Reminder", {
          body: `Don't forget: ${taskTitle}`,
          icon: "/favicon.ico",
        })
      }
    }
  }

  return { scheduleReminder, cancelReminder }
}
