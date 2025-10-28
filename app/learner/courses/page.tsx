"use client"

import { useState } from "react"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { NInput } from "@/components/ui/ninput"
import { Progress } from "@/components/ui/progress"
import { Search, BookOpen, Star, Filter, Brain } from "lucide-react"
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
            href="/learner/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-base text-foreground hover:bg-main/5 transition-colors font-base"
          >
            <BookOpen className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            href="/learner/courses"
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
          <div className="px-6 py-5">
            <h1 className="text-3xl font-heading mb-5">Explore Courses</h1>
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
                {(["all", "enrolled", "available"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterEnrolled(filter)}
                    className={`px-4 py-2 rounded-base font-heading border-2 border-border transition-all whitespace-nowrap ${
                      filterEnrolled === filter
                        ? "bg-main text-main-foreground shadow-shadow"
                        : "bg-secondary-background text-foreground hover:translate-x-1 hover:translate-y-1"
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
              <NCard className="p-4 sticky top-32">
                <h3 className="font-heading text-lg mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Categories
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-3 py-2 rounded-base transition-all border-2 ${
                      !selectedCategory
                        ? "bg-main/10 text-foreground font-heading border-border"
                        : "text-foreground/70 hover:bg-main/5 border-transparent font-base"
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-base transition-all border-2 ${
                        selectedCategory === category
                          ? "bg-main/10 text-foreground font-heading border-border"
                          : "text-foreground/70 hover:bg-main/5 border-transparent font-base"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </NCard>
            </div>

            {/* Courses Grid */}
            <div className="md:col-span-3">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
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
                      {course.enrolled && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-block px-3 py-1 rounded-base text-xs font-heading bg-accent text-main-foreground border-2 border-border shadow-shadow">
                            Enrolled
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="mb-2">
                        <span className="text-xs font-heading text-main bg-main/10 px-3 py-1 rounded-base border-2 border-border">
                          {course.category}
                        </span>
                      </div>
                      <h3 className="font-heading text-xl mb-1 line-clamp-2">{course.title}</h3>
                      <p className="text-sm text-foreground/70 mb-4 font-base">{course.instructor}</p>

                      {course.enrolled && (
                        <div className="mb-4 p-3 bg-main/5 rounded-base border-2 border-border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-heading">Progress</span>
                            <span className="text-xs font-heading text-main">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-foreground/70 mb-4 font-base p-3 bg-accent/5 rounded-base border-2 border-border">
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

                      <NButton
                        className="w-full"
                        variant={course.enrolled ? "default" : "accent"}
                      >
                        {course.enrolled ? "Continue" : "Enroll Now"}
                      </NButton>
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
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
