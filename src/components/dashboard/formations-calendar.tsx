'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Users, MapPin, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface FormationSession {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  location: string
  maxAttendees: number
  availableSpots: number
  instructor: {
    name: string
    email: string
  }
  formation: {
    title: string
    level: string
  }
  userAttendance: {
    isConfirmed: boolean
  } | null
}

interface CalendarDay {
  date: Date
  sessions: FormationSession[]
  isCurrentMonth: boolean
  isToday: boolean
}

export default function FormationsCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [sessions, setSessions] = useState<FormationSession[]>([])
  const [selectedSession, setSelectedSession] = useState<FormationSession | null>(null)
  const [view, setView] = useState<'month' | 'week'>('month')
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'registered' | 'available'>('all')

  useEffect(() => {
    fetchSessions()
  }, [currentDate])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const month = currentDate.toISOString().slice(0, 7) // YYYY-MM
      const response = await fetch(`/api/formations/sessions?month=${month}`)
      
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Erreur chargement sessions:', error)
      toast.error('Erreur lors du chargement des sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleSessionAction = async (sessionId: string, action: 'register' | 'unregister') => {
    try {
      const response = await fetch('/api/formations/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, action })
      })

      if (response.ok) {
        toast.success(action === 'register' ? 'Inscription réussie!' : 'Désinscription réussie!')
        fetchSessions() // Recharger les données
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de l\'action')
      }
    } catch (error) {
      console.error('Erreur action session:', error)
      toast.error('Erreur lors de l\'action')
    }
  }

  const getCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // Premier jour du mois et dernier jour
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // Premiers jours affichés (pour compléter la semaine)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    // Derniers jours affichés
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
    
    const days: CalendarDay[] = []
    const current = new Date(startDate)
    const today = new Date()
    
    while (current <= endDate) {
      const dayDate = new Date(current)
      const dayKey = dayDate.toISOString().split('T')[0]
      
      // Filtrer les sessions pour ce jour
      const daySessions = sessions.filter(session => 
        session.startDate.split('T')[0] === dayKey &&
        (filter === 'all' || 
         (filter === 'registered' && session.userAttendance?.isConfirmed) ||
         (filter === 'available' && !session.userAttendance && session.availableSpots > 0))
      )
      
      days.push({
        date: dayDate,
        sessions: daySessions,
        isCurrentMonth: dayDate.getMonth() === month,
        isToday: dayDate.toDateString() === today.toDateString()
      })
      
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSessionStatusColor = (session: FormationSession) => {
    if (session.userAttendance?.isConfirmed) return 'bg-green-500'
    if (session.availableSpots === 0) return 'bg-red-500'
    return 'bg-blue-500'
  }

  const calendarDays = getCalendarDays()

  return (
    <div className="space-y-6">
      {/* En-tête avec navigation et filtres */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendrier des Formations
            </CardTitle>
            
            <div className="flex items-center gap-4">
              {/* Filtres */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="all">Toutes</option>
                  <option value="registered">Mes inscriptions</option>
                  <option value="available">Disponibles</option>
                </select>
              </div>

              {/* Navigation mois */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="min-w-[150px] text-center font-medium">
                  {currentDate.toLocaleDateString('fr-FR', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </div>
                
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Grille calendrier */}
          <div className="grid grid-cols-7 gap-1">
            {/* En-têtes jours */}
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
            
            {/* Cases jours */}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`
                  min-h-[100px] p-1 border border-gray-200 
                  ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
                  ${day.isToday ? 'bg-blue-50 border-blue-300' : ''}
                `}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm ${day.isToday ? 'font-bold text-blue-600' : ''}`}>
                    {day.date.getDate()}
                  </span>
                  {day.sessions.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {day.sessions.length}
                    </Badge>
                  )}
                </div>
                
                {/* Sessions du jour */}
                <div className="space-y-1">
                  {day.sessions.slice(0, 2).map(session => (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className={`
                        text-xs p-1 rounded cursor-pointer text-white
                        ${getSessionStatusColor(session)}
                        hover:opacity-80 transition-opacity
                      `}
                    >
                      <div className="truncate font-medium">
                        {session.formation.title}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {formatTime(session.startDate)}
                      </div>
                    </div>
                  ))}
                  
                  {day.sessions.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{day.sessions.length - 2} autres
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal détails session */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedSession.formation.title}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSession(null)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Détails de la session</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(selectedSession.startDate).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formatTime(selectedSession.startDate)} - {formatTime(selectedSession.endDate)}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {selectedSession.location}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {selectedSession.availableSpots}/{selectedSession.maxAttendees} places disponibles
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-1">Formateur</h4>
                <p className="text-sm text-gray-600">{selectedSession.instructor.name}</p>
              </div>

              <div>
                <h4 className="font-medium mb-1">Niveau</h4>
                <Badge variant="outline">{selectedSession.formation.level}</Badge>
              </div>

              {selectedSession.description && (
                <div>
                  <h4 className="font-medium mb-1">Description</h4>
                  <p className="text-sm text-gray-600">{selectedSession.description}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                {selectedSession.userAttendance?.isConfirmed ? (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleSessionAction(selectedSession.id, 'unregister')}
                  >
                    Se désinscrire
                  </Button>
                ) : selectedSession.availableSpots > 0 ? (
                  <Button
                    className="flex-1"
                    onClick={() => handleSessionAction(selectedSession.id, 'register')}
                  >
                    S'inscrire
                  </Button>
                ) : (
                  <Button disabled className="flex-1">
                    Session complète
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Légende */}
      <Card>
        <CardContent className="py-4">
          <h4 className="font-medium mb-3">Légende</h4>
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Inscrit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Complet</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 