"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, BookOpen, Edit, Eye } from "lucide-react"
import Link from "next/link"

const allCourses = [
  {
    id: 1,
    title: "Advanced React Patterns",
    description: "Master advanced React concepts and patterns",
    students: 1240,
    revenue: 24800,
    rating: 4.8,
    status: "Published",
    image: "/react-course.jpg",
  },
  {
    id: 2,
    title: "Python for Data Science",
    description: "Learn data science with Python",
    students: 890,
    revenue: 17800,
    rating: 4.6,
    status: "Published",
    image: "/python-data-science.jpg",
  },
  {
    id: 3,
    title: "UI/UX Design Masterclass",
    description: "Complete guide to modern UI/UX design",
    students: 650,
    revenue: 13000,
    rating: 4.9,
    status: "Published",
    image: "/ui-ux-design-concept.png",
  },
  {
    id: 4,
    title: "Mobile App Development",
    description: "Build native mobile apps",
    students: 0,
    revenue: 0,
    rating: 0,
    status: "Draft",
    image: "/mobile-development.jpg",
  },
]

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all")

  const filteredCourses = allCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || course.status.toLowerCase() === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border">
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
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/10 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            href="/educator/courses"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium"
          >
            <BookOpen className="w-5 h-5" />
            My Courses
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="md:ml-64">
        <header className="sticky top-0 z-30 bg-background border-b border-border">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">My Courses</h1>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </div>
        </header>

        <main className="p-6">
          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
              <div className="flex gap-2">
                {(["all", "published", "draft"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filterStatus === status
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
                  <img
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        course.status === "Published"
                          ? "bg-accent/90 text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description}</p>

                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Students</p>
                      <p className="font-semibold">{course.students}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="font-semibold">${(course.revenue / 1000).toFixed(1)}k</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                      <p className="font-semibold">{course.rating || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button className="flex-1 px-3 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No courses found</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
