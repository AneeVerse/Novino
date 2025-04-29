"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetOtp, setResetOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resetStage, setResetStage] = useState<'email' | 'otp' | 'newPassword'>('email')
  const router = useRouter()
  const { closeCart } = useCart()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })
      const data = await res.json()
      
      if (res.ok) {
        setMessage('Login successful! Redirecting...')
        
        // Sync cart by triggering a page reload (which will trigger cart context's sync logic)
        // Will execute after this function due to the timeout
        setTimeout(() => {
          closeCart() // Close cart drawer before redirecting
          router.push('/')
        }, 1500)
      } else {
        setMessage(data.message || 'Login failed')
      }
    } catch (err) {
      console.error(err)
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: resetEmail,
          purpose: 'reset'
        }),
      })
      const data = await res.json()
      
      if (res.ok) {
        setMessage(`OTP sent to ${resetEmail}. Please check your inbox.`)
        setResetStage('otp')
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: resetEmail,
          otp: resetOtp,
          purpose: 'reset'
        }),
      })
      const data = await res.json()
      
      if (res.ok) {
        setMessage('OTP verified. Enter your new password.')
        setResetStage('newPassword')
      } else {
        setMessage(data.message || 'Invalid OTP')
      }
    } catch (err) {
      console.error(err)
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: resetEmail,
          password: newPassword,
          otp: resetOtp
        }),
      })
      const data = await res.json()
      
      if (res.ok) {
        setMessage('Password reset successful! You can now login.')
        setShowForgotPassword(false)
        setIdentifier(resetEmail)
        setPassword('')
      } else {
        setMessage(data.message || 'Password reset failed')
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
        {resetStage === 'email' && (
          <>
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
              onClick={handleSendResetOtp}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Verification Code
            </Button>
          </>
        )}
        
        {resetStage === 'otp' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1 text-white/80" htmlFor="resetOtp">
                Verification Code
              </label>
              <Input
                id="resetOtp"
                type="text"
                required
                value={resetOtp}
                onChange={e => setResetOtp(e.target.value)}
                className="w-full bg-[#222222] border-[#444444] text-white"
                disabled={loading}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#AE876D] hover:bg-[#8d6c58] text-white" 
              disabled={loading}
              onClick={handleVerifyOtp}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Code
            </Button>
          </>
        )}
        
        {resetStage === 'newPassword' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1 text-white/80" htmlFor="newPassword">
                New Password
              </label>
              <Input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-[#222222] border-[#444444] text-white"
                disabled={loading}
                placeholder="Enter your new password"
                minLength={6}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#AE876D] hover:bg-[#8d6c58] text-white" 
              disabled={loading}
              onClick={handleResetPassword}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </>
        )}
        
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
              onChange={e => setIdentifier(e.target.value)}
              className="w-full bg-black/20 border-[#444444] text-white rounded-full pl-12 h-12"
              disabled={loading}
              placeholder="Username"
            />
            <div className="absolute left-4 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
          </div>
        </div>
        
        <div>
          <div className="relative flex items-center">
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-black/20 border-[#444444] text-white rounded-full pl-12 h-12"
              disabled={loading}
              placeholder="Password"
            />
            <div className="absolute left-4 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
          </div>
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
            <h1 className="text-4xl font-bold text-white">Login</h1>
          </div>
          
          <form onSubmit={handleLogin}>
            {showForgotPassword ? renderForgotPasswordForm() : renderLoginForm()}
            
            {message && (
              <div className={`text-sm text-center mt-4 ${message.includes('successful') ? 'text-green-400' : 'text-red-400'}`}>
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
        </div>
      </div>
    </div>
  );
} 