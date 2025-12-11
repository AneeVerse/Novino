import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Generate 4-digit OTP
function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

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

// Clean phone number (remove spaces, dashes, and country code formatting)
function cleanPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '')
  // If starts with 91 (India code) and has 12 digits, remove the 91
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2)
  }
  return cleaned
}

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// Send SMS via Fast2SMS using OTP route (cheaper rate - ₹0.20-0.25/SMS)
async function sendSMS(phone: string, otp: string): Promise<boolean> {
  try {
    const apiKey = process.env.FAST2SMS_API_KEY
    if (!apiKey) {
      console.error('FAST2SMS_API_KEY not configured')
      return false
    }

    // Using OTP/DLT route for cheaper rates (₹0.20-0.25 per SMS instead of ₹5)
    // Route 'dlt' is for transactional/OTP messages with lower cost
    const url = new URL('https://www.fast2sms.com/dev/bulkV2')
    url.searchParams.append('authorization', apiKey)
    url.searchParams.append('route', 'dlt') // DLT/Transactional route (cheaper)
    url.searchParams.append('sender_id', 'NOVINO') // Your sender ID (register on Fast2SMS)
    url.searchParams.append('message', '166949') // Your DLT template ID (register on Fast2SMS)
    url.searchParams.append('variables_values', otp) // OTP value
    url.searchParams.append('numbers', phone)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      }
    })

    const data = await response.json()
    console.log('Fast2SMS response:', data)

    if (data.return === true || data.status_code === 200) {
      return true
    }
    
    console.error('Fast2SMS error:', data)
    return false
  } catch (error) {
    console.error('Fast2SMS error:', error)
    return false
  }
}

// Send Email OTP
async function sendEmailOTP(email: string, otp: string): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"Novino" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Novino Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #AE876D; margin-bottom: 20px;">Your Verification Code</h2>
          <p style="color: #333; font-size: 16px;">Use this code to verify your account:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #333;">${otp}</span>
          </div>
          <p style="color: #666; font-size: 14px;">This code expires in 10 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

export async function POST(request: Request) {
  try {
    const { identifier, email, phone, purpose } = await request.json()

    const validPurposes = ['signup', 'login', 'reset']
    const otpPurpose = validPurposes.includes(purpose) ? purpose : 'login'
    
    let userEmail = email
    let userPhone = phone

    // For signup, we expect email and phone separately
    if (otpPurpose === 'signup') {
      if (!email || !phone) {
        return NextResponse.json({ error: 'Email and phone number are required' }, { status: 400 })
      }

      // Sanitize and validate email
      const sanitizedEmail = sanitizeEmail(email)
      if (!sanitizedEmail) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
      }
      userEmail = sanitizedEmail

      // Clean and validate phone
      userPhone = cleanPhoneNumber(phone)
      if (userPhone.length !== 10) {
        return NextResponse.json({ error: 'Please enter a valid 10-digit phone number' }, { status: 400 })
      }

      // Check if email already exists
      const { data: existingEmail } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle()

      if (existingEmail) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
      }

      // Check if phone already exists
      const { data: existingPhone } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', userPhone)
        .maybeSingle()

      if (existingPhone) {
        return NextResponse.json({ error: 'Phone number already registered' }, { status: 409 })
      }
    }

    // For login, identifier can be email or phone
    if (otpPurpose === 'login') {
      if (!identifier) {
        return NextResponse.json({ error: 'Email or phone number is required' }, { status: 400 })
      }

      const normalizedIdentifier = identifier.trim().toLowerCase()
      const isEmailInput = isEmail(normalizedIdentifier)
      
      // Additional validation for email input
      if (isEmailInput) {
        const sanitized = sanitizeEmail(normalizedIdentifier)
        if (!sanitized) {
          return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
        }
      }
      
      // Fetch user's email and phone from database
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email, phone')
        .or(isEmailInput ? `email.eq.${normalizedIdentifier}` : `phone.eq.${cleanPhoneNumber(normalizedIdentifier)}`)
        .maybeSingle()

      if (!existingUser) {
        return NextResponse.json({ 
          error: 'Account not found. Please sign up first.' 
        }, { status: 404 })
      }

      // Use the user's registered email and phone for OTP sending
      userEmail = existingUser.email
      userPhone = existingUser.phone
    }

    // Generate new 4-digit OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry

    // Store OTP in database (using email as primary key)
    const lookupKey = userEmail || userPhone
    
    // Delete any existing OTPs for this user and purpose
    await supabase
      .from('otps')
      .delete()
      .eq('email', lookupKey)
      .eq('purpose', otpPurpose)

    const { error: insertError } = await supabase
      .from('otps')
      .insert({
        email: lookupKey,
        otp: otp,
        purpose: otpPurpose,
        expires: expiresAt.toISOString()
      })

    if (insertError) {
      console.error('OTP insert error:', insertError)
      return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 })
    }

    // Send OTP to both email and phone (if available)
    let emailSent = false
    let smsSent = false
    const sendResults = []

    // Send to email
    if (userEmail) {
      emailSent = await sendEmailOTP(userEmail, otp)
      if (emailSent) {
        sendResults.push('email')
      } else {
        console.error('Failed to send OTP to email:', userEmail)
      }
    }

    // Send to phone (silently fail if SMS service has issues)
    if (userPhone) {
      smsSent = await sendSMS(userPhone, otp)
      if (smsSent) {
        sendResults.push('phone')
      } else {
        console.warn('Failed to send OTP to phone (likely credit issue):', userPhone)
        // Don't throw error - SMS is fallback
      }
    }

    // At least email should be sent
    if (!emailSent) {
      // Clean up the OTP if email sending failed
      await supabase.from('otps').delete().eq('email', lookupKey).eq('otp', otp)
      return NextResponse.json({ 
        error: 'Failed to send OTP. Please try again.' 
      }, { status: 500 })
    }

    // Success message
    let message = 'OTP sent successfully'
    if (emailSent && smsSent) {
      message = 'OTP sent to your email and phone'
    } else if (emailSent) {
      message = 'OTP sent to your email'
    } else if (smsSent) {
      message = 'OTP sent to your phone'
    }

    return NextResponse.json({ 
      success: true, 
      message,
      sentTo: sendResults
    })

  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}

