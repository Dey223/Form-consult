'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Video,
  CheckCircle,
  X,
  AlertCircle,
  MessageSquare,
  ExternalLink,
  Eye,
  Filter,
  Search
} from 'lucide-react'
import toast from 'react-hot-toast'
import { AcceptConsultationModal } from './modals/AcceptConsultationModal'
import { ConsultationDetailsModal } from './modals/consultation-details-modal'

interface Appointment {
  id: string
  title: string
  description: string
  scheduledAt: string
  duration: number
  status: 'PENDING' | 'ASSIGNED' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED' | 'CANCELED'
  urgency?: 'low' | 'normal' | 'high'
  user: {
    id: string
    name: string
    email: string
  }
  consultant?: {
    id: string
    name: string
    email: string
  }
  company?: {
    id: string
    name: string
  }
  meetingUrl?: string
  createdAt: string
  updatedAt: string
}

export function ConsultationList() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<{
    id: string
    title: string
  } | null>(null)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments')
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments || [])
      } else {
        toast.error('Erreur lors du chargement des consultations')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (appointmentId: string, appointmentTitle: string) => {
    setSelectedAppointment({ id: appointmentId, title: appointmentTitle })
    setShowAcceptModal(true)
  }

  const handleAcceptSuccess = () => {
    fetchAppointments()
    setShowAcceptModal(false)
    setSelectedAppointment(null)
  }

  const handleRefuse = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' })
      })

      if (response.ok) {
        toast.success('Consultation refusée')
        fetchAppointments()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erreur lors du refus')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    }
  }

  const handleComplete = async (appointmentId: string) => {
    try {
      // Demander confirmation et durée réelle
      const actualDuration = prompt('Durée réelle de la consultation (en minutes):', '60')
      
      if (actualDuration === null) return // Utilisateur a annulé
      
      const duration = parseInt(actualDuration)
      if (isNaN(duration) || duration <= 0) {
        toast.error('Veuillez entrer une durée valide en minutes')
        return
      }

      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'COMPLETED',
          actualDuration: duration,
          notes: `Session terminée par le consultant. Durée réelle: ${duration} minutes.`
        })
      })

      if (response.ok) {
        toast.success('Consultation marquée comme terminée !')
        fetchAppointments()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    }
  }

  const handleViewDetails = (appointmentId: string) => {
    setSelectedAppointment({ id: appointmentId, title: '' })
    setShowDetailsModal(true)
  }

  const getStatusBadge = (status: string, urgency: string) => {
    const statusStyles = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      ASSIGNED: 'bg-blue-100 text-blue-800 border-blue-200',
      CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
      COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
      CANCELED: 'bg-gray-100 text-gray-600 border-gray-200'
    }

    const statusLabels = {
      PENDING: 'En attente',
      ASSIGNED: 'Assignée',
      CONFIRMED: 'Confirmée',
      REJECTED: 'Refusée',
      COMPLETED: 'Terminée',
      CANCELED: 'Annulée'
    }

    const urgencyIcon = urgency === 'high' ? '🔴' : urgency === 'normal' ? '🟡' : '🟢'

    return (
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusStyles[status as keyof typeof statusStyles]}`}>
          {statusLabels[status as keyof typeof statusLabels]}
        </span>
        <span className="text-xs">{urgencyIcon}</span>
      </div>
    )
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesFilter = filter === 'all' || appointment.status === filter
    const matchesSearch = appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une consultation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Tous les statuts</option>
          <option value="PENDING">En attente</option>
          <option value="ASSIGNED">Assignées</option>
          <option value="CONFIRMED">Confirmées</option>
          <option value="COMPLETED">Terminées</option>
          <option value="REJECTED">Refusées</option>
          <option value="CANCELED">Annulées</option>
        </select>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'Aucune consultation pour le moment' 
              : `Aucune consultation avec le statut "${filter}"`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">{appointment.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{appointment.description}</p>
                    </div>
                    {getStatusBadge(appointment.status, appointment.urgency || 'normal')}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      {new Date(appointment.scheduledAt).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-green-500" />
                      {new Date(appointment.scheduledAt).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} ({appointment.duration}min)
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-purple-500" />
                      {appointment.user.name}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                      {appointment.company?.name || 'Entreprise non spécifiée'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 lg:ml-6">
                  {appointment.status === 'ASSIGNED' && (
                    <>
                      <Button
                        onClick={() => handleAccept(appointment.id, appointment.title)}
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accepter
                      </Button>
                      <Button
                        onClick={() => handleRefuse(appointment.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Refuser
                      </Button>
                    </>
                  )}
                  
                  {appointment.status === 'CONFIRMED' && (
                    <>
                      <Button
                        onClick={() => handleComplete(appointment.id)}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Terminer
                      </Button>
                      {appointment.meetingUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-200 text-green-600 hover:bg-green-50"
                          onClick={() => window.open(appointment.meetingUrl, '_blank')}
                        >
                          <Video className="h-4 w-4 mr-1" />
                          Rejoindre
                        </Button>
                      )}
                    </>
                  )}
                  
                  {appointment.status === 'COMPLETED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      onClick={() => handleViewDetails(appointment.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir détails
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={() => handleViewDetails(appointment.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Détails
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal d'acceptation */}
      {showAcceptModal && selectedAppointment && (
        <AcceptConsultationModal
          isOpen={showAcceptModal}
          onClose={() => {
            setShowAcceptModal(false)
            setSelectedAppointment(null)
          }}
          appointmentId={selectedAppointment.id}
          appointmentTitle={selectedAppointment.title}
          onAcceptSuccess={handleAcceptSuccess}
        />
      )}

      {/* Modal de détails */}
      {showDetailsModal && selectedAppointment && (
        <ConsultationDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedAppointment(null)
          }}
          consultationId={selectedAppointment.id}
        />
      )}
    </div>
  )
} 