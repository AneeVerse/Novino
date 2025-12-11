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

// Check if input is email or phone
function isEmail(input: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(input)
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

// Send SMS via Fast2SMS
async function sendSMS(phone: string, otp: string): Promise<boolean> {
  try {
    const apiKey = process.env.FAST2SMS_API_KEY
    if (!apiKey) {
      console.error('FAST2SMS_API_KEY not configured')
      return false
    }

    const message = `Your Novino verification code is: ${otp}. Valid for 10 minutes.`
    
    const url = new URL('https://www.fast2sms.com/dev/bulkV2')
    url.searchParams.append('authorization', apiKey)
    url.searchParams.append('route', 'q') // Quick SMS route
    url.searchParams.append('message', message)
    url.searchParams.append('numbers', phone)
    url.searchParams.append('flash', '0')

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
    const { identifier, purpose } = await request.json()

    if (!identifier) {
      return NextResponse.json({ error: 'Email or phone number is required' }, { status: 400 })
    }

    const normalizedIdentifier = identifier.trim().toLowerCase()
    const validPurposes = ['signup', 'login', 'reset']
    const otpPurpose = validPurposes.includes(purpose) ? purpose : 'login'
    
    const isEmailInput = isEmail(normalizedIdentifier)
    const cleanedPhone = isEmailInput ? null : cleanPhoneNumber(normalizedIdentifier)

    // Validate phone number (should be 10 digits for Indian numbers)
    if (!isEmailInput && cleanedPhone && cleanedPhone.length !== 10) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit phone number' }, { status: 400 })
    }

    // Use email or phone as the lookup key
    const lookupKey = isEmailInput ? normalizedIdentifier : cleanedPhone

    // For login, check if user exists
    if (otpPurpose === 'login') {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email, phone')
        .or(isEmailInput ? `email.eq.${lookupKey}` : `phone.eq.${lookupKey}`)
        .maybeSingle()

      if (!existingUser) {
        return NextResponse.json({ 
          error: isEmailInput ? 'Email not registered' : 'Phone number not registered' 
        }, { status: 404 })
      }
    }

    // For signup, check if user already exists
    if (otpPurpose === 'signup') {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email, phone')
        .or(isEmailInput ? `email.eq.${lookupKey}` : `phone.eq.${lookupKey}`)
        .maybeSingle()

      if (existingUser) {
        return NextResponse.json({ 
          error: isEmailInput ? 'Email already registered' : 'Phone number already registered' 
        }, { status: 409 })
      }
    }

    // Delete any existing OTPs for this identifier and purpose
    await supabase
      .from('otps')
      .delete()
      .eq('email', lookupKey) // Using 'email' column for both email and phone
      .eq('purpose', otpPurpose)

    // Generate new 4-digit OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry

    // Store OTP in database
    const { error: insertError } = await supabase
      .from('otps')
      .insert({
        email: lookupKey, // Using 'email' column for both email and phone
        otp: otp,
        purpose: otpPurpose,
        expires: expiresAt.toISOString()
      })

    if (insertError) {
      console.error('OTP insert error:', insertError)
      return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 })
    }

    // Send OTP via appropriate channel
    let sent = false
    if (isEmailInput) {
      sent = await sendEmailOTP(lookupKey!, otp)
    } else {
      sent = await sendSMS(cleanedPhone!, otp)
    }

    if (!sent) {
      // Clean up the OTP if sending failed
      await supabase.from('otps').delete().eq('email', lookupKey).eq('otp', otp)
      return NextResponse.json({ 
        error: isEmailInput ? 'Failed to send email' : 'Failed to send SMS' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: isEmailInput ? 'OTP sent to your email' : 'OTP sent to your phone',
      type: isEmailInput ? 'email' : 'phone'
    })

  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
