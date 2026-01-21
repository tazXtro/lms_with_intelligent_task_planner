"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface SidebarContextType {
  // Learner sidebar state
  learnerSidebarCollapsed: boolean
  setLearnerSidebarCollapsed: (collapsed: boolean) => void
  learnerMobileSidebarOpen: boolean
  setLearnerMobileSidebarOpen: (open: boolean) => void
  
  // Educator sidebar state
  educatorSidebarCollapsed: boolean
  setEducatorSidebarCollapsed: (collapsed: boolean) => void
  educatorMobileSidebarOpen: boolean
  setEducatorMobileSidebarOpen: (open: boolean) => void
  
  // Hydration state
  isHydrated: boolean
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

interface SidebarProviderProps {
  children: ReactNode
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  // Initialize with default collapsed state (false) - will be updated from localStorage after hydration
  const [learnerSidebarCollapsed, setLearnerSidebarCollapsedState] = useState(false)
  const [learnerMobileSidebarOpen, setLearnerMobileSidebarOpen] = useState(false)
  
  const [educatorSidebarCollapsed, setEducatorSidebarCollapsedState] = useState(false)
  const [educatorMobileSidebarOpen, setEducatorMobileSidebarOpen] = useState(false)
  
  // Track hydration to prevent flash
  const [isHydrated, setIsHydrated] = useState(false)

  // Load saved state from localStorage on mount (client-side only)
  useEffect(() => {
    // Load learner sidebar state
    const savedLearnerState = localStorage.getItem("learner-sidebar-collapsed")
    if (savedLearnerState !== null) {
      setLearnerSidebarCollapsedState(JSON.parse(savedLearnerState))
    }
    
    // Load educator sidebar state
    const savedEducatorState = localStorage.getItem("educator-sidebar-collapsed")
    if (savedEducatorState !== null) {
      setEducatorSidebarCollapsedState(JSON.parse(savedEducatorState))
    }
    
    // Mark as hydrated
    setIsHydrated(true)
  }, [])

  // Persist learner sidebar state to localStorage
  const setLearnerSidebarCollapsed = (collapsed: boolean) => {
    setLearnerSidebarCollapsedState(collapsed)
    localStorage.setItem("learner-sidebar-collapsed", JSON.stringify(collapsed))
  }

  // Persist educator sidebar state to localStorage
  const setEducatorSidebarCollapsed = (collapsed: boolean) => {
    setEducatorSidebarCollapsedState(collapsed)
    localStorage.setItem("educator-sidebar-collapsed", JSON.stringify(collapsed))
  }

  return (
    <SidebarContext.Provider
      value={{
        learnerSidebarCollapsed,
        setLearnerSidebarCollapsed,
        learnerMobileSidebarOpen,
        setLearnerMobileSidebarOpen,
        educatorSidebarCollapsed,
        setEducatorSidebarCollapsed,
        educatorMobileSidebarOpen,
        setEducatorMobileSidebarOpen,
        isHydrated,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

// Hook for learner sidebar specifically
export function useLearnerSidebar() {
  const context = useSidebar()
  return {
    collapsed: context.learnerSidebarCollapsed,
    setCollapsed: context.setLearnerSidebarCollapsed,
    mobileOpen: context.learnerMobileSidebarOpen,
    setMobileOpen: context.setLearnerMobileSidebarOpen,
    isHydrated: context.isHydrated,
  }
}

// Hook for educator sidebar specifically
export function useEducatorSidebar() {
  const context = useSidebar()
  return {
    collapsed: context.educatorSidebarCollapsed,
    setCollapsed: context.setEducatorSidebarCollapsed,
    mobileOpen: context.educatorMobileSidebarOpen,
    setMobileOpen: context.setEducatorMobileSidebarOpen,
    isHydrated: context.isHydrated,
  }
}
