"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

export interface CalendarEvent {
  id: string
  title: string
  description: string
  startTime: Date
  endTime: Date
  taskId: string
  synced: boolean
}

interface CalendarSyncContextType {
  isConnected: boolean
  events: CalendarEvent[]
  connectGoogle: () => Promise<void>
  disconnectGoogle: () => void
  syncTask: (taskId: string, title: string, dueDate: Date) => Promise<void>
  unsyncTask: (taskId: string) => Promise<void>
  getLastSyncTime: () => Date | null
}

const CalendarSyncContext = createContext<CalendarSyncContextType | undefined>(undefined)

export function CalendarSyncProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  const connectGoogle = async () => {
    // Simulate Google OAuth connection
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsConnected(true)
    setLastSyncTime(new Date())
  }

  const disconnectGoogle = () => {
    setIsConnected(false)
    setEvents([])
    setLastSyncTime(null)
  }

  const syncTask = async (taskId: string, title: string, dueDate: Date) => {
    if (!isConnected) return

    // Simulate syncing to Google Calendar
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newEvent: CalendarEvent = {
      id: `event-${taskId}`,
      title,
      description: `Learning task: ${title}`,
      startTime: dueDate,
      endTime: new Date(dueDate.getTime() + 60 * 60 * 1000), // 1 hour duration
      taskId,
      synced: true,
    }

    setEvents((prev) => [...prev, newEvent])
    setLastSyncTime(new Date())
  }

  const unsyncTask = async (taskId: string) => {
    if (!isConnected) return

    // Simulate removing from Google Calendar
    await new Promise((resolve) => setTimeout(resolve, 500))

    setEvents((prev) => prev.filter((e) => e.taskId !== taskId))
    setLastSyncTime(new Date())
  }

  const getLastSyncTime = () => lastSyncTime

  return (
    <CalendarSyncContext.Provider
      value={{
        isConnected,
        events,
        connectGoogle,
        disconnectGoogle,
        syncTask,
        unsyncTask,
        getLastSyncTime,
      }}
    >
      {children}
    </CalendarSyncContext.Provider>
  )
}

export function useCalendarSync() {
  const context = useContext(CalendarSyncContext)
  if (context === undefined) {
    throw new Error("useCalendarSync must be used within a CalendarSyncProvider")
  }
  return context
}
