"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

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
        setTimeout(() => {
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
              <label className="block text-sm font-medium mb-1" htmlFor="resetEmail">
                Email Address
              </label>
              <Input
                id="resetEmail"
                type="email"
                required
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                className="w-full"
                disabled={loading}
                placeholder="Enter your email address"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
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
              <label className="block text-sm font-medium mb-1" htmlFor="resetOtp">
                Verification Code
              </label>
              <Input
                id="resetOtp"
                type="text"
                required
                value={resetOtp}
                onChange={e => setResetOtp(e.target.value)}
                className="w-full"
                disabled={loading}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
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
              <label className="block text-sm font-medium mb-1" htmlFor="newPassword">
                New Password
              </label>
              <Input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full"
                disabled={loading}
                placeholder="Enter your new password"
                minLength={6}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
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
            className="text-sm text-primary hover:underline"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }
  
  const renderLoginForm = () => {
    return (
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="identifier">
            Email or Username
          </label>
          <Input
            id="identifier"
            type="text"
            required
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            className="w-full"
            disabled={loading}
            placeholder="Enter email or username"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full"
            disabled={loading}
            placeholder="Enter your password"
          />
        </div>
        
        <div className="flex justify-end">
          <button 
            type="button" 
            onClick={() => {
              setShowForgotPassword(true)
              setMessage('')
            }}
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </button>
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Log In
        </Button>
      </form>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-serif">Novino</h1>
          <p className="text-muted-foreground mt-2">
            {showForgotPassword ? 'Reset your password' : 'Log in to your account'}
          </p>
        </div>
        
        <div className="bg-card border border-border rounded-lg shadow-sm p-6 w-full">
          {showForgotPassword ? renderForgotPasswordForm() : renderLoginForm()}
          
          {message && (
            <div className={`text-sm text-center mt-4 ${message.includes('successful') ? 'text-green-500' : 'text-destructive'}`}>
              {message}
            </div>
          )}
        </div>
        
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 