import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const seedKey = url.searchParams.get('key')
    
    // Only allow with secret key
    if (seedKey !== 'agrihub-seed-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Find the user by email in auth.users
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found. Please sign up first at /auth/signup' 
      }, { status: 404 })
    }

    // Update the profile to admin role
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        role: 'admin',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `User ${email} is now an admin!`,
      user: data
    })

  } catch (error) {
    console.error('Make admin error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
