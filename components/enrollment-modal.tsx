"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Star, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface EnrollmentModalProps {
  course: {
    id: string
    title: string
    instructor: string
    price: number
    rating: number
    students: number
    lessons: number
    description: string
    image: string
  }
  onClose: () => void
}

export function EnrollmentModal({ course, onClose }: EnrollmentModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Enroll in Course</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Course Preview */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <img
                src={course.image || "/placeholder.svg"}
                alt={course.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-bold mb-2">{course.title}</h3>
              <p className="text-muted-foreground mb-4">{course.instructor}</p>
              <p className="text-sm mb-6">{course.description}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 fill-accent text-accent" />
                  <span className="text-sm">
                    {course.rating} rating ({course.students.toLocaleString()} students)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-sm">{course.lessons} lessons</span>
                </div>
              </div>
            </div>

            <div>
              <Card className="p-6 bg-muted/30">
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Course Price</p>
                  <p className="text-4xl font-bold text-primary">${course.price}</p>
                </div>

                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold">What you'll get:</h4>
                  <ul className="space-y-2">
                    {[
                      "Lifetime access to course materials",
                      "Certificate of completion",
                      "Access to community forum",
                      "30-day money-back guarantee",
                      "Mobile app access",
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href="/learner/checkout" className="block">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base mb-3">
                    Enroll Now
                  </Button>
                </Link>
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </Card>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
