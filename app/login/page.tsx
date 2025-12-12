"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, User, Mail, Phone as PhoneIcon } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useToast } from '@/hooks/use-toast'

// Enhanced validation with security checks
const validateEmail = (input: string): string | null => {
  if (!input) return 'Email is required'
  
  const trimmed = input.trim().toLowerCase()
  
  // Check for dangerous characters that might be used for injection
  const dangerousChars = ['<', '>', '"', "'", '\\', ';', '--', '/*', '*/', 'script']
  for (const char of dangerousChars) {
    if (trimmed.toLowerCase().includes(char)) {
      return 'Input contains invalid characters'
    }
  }
  
  // Enhanced email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  const isEmail = emailRegex.test(trimmed)
  
  if (!isEmail) {
    return 'Please enter a valid email address'
  }
  
  // Email validation
  if (trimmed.length < 3) return 'Email is too short'
  if (trimmed.length > 254) return 'Email is too long'
  if (trimmed.includes('..')) return 'Email contains invalid consecutive dots'
  
  const [localPart, domain] = trimmed.split('@')
  if (!domain || !domain.includes('.')) {
    return 'Email domain is invalid'
  }
  
  return null
}

const validatePhone = (input: string): string | null => {
  if (!input) return 'Phone number is required'
  
  const cleaned = input.replace(/[\s\-+]/g, '')
  if (!/^[0-9]{10,12}$/.test(cleaned)) {
    return 'Please enter a valid 10-digit phone number'
  }
  
  return null
}

const validateOtp = (otp: string): string | null => {
  if (!otp) return 'OTP is required'
  if (!/^[0-9]{4}$/.test(otp)) return 'OTP must be 4 digits'
  return null
}

