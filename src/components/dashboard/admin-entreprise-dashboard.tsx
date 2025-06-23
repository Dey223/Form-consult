'use client'

import { useState, useEffect } from 'react'
import { DashboardHeader } from './dashboard-header'
import { PaymentStatus } from '@/components/payment/payment-status'
import { Button } from '@/components/ui/button'
import { SubscriptionManager } from '@/components/stripe/subscription-manager'
import { AdminUsersTab } from './admin-tabs/admin-users-tab'
import { NotificationButton } from './layout/notification-button'
import { AdminPerformanceTab } from './admin-tabs/admin-performance-tab'
import { CreateConsultationModal } from './modals/create-consultation-modal'
import { toast } from 'react-hot-toast'

import { 
  Users, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  UserPlus,
  Download,
  CreditCard,
  TrendingUp,
  Building2,
  Clock,
  MessageSquare,
  Settings,
  Plus,
  Eye,
  Target,
  Award,
  Star,
  Edit,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Filter,
  DollarSign,
  User,
  Save,
  X,
  Camera
} from 'lucide-react'
import { AdminFormationsTab } from './admin-tabs/admin-formations-tab'
import { AdminConsultingTab } from './admin-tabs/admin-consulting-tab'
import { AdminReportsTab } from './admin-tabs/admin-reports-tab'

interface AdminDashboardData {
  company: {
    id: string
    name: string
    email?: string
    phone?: string
    address?: string
    website?: string
    logo?: string
    plan: string
    usersCount: number
    subscription: {
      status: string
      currentPeriodEnd: string | null
    }
  }
  stats: {
    totalUsers: number
    activeFormations: number
    completionRate: number
    consultingHours: {
      used: number
      available: number
    }
    pendingConsultations: number
    completedFormations: number
  }
  recentUsers: Array<{
    id: string
    name: string
    email: string
    progress: number
    status: 'active' | 'pending' | 'inactive'
  }>
  upcomingAppointments: Array<{
    id: string
    title: string
    date: string
    consultant: string
    status: string
  }>
}

