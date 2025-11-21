"use client"

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
    const router = useRouter()
    const processedRef = useRef(false)

    useEffect(() => {
        const handleCallback = async () => {
            // Prevent double execution in React Strict Mode
            if (processedRef.current) return
            processedRef.current = true

            const supabase = createClientComponentClient()

            // Get the code from the URL
            const params = new URLSearchParams(window.location.search)
            const code = params.get('code')

            if (code) {
                // Exchange the code for a session
                const { error } = await supabase.auth.exchangeCodeForSession(code)

                if (error) {
                    console.error('Error exchanging code for session:', error)
                    // If we get an error, it might be because the session was already established
                    // by the first strict-mode pass. Let's check if we have a session.
                    const { data: { session } } = await supabase.auth.getSession()

                    if (session) {
                        // We are actually logged in! Redirect to home
                        router.push('/')
                        router.refresh()
                        return
                    }

                    router.push('/login?error=auth_callback_error')
                    return
                }

                // Successfully authenticated, redirect to home
                router.push('/')
                router.refresh()
            } else {
                // No code, might be an error or direct access
                router.push('/login')
            }
        }

        handleCallback()
    }, [router])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#2D2D2D] p-4">
            <div className="text-center">
                <Loader2 className="w-12 h-12 text-[#AE876D] animate-spin mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Completing sign in...</h2>
                <p className="text-white/60">Please wait while we redirect you.</p>
            </div>
        </div>
    )
}
