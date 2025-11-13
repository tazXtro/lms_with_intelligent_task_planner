import { google } from 'googleapis'
import { createClient } from '@/utils/supabase/server'

export interface CalendarEvent {
  id?: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  end: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  colorId?: string
  reminders?: {
    useDefault: boolean
    overrides?: Array<{
      method: string
      minutes: number
    }>
  }
}

export class GoogleCalendarService {
  private oauth2Client: any

  constructor(accessToken: string, refreshToken: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_SITE_URL + '/auth/callback'
    )

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
  }

  /**
   * Get user's primary calendar or create a dedicated DigiGyan calendar
   */
  async getOrCreateDigigyanCalendar(): Promise<string> {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

    try {
      // First, check if "DigiGyan Learning Tasks" calendar already exists
      const calendarList = await calendar.calendarList.list()
      const digigyanCalendar = calendarList.data.items?.find(
        (cal) => cal.summary === 'DigiGyan Learning Tasks'
      )

      if (digigyanCalendar && digigyanCalendar.id) {
        return digigyanCalendar.id
      }

      // Create a new calendar for DigiGyan tasks
      const newCalendar = await calendar.calendars.insert({
        requestBody: {
          summary: 'DigiGyan Learning Tasks',
          description: 'Automatically synced learning tasks from DigiGyan LMS',
          timeZone: 'UTC',
        },
      })

      return newCalendar.data.id!
    } catch (error) {
      console.error('Error getting/creating calendar:', error)
      throw error
    }
  }

  /**
   * Create a calendar event for a task
   */
  async createTaskEvent(
    calendarId: string,
    taskTitle: string,
    taskDescription: string | null,
    dueDate: string | null,
    priority: 'low' | 'medium' | 'high',
    reminderSettings?: { enabled: boolean; timing: string; emailEnabled: boolean }
  ): Promise<string> {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

    // Determine color based on priority
    const colorMap = {
      high: '11', // Red
      medium: '5', // Yellow
      low: '7', // Cyan
    }

    let start, end
    if (dueDate) {
      const dueDateTime = new Date(dueDate)
      // Set the event for the whole day
      start = { date: dueDate }
      end = { date: dueDate }
    } else {
      // If no due date, create an all-day event for today
      const today = new Date().toISOString().split('T')[0]
      start = { date: today }
      end = { date: today }
    }

    // Convert reminder timing to minutes
    const timingToMinutes: { [key: string]: number } = {
      '15m': 15,
      '1h': 60,
      '24h': 1440,
      '3d': 4320,
    }

    // Build reminders based on user preferences
    const reminders: any = reminderSettings?.enabled !== false ? {
      useDefault: false,
      overrides: [
        // Always add popup reminder
        { 
          method: 'popup', 
          minutes: reminderSettings?.timing ? timingToMinutes[reminderSettings.timing] || 1440 : 1440
        },
        // Add email reminder if enabled
        ...(reminderSettings?.emailEnabled !== false ? [{
          method: 'email',
          minutes: reminderSettings?.timing ? timingToMinutes[reminderSettings.timing] || 1440 : 1440
        }] : [])
      ],
    } : {
      useDefault: false,
      overrides: [],
    }

    const event: CalendarEvent = {
      summary: `📚 ${taskTitle}`,
      description: taskDescription || 'DigiGyan Learning Task',
      start,
      end,
      colorId: colorMap[priority],
      reminders,
    }

    try {
      const response = await calendar.events.insert({
        calendarId,
        requestBody: event,
      })

      return response.data.id!
    } catch (error) {
      console.error('Error creating calendar event:', error)
      throw error
    }
  }

  /**
   * Update a calendar event
   */
  async updateTaskEvent(
    calendarId: string,
    eventId: string,
    taskTitle: string,
    taskDescription: string | null,
    dueDate: string | null,
    priority: 'low' | 'medium' | 'high',
    status: 'todo' | 'in-progress' | 'completed',
    reminderSettings?: { enabled: boolean; timing: string; emailEnabled: boolean }
  ): Promise<void> {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

    const colorMap = {
      high: '11',
      medium: '5',
      low: '7',
    }

    // Add status emoji
    const statusEmoji = {
      todo: '📚',
      'in-progress': '⚡',
      completed: '✅',
    }

    let start, end
    if (dueDate) {
      start = { date: dueDate }
      end = { date: dueDate }
    } else {
      const today = new Date().toISOString().split('T')[0]
      start = { date: today }
      end = { date: today }
    }

    // Convert reminder timing to minutes
    const timingToMinutes: { [key: string]: number } = {
      '15m': 15,
      '1h': 60,
      '24h': 1440,
      '3d': 4320,
    }

    // Build reminders based on user preferences
    const reminders: any = reminderSettings?.enabled !== false ? {
      useDefault: false,
      overrides: [
        // Always add popup reminder
        { 
          method: 'popup', 
          minutes: reminderSettings?.timing ? timingToMinutes[reminderSettings.timing] || 1440 : 1440
        },
        // Add email reminder if enabled
        ...(reminderSettings?.emailEnabled !== false ? [{
          method: 'email',
          minutes: reminderSettings?.timing ? timingToMinutes[reminderSettings.timing] || 1440 : 1440
        }] : [])
      ],
    } : {
      useDefault: false,
      overrides: [],
    }

    const event: CalendarEvent = {
      summary: `${statusEmoji[status]} ${taskTitle}`,
      description: taskDescription || 'DigiGyan Learning Task',
      start,
      end,
      colorId: colorMap[priority],
      reminders,
    }

    try {
      await calendar.events.update({
        calendarId,
        eventId,
        requestBody: event,
      })
    } catch (error) {
      console.error('Error updating calendar event:', error)
      throw error
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteTaskEvent(calendarId: string, eventId: string): Promise<void> {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

    try {
      await calendar.events.delete({
        calendarId,
        eventId,
      })
    } catch (error) {
      console.error('Error deleting calendar event:', error)
      throw error
    }
  }

  /**
   * Get calendar details
   */
  async getCalendarDetails(calendarId: string) {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

    try {
      const response = await calendar.calendars.get({ calendarId })
      return response.data
    } catch (error) {
      console.error('Error getting calendar details:', error)
      throw error
    }
  }

  /**
   * List events in a calendar
   */
  async listEvents(calendarId: string, maxResults: number = 10) {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

    try {
      const response = await calendar.events.list({
        calendarId,
        maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      })

      return response.data.items || []
    } catch (error) {
      console.error('Error listing calendar events:', error)
      throw error
    }
  }
}

/**
 * Get Google OAuth tokens from Supabase session
 */
export async function getGoogleTokens(): Promise<{
  accessToken: string
  refreshToken: string
} | null> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  const provider_token = session.provider_token
  const provider_refresh_token = session.provider_refresh_token

  if (!provider_token || !provider_refresh_token) {
    return null
  }

  return {
    accessToken: provider_token,
    refreshToken: provider_refresh_token,
  }
}

/**
 * Initialize Google Calendar Service with current user's tokens
 */
export async function initGoogleCalendarService(): Promise<GoogleCalendarService | null> {
  const tokens = await getGoogleTokens()

  if (!tokens) {
    return null
  }

  return new GoogleCalendarService(tokens.accessToken, tokens.refreshToken)
}