export function AdminEntrepriseDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateConsultation, setShowCreateConsultation] = useState(false)

  // États pour la gestion du profil
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    company: {
      name: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      logo: ''
    }
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
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setError(null)
      setLoading(true)
      const response = await fetch('/api/dashboard/admin-entreprise')
      
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
        // Initialiser profileData avec les données de l'entreprise
        setProfileData({
          name: data.admin?.name || '',
          email: data.admin?.email || '',
          phone: data.admin?.phone || '',
          position: '',
          department: '',
          company: {
            name: data.company?.name || '',
            email: data.company?.email || '',
            phone: data.company?.phone || '',
            address: data.company?.address || '',
            website: data.company?.website || '',
            logo: data.company?.logo || ''
          }
        })
      } else {
        // Si pas de données API, on utilise des données par défaut
        setDashboardData({
          company: {
            id: '1',
            name: 'Mon Entreprise',
            plan: 'Professional',
            usersCount: 25,
            subscription: {
              status: 'active',
              currentPeriodEnd: '2024-12-31'
            }
          },
          stats: {
            totalUsers: 25,
            activeFormations: 8,
            completionRate: 75,
            consultingHours: {
              used: 12,
              available: 50
            },
            pendingConsultations: 3,
            completedFormations: 24
          },
          recentUsers: [],
          upcomingAppointments: []
        })
      }
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur de connexion. Données par défaut chargées.')
      // Charger des données par défaut même en cas d'erreur
      setDashboardData({
        company: {
          id: '1',
          name: 'Mon Entreprise',
          plan: 'Professional',
          usersCount: 25,
          subscription: {
            status: 'active',
            currentPeriodEnd: '2024-12-31'
          }
        },
        stats: {
          totalUsers: 25,
          activeFormations: 8,
          completionRate: 75,
          consultingHours: {
            used: 12,
            available: 50
          },
          pendingConsultations: 3,
          completedFormations: 24
        },
        recentUsers: [],
        upcomingAppointments: []
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchDashboardData()
  }

  const handleCreateConsultation = () => {
    setShowCreateConsultation(true)
  }

  const handleConsultationCreated = () => {
    setShowCreateConsultation(false)
    refreshData()
  }

  // Fonction pour sauvegarder le profil
  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/dashboard/admin-entreprise/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profileData,
          company: profileData.company
        }),
      })

      if (response.ok) {
        toast.success('Profil mis à jour avec succès')
        setIsEditingProfile(false)
        // Recharger les données du dashboard
        const updatedResponse = await fetch('/api/dashboard/admin-entreprise')
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
      const response = await fetch('/api/dashboard/admin-entreprise/change-password', {
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
      <div className="min-h-screen bg-gray-50">
        <PaymentStatus />
        <DashboardHeader 
          title="Admin Entreprise" 
          subtitle="Chargement de vos données..."
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm border animate-pulse">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Bannière d'accueil améliorée */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{dashboardData?.company.name}</h2>
              <p className="text-blue-100">Plan {dashboardData?.company.plan} • {dashboardData?.company.usersCount} utilisateurs</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-blue-100">Statut de l'abonnement</div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="font-medium">Actif</span>
              </div>
            </div>
            <Button 
              onClick={handleCreateConsultation}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Consultation
            </Button>
          </div>
        </div>
      </div>

      {/* Statistiques améliorées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.stats.totalUsers}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Formations actives</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.stats.activeFormations}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taux completion</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.stats.completionRate}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Consulting</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.stats.consultingHours.used}h
                </p>
                <p className="text-xs text-gray-500">
                  / {dashboardData?.stats.consultingHours.available}h
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Consultations</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.stats.pendingConsultations}</p>
                <p className="text-xs text-gray-500">En attente</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Terminées</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.stats.completedFormations}</p>
                <p className="text-xs text-gray-500">Formations</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides améliorées */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <UserPlus className="h-5 w-5 mr-2 text-blue-600" />
            Gestion des Employés
          </h3>
          <div className="space-y-3">
            <Button className="w-full justify-start" onClick={() => setActiveTab('users')}>
              <UserPlus className="h-4 w-4 mr-2" />
              Inviter un employé
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('performance')}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Voir les performances
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('reports')}>
              <Download className="h-4 w-4 mr-2" />
              Rapport d'activité
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-green-600" />
            Formations
          </h3>
          <div className="space-y-3">
            <Button className="w-full justify-start" onClick={() => setActiveTab('formations')}>
              <Plus className="h-4 w-4 mr-2" />
              Demander une formation
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('formations')}>
              <Target className="h-4 w-4 mr-2" />
              Assigner formations
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('formations')}>
              <Eye className="h-4 w-4 mr-2" />
              Voir les formations
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-purple-600" />
            Consultations
          </h3>
          <div className="space-y-3">
            <Button className="w-full justify-start" onClick={() => setActiveTab('consulting')}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Demandes en cours
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={handleCreateConsultation}>
              <Plus className="h-4 w-4 mr-2" />
              Créer consultation
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('consulting')}>
              <Settings className="h-4 w-4 mr-2" />
              Assigner consultant
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderProfile = () => {
    if (!dashboardData?.company) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Chargement du profil...</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Mon Profil Admin</h3>
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
                Admin Entreprise
              </h4>
              <p className="text-gray-600">{dashboardData.company.name}</p>
              <p className="text-sm text-gray-500 mt-1">Plan {dashboardData.company.plan}</p>

              <div className="mt-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-900">
                    {dashboardData.stats.totalUsers} employés
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <BookOpen className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-500">
                    {dashboardData.stats.activeFormations} formations actives
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
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    disabled={!isEditingProfile}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEditingProfile
                        ? 'border-gray-300 bg-white'
                        : 'border-gray-200 bg-gray-50'
                      }`}
                    placeholder="Votre nom complet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!isEditingProfile}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEditingProfile
                        ? 'border-gray-300 bg-white'
                        : 'border-gray-200 bg-gray-50'
                      }`}
                    placeholder="votre.email@entreprise.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
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
                    Poste
                  </label>
                  <input
                    type="text"
                    value={profileData.position}
                    onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                    disabled={!isEditingProfile}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEditingProfile
                        ? 'border-gray-300 bg-white'
                        : 'border-gray-200 bg-gray-50'
                      }`}
                    placeholder="Votre poste dans l'entreprise"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entreprise
                  </label>
                  <input
                    type="text"
                    value={isEditingProfile ? profileData.company.name : dashboardData.company.name}
                    onChange={(e) => setProfileData({ ...profileData, company: { ...profileData.company, name: e.target.value } })}
                    disabled={true}
                    className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none"
                    placeholder="Nom de l'entreprise"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Le nom de l'entreprise ne peut pas être modifié depuis ce profil
                  </p>
                </div>
              </div>

              {/* Section Entreprise */}
              <div className="border-t pt-6 mt-6">
                <h5 className="text-md font-semibold text-gray-900 mb-4">
                  Informations de l'entreprise
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email entreprise
                    </label>
                    <input
                      type="email"
                      value={isEditingProfile ? profileData.company.email : (dashboardData.company.email || '')}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        company: { ...profileData.company, email: e.target.value }
                      })}
                      disabled={!isEditingProfile}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEditingProfile
                          ? 'border-gray-300 bg-white'
                          : 'border-gray-200 bg-gray-50'
                        }`}
                      placeholder="contact@entreprise.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone entreprise
                    </label>
                    <input
                      type="tel"
                      value={isEditingProfile ? profileData.company.phone : (dashboardData.company.phone || '')}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        company: { ...profileData.company, phone: e.target.value }
                      })}
                      disabled={!isEditingProfile}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEditingProfile
                          ? 'border-gray-300 bg-white'
                          : 'border-gray-200 bg-gray-50'
                        }`}
                      placeholder="Téléphone de l'entreprise"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site web
                    </label>
                    <input
                      type="url"
                      value={isEditingProfile ? profileData.company.website : (dashboardData.company.website || '')}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        company: { ...profileData.company, website: e.target.value }
                      })}
                      disabled={!isEditingProfile}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEditingProfile
                          ? 'border-gray-300 bg-white'
                          : 'border-gray-200 bg-gray-50'
                        }`}
                      placeholder="https://www.entreprise.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo (URL)
                    </label>
                    <input
                      type="url"
                      value={isEditingProfile ? profileData.company.logo : (dashboardData.company.logo || '')}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        company: { ...profileData.company, logo: e.target.value }
                      })}
                      disabled={!isEditingProfile}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEditingProfile
                          ? 'border-gray-300 bg-white'
                          : 'border-gray-200 bg-gray-50'
                        }`}
                      placeholder="https://www.entreprise.com/logo.png"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse
                    </label>
                    <textarea
                      value={isEditingProfile ? profileData.company.address : (dashboardData.company.address || '')}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        company: { ...profileData.company, address: e.target.value }
                      })}
                      disabled={!isEditingProfile}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEditingProfile
                          ? 'border-gray-300 bg-white'
                          : 'border-gray-200 bg-gray-50'
                        }`}
                      placeholder="Adresse complète de l'entreprise"
                    />
                  </div>
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

        {/* Section Statistiques de l'entreprise */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h4 className="text-lg font-semibold text-gray-900 mb-6">Statistiques de l'entreprise</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalUsers}</p>
              <p className="text-sm text-gray-600">Employés totaux</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.activeFormations}</p>
              <p className="text-sm text-gray-600">Formations actives</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.completionRate}%</p>
              <p className="text-sm text-gray-600">Taux de completion</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.pendingConsultations}</p>
              <p className="text-sm text-gray-600">Consultations en attente</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'formations', label: 'Formations', icon: BookOpen },
    { id: 'consulting', label: 'Consulting', icon: Calendar },
    { id: 'reports', label: 'Rapports', icon: Download },
    { id: 'subscription', label: 'Abonnement', icon: CreditCard },
    { id: 'profile', label: 'Mon Profil', icon: User },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <PaymentStatus />
      <div className="relative">
        <DashboardHeader 
          title="Admin Entreprise" 
          subtitle={`Gestion de ${dashboardData?.company.name}`}
        />
        <div className="absolute top-4 right-4">
          <NotificationButton />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
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
        </div>

        {/* Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && <AdminUsersTab onUpdate={refreshData} />}
          {activeTab === 'performance' && <AdminPerformanceTab />}
          {activeTab === 'formations' && <AdminFormationsTab onUpdate={refreshData} />}
          {activeTab === 'consulting' && <AdminConsultingTab onUpdate={refreshData} />}
          {activeTab === 'reports' && <AdminReportsTab onUpdate={refreshData} />}
          {activeTab === 'subscription' && (
            <SubscriptionManager 
              currentPlan={dashboardData?.company.plan as any}
              subscriptionStatus={dashboardData?.company.subscription.status as any}
              hasStripeCustomer={true}
            />
          )}
          {activeTab === 'profile' && renderProfile()}
        </div>
      </div>

      {/* Modal de création de consultation */}
      <CreateConsultationModal
        isOpen={showCreateConsultation}
        onClose={() => setShowCreateConsultation(false)}
        onSuccess={handleConsultationCreated}
        userName="Admin Entreprise"
        companyName={dashboardData?.company.name}
      />
    </div>
  )
} 