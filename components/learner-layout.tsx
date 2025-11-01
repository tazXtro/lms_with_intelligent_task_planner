"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  TrendingUp,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
  Brain,
  Search,
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

interface LearnerLayoutProps {
  children: React.ReactNode
}

const navItems = [
  { href: "/learner/dashboard", label: "Dashboard", icon: TrendingUp },
  { href: "/learner/courses", label: "My Courses", icon: BookOpen },
  { href: "/learner/browse", label: "Browse Courses", icon: Search },
  { href: "/learner/tasks", label: "Task Planner", icon: Clock },
  { href: "/learner/canvas", label: "Canvas LMS", icon: BookOpen },
]

export function LearnerLayout({ children }: LearnerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-secondary-background border-r-4 border-border transform transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b-2 border-border">
          <Link
            href="/"
            className="flex items-center gap-3 hover:-translate-y-1 transition-transform"
          >
            <div className="w-10 h-10 bg-main border-2 border-border rounded-base flex items-center justify-center shadow-shadow">
              <Brain className="w-6 h-6 text-main-foreground" />
            </div>
            <span className="font-heading text-xl">DigiGyan</span>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-base transition-colors ${
                  isActive
                    ? "bg-main/10 border-2 border-border text-foreground font-heading"
                    : "text-foreground hover:bg-main/5 font-base"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t-2 border-border space-y-2">
          <Link
            href="/learner/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-base text-foreground hover:bg-main/5 transition-colors font-base"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-base text-foreground hover:bg-destructive/10 transition-colors font-base"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="md:ml-64">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-main border-2 border-border rounded-base shadow-shadow"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6 text-main-foreground" />
          ) : (
            <Menu className="w-6 h-6 text-main-foreground" />
          )}
        </button>

        {children}
      </div>
    </div>
  )
}

