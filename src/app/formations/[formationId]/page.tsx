'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import MuxVideoPlayer from '@/components/video/MuxPlayer'
import VideoThumbnail from '@/components/video/VideoThumbnail'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Play, 
  CheckCircle, 
  Circle, 
  Clock, 
  BookOpen, 
  Users, 
  Award,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Menu,
  X,
  SkipForward,
  SkipBack,
  Volume2,
  Maximize,
  Settings,
  Download,
  FileText,
  PlayCircle,
  Bookmark,
  MessageSquare,
  Share2,
  Monitor,
  Sidebar,
  MoreHorizontal,
  Star,
  ThumbsUp,
  Eye,
  EyeOff,
  Pause,
  RotateCcw,
  Volume,
  Zap,
  Trophy,
  Target,
  ChevronLeft,
  Home,
  List
} from 'lucide-react'
import { cn } from '@/lib/utils'
import './styles.css' // Import responsive styles

// 🎯 Composant Quiz Modal intégré - VERSION AMÉLIORÉE
const QuizModal = ({ quiz, isOpen, onClose, onComplete }: {
  quiz: Quiz
  isOpen: boolean
  onClose: () => void
  onComplete: (score: number, passed: boolean) => void
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number | string>>({})
  const [showResults, setShowResults] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes par défaut
  const [isStarted, setIsStarted] = useState(false)

  // Timer effect
  useEffect(() => {
    if (!isStarted || showResults || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Temps écoulé - soumettre automatiquement
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isStarted, showResults, timeLeft])

  // Debugging du quiz
  console.log('🔍 QuizModal - Données reçues:', {
    isOpen,
    quiz,
    hasQuestions: quiz?.questions,
    questionsType: typeof quiz?.questions,
    questionsLength: quiz?.questions?.length,
    firstQuestion: quiz?.questions?.[0]
  })

  if (!isOpen || !quiz || !quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    console.log('❌ Quiz modal - Conditions non remplies:', {
      isOpen,
      hasQuiz: !!quiz,
      hasQuestions: !!quiz?.questions,
      isArray: Array.isArray(quiz?.questions),
      length: quiz?.questions?.length
    })
    return null
  }

  const handleAnswer = (questionIndex: number, answerIndex: number | string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }))
  }

  const calculateScore = () => {
    if (!quiz.questions || quiz.questions.length === 0) return 0
    
    let correct = 0
    quiz.questions.forEach((question: any, index: number) => {
      const userAnswer = answers[index]
      let isCorrect = false
      
      switch (question.type) {
        case 'true_false':
          // Pour true/false, convertir l'index de réponse en string
          const booleanAnswer = userAnswer === 0 ? 'true' : 'false'
          isCorrect = booleanAnswer === question.correctAnswer
          break
          
        case 'open_ended':
          // Pour les questions ouvertes, on ne peut pas vraiment évaluer automatiquement
          // On considère qu'il y a une réponse comme correct pour l'instant
          isCorrect = !!(userAnswer && typeof userAnswer === 'string' && userAnswer.trim().length > 0)
          break
          
        case 'multiple_choice':
          // Pour choix multiples, comparer les arrays
          if (Array.isArray(question.correctAnswer)) {
            isCorrect = Array.isArray(userAnswer) && 
                       userAnswer.sort().join(',') === question.correctAnswer.sort().join(',')
          } else {
            isCorrect = userAnswer === question.correctAnswer
          }
          break
          
        case 'single_choice':
        default:
          // Pour choix unique, comparaison directe
          isCorrect = userAnswer === question.correctAnswer
          break
      }
      
      if (isCorrect) {
        correct++
      }
      
      console.log(`Question ${index}: userAnswer=${userAnswer}, correctAnswer=${question.correctAnswer}, isCorrect=${isCorrect}`)
    })
    
    const score = Math.round((correct / quiz.questions.length) * 100)
    console.log(`Score final: ${correct}/${quiz.questions.length} = ${score}%`)
    return score
  }

  const handleSubmit = () => {
    const score = calculateScore()
    const passed = score >= quiz.passingScore
    setShowResults(true)
    // Ne pas appeler onComplete immédiatement, laisser l'utilisateur voir les résultats
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startQuiz = () => {
    setIsStarted(true)
    setTimeLeft(quiz.timeLimit ? quiz.timeLimit * 60 : 300) // Convertir minutes en secondes
  }

  // Page de démarrage
  if (!isStarted) {
    return (
      <div className="fixed inset-0 bg-white/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl shadow-2xl border-0">
          <CardHeader className="text-center pb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {quiz.title}
            </CardTitle>
            <p className="text-gray-600 mt-4 text-lg">
              Testez vos connaissances avec ce quiz interactif
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">{quiz.questions.length}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">{quiz.passingScore}%</div>
                <div className="text-sm text-gray-600">Score requis</div>
              </div>
            </div>
            
            {quiz.timeLimit && (
              <div className="bg-orange-50 rounded-xl p-6 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">{quiz.timeLimit} min</div>
                <div className="text-sm text-gray-600">Temps imparti</div>
              </div>
            )}
            
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Instructions :</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Lisez attentivement chaque question
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Sélectionnez la meilleure réponse
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Vous pouvez revenir aux questions précédentes
                </li>
                {quiz.timeLimit && (
                  <li className="flex items-center">
                    <Clock className="w-4 h-4 text-orange-500 mr-2" />
                    Le timer démarre dès que vous commencez
                  </li>
                )}
              </ul>
            </div>
            
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 py-3"
              >
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button
                onClick={startQuiz}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Commencer le quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Page de résultats
  if (showResults) {
    const score = calculateScore()
    const passed = score >= quiz.passingScore
    const correct = Math.round((score / 100) * quiz.questions.length)
    
    return (
      <div className="fixed inset-0 bg-white/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl shadow-2xl border-0">
          <CardHeader className="text-center pb-8">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              passed 
                ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                : 'bg-gradient-to-r from-red-400 to-pink-500'
            }`}>
              {passed ? (
                <Trophy className="w-12 h-12 text-white" />
              ) : (
                <Target className="w-12 h-12 text-white" />
              )}
            </div>
            
            <CardTitle className="text-3xl font-bold mb-4">
              {passed ? '🎉 Félicitations !' : '📚 Presque réussi !'}
            </CardTitle>
            
            <div className="text-6xl font-bold mb-4">
              <span className={passed ? 'text-green-500' : 'text-red-500'}>
                {score}%
              </span>
            </div>
            
            <p className="text-gray-600 text-lg">
              {passed 
                ? 'Vous avez brillamment réussi ce quiz !' 
                : `Il vous faut ${quiz.passingScore}% pour réussir. Continuez vos efforts !`
              }
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Barre de progression visuelle */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span>Progression</span>
                <span>{correct}/{quiz.questions.length} bonnes réponses</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    passed ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-pink-500'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
            
            {/* Statistiques détaillées */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{correct}</div>
                <div className="text-xs text-gray-600">Correctes</div>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">{quiz.questions.length - correct}</div>
                <div className="text-xs text-gray-600">Incorrectes</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{formatTime(300 - timeLeft)}</div>
                <div className="text-xs text-gray-600">Temps utilisé</div>
              </div>
            </div>
            
            {/* Message motivationnel */}
            <div className={`rounded-xl p-6 text-center ${
              passed ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
            }`}>
              <p className={`font-medium ${passed ? 'text-green-800' : 'text-blue-800'}`}>
                {passed 
                  ? '🌟 Excellent travail ! Vous maîtrisez parfaitement ce sujet.'
                  : '💪 Ne vous découragez pas ! Révisez le contenu et réessayez.'
                }
              </p>
            </div>
            
            {/* Note informative */}
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600">
                📋 Prenez le temps de réviser vos résultats avant de continuer
              </p>
            </div>
            
            <div className="flex space-x-4">
              <Button
                onClick={() => {
                  const score = calculateScore()
                  const passed = score >= quiz.passingScore
                  onComplete(score, passed)
                  onClose()
                }}
                variant="outline"
                className="flex-1 py-3"
              >
                Continuer le cours
              </Button>
              {!passed && (
                <Button
                  onClick={() => {
                    setCurrentQuestion(0)
                    setAnswers({})
                    setShowResults(false)
                    setIsStarted(false)
                    setTimeLeft(300)
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
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

  // Debugging de la question courante
  console.log('🔍 Question courante:', {
    currentQuestion,
    question,
    hasOptions: question?.options,
    optionsType: typeof question?.options,
    isOptionsArray: Array.isArray(question?.options),
    optionsLength: question?.options?.length
  })

  // Protection supplémentaire selon le type de question
  const isValidQuestion = () => {
    if (!question || !question.question) return false
    
    switch (question.type) {
      case 'true_false':
        return typeof question.correctAnswer === 'string' && 
               (question.correctAnswer === 'true' || question.correctAnswer === 'false')
      case 'open_ended':
        return true // Pour les questions ouvertes, on a juste besoin de la question
      case 'multiple_choice':
      case 'single_choice':
      default:
        return question.options && 
               Array.isArray(question.options) && 
               question.options.length > 0
    }
  }

  if (!isValidQuestion()) {
    console.log('❌ Question invalide dans le modal:', {
      hasQuestion: !!question,
      questionType: question?.type,
      hasOptions: !!question?.options,
      isOptionsArray: Array.isArray(question?.options),
      correctAnswer: question?.correctAnswer,
      question
    })
    return (
      <div className="fixed inset-0 bg-white/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader>
            <CardTitle className="text-red-600">Erreur Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Les questions du quiz ne sont pas correctement formatées.</p>
            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
              <strong>Debug:</strong><br/>
              Question: {question ? 'OK' : 'Manquante'}<br/>
              Type: {question?.type || 'Inconnu'}<br/>
              Options: {question?.options ? 'OK' : 'Manquantes'}<br/>
              CorrectAnswer: {question?.correctAnswer || 'Manquante'}
            </div>
            <Button onClick={onClose} className="w-full mt-4">
              Fermer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Gérer les options selon le type de question
  const getQuestionOptions = () => {
    if (question.type === 'true_false') {
      return ['Vrai', 'Faux']
    }
    return question.options || []
  }

  const questionOptions = getQuestionOptions()
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100
  const isLastQuestion = currentQuestion === quiz.questions.length - 1
  const isAnswered = answers[currentQuestion] !== undefined && 
                   (typeof answers[currentQuestion] === 'number' || 
                    (typeof answers[currentQuestion] === 'string' && answers[currentQuestion].trim().length > 0))

  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border-0">
        {/* Header avec timer et progression */}
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {quiz.title}
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Question {currentQuestion + 1} sur {quiz.questions.length}
              </p>
            </div>
            
            {/* Timer */}
            <div className="flex items-center space-x-4">
              <div className={`flex items-center px-4 py-2 rounded-lg ${
                timeLeft < 60 
                  ? 'bg-red-50 text-red-600 border border-red-200' 
                  : 'bg-blue-50 text-blue-600 border border-blue-200'
              }`}>
                <Clock className="w-5 h-5 mr-2" />
                <span className="font-mono text-lg font-bold">
                  {formatTime(timeLeft)}
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-gray-600">
              <span>Progression</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          {/* Question */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 leading-relaxed">
              {question.question}
            </h3>
            
            {/* Options de réponse */}
            <div className="space-y-4">
              {question.type === 'open_ended' ? (
                // Interface pour question ouverte
                <div className="space-y-4">
                  <textarea
                    value={answers[currentQuestion] || ''}
                    onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
                    placeholder="Tapez votre réponse ici..."
                    className="w-full p-6 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 resize-none"
                    rows={4}
                  />
                  {question.explanation && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>💡 Conseil :</strong> {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // Interface pour questions à choix multiples
                questionOptions.map((option: string, index: number) => {
                  const isSelected = answers[currentQuestion] === index
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(currentQuestion, index)}
                      className={`w-full p-6 text-left rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-[1.02]'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full border-2 mr-4 flex items-center justify-center font-bold transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 text-gray-600'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className={`text-lg ${isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                          {option}
                        </span>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className="px-6 py-3"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {Array.from({ length: quiz.questions.length }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === currentQuestion 
                      ? 'bg-blue-500 scale-125' 
                      : answers[i] !== undefined 
                        ? 'bg-green-400' 
                        : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            
            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== quiz.questions.length}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Terminer le quiz
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestion(prev => prev + 1)}
                disabled={!isAnswered}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 🆕 Composant pour afficher les ressources
const ResourcesSection = ({ 
  formation, 
  currentLesson, 
  isTheaterMode 
}: {
  formation: Formation
  currentLesson: Lesson
  isTheaterMode: boolean
}) => {
  const currentSection = formation.sections.find(s => s.lessons.some(l => l.id === currentLesson.id))
  
  return (
    <div className="mt-6">
      {/* Ressources de la section courante */}
      {currentSection?.resources && currentSection.resources.length > 0 && (
        <div className={`p-4 rounded-lg border ${
          isTheaterMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <h4 className={`font-medium mb-3 flex items-center ${isTheaterMode ? 'text-white' : 'text-gray-900'}`}>
            <Download className="h-4 w-4 mr-2" />
            Ressources de cette section
          </h4>
          <div className="space-y-2">
            {currentSection.resources.map((resource) => (
              <a
                key={resource.id}
                href={resource.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isTheaterMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                }`}
              >
                <FileText className="h-4 w-4 mr-3 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{resource.name}</div>
                  {resource.description && (
                    <div className={`text-sm truncate ${isTheaterMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {resource.description}
                    </div>
                  )}
                  {resource.fileSize && (
                    <div className={`text-xs ${isTheaterMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {(resource.fileSize / 1024 / 1024).toFixed(1)} MB
                    </div>
                  )}
                </div>
                <Download className="h-4 w-4 ml-3 flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Ressources globales de la formation */}
      {formation.resources?.length > 0 && (
        <div className={`mt-4 p-4 rounded-lg border ${
          isTheaterMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <h4 className={`font-medium mb-3 flex items-center ${isTheaterMode ? 'text-white' : 'text-gray-900'}`}>
            <BookOpen className="h-4 w-4 mr-2" />
            Ressources de la formation
          </h4>
          <div className="space-y-2">
            {formation.resources.map((resource) => (
              <a
                key={resource.id}
                href={resource.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isTheaterMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                }`}
              >
                <FileText className="h-4 w-4 mr-3 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{resource.name}</div>
                  {resource.description && (
                    <div className={`text-sm truncate ${isTheaterMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {resource.description}
                    </div>
                  )}
                </div>
                <Download className="h-4 w-4 ml-3 flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface Lesson {
  id: string
  title: string
  description: string
  orderIndex: number
  duration: number
  type: string
  muxPlaybackId: string | null
  isCompleted: boolean
  watchedSeconds: number
  watchedPercentage: number
  content?: string | null // Pour les quiz
}

interface Resource {
  id: string
  name: string
  description?: string | null
  fileUrl: string
  fileSize?: number | null
  fileType?: string | null
}

interface Quiz {
  id: string
  title: string
  questions: any
  passingScore: number
  timeLimit?: number
}

interface Section {
  id: string
  title: string
  description: string
  orderIndex: number
  lessons: Lesson[]
  resources: Resource[]
}

interface Formation {
  id: string
  title: string
  description: string
  overview: string
  level: string
  thumbnail: string
  totalLessons: number
  completedLessons: number
  totalDuration: number
  watchedDuration: number
  progressPercentage: number
  isEnrolled: boolean
  isCompleted: boolean
  sections: Section[]
  resources: Resource[]
  quizzes: Quiz[]
}

export default function FormationDetailPage() {
  const params = useParams()
  const formationId = params.formationId as string

  const [formation, setFormation] = useState<Formation | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  
  // 🆕 États pour l'interface améliorée
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [currentNote, setCurrentNote] = useState('')
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [bookmarks, setBookmarks] = useState<Array<{id: string, time: number, note: string}>>([])
  const [isTheaterMode, setIsTheaterMode] = useState(false)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false)

  const videoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchFormationData()
  }, [formationId])

  // 🆕 Raccourcis clavier
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
      
      switch(event.key) {
        case ' ':
          event.preventDefault()
          // Toggle play/pause (à implémenter avec le player)
          break
        case 'ArrowLeft':
          event.preventDefault()
          goToPreviousLesson()
          break
        case 'ArrowRight':
          event.preventDefault()
          goToNextLesson()
          break
        case 'm':
          event.preventDefault()
          setIsSidebarOpen(!isSidebarOpen)
          break
        case 'f':
          event.preventDefault()
          toggleFullscreen()
          break
        case 't':
          event.preventDefault()
          setIsTheaterMode(!isTheaterMode)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isSidebarOpen, isTheaterMode])

  const fetchFormationData = async (shouldAutoSelectLesson = true) => {
    try {
      const response = await fetch(`/api/formations/${formationId}`)
      if (response.ok) {
        const data = await response.json()
        setFormation(data)
        
        // Seulement auto-sélectionner une leçon lors du chargement initial
        if (shouldAutoSelectLesson) {
          const firstIncompleteLesson = findFirstIncompleteLesson(data.sections)
          if (firstIncompleteLesson) {
            setCurrentLesson(firstIncompleteLesson)
          }
        }
      } else {
        console.error('Erreur lors du chargement de la formation')
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const findFirstIncompleteLesson = (sections: Section[]): Lesson | null => {
    for (const section of sections) {
      for (const lesson of section.lessons) {
        if (!lesson.isCompleted) {
          return lesson
        }
      }
    }
    return sections[0]?.lessons[0] || null
  }

  // 🆕 Navigation entre leçons
  const goToNextLesson = useCallback(() => {
    if (!formation || !currentLesson) return
    
    const allLessons = formation.sections.flatMap(section => section.lessons)
    const currentIndex = allLessons.findIndex(lesson => lesson.id === currentLesson.id)
    
    if (currentIndex < allLessons.length - 1) {
      setCurrentLesson(allLessons[currentIndex + 1])
    }
  }, [formation, currentLesson])

  const goToPreviousLesson = useCallback(() => {
    if (!formation || !currentLesson) return
    
    const allLessons = formation.sections.flatMap(section => section.lessons)
    const currentIndex = allLessons.findIndex(lesson => lesson.id === currentLesson.id)
    
    if (currentIndex > 0) {
      setCurrentLesson(allLessons[currentIndex - 1])
    }
  }, [formation, currentLesson])

  const updateLessonProgress = async (lessonId: string, watchedSeconds: number) => {
    try {
      await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watchedSeconds })
      })
      
      // Ne pas auto-sélectionner une nouvelle leçon lors de la mise à jour de progression
      fetchFormationData(false)
    } catch (error) {
      console.error('Erreur mise à jour progression:', error)
    }
  }

  const markLessonComplete = async (lessonId: string) => {
    try {
      await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: true, watchedSeconds: currentLesson?.duration || 0 })
      })
      
      // Ne pas auto-sélectionner une nouvelle leçon, juste mettre à jour les données
      fetchFormationData(false)
      
      // Supprimer la navigation automatique pour préserver la progression visible
    } catch (error) {
      console.error('Erreur marquage leçon complète:', error)
    }
  }

  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const selectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson)
  }

  // 🆕 Fonctions pour les nouvelles fonctionnalités
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const addBookmark = (time: number) => {
    const bookmark = {
      id: Date.now().toString(),
      time,
      note: currentNote || `Signet à ${formatTime(time)}`
    }
    setBookmarks([...bookmarks, bookmark])
    setCurrentNote('')
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 🛡️ Fonction pour ouvrir un quiz avec fetch des vraies données
  const openQuizModal = async () => {
    console.log('🔥 openQuizModal appelée!')
    console.log('🔥 currentLesson:', currentLesson)

    if (!currentLesson) {
      console.error('Aucune leçon sélectionnée')
      return
    }

    // Vérifier que la leçon est bien un quiz
    if (currentLesson.type !== 'QUIZ') {
      console.error('La leçon sélectionnée n\'est pas un quiz', currentLesson.type)
      return
    }

    setIsLoadingQuiz(true)

    try {
      // Récupération du quiz depuis l'API
      const response = await fetch(`/api/lessons/${currentLesson.id}/quiz`)
      
      if (response.ok) {
        const quizData = await response.json()
        console.log('✅ Quiz récupéré depuis l\'API:', quizData)
        
        // Validation stricte des données récupérées selon le format attendu par QuizModal
        if (quizData && 
            quizData.title && 
            quizData.questions && 
            Array.isArray(quizData.questions) && 
            quizData.questions.length > 0 &&
            typeof quizData.passingScore === 'number') {
          
          // Transformer le format de l'API au format attendu par QuizModal
          const formattedQuiz = {
            id: quizData.id || currentLesson.id,
            title: quizData.title,
            questions: quizData.questions.map((question: any, index: number) => {
              // Adapter selon le type de question
              let formattedQuestion: any = {
                id: question.id || `q_${index}`,
                question: question.question,
                explanation: question.explanation
              }

                                // Gestion selon le type de question
                  switch (question.type) {
                    case 'true_false':
                      formattedQuestion.options = ['Vrai', 'Faux']
                      formattedQuestion.correctAnswer = question.correctAnswer === 'true' ? 0 : 1
                      break

                    case 'open_ended':
                      // Pour les questions ouvertes, pas d'options multiples
                      formattedQuestion.type = 'open_ended'
                      formattedQuestion.options = [] // Pas d'options pour les questions ouvertes
                      formattedQuestion.correctAnswer = question.correctAnswer || ''
                      break

                    case 'multiple_choice':
                    case 'single_choice':
                    default:
                      formattedQuestion.options = question.options || []
                      formattedQuestion.correctAnswer = typeof question.correctAnswer === 'number' 
                        ? question.correctAnswer 
                        : 0
                      break
                  }

              return formattedQuestion
            }),
            passingScore: quizData.passingScore
          }
          
          console.log('🔄 Quiz formaté:', formattedQuiz)
          
          // Validation finale des questions formatées
          const isValidQuiz = formattedQuiz.questions.every((q: any, qIndex: number) => {
            // Validation de base
            const hasQuestion = !!q.question
            
            // Validation selon le type de question
            let isValid = false
            
            if (q.type === 'open_ended') {
              // Pour les questions ouvertes, on a juste besoin de la question
              isValid = hasQuestion
            } else {
              // Pour les autres types, on a besoin d'options et d'une réponse correcte
              const hasOptions = q.options && Array.isArray(q.options) && q.options.length > 0
              const hasValidAnswer = typeof q.correctAnswer === 'number' && 
                                   q.correctAnswer >= 0 && 
                                   q.correctAnswer < q.options.length
              isValid = hasQuestion && hasOptions && hasValidAnswer
            }
            
            console.log(`🔍 Question ${qIndex} validation:`, {
              question: q.question,
              type: q.type,
              hasOptions: !!q.options,
              optionsLength: q.options?.length,
              correctAnswer: q.correctAnswer,
              isValid
            })
            
            return isValid
          })
          
          if (isValidQuiz) {
            console.log('✅ Quiz formaté et validé avec succès:', formattedQuiz)
            setCurrentQuiz(formattedQuiz)
            setShowQuizModal(true)
            setIsLoadingQuiz(false)
            return
          } else {
            console.log('❌ Quiz formaté invalide - détails de validation ci-dessus')
          }
        } else {
          console.log('❌ Structure du quiz API invalide:', {
            hasTitle: !!quizData?.title,
            hasQuestions: !!quizData?.questions,
            isQuestionsArray: Array.isArray(quizData?.questions),
            questionsLength: quizData?.questions?.length,
            hasPassingScore: typeof quizData?.passingScore === 'number'
          })
        }
      } else {
        const errorData = await response.json()
        console.log('❌ Erreur API quiz:', response.status, errorData)
        
        // Si l'API retourne 404, essayer de parser le contenu de la leçon
        if (response.status === 404 && currentLesson.content) {
          console.log('🔄 Tentative de parsing du contenu de la leçon')
          try {
            const quizFromContent = JSON.parse(currentLesson.content)
            
            if (quizFromContent && 
                quizFromContent.title && 
                quizFromContent.questions && 
                Array.isArray(quizFromContent.questions) && 
                quizFromContent.questions.length > 0) {
              
              // Transformer le format au format attendu par QuizModal
              const formattedQuiz = {
                id: currentLesson.id,
                title: quizFromContent.title,
                questions: quizFromContent.questions.map((question: any, index: number) => {
                  // Adapter selon le type de question
                  let formattedQuestion: any = {
                    id: question.id || `q_${index}`,
                    question: question.question,
                    explanation: question.explanation
                  }

                  // Gestion selon le type de question
                  switch (question.type) {
                    case 'true_false':
                      formattedQuestion.options = ['Vrai', 'Faux']
                      formattedQuestion.correctAnswer = question.correctAnswer === 'true' ? 0 : 1
                      break

                    case 'open_ended':
                      // Pour les questions ouvertes, pas d'options multiples
                      formattedQuestion.type = 'open_ended'
                      formattedQuestion.options = [] // Pas d'options pour les questions ouvertes
                      formattedQuestion.correctAnswer = question.correctAnswer || ''
                      break

                    case 'multiple_choice':
                    case 'single_choice':
                    default:
                      formattedQuestion.options = question.options || []
                      formattedQuestion.correctAnswer = typeof question.correctAnswer === 'number' 
                        ? question.correctAnswer 
                        : 0
                      break
                  }

                  return formattedQuestion
                }),
                passingScore: quizFromContent.passingScore || 70
              }
              
              // Validation des questions
              const isValidQuiz = formattedQuiz.questions.every((q: any) => {
                const hasQuestion = !!q.question
                
                if (q.type === 'open_ended') {
                  return hasQuestion
                } else {
                  const hasOptions = q.options && Array.isArray(q.options) && q.options.length > 0
                  const hasValidAnswer = typeof q.correctAnswer === 'number' && 
                                       q.correctAnswer >= 0 && 
                                       q.correctAnswer < q.options.length
                  return hasQuestion && hasOptions && hasValidAnswer
                }
              })
              
              if (isValidQuiz) {
                console.log('✅ Quiz valide trouvé dans le contenu de la leçon')
                setCurrentQuiz(formattedQuiz)
                setShowQuizModal(true)
                setIsLoadingQuiz(false)
                return
              }
            }
          } catch (error) {
            console.error('❌ Erreur parsing contenu quiz:', error)
          }
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors du fetch du quiz:', error)
    }

    // Afficher un message d'erreur si aucun quiz n'a été trouvé
    console.error('❌ Aucun quiz valide trouvé pour cette leçon')
    alert('Désolé, aucun quiz n\'est disponible pour cette leçon. Veuillez contacter votre formateur.')
    setIsLoadingQuiz(false)
  }

  // 🆕 Fonction pour sauvegarder les résultats du quiz
  const saveQuizResult = async (lessonId: string, score: number, passed: boolean) => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}/quiz-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          score, 
          passed,
          completedAt: new Date().toISOString()
        })
      })
      
      if (response.ok) {
        console.log('✅ Résultat du quiz sauvegardé')
      } else {
        console.error('❌ Erreur sauvegarde résultat quiz')
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la formation...</p>
        </div>
      </div>
    )
  }

  if (!formation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Formation non trouvée</h1>
          <Link href="/dashboard/formateur/formations">
            <Button>Retour au dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${isTheaterMode ? 'bg-black' : 'bg-gray-50'}`}>
      {/* 🆕 Header amélioré avec contrôles - RESPONSIVE */}
      <div className={`${isTheaterMode ? 'bg-black border-b border-gray-800' : 'bg-white border-b border-gray-200'} transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            {/* Première ligne mobile - Navigation et titre */}
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
              <Link href="/dashboard/formateur/formations">
                <Button variant="ghost" size="sm" className={`${isTheaterMode ? 'text-white hover:bg-gray-800' : ''} text-xs sm:text-sm`}>
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Retour</span>
                </Button>
              </Link>
              
              {/* Contrôles de navigation - Cachés sur très petit écran */}
              <div className="hidden xs:flex items-center space-x-1 sm:space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPreviousLesson}
                  className={`${isTheaterMode ? 'text-white hover:bg-gray-800' : ''} p-1 sm:p-2`}
                  title="Leçon précédente"
                >
                  <SkipBack className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNextLesson}
                  className={`${isTheaterMode ? 'text-white hover:bg-gray-800' : ''} p-1 sm:p-2`}
                  title="Leçon suivante"
                >
                  <SkipForward className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
              
              {/* Titre formation - Tronqué sur mobile */}
              <div className="flex-1 min-w-0 border-l border-gray-300 pl-2 sm:pl-4">
                <h1 className={`text-sm sm:text-lg font-bold truncate ${isTheaterMode ? 'text-white' : 'text-gray-900'}`}>
                  {formation.title}
                </h1>
                <div className={`flex items-center space-x-1 sm:space-x-3 text-xs sm:text-sm mt-1 ${isTheaterMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span className="flex items-center">
                    <BookOpen className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                    {formation.completedLessons}/{formation.totalLessons}
                  </span>
                  <span className="hidden sm:inline">{formation.progressPercentage}% terminé</span>
                </div>
              </div>
            </div>
            
            {/* Contrôles d'interface - Adaptés mobile */}
            <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                className={`${isTheaterMode ? 'text-white hover:bg-gray-800' : ''} p-1 sm:p-2`}
                title="Mode théâtre (T)"
              >
                <Maximize className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`lg:hidden ${isTheaterMode ? 'text-white hover:bg-gray-800' : ''} p-1`}
                title="Menu (M)"
              >
                {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-3 w-3 sm:h-4 sm:w-4" />}
              </Button>

              {formation.isCompleted && (
                <div className="hidden sm:flex items-center text-green-400 ml-4">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="text-xs sm:text-sm font-medium">Terminée !</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Barre de progression - Responsive */}
          <div className="mt-2 sm:mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={isTheaterMode ? 'text-gray-400' : 'text-gray-500'}>
                <span className="hidden sm:inline">Progression globale</span>
                <span className="sm:hidden">Progression</span>
              </span>
              <span className={`font-medium ${isTheaterMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {formation.progressPercentage}%
              </span>
            </div>
            <div className={`w-full rounded-full h-1 sm:h-1.5 ${isTheaterMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 sm:h-1.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${formation.progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Layout principal - RESPONSIVE */}
      <div className="flex h-full relative">
        {/* Contenu principal - S'adapte selon la sidebar */}
        <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:pr-96' : ''}`}>
          
          {/* Zone vidéo/contenu - RESPONSIVE */}
          <div ref={videoRef} className={`relative ${isTheaterMode ? 'bg-black' : 'bg-gray-900'}`}>
            {currentLesson && currentLesson.type === 'VIDEO' && currentLesson.muxPlaybackId ? (
              <div className="relative">
                <MuxVideoPlayer
                  playbackId={currentLesson.muxPlaybackId}
                  lessonId={currentLesson.id}
                  onProgress={(watchedSeconds) => updateLessonProgress(currentLesson.id, watchedSeconds)}
                  onComplete={() => markLessonComplete(currentLesson.id)}
                  className="w-full aspect-video"
                />
                
                {/* Overlay avec contrôles - RESPONSIVE */}
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex space-x-1 sm:space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="bg-black/50 hover:bg-black/70 text-white border-0 p-1 sm:p-2"
                  >
                    <Maximize className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => addBookmark(currentLesson.watchedSeconds)}
                    className="bg-black/50 hover:bg-black/70 text-white border-0 p-1 sm:p-2"
                  >
                    <Bookmark className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            ) : currentLesson && currentLesson.type === 'QUIZ' ? (
              // Interface Quiz - RESPONSIVE
              <div className={`aspect-video flex items-center justify-center ${isTheaterMode ? 'bg-gray-900' : 'bg-gray-100'} p-4 sm:p-8`}>
                <div className="text-center max-w-xs sm:max-w-md">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <span className="text-white text-2xl sm:text-3xl font-bold">Q</span>
                  </div>
                  <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${isTheaterMode ? 'text-white' : 'text-gray-900'}`}>
                    Quiz : {currentLesson.title}
                  </h3>
                  <p className={`mb-4 sm:mb-6 text-sm sm:text-base ${isTheaterMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Testez vos connaissances avec ce quiz interactif
                  </p>
                  {/* Bouton quiz - seulement pour les leçons de type QUIZ */}
                  {currentLesson?.type === 'QUIZ' && (
                    <Button 
                      onClick={async () => {
                        console.log('🎯 Bouton quiz cliqué!')
                        console.log('📋 Current lesson:', currentLesson)
                        console.log('📋 Current lesson content:', currentLesson?.content)
                        console.log('📋 États quiz:', { showQuizModal, currentQuiz })
                        await openQuizModal()
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base"
                      disabled={!currentLesson || isLoadingQuiz}
                    >
                      {isLoadingQuiz ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Chargement...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Commencer le quiz
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ) : currentLesson && currentLesson.type === 'DOCUMENT' ? (
              // Interface Document - RESPONSIVE
              <div className={`aspect-video flex items-center justify-center ${isTheaterMode ? 'bg-gray-900' : 'bg-gray-100'} p-4 sm:p-8`}>
                <div className="text-center max-w-xs sm:max-w-md">
                  <FileText className={`h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 ${isTheaterMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${isTheaterMode ? 'text-white' : 'text-gray-900'}`}>
                    Document : {currentLesson.title}
                  </h3>
                  <p className={`text-sm sm:text-base ${isTheaterMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Contenu textuel et ressources à consulter
                  </p>
                </div>
              </div>
            ) : (
              // État par défaut - RESPONSIVE
              <div className={`aspect-video flex items-center justify-center ${isTheaterMode ? 'bg-black' : 'bg-gray-800'} p-4`}>
                <div className="text-center text-white">
                  <Play className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="text-lg sm:text-xl">Sélectionnez une leçon pour commencer</p>
                </div>
              </div>
            )}
          </div>

          {/* Informations de la leçon - RESPONSIVE */}
          {currentLesson && (
            <div className={`p-3 sm:p-6 border-b transition-colors duration-300 ${
              isTheaterMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200'
            }`}>
              <div className="max-w-4xl">
                <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3 sm:gap-0">
                  <div className="flex-1 w-full sm:w-auto">
                    <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${isTheaterMode ? 'text-white' : 'text-gray-900'}`}>
                      {currentLesson.title}
                    </h2>
                    {currentLesson.description && (
                      <p className={`mb-4 leading-relaxed text-sm sm:text-base ${isTheaterMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {currentLesson.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Actions rapides - RESPONSIVE */}
                  <div className="flex items-center space-x-2 w-full sm:w-auto sm:ml-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`${isTheaterMode ? 'text-gray-300 hover:bg-gray-800' : ''} flex-1 sm:flex-none text-xs sm:text-sm`}
                    >
                      <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Partager
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNotes(!showNotes)}
                      className={`${isTheaterMode ? 'text-gray-300 hover:bg-gray-800' : ''} flex-1 sm:flex-none text-xs sm:text-sm`}
                    >
                      <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Notes
                    </Button>
                  </div>
                </div>
                
                {/* Métadonnées - RESPONSIVE */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
                  <span className={`flex items-center ${isTheaterMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {formatDuration(currentLesson.duration)}
                  </span>
                  
                  <span className="flex items-center">
                    {currentLesson.isCompleted ? (
                      <>
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-green-500" />
                        <span className="text-green-500 font-medium">Terminé</span>
                      </>
                    ) : (
                      <>
                        <Circle className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${isTheaterMode ? 'text-gray-400' : 'text-gray-400'}`} />
                        <span className={isTheaterMode ? 'text-gray-300' : 'text-gray-600'}>
                          {currentLesson.watchedPercentage}% visionné
                        </span>
                      </>
                    )}
                  </span>

                  <span className={`flex items-center ${isTheaterMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {currentLesson.type}
                  </span>
                </div>

                {/* Zone de notes - RESPONSIVE */}
                {showNotes && (
                  <div className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg border ${
                    isTheaterMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <h4 className={`font-medium mb-3 text-sm sm:text-base ${isTheaterMode ? 'text-white' : 'text-gray-900'}`}>
                      Mes notes
                    </h4>
                    <textarea
                      value={currentNote}
                      onChange={(e) => setCurrentNote(e.target.value)}
                      placeholder="Ajoutez vos notes sur cette leçon..."
                      className={`w-full p-2 sm:p-3 text-sm sm:text-base rounded border resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isTheaterMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300'
                      }`}
                      rows={3}
                    />
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 gap-2 sm:gap-0">
                      <div className="flex items-center space-x-2">
                        {bookmarks.length > 0 && (
                          <span className={`text-xs ${isTheaterMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {bookmarks.length} signet(s)
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addBookmark(currentLesson.watchedSeconds)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm w-full sm:w-auto"
                      >
                        <Bookmark className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                        Ajouter signet
                      </Button>
                    </div>
                  </div>
                )}

                {/* Ressources - RESPONSIVE */}
                {currentLesson && formation && (
                  <ResourcesSection 
                    formation={formation}
                    currentLesson={currentLesson}
                    isTheaterMode={isTheaterMode}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - ENTIÈREMENT RESPONSIVE */}
        <div className={`fixed lg:absolute top-0 right-0 h-full w-full sm:w-80 lg:w-96 transform transition-all duration-300 z-40 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } ${isTheaterMode ? 'bg-gray-900 border-l border-gray-800' : 'bg-white border-l border-gray-200 shadow-xl lg:shadow-none'}`}>
          
          {/* Header sidebar - RESPONSIVE */}
          <div className={`p-3 sm:p-4 border-b ${isTheaterMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-base sm:text-lg font-semibold ${isTheaterMode ? 'text-white' : 'text-gray-900'}`}>
                Contenu
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(false)}
                className={`lg:hidden ${isTheaterMode ? 'text-gray-400 hover:bg-gray-800' : ''} p-1`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className={`text-xs sm:text-sm mt-1 ${isTheaterMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {formation.sections.length} sections • {formation.totalLessons} leçons
            </div>
          </div>

          {/* Liste des sections - RESPONSIVE */}
          <div className="h-full overflow-y-auto pb-16 sm:pb-20">
            <div className={`divide-y ${isTheaterMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
              {formation.sections.map((section) => {
                const sectionLessons = section.lessons.length
                const sectionCompleted = section.lessons.filter(l => l.isCompleted).length
                const sectionDuration = section.lessons.reduce((acc, l) => acc + l.duration, 0)
                const isCollapsed = collapsedSections.has(section.id)
                const completionPercentage = sectionLessons > 0 ? (sectionCompleted / sectionLessons) * 100 : 0

                return (
                  <div key={section.id} className="p-2 sm:p-4">
                    <button
                      onClick={() => toggleSectionCollapse(section.id)}
                      className={`w-full flex items-center justify-between text-left p-2 sm:p-3 rounded-lg transition-colors ${
                        isTheaterMode 
                          ? 'hover:bg-gray-800' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium mb-2 text-sm sm:text-base truncate ${isTheaterMode ? 'text-white' : 'text-gray-900'}`}>
                          {section.title}
                        </h4>
                        
                        {/* Barre de progression par section */}
                        <div className="mb-2">
                          <div className={`w-full rounded-full h-1 ${isTheaterMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                            <div 
                              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${completionPercentage}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className={`text-xs ${isTheaterMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {sectionCompleted}/{sectionLessons} • {formatDuration(sectionDuration)}
                        </div>
                      </div>
                      
                      <div className="ml-2 sm:ml-3 flex-shrink-0">
                        {isCollapsed ? (
                          <ChevronRight className={`h-3 w-3 sm:h-4 sm:w-4 ${isTheaterMode ? 'text-gray-400' : 'text-gray-400'}`} />
                        ) : (
                          <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 ${isTheaterMode ? 'text-gray-400' : 'text-gray-400'}`} />
                        )}
                      </div>
                    </button>

                    {/* Liste des leçons - RESPONSIVE */}
                    {!isCollapsed && (
                      <div className="mt-1 sm:mt-2 space-y-1">
                        {section.lessons.map((lesson, index) => (
                          <button
                            key={lesson.id}
                            onClick={() => selectLesson(lesson)}
                            className={`w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg text-left transition-all text-xs sm:text-sm ${
                              currentLesson?.id === lesson.id 
                                ? isTheaterMode 
                                  ? 'bg-blue-900/50 border border-blue-700' 
                                  : 'bg-blue-50 border border-blue-200'
                                : isTheaterMode
                                  ? 'hover:bg-gray-800'
                                  : 'hover:bg-gray-50'
                            }`}
                          >
                            {/* Numéro de leçon */}
                            <div className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              lesson.isCompleted
                                ? 'bg-green-500 text-white'
                                : currentLesson?.id === lesson.id
                                  ? 'bg-blue-500 text-white'
                                  : isTheaterMode
                                    ? 'bg-gray-700 text-gray-300'
                                    : 'bg-gray-200 text-gray-600'
                            }`}>
                              {lesson.isCompleted ? '✓' : index + 1}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium truncate ${
                                currentLesson?.id === lesson.id
                                  ? isTheaterMode ? 'text-blue-300' : 'text-blue-700'
                                  : isTheaterMode ? 'text-gray-200' : 'text-gray-900'
                              }`}>
                                {lesson.title}
                              </div>
                              <div className={`text-xs mt-1 flex items-center space-x-2 ${
                                isTheaterMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                <span>{formatDuration(lesson.duration)}</span>
                                {lesson.watchedPercentage > 0 && !lesson.isCompleted && (
                                  <>
                                    <span>•</span>
                                    <span>{lesson.watchedPercentage}%</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Icône type de leçon */}
                            <div className="flex-shrink-0 flex items-center space-x-1 sm:space-x-2">
                              {lesson.type === 'VIDEO' && lesson.muxPlaybackId && (
                                <div className="w-6 h-4 sm:w-8 sm:h-6 rounded overflow-hidden">
                                  <VideoThumbnail
                                    playbackId={lesson.muxPlaybackId}
                                    width={32}
                                    height={24}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              {lesson.type === 'QUIZ' && (
                                <div className="w-4 h-4 sm:w-6 sm:h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">Q</span>
                                </div>
                              )}
                              {lesson.type === 'DOCUMENT' && (
                                <FileText className={`w-3 h-3 sm:w-4 sm:h-4 ${isTheaterMode ? 'text-gray-400' : 'text-gray-500'}`} />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay mobile pour fermer la sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Indicateur de raccourcis - RESPONSIVE */}
      <div className={`fixed bottom-2 sm:bottom-4 left-2 sm:left-4 text-xs ${isTheaterMode ? 'text-gray-400' : 'text-gray-500'} hidden sm:block`}>
        <div className="bg-black/50 text-white px-2 py-1 rounded backdrop-blur-sm">
          Raccourcis: ← → (navigation) • M (menu) • T (théâtre) • F (plein écran)
        </div>
      </div>

      {/* Quiz Modal - RESPONSIVE */}
      {showQuizModal && currentQuiz && (
        <QuizModal
          quiz={currentQuiz}
          isOpen={showQuizModal}
          onClose={() => {
            setShowQuizModal(false)
            setCurrentQuiz(null)
          }}
          onComplete={async (score, passed) => {
            console.log(`Quiz terminé: ${score}% - ${passed ? 'Réussi' : 'Échec'}`)
            
            // Sauvegarder le résultat du quiz
            if (currentLesson) {
              await saveQuizResult(currentLesson.id, score, passed)
            }
            
            setShowQuizModal(false)
            setCurrentQuiz(null)
            
            // Marquer la leçon comme complète si le quiz est réussi
            if (passed && currentLesson) {
              await markLessonComplete(currentLesson.id)
            }
          }}
        />
      )}
    </div>
  )
} 