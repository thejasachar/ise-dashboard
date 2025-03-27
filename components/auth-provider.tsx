"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

type User = {
  id: string
  name: string
  email: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true)
        // First check for token in localStorage
        const token = localStorage.getItem("token")
        if (!token) {
          setLoading(false)
          return
        }

        // If we have a token, try to get user data from localStorage as a fallback
        const storedUser = localStorage.getItem("ise-user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
        
        // In a real app, you would verify the token with the backend here
        // const response = await fetch("http://localhost:5000/api/verify-token", {
        //   headers: {
        //     Authorization: Bearer ${token}
        //   }
        // })
        // if (response.ok) {
        //   const userData = await response.json()
        //   setUser(userData.user)
        // } else {
        //   localStorage.removeItem("token")
        //   localStorage.removeItem("ise-user")
        // }
      } catch (error) {
        console.error("Auth check error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      // Make the API call to the backend
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Login failed")
      }

      const data = await response.json()
      
      // Save the token to localStorage
      localStorage.setItem("token", data.token)
      
      // Save the user data
      const userData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
      }
      
      localStorage.setItem("ise-user", JSON.stringify(userData))
      setUser(userData)

      toast({
        title: "Login successful",
        description: "Welcome back to Interactive Skills Enhancer!",
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      })
      console.error("Error logging in:", error)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true)
      
      // Make the API call to the backend
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Registration failed")
      }

      const data = await response.json()

      toast({
        title: "Registration successful",
        description: "You can now log in to your account.",
      })

      // After registration, automatically log the user in
      await signIn(email, password)
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again with different credentials.",
        variant: "destructive",
      })
      console.error("Error registering:", error)
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("ise-user")
    setUser(null)
    router.push("/")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}