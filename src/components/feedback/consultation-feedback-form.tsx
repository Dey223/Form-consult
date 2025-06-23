'use client'

import React, { useState } from 'react'
import { 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Building,
  X,
  ArrowLeft,
  ArrowRight,
  Heart,
  Target,
  Lightbulb
} from 'lucide-react'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface ConsultationFeedbackFormProps {
  appointment: {
    id: string
    title: string
    consultantName: string
    date: string
    duration: number
    description?: string
  }
  open: boolean
  onClose: () => void
  onSubmit: (feedback: FeedbackData) => void
}

interface FeedbackData {
  rating: number
  satisfactionLevel: number
  wouldRecommend: boolean
  comments: string
  improvementAreas: string[]
  strengths: string[]
  followUpNeeded: boolean
}

const improvementOptions = [
  { value: 'Gestion du temps', icon: '⏰', description: 'Optimiser le temps de consultation' },
  { value: 'Communication', icon: '💬', description: 'Clarifier les échanges' },
  { value: 'Écoute active', icon: '👂', description: 'Mieux comprendre les besoins' },
  { value: 'Exemples pratiques', icon: '🎯', description: 'Plus de cas concrets' },
  { value: 'Suivi post-consultation', icon: '📞', description: 'Accompagnement après la session' },
  { value: 'Clarté des explications', icon: '💡', description: 'Simplifier les concepts' },
  { value: 'Outils recommandés', icon: '🛠️', description: 'Proposer de meilleurs outils' },
  { value: 'Méthodologie', icon: '📋', description: 'Améliorer l\'approche' },
  { value: 'Disponibilité', icon: '📅', description: 'Plus de créneaux disponibles' },
  { value: 'Réactivité', icon: '⚡', description: 'Répondre plus rapidement' }
]

const strengthOptions = [
  { value: 'Expertise technique', icon: '🎓', description: 'Maîtrise du domaine' },
  { value: 'Pédagogie', icon: '👨‍🏫', description: 'Capacité à expliquer' },
  { value: 'Écoute', icon: '👂', description: 'Attention aux besoins' },
  { value: 'Pragmatisme', icon: '🎯', description: 'Solutions concrètes' },
  { value: 'Adaptabilité', icon: '🔄', description: 'Flexibilité d\'approche' },
  { value: 'Professionnalisme', icon: '👔', description: 'Attitude professionnelle' },
  { value: 'Créativité', icon: '💡', description: 'Solutions innovantes' },
  { value: 'Leadership', icon: '👑', description: 'Capacité à guider' },
  { value: 'Vision stratégique', icon: '🎯', description: 'Vue d\'ensemble' },
  { value: 'Empathie', icon: '❤️', description: 'Compréhension humaine' }
]

