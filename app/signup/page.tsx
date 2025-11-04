"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, User, Lock, KeyRound } from 'lucide-react'
import { signIn } from 'next-auth/react'

// Validation functions
const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) return 'Email is required'
  if (!emailRegex.test(email)) return 'Please enter a valid email address'
  if (email.length > 254) return 'Email is too long'
  return null
}

const validateUsername = (username: string): string | null => {
  if (!username) return 'Username is required'
  if (username.length < 3) return 'Username must be at least 3 characters'
  if (username.length > 30) return 'Username must be less than 30 characters'
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) return 'Username can only contain letters, numbers, underscores, and hyphens'
  if (/^[0-9]/.test(username)) return 'Username cannot start with a number'
  return null
}

const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (password.length > 128) return 'Password is too long'
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter'
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character'
  return null
}

export default function SignupPage() {
  const [stage, setStage] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{email?: string, username?: string, password?: string}>({})
  const router = useRouter()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    // Validate inputs
    const emailError = validateEmail(email)
    const usernameError = validateUsername(username)
    const passwordError = validatePassword(password)
    
    if (emailError || usernameError || passwordError) {
      setErrors({
        email: emailError || undefined,
        username: usernameError || undefined,
        password: passwordError || undefined
      })
      setMessage('Please fix the errors below')
      setLoading(false)
      return
    }
    
    setErrors({})
    
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(),
          purpose: 'signup'
        }),
      })
      const data = await res.json()
      
      if (res.ok) {
        setMessage(`OTP sent to ${email}. Please check your inbox.`)
        setStage('otp')
      } else {
        setMessage(data.message || 'Error sending OTP')
      }
    } catch (err) {
      console.error(err)
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    if (!otp || otp.length !== 6) {
      setMessage('Please enter a valid 6-digit OTP')
      setLoading(false)
      return
    }
    
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(),
          username: username.trim(),
          password,
          otp: otp.trim()
        }),
      })
      const data = await res.json()
      
      if (res.ok) {
        setMessage('Signup successful! Redirecting to login...')
        setTimeout(() => {
          router.push('/login')
        }, 1500)
      } else {
        setMessage(data.message || 'Signup failed')
      }
    } catch (err) {
      console.error(err)
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(),
          purpose: 'signup'
        }),
      })
      const data = await res.json()
      
      if (res.ok) {
        setMessage(`New OTP sent to ${email}. Please check your inbox.`)
      } else {
        setMessage(data.message || 'Error sending OTP')
      }
    } catch (err) {
      console.error(err)
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    try {
      await signIn('google', { callbackUrl: '/' })
    } catch (error) {
      console.error('Google signup error:', error)
      setMessage('Error signing up with Google')
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center bg-[#2D2D2D] p-4 relative"
      style={{
        backgroundImage: "url('/loginbg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="backdrop-blur-md bg-black/30 border border-[#444444] rounded-2xl shadow-lg p-8 w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white">Register</h1>
          </div>
          
          <form onSubmit={stage === 'email' ? handleSendOtp : handleSignup}>
            <div className="space-y-5">
              <div>
                <div className="relative flex items-center">
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors({...errors, email: undefined})
                    }}
                    className={`w-full bg-black/20 border-[#444444] text-white rounded-full pl-12 h-12 ${errors.email ? 'border-red-500' : ''}`}
                    disabled={stage === 'otp' || loading}
                    placeholder="Email"
                  />
                  <div className="absolute left-4 text-white">
                    <Mail size={20} />
                  </div>
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1 ml-4">{errors.email}</p>}
              </div>
              
              {stage === 'email' && (
                <>
                  <div>
                    <div className="relative flex items-center">
                      <Input
                        id="username"
                        type="text"
                        required
                        value={username}
                        onChange={e => {
                          setUsername(e.target.value)
                          if (errors.username) setErrors({...errors, username: undefined})
                        }}
                        className={`w-full bg-black/20 border-[#444444] text-white rounded-full pl-12 h-12 ${errors.username ? 'border-red-500' : ''}`}
                        disabled={loading}
                        placeholder="Username"
                      />
                      <div className="absolute left-4 text-white">
                        <User size={20} />
                      </div>
                    </div>
                    {errors.username && <p className="text-red-400 text-xs mt-1 ml-4">{errors.username}</p>}
                  </div>
                  
                  <div>
                    <div className="relative flex items-center">
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={e => {
                          setPassword(e.target.value)
                          if (errors.password) setErrors({...errors, password: undefined})
                        }}
                        className={`w-full bg-black/20 border-[#444444] text-white rounded-full pl-12 h-12 ${errors.password ? 'border-red-500' : ''}`}
                        disabled={loading}
                        placeholder="Password"
                      />
                      <div className="absolute left-4 text-white">
                        <Lock size={20} />
                      </div>
                    </div>
                    {errors.password && <p className="text-red-400 text-xs mt-1 ml-4">{errors.password}</p>}
                    {!errors.password && password && (
                      <p className="text-xs text-white/60 mt-1 ml-4">
                        Min 8 chars, with uppercase, lowercase, number & special character
                      </p>
                    )}
                  </div>
                </>
              )}
              
              {stage === 'otp' && (
                <div>
                  <div className="relative flex items-center">
                    <Input
                      id="otp"
                      type="text"
                      required
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      className="w-full bg-black/20 border-[#444444] text-white rounded-full pl-12 h-12"
                      disabled={loading}
                      placeholder="Verification Code"
                      maxLength={6}
                    />
                    <div className="absolute left-4 text-white">
                      <KeyRound size={20} />
                    </div>
                  </div>
                  <div className="text-right mt-2">
                    <button 
                      type="button" 
                      onClick={resendOtp} 
                      className="text-sm text-white hover:text-[#AE876D] transition-colors"
                      disabled={loading}
                    >
                      Resend Code
                    </button>
                  </div>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-[#AE876D] hover:bg-[#8d6c58] text-white font-medium py-2.5 rounded-full" 
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {stage === 'email' ? 'Continue' : 'Create Account'}
              </Button>
              
              {message && (
                <div className={`text-sm text-center mt-2 ${message.includes('successful') ? 'text-green-400' : 'text-red-400'}`}>
                  {message}
                </div>
              )}
            </div>
          </form>
          
          <div className="text-center mt-6">
            <p className="text-sm text-white">
              Already have an account?{' '}
              <Link href="/login" className="text-[#AE876D] font-medium hover:underline transition-colors">
                Login
              </Link>
            </p>
          </div>

          {stage === 'email' && (
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
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-2.5 rounded-full flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign up with Google
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 