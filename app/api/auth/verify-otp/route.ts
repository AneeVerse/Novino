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

// Sanitize name
function sanitizeName(name: string): string | null {
  if (!name) return null
  
  const sanitized = name.trim()
  
  // Length check
  if (sanitized.length < 2 || sanitized.length > 50) return null
  
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
    const { identifier, otp, purpose, name, email, phone } = await request.json()

    if (!otp) {
      return NextResponse.json({ error: 'OTP is required' }, { status: 400 })
    }

    const validPurposes = ['signup', 'login', 'reset']
    const otpPurpose = validPurposes.includes(purpose) ? purpose : 'login'
    
    let lookupKey: string
    let userEmail: string
    let userPhone: string
    let userName: string | null = null
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
      
      // Sanitize and validate name (optional but recommended)
      if (name) {
        const sanitizedName = sanitizeName(name)
        if (!sanitizedName) {
          return NextResponse.json({ error: 'Invalid name format' }, { status: 400 })
        }
        userName = sanitizedName
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
          name: userName || null,
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

      // Create/update profile with all details (name instead of username)
      await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          name: userName || null,
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
      // Get user profile using the already-fetched email/phone
      const { data: loginProfile } = await supabase
        .from('profiles')
        .select('id, email, phone, is_blocked')
        .eq('email', userEmail)
        .maybeSingle()

      if (!loginProfile) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      if (loginProfile.is_blocked) {
        return NextResponse.json({ error: 'Your account has been blocked. Please contact support.' }, { status: 403 })
      }

      // Get auth user to find the email used for auth
      const { data: authUser } = await supabase.auth.admin.getUserById(loginProfile.id)
      
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