export function ConsultationFeedbackForm({ appointment, open, onClose, onSubmit }: ConsultationFeedbackFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [feedback, setFeedback] = useState<FeedbackData>({
    rating: 0,
    satisfactionLevel: 0,
    wouldRecommend: false,
    comments: '',
    improvementAreas: [],
    strengths: [],
    followUpNeeded: false
  })

  const handleRatingClick = (rating: number) => {
    setFeedback(prev => ({ 
      ...prev, 
      rating,
      satisfactionLevel: rating // Auto-sync satisfaction with rating
    }))
  }

  const handleSatisfactionClick = (level: number) => {
    setFeedback(prev => ({ ...prev, satisfactionLevel: level }))
  }

  const toggleImprovement = (area: string) => {
    setFeedback(prev => ({
      ...prev,
      improvementAreas: prev.improvementAreas.includes(area)
        ? prev.improvementAreas.filter(item => item !== area)
        : [...prev.improvementAreas, area]
    }))
  }

  const toggleStrength = (strength: string) => {
    setFeedback(prev => ({
      ...prev,
      strengths: prev.strengths.includes(strength)
        ? prev.strengths.filter(item => item !== strength)
        : [...prev.strengths, strength]
    }))
  }

  const handleSubmit = async () => {
    if (feedback.rating === 0) {
      toast.error('Veuillez donner une note avant de continuer')
      return
    }
    toast.success('Merci pour votre retour ! Vos commentaires nous aident à nous améliorer.')
    setIsSubmitting(true)
    
    try {
      await onSubmit(feedback)
      toast.success('Merci pour votre retour ! Vos commentaires nous aident à nous améliorer.')
      onClose()
    } catch (error) {
      toast.error('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep === 1 && feedback.rating === 0) {
      toast.error('Veuillez donner une note avant de continuer')
      return
    }
    if (currentStep === 2 && feedback.strengths.length === 0) {
      toast.error('Sélectionnez au moins un point fort avant de continuer')
      return
    }
    setCurrentStep(prev => Math.min(prev + 1, 4))
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const getStars = (rating: number, activeRating: number, onClick: (rating: number) => void, size: 'sm' | 'lg' = 'lg') => {
    const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-8 w-8'
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        onClick={() => onClick(i + 1)}
        className={`${sizeClass} transition-all duration-200 transform hover:scale-110 ${
          i < rating 
            ? 'text-yellow-400 hover:text-yellow-500' 
            : 'text-gray-300 hover:text-gray-400'
        }`}
      >
        <Star className={i < rating ? 'fill-current' : ''} />
      </button>
    ))
  }

  const getRatingMessage = (rating: number) => {
    const messages = {
      5: { text: "Excellent ! Cette consultation vous a vraiment aidé 🌟", color: "text-green-600" },
      4: { text: "Très bien ! Vous êtes satisfait de l'accompagnement 👍", color: "text-blue-600" },
      3: { text: "Correct. La consultation a répondu à vos attentes 👌", color: "text-yellow-600" },
      2: { text: "Peut mieux faire. Quelques améliorations possibles 😐", color: "text-orange-600" },
      1: { text: "Décevant. Cette consultation ne vous a pas aidé 😞", color: "text-red-600" }
    }
    return messages[rating as keyof typeof messages] || null
  }

  const getStepTitle = () => {
    const titles = {
      1: "💫 Votre évaluation globale",
      2: "🌟 Ce qui vous a marqué positivement",
      3: "🎯 Suggestions d'amélioration",
      4: "📝 Vos commentaires finaux"
    }
    return titles[currentStep as keyof typeof titles]
  }

  const getStepDescription = () => {
    const descriptions = {
      1: "Aidez-nous à comprendre votre niveau de satisfaction",
      2: "Quels sont les points forts de votre consultant ?",
      3: "Comment pouvons-nous améliorer nos services ?",
      4: "Partagez vos impressions détaillées (optionnel)"
    }
    return descriptions[currentStep as keyof typeof descriptions]
  }

  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Comment s'est passée votre consultation ?</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Votre avis compte énormément pour nous aider à améliorer nos services
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <div className="text-center space-y-4">
          <label className="block text-lg font-semibold text-gray-900">
            Donnez une note globale
          </label>
          <div className="flex justify-center space-x-2">
            {getStars(feedback.rating, feedback.rating, handleRatingClick)}
          </div>
          
          {feedback.rating > 0 && (
            <div className="mt-4">
              <div className={`text-lg font-medium ${getRatingMessage(feedback.rating)?.color}`}>
                {getRatingMessage(feedback.rating)?.text}
              </div>
            </div>
          )}
        </div>
      </div>

      {feedback.rating > 0 && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Niveau de satisfaction détaillé
            </label>
            <div className="flex justify-center space-x-2 mb-4">
              {getStars(feedback.satisfactionLevel, feedback.satisfactionLevel, handleSatisfactionClick)}
            </div>
            <p className="text-sm text-gray-600 text-center">
              Ceci nous aide à affiner notre compréhension de votre expérience
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <label className="block text-lg font-semibold text-gray-900 mb-4 text-center">
              Recommanderiez-vous {appointment.consultantName} ?
            </label>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setFeedback(prev => ({ ...prev, wouldRecommend: true }))}
                className={`flex items-center space-x-3 px-6 py-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                  feedback.wouldRecommend 
                    ? 'bg-green-50 border-green-300 text-green-700 shadow-lg' 
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ThumbsUp className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Oui, absolument</div>
                  <div className="text-xs opacity-75">Je le recommande</div>
                </div>
              </button>
              
              <button
                onClick={() => setFeedback(prev => ({ ...prev, wouldRecommend: false }))}
                className={`flex items-center space-x-3 px-6 py-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                  !feedback.wouldRecommend && feedback.rating > 0
                    ? 'bg-red-50 border-red-300 text-red-700 shadow-lg' 
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ThumbsDown className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Non, pas vraiment</div>
                  <div className="text-xs opacity-75">Je ne le recommande pas</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Quels sont les points forts de votre consultant ?</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Sélectionnez tout ce qui vous a impressionné chez {appointment.consultantName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strengthOptions.map((strength) => (
          <button
            key={strength.value}
            onClick={() => toggleStrength(strength.value)}
            className={`group p-4 text-left rounded-xl border-2 transition-all transform hover:scale-[1.02] ${
              feedback.strengths.includes(strength.value)
                ? 'bg-green-50 border-green-300 text-green-700 shadow-lg'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{strength.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{strength.value}</div>
                <div className="text-xs opacity-75 mt-1">{strength.description}</div>
              </div>
              {feedback.strengths.includes(strength.value) && (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              )}
            </div>
          </button>
        ))}
      </div>

      {feedback.strengths.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-900">
              Super ! Vous avez sélectionné {feedback.strengths.length} point{feedback.strengths.length > 1 ? 's' : ''} fort{feedback.strengths.length > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-sm text-green-700">
            Ces retours positifs aideront {appointment.consultantName} à continuer sur cette voie.
          </p>
        </div>
      )}
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Y a-t-il des points à améliorer ?</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Vos suggestions nous aident à progresser (cette étape est optionnelle)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {improvementOptions.map((area) => (
          <button
            key={area.value}
            onClick={() => toggleImprovement(area.value)}
            className={`group p-4 text-left rounded-xl border-2 transition-all transform hover:scale-[1.02] ${
              feedback.improvementAreas.includes(area.value)
                ? 'bg-orange-50 border-orange-300 text-orange-700 shadow-lg'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{area.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{area.value}</div>
                <div className="text-xs opacity-75 mt-1">{area.description}</div>
              </div>
              {feedback.improvementAreas.includes(area.value) && (
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <label className="block text-lg font-semibold text-gray-900 mb-4 text-center">
          Souhaitez-vous un suivi personnalisé de cette consultation ?
        </label>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setFeedback(prev => ({ ...prev, followUpNeeded: true }))}
            className={`flex items-center space-x-3 px-6 py-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
              feedback.followUpNeeded 
                ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-lg' 
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Clock className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Oui, merci</div>
              <div className="text-xs opacity-75">J'aimerais un suivi</div>
            </div>
          </button>
          
          <button
            onClick={() => setFeedback(prev => ({ ...prev, followUpNeeded: false }))}
            className={`flex items-center space-x-3 px-6 py-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
              !feedback.followUpNeeded 
                ? 'bg-gray-50 border-gray-200 text-gray-600' 
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <X className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Non, c'est bon</div>
              <div className="text-xs opacity-75">Pas de suivi nécessaire</div>
            </div>
          </button>
        </div>
      </div>

      {feedback.improvementAreas.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Lightbulb className="h-5 w-5 text-orange-600" />
            <span className="font-semibold text-orange-900">
              Merci pour vos {feedback.improvementAreas.length} suggestion{feedback.improvementAreas.length > 1 ? 's' : ''} !
            </span>
          </div>
          <p className="text-sm text-orange-700">
            Ces retours constructifs nous aident à améliorer continuellement nos services.
          </p>
        </div>
      )}
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Vos commentaires libres</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Partagez tout ce qui vous semble important à mentionner
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <textarea
          value={feedback.comments}
          onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
          placeholder="Racontez-nous votre expérience : qu'est-ce qui vous a marqué ? Quels conseils vous ont été les plus utiles ? Y a-t-il quelque chose de spécifique que vous aimeriez partager avec nous ou avec le consultant ?"
          className="w-full h-32 p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
          rows={6}
        />
        <div className="mt-2 text-xs text-gray-500 text-right">
          {feedback.comments.length}/500 caractères
        </div>
      </div>

      {/* Résumé du feedback */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 space-y-4">
        <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Résumé de votre évaluation
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Note globale :</span>
              <div className="flex items-center space-x-1">
                {getStars(feedback.rating, feedback.rating, () => {}, 'sm')}
                <span className="text-sm font-bold text-gray-900 ml-2">{feedback.rating}/5</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Recommandation :</span>
              <Badge variant={feedback.wouldRecommend ? 'default' : 'secondary'} className="text-xs">
                {feedback.wouldRecommend ? '👍 Recommande' : '👎 Ne recommande pas'}
              </Badge>
            </div>

            {feedback.followUpNeeded && (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">Suivi :</span>
                <Badge variant="outline" className="text-xs">
                  ⏰ Suivi demandé
                </Badge>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {feedback.strengths.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-1">Points forts ({feedback.strengths.length}) :</span>
                <div className="flex flex-wrap gap-1">
                  {feedback.strengths.slice(0, 3).map((strength, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700">
                      {strength}
                    </Badge>
                  ))}
                  {feedback.strengths.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{feedback.strengths.length - 3} autres
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {feedback.improvementAreas.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-1">Améliorations ({feedback.improvementAreas.length}) :</span>
                <div className="flex flex-wrap gap-1">
                  {feedback.improvementAreas.slice(0, 2).map((area, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-orange-50 text-orange-700">
                      {area}
                    </Badge>
                  ))}
                  {feedback.improvementAreas.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{feedback.improvementAreas.length - 2} autres
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-y-auto">
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <DialogTitle className="text-xl font-bold">
                  {getStepTitle()}
                </DialogTitle>
                <DialogDescription className="text-blue-100">
                  {getStepDescription()}
                </DialogDescription>
                <div className="flex items-center gap-3 text-blue-100 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{appointment.consultantName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>{appointment.title}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-blue-100 mb-2">
                <span>Étape {currentStep} sur 4</span>
                <span>{Math.round((currentStep / 4) * 100)}% terminé</span>
              </div>
              <Progress value={(currentStep / 4) * 100} className="h-2 bg-blue-500/30" />
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Footer avec navigation */}
        <DialogFooter className="flex justify-between items-center p-6 pt-0 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Précédent
          </Button>

          {currentStep < 4 ? (
            <Button onClick={nextStep} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Suivant
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || feedback.rating === 0}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Envoyer mon évaluation
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 