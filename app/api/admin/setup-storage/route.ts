import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const seedKey = url.searchParams.get('key')
    
    if (seedKey !== 'agrihub-seed-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const imagesBucket = buckets?.find(b => b.name === 'images')

    if (imagesBucket) {
      return NextResponse.json({ 
        message: 'Storage bucket already exists',
        bucket: imagesBucket
      })
    }

    // Create the images bucket
    const { data, error } = await supabase.storage.createBucket('images', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    })

    if (error) {
      console.error('Error creating bucket:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Storage bucket created successfully',
      bucket: data
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 })
  }
}
