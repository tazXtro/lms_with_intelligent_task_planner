"use client"

import { useEffect } from "react"
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
  Calendar,
  Mic,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { useLearnerSidebar } from "@/components/sidebar-context"

interface LearnerLayoutProps {
  children: React.ReactNode
}

const navItems = [
  { href: "/learner/dashboard", label: "Dashboard", icon: TrendingUp },
  { href: "/learner/courses", label: "My Courses", icon: BookOpen },
  { href: "/learner/browse", label: "Browse Courses", icon: Search },
  { href: "/learner/tasks", label: "Task Planner", icon: Clock },
  { href: "/learner/calendar", label: "Calendar", icon: Calendar },
  { href: "/learner/canvas", label: "Canvas LMS", icon: BookOpen },
  { href: "/learner/ai-interview", label: "AI Interview", icon: Mic },
]

export function LearnerLayout({ children }: LearnerLayoutProps) {
  const { collapsed: sidebarCollapsed, setCollapsed: setSidebarCollapsed, mobileOpen: sidebarOpen, setMobileOpen: setSidebarOpen, isHydrated } = useLearnerSidebar()
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  // Close mobile sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname, setSidebarOpen])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
  }

  const sidebarWidth = sidebarCollapsed ? "w-20" : "w-64"
  const mainContentMargin = sidebarCollapsed ? "md:ml-20" : "md:ml-64"

  // Prevent hydration mismatch by not rendering until hydrated
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="md:ml-64 transition-all duration-300 ease-in-out">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen ${sidebarWidth} bg-secondary-background border-r-4 border-border transform transition-all duration-300 ease-in-out z-40 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
      >
        <div className={`border-b-2 border-border transition-all duration-300 ${sidebarCollapsed ? "p-3" : "p-6"
          }`}>
          <div className={`flex items-center transition-all duration-300 ${sidebarCollapsed ? "flex-col gap-2" : "justify-between"
            }`}>
            <Link
              href="/"
              className={`flex items-center gap-3 hover:opacity-80 transition-opacity ${sidebarCollapsed ? "justify-center w-full" : ""
                }`}
            >
              <div className={`bg-main border-2 border-border rounded-base flex items-center justify-center shadow-shadow flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? "w-8 h-8" : "w-10 h-10"
                }`}>
                <Brain className={`text-main-foreground transition-all duration-300 ${sidebarCollapsed ? "w-4 h-4" : "w-6 h-6"
                  }`} />
              </div>
              <span className={`font-heading text-xl transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                }`}>
                DigiGyan
              </span>
            </Link>
            {/* Desktop collapse button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`hidden md:flex items-center justify-center rounded-base border-2 border-border hover:bg-main/10 active:bg-main/20 transition-all duration-300 flex-shrink-0 z-10 relative ${sidebarCollapsed ? "w-7 h-7 mt-1" : "w-8 h-8"
                }`}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <nav className={`transition-all duration-300 ${sidebarCollapsed ? "p-2 space-y-1" : "p-4 space-y-2"
          }`}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  className={`flex items-center rounded-base transition-all duration-300 relative ${sidebarCollapsed
                      ? "justify-center px-0 py-2.5"
                      : "gap-3 px-4 py-3"
                    } ${isActive
                      ? sidebarCollapsed
                        ? "bg-main/20"
                        : "bg-main/10 border-2 border-border text-foreground font-heading"
                      : "text-foreground hover:bg-main/5 font-base"
                    }`}
                >
                  <Icon className={`flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? "w-5 h-5" : "w-5 h-5"
                    }`} />
                  <span className={`transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? "opacity-0 w-0 overflow-hidden absolute" : "opacity-100 relative"
                    }`}>
                    {item.label}
                  </span>
                  {/* Active indicator for collapsed state */}
                  {sidebarCollapsed && isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-main rounded-r-full" />
                  )}
                </Link>
                {/* Tooltip for collapsed state */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-foreground text-background text-sm font-base rounded-base shadow-shadow border-2 border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                    {item.label}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-0 h-0 border-t-4 border-t-transparent border-r-4 border-r-foreground border-b-4 border-b-transparent" />
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className={`absolute bottom-0 left-0 right-0 border-t-2 border-border transition-all duration-300 ${sidebarCollapsed ? "p-2 space-y-1" : "p-4 space-y-2"
          }`}>
          <div className="relative group">
            <Link
              href="/learner/settings"
              className={`flex items-center rounded-base text-foreground hover:bg-main/5 transition-all duration-300 ${sidebarCollapsed
                  ? "justify-center px-0 py-2.5"
                  : "gap-3 px-4 py-3"
                }`}
            >
              <Settings className={`flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? "w-5 h-5" : "w-5 h-5"
                }`} />
              <span className={`transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? "opacity-0 w-0 overflow-hidden absolute" : "opacity-100 relative"
                }`}>
                Settings
              </span>
            </Link>
            {/* Tooltip for collapsed state */}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-3 py-1.5 bg-foreground text-background text-sm font-base rounded-base shadow-shadow border-2 border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                Settings
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-0 h-0 border-t-4 border-t-transparent border-r-4 border-r-foreground border-b-4 border-b-transparent" />
              </div>
            )}
          </div>
          <div className="relative group">
            <button
              onClick={handleSignOut}
              className={`w-full flex items-center rounded-base text-foreground hover:bg-destructive/10 transition-all duration-300 ${sidebarCollapsed
                  ? "justify-center px-0 py-2.5"
                  : "gap-3 px-4 py-3"
                }`}
            >
              <LogOut className={`flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? "w-5 h-5" : "w-5 h-5"
                }`} />
              <span className={`transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? "opacity-0 w-0 overflow-hidden absolute" : "opacity-100 relative"
                }`}>
                Sign Out
              </span>
            </button>
            {/* Tooltip for collapsed state */}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-3 py-1.5 bg-foreground text-background text-sm font-base rounded-base shadow-shadow border-2 border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                Sign Out
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-0 h-0 border-t-4 border-t-transparent border-r-4 border-r-foreground border-b-4 border-b-transparent" />
              </div>
            )}
          </div>
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
      <div className={`${mainContentMargin} transition-all duration-300 ease-in-out`}>
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

