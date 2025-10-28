"use client"

import { useState } from "react"
import { NButton } from "@/components/ui/nbutton"
import { NCard, NCardHeader, NCardTitle, NCardDescription, NCardContent } from "@/components/ui/ncard"
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
  Brain,
  Star,
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
  { name: "Web Development", value: 35, color: "#4299e1" },
  { name: "Data Science", value: 25, color: "#48bb78" },
  { name: "UI/UX Design", value: 20, color: "#ed8936" },
  { name: "Mobile Dev", value: 20, color: "#9f7aea" },
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
            href="/educator/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-base bg-main/10 border-2 border-border text-foreground font-heading"
          >
            <TrendingUp className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            href="/educator/courses"
            className="flex items-center gap-3 px-4 py-3 rounded-base text-foreground hover:bg-main/5 transition-colors font-base"
          >
            <BookOpen className="w-5 h-5" />
            My Courses
          </Link>
          <Link
            href="/educator/students"
            className="flex items-center gap-3 px-4 py-3 rounded-base text-foreground hover:bg-main/5 transition-colors font-base"
          >
            <Users className="w-5 h-5" />
            Students
          </Link>
          <Link
            href="/educator/analytics"
            className="flex items-center gap-3 px-4 py-3 rounded-base text-foreground hover:bg-main/5 transition-colors font-base"
          >
            <TrendingUp className="w-5 h-5" />
            Analytics
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t-2 border-border space-y-2">
          <Link
            href="/educator/settings"
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
              <h1 className="text-3xl font-heading">Educator Dashboard</h1>
            </div>
            <NButton variant="default" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Create Course
            </NButton>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 space-y-8">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            <NCard className="p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-foreground/70 mb-2 font-base">Total Students</p>
                  <p className="text-4xl font-heading">3,780</p>
                  <p className="text-xs text-success mt-2 font-base">↑ 12% from last month</p>
                </div>
                <div className="w-14 h-14 bg-main border-2 border-border rounded-base flex items-center justify-center">
                  <Users className="w-7 h-7 text-main-foreground" />
                </div>
              </div>
            </NCard>

            <NCard className="p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-foreground/70 mb-2 font-base">Total Revenue</p>
                  <p className="text-4xl font-heading">$55,600</p>
                  <p className="text-xs text-success mt-2 font-base">↑ 8% from last month</p>
                </div>
                <div className="w-14 h-14 bg-accent border-2 border-border rounded-base flex items-center justify-center">
                  <DollarSign className="w-7 h-7 text-main-foreground" />
                </div>
              </div>
            </NCard>

            <NCard className="p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-foreground/70 mb-2 font-base">Active Courses</p>
                  <p className="text-4xl font-heading">3</p>
                  <p className="text-xs text-foreground/70 mt-2 font-base">1 draft in progress</p>
                </div>
                <div className="w-14 h-14 bg-success border-2 border-border rounded-base flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-main-foreground" />
                </div>
              </div>
            </NCard>

            <NCard className="p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-foreground/70 mb-2 font-base">Avg Rating</p>
                  <p className="text-4xl font-heading">4.8</p>
                  <p className="text-xs text-foreground/70 mt-2 font-base">Based on 2,450 reviews</p>
                </div>
                <div className="w-14 h-14 bg-main border-2 border-border rounded-base flex items-center justify-center">
                  <Star className="w-7 h-7 text-main-foreground" />
                </div>
              </div>
            </NCard>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-3 gap-6">
            <NCard className="md:col-span-2">
              <NCardHeader>
                <NCardTitle>Student Enrollment Trend</NCardTitle>
                <NCardDescription>Monthly growth overview</NCardDescription>
              </NCardHeader>
              <NCardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={enrollmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.1} />
                    <XAxis dataKey="month" stroke="var(--color-foreground)" className="font-base" />
                    <YAxis stroke="var(--color-foreground)" className="font-base" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-secondary-background)",
                        border: "2px solid var(--color-border)",
                        borderRadius: "var(--border-radius)",
                        fontFamily: "var(--font-sans)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="students"
                      stroke="var(--color-main)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-main)", r: 5, strokeWidth: 2, stroke: "var(--color-border)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </NCardContent>
            </NCard>

            <NCard>
              <NCardHeader>
                <NCardTitle>Course Distribution</NCardTitle>
                <NCardDescription>Student enrollment by course</NCardDescription>
              </NCardHeader>
              <NCardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={coursePerformance} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" stroke="var(--color-border)" strokeWidth={2}>
                      {coursePerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-secondary-background)",
                        border: "2px solid var(--color-border)",
                        borderRadius: "var(--border-radius)",
                        fontFamily: "var(--font-sans)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </NCardContent>
            </NCard>
          </div>

          {/* Courses Table */}
          <NCard>
            <NCardHeader>
              <div className="flex items-center justify-between w-full">
                <div>
                  <NCardTitle>Your Courses</NCardTitle>
                  <NCardDescription>Manage and monitor your courses</NCardDescription>
                </div>
                <NButton variant="default">
                  <Plus className="w-4 h-4 mr-2" />
                  New Course
                </NButton>
              </div>
            </NCardHeader>

            <NCardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="text-left py-4 px-4 font-heading text-sm">Course Name</th>
                      <th className="text-left py-4 px-4 font-heading text-sm">Students</th>
                      <th className="text-left py-4 px-4 font-heading text-sm">Revenue</th>
                      <th className="text-left py-4 px-4 font-heading text-sm">Rating</th>
                      <th className="text-left py-4 px-4 font-heading text-sm">Status</th>
                      <th className="text-left py-4 px-4 font-heading text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr
                        key={course.id}
                        className="border-b-2 border-border hover:bg-main/5 transition-colors"
                        onClick={() => setSelectedCourse(course.id)}
                      >
                        <td className="py-4 px-4">
                          <p className="font-heading">{course.title}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm font-base">{course.students.toLocaleString()}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm font-heading">${course.revenue.toLocaleString()}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm font-base">{course.rating > 0 ? `${course.rating} ⭐` : "N/A"}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-base text-xs font-heading border-2 border-border ${
                              course.status === "Published"
                                ? "bg-success text-main-foreground"
                                : "bg-foreground/10 text-foreground"
                            }`}
                          >
                            {course.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-main/10 rounded-base transition-colors border-2 border-transparent hover:border-border">
                              <Eye className="w-4 h-4 text-foreground" />
                            </button>
                            <button className="p-2 hover:bg-main/10 rounded-base transition-colors border-2 border-transparent hover:border-border">
                              <Edit className="w-4 h-4 text-foreground" />
                            </button>
                            <button className="p-2 hover:bg-destructive/10 rounded-base transition-colors border-2 border-transparent hover:border-border">
                              <MoreVertical className="w-4 h-4 text-foreground" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </NCardContent>
          </NCard>
        </main>
      </div>
    </div>
  )
}
