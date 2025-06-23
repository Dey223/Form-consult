'use client'

import { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Calendar,
  Clock,
  User,
  Building2,
  MessageSquare,
  Video,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  XCircle,
  Timer,
  FileText,
  ExternalLink,
  MapPin,
  Star,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ConsultationDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  consultationId: string | null
  onUpdate?: () => void
}

interface AppointmentDetails {
  id: string
  title: string
  description: string
  scheduledAt: string
  duration: number
  status: string
  urgency?: string
  notes?: string
  meetingUrl?: string
  completedAt?: string
  user: {
    id: string
    name: string
    email: string
    phone?: string
  }
  consultant?: {
    id: string
    name: string
    email: string
    specialty?: string
    bio?: string
  }
  company?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export function ConsultationDetailsModal({ 
  isOpen, 
  onClose, 
  consultationId,
  onUpdate 
}: ConsultationDetailsModalProps) {
  const [consultation, setConsultation] = useState<AppointmentDetails | null>(null)
  const [loading, setLoading] = useState(false)

  // Debug des props reçues
  console.log('🎭 ConsultationDetailsModal props reçues:', {
    isOpen,
    consultationId,
    typeOfConsultationId: typeof consultationId,
    consultationIdLength: consultationId?.length,
    isConsultationIdTruthy: !!consultationId
  })

  useEffect(() => {
    console.log('🎭 ConsultationDetailsModal useEffect:', { isOpen, consultationId })
    if (isOpen && consultationId) {
      console.log('📞 Appel fetchConsultationDetails avec ID:', consultationId)
      fetchConsultationDetails()
    }
  }, [isOpen, consultationId])

  const fetchConsultationDetails = async () => {
    if (!consultationId) return
    
    console.log('🔄 fetchConsultationDetails démarré pour ID:', consultationId)
    setLoading(true)
    try {
      const url = `/api/appointments/${consultationId}`
      console.log('🌐 Appel API:', url)
      
      const response = await fetch(url)
      
      console.log('📥 Réponse API:', { status: response.status, ok: response.ok })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Données reçues:', data)
        setConsultation(data)
      } else {
        const error = await response.json()
        console.error('❌ Erreur API:', error)
        toast.error(error.error || 'Erreur lors du chargement des détails')
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error)
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800'
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800'
      case 'CANCELED': return 'bg-red-100 text-red-800'
      case 'REJECTED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <AlertCircle className="h-4 w-4" />
      case 'ASSIGNED': return <User className="h-4 w-4" />
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4" />
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      case 'CANCELED': return <XCircle className="h-4 w-4" />
      case 'REJECTED': return <XCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'normal': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  const handleJoinMeeting = () => {
    if (consultation?.meetingUrl) {
      window.open(consultation.meetingUrl, '_blank')
    }
  }

  const handleAcceptConsultation = async (consultationId: string) => {
    try {
      const response = await fetch(`/api/appointments/${consultationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'accept' })
      })

      if (response.ok) {
        toast.success('Consultation acceptée avec succès!')
        if (onUpdate) onUpdate()
        onClose()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de l\'acceptation')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'acceptation de la consultation')
    }
  }

  const handleRejectConsultation = async (consultationId: string) => {
    const reason = prompt('Motif du refus (optionnel):')
    if (reason === null) return // Utilisateur a annulé
    
    try {
      const response = await fetch(`/api/appointments/${consultationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'cancel',
          reason: reason || 'Demande rejetée par l\'administrateur'
        })
      })

      if (response.ok) {
        toast.success('Consultation rejetée avec succès!')
        if (onUpdate) onUpdate()
        onClose()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors du rejet')
      }
    } catch (error) {
      toast.error('Erreur lors du rejet de la consultation')
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl mx-4 max-w-[95vw] max-h-[90vh] overflow-y-auto" aria-describedby="consultation-details-description">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span>Détails de la Consultation</span>
          </DialogTitle>
          <p id="consultation-details-description" className="text-sm text-gray-600 sr-only">
            Affichage des détails complets de la consultation sélectionnée
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">Chargement des détails...</span>
          </div>
        ) : consultation ? (
          <div className="space-y-6">
            {/* En-tête avec statut */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-4 md:space-y-0">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">{consultation.title}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={getStatusColor(consultation.status)} variant="secondary">
                    {getStatusIcon(consultation.status)}
                    <span className="ml-1">{consultation.status}</span>
                  </Badge>
                  {consultation.urgency && (
                    <Badge className={getUrgencyColor(consultation.urgency)} variant="secondary">
                      {consultation.urgency.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>
              
              {consultation.meetingUrl && consultation.status === 'CONFIRMED' && (
                <Button onClick={handleJoinMeeting} className="flex items-center space-x-2">
                  <Video className="h-4 w-4" />
                  <span>Rejoindre la réunion</span>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Informations principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Programmation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>Programmation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Date :</span>
                    <span className="font-medium">{formatDate(consultation.scheduledAt).date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Heure :</span>
                    <span className="font-medium">{formatDate(consultation.scheduledAt).time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Timer className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Durée :</span>
                    <span className="font-medium">{consultation.duration} minutes</span>
                  </div>
                  {consultation.completedAt && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">Terminée le :</span>
                      <span className="font-medium">{formatDate(consultation.completedAt).date}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Participants */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <User className="h-4 w-4 text-green-600" />
                    <span>Participants</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Demandeur */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Demandeur</h4>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{consultation.user.name}</p>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Mail className="h-3 w-3" />
                          <span>{consultation.user.email}</span>
                        </div>
                        {consultation.user.phone && (
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Phone className="h-3 w-3" />
                            <span>{consultation.user.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Consultant */}
                  {consultation.consultant ? (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Consultant assigné</h4>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Star className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{consultation.consultant.name}</p>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Mail className="h-3 w-3" />
                            <span>{consultation.consultant.email}</span>
                          </div>
                          {consultation.consultant.specialty && (
                            <p className="text-xs text-blue-600 mt-1">
                              Spécialité: {consultation.consultant.specialty}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3 text-gray-500">
                      <User className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">Aucun consultant assigné</p>
                    </div>
                  )}

                  {/* Entreprise */}
                  {consultation.company && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Entreprise</h4>
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{consultation.company.name}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span>Description de la demande</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {consultation.description || 'Aucune description fournie.'}
                </p>
              </CardContent>
            </Card>

            {/* Notes et commentaires */}
            {consultation.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <MessageSquare className="h-4 w-4 text-orange-600" />
                    <span>Notes et commentaires</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{consultation.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Métadonnées */}
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-base">Informations système</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID de la consultation :</span>
                  <span className="font-mono text-xs bg-white px-2 py-1 rounded">{consultation.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Créée le :</span>
                  <span>{formatDate(consultation.createdAt).date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dernière mise à jour :</span>
                  <span>{formatDate(consultation.updatedAt).date}</span>
                </div>
                {consultation.meetingUrl && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lien de réunion :</span>
                    <span className="text-blue-600">Configuré</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Consultation non trouvée ou inaccessible</p>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose} className="sm:order-last">
            Fermer
          </Button>
          
          {/* Boutons d'action pour les consultations en attente - UNIQUEMENT si pas en cours de chargement */}
          {!loading && consultation?.status === 'PENDING' && (
            <>
              <Button 
                onClick={() => handleRejectConsultation(consultation.id)}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 sm:order-first"
              >
                <X className="h-4 w-4 mr-2" />
                Rejeter
              </Button>
              <Button 
                onClick={() => handleAcceptConsultation(consultation.id)}
                className="bg-green-600 hover:bg-green-700 text-white sm:order-2"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Accepter
              </Button>
            </>
          )}
          
          {!loading && consultation && onUpdate && consultation.status !== 'PENDING' && (
            <Button 
              onClick={() => {
                onUpdate()
                onClose()
              }}
              variant="default"
              className="sm:order-2"
            >
              Actualiser la liste
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 