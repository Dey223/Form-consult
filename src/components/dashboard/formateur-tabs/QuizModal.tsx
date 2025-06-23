'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  Trophy,
  RotateCcw,
  ArrowRight,
  Clock
} from 'lucide-react'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

interface Quiz {
  id: string
  title: string
  questions: QuizQuestion[]
  passingScore: number
}

interface QuizModalProps {
  quiz: Quiz
  isOpen: boolean
  onClose: () => void
  onComplete: (score: number, passed: boolean) => void
}

export default function QuizModal({ quiz, isOpen, onClose, onComplete }: QuizModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes

  if (!isOpen) return null

  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }))
  }

  const calculateScore = () => {
    let correct = 0
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++
      }
    })
    return Math.round((correct / quiz.questions.length) * 100)
  }

  const handleSubmit = () => {
    const score = calculateScore()
    const passed = score >= quiz.passingScore
    setShowResults(true)
    onComplete(score, passed)
  }

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  if (showResults) {
    const score = calculateScore()
    const passed = score >= quiz.passingScore
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {passed ? (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-green-600" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl">
              {passed ? 'Félicitations !' : 'Pas encore...'}
            </CardTitle>
            <div className="text-gray-600">
              Votre score : <span className="font-bold text-2xl">{score}%</span>
            </div>
            <div className="text-sm text-gray-500">
              Note minimum requise : {quiz.passingScore}%
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={score} className="h-3" />
            
            <div className="flex justify-center space-x-3">
              <Button onClick={onClose} variant="outline">
                Continuer
              </Button>
              {!passed && (
                <Button onClick={() => {
                  setCurrentQuestion(0)
                  setAnswers({})
                  setShowResults(false)
                }}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Recommencer
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const question = quiz.questions[currentQuestion]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{quiz.title}</CardTitle>
              <div className="text-sm text-gray-500 mt-1">
                Question {currentQuestion + 1} sur {quiz.questions.length}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-lg font-medium">
            {question.question}
          </div>
          
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(currentQuestion, index)}
                className={`w-full p-4 text-left rounded-lg border transition-all ${
                  answers[currentQuestion] === index
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                    answers[currentQuestion] === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion] === index && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  {option}
                </div>
              </button>
            ))}
          </div>
          
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
            >
              Précédent
            </Button>
            
            {currentQuestion === quiz.questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== quiz.questions.length}
                className="bg-green-600 hover:bg-green-700"
              >
                Terminer le quiz
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestion(prev => prev + 1)}
                disabled={answers[currentQuestion] === undefined}
              >
                Suivant
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 