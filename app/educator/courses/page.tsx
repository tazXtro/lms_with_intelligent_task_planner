"use client"

import { useState } from "react"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { NInput } from "@/components/ui/ninput"
import { Plus, Search, BookOpen, Edit, Eye, Brain } from "lucide-react"
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
      <aside className="hidden md:block fixed left-0 top-0 h-screen w-64 bg-secondary-background border-r-4 border-border">
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
            className="flex items-center gap-3 px-4 py-3 rounded-base text-foreground hover:bg-main/5 transition-colors font-base"
          >
            <BookOpen className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            href="/educator/courses"
            className="flex items-center gap-3 px-4 py-3 rounded-base bg-main/10 border-2 border-border text-foreground font-heading"
          >
            <BookOpen className="w-5 h-5" />
            My Courses
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="md:ml-64">
        <header className="sticky top-0 z-30 bg-background border-b-4 border-border">
          <div className="px-6 py-5 flex items-center justify-between">
            <h1 className="text-3xl font-heading">My Courses</h1>
            <NButton variant="default" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Create Course
            </NButton>
          </div>
        </header>

        <main className="p-6">
          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-foreground/50 pointer-events-none" />
                <NInput
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-3">
                {(["all", "published", "draft"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-5 py-2 rounded-base font-heading border-2 border-border transition-all ${
                      filterStatus === status
                        ? "bg-main text-main-foreground shadow-shadow"
                        : "bg-secondary-background text-foreground hover:translate-x-1 hover:translate-y-1"
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
              <NCard key={course.id} className="overflow-hidden hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group cursor-pointer">
                <div className="relative h-48 bg-main/10 overflow-hidden border-b-2 border-border">
                  <img
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-base text-xs font-heading border-2 border-border ${
                        course.status === "Published"
                          ? "bg-success text-main-foreground shadow-shadow"
                          : "bg-foreground/10 text-foreground"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-heading text-xl mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-foreground/70 mb-4 line-clamp-2 font-base">{course.description}</p>

                  <div className="grid grid-cols-3 gap-3 mb-5 text-center">
                    <div className="p-3 bg-main/5 rounded-base border-2 border-border">
                      <p className="text-xs text-foreground/70 font-base">Students</p>
                      <p className="font-heading text-lg">{course.students}</p>
                    </div>
                    <div className="p-3 bg-accent/5 rounded-base border-2 border-border">
                      <p className="text-xs text-foreground/70 font-base">Revenue</p>
                      <p className="font-heading text-lg">${(course.revenue / 1000).toFixed(1)}k</p>
                    </div>
                    <div className="p-3 bg-success/5 rounded-base border-2 border-border">
                      <p className="text-xs text-foreground/70 font-base">Rating</p>
                      <p className="font-heading text-lg">{course.rating || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <NButton variant="neutral" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </NButton>
                    <NButton variant="default" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </NButton>
                  </div>
                </div>
              </NCard>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-main/10 border-2 border-border rounded-base flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-foreground/50" />
              </div>
              <p className="text-foreground/70 font-base text-lg">No courses found</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
