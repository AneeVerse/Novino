import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Check if input is email or phone
function isEmail(input: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(input)
}

// Clean phone number
function cleanPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2)
  }
  return cleaned
}

export async function POST(request: Request) {
  try {
    const { identifier, otp, purpose, username, email } = await request.json()

    if (!identifier || !otp) {
      return NextResponse.json({ error: 'Identifier and OTP are required' }, { status: 400 })
    }

    const normalizedIdentifier = identifier.trim().toLowerCase()
    const validPurposes = ['signup', 'login', 'reset']
    const otpPurpose = validPurposes.includes(purpose) ? purpose : 'login'
    
    const isEmailInput = isEmail(normalizedIdentifier)
    const lookupKey = isEmailInput ? normalizedIdentifier : cleanPhoneNumber(normalizedIdentifier)

    // Get OTP from database
    const { data: otpRecord, error: fetchError } = await supabase
      .from('otps')
      .select('*')
      .eq('email', lookupKey)
      .eq('purpose', otpPurpose)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (fetchError || !otpRecord) {
      return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 404 })
    }

    // Check if OTP expired
    if (new Date(otpRecord.expires) < new Date()) {
      await supabase.from('otps').delete().eq('id', otpRecord.id)
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 410 })
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 })
    }

    // Delete used OTP
    await supabase.from('otps').delete().eq('id', otpRecord.id)

    // Handle signup - create user in Supabase Auth
    if (otpPurpose === 'signup') {
      // For signup, we expect email and username to be passed from the frontend
      const authEmail = email || (isEmailInput ? lookupKey : `${lookupKey}@phone.novino.io`)
      const randomPassword = crypto.randomUUID() + crypto.randomUUID()
      
      const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
        email: authEmail,
        password: randomPassword,
        email_confirm: true,
        user_metadata: {
          username: username || null,
          phone: lookupKey,
          signup_method: 'phone'
        }
      })

      if (signUpError) {
        console.error('Signup error:', signUpError)
        return NextResponse.json({ error: signUpError.message }, { status: 500 })
      }

      if (!authData.user) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }

      // Create/update profile with all details
      await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          username: username || null,
          email: email || authEmail,
          phone: lookupKey,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })

      // Generate magic link for auto-login
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: authEmail
      })

      if (linkError || !linkData) {
        return NextResponse.json({
          success: true,
          message: 'Account created successfully. Please login.',
          needsLogin: true
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Account created successfully',
        token_hash: linkData.properties.hashed_token
      })
    }

    // Handle login
    if (otpPurpose === 'login') {
      // Get user profile to find auth email
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, phone, is_blocked')
        .or(isEmailInput ? `email.eq.${lookupKey}` : `phone.eq.${lookupKey}`)
        .maybeSingle()

      if (!profile) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      if (profile.is_blocked) {
        return NextResponse.json({ error: 'Your account has been blocked. Please contact support.' }, { status: 403 })
      }

      // Get auth user to find the email used for auth
      const { data: authUser } = await supabase.auth.admin.getUserById(profile.id)
      
      if (!authUser?.user?.email) {
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
      }

      // Generate magic link for login
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: authUser.user.email
      })

      if (linkError || !linkData) {
        console.error('Magic link error:', linkError)
        return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'OTP verified successfully',
        token_hash: linkData.properties.hashed_token
      })
    }

    return NextResponse.json({ success: true, message: 'OTP verified' })

  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
