"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, User, Mail, Phone } from 'lucide-react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useToast } from '@/hooks/use-toast'

// Validation
const validateName = (name: string): string | null => {
  if (!name) return 'Name is required'
  if (name.length < 2) return 'Name must be at least 2 characters'
  if (name.length > 50) return 'Name must be less than 50 characters'
  return null
}

const validateEmail = (email: string): string | null => {
  // Required check
  if (!email) return 'Email is required'
  
  // Trim and convert to lowercase for validation
  const trimmed = email.trim().toLowerCase()
  
  // Length validation (RFC 5321)
  if (trimmed.length < 3) return 'Email is too short'
  if (trimmed.length > 254) return 'Email is too long'
  
  // Enhanced email regex with more strict validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  
  if (!emailRegex.test(trimmed)) {
    return 'Please enter a valid email address'
  }
  
  // Check for consecutive dots
  if (trimmed.includes('..')) return 'Email contains invalid consecutive dots'
  
  // Check for dots at start or end of local part
  const [localPart, domain] = trimmed.split('@')
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return 'Email local part cannot start or end with a dot'
  }
  
  // Validate domain has at least one dot and valid TLD
  if (!domain || !domain.includes('.')) {
    return 'Email domain is invalid'
  }
  
  // Check domain TLD length (minimum 2 characters)
  const domainParts = domain.split('.')
  const tld = domainParts[domainParts.length - 1]
  if (tld.length < 2) {
    return 'Email domain TLD is too short'
  }
  
  // Check for spaces (extra safety)
  if (trimmed.includes(' ')) return 'Email cannot contain spaces'
  
  // Check for dangerous characters that might be used for injection
  const dangerousChars = ['<', '>', '"', "'", '\\', ';', '--', '/*', '*/', 'script']
  for (const char of dangerousChars) {
    if (trimmed.toLowerCase().includes(char)) {
      return 'Email contains invalid characters'
    }
  }
  
  return null
}

const validatePhone = (phone: string): string | null => {
  if (!phone) return 'Mobile number is required'
  const cleaned = phone.replace(/[\s\-+]/g, '')
  if (!/^[0-9]{10,12}$/.test(cleaned)) {
    return 'Please enter a valid 10-digit mobile number'
  }
  return null
}


const validateOtp = (otp: string): string | null => {
  if (!otp) return 'OTP is required'
  if (!/^[0-9]{4}$/.test(otp)) return 'OTP must be 4 digits'
  return null
}

