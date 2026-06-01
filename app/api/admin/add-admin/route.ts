import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Add admin users by email
export async function GET() {
  const adminEmails = [
    'djlivhuwani@gmail.com',
    'joshuatshikhudo@gmail.com',
    'joshuatshikhudo77@gmail.com',
  ]

  const results: { email: string; status: string; message: string }[] = []

  for (const email of adminEmails) {
    // Check if user exists in auth.users
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      results.push({ email, status: 'error', message: listError.message })
      continue
    }

    const user = users.users.find(u => u.email === email)

    if (!user) {
      results.push({ 
        email, 
        status: 'not_found', 
        message: 'User must sign up first at /auth/sign-up, then run this again' 
      })
      continue
    }

    // If user email is not confirmed, confirm it
    if (!user.email_confirmed_at) {
      const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { email_confirm: true }
      )
      if (confirmError) {
        results.push({ email, status: 'error', message: `Failed to confirm email: ${confirmError.message}` })
        continue
      }
    }

    // Check if profile exists
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      // Update existing profile to admin
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id)

      if (updateError) {
        results.push({ email, status: 'error', message: updateError.message })
      } else {
        results.push({ email, status: 'success', message: 'Updated to admin role (email confirmed)' })
      }
    } else {
      // Create profile with admin role
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: user.id,
          role: 'admin',
          first_name: email.split('@')[0],
        })

      if (insertError) {
        results.push({ email, status: 'error', message: insertError.message })
      } else {
        results.push({ email, status: 'success', message: 'Created profile with admin role (email confirmed)' })
      }
    }
  }

  return NextResponse.json({
    message: 'Admin setup complete',
    results,
  })
}
