import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Fetch profile from database
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('name, email, phone')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Profile fetch error:', error)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const body = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Validate phone number if provided
    if (body.phone) {
      const cleaned = body.phone.replace(/\D/g, '')
      if (cleaned.length !== 10) {
        return NextResponse.json({ error: 'Invalid phone number. Must be 10 digits.' }, { status: 400 })
      }

      // Check if phone number already exists for another user
      const { data: existingPhone } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', cleaned)
        .neq('id', userId)
        .maybeSingle()

      if (existingPhone) {
        return NextResponse.json({ error: 'This phone number is already registered.' }, { status: 409 })
      }

      body.phone = cleaned
    }

    // Update profile in database
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (error) {
    console.error('Profile PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

