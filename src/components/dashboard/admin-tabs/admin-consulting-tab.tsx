'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar, 
  Clock, 
  Users, 
  Video,
  Phone,
  MessageSquare,
  Plus,
  Search,
  Filter,
  UserCheck,
  MapPin,
  Award,
  TrendingUp,
  Download,
  User,
  Building2,
  Star,
  AlertCircle,
  CheckCircle,
  X,
  Eye,
  Settings,
  ThumbsUp,
  BarChart3
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import AssignConsultantModal from '../modals/assign-consultant-modal'
import { ConsultationDetailsModal } from '../modals/consultation-details-modal'

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
  notes?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

interface Consultant {
  id: string
  name: string
  email: string
  specialty?: string
  bio?: string
  stats: {
    totalAssigned: number
    thisMonth: number
    completed: number
    rating: number
    isAvailable: boolean
  }
}

interface AdminConsultingTabProps {
  onUpdate: () => void
}

export function AdminConsultingTab({ onUpdate }: AdminConsultingTabProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'appointments' | 'consultants'>('appointments')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showConsultationModal, setShowConsultationModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showConsultantFeedbackModal, setShowConsultantFeedbackModal] = useState(false)
  const [selectedConsultantId, setSelectedConsultantId] = useState<string | null>(null)
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null)
  const [consultationIdForModal, setConsultationIdForModal] = useState<string | null>(null)
  const [consultantFeedbackData, setConsultantFeedbackData] = useState<any>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [pendingAction, setPendingAction] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<{
    id: string
  } | null>(null)
  const [filter, setFilter] = useState('all')
  const [consultationRequests, setConsultationRequests] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          fetchAppointments(),
          fetchConsultants(),
          fetchConsultationRequests()
        ])
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments?scope=company')
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments || [])
      }
    } catch (error) {
      toast.error('Impossible de charger les consultations')
    }
  }

  const fetchConsultants = async () => {
    try {
      const response = await fetch('/api/consultants')
      if (response.ok) {
        const data = await response.json()
        setConsultants(data.consultants || [])
      }
    } catch (error) {
      toast.error('Impossible de charger les consultants')
    }
  }

  const fetchConsultationRequests = async () => {
    try {
      console.log('🔄 Chargement des demandes de consultation...')
      const response = await fetch('/api/appointments?status=PENDING')
      
      if (response.ok) {
        const data = await response.json()
        console.log('📋 Demandes reçues:', data)
        setConsultationRequests(data.appointments || [])
      } else {
        const errorData = await response.json()
        console.error('❌ Erreur API:', errorData)
        toast.error('Erreur lors du chargement des demandes')
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error)
      toast.error('Erreur lors du chargement des demandes de consultation')
    }
  }

  const handleAssignConsultant = (appointment: Appointment) => {
    setSelectedAppointment({
      id: appointment.id
    })
    setShowAssignModal(true)
  }

  const handleAssignSuccess = () => {
    fetchAppointments()
    onUpdate()
    toast.success('Consultant assigné avec succès!')
  }

  const handleViewDetails = (appointmentId: string) => {
    console.log('🔍 handleViewDetails appelé avec appointmentId:', appointmentId)
    console.log('📋 consultationIdForModal avant:', consultationIdForModal)
    console.log('🎭 showDetailsModal avant:', showDetailsModal)
    
   
    
    setConsultationIdForModal(appointmentId)
    setShowDetailsModal(true)
    
    console.log('📋 consultationIdForModal après:', appointmentId)
    console.log('🎯 appointmentId à passer à la modal:', appointmentId)
  }

  const handleContactEmployee = (email: string) => {
    window.location.href = `mailto:${email}`
  }

  const handleViewRequestDetails = (requestId: string) => {
    console.log('🔍 handleViewRequestDetails appelé avec requestId:', requestId)
    console.log('📋 consultationIdForModal avant:', consultationIdForModal)
    console.log('🎭 showDetailsModal avant:', showDetailsModal)
    
    setConsultationIdForModal(requestId)
    setShowDetailsModal(true)
    
    console.log('📋 consultationIdForModal après:', requestId)
    console.log('🎯 requestId à passer à la modal:', requestId)
  }

  const handleViewConsultantDetails = (consultantId: string) => {
    setActiveView('appointments')
    console.log('Voir détails consultant:', consultantId)
  }

  const handleViewConsultantFeedback = async (consultantId: string) => {
    try {
      setSelectedConsultantId(consultantId)
      setShowConsultantFeedbackModal(true)
      
      const response = await fetch(`/api/admin/consultant/feedback?consultantId=${consultantId}&period=30d`)
      if (response.ok) {
        const data = await response.json()
        setConsultantFeedbackData(data)
      } else {
        toast.error('Impossible de charger les retours du consultant')
        setConsultantFeedbackData(null)
      }
    } catch (error) {
      console.error('Erreur chargement feedback consultant:', error)
      toast.error('Erreur de connexion')
      setConsultantFeedbackData(null)
    }
  }

  const handleApproveRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/appointments/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'accept' })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Demande approuvée avec succès!')
        fetchConsultationRequests()
        fetchAppointments()
        onUpdate()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de l\'approbation')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'approbation de la demande')
    }
  }

  const handleRejectRequest = (requestId: string) => {
    setPendingAction({ id: requestId, action: 'reject' })
    setShowRejectModal(true)
  }

  const confirmRejectRequest = async () => {
    if (!pendingAction) return

    try {
      const response = await fetch(`/api/appointments/${pendingAction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'cancel',
          reason: rejectionReason || 'Demande rejetée par l\'administrateur'
        })
      })

      if (response.ok) {
        toast.success('Demande rejetée avec succès!')
        fetchConsultationRequests()
        fetchAppointments()
        onUpdate()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors du rejet')
      }
    } catch (error) {
      toast.error('Erreur lors du rejet de la demande')
    } finally {
      setShowRejectModal(false)
      setRejectionReason('')
      setPendingAction(null)
    }
  }

  const getStatusBadge = (status: string, urgency: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', text: 'En attente' },
      'ASSIGNED': { color: 'bg-blue-100 text-blue-800', text: 'Assigné' },
      'CONFIRMED': { color: 'bg-green-100 text-green-800', text: 'Confirmé' },
      'COMPLETED': { color: 'bg-green-100 text-green-800', text: 'Terminé' },
      'REJECTED': { color: 'bg-red-100 text-red-800', text: 'Rejeté' },
      'CANCELED': { color: 'bg-gray-100 text-gray-800', text: 'Annulé' }
    }

    const config = statusConfig[status] || statusConfig['PENDING']
    const urgencyBorder = urgency === 'high' ? 'border-l-4 border-red-500' : ''

    return (
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${urgencyBorder}`}>
        {config.text}
        {urgency === 'high' && <AlertCircle className="ml-1 h-3 w-3" />}
      </div>
    )
  }

  const getUrgencyIndicator = (scheduledAt: string) => {
    const date = new Date(scheduledAt)
    const now = new Date()
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (diffHours < 24) {
      return <span className="text-red-500 text-xs">🔴 Urgent</span>
    } else if (diffHours < 72) {
      return <span className="text-orange-500 text-xs">🟡 Prioritaire</span>
    }
    return <span className="text-green-500 text-xs">🟢 Normal</span>
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesFilter = filter === 'all' || appointment.status === filter
    const matchesSearch = 
      appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.consultant?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getConsultingStats = () => {
    const total = appointments.length
    const completed = appointments.filter(a => a.status === 'COMPLETED').length
    const confirmed = appointments.filter(a => a.status === 'CONFIRMED').length
    const totalHours = appointments
      .filter(a => a.status === 'COMPLETED')
      .reduce((sum, a) => sum + (a.duration || 0), 0) / 60

    return { total, completed, confirmed, totalHours: Math.round(totalHours * 100) / 100 }
  }

  const stats = getConsultingStats()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderAppointments = () => (
    <div className="space-y-6">
      {/* Header avec bouton Gérer Consultations */}
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Gestion des Consultations</h2>
              <p className="text-xs md:text-sm text-gray-600">{stats.total} consultations au total</p>
            </div>
          </div>
          <Button 
            onClick={() => {
             
              fetchConsultationRequests()
              setShowConsultationModal(true)
            }} 
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 w-full md:w-auto"
          >
            <Settings className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm">Gérer Demandes</span>
            {consultationRequests.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[1.25rem] h-5 flex items-center justify-center">
                {consultationRequests.length}
              </span>
            )}
          </Button>

          {/* Bouton de test API - DEBUG */}
        
        </div>
      </div>

      {/* Statistiques - Responsive Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-3 md:p-4 rounded-lg border">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
            <div className="ml-2 md:ml-3">
              <p className="text-xs md:text-sm font-medium text-gray-600">Total</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 md:p-4 rounded-lg border">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
            <div className="ml-2 md:ml-3">
              <p className="text-xs md:text-sm font-medium text-gray-600">Terminées</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 md:p-4 rounded-lg border">
          <div className="flex items-center">
            <Clock className="h-6 w-6 md:h-8 md:w-8 text-purple-500" />
            <div className="ml-2 md:ml-3">
              <p className="text-xs md:text-sm font-medium text-gray-600">En cours</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.confirmed}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 md:p-4 rounded-lg border">
          <div className="flex items-center">
            <Clock className="h-6 w-6 md:h-8 md:w-8 text-orange-500" />
            <div className="ml-2 md:ml-3">
              <p className="text-xs md:text-sm font-medium text-gray-600">Heures</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.totalHours}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche - Mobile Optimized */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-col gap-3 md:flex-row md:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:w-auto"
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
      </div>

      {/* Liste des consultations - Mobile Responsive */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 md:p-12 text-center">
          <Calendar className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-base md:text-lg mb-2">
            {filter === 'all' 
              ? 'Aucune consultation pour le moment' 
              : `Aucune consultation avec le statut "${filter}"`
            }
          </p>
          <p className="text-gray-400 text-sm">
            Les consultations de votre équipe apparaîtront ici
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 mb-1 truncate">{appointment.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{appointment.description}</p>
                      {appointment.notes && (
                        <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          <strong>Notes:</strong> {appointment.notes}
                        </p>
                      )}
                    </div>
                  <div className="ml-4 flex-shrink-0">
                    {getStatusBadge(appointment.status, appointment.urgency || 'normal')}
                  </div>
                  </div>
                  
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
                    <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                    <span className="truncate">{new Date(appointment.scheduledAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                    <span className="truncate">
                      {new Date(appointment.scheduledAt).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} ({appointment.duration}min)
                    </span>
                    </div>
                    <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-purple-500 flex-shrink-0" />
                    <span className="truncate">{appointment.user.name}</span>
                    </div>
                    <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-orange-500 flex-shrink-0" />
                    <span className="truncate">{appointment.consultant?.name || 'Non assigné'}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 flex-1 sm:flex-none"
                    onClick={() => handleViewDetails(appointment.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Détails
                  </Button>
                  
                                    {/* Bouton d'assignation de consultant */}
                  {(appointment.status === 'PENDING' || appointment.status === 'ASSIGNED' || appointment.status === 'CONFIRMED') && !appointment.consultant && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-200 text-green-600 hover:bg-green-50 flex-1 sm:flex-none"
                      onClick={() => handleAssignConsultant(appointment)}
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Assigner consultant</span>
                      <span className="sm:hidden">Assigner</span>
                    </Button>
                  )}
                  
                  
                
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-200 text-gray-600 hover:bg-gray-50 flex-1 sm:flex-none"
                    onClick={() => handleContactEmployee(appointment.user.email)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Contacter employé</span>
                    <span className="sm:hidden">Contact</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderConsultants = () => (
    <div className="space-y-6">
      {/* Header consultants */}
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 className="text-lg font-medium text-gray-900">
            Consultants ({consultants.length})
          </h3>
          
        </div>
      </div>

      {/* Liste des consultants - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {consultants.map((consultant) => (
          <div key={consultant.id} className="bg-white rounded-lg p-4 md:p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-3 md:space-x-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                {consultant.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 mb-1 truncate">{consultant.name}</h4>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{consultant.specialty || 'Spécialité non définie'}</p>
                
                <div className="flex items-center space-x-3 md:space-x-4 text-xs text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Star className="h-3 w-3 mr-1 text-yellow-500" />
                    {consultant.stats.rating}/5
                  </div>
                  <span>{consultant.stats.completed} sessions</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    consultant.stats.isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {consultant.stats.isAvailable ? 'Disponible' : 'Occupé'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {consultant.stats.thisMonth} ce mois
                  </span>
                </div>

                {/* Boutons d'action pour le consultant */}
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => handleViewConsultantDetails(consultant.id)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Détails
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => handleViewConsultantFeedback(consultant.id)}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Retours
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Navigation tabs - Mobile Responsive */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex space-x-4 md:space-x-8 px-4 md:px-6 py-4 overflow-x-auto">
          <button
            onClick={() => setActiveView('appointments')}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeView === 'appointments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Consultations</span>
          </button>
          
          <button
            onClick={() => setActiveView('consultants')}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeView === 'consultants'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Consultants</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {activeView === 'appointments' && renderAppointments()}
      {activeView === 'consultants' && renderConsultants()}

      {/* Modal d'assignation */}
      <AssignConsultantModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        appointmentId={selectedAppointment?.id || ""}
        onAssignSuccess={handleAssignSuccess}
      />

      {/* Modal de détails */}
      <ConsultationDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          console.log('🔒 Fermeture modal - reset consultationIdForModal')
          setShowDetailsModal(false)
          setConsultationIdForModal(null)
        }}
        consultationId={consultationIdForModal}
        onUpdate={() => {
          fetchConsultationRequests()
          fetchAppointments()
          onUpdate()
        }}
      />

      {/* Modal de gestion des demandes de consultation */}
      <Dialog open={showConsultationModal} onOpenChange={setShowConsultationModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="consultation-modal-description">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-purple-600" />
              <span>Gestion des Demandes de Consultation</span>
            </DialogTitle>
            <p id="consultation-modal-description" className="text-sm text-gray-600 mt-2">
              Approuvez ou rejetez les demandes de consultation ({consultationRequests.length})
            </p>
          </DialogHeader>
          
          <div className="mt-6">
            {consultationRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">Aucune demande de consultation en attente</p>
                <p className="text-sm mt-1">Les nouvelles demandes apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-4">
                {consultationRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-lg">{request.title}</h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            request.urgency === 'high' ? 'bg-red-100 text-red-600' :
                            request.urgency === 'normal' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {request.urgency === 'high' ? '🔴 Urgent' : 
                             request.urgency === 'normal' ? '🟡 Normal' : '🟢 Faible'}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">{request.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            <span>{request.user.name}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{new Date(request.createdAt).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{request.duration} min</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 sm:min-w-fit">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 sm:flex-none"
                          onClick={() => handleViewRequestDetails(request.id)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Détails
                        </Button>
                        
                        {request.status === 'PENDING' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 border-red-200 hover:bg-red-50 flex-1 sm:flex-none"
                              onClick={() => handleRejectRequest(request.id)}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Rejeter
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50 flex-1 sm:flex-none"
                              onClick={() => {
                                setSelectedAppointment({ id: request.id })
                                setShowAssignModal(true)
                              }}
                            >
                              <UserCheck className="h-3 w-3 mr-1" />
                              Assigner
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                              onClick={() => handleApproveRequest(request.id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approuver
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal de feedback consultant */}
      <Dialog open={showConsultantFeedbackModal} onOpenChange={setShowConsultantFeedbackModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <span>Retours Client - Consultant</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-6">
            {consultantFeedbackData ? (
              <div className="space-y-6">
                {/* Statistiques principales */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Note Moyenne</p>
                          <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold text-blue-600">
                              {consultantFeedbackData.summary?.averageRating || 0}
                            </p>
                            <div className="flex">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(consultantFeedbackData.summary?.averageRating || 0)
                                      ? 'text-yellow-400 fill-current' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <Star className="h-8 w-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Recommandations</p>
                          <p className="text-2xl font-bold text-green-600">
                            {consultantFeedbackData.summary?.recommendationRate || 0}%
                          </p>
                        </div>
                        <ThumbsUp className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Retours</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {consultantFeedbackData.summary?.totalFeedbacks || 0}
                          </p>
                        </div>
                        <MessageSquare className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Taux de Réponse</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {consultantFeedbackData.summary?.responseRate || 0}%
                          </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Retours récents */}
                <Card>
                  <CardHeader>
                    <CardTitle>Retours Récents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {consultantFeedbackData.recentFeedbacks?.length > 0 ? (
                        consultantFeedbackData.recentFeedbacks.map((feedback: any) => (
                          <div key={feedback.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium">{feedback.client?.name}</h4>
                                <p className="text-sm text-gray-600">{feedback.client?.company}</p>
                                <p className="text-xs text-gray-500 mt-1">{feedback.appointment?.title}</p>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1 mb-1">
                                  {Array.from({ length: 5 }, (_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < feedback.rating 
                                          ? 'text-yellow-400 fill-current' 
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <p className="text-xs text-gray-500">
                                  {new Date(feedback.createdAt).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            </div>
                            
                            {feedback.comments && (
                              <div className="bg-gray-50 rounded p-3 mb-3">
                                <p className="text-sm text-gray-700">{feedback.comments}</p>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <Badge variant={feedback.wouldRecommend ? 'default' : 'secondary'}>
                                {feedback.wouldRecommend ? '👍 Recommande' : '👎 Ne recommande pas'}
                              </Badge>
                              
                              {feedback.improvementAreas && feedback.improvementAreas.length > 0 && (
                                <div className="flex gap-1">
                                  {feedback.improvementAreas.map((area: string, index: number) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {area}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium text-gray-900 mb-2">Aucun retour disponible</p>
                          <p className="text-sm text-gray-600">
                            Les retours clients de ce consultant apparaîtront ici.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des retours...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de rejet avec raison */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la demande de consultation</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raison du rejet (optionnel)
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Expliquez brièvement pourquoi cette demande est rejetée..."
            />
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmRejectRequest}
            >
              Confirmer le rejet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 