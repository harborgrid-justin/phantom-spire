'use client'

import { useEffect, useState } from 'react'

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function FadeIn({ children, delay = 0, className = '' }: FadeInProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div className={`${className} ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
      {children}
    </div>
  )
}
