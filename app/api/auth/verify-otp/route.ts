import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Enhanced email validation with security checks
function isEmail(input: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return emailRegex.test(input)
}

// Sanitize and validate email
function sanitizeEmail(email: string): string | null {
  if (!email) return null
  
  // Trim and convert to lowercase
  const sanitized = email.trim().toLowerCase()
  
  // Length check
  if (sanitized.length < 3 || sanitized.length > 254) return null
  
  // Check for dangerous characters
  const dangerousChars = ['<', '>', '"', '\\', ';', '--', '/*', '*/']
  for (const char of dangerousChars) {
    if (sanitized.includes(char)) return null
  }
  
  // Check for consecutive dots
  if (sanitized.includes('..')) return null
  
  // Validate format
  if (!isEmail(sanitized)) return null
  
  return sanitized
}

// Sanitize username
function sanitizeUsername(username: string): string | null {
  if (!username) return null
  
  const sanitized = username.trim().toLowerCase()
  
  // Length check
  if (sanitized.length < 3 || sanitized.length > 30) return null
  
  // Only allow alphanumeric, underscore, and hyphen
  if (!/^[a-z0-9_-]+$/.test(sanitized)) return null
  
  // Cannot start with number
  if (/^[0-9]/.test(sanitized)) return null
  
  return sanitized
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
    const { identifier, otp, purpose, username, email, phone } = await request.json()

    if (!otp) {
      return NextResponse.json({ error: 'OTP is required' }, { status: 400 })
    }

    const validPurposes = ['signup', 'login', 'reset']
    const otpPurpose = validPurposes.includes(purpose) ? purpose : 'login'
    
    let lookupKey: string
    let userEmail: string
    let userPhone: string
    let isEmailInput = false

    // For signup, use email as lookup key
    if (otpPurpose === 'signup') {
      if (!email || !phone) {
        return NextResponse.json({ error: 'Email and phone are required for signup' }, { status: 400 })
      }
      
      // Sanitize and validate email
      const sanitizedEmail = sanitizeEmail(email)
      if (!sanitizedEmail) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
      }
      
      // Sanitize and validate username
      if (username) {
        const sanitizedUsername = sanitizeUsername(username)
        if (!sanitizedUsername) {
          return NextResponse.json({ error: 'Invalid username format' }, { status: 400 })
        }
        username = sanitizedUsername
      }
      
      lookupKey = sanitizedEmail
      userEmail = sanitizedEmail
      userPhone = cleanPhoneNumber(phone)
      
      // Validate phone
      if (userPhone.length !== 10) {
        return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
      }
    } else {
      // For login, determine if identifier is email or phone
      if (!identifier) {
        return NextResponse.json({ error: 'Email or phone is required' }, { status: 400 })
      }
      
      const normalizedIdentifier = identifier.trim().toLowerCase()
      isEmailInput = isEmail(normalizedIdentifier)
      
      // Additional security check
      if (isEmailInput) {
        const sanitized = sanitizeEmail(normalizedIdentifier)
        if (!sanitized) {
          return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
        }
      }
      
      // Lookup user profile to get both email and phone
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, phone')
        .or(isEmailInput ? `email.eq.${normalizedIdentifier}` : `phone.eq.${cleanPhoneNumber(normalizedIdentifier)}`)
        .maybeSingle()

      if (!profile) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      lookupKey = profile.email || profile.phone
      userEmail = profile.email
      userPhone = profile.phone
    }

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
      const randomPassword = crypto.randomUUID() + crypto.randomUUID()
      
      const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
        email: userEmail,
        password: randomPassword,
        email_confirm: true,
        user_metadata: {
          username: username || null,
          phone: userPhone,
          signup_method: 'otp'
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
          email: userEmail,
          phone: userPhone,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })

      // Generate magic link for auto-login
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: userEmail
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
