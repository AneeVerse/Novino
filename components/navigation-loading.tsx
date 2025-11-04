"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"
import Preloader from "@/components/ui/preloader"

export default function NavigationLoading() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const prevPathnameRef = useRef(pathname)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Only show loading if pathname actually changed
    if (prevPathnameRef.current !== pathname) {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }

      setLoading(true)
      prevPathnameRef.current = pathname

      // Hide loading after page transition completes
      // This gives time for the new page to render
      loadingTimeoutRef.current = setTimeout(() => {
        setLoading(false)
      }, 300)

      return () => {
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current)
        }
      }
    }
  }, [pathname])

  if (!loading) return null

  return <Preloader ariaLabel="Loading Page" />
}

