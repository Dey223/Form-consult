'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ConsultationFeedbackForm } from '@/components/feedback/consultation-feedback-form'
import { CreateConsultationModal } from '@/components/dashboard/modals/create-consultation-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Calendar, Clock, User, Building, Plus } from 'lucide-react'

interface Consultation {
  id: string
  title: string
  description?: string
  consultantName: string
  consultantId: string
  date: string
  duration: number
  status: 'PENDING' | 'ASSIGNED' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED' | 'CANCELED'
  company: string
  hasFeedback?: boolean
  feedback?: {
    id: string
    rating: number
    createdAt: string
  }
}

export default function TestFeedbackPage() {
  const { data: session, status } = useSession()
  const [showModal, setShowModal] = useState(false)
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [showConsultationModal, setShowConsultationModal] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchConsultations()
    }
  }, [status])

  const fetchConsultations = async () => {
    try {
      setLoading(true)
      // Appel API réel pour récupérer les consultations de l'employé connecté
      const response = await fetch('/api/appointments/my-consultations')
      
      if (response.ok) {
        const data = await response.json()
        setConsultations(data.appointments || [])
        console.log('✅ Consultations chargées:', data.appointments?.length || 0)
      } else {
        console.error('❌ Erreur API:', response.status, response.statusText)
        if (response.status === 401) {
          toast.error('Session expirée, veuillez vous reconnecter')
        } else if (response.status === 403) {
          toast.error('Accès non autorisé')
        } else {
          toast.error('Erreur lors du chargement des consultations')
        }
        setConsultations([])
      }
    } catch (error) {
      console.error('Erreur chargement consultations:', error)
      toast.error('Erreur de connexion au serveur')
      setConsultations([])
    } finally {
      setLoading(false)
    }
  }

  const handleFeedbackSubmit = async (feedbackData: any) => {
    console.log('📝 Feedback soumis:', feedbackData)
    
    try {
      const response = await fetch('/api/feedback/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointmentId: selectedConsultation?.id,
          ...feedbackData
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        toast.success('Feedback enregistré avec succès !')
        setShowModal(false)
        // Marquer la consultation comme ayant un feedback
        setConsultations(prev => prev.map(c => 
          c.id === selectedConsultation?.id 
            ? { ...c, hasFeedback: true, feedback: { id: result.feedback.id, rating: result.feedback.rating, createdAt: result.feedback.createdAt } }
            : c
        ))
      } else {
        toast.error(result.error || 'Erreur lors de l\'envoi')
      }
    } catch (error) {
      console.error('Erreur envoi feedback:', error)
      toast.error('Erreur de connexion')
    }
  }

  const openFeedbackForm = (consultation: Consultation) => {
    setSelectedConsultation(consultation)
    setShowModal(true)
  }

  const handleRequestConsultation = () => {
    setShowConsultationModal(true)
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      ASSIGNED: { label: 'Assignée', color: 'bg-blue-100 text-blue-800' },
      CONFIRMED: { label: 'Confirmée', color: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Refusée', color: 'bg-red-100 text-red-800' },
      COMPLETED: { label: 'Terminée', color: 'bg-purple-100 text-purple-800' },
      CANCELED: { label: 'Annulée', color: 'bg-gray-100 text-gray-800' }
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    
    // Protection contre les statuts inattendus
    if (!config) {
      console.warn('Status non reconnu:', status)
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {status || 'Inconnu'}
        </span>
      )
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">🔐 Connexion requise</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Vous devez être connecté en tant qu'employé pour tester le formulaire de feedback.
            </p>
            <Button onClick={() => window.location.href = '/auth/signin'}>
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const completedConsultations = consultations.filter(c => c.status === 'COMPLETED')
  const canLeaveFeedback = completedConsultations.filter(c => !c.hasFeedback)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                📝 Test du Formulaire de Feedback
              </h1>
              <p className="text-gray-600">
                Connecté en tant que <strong>{session?.user?.name || session?.user?.email}</strong> 
                ({session?.user?.role})
              </p>
            </div>
            <Button 
              onClick={handleRequestConsultation}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Demander une consultation
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{consultations.length}</div>
              <div className="text-sm text-gray-600">Total consultations</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{completedConsultations.length}</div>
              <div className="text-sm text-gray-600">Terminées</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{canLeaveFeedback.length}</div>
              <div className="text-sm text-gray-600">Feedback à donner</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {completedConsultations.length - canLeaveFeedback.length}
              </div>
              <div className="text-sm text-gray-600">Feedback donnés</div>
            </CardContent>
          </Card>
        </div>
        
        {consultations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-4">Aucune consultation trouvée</p>
              <p className="text-sm text-gray-500 mb-4">
                Assurez-vous d'avoir des consultations dans votre compte
              </p>
              <Button 
                onClick={handleRequestConsultation}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Demander une consultation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {consultations.map((consultation) => (
              <Card key={consultation.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">{consultation.title}</CardTitle>
                    {getStatusBadge(consultation.status)}
                  </div>
                  
                  {consultation.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {consultation.description}
                    </p>
                  )}
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3 text-sm text-gray-600 mb-4">
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
                  </div>

                  {consultation.hasFeedback && consultation.feedback ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="text-sm text-green-800 font-medium">✅ Feedback donné</div>
                      <div className="text-xs text-green-600 mt-1">
                        Note: {consultation.feedback.rating}/5 • 
                        {new Date(consultation.feedback.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  ) : consultation.status === 'COMPLETED' ? (
                    <Button 
                      onClick={() => openFeedbackForm(consultation)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      📝 Laisser un feedback
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled className="w-full">
                      ⏳ {consultation.status === 'CONFIRMED' ? 'En attente' : 'Non disponible'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedConsultation && (
        <ConsultationFeedbackForm
          appointment={selectedConsultation}
          open={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleFeedbackSubmit}
        />
      )}

      {/* Modal de demande de consultation */}
      <CreateConsultationModal
        isOpen={showConsultationModal}
        onClose={() => setShowConsultationModal(false)}
        onSuccess={() => {
          fetchConsultations()
          toast.success('Demande de consultation envoyée avec succès !')
        }}
        userName={session?.user?.name || 'Utilisateur'}
        companyName={session?.user?.companyId ? 'Entreprise associée' : 'FormConsult'}
      />
    </div>
  )
} 