"use client"

import { useState } from "react"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Clock,
  CheckCircle2,
  TrendingUp,
  Menu,
  X,
  LogOut,
  Settings,
  Search,
  Star,
  Play,
  ArrowRight,
  Brain,
} from "lucide-react"
import Link from "next/link"

const enrolledCourses = [
  {
    id: 1,
    title: "Advanced React Patterns",
    instructor: "Sarah Chen",
    progress: 65,
    lessons: 24,
    completed: 16,
    rating: 4.8,
    image: "/react-course.jpg",
  },
  {
    id: 2,
    title: "Python for Data Science",
    instructor: "Dr. James Wilson",
    progress: 42,
    lessons: 32,
    completed: 13,
    rating: 4.6,
    image: "/python-data-science.jpg",
  },
  {
    id: 3,
    title: "UI/UX Design Masterclass",
    instructor: "Emma Rodriguez",
    progress: 88,
    lessons: 20,
    completed: 18,
    rating: 4.9,
    image: "/ui-ux-design-concept.png",
  },
]

const recommendedCourses = [
  {
    id: 4,
    title: "Mobile App Development",
    instructor: "Alex Kumar",
    rating: 4.7,
    students: 2500,
    price: 49.99,
    image: "/mobile-development.jpg",
  },
  {
    id: 5,
    title: "Web Design Fundamentals",
    instructor: "Lisa Anderson",
    rating: 4.8,
    students: 3200,
    price: 39.99,
    image: "/web-design.jpg",
  },
  {
    id: 6,
    title: "JavaScript Advanced Concepts",
    instructor: "Mark Thompson",
    rating: 4.6,
    students: 1800,
    price: 44.99,
    image: "/javascript-advanced.jpg",
  },
]

