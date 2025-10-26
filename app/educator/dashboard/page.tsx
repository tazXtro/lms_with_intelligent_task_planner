"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Plus,
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  MoreVertical,
  Edit,
  Eye,
} from "lucide-react"
import Link from "next/link"

const enrollmentData = [
  { month: "Jan", students: 120 },
  { month: "Feb", students: 240 },
  { month: "Mar", students: 380 },
  { month: "Apr", students: 520 },
  { month: "May", students: 680 },
  { month: "Jun", students: 850 },
]

const coursePerformance = [
  { name: "Web Development", value: 35, color: "#8b5cf6" },
  { name: "Data Science", value: 25, color: "#f97316" },
  { name: "UI/UX Design", value: 20, color: "#06b6d4" },
  { name: "Mobile Dev", value: 20, color: "#ec4899" },
]

const courses = [
  {
    id: 1,
    title: "Advanced React Patterns",
    students: 1240,
    revenue: 24800,
    rating: 4.8,
    status: "Published",
  },
  {
    id: 2,
    title: "Python for Data Science",
    students: 890,
    revenue: 17800,
    rating: 4.6,
    status: "Published",
  },
  {
    id: 3,
    title: "UI/UX Design Masterclass",
    students: 650,
    revenue: 13000,
    rating: 4.9,
    status: "Published",
  },
  {
    id: 4,
    title: "Mobile App Development",
    students: 0,
    revenue: 0,
    rating: 0,
    status: "Draft",
  },
]

export default function EducatorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null)

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
            href="/educator/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium"
          >
            <TrendingUp className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            href="/educator/courses"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/10 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            My Courses
          </Link>
          <Link
            href="/educator/students"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/10 transition-colors"
          >
            <Users className="w-5 h-5" />
            Students
          </Link>
          <Link
            href="/educator/analytics"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/10 transition-colors"
          >
            <TrendingUp className="w-5 h-5" />
            Analytics
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border space-y-2">
          <Link
            href="/educator/settings"
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
            <h1 className="text-2xl font-bold">Educator Dashboard</h1>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 space-y-8">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total Students</p>
                  <p className="text-3xl font-bold">3,780</p>
                  <p className="text-xs text-accent mt-2">+12% from last month</p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
                  <p className="text-3xl font-bold">$55,600</p>
                  <p className="text-xs text-accent mt-2">+8% from last month</p>
                </div>
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-accent" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Active Courses</p>
                  <p className="text-3xl font-bold">3</p>
                  <p className="text-xs text-secondary mt-2">1 draft in progress</p>
                </div>
                <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Avg Rating</p>
                  <p className="text-3xl font-bold">4.8</p>
                  <p className="text-xs text-primary mt-2">Based on 2,450 reviews</p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Student Enrollment Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: `1px solid var(--color-border)`,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="students"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-primary)", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Course Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={coursePerformance} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value">
                    {coursePerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: `1px solid var(--color-border)`,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Courses Table */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Your Courses</h3>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                New Course
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Course Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Students</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Revenue</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Rating</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr
                      key={course.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedCourse(course.id)}
                    >
                      <td className="py-4 px-4">
                        <p className="font-medium">{course.title}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm">{course.students.toLocaleString()}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-medium">${course.revenue.toLocaleString()}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm">{course.rating > 0 ? `${course.rating} ⭐` : "N/A"}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            course.status === "Published"
                              ? "bg-accent/20 text-accent"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {course.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <Edit className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}
