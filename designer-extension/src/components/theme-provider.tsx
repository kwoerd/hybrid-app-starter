"use client"
// Simple theme provider - no next-themes needed
import React from "react"

interface ThemeProviderProps {
  children: React.ReactNode
  [key: string]: any
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <div className="dark" {...props}>
      {children}
    </div>
  )
}
