import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  if (token_hash && type) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error && data.user) {
      // Get user profile to check if role is set
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      // If no role set, redirect to role selection
      if (!profile?.role) {
        redirect('/auth/select-role')
      }

      // If role exists, redirect to landing page (user clicked confirmation link again)
      redirect('/')
    }
  }

  // redirect the user to an error page with some instructions
  redirect('/auth?error=Unable to confirm email')
}

