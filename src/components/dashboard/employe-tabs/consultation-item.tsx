'use client'

import React, { useState } from 'react'
import { 
  Calendar,
  Clock, 
  User, 
  Building,
  Star,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  Video,
  ExternalLink
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConsultationFeedbackForm } from '@/components/feedback/consultation-feedback-form'
import { toast } from 'sonner'

interface ConsultationItemProps {
  consultation: {
    id: string
    title: string
    description?: string
    consultantName: string
    consultantId: string
    date: string
    duration: number
    status: 'PENDING' | 'ASSIGNED' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED' | 'CANCELED'
    company: string
    meetingUrl?: string
    hasFeedback?: boolean
    feedback?: {
      id: string
      rating: number
      createdAt: string
    }
  }
  onFeedbackSubmitted?: () => void
}

export function ConsultationItem({ consultation, onFeedbackSubmitted }: ConsultationItemProps) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

  const getStatusBadge = () => {
    const statusConfig = {
      PENDING: { label: 'En attente', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      ASSIGNED: { label: 'Assignée', variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      CONFIRMED: { label: 'Confirmée', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Refusée', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      COMPLETED: { label: 'Terminée', variant: 'default' as const, color: 'bg-purple-100 text-purple-800' },
      CANCELED: { label: 'Annulée', variant: 'destructive' as const, color: 'bg-gray-100 text-gray-800' }
    }

    const config = statusConfig[consultation.status as keyof typeof statusConfig]
    
    // Protection contre les statuts inattendus
    if (!config) {
      console.warn('Status non reconnu:', consultation.status)
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {consultation.status || 'Inconnu'}
        </span>
      )
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleFeedbackSubmit = async (feedbackData: any) => {
    setIsSubmittingFeedback(true)
    
    try {
      const response = await fetch('/api/feedback/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointmentId: consultation.id,
          ...feedbackData
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de l\'envoi')
      }

      const result = await response.json()
      toast.success('Votre retour a été envoyé avec succès !')
      
      setShowFeedbackForm(false)
      onFeedbackSubmitted?.()
      
    } catch (error) {
      console.error('Erreur envoi feedback:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'envoi')
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  const canLeaveFeedback = consultation.status === 'COMPLETED' && !consultation.hasFeedback

  const handleJoinMeeting = () => {
    if (consultation.meetingUrl) {
      window.open(consultation.meetingUrl, '_blank')
    }
  }

  const isUpcoming = () => {
    const consultationDate = new Date(consultation.date)
    const now = new Date()
    const timeDiff = consultationDate.getTime() - now.getTime()
    const hoursDiff = timeDiff / (1000 * 60 * 60)
    
    // Consultation dans les prochaines 24h
    return hoursDiff > 0 && hoursDiff <= 24
  }

  const canJoinMeeting = consultation.status === 'CONFIRMED' && consultation.meetingUrl

  return (
    <>
      <Card className={`hover:shadow-md transition-shadow ${isUpcoming() && canJoinMeeting ? 'ring-2 ring-green-200 bg-green-50' : ''}`}>
        <CardContent className="p-6">
          {/* Alert pour consultation imminente */}
          {isUpcoming() && canJoinMeeting && (
            <div className="mb-4 p-3 bg-green-100 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Consultation dans les prochaines 24h
                  </span>
                </div>
                <Button
                  onClick={handleJoinMeeting}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Rejoindre maintenant
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{consultation.title}</h3>
                <div className="flex items-center gap-2">
                  {getStatusBadge()}
                  {canJoinMeeting && !isUpcoming() && (
                    <Button
                      onClick={handleJoinMeeting}
                      size="sm"
                      variant="outline"
                      className="border-green-200 text-green-600 hover:bg-green-50"
                    >
                      <Video className="h-4 w-4 mr-1" />
                      Rejoindre
                    </Button>
                  )}
                </div>
              </div>
              
              {consultation.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {consultation.description}
                </p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{consultation.consultantName}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>{consultation.company}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(consultation.date)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(consultation.date)} • {consultation.duration}min</span>
                </div>
                
                {/* Affichage du lien de meeting si disponible ET consultation active */}
                {consultation.meetingUrl && consultation.status === 'CONFIRMED' && (
                  <div className="flex items-center gap-2 md:col-span-2">
                    <Video className="h-4 w-4 text-green-600" />
                    <span className="text-green-700 font-medium">Lien de visioconférence disponible</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section feedback */}
          <div className="border-t pt-4">
            {consultation.hasFeedback && consultation.feedback ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Évaluation envoyée</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: consultation.feedback.rating }, (_, i) => (
                      <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">
                      {consultation.feedback.rating}/5
                    </span>
                  </div>
                </div>
                
                <span className="text-xs text-gray-500">
                  {new Date(consultation.feedback.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            ) : canLeaveFeedback ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-orange-700">
                    Votre retour nous aiderait à améliorer nos services
                  </span>
                </div>
                
                <Button
                  onClick={() => setShowFeedbackForm(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Laisser un avis
                </Button>
              </div>
            ) : consultation.status === 'COMPLETED' ? (
              <div className="flex items-center gap-2 text-gray-500">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">En attente de retour</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {consultation.status === 'PENDING' && 'En attente de confirmation'}
                  {consultation.status === 'ASSIGNED' && 'Consultation assignée'}
                  {consultation.status === 'CONFIRMED' && 'Consultation programmée'}
                  {consultation.status === 'REJECTED' && 'Consultation refusée'}
                  {consultation.status === 'CANCELED' && 'Consultation annulée'}
                </div>
                
                {/* Bouton rejoindre pour les consultations confirmées */}
                {canJoinMeeting && (
                  <Button
                    onClick={handleJoinMeeting}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Rejoindre la consultation
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de feedback */}
      <ConsultationFeedbackForm
        appointment={{
          id: consultation.id,
          title: consultation.title,
          consultantName: consultation.consultantName,
          date: consultation.date,
          duration: consultation.duration,
          description: consultation.description
        }}
        open={showFeedbackForm}
        onClose={() => setShowFeedbackForm(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </>
  )
} 