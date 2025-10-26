"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type UserType = "educator" | "learner"

export interface User {
  id: string
  email: string
  name: string
  userType: UserType
  createdAt: Date
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string, userType: UserType) => Promise<void>
  signUp: (name: string, email: string, password: string, userType: UserType) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in (from localStorage or session)
    const storedUser = localStorage.getItem("digigyan_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse stored user:", error)
      }
    }
    setIsLoading(false)
  }, [])

  const signIn = async (email: string, password: string, userType: UserType) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: email.split("@")[0],
        userType,
        createdAt: new Date(),
      }

      setUser(newUser)
      localStorage.setItem("digigyan_user", JSON.stringify(newUser))
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (name: string, email: string, password: string, userType: UserType) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        userType,
        createdAt: new Date(),
      }

      setUser(newUser)
      localStorage.setItem("digigyan_user", JSON.stringify(newUser))
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setUser(null)
      localStorage.removeItem("digigyan_user")
    } finally {
      setIsLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
