"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // If already authenticated, redirect to dashboard
        router.push('/dashboard')
      } else {
        // If not authenticated, redirect to login
        router.push('/admin/login')
      }
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1E1E1E]">
      <div className="text-white text-xl">
        Redirecting...
      </div>
    </div>
  )
} 