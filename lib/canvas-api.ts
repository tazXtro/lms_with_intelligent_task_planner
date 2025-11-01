/**
 * Canvas LMS API Service
 * Handles all interactions with Canvas LMS API
 */

export interface CanvasConfig {
  canvasUrl: string
  accessToken: string
}

export interface CanvasCourse {
  id: number
  name: string
  course_code: string
  workflow_state: string
  start_at: string | null
  end_at: string | null
  enrollments?: Array<{
    type: string
    role: string
  }>
}

export interface CanvasAssignment {
  id: number
  name: string
  description: string
  due_at: string | null
  points_possible: number
  submission_types: string[]
  workflow_state: string
  html_url: string
  course_id: number
}

export interface CanvasSubmission {
  id: number
  assignment_id: number
  user_id: number
  submission_type: string
  submitted_at: string | null
  grade: string | null
  score: number | null
  workflow_state: string
}

export interface CanvasAnnouncement {
  id: number
  title: string
  message: string
  posted_at: string
  author: {
    display_name: string
  }
  html_url: string
  context_code: string
}

export interface CanvasEnrollment {
  id: number
  course_id: number
  user_id: number
  type: string
  grades: {
    current_grade: string | null
    current_score: number | null
    final_grade: string | null
    final_score: number | null
  }
}

export class CanvasAPIService {
  private canvasUrl: string
  private accessToken: string
  private baseUrl: string

  constructor(config: CanvasConfig) {
    // Remove trailing slash from canvas URL
    this.canvasUrl = config.canvasUrl.replace(/\/$/, '')
    this.accessToken = config.accessToken
    this.baseUrl = `${this.canvasUrl}/api/v1`
  }

  /**
   * Make authenticated request to Canvas API
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Canvas API Error (${response.status}): ${errorText}`)
    }

    return response.json()
  }

  /**
   * Test the Canvas connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.request('/users/self')
      return true
    } catch (error) {
      console.error('Canvas connection test failed:', error)
      return false
    }
  }

  /**
   * Get current user information
   */
  async getCurrentUser() {
    return this.request<any>('/users/self')
  }

  /**
   * Get all courses for the current user
   */
  async getCourses(): Promise<CanvasCourse[]> {
    try {
      const courses = await this.request<CanvasCourse[]>(
        '/courses?enrollment_state=active&include[]=total_students&include[]=teachers&per_page=100'
      )
      return courses
    } catch (error) {
      console.error('Error fetching Canvas courses:', error)
      throw error
    }
  }

  /**
   * Get assignments for a specific course
   */
  async getCourseAssignments(courseId: string): Promise<CanvasAssignment[]> {
    try {
      const assignments = await this.request<CanvasAssignment[]>(
        `/courses/${courseId}/assignments?per_page=100`
      )
      return assignments
    } catch (error) {
      console.error(`Error fetching assignments for course ${courseId}:`, error)
      throw error
    }
  }

  /**
   * Get all assignments across all courses
   */
  async getAllAssignments(): Promise<CanvasAssignment[]> {
    try {
      const courses = await this.getCourses()
      const allAssignments: CanvasAssignment[] = []

      for (const course of courses) {
        try {
          const assignments = await this.getCourseAssignments(course.id.toString())
          allAssignments.push(...assignments)
        } catch (error) {
          console.error(`Failed to fetch assignments for course ${course.id}:`, error)
          // Continue with other courses even if one fails
        }
      }

      return allAssignments
    } catch (error) {
      console.error('Error fetching all assignments:', error)
      throw error
    }
  }

  /**
   * Get submission for a specific assignment
   */
  async getAssignmentSubmission(
    courseId: string,
    assignmentId: string
  ): Promise<CanvasSubmission | null> {
    try {
      const submission = await this.request<CanvasSubmission>(
        `/courses/${courseId}/assignments/${assignmentId}/submissions/self`
      )
      return submission
    } catch (error) {
      console.error(`Error fetching submission for assignment ${assignmentId}:`, error)
      return null
    }
  }

