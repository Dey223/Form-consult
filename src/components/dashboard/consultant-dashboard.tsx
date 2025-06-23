'use client'

import { useState, useEffect } from 'react'
import { DashboardHeader } from './dashboard-header'
import { PaymentStatus } from '@/components/payment/payment-status'
import { Button } from '@/components/ui/button'
import { ConsultationList } from './consultation-list'
import { NotificationButton } from './layout/notification-button'
import { AgendaTab } from './consultant-tabs/agenda-tab'
import { FeedbackTab } from './consultant-tabs/feedback-tab'
import { 
  Users, 
  BookOpen, 
  TrendingUp,
  Calendar,
  Clock,
  Star,
  MessageSquare,
  Plus,
  Edit,
  Building2,
  Eye,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Filter,
  Download,
  DollarSign,
  Award,
  BarChart3,
  User,
  Settings,
  Save,
  X,
  Camera
} from 'lucide-react'
import { toast } from 'sonner'

interface ConsultantDashboardData {
  consultant: {
    email: string
    name: string
    specialty: string
    phone?: string
    totalSessions: number
    rating: number
    totalFormations: number
  }
  stats: {
    thisMonthSessions: number
    pendingRequests: number
    averageRating: number
    totalStudents: number
  }
  formations: Array<{
    id: string
    title: string
    enrolledStudents: number
    completionRate: number
    avgRating: number
    totalRatings: number
  }>
  upcomingAppointments: Array<{
    id: string
    title: string
    company: string
    date: string
    time: string
    duration: number
    status: 'pending' | 'confirmed' | 'completed'
  }>
}

