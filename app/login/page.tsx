"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useToast } from '@/hooks/use-toast'


// Validation functions
const validateIdentifier = (identifier: string): string | null => {
  if (!identifier) return 'Email or username is required'
  if (identifier.length < 3) return 'Please enter a valid email or username'
  return null
}

const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required'
  if (password.length < 6) return 'Password must be at least 6 characters'
  return null
}

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [errors, setErrors] = useState<{ identifier?: string, password?: string }>({})
  const router = useRouter()
  const searchParams = useSearchParams()
  const { closeCart } = useCart()
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Validate inputs
    const identifierError = validateIdentifier(identifier)
    const passwordError = validatePassword(password)

    if (identifierError || passwordError) {
      setErrors({
        identifier: identifierError || undefined,
        password: passwordError || undefined
      })
      setMessage('Please fix the errors below')
      setLoading(false)
      return
    }

    setErrors({})

    try {
      // Normalize identifier by trimming
      const normalizedIdentifier = identifier.trim()

      // Determine if identifier is email or username
      const isEmail = normalizedIdentifier.includes('@')
      let email = normalizedIdentifier

      // If it's a username, look up the email from profiles table (case-insensitive)
      if (!isEmail) {
        // Normalize username to lowercase for case-insensitive lookup
        const usernameLower = normalizedIdentifier.toLowerCase()

        // Use direct query (RLS policy allows public read of username and email)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', usernameLower)
          .maybeSingle()

        if (profileError) {
          console.error('Profile lookup error:', profileError)
          // Log the error for debugging
          console.error('Error details:', {
            code: profileError.code,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint
          })
          setMessage('Invalid username or password')
          setLoading(false)
          return
        }

        if (!profile || !profile.email) {
          console.error('Profile not found for username:', usernameLower)
          setMessage('Invalid username or password')
          setLoading(false)
          return
        }

        email = profile.email
      }

      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      })

      if (error) {
        console.error('Login error:', error)
        setMessage(error.message || 'Invalid credentials')
        setLoading(false)
        return
      }

      if (!data.session) {
        setMessage('Login failed - no session created')
        setLoading(false)
        return
      }

      // Check if user is blocked
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_blocked')
        .eq('id', data.user.id)
        .single()

      if (profile?.is_blocked) {
        await supabase.auth.signOut()
        setMessage('Your account has been blocked. Please contact support.')
        setLoading(false)
        return
      }

      setMessage('Login successful! Redirecting...')

      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      })

      // Get redirect URL from query params or default to home
      const redirectParam = searchParams?.get('redirect') || '/'
      // Decode the redirect URL (searchParams.get already decodes, but be safe)
      const redirectUrl = redirectParam

      // Sync cart and redirect
      setTimeout(() => {
        closeCart()
        router.push(redirectUrl)
        router.refresh() // Refresh to update auth state
      }, 1000)

    } catch (err) {
      console.error(err)
      setMessage('Network error. Please try again.')
      setLoading(false)
    }
  }


  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      // Get redirect URL from query params
      const redirectUrl = searchParams?.get('redirect') || '/'

      // Store redirect URL in localStorage to retrieve after OAuth callback
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
      // If no error, browser will redirect to Google
    } catch (error) {
      console.error('Google login error:', error)
      setMessage('Error logging in with Google')
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setMessage(error.message || 'Error sending reset email')
      } else {
        setMessage('Password reset email sent! Please check your inbox.')
        toast({
          title: "Email sent",
          description: "Check your inbox for password reset instructions.",
        })
      }
    } catch (err) {
      console.error(err)
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderForgotPasswordForm = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-white/80" htmlFor="resetEmail">
            Email Address
          </label>
          <Input
            id="resetEmail"
            type="email"
            required
            value={resetEmail}
            onChange={e => setResetEmail(e.target.value)}
            className="w-full bg-[#222222] border-[#444444] text-white"
            disabled={loading}
            placeholder="Enter your email address"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-[#AE876D] hover:bg-[#8d6c58] text-white"
          disabled={loading}
          onClick={handleForgotPassword}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Reset Link
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setShowForgotPassword(false)
              setMessage('')
            }}
            className="text-sm text-[#AE876D] hover:underline"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  };

  const renderLoginForm = () => {
    return (
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
                if (errors.identifier) setErrors({ ...errors, identifier: undefined })
              }}
              className={`w-full bg-black/20 border-[#444444] text-white rounded-full pl-12 h-12 ${errors.identifier ? 'border-red-500' : ''}`}
              disabled={loading}
              placeholder="Username or Email"
            />
            <div className="absolute left-4 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
          </div>
          {errors.identifier && <p className="text-red-400 text-xs mt-1 ml-4">{errors.identifier}</p>}
        </div>

        <div>
          <div className="relative flex items-center">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={e => {
                setPassword(e.target.value)
                if (errors.password) setErrors({ ...errors, password: undefined })
              }}
              className={`w-full bg-black/20 border-[#444444] text-white rounded-full pl-12 pr-12 h-12 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${errors.password ? 'border-red-500' : ''}`}
              autoComplete="current-password"
              disabled={loading}
              placeholder="Password"
            />
            <div className="absolute left-4 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-white/70 hover:text-white transition-colors z-10"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs mt-1 ml-4">{errors.password}</p>}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 text-[#AE876D] bg-black/20 border-[#444444] rounded focus:ring-[#AE876D] focus:ring-1"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-white">
              Remember me
            </label>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowForgotPassword(true)
              setMessage('')
            }}
            className="text-sm text-white hover:text-[#AE876D] transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#AE876D] hover:bg-[#8d6c58] text-white font-medium py-2.5 rounded-full"
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Login
        </Button>
      </div>
    );
  };

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
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="backdrop-blur-md bg-black/30 border border-[#444444] rounded-2xl shadow-lg p-8 w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white">Login</h1>
          </div>

          <form onSubmit={handleLogin}>
            {showForgotPassword ? renderForgotPasswordForm() : renderLoginForm()}

            {message && (
              <div className={`text-sm text-center mt-4 px-4 py-2 rounded-lg ${message.includes('successful') || message.includes('sent') ? 'text-green-400 bg-green-400/10 border border-green-400/20' : 'text-red-400 bg-red-400/10 border border-red-400/20'}`}>
                {message}
              </div>
            )}
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-white">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[#AE876D] font-medium hover:underline transition-colors">
                Register
              </Link>
            </p>
          </div>

          {!showForgotPassword && (
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
  );
}