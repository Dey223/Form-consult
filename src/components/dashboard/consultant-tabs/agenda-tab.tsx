'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  User, 
  Video, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Filter,
  Eye
} from 'lucide-react'
import { toast } from 'react-hot-toast'
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
  company?: {
    id: string
    name: string
  }
  meetingUrl?: string
}

export function AgendaTab() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/appointments')
      
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments || [])
      } else {
        toast.error('Erreur lors du chargement des consultations')
      }
    } catch (error) {
      console.error('Erreur chargement:', error)
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Jours du mois précédent pour compléter la première semaine
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDay = new Date(year, month, -i)
      days.push({ date: prevDay, isCurrentMonth: false, appointments: [] })
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day)
      const dayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.scheduledAt)
        return aptDate.toDateString() === currentDay.toDateString()
      })
      days.push({ date: currentDay, isCurrentMonth: true, appointments: dayAppointments })
    }
    
    // Jours du mois suivant pour compléter la dernière semaine
    const totalCells = Math.ceil(days.length / 7) * 7
    for (let day = 1; days.length < totalCells; day++) {
      const nextDay = new Date(year, month + 1, day)
      days.push({ date: nextDay, isCurrentMonth: false, appointments: [] })
    }
    
    return days
  }

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ASSIGNED: 'bg-blue-100 text-blue-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-purple-100 text-purple-800',
      CANCELED: 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || colors.PENDING
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleViewDetails = (appointmentId: string) => {
    setSelectedAppointment(appointmentId)
    setShowDetailsModal(true)
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Chargement de l'agenda...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">Mon Agenda</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Aujourd'hui
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['month', 'week', 'day'] as const).map((viewType) => (
              <Button
                key={viewType}
                variant={view === viewType ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView(viewType)}
                className="px-3 py-1 text-xs"
              >
                {viewType === 'month' ? 'Mois' : viewType === 'week' ? 'Semaine' : 'Jour'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Titre du mois */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
      </div>

      {/* Calendrier */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {/* En-têtes des jours */}
        <div className="grid grid-cols-7 bg-gray-50">
          {dayNames.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        {/* Grille du calendrier */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const isToday = day.date.toDateString() === new Date().toDateString()
            
            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-b border-r border-gray-200 ${
                  !day.isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                } ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  !day.isCurrentMonth ? 'text-gray-400' : 
                  isToday ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {day.date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {day.appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="text-xs p-1 rounded cursor-pointer hover:shadow-sm transition-shadow"
                      onClick={() => handleViewDetails(appointment.id)}
                    >
                      <div className={`px-2 py-1 rounded ${getStatusColor(appointment.status)}`}>
                        <div className="font-medium truncate" title={appointment.title}>
                          {new Date(appointment.scheduledAt).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} - {appointment.title}
                        </div>
                        <div className="truncate" title={appointment.user.name}>
                          avec {appointment.user.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Légende */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Légende des statuts</h4>
        <div className="flex flex-wrap gap-4">
          {[
            { status: 'PENDING', label: 'En attente' },
            { status: 'ASSIGNED', label: 'Assignée' },
            { status: 'CONFIRMED', label: 'Confirmée' },
            { status: 'COMPLETED', label: 'Terminée' },
            { status: 'REJECTED', label: 'Refusée' },
            { status: 'CANCELED', label: 'Annulée' }
          ].map(({ status, label }) => (
            <div key={status} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded ${getStatusColor(status)}`}></div>
              <span className="text-sm text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Prochaines consultations */}
      <div className="bg-white rounded-lg border p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Prochaines consultations</h4>
        <div className="space-y-3">
          {appointments
            .filter(apt => new Date(apt.scheduledAt) > new Date() && apt.status === 'CONFIRMED')
            .slice(0, 5)
            .map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{appointment.title}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(appointment.scheduledAt).toLocaleDateString('fr-FR')} à{' '}
                      {new Date(appointment.scheduledAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-sm text-gray-500">avec {appointment.user.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {appointment.meetingUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(appointment.meetingUrl, '_blank')}
                    >
                      <Video className="h-4 w-4 mr-1" />
                      Rejoindre
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(appointment.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Détails
                  </Button>
                </div>
              </div>
            ))}
          
          {appointments.filter(apt => new Date(apt.scheduledAt) > new Date() && apt.status === 'CONFIRMED').length === 0 && (
            <p className="text-gray-500 text-center py-4">Aucune consultation confirmée à venir</p>
          )}
        </div>
      </div>

      {/* Modal de détails */}
      {showDetailsModal && selectedAppointment && (
        <ConsultationDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedAppointment(null)
          }}
          appointmentId={selectedAppointment}
        />
      )}
    </div>
  )
} 