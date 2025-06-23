'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Calendar,
  Filter,
  Plus,
  Search,
  Users,
  Clock,
  CheckCircle,
  MessageSquare,
  TrendingUp,
  Video,
  ExternalLink,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConsultationItem } from './consultation-item'
import { CreateConsultationModal } from '@/components/dashboard/modals/create-consultation-modal'
import { toast } from 'sonner'

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
  meetingUrl?: string
  hasFeedback?: boolean
  feedback?: {
    id: string
    rating: number
    createdAt: string
  }
}

export function ConsultationsTab() {
  const { data: session } = useSession()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showConsultationModal, setShowConsultationModal] = useState(false)

  useEffect(() => {
    fetchConsultations()
  }, [])

  const fetchConsultations = async () => {
    try {
      setLoading(true)
      
      // Appel API réel
      const response = await fetch('/api/appointments/my-consultations')
      
      if (response.ok) {
        const data = await response.json()
        setConsultations(data.appointments || [])
        console.log('✅ Consultations chargées:', data.appointments?.length || 0)
      } else {
        console.error('❌ Erreur API:', response.status, response.statusText)
        
        // Gestion des erreurs spécifiques
        if (response.status === 401) {
          toast.error('Session expirée, veuillez vous reconnecter')
        } else if (response.status === 403) {
          toast.error('Accès non autorisé')
        } else {
          toast.error('Erreur lors du chargement des consultations')
        }
        
        // Pas de données de fallback - tableau vide
        setConsultations([])
      }
    } catch (error) {
      console.error('Erreur chargement consultations:', error)
      toast.error('Erreur de connexion au serveur')
      setConsultations([]) // Tableau vide en cas d'erreur
    } finally {
      setLoading(false)
    }
  }

  const filteredConsultations = consultations.filter(consultation => {
    const matchesFilter = activeFilter === 'all' || consultation.status.toLowerCase() === activeFilter
    const matchesSearch = consultation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.consultantName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getStats = () => {
    const total = consultations.length
    const completed = consultations.filter(c => c.status === 'COMPLETED').length
    const pending = consultations.filter(c => c.status === 'PENDING').length
    const feedbackGiven = consultations.filter(c => c.hasFeedback).length
    const feedbackPending = consultations.filter(c => c.status === 'COMPLETED' && !c.hasFeedback).length
    
    // Nouvelles stats pour les consultations à venir
    const upcoming = consultations.filter(c => {
      const consultationDate = new Date(c.date)
      const now = new Date()
      return c.status === 'CONFIRMED' && consultationDate > now
    }).length
    
    const upcomingWithMeeting = consultations.filter(c => {
      const consultationDate = new Date(c.date)
      const now = new Date()
      return c.status === 'CONFIRMED' && consultationDate > now && c.meetingUrl
    }).length

    return { total, completed, pending, feedbackGiven, feedbackPending, upcoming, upcomingWithMeeting }
  }

  const stats = getStats()

  // Fonction pour obtenir les consultations à venir avec lien de meeting
  const getUpcomingConsultationsWithMeeting = () => {
    const now = new Date()
    return consultations.filter(c => {
      const consultationDate = new Date(c.date)
      const timeDiff = consultationDate.getTime() - now.getTime()
      const hoursDiff = timeDiff / (1000 * 60 * 60)
      
      return c.status === 'CONFIRMED' && 
             c.meetingUrl && 
             hoursDiff > 0 && 
             hoursDiff <= 72 // Prochaines 72h
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const upcomingMeetings = getUpcomingConsultationsWithMeeting()

  const handleFeedbackSubmitted = () => {
    // Recharger les données
    fetchConsultations()
  }

  const handleConsultationSuccess = () => {
    // Recharger les consultations après création
    fetchConsultations()
    toast.success('Demande de consultation envoyée avec succès !')
  }

  const handleRequestConsultation = () => {
    // Ouvrir le modal de demande de consultation
    setShowConsultationModal(true)
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="h-32 bg-gray-100"></CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Mes Consultations
            </CardTitle>
            <Button 
              onClick={handleRequestConsultation}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Demander une consultation
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Section consultations à venir avec lien de meeting */}
      {upcomingMeetings.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Video className="h-5 w-5" />
              Consultations à venir
              <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {upcomingMeetings.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingMeetings.map((consultation) => {
                const consultationDate = new Date(consultation.date)
                const now = new Date()
                const timeDiff = consultationDate.getTime() - now.getTime()
                const hoursDiff = timeDiff / (1000 * 60 * 60)
                const isImminente = hoursDiff <= 24
                
                return (
                  <div 
                    key={consultation.id} 
                    className={`p-4 rounded-lg border ${isImminente ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{consultation.title}</h4>
                          {isImminente && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Dans {Math.round(hoursDiff)}h
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {consultationDate.toLocaleDateString('fr-FR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {consultationDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {consultation.consultantName}
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => window.open(consultation.meetingUrl, '_blank')}
                        className={`${isImminente ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}`}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        {isImminente ? 'Rejoindre maintenant' : 'Rejoindre'}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">À venir</p>
                <p className="text-2xl font-bold text-green-600">{stats.upcoming}</p>
              </div>
              <Video className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Terminées</p>
                <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avis donnés</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.feedbackGiven}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avis à donner</p>
                <p className="text-2xl font-bold text-red-600">{stats.feedbackPending}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Filtres */}
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'Toutes', count: stats.total },
                { key: 'pending', label: 'En attente', count: stats.pending },
                { key: 'confirmed', label: 'Confirmées', count: consultations.filter(c => c.status === 'CONFIRMED').length },
                { key: 'completed', label: 'Terminées', count: stats.completed }
              ].map(({ key, label, count }) => (
                <Button
                  key={key}
                  variant={activeFilter === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter(key as any)}
                  className="relative"
                >
                  {label}
                  {count > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 text-xs">
                      {count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une consultation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert pour retours en attente */}
      {stats.feedbackPending > 0 && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">
                  {stats.feedbackPending} consultation{stats.feedbackPending > 1 ? 's' : ''} en attente de votre retour
                </p>
                <p className="text-sm text-orange-700">
                  Vos évaluations nous aident à améliorer la qualité de nos services.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des consultations */}
      <div className="space-y-4">
        {filteredConsultations.length > 0 ? (
          filteredConsultations.map((consultation) => (
            <ConsultationItem
              key={consultation.id}
              consultation={consultation}
              onFeedbackSubmitted={handleFeedbackSubmitted}
            />
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune consultation trouvée
              </h3>
              <p className="text-gray-600 mb-4">
                {activeFilter === 'all' 
                  ? "Vous n'avez pas encore de consultations programmées."
                  : `Aucune consultation avec le statut "${activeFilter}".`
                }
              </p>
              <Button onClick={handleRequestConsultation}>
                <Plus className="h-4 w-4 mr-2" />
                Demander une consultation
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

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