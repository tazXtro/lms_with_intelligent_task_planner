import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createCanvasService } from '@/lib/canvas-api'

/**
 * POST - Sync all Canvas data (courses, assignments, announcements, grades)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Canvas connection
    const { data: connection, error: connectionError } = await supabase
      .from('canvas_connections')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (connectionError || !connection) {
      return NextResponse.json({ 
        error: 'Canvas not connected. Please connect first.' 
      }, { status: 400 })
    }

    if (!connection.is_connected || !connection.sync_enabled) {
      return NextResponse.json({ 
        error: 'Canvas sync is disabled' 
      }, { status: 400 })
    }

    // Initialize Canvas service
    const canvasService = createCanvasService({
      canvasUrl: connection.canvas_url,
      accessToken: connection.access_token,
    })

    const syncResults = {
      courses: 0,
      assignments: 0,
      announcements: 0,
      grades: 0,
      errors: [] as string[],
    }

    // 1. Sync Courses
    try {
      const courses = await canvasService.getCourses()
      
      for (const course of courses) {
        const enrollmentType = course.enrollments?.[0]?.type || 'StudentEnrollment'
        
        await supabase
          .from('canvas_courses')
          .upsert({
            user_id: user.id,
            canvas_course_id: course.id.toString(),
            name: course.name,
            course_code: course.course_code,
            workflow_state: course.workflow_state,
            start_at: course.start_at,
            end_at: course.end_at,
            enrollment_type: enrollmentType,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,canvas_course_id'
          })
        
        syncResults.courses++
      }
    } catch (error: any) {
      console.error('Error syncing courses:', error)
      syncResults.errors.push(`Courses: ${error.message}`)
    }

    // 2. Sync Assignments
    try {
      const assignments = await canvasService.getAllAssignments()
      
      for (const assignment of assignments) {
        // Get submission status
        const submission = await canvasService.getAssignmentSubmission(
          assignment.course_id.toString(),
          assignment.id.toString()
        )

        await supabase
          .from('canvas_assignments')
          .upsert({
            user_id: user.id,
            canvas_course_id: assignment.course_id.toString(),
            canvas_assignment_id: assignment.id.toString(),
            name: assignment.name,
            description: assignment.description,
            due_at: assignment.due_at,
            points_possible: assignment.points_possible,
            submission_types: assignment.submission_types,
            workflow_state: assignment.workflow_state,
            html_url: assignment.html_url,
            has_submitted: submission?.submitted_at ? true : false,
            grade: submission?.grade || null,
            score: submission?.score || null,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,canvas_assignment_id'
          })
        
        syncResults.assignments++
      }
    } catch (error: any) {
      console.error('Error syncing assignments:', error)
      syncResults.errors.push(`Assignments: ${error.message}`)
    }

    // 3. Sync Announcements
    try {
      const courses = await canvasService.getCourses()
      
      for (const course of courses) {
        try {
          const announcements = await canvasService.getCourseAnnouncements(course.id.toString())
          
          for (const announcement of announcements) {
            try {
              await supabase
                .from('canvas_announcements')
                .upsert({
                  user_id: user.id,
                  canvas_course_id: course.id.toString(),
                  canvas_announcement_id: announcement.id.toString(),
                  title: announcement.title || 'Untitled Announcement',
                  message: announcement.message || '',
                  posted_at: announcement.posted_at || new Date().toISOString(),
                  author_name: announcement.author?.display_name || 'Unknown',
                  html_url: announcement.html_url || '',
                  updated_at: new Date().toISOString(),
                }, {
                  onConflict: 'user_id,canvas_announcement_id'
                })
              
              syncResults.announcements++
            } catch (announcementError: any) {
              console.error(`Error syncing individual announcement ${announcement.id}:`, announcementError)
              console.error('Announcement data:', JSON.stringify(announcement, null, 2))
            }
          }
        } catch (courseAnnouncementError: any) {
          console.error(`Error fetching announcements for course ${course.id}:`, courseAnnouncementError)
          // Continue with other courses
        }
      }
    } catch (error: any) {
      console.error('Error syncing announcements:', error)
      syncResults.errors.push(`Announcements: ${error.message}`)
    }

    // 4. Sync Grades
    try {
      const enrollments = await canvasService.getEnrollments()
      
      for (const enrollment of enrollments) {
        if (enrollment.grades) {
          await supabase
            .from('canvas_grades')
            .upsert({
              user_id: user.id,
              canvas_course_id: enrollment.course_id.toString(),
              current_grade: enrollment.grades.current_grade,
              current_score: enrollment.grades.current_score,
              final_grade: enrollment.grades.final_grade,
              final_score: enrollment.grades.final_score,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id,canvas_course_id'
            })
          
          syncResults.grades++
        }
      }
    } catch (error: any) {
      console.error('Error syncing grades:', error)
      syncResults.errors.push(`Grades: ${error.message}`)
    }

    // Update last sync time
    await supabase
      .from('canvas_connections')
      .update({
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      message: 'Canvas data synced successfully',
      results: syncResults,
    })
  } catch (error: any) {
    console.error('Error syncing Canvas data:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to sync Canvas data' 
    }, { status: 500 })
  }
}

