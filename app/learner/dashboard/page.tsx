"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">DigiGyan</span>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            href="/learner/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium"
          >
            <TrendingUp className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            href="/learner/courses"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/10 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            My Courses
          </Link>
          <Link
            href="/learner/tasks"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/10 transition-colors"
          >
            <Clock className="w-5 h-5" />
            Task Planner
          </Link>
          <Link
            href="/learner/progress"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/10 transition-colors"
          >
            <TrendingUp className="w-5 h-5" />
            Progress
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border space-y-2">
          <Link
            href="/learner/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/10 transition-colors"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-destructive/10 transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background border-b border-border">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-2xl font-bold">Learning Dashboard</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-8 border border-primary/20">
            <h2 className="text-3xl font-bold mb-2">Welcome back, Learner!</h2>
            <p className="text-muted-foreground mb-4">
              You're making great progress. Keep up the momentum and continue learning!
            </p>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="text-3xl font-bold text-primary">{totalProgress}%</p>
              </div>
              <Progress value={totalProgress} className="flex-1 h-3" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Courses Enrolled</p>
                  <p className="text-3xl font-bold">{enrolledCourses.length}</p>
                  <p className="text-xs text-accent mt-2">Active learning</p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Lessons Completed</p>
                  <p className="text-3xl font-bold">{totalLessonsCompleted}</p>
                  <p className="text-xs text-accent mt-2">Keep going!</p>
                </div>
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-accent" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Learning Streak</p>
                  <p className="text-3xl font-bold">12</p>
                  <p className="text-xs text-secondary mt-2">Days in a row</p>
                </div>
                <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Avg Rating</p>
                  <p className="text-3xl font-bold">4.8</p>
                  <p className="text-xs text-primary mt-2">Course quality</p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>
          </div>

          {/* Enrolled Courses */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Your Courses</h3>
              <Link href="/learner/courses">
                <Button variant="outline">View All</Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <Card
                  key={course.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
                >
                  <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
                    <img
                      src={course.image || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>

                  <div className="p-4">
                    <h4 className="font-semibold text-lg mb-1 line-clamp-2">{course.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{course.instructor}</p>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium">Progress</span>
                        <span className="text-xs font-medium text-primary">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span>
                        {course.completed}/{course.lessons} lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-accent text-accent" />
                        {course.rating}
                      </span>
                    </div>

                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Continue Learning <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recommended Courses */}
          <div>
            <h3 className="text-2xl font-bold mb-6">Recommended For You</h3>

            <div className="grid md:grid-cols-3 gap-6">
              {recommendedCourses.map((course) => (
                <Card
                  key={course.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
                >
                  <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
                    <img
                      src={course.image || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="p-4">
                    <h4 className="font-semibold text-lg mb-1 line-clamp-2">{course.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{course.instructor}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-accent text-accent" />
                        <span className="text-sm font-medium">{course.rating}</span>
                        <span className="text-xs text-muted-foreground">({course.students.toLocaleString()})</span>
                      </div>
                      <span className="text-lg font-bold text-primary">${course.price}</span>
                    </div>

                    <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                      Enroll Now <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
