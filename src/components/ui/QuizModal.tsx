'use client'

import { useState, useEffect } from 'react'
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
  Clock,
  ChevronLeft
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
  const [showExplanation, setShowExplanation] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen])

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
    const correctAnswers = quiz.questions.reduce((acc, question, index) => {
      return acc + (answers[index] === question.correctAnswer ? 1 : 0)
    }, 0)
    
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-3xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-6">
              {passed ? (
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-green-600" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
              )}
            </div>
            <CardTitle className="text-3xl mb-2">
              {passed ? '🎉 Félicitations !' : '😔 Pas encore...'}
            </CardTitle>
            <div className="text-gray-600 text-lg">
              Votre score : <span className="font-bold text-3xl text-blue-600">{score}%</span>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {correctAnswers}/{quiz.questions.length} bonnes réponses • Note minimum : {quiz.passingScore}%
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Progress value={score} className="h-4" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>0%</span>
                <span className="font-medium">Note de passage: {quiz.passingScore}%</span>
                <span>100%</span>
              </div>
            </div>
            
            {passed && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-800 font-medium">
                  🎯 Excellent travail ! Vous avez réussi ce quiz.
                </p>
              </div>
            )}
            
            {!passed && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-blue-800">
                  📚 Continuez à étudier et réessayez. Vous êtes sur la bonne voie !
                </p>
              </div>
            )}
            
            <div className="flex justify-center space-x-4">
              <Button onClick={onClose} variant="outline" size="lg">
                Continuer le cours
              </Button>
              {!passed && (
                <Button 
                  onClick={() => {
                    setCurrentQuestion(0)
                    setAnswers({})
                    setShowResults(false)
                    setTimeLeft(300)
                  }}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
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
  const isAnswered = answers[currentQuestion] !== undefined

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[95vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{quiz.title}</CardTitle>
              <div className="text-lg text-gray-600 mt-1">
                Question {currentQuestion + 1} sur {quiz.questions.length}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-lg font-medium text-orange-600">
                <Clock className="w-5 h-5 mr-2" />
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>Progression</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="space-y-8">
            <div className="text-xl font-medium leading-relaxed">
              {question.question}
            </div>
            
            <div className="space-y-4">
              {question.options.map((option, index) => {
                const isSelected = answers[currentQuestion] === index
                const isCorrect = index === question.correctAnswer
                const showCorrectAnswer = showExplanation && isCorrect
                const showWrongAnswer = showExplanation && isSelected && !isCorrect
                
                return (
                  <button
                    key={index}
                    onClick={() => !showExplanation && handleAnswer(currentQuestion, index)}
                    disabled={showExplanation}
                    className={`w-full p-6 text-left rounded-xl border-2 transition-all text-lg ${
                      showCorrectAnswer
                        ? 'border-green-500 bg-green-50 text-green-900'
                        : showWrongAnswer
                        ? 'border-red-500 bg-red-50 text-red-900'
                        : isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full border-2 mr-4 flex items-center justify-center font-bold ${
                        showCorrectAnswer
                          ? 'border-green-500 bg-green-500 text-white'
                          : showWrongAnswer
                          ? 'border-red-500 bg-red-500 text-white'
                          : isSelected
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 text-gray-600'
                      }`}>
                        {showCorrectAnswer ? '✓' : showWrongAnswer ? '✗' : String.fromCharCode(65 + index)}
                      </div>
                      <span className="flex-1">{option}</span>
                    </div>
                  </button>
                )
              })}
            </div>
            
            {showExplanation && question.explanation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Explication</h4>
                <p className="text-blue-800">{question.explanation}</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center pt-8 border-t mt-8">
            <Button
              variant="outline"
              onClick={() => {
                if (showExplanation) {
                  setShowExplanation(false)
                  setCurrentQuestion(prev => Math.max(0, prev - 1))
                } else {
                  setCurrentQuestion(prev => Math.max(0, prev - 1))
                }
              }}
              disabled={currentQuestion === 0}
              size="lg"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>
            
            <div className="text-center">
              <Badge variant="outline" className="text-sm px-3 py-1">
                {Object.keys(answers).length}/{quiz.questions.length} réponses
              </Badge>
            </div>
            
            {currentQuestion === quiz.questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== quiz.questions.length}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                🏁 Terminer le quiz
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (showExplanation) {
                    setShowExplanation(false)
                    setCurrentQuestion(prev => prev + 1)
                  } else if (isAnswered) {
                    if (question.explanation) {
                      setShowExplanation(true)
                    } else {
                      setCurrentQuestion(prev => prev + 1)
                    }
                  }
                }}
                disabled={!isAnswered}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {showExplanation ? 'Suivant' : question.explanation ? 'Voir explication' : 'Suivant'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 