export function ConsultantDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboardData, setDashboardData] = useState<ConsultantDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  // États pour la gestion du profil
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
 
  })

  // États pour la gestion du mot de passe
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard/consultant')
        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
          // Initialiser profileData avec les données du consultant
          setProfileData({
            name: data.consultant.name || '',
            email: data.consultant.email || '',
            phone: data.consultant.phone || '',
        
          })
        } else {
          console.error('Erreur lors du chargement des données')
        }
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Fonction pour sauvegarder le profil
  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/dashboard/consultant/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      if (response.ok) {
        toast.success('Profil mis à jour avec succès')
        setIsEditingProfile(false)
        // Recharger les données du dashboard
        const updatedResponse = await fetch('/api/dashboard/consultant')
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json()
          setDashboardData(updatedData)
        }
      } else {
        toast.error('Erreur lors de la mise à jour du profil')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la mise à jour du profil')
    }
  }

  // Fonction pour changer le mot de passe
  const handleChangePassword = async () => {
    // Validation
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Le mot de passe actuel est requis'
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'Le nouveau mot de passe est requis'
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères'
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'La confirmation du mot de passe est requise'
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    setPasswordErrors(errors)

    // Si il y a des erreurs, arrêter
    if (Object.values(errors).some(error => error !== '')) {
      return
    }

    try {
      const response = await fetch('/api/dashboard/consultant/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (response.ok) {
        toast.success('Mot de passe modifié avec succès')
        setIsChangingPassword(false)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setPasswordErrors({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        const errorData = await response.json()
        if (response.status === 400 && errorData.error === 'Mot de passe actuel incorrect') {
          setPasswordErrors(prev => ({ ...prev, currentPassword: 'Mot de passe actuel incorrect' }))
        } else {
          toast.error('Erreur lors du changement de mot de passe')
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du changement de mot de passe')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Hero Section avec gradient */}
      <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex items-center space-x-6">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Users className="h-10 w-10 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{dashboardData?.consultant.name}</h2>
            <p className="text-blue-100 text-lg mb-3">{dashboardData?.consultant.specialty}</p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Star className="h-5 w-5 text-yellow-300 mr-2" />
                <span className="font-semibold">{dashboardData?.consultant.rating}/5</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                <span>{dashboardData?.consultant.totalSessions} sessions</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                <span>{dashboardData?.consultant.totalFormations} formations</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Button variant="secondary" className="bg-white/20 hover:bg-white/30 border-white/30">
              <Edit className="h-4 w-4 mr-2" />
              Modifier profil
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards améliorées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-700">Sessions ce mois</p>
              <p className="text-2xl font-bold text-blue-900">{dashboardData?.stats.thisMonthSessions}</p>
              <p className="text-xs text-blue-600">📈 +12% vs mois dernier</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-700">Demandes en attente</p>
              <p className="text-2xl font-bold text-orange-900">{dashboardData?.stats.pendingRequests}</p>
              <p className="text-xs text-orange-600">⚡ Traitement rapide requis</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-700">Note moyenne</p>
              <p className="text-2xl font-bold text-yellow-900">{dashboardData?.stats.averageRating}/5</p>
              <p className="text-xs text-yellow-600">⭐ Excellente réputation</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
                              <p className="text-sm font-medium text-green-700">Apprenants formés</p>
              <p className="text-2xl font-bold text-green-900">{dashboardData?.stats.totalStudents}</p>
              <p className="text-xs text-green-600">🎯 Impact grandissant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Actions Rapides */}
      <div className="bg-white rounded-xl p-6 shadow-lg border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle formation
          </Button>
          <Button variant="outline" className="flex items-center justify-center border-green-200 hover:bg-green-50">
            <Calendar className="h-4 w-4 mr-2" />
            Voir le calendrier
          </Button>
          <Button variant="outline" className="flex items-center justify-center border-purple-200 hover:bg-purple-50">
            <MessageSquare className="h-4 w-4 mr-2" />
            Centre de messages
          </Button>
          <Button variant="outline" className="flex items-center justify-center border-yellow-200 hover:bg-yellow-50">
            <TrendingUp className="h-4 w-4 mr-2" />
            Statistiques
          </Button>
        </div>
      </div>

      {/* Prochains rendez-vous modernisés */}
      <div className="bg-white rounded-xl p-6 shadow-lg border">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Prochains rendez-vous</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50">
              <Calendar className="h-4 w-4 mr-2" />
              Calendrier complet
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-green-500 to-green-600">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau RDV
            </Button>
          </div>
        </div>
        
        {(!dashboardData?.upcomingAppointments || dashboardData.upcomingAppointments.length === 0) ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rendez-vous planifié</h3>
            <p className="text-gray-600 mb-4">Votre agenda est libre pour le moment.</p>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Planifier un rendez-vous
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardData?.upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-gradient-to-r from-gray-50 to-white border rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{appointment.title}</h4>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Building2 className="h-4 w-4 mr-1" />
                      {appointment.company}
                    </p>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    appointment.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : appointment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status === 'confirmed' ? '✅ Confirmé' : 
                     appointment.status === 'pending' ? '⏳ En attente' : '✔️ Terminé'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {appointment.date} à {appointment.time}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {appointment.duration} minutes
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Contact
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderFormations = () => (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="bg-white rounded-xl p-6 shadow-lg border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Les formations</h3>
            <p className="text-sm text-gray-600">Voir les formations et suivez leurs performances</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle formation
            </Button>
          </div>
        </div>
      </div>

      {/* Grille des formations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardData?.formations.map((formation) => (
          <div key={formation.id} className="bg-white rounded-xl shadow-lg border hover:shadow-xl transition-all duration-300 overflow-hidden">
            {/* Image avec gradient */}
            <div className="h-40 bg-gradient-to-br from-purple-400 via-blue-500 to-teal-500 relative">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-white/80" />
              </div>
              <div className="absolute top-3 right-3">
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                  {formation.avgRating}⭐ ({formation.totalRatings})
                </span>
              </div>
            </div>
            
            {/* Contenu */}
            <div className="p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
                {formation.title}
              </h3>
              
              {/* Métriques */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{formation.enrolledStudents} apprenants inscrits</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>{formation.completionRate}% de taux de complétion</span>
                </div>
              </div>
              
              {/* Barre de progression */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Complétion</span>
                  <span className="font-medium">{formation.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${formation.completionRate}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex space-x-2">
                <Button size="sm" variant="ghost" className="flex-1 hover:bg-blue-50">
                  <Eye className="h-4 w-4 mr-1" />
                  Voir
                </Button>
               
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* État vide */}
      {(!dashboardData?.formations || dashboardData.formations.length === 0) && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg border">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune formation créée</h3>
          <p className="text-gray-600 mb-6">Commencez à partager votre expertise en créant votre première formation.</p>
          <Button className="bg-gradient-to-r from-blue-500 to-blue-600">
            <Plus className="h-4 w-4 mr-2" />
            Créer ma première formation
          </Button>
        </div>
      )}
    </div>
  )

  const renderConsulting = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Gestion du consulting</h3>
            <p className="text-sm text-gray-600">Planifiez et gérez vos sessions de consulting</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer par statut
            </Button>
            <Button variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button className="bg-gradient-to-r from-green-500 to-green-600">
              <Plus className="h-4 w-4 mr-2" />
              Définir disponibilités
            </Button>
          </div>
        </div>
      </div>

      {/* Stats consultations */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-700">Consultations ce mois</p>
              <p className="text-2xl font-bold text-blue-900">
                {dashboardData?.stats.thisMonthSessions || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-700">En attente</p>
              <p className="text-2xl font-bold text-orange-900">
                {dashboardData?.stats.pendingRequests || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-700">Terminées</p>
              <p className="text-2xl font-bold text-green-900">
                {dashboardData?.consultant.totalSessions || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-700">Note moyenne</p>
              <p className="text-2xl font-bold text-purple-900">
                {dashboardData?.consultant.rating || 0}/5
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mes consultations */}
      <div className="bg-white rounded-xl p-6 shadow-lg border">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Mes consultations</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
          </div>
        </div>

        {/* Liste des consultations */}
        <ConsultationList />
      </div>

      {/* Vue calendrier simplifiée */}
      <div className="bg-white rounded-xl p-6 shadow-lg border">
        <h4 className="font-medium text-gray-900 mb-4">Disponibilités cette semaine</h4>
        <div className="grid grid-cols-7 gap-2">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
            <div key={day} className="text-center">
              <div className="text-sm font-medium text-gray-700 mb-2">{day}</div>
              <div className="space-y-1">
                <div className="bg-green-100 text-green-800 text-xs p-1 rounded">9h-12h</div>
                <div className="bg-blue-100 text-blue-800 text-xs p-1 rounded">14h-17h</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderFeedback = () => <FeedbackTab />

  const renderProfile = () => {
    if (!dashboardData?.consultant) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Chargement du profil...</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Mon Profil</h3>
          <Button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            variant={isEditingProfile ? "outline" : "default"}
          >
            {isEditingProfile ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Annuler
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section Avatar */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
                {isEditingProfile && (
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

              <h4 className="text-xl font-semibold text-gray-900">
                {dashboardData.consultant.name}
              </h4>
              <p className="text-gray-600">Consultant</p>
              <p className="text-sm text-gray-500 mt-1">{dashboardData.consultant.specialty}</p>

              <div className="mt-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-900">
                    {dashboardData.consultant.rating}/5
                  </span>
                  <span className="text-sm text-gray-500">
                    ({dashboardData.consultant.totalSessions} sessions)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section Informations */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border">
            <h4 className="text-lg font-semibold text-gray-900 mb-6">
              Informations personnelles
            </h4>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={isEditingProfile ? profileData.name : dashboardData.consultant.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    disabled={!isEditingProfile}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEditingProfile
                        ? 'border-gray-300 bg-white'
                        : 'border-gray-200 bg-gray-50'
                      }`}
                  />
                </div>

              

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={isEditingProfile ? profileData.phone : (dashboardData.consultant.phone || '')}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    disabled={!isEditingProfile}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEditingProfile
                        ? 'border-gray-300 bg-white'
                        : 'border-gray-200 bg-gray-50'
                      }`}
                    placeholder="Votre numéro de téléphone"
                  />
                </div>

              
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={isEditingProfile ? profileData.email : dashboardData?.consultant.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!isEditingProfile}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEditingProfile
                        ? 'border-gray-300 bg-white'
                        : 'border-gray-200 bg-gray-50'
                      }`}
                      placeholder="Votre email"
                  />
                </div>

                
              </div>



             
                

              {isEditingProfile && (
                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    onClick={handleSaveProfile}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder les modifications
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Section Sécurité */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-semibold text-gray-900">Sécurité</h4>
            <Button
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              variant={isChangingPassword ? "outline" : "default"}
              size="sm"
            >
              {isChangingPassword ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 mr-2" />
                  Changer le mot de passe
                </>
              )}
            </Button>
          </div>

          {isChangingPassword ? (
            <form className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    if (passwordErrors.currentPassword) {
                      setPasswordErrors(prev => ({ ...prev, currentPassword: '' }))
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${passwordErrors.currentPassword
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  placeholder="Votre mot de passe actuel"
                />
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                    if (passwordErrors.newPassword) {
                      setPasswordErrors(prev => ({ ...prev, newPassword: '' }))
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${passwordErrors.newPassword
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  placeholder="Nouveau mot de passe (min. 6 caractères)"
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    if (passwordErrors.confirmPassword) {
                      setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }))
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${passwordErrors.confirmPassword
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  placeholder="Confirmer le nouveau mot de passe"
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Modifier le mot de passe
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-gray-600">
              <p>Cliquez sur "Changer le mot de passe" pour modifier votre mot de passe.</p>
              <p className="text-sm mt-2">
                Assurez-vous d'utiliser un mot de passe fort avec au moins 6 caractères.
              </p>
            </div>
          )}
        </div>

        {/* Section Statistiques du profil */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h4 className="text-lg font-semibold text-gray-900 mb-6">Mes Statistiques</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.consultant.totalSessions}</p>
              <p className="text-sm text-gray-600">Sessions totales</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.consultant.rating}/5</p>
              <p className="text-sm text-gray-600">Note moyenne</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.consultant.totalFormations}</p>
              <p className="text-sm text-gray-600">Formations</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
    { id: 'formations', label: 'Les formations', icon: BookOpen },
    { id: 'consulting', label: 'Consulting', icon: Calendar },
    { id: 'agenda', label: 'Mon Agenda', icon: Calendar },
    { id: 'feedback', label: 'Retours', icon: MessageSquare },
    { id: 'profile', label: 'Mon Profil', icon: User },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <PaymentStatus />
      <DashboardHeader 
        title="Espace Consultant" 
        subtitle="Gérez vos formations et sessions de consulting"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation tabs */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
            
            {/* Bouton notifications */}
            
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'formations' && renderFormations()}
          {activeTab === 'consulting' && renderConsulting()}
          {activeTab === 'agenda' && <AgendaTab />}
          {activeTab === 'feedback' && renderFeedback()}
          {activeTab === 'profile' && renderProfile()}
        </div>
      </div>
    </div>
  )
} 