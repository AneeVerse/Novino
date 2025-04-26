"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function SignupPage() {
  const [stage, setStage] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
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
    
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password, otp }),
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
          email,
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#2D2D2D] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">Novino</h1>
          <p className="text-white/60 mt-2">Create your account</p>
        </div>
        
        <div className="bg-[#333333] border border-[#444444] rounded-lg shadow-sm p-6 w-full">
          <form onSubmit={stage === 'email' ? handleSendOtp : handleSignup}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white/80" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#222222] border-[#444444] text-white"
                  disabled={stage === 'otp' || loading}
                  placeholder="you@example.com"
                />
              </div>
              
              {stage === 'email' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-white/80" htmlFor="username">
                      Username
                    </label>
                    <Input
                      id="username"
                      type="text"
                      required
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full bg-[#222222] border-[#444444] text-white"
                      disabled={loading}
                      placeholder="Choose a username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-white/80" htmlFor="password">
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-[#222222] border-[#444444] text-white"
                      disabled={loading}
                      placeholder="Create a password"
                    />
                  </div>
                </>
              )}
              
              {stage === 'otp' && (
                <div>
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium mb-1 text-white/80" htmlFor="otp">
                      Verification Code
                    </label>
                    <button 
                      type="button" 
                      onClick={resendOtp} 
                      className="text-xs text-[#AE876D] hover:underline"
                      disabled={loading}
                    >
                      Resend Code
                    </button>
                  </div>
                  <Input
                    id="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    className="w-full bg-[#222222] border-[#444444] text-white"
                    disabled={loading}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-[#AE876D] hover:bg-[#8d6c58] text-white" 
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
        </div>
        
        <div className="text-center mt-6">
          <p className="text-sm text-white/60">
            Already have an account?{' '}
            <Link href="/login" className="text-[#AE876D] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 