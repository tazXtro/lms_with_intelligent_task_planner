"use client"

import { useState, useEffect } from "react"
import { LearnerLayout } from "@/components/learner-layout"
import { NButton } from "@/components/ui/nbutton"
import { NCard } from "@/components/ui/ncard"
import { 
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ExternalLink
} from "lucide-react"
import Link from "next/link"

interface CanvasGrade {
  id: string
  canvas_course_id: string
  current_grade: string | null
  current_score: number | null
  final_grade: string | null
  final_score: number | null
  canvas_courses?: {
    name: string
    course_code: string
  }
}

export default function CanvasGradesPage() {
  const [grades, setGrades] = useState<CanvasGrade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGrades()
  }, [])

  const fetchGrades = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/canvas/grades')
      const data = await response.json()
      setGrades(data.grades || [])
    } catch (error) {
      console.error('Error fetching grades:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (score: number | null) => {
    if (!score) return 'text-foreground/50'
    if (score >= 93) return 'text-success' // A
    if (score >= 90) return 'text-success' // A-
    if (score >= 87) return 'text-emerald-600' // B+
    if (score >= 83) return 'text-emerald-600' // B
    if (score >= 80) return 'text-emerald-600' // B-
    if (score >= 77) return 'text-amber-600' // C+
    if (score >= 73) return 'text-amber-600' // C
    if (score >= 70) return 'text-amber-600' // C-
    if (score >= 67) return 'text-orange-600' // D+
    if (score >= 60) return 'text-orange-600' // D
    return 'text-destructive' // F
  }

  const getGradeBgColor = (score: number | null) => {
    if (!score) return 'bg-foreground/5'
    if (score >= 93) return 'bg-success/10 border-success/30'
    if (score >= 90) return 'bg-success/10 border-success/30'
    if (score >= 87) return 'bg-emerald-600/10 border-emerald-600/30'
    if (score >= 83) return 'bg-emerald-600/10 border-emerald-600/30'
    if (score >= 80) return 'bg-emerald-600/10 border-emerald-600/30'
    if (score >= 77) return 'bg-amber-600/10 border-amber-600/30'
    if (score >= 73) return 'bg-amber-600/10 border-amber-600/30'
    if (score >= 70) return 'bg-amber-600/10 border-amber-600/30'
    if (score >= 67) return 'bg-orange-600/10 border-orange-600/30'
    if (score >= 60) return 'bg-orange-600/10 border-orange-600/30'
    return 'bg-destructive/10 border-destructive/30'
  }

  const getGradeIcon = (score: number | null) => {
    if (!score) return <Minus className="w-5 h-5" />
    if (score >= 73) return <TrendingUp className="w-5 h-5" /> // C and above
    return <TrendingDown className="w-5 h-5" />
  }

  const calculateOverallAverage = () => {
    const validScores = grades
      .map(g => g.current_score)
      .filter((s): s is number => s !== null)
    
    if (validScores.length === 0) return null
    
    const sum = validScores.reduce((acc, score) => acc + score, 0)
    return (sum / validScores.length).toFixed(2)
  }

  const overallAverage = calculateOverallAverage()

  if (loading) {
    return (
      <LearnerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-12 h-12 animate-spin text-main" />
        </div>
      </LearnerLayout>
    )
  }

  return (
    <LearnerLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/learner/canvas">
            <NButton variant="neutral" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Canvas
            </NButton>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-heading mb-2">Canvas Grades</h1>
              <p className="text-foreground/70 font-base text-lg">
                Your grades across all Canvas courses
              </p>
            </div>
          </div>
        </div>

        {/* Overall Average Card */}
        {overallAverage && (
          <NCard className="p-8 mb-8 bg-gradient-to-br from-indigo-600 to-blue-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 font-base text-lg mb-2">Overall Average</p>
                <p className="text-5xl font-heading">{overallAverage}%</p>
                <p className="text-white/70 font-base mt-2">
                  Across {grades.filter(g => g.current_score !== null).length} course(s)
                </p>
              </div>
              <div className="w-20 h-20 bg-white/20 rounded-base flex items-center justify-center">
                <Award className="w-10 h-10" />
              </div>
            </div>
          </NCard>
        )}

        {/* Grades List */}
        {grades.length === 0 ? (
          <NCard className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
            <p className="text-foreground/70 font-base text-lg">No grades available</p>
          </NCard>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {grades.map((grade) => (
              <NCard 
                key={grade.id} 
                className={`p-6 ${getGradeBgColor(grade.current_score)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-heading mb-1">
                      {grade.canvas_courses?.name || 'Unknown Course'}
                    </h3>
                    <p className="text-sm text-foreground/70 font-base">
                      {grade.canvas_courses?.course_code}
                    </p>
                  </div>
                  <div className={getGradeColor(grade.current_score)}>
                    {getGradeIcon(grade.current_score)}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Current Grade */}
                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-base border-2 border-border">
                    <div>
                      <p className="text-sm text-foreground/70 font-base mb-1">Current Grade</p>
                      <p className={`text-3xl font-heading ${getGradeColor(grade.current_score)}`}>
                        {grade.current_grade || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-foreground/70 font-base mb-1">Score</p>
                      <p className={`text-2xl font-heading ${getGradeColor(grade.current_score)}`}>
                        {grade.current_score !== null ? `${grade.current_score.toFixed(2)}%` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Final Grade (if different) */}
                  {grade.final_score !== null && grade.final_score !== grade.current_score && (
                    <div className="flex items-center justify-between p-4 bg-background/30 rounded-base border-2 border-border">
                      <div>
                        <p className="text-sm text-foreground/70 font-base mb-1">Final Grade</p>
                        <p className={`text-2xl font-heading ${getGradeColor(grade.final_score)}`}>
                          {grade.final_grade || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-foreground/70 font-base mb-1">Score</p>
                        <p className={`text-xl font-heading ${getGradeColor(grade.final_score)}`}>
                          {grade.final_score.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Grade Interpretation */}
                <div className="mt-4 p-3 bg-background/30 rounded-base">
                  <p className="text-sm font-base text-foreground/70">
                    {grade.current_score === null && 'No grade data available yet'}
                    {grade.current_score !== null && grade.current_score >= 93 && '🎉 Excellent (A)! Outstanding work!'}
                    {grade.current_score !== null && grade.current_score >= 90 && grade.current_score < 93 && '🌟 Excellent (A-)! Nearly perfect!'}
                    {grade.current_score !== null && grade.current_score >= 87 && grade.current_score < 90 && '👍 Very Good (B+)! Keep it up!'}
                    {grade.current_score !== null && grade.current_score >= 83 && grade.current_score < 87 && '✅ Good (B)! Solid performance!'}
                    {grade.current_score !== null && grade.current_score >= 80 && grade.current_score < 83 && '📊 Good (B-)! You\'re doing well!'}
                    {grade.current_score !== null && grade.current_score >= 77 && grade.current_score < 80 && '📚 Above Average (C+)! Keep working!'}
                    {grade.current_score !== null && grade.current_score >= 73 && grade.current_score < 77 && '📖 Average (C)! Room to improve!'}
                    {grade.current_score !== null && grade.current_score >= 70 && grade.current_score < 73 && '⚠️ Below Average (C-)! Focus more!'}
                    {grade.current_score !== null && grade.current_score >= 67 && grade.current_score < 70 && '⚡ Passing (D+)! Need improvement!'}
                    {grade.current_score !== null && grade.current_score >= 60 && grade.current_score < 67 && '🎯 Poor (D)! Seek help!'}
                    {grade.current_score !== null && grade.current_score < 60 && '❌ Failure (F)! Urgent attention needed!'}
                  </p>
                </div>
              </NCard>
            ))}
          </div>
        )}

        {/* Grade Scale Reference */}
        <NCard className="p-6 mt-8 bg-main/5 border-main/20">
          <h3 className="font-heading text-xl mb-6">Grade Scale Reference</h3>
          
          {/* Detailed grade scale table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left p-3 font-heading">Letter Grade</th>
                  <th className="text-left p-3 font-heading">Numerical Range</th>
                  <th className="text-left p-3 font-heading">Description</th>
                  <th className="text-left p-3 font-heading">Grade Points</th>
                </tr>
              </thead>
              <tbody className="font-base">
                <tr className="border-b border-border hover:bg-success/5">
                  <td className="p-3"><span className="font-heading text-success">A</span></td>
                  <td className="p-3">93-100</td>
                  <td className="p-3">Excellent</td>
                  <td className="p-3">4.0</td>
                </tr>
                <tr className="border-b border-border hover:bg-success/5">
                  <td className="p-3"><span className="font-heading text-success">A-</span></td>
                  <td className="p-3">90-92</td>
                  <td className="p-3">Excellent</td>
                  <td className="p-3">3.7</td>
                </tr>
                <tr className="border-b border-border hover:bg-emerald-600/5">
                  <td className="p-3"><span className="font-heading text-emerald-600">B+</span></td>
                  <td className="p-3">87-89</td>
                  <td className="p-3">Good</td>
                  <td className="p-3">3.3</td>
                </tr>
                <tr className="border-b border-border hover:bg-emerald-600/5">
                  <td className="p-3"><span className="font-heading text-emerald-600">B</span></td>
                  <td className="p-3">83-86</td>
                  <td className="p-3">Good</td>
                  <td className="p-3">3.0</td>
                </tr>
                <tr className="border-b border-border hover:bg-emerald-600/5">
                  <td className="p-3"><span className="font-heading text-emerald-600">B-</span></td>
                  <td className="p-3">80-82</td>
                  <td className="p-3">Good</td>
                  <td className="p-3">2.7</td>
                </tr>
                <tr className="border-b border-border hover:bg-amber-600/5">
                  <td className="p-3"><span className="font-heading text-amber-600">C+</span></td>
                  <td className="p-3">77-79</td>
                  <td className="p-3">Average</td>
                  <td className="p-3">2.3</td>
                </tr>
                <tr className="border-b border-border hover:bg-amber-600/5">
                  <td className="p-3"><span className="font-heading text-amber-600">C</span></td>
                  <td className="p-3">73-76</td>
                  <td className="p-3">Average</td>
                  <td className="p-3">2.0</td>
                </tr>
                <tr className="border-b border-border hover:bg-amber-600/5">
                  <td className="p-3"><span className="font-heading text-amber-600">C-</span></td>
                  <td className="p-3">70-72</td>
                  <td className="p-3">Average</td>
                  <td className="p-3">1.7</td>
                </tr>
                <tr className="border-b border-border hover:bg-orange-600/5">
                  <td className="p-3"><span className="font-heading text-orange-600">D+</span></td>
                  <td className="p-3">67-69</td>
                  <td className="p-3">Poor</td>
                  <td className="p-3">1.3</td>
                </tr>
                <tr className="border-b border-border hover:bg-orange-600/5">
                  <td className="p-3"><span className="font-heading text-orange-600">D</span></td>
                  <td className="p-3">60-66</td>
                  <td className="p-3">Poor</td>
                  <td className="p-3">1.0</td>
                </tr>
                <tr className="hover:bg-destructive/5">
                  <td className="p-3"><span className="font-heading text-destructive">F</span></td>
                  <td className="p-3">Below 60</td>
                  <td className="p-3">Failure</td>
                  <td className="p-3">0.0</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="text-xs text-foreground/60 font-base mt-4">
            * Grade points are calculated per credit hour
          </p>
        </NCard>
      </div>
    </LearnerLayout>
  )
}