// Clean phone number
const cleanPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2)
  }
  return cleaned
}

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [step, setStep] = useState<'details' | 'otp'>('details')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ name?: string, email?: string, phone?: string, otp?: string }>({})
  const [otpSentToEmail, setOtpSentToEmail] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [])

  // Check for redirect from login with error
  useEffect(() => {
    const error = searchParams?.get('error')
    const identifier = searchParams?.get('identifier')
    const type = searchParams?.get('type')

    if (error === 'not_registered' && identifier) {
      if (type === 'email') {
        setEmail(identifier)
        setErrors({ email: 'Email not registered. Please enter your Name & Ph no to Continue.' })
        setMessage('')
      } else if (type === 'phone') {
        setPhone(identifier)
        setErrors({ phone: 'Phone number not registered. Please enter your Name & Email to Continue.' })
        setMessage('')
      }
    }

    // Restore email from sessionStorage if on OTP step
    if (step === 'otp') {
      const storedEmail = sessionStorage.getItem('otp_sent_email') || sessionStorage.getItem('signup_email')
      if (storedEmail) {
        setOtpSentToEmail(storedEmail)
        // Update message to success message
        setMessage(`Enter the 4-digit code sent to ${storedEmail}`)
      }
      // Clear error messages when on OTP step
      setErrors({})
    }
  }, [searchParams, step])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Validate all fields
    const nameError = validateName(name)
    const emailError = validateEmail(email)
    const phoneError = validatePhone(phone)

    if (nameError || emailError || phoneError) {
      setErrors({
        name: nameError || undefined,
        email: emailError || undefined,
        phone: phoneError || undefined
      })
      setMessage('Please fix the errors below')
      setLoading(false)
      return
    }

    setErrors({})

    try {
      const normalizedEmail = email.trim().toLowerCase()
      const cleanedPhone = cleanPhoneNumber(phone)
      const trimmedName = name.trim()

      // Check if email already exists
      const { data: existingEmail } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', normalizedEmail)
        .maybeSingle()

      if (existingEmail) {
        setErrors({ email: 'Email already registered' })
        setMessage('This email is already registered. Please login instead.')
        setLoading(false)
        return
      }

      // Check if phone already exists
      const { data: existingPhone } = await supabase
        .from('profiles')
        .select('phone')
        .eq('phone', cleanedPhone)
        .maybeSingle()

      if (existingPhone) {
        setErrors({ phone: 'Mobile number already registered' })
        setMessage('This mobile number is already registered. Please login instead.')
        setLoading(false)
        return
      }

      // Send OTP to email only (temporarily)
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          phone: cleanedPhone,
          purpose: 'signup'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Failed to send OTP')
        setLoading(false)
        return
      }

      // Store the email where OTP was sent
      const sentEmail = data.sentEmail || normalizedEmail
      setOtpSentToEmail(sentEmail)

      // Clear any previous errors
      setErrors({})

      // Store data for verification
      sessionStorage.setItem('signup_name', trimmedName)
      sessionStorage.setItem('signup_email', normalizedEmail)
      sessionStorage.setItem('signup_phone', cleanedPhone)
      sessionStorage.setItem('otp_sent_email', sentEmail)

      setMessage(`Enter the 4-digit code sent to ${sentEmail}`)
      toast({
        title: "OTP Sent!",
        description: `Please check ${sentEmail} for the 4-digit code.`,
      })
      
      // Clear URL parameters to remove any error indicators
      if (searchParams?.get('error')) {
        router.replace('/signup', { scroll: false })
      }
      
      setStep('otp')

    } catch (err) {
      console.error(err)
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const otpString = otp.join('')
    const otpError = validateOtp(otpString)
    if (otpError) {
      setErrors({ otp: otpError })
      setMessage('Please enter a valid OTP')
      setLoading(false)
      return
    }

    setErrors({})

    try {
      const storedPhone = sessionStorage.getItem('signup_phone')!
      const storedEmail = sessionStorage.getItem('signup_email')!
      const storedName = sessionStorage.getItem('signup_name')!

      // Verify OTP and create account
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp: otpString,
          purpose: 'signup',
          name: storedName,
          email: storedEmail,
          phone: storedPhone
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Invalid OTP. Please try again.')
        setLoading(false)
        return
      }

      // Auto-login
      if (data.token_hash) {
        await supabase.auth.verifyOtp({
          token_hash: data.token_hash,
          type: 'magiclink'
        })
      }

      // Clean up
      sessionStorage.removeItem('signup_name')
      sessionStorage.removeItem('signup_email')
      sessionStorage.removeItem('signup_phone')

      setMessage('Account created successfully!')
      toast({
        title: "Welcome!",
        description: "Your account has been created successfully.",
      })

      const redirectUrl = searchParams?.get('redirect') || '/'

      setTimeout(() => {
        router.push(redirectUrl)
        router.refresh()
      }, 1000)

    } catch (err) {
      console.error(err)
      setMessage('Network error. Please try again.')
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setLoading(true)
    setMessage('')

    try {
      const storedEmail = sessionStorage.getItem('signup_email')
      const storedPhone = sessionStorage.getItem('signup_phone')

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: storedEmail,
          phone: storedPhone,
          purpose: 'signup'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Failed to resend OTP')
      } else {
        const sentEmail = data.sentEmail || storedEmail || email
        setOtpSentToEmail(sentEmail)
        sessionStorage.setItem('otp_sent_email', sentEmail)
        setMessage(`Enter the 4-digit code sent to ${sentEmail}`)
        toast({
          title: "OTP Resent!",
          description: `Please check ${sentEmail} for the new code.`,
        })
      }
    } catch (err) {
      console.error(err)
      setMessage('Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    try {
      const redirectUrl = searchParams?.get('redirect') || '/'
      if (redirectUrl !== '/') {
        localStorage.setItem('oauth_redirect', redirectUrl)
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error('Google signup error:', error)
        setMessage('Error signing up with Google')
        setLoading(false)
      }
    } catch (error) {
      console.error('Google signup error:', error)
      setMessage('Error signing up with Google')
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-[#2D2D2D] p-4 pt-32 pb-16 relative"
      style={{
        backgroundImage: "url('https://ik.imagekit.io/gkkczwgam/hero.webp?updatedAt=1764844020664')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="backdrop-blur-md bg-black/30 border border-[#444444] rounded-2xl shadow-lg p-8 w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white">Register</h1>
          </div>

          {step === 'details' ? (
            <form onSubmit={handleSendOtp}>
              <div className="space-y-5">
                <div>
                  <div className="relative flex items-center">
                    <Input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={e => {
                        setName(e.target.value)
                        if (errors.name) setErrors({ ...errors, name: undefined })
                      }}
                      className={`w-full bg-black/20 border-[#444444] text-white rounded-full pl-12 h-12 ${errors.name ? 'border-red-500' : ''}`}
                      disabled={loading}
                      placeholder="Name"
                    />
                    <div className="absolute left-4 text-white">
                      <User size={20} />
                    </div>
                  </div>
                  {errors.name && <p className="text-red-400 text-xs mt-1 ml-4">{errors.name}</p>}
                </div>

                <div>
                  <div className="relative flex items-center">
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value)
                        if (errors.email) setErrors({ ...errors, email: undefined })
                      }}
                      className={`w-full bg-black/20 border-[#444444] text-white rounded-full pl-12 h-12 ${errors.email ? 'border-red-500' : ''}`}
                      disabled={loading}
                      placeholder="Email"
                    />
                    <div className="absolute left-4 text-white">
                      <Mail size={20} />
                    </div>
                  </div>
                  {errors.email && <p className="text-red-400 text-[10px] sm:text-[11px] leading-tight mt-1 ml-4 whitespace-normal break-words max-w-full">{errors.email}</p>}
                </div>

                <div>
                  <div className="relative flex items-center">
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={e => {
                        setPhone(e.target.value)
                        if (errors.phone) setErrors({ ...errors, phone: undefined })
                      }}
                      className={`w-full bg-black/20 border-[#444444] text-white rounded-full pl-12 h-12 ${errors.phone ? 'border-red-500' : ''}`}
                      disabled={loading}
                      placeholder="Mobile Number"
                    />
                    <div className="absolute left-4 text-white">
                      <Phone size={20} />
                    </div>
                  </div>
                  {errors.phone && <p className="text-red-400 text-[10px] sm:text-[11px] leading-tight mt-1 ml-4 whitespace-normal break-words max-w-full">{errors.phone}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#AE876D] hover:bg-[#8d6c58] text-white font-medium py-2.5 rounded-full"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Continue
                </Button>

                {message && (
                  <div className={`text-sm text-center mt-2 px-4 py-2 rounded-lg ${message.includes('sent') || message.includes('successful') ? 'text-green-400 bg-green-400/10 border border-green-400/20' : 'text-red-400 bg-red-400/10 border border-red-400/20'}`}>
                    {message}
                  </div>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="space-y-5">
                {message && (
                  <div className={`text-[10px] sm:text-xs text-center px-2 sm:px-4 py-2 rounded-lg whitespace-normal break-words sm:whitespace-nowrap sm:break-normal ${message.includes('sent') || message.includes('successful') ? 'text-green-400 bg-green-400/10 border border-green-400/20' : 'text-red-400 bg-red-400/10 border border-red-400/20'}`}>
                    {message}
                  </div>
                )}

                <div>
                  <div className="flex justify-center gap-3">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        required
                        value={digit}
                        onChange={e => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                        onKeyDown={e => handleOtpKeyDown(index, e)}
                        className={`w-14 h-14 bg-black/20 ${errors.otp ? 'border-2 border-red-500' : 'border border-[#444444]'} text-white rounded-lg text-center text-2xl font-mono focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#AE876D] transition-colors`}
                        disabled={loading}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                  {errors.otp && <p className="text-red-400 text-xs mt-2 text-center">{errors.otp}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#AE876D] hover:bg-[#8d6c58] text-white font-medium py-2.5 rounded-full"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify & Create Account
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('details')
                      setOtp(['', '', '', ''])
                      setMessage('')
                    }}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-[#AE876D] hover:underline transition-colors"
                  >
                    Resend OTP
                  </button>
                </div>

              </div>
            </form>
          )}

          {step === 'details' && (
            <>
              <div className="flex items-center gap-3 my-6 text-xs text-white/70">
                <div className="flex-1 h-px bg-[#444444]"></div>
                <span className="tracking-[0.3em] text-white/80">OR</span>
                <div className="flex-1 h-px bg-[#444444]"></div>
              </div>

              <Button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-2.5 rounded-full flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
              </Button>

              <div className="text-center mt-6">
                <p className="text-sm text-white">
                  Already have an account?{' '}
                  <Link href="/login" className="text-[#AE876D] font-medium hover:underline transition-colors">
                    Login
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
