"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, User } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useToast } from '@/hooks/use-toast'

// Validation
const validateIdentifier = (input: string): string | null => {
  if (!input) return 'Email or phone number is required'
  
  const trimmed = input.trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isEmail = emailRegex.test(trimmed)
  
  if (isEmail) {
    if (trimmed.length > 254) return 'Email is too long'
    return null
  }
  
  // Check if it's a valid phone number
  const cleanedPhone = trimmed.replace(/[\s\-+]/g, '')
  if (!/^[0-9]{10,12}$/.test(cleanedPhone)) {
    return 'Please enter a valid email or 10-digit phone number'
  }
  
  return null
}

const validateOtp = (otp: string): string | null => {
  if (!otp) return 'OTP is required'
  if (!/^[0-9]{4}$/.test(otp)) return 'OTP must be 4 digits'
  return null
}

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'input' | 'otp'>('input')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpType, setOtpType] = useState<'email' | 'phone'>('email')
  const [errors, setErrors] = useState<{ identifier?: string, otp?: string }>({})
  const router = useRouter()
  const searchParams = useSearchParams()
  const { closeCart } = useCart()
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const identifierError = validateIdentifier(identifier)
    if (identifierError) {
      setErrors({ identifier: identifierError })
      setMessage('Please fix the errors below')
      setLoading(false)
      return
    }

    setErrors({})

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          purpose: 'login'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ identifier: data.error })
        setMessage(data.error || 'Failed to send OTP')
        setLoading(false)
        return
      }

      setOtpType(data.type || 'email')
      sessionStorage.setItem('login_identifier', identifier.trim())

      setMessage(`OTP sent to your ${data.type === 'phone' ? 'phone' : 'email'}!`)
      toast({
        title: "OTP Sent!",
        description: `Please check your ${data.type === 'phone' ? 'phone' : 'email'} for the 4-digit code.`,
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

    const otpError = validateOtp(otp)
    if (otpError) {
      setErrors({ otp: otpError })
      setMessage('Please enter a valid OTP')
      setLoading(false)
      return
    }

    setErrors({})

    try {
      const storedIdentifier = sessionStorage.getItem('login_identifier') || identifier.trim()

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: storedIdentifier,
          otp: otp,
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
      const storedIdentifier = sessionStorage.getItem('login_identifier') || identifier.trim()

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
        setMessage(`OTP resent to your ${data.type === 'phone' ? 'phone' : 'email'}!`)
        toast({
          title: "OTP Resent!",
          description: "Please check for the new code.",
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

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-[#2D2D2D] p-4 relative"
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
            <h1 className="text-4xl font-bold text-white">Login</h1>
            {step === 'otp' && (
              <p className="text-white/70 mt-2 text-sm">
                Enter the 4-digit code sent to your {otpType === 'phone' ? 'phone' : 'email'}
              </p>
            )}
          </div>

          {step === 'input' ? (
            <form onSubmit={handleSendOtp}>
              <div className="space-y-5">
                <div>
                  <div className="relative flex items-center">
                    <Input
                      id="identifier"
                      type="text"
                      required
                      value={identifier}
                      onChange={e => {
                        setIdentifier(e.target.value)
                        if (errors.identifier) setErrors({})
                      }}
                      className={`w-full bg-black/20 border-[#444444] text-white rounded-full pl-12 h-12 ${errors.identifier ? 'border-red-500' : ''}`}
                      disabled={loading}
                      placeholder="Email or Phone Number"
                    />
                    <div className="absolute left-4 text-white">
                      <User size={20} />
                    </div>
                  </div>
                  {errors.identifier && <p className="text-red-400 text-xs mt-1 ml-4">{errors.identifier}</p>}
                  <p className="text-white/50 text-xs mt-2 ml-4">
                    Enter your registered email or phone number
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#AE876D] hover:bg-[#8d6c58] text-white font-medium py-2.5 rounded-full"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send OTP
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
                <div>
                  <div className="relative flex items-center justify-center">
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      required
                      value={otp}
                      onChange={e => {
                        const value = e.target.value.replace(/\D/g, '')
                        setOtp(value)
                        if (errors.otp) setErrors({})
                      }}
                      className={`w-full bg-black/20 border-[#444444] text-white rounded-full h-14 text-center text-3xl tracking-[0.8em] font-mono ${errors.otp ? 'border-red-500' : ''}`}
                      disabled={loading}
                      placeholder="0000"
                      autoFocus
                    />
                  </div>
                  {errors.otp && <p className="text-red-400 text-xs mt-1 text-center">{errors.otp}</p>}
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
                      setOtp('')
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

                {message && (
                  <div className={`text-sm text-center mt-2 px-4 py-2 rounded-lg ${message.includes('sent') || message.includes('successful') ? 'text-green-400 bg-green-400/10 border border-green-400/20' : 'text-red-400 bg-red-400/10 border border-red-400/20'}`}>
                    {message}
                  </div>
                )}
              </div>
            </form>
          )}

          <div className="text-center mt-6">
            <p className="text-sm text-white">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[#AE876D] font-medium hover:underline transition-colors">
                Register
              </Link>
            </p>
          </div>

          {step === 'input' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#444444]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-black/30 text-white/60">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-2.5 rounded-full flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Login with Google
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
