"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && !redirecting) {
      setRedirecting(true)
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router, redirecting])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // Hardcoded admin authentication
      const hardcodedAdminEmail = 'business@novino.io'
      const hardcodedAdminPassword = 'Dontchangeme@01'

      if (email === hardcodedAdminEmail && password === hardcodedAdminPassword) {
        // Store a flag in localStorage to remember admin is logged in
        localStorage.setItem('adminAuthToken', 'admin-authenticated')
        
        setMessage('Login successful! Redirecting...')
        setRedirecting(true)
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        setMessage('Invalid admin credentials')
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
            <h1 className="text-4xl font-bold text-white">Admin Login</h1>
          </div>

          <form onSubmit={handleLogin}>
            <div className="space-y-5">
              <div>
                <div className="relative flex items-center">
                  <Input
                    id="email"
                    type="text"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-black/20 border-[#444444] text-white rounded-full pl-12 h-12"
                    disabled={loading}
                    placeholder="Admin Email"
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
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-black/20 border-[#444444] text-white rounded-full pl-12 pr-12 h-12"
                    disabled={loading}
                    placeholder="Admin Password"
                  />
                  <div className="absolute left-4 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-white hover:text-[#AE876D] transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#AE876D] hover:bg-[#8d6c58] text-white font-medium py-2.5 rounded-full"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
              </Button>

              {message && (
                <div className={`text-sm text-center mt-4 ${message.includes('successful') ? 'text-green-400' : 'text-red-400'}`}>
                  {message}
                </div>
              )}
            </div>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-white">
              Go back to{' '}
              <a href="/" className="text-[#AE876D] font-medium hover:underline transition-colors">
                Main Site
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}