export default function LoginPage() {
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [step, setStep] = useState<'input' | 'otp'>('input')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string, phone?: string, otp?: string }>({})
  const [otpSentToEmail, setOtpSentToEmail] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { closeCart } = useCart()
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const identifier = loginType === 'email' ? email : phone
    const validationError = loginType === 'email' ? validateEmail(email) : validatePhone(phone)
    
    if (validationError) {
      setErrors(loginType === 'email' ? { email: validationError } : { phone: validationError })
      setMessage('Please fix the errors below')
      setLoading(false)
      return
    }

    setErrors({})

    try {
      // For now, temporarily only send OTP to registered email (even for phone login)
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginType === 'email' ? email.trim() : phone.trim(),
          purpose: 'login'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // If user not found, redirect to register with error
        if (response.status === 404) {
          const errorIdentifier = loginType === 'email' ? email.trim() : phone.trim()
          router.push(`/signup?error=not_registered&identifier=${encodeURIComponent(errorIdentifier)}&type=${loginType}`)
          return
        }
        setErrors(loginType === 'email' ? { email: data.error } : { phone: data.error })
        setMessage(data.error || 'Failed to send OTP')
        setLoading(false)
        return
      }

      // Store the email where OTP was sent
      const sentEmail = data.sentEmail || (loginType === 'email' ? email.trim() : '')
      setOtpSentToEmail(sentEmail)

      sessionStorage.setItem('login_identifier', identifier.trim())
      sessionStorage.setItem('login_type', loginType)
      sessionStorage.setItem('otp_sent_email', sentEmail)

      setMessage(`Enter the 4-digit code sent to ${sentEmail}`)
      toast({
        title: "OTP Sent!",
        description: `Please check ${sentEmail} for the 4-digit code.`,
      })
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
      const storedIdentifier = sessionStorage.getItem('login_identifier') || (loginType === 'email' ? email.trim() : phone.trim())

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: storedIdentifier,
          otp: otpString,
          purpose: 'login'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Invalid OTP. Please try again.')
        setLoading(false)
        return
      }

      // Auto-login with token
      if (data.token_hash) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: data.token_hash,
          type: 'magiclink'
        })

        if (verifyError) {
          console.error('Session error:', verifyError)
          setMessage('Login failed. Please try again.')
          setLoading(false)
          return
        }
      }

      sessionStorage.removeItem('login_identifier')
      sessionStorage.removeItem('login_type')

      setMessage('Login successful!')
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      })

      const redirectParam = searchParams?.get('redirect') || '/'

      setTimeout(() => {
        closeCart()
        router.push(redirectParam)
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
      const storedIdentifier = sessionStorage.getItem('login_identifier') || (loginType === 'email' ? email.trim() : phone.trim())

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: storedIdentifier,
          purpose: 'login'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Failed to resend OTP')
      } else {
        const sentEmail = data.sentEmail || storedIdentifier
        setOtpSentToEmail(sentEmail)
        sessionStorage.setItem('otp_sent_email', sentEmail)
        setMessage(`Enter the 4-digit code sent to ${sentEmail}`)
        toast({
          title: "OTP Resent!",
          description: "Please check your email for the new code.",
        })
      }
    } catch (err) {
      console.error(err)
      setMessage('Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
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
        console.error('Google login error:', error)
        setMessage('Error logging in with Google')
        setLoading(false)
      }
    } catch (error) {
      console.error('Google login error:', error)
      setMessage('Error logging in with Google')
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
      className="min-h-screen flex flex-col items-center justify-center bg-[#2D2D2D] p-4 pt-10 pb-8 relative"
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
            <h1 className={`font-bold text-white ${step === 'otp' ? 'text-3xl' : 'text-4xl'}`}>
              {step === 'input' ? 'Login' : `Continue with ${loginType === 'email' ? 'Email' : 'Phone'}`}
            </h1>
          </div>

          {step === 'input' ? (
            <form onSubmit={handleSendOtp}>
              <div className="space-y-5">
                {loginType === 'email' ? (
                  <div>
                    <div className="relative flex items-center">
                      <Input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={e => {
                          setEmail(e.target.value)
                          if (errors.email) setErrors({})
                        }}
                        className={`w-full bg-black/20 border-[#444444] text-white rounded-full pl-12 h-12 ${errors.email ? 'border-red-500' : ''}`}
                        disabled={loading}
                        placeholder="Email"
                      />
                      <div className="absolute left-4 text-white">
                        <Mail size={20} />
                      </div>
                    </div>
                    {errors.email && <p className="text-red-400 text-xs mt-1 ml-4">{errors.email}</p>}
                  </div>
                ) : (
                  <div>
                    <div className="relative flex items-center">
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={e => {
                          setPhone(e.target.value)
                          if (errors.phone) setErrors({})
                        }}
                        className={`w-full bg-black/20 border-[#444444] text-white rounded-full pl-12 h-12 ${errors.phone ? 'border-red-500' : ''}`}
                        disabled={loading}
                        placeholder="Phone Number"
                      />
                      <div className="absolute left-4 text-white">
                        <PhoneIcon size={20} />
                      </div>
                    </div>
                    {errors.phone && <p className="text-red-400 text-xs mt-1 ml-4">{errors.phone}</p>}
                  </div>
                )}

                <p className="text-white/60 text-[10px] leading-tight px-4 text-center whitespace-normal break-words sm:whitespace-nowrap sm:break-normal">
                  By clicking on Continue, I accept the{' '}
                  <Link href="/terms-conditions?from=login" className="text-[#AE876D] hover:underline">
                    Terms & Conditions
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy-policy?from=login" className="text-[#AE876D] hover:underline">
                    Privacy Policy
                  </Link>.
                </p>

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
                  <div className={`text-xs text-center px-4 py-2 rounded-lg whitespace-nowrap ${message.includes('sent') || message.includes('successful') ? 'text-green-400 bg-green-400/10 border border-green-400/20' : 'text-red-400 bg-red-400/10 border border-red-400/20'}`}>
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
                  Verify & Login
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('input')
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

          {step === 'input' && (
            <>
              <div className="flex items-center gap-3 my-6 text-xs text-white/70">
                <div className="flex-1 h-px bg-[#444444]"></div>
                <span className="tracking-[0.3em] text-white/80">OR</span>
                <div className="flex-1 h-px bg-[#444444]"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="bg-white hover:bg-gray-100 text-gray-900 font-medium py-2.5 rounded-full flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </Button>

                <Button
                  type="button"
                  onClick={() => setLoginType(loginType === 'email' ? 'phone' : 'email')}
                  disabled={loading}
                  className="bg-[#444444] hover:bg-[#555555] text-white font-medium py-2.5 rounded-full flex items-center justify-center gap-2"
                >
                  {loginType === 'email' ? (
                    <>
                      <PhoneIcon size={18} />
                      Phone
                    </>
                  ) : (
                    <>
                      <Mail size={18} />
                      Email
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center mt-6">
                <p className="text-sm text-white">
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-[#AE876D] font-medium hover:underline transition-colors">
                    Register
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
