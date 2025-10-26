"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Search, BookOpen, Star, Filter } from "lucide-react"
import Link from "next/link"

const allCourses = [
  {
    id: 1,
    title: "Advanced React Patterns",
    instructor: "Sarah Chen",
    category: "Web Development",
    progress: 65,
    lessons: 24,
    completed: 16,
    rating: 4.8,
    students: 1240,
    image: "/react-course.jpg",
    enrolled: true,
  },
  {
    id: 2,
    title: "Python for Data Science",
    instructor: "Dr. James Wilson",
    category: "Data Science",
    progress: 42,
    lessons: 32,
    completed: 13,
    rating: 4.6,
    students: 890,
    image: "/python-data-science.jpg",
    enrolled: true,
  },
  {
    id: 3,
    title: "UI/UX Design Masterclass",
    instructor: "Emma Rodriguez",
    category: "Design",
    progress: 88,
    lessons: 20,
    completed: 18,
    rating: 4.9,
    students: 650,
    image: "/ui-ux-design-concept.png",
    enrolled: true,
  },
  {
    id: 4,
    title: "Mobile App Development",
    instructor: "Alex Kumar",
    category: "Mobile",
    progress: 0,
    lessons: 28,
    completed: 0,
    rating: 4.7,
    students: 2500,
    image: "/mobile-development.jpg",
    enrolled: false,
  },
  {
    id: 5,
    title: "Web Design Fundamentals",
    instructor: "Lisa Anderson",
    category: "Web Development",
    progress: 0,
    lessons: 18,
    completed: 0,
    rating: 4.8,
    students: 3200,
    image: "/web-design.jpg",
    enrolled: false,
  },
  {
    id: 6,
    title: "JavaScript Advanced Concepts",
    instructor: "Mark Thompson",
    category: "Web Development",
    progress: 0,
    lessons: 25,
    completed: 0,
    rating: 4.6,
    students: 1800,
    image: "/javascript-advanced.jpg",
    enrolled: false,
  },
]

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterEnrolled, setFilterEnrolled] = useState<"all" | "enrolled" | "available">("all")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = Array.from(new Set(allCourses.map((c) => c.category)))

  const filteredCourses = allCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesEnrolled =
      filterEnrolled === "all" || (filterEnrolled === "enrolled" ? course.enrolled : !course.enrolled)
    const matchesCategory = !selectedCategory || course.category === selectedCategory
    return matchesSearch && matchesEnrolled && matchesCategory
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
            href="/learner/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/10 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            href="/learner/courses"
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
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold mb-4">Explore Courses</h1>
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
                {(["all", "enrolled", "available"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterEnrolled(filter)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      filterEnrolled === filter
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="grid md:grid-cols-4 gap-6">
            {/* Sidebar Filters */}
            <div className="hidden md:block">
              <Card className="p-4 sticky top-24">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Categories
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      !selectedCategory
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Courses Grid */}
            <div className="md:col-span-3">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
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
                      {course.enrolled && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-accent/90 text-accent-foreground">
                            Enrolled
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="mb-2">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                          {course.category}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg mb-1 line-clamp-2">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{course.instructor}</p>

                      {course.enrolled && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium">Progress</span>
                            <span className="text-xs font-medium text-primary">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <span>
                          {course.enrolled
                            ? `${course.completed}/${course.lessons} lessons`
                            : `${course.lessons} lessons`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-accent text-accent" />
                          {course.rating}
                        </span>
                      </div>

                      <Button
                        className={`w-full ${
                          course.enrolled
                            ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                            : "bg-accent hover:bg-accent/90 text-accent-foreground"
                        }`}
                      >
                        {course.enrolled ? "Continue" : "Enroll Now"}
                      </Button>
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
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
