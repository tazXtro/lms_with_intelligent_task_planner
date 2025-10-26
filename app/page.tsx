"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShaderAnimation } from "@/components/ui/shader-animation"
import { NavBar } from "@/components/ui/tubelight-navbar"
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline"
import OrbitingSkills from "@/components/ui/orbiting-skills"
import { ContainerAnimated, ContainerStagger, GalleryGrid, GalleryGridCell } from "@/components/ui/cta-section-with-gallery"
import { StackedCircularFooter } from "@/components/ui/stacked-circular-footer"
import { ArrowRight, BookOpen, Brain, Calendar, Users, Zap, CheckCircle2, Star, Home, GraduationCap, DollarSign, Target, TrendingUp, Upload, DollarSignIcon, BarChart3, MessageSquare, Sparkles } from "lucide-react"

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("home")
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeout = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    
    // Set up scroll event for navbar background
    window.addEventListener("scroll", handleScroll, { passive: true })
    
    // Set up IntersectionObserver for section detection
    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px', // Slightly less aggressive detection
      threshold: 0.1 // Require 10% visibility for better accuracy
    }
    
    const observer = new IntersectionObserver((entries) => {
      if (isScrolling) return
      
      // Find the most visible section
      let mostVisible = null
      let maxRatio = 0
      
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio
          mostVisible = entry.target.id
        }
      }
      
      if (mostVisible) {
        setActiveSection(mostVisible)
      }
    }, observerOptions)
    
    // Observe all sections
    const sections = ["home", "features", "for-educators", "for-learners"]
    sections.forEach(section => {
      const element = document.getElementById(section)
      if (element) observer.observe(element)
    })
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
      observer.disconnect()
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    }
  }, [isScrolling])

  const handleNavClick = (sectionId: string, e?: React.MouseEvent<HTMLAnchorElement>) => {
    if (e) e.preventDefault()
    
    const element = document.getElementById(sectionId)
    if (element) {
      // Set scrolling state to prevent intersection observer from interfering
      setIsScrolling(true)
      
      // Update active section immediately for instant feedback
      setActiveSection(sectionId)
      
      const navbarHeight = 80 // Approximate navbar height
      const targetPosition = element.offsetTop - navbarHeight + 1 // Add 1px to ensure we're in the section
      
      // Smooth scroll to the section
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      })
      
      // Clear any existing timeout
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
      
      // Re-enable intersection observer after scroll completes
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false)
      }, 600) // Faster response time for better UX
    }
  }

  const handleNavBarClick = (item: any, e: React.MouseEvent<HTMLAnchorElement>) => {
    const sectionMap: { [key: string]: string } = {
      "Home": "home",
      "Educators": "for-educators", 
      "Learners": "for-learners",
      "Features": "features"
    }
    const sectionId = sectionMap[item.name] || "home"
    handleNavClick(sectionId, e)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 pt-6 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo - Left (no container) */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300 group-hover:scale-105">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tight">
              DigiGyan
            </span>
          </div>
          
          {/* Center Navigation - Tubelight Navbar */}
          <NavBar 
            items={[
              { name: "Home", url: "#home", icon: Home },
              { name: "Educators", url: "#for-educators", icon: GraduationCap },
              { name: "Learners", url: "#for-learners", icon: Users },
              { name: "Features", url: "#features", icon: Sparkles }
            ]}
            activeTab={activeSection === "home" ? "Home" : activeSection === "for-educators" ? "Educators" : activeSection === "for-learners" ? "Learners" : activeSection === "features" ? "Features" : "Home"}
            onItemClick={handleNavBarClick}
            className="hidden md:block"
          />
          
          {/* Auth Buttons - Right in rounded container */}
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-lg py-2 px-4 rounded-full shadow-lg shadow-black/20">
            <Button variant="ghost" className="hidden sm:inline-flex text-white/80 hover:text-white hover:bg-white/10 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300">
              Log In
            </Button>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-full px-5 py-2 text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative flex h-[100vh] w-full flex-col items-center justify-center overflow-hidden">
        <ShaderAnimation />
        <div className="absolute pointer-events-none z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl leading-none font-semibold tracking-tighter text-white mb-6">
            Learn Smarter,
            <br />
            Not Harder
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
            DigiGyan combines world-class courses with AI-powered task planning
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto">
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-base font-semibold shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300">
              Start Learning Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-base border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300">
              Explore Courses
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section - Bento Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0D1426]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Powerful Features for Everyone</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Everything you need to learn, teach, and grow in one integrated platform
            </p>
          </div>

          <BentoGrid className="lg:grid-rows-3">
            <BentoCard
              name="Comprehensive Courses"
              className="lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3"
              background={
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20" />
              }
              Icon={BookOpen}
              description="Access thousands of expertly-crafted courses across all skill levels and industries. Learn from the best educators worldwide."
              href="#"
              cta="Explore Courses"
            />
            <BentoCard
              name="AI Task Planner"
              className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3"
              background={
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-cyan-500/20" />
              }
              Icon={Brain}
              description="Smart AI breaks down complex tasks and creates personalized learning schedules tailored to your pace."
              href="#"
              cta="Try AI Planner"
            />
            <BentoCard
              name="Calendar Integration"
              className="lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4"
              background={
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-teal-500/20" />
              }
              Icon={Calendar}
              description="Sync your learning tasks with Google Calendar for seamless time management."
              href="#"
              cta="Connect Calendar"
            />
            <BentoCard
              name="Progress Analytics"
              className="lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2"
              background={
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20" />
              }
              Icon={TrendingUp}
              description="Track your learning journey with detailed insights and achievement milestones."
              href="#"
              cta="View Analytics"
            />
            <BentoCard
              name="Community Learning"
              className="lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4"
              background={
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-red-500/20 to-pink-500/20" />
              }
              Icon={Users}
              description="Connect with peers, share progress, and learn together in a supportive environment. Build your network."
              href="#"
              cta="Join Community"
            />
          </BentoGrid>
        </div>
      </section>

      {/* For Educators Section */}
      <section id="for-educators" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0D1426] border-t border-white/5 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">For Educators</h2>
              <p className="text-lg text-white/70 leading-relaxed">
                Transform your expertise into engaging courses. DigiGyan provides everything you need to create, manage, and monetize your knowledge.
              </p>
              
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Create Structured Courses</h3>
                    <p className="text-sm text-white/60">Build comprehensive courses with modules, lessons, and assessments</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <Upload className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Rich Content Support</h3>
                    <p className="text-sm text-white/60">Upload videos, PDFs, quizzes, and interactive materials</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Advanced Analytics</h3>
                    <p className="text-sm text-white/60">Track student progress and engagement with detailed insights</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Flexible Monetization</h3>
                    <p className="text-sm text-white/60">Set your own pricing and manage payments seamlessly</p>
                  </div>
                </div>
              </div>

              <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white mt-6">
                Start Teaching <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            {/* Right: Radial Timeline */}
            <div className="relative">
              <RadialOrbitalTimeline
                timelineData={[
                  {
                    id: 1,
                    title: "Setup",
                    date: "Step 1",
                    content: "Create your educator profile and set up your teaching space.",
                    category: "Setup",
                    icon: GraduationCap,
                    relatedIds: [2],
                    status: "completed",
                    energy: 100,
                  },
                  {
                    id: 2,
                    title: "Create",
                    date: "Step 2",
                    content: "Design and structure your course with modules and lessons.",
                    category: "Create",
                    icon: BookOpen,
                    relatedIds: [1, 3],
                    status: "completed",
                    energy: 90,
                  },
                  {
                    id: 3,
                    title: "Upload",
                    date: "Step 3",
                    content: "Add videos, materials, and interactive content to your course.",
                    category: "Upload",
                    icon: Upload,
                    relatedIds: [2, 4],
                    status: "in-progress",
                    energy: 70,
                  },
                  {
                    id: 4,
                    title: "Publish",
                    date: "Step 4",
                    content: "Launch your course and start enrolling students.",
                    category: "Publish",
                    icon: Target,
                    relatedIds: [3, 5],
                    status: "pending",
                    energy: 40,
                  },
                  {
                    id: 5,
                    title: "Grow",
                    date: "Step 5",
                    content: "Engage with students, track analytics, and earn revenue.",
                    category: "Grow",
                    icon: TrendingUp,
                    relatedIds: [4],
                    status: "pending",
                    energy: 20,
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* For Learners Section */}
      <section id="for-learners" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0D1426] border-t border-white/5 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">For Learners</h2>
              <p className="text-lg text-white/70 leading-relaxed">
                Master new skills with personalized learning paths. Our AI assistant helps you stay organized, motivated, and on track to achieve your goals.
              </p>
              
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Thousands of Courses</h3>
                    <p className="text-sm text-white/60">Browse and enroll in expertly-crafted courses across all topics</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">AI-Powered Planning</h3>
                    <p className="text-sm text-white/60">Get personalized task breakdowns and learning schedules</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Smart Scheduling</h3>
                    <p className="text-sm text-white/60">Sync with Google Calendar and receive intelligent reminders</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Progress Tracking</h3>
                    <p className="text-sm text-white/60">Monitor your learning journey with detailed analytics</p>
                  </div>
                </div>
              </div>

              <Button size="lg" className="bg-purple-500 hover:bg-purple-600 text-white mt-6">
                Start Learning <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            {/* Right: Orbiting Skills */}
            <div className="relative">
              <OrbitingSkills />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0D1426] border-t border-white/5 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-purple-500/5 to-transparent pointer-events-none"></div>
        <div className="mx-auto w-full max-w-6xl grid grid-cols-1 items-center gap-8 md:grid-cols-2 relative z-10">
          <ContainerStagger>
            <ContainerAnimated className="mb-4 block text-xs font-medium text-cyan-400 md:text-sm uppercase tracking-wider">
              Transform Your Future
            </ContainerAnimated>
            <ContainerAnimated className="text-4xl font-semibold md:text-[2.4rem] tracking-tight text-white">
              Ready to Start Your Learning Journey?
            </ContainerAnimated>
            <ContainerAnimated className="my-4 text-base text-white/70 md:my-6 md:text-lg leading-relaxed">
              Join thousands of educators and learners already using DigiGyan to achieve their goals. 
              Start learning today with AI-powered planning, expert courses, and a supportive community.
            </ContainerAnimated>
            <ContainerAnimated className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300">
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300">
                Schedule Demo
              </Button>
            </ContainerAnimated>
          </ContainerStagger>

          <GalleryGrid>
            {[
              "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2487&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2487&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2487&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=2487&auto=format&fit=crop",
            ].map((imageUrl, index) => (
              <GalleryGridCell index={index} key={index}>
                <img
                  className="size-full object-cover object-center"
                  width="100%"
                  height="100%"
                  src={imageUrl}
                  alt="Learning experience"
                />
              </GalleryGridCell>
            ))}
          </GalleryGrid>
        </div>
      </section>

      {/* Footer */}
      <StackedCircularFooter />
    </div>
  )
}