export default function LearnerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const totalProgress = Math.round(
    enrolledCourses.reduce((sum, course) => sum + course.progress, 0) / enrolledCourses.length,
  )
  const totalLessonsCompleted = enrolledCourses.reduce((sum, course) => sum + course.completed, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-secondary-background border-r-4 border-border transform transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b-2 border-border">
          <Link href="/" className="flex items-center gap-3 hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 bg-main border-2 border-border rounded-base flex items-center justify-center shadow-shadow">
              <Brain className="w-6 h-6 text-main-foreground" />
            </div>
            <span className="font-heading text-xl">DigiGyan</span>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            href="/learner/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-base bg-main/10 border-2 border-border text-foreground font-heading"
          >
            <TrendingUp className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            href="/learner/courses"
            className="flex items-center gap-3 px-4 py-3 rounded-base text-foreground hover:bg-main/5 transition-colors font-base"
          >
            <BookOpen className="w-5 h-5" />
            My Courses
          </Link>
          <Link
            href="/learner/tasks"
            className="flex items-center gap-3 px-4 py-3 rounded-base text-foreground hover:bg-main/5 transition-colors font-base"
          >
            <Clock className="w-5 h-5" />
            Task Planner
          </Link>
          <Link
            href="/learner/progress"
            className="flex items-center gap-3 px-4 py-3 rounded-base text-foreground hover:bg-main/5 transition-colors font-base"
          >
            <TrendingUp className="w-5 h-5" />
            Progress
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t-2 border-border space-y-2">
          <Link
            href="/learner/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-base text-foreground hover:bg-main/5 transition-colors font-base"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-base text-foreground hover:bg-destructive/10 transition-colors font-base">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background border-b-4 border-border">
          <div className="px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-main/10 rounded-base transition-colors border-2 border-border"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="text-3xl font-heading">Learning Dashboard</h1>
            </div>
            <NButton variant="neutral" size="icon">
              <Search className="w-5 h-5" />
            </NButton>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 space-y-8">
          {/* Welcome Section */}
          <NCard className="p-8 bg-main/5 border-main/20">
            <h2 className="text-4xl font-heading mb-3">Welcome back, Learner!</h2>
            <p className="text-foreground/70 mb-6 font-base text-lg">
              You're making great progress. Keep up the momentum and continue learning!
            </p>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-foreground/70 font-base mb-1">Overall Progress</p>
                <p className="text-5xl font-heading text-main">{totalProgress}%</p>
              </div>
              <div className="flex-1 bg-secondary-background border-2 border-border rounded-base p-3">
                <Progress value={totalProgress} className="h-4" />
              </div>
            </div>
          </NCard>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            <NCard className="p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-foreground/70 mb-2 font-base">Courses Enrolled</p>
                  <p className="text-4xl font-heading">{enrolledCourses.length}</p>
                  <p className="text-xs text-success mt-2 font-base">Active learning</p>
                </div>
                <div className="w-14 h-14 bg-main border-2 border-border rounded-base flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-main-foreground" />
                </div>
              </div>
            </NCard>

            <NCard className="p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-foreground/70 mb-2 font-base">Lessons Completed</p>
                  <p className="text-4xl font-heading">{totalLessonsCompleted}</p>
                  <p className="text-xs text-success mt-2 font-base">Keep going!</p>
                </div>
                <div className="w-14 h-14 bg-accent border-2 border-border rounded-base flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-main-foreground" />
                </div>
              </div>
            </NCard>

            <NCard className="p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-foreground/70 mb-2 font-base">Learning Streak</p>
                  <p className="text-4xl font-heading">12</p>
                  <p className="text-xs text-foreground/70 mt-2 font-base">Days in a row</p>
                </div>
                <div className="w-14 h-14 bg-success border-2 border-border rounded-base flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-main-foreground" />
                </div>
              </div>
            </NCard>

            <NCard className="p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-foreground/70 mb-2 font-base">Avg Rating</p>
                  <p className="text-4xl font-heading">4.8</p>
                  <p className="text-xs text-foreground/70 mt-2 font-base">Course quality</p>
                </div>
                <div className="w-14 h-14 bg-main border-2 border-border rounded-base flex items-center justify-center">
                  <Star className="w-7 h-7 text-main-foreground" />
                </div>
              </div>
            </NCard>
          </div>

          {/* Enrolled Courses */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl font-heading">Your Courses</h3>
              <Link href="/learner/courses">
                <NButton variant="neutral">View All</NButton>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <NCard
                  key={course.id}
                  className="overflow-hidden hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group cursor-pointer"
                >
                  <div className="relative h-48 bg-main/10 overflow-hidden border-b-2 border-border">
                    <img
                      src={course.image || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 bg-main border-2 border-border rounded-base flex items-center justify-center">
                        <Play className="w-8 h-8 text-main-foreground" />
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <h4 className="font-heading text-xl mb-1 line-clamp-2">{course.title}</h4>
                    <p className="text-sm text-foreground/70 mb-4 font-base">{course.instructor}</p>

                    <div className="mb-4 p-3 bg-main/5 rounded-base border-2 border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-heading">Progress</span>
                        <span className="text-xs font-heading text-main">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-xs text-foreground/70 mb-4 font-base">
                      <span>
                        {course.completed}/{course.lessons} lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-accent text-accent" />
                        {course.rating}
                      </span>
                    </div>

                    <NButton className="w-full" variant="default">
                      Continue Learning <ArrowRight className="ml-2 w-4 h-4" />
                    </NButton>
                  </div>
                </NCard>
              ))}
            </div>
          </div>

          {/* Recommended Courses */}
          <div>
            <h3 className="text-3xl font-heading mb-6">Recommended For You</h3>

            <div className="grid md:grid-cols-3 gap-6">
              {recommendedCourses.map((course) => (
                <NCard
                  key={course.id}
                  className="overflow-hidden hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group cursor-pointer"
                >
                  <div className="relative h-48 bg-main/10 overflow-hidden border-b-2 border-border">
                    <img
                      src={course.image || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="p-5">
                    <h4 className="font-heading text-xl mb-1 line-clamp-2">{course.title}</h4>
                    <p className="text-sm text-foreground/70 mb-4 font-base">{course.instructor}</p>

                    <div className="flex items-center justify-between mb-4 p-3 bg-accent/5 rounded-base border-2 border-border">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-accent text-accent" />
                        <span className="text-sm font-heading">{course.rating}</span>
                        <span className="text-xs text-foreground/70 font-base">({course.students.toLocaleString()})</span>
                      </div>
                      <span className="text-xl font-heading text-main">${course.price}</span>
                    </div>

                    <NButton className="w-full" variant="accent">
                      Enroll Now <ArrowRight className="ml-2 w-4 h-4" />
                    </NButton>
                  </div>
                </NCard>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
