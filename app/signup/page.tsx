"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, User, Lock, KeyRound } from 'lucide-react'

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
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-black/20 border-[#444444] text-white rounded-full pl-12 h-12"
                    disabled={stage === 'otp' || loading}
                    placeholder="Email"
                  />
                  <div className="absolute left-4 text-white">
                    <Mail size={20} />
                  </div>
                </div>
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
                        onChange={e => setUsername(e.target.value)}
                        className="w-full bg-black/20 border-[#444444] text-white rounded-full pl-12 h-12"
                        disabled={loading}
                        placeholder="Username"
                      />
                      <div className="absolute left-4 text-white">
                        <User size={20} />
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
                        <Lock size={20} />
                      </div>
                    </div>
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
        </div>
      </div>
    </div>
  )
} 