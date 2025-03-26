"use client"

import Link from "next/link"
import { Brain } from "lucide-react"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"

export default function Header() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  // Don't show header on login page
  if (pathname === "/login") return null

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Interactive Skills Enhancer</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className={`text-sm font-medium ${pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Dashboard
          </Link>
          <Link
            href="/emotion"
            className={`text-sm font-medium ${pathname === "/emotion" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Emotion Analysis
          </Link>
          <Link
            href="/face-detection"
            className={`text-sm font-medium ${pathname === "/face-detection" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Face Detection
          </Link>
          {user ? (
            <Button variant="outline" size="sm" onClick={signOut}>
              Logout
            </Button>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