  /**
   * Get announcements for a specific course
   */
  async getCourseAnnouncements(courseId: string): Promise<CanvasAnnouncement[]> {
    try {
      const announcements = await this.request<CanvasAnnouncement[]>(
        `/courses/${courseId}/discussion_topics?only_announcements=true&per_page=100`
      )
      
      // Log to help debug
      console.log(`Fetched ${announcements?.length || 0} announcements for course ${courseId}`)
      
      return announcements || []
    } catch (error) {
      console.error(`Error fetching announcements for course ${courseId}:`, error)
      // Return empty array instead of throwing to continue with other courses
      return []
    }
  }

  /**
   * Get all announcements across all courses
   */
  async getAllAnnouncements(): Promise<CanvasAnnouncement[]> {
    try {
      const courses = await this.getCourses()
      const allAnnouncements: CanvasAnnouncement[] = []

      for (const course of courses) {
        try {
          const announcements = await this.getCourseAnnouncements(course.id.toString())
          allAnnouncements.push(...announcements)
        } catch (error) {
          console.error(`Failed to fetch announcements for course ${course.id}:`, error)
          // Continue with other courses even if one fails
        }
      }

      // Sort by posted date (newest first)
      return allAnnouncements.sort((a, b) => 
        new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime()
      )
    } catch (error) {
      console.error('Error fetching all announcements:', error)
      throw error
    }
  }

  /**
   * Get enrollments with grades
   */
  async getEnrollments(): Promise<CanvasEnrollment[]> {
    try {
      const enrollments = await this.request<CanvasEnrollment[]>(
        '/users/self/enrollments?state[]=active&per_page=100'
      )
      return enrollments
    } catch (error) {
      console.error('Error fetching enrollments:', error)
      throw error
    }
  }

  /**
   * Get upcoming assignments (assignments due in the future)
   */
  async getUpcomingAssignments(): Promise<CanvasAssignment[]> {
    try {
      const allAssignments = await this.getAllAssignments()
      const now = new Date()

      return allAssignments
        .filter(assignment => {
          if (!assignment.due_at) return false
          const dueDate = new Date(assignment.due_at)
          return dueDate > now
        })
        .sort((a, b) => {
          const dateA = new Date(a.due_at!).getTime()
          const dateB = new Date(b.due_at!).getTime()
          return dateA - dateB
        })
    } catch (error) {
      console.error('Error fetching upcoming assignments:', error)
      throw error
    }
  }

  /**
   * Get calendar events
   */
  async getCalendarEvents(startDate?: Date, endDate?: Date): Promise<any[]> {
    try {
      let endpoint = '/calendar_events?per_page=100'
      
      if (startDate) {
        endpoint += `&start_date=${startDate.toISOString()}`
      }
      
      if (endDate) {
        endpoint += `&end_date=${endDate.toISOString()}`
      }

      const events = await this.request<any[]>(endpoint)
      return events
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      throw error
    }
  }

  /**
   * Get course grades
   */
  async getCourseGrade(courseId: string): Promise<any> {
    try {
      const enrollment = await this.request<any>(
        `/courses/${courseId}/enrollments?user_id=self`
      )
      return enrollment[0]?.grades || null
    } catch (error) {
      console.error(`Error fetching grade for course ${courseId}:`, error)
      return null
    }
  }

  /**
   * Get all grades across all courses
   */
  async getAllGrades(): Promise<Map<string, any>> {
    try {
      const enrollments = await this.getEnrollments()
      const gradesMap = new Map<string, any>()

      for (const enrollment of enrollments) {
        if (enrollment.grades) {
          gradesMap.set(enrollment.course_id.toString(), enrollment.grades)
        }
      }

      return gradesMap
    } catch (error) {
      console.error('Error fetching all grades:', error)
      throw error
    }
  }
}

/**
 * Create a Canvas API service instance
 */
export function createCanvasService(config: CanvasConfig): CanvasAPIService {
  return new CanvasAPIService(config)
}

