import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createCanvasService } from '@/lib/canvas-api'

/**
 * GET - Get Canvas connection status and settings
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Canvas connection settings
    const { data: connection, error } = await supabase
      .from('canvas_connections')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    // Get sync statistics
    const { count: coursesCount } = await supabase
      .from('canvas_courses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { count: assignmentsCount } = await supabase
      .from('canvas_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { count: announcementsCount } = await supabase
      .from('canvas_announcements')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    return NextResponse.json({
      connected: connection?.is_connected || false,
      settings: connection ? {
        canvas_url: connection.canvas_url,
        last_sync_at: connection.last_sync_at,
        sync_enabled: connection.sync_enabled,
      } : null,
      stats: {
        courses: coursesCount || 0,
        assignments: assignmentsCount || 0,
        announcements: announcementsCount || 0,
      }
    })
  } catch (error: any) {
    console.error('Error fetching Canvas connection:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch Canvas connection' 
    }, { status: 500 })
  }
}

/**
 * POST - Connect to Canvas with access token
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { canvasUrl, accessToken } = body

    if (!canvasUrl || !accessToken) {
      return NextResponse.json({ 
        error: 'Canvas URL and access token are required' 
      }, { status: 400 })
    }

    // Validate Canvas URL format
    const urlPattern = /^https?:\/\/.+/
    if (!urlPattern.test(canvasUrl)) {
      return NextResponse.json({ 
        error: 'Invalid Canvas URL format. Must start with http:// or https://' 
      }, { status: 400 })
    }

    // Test the Canvas connection
    const canvasService = createCanvasService({ canvasUrl, accessToken })
    const isValid = await canvasService.testConnection()

    if (!isValid) {
      return NextResponse.json({ 
        error: 'Failed to connect to Canvas. Please check your URL and access token.' 
      }, { status: 400 })
    }

    // Get user info to verify
    const canvasUser = await canvasService.getCurrentUser()

    // Store or update Canvas connection
    const { data: existingConnection } = await supabase
      .from('canvas_connections')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existingConnection) {
      // Update existing connection
      await supabase
        .from('canvas_connections')
        .update({
          canvas_url: canvasUrl,
          access_token: accessToken,
          is_connected: true,
          sync_enabled: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
    } else {
      // Create new connection
      await supabase
        .from('canvas_connections')
        .insert({
          user_id: user.id,
          canvas_url: canvasUrl,
          access_token: accessToken,
          is_connected: true,
          sync_enabled: true,
        })
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Canvas',
      canvasUser: {
        name: canvasUser.name,
        email: canvasUser.primary_email,
      }
    })
  } catch (error: any) {
    console.error('Error connecting to Canvas:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to connect to Canvas' 
    }, { status: 500 })
  }
}

/**
 * DELETE - Disconnect Canvas and remove all synced data
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete all Canvas data (cascade will handle related records)
    await supabase
      .from('canvas_connections')
      .delete()
      .eq('user_id', user.id)

    // Manually delete other tables (in case cascade doesn't work)
    await Promise.all([
      supabase.from('canvas_courses').delete().eq('user_id', user.id),
      supabase.from('canvas_assignments').delete().eq('user_id', user.id),
      supabase.from('canvas_announcements').delete().eq('user_id', user.id),
      supabase.from('canvas_grades').delete().eq('user_id', user.id),
    ])

    return NextResponse.json({
      success: true,
      message: 'Canvas disconnected successfully'
    })
  } catch (error: any) {
    console.error('Error disconnecting Canvas:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to disconnect Canvas' 
    }, { status: 500 })
  }
}

