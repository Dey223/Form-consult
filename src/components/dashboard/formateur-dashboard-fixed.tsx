'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { DashboardHeader } from './dashboard-header'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  Plus, 
  Users, 
  BarChart3, 
  Video,
  Upload,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Clock,
  Star,
  Play,
  AlertCircle,
  CheckCircle,
  Bell,
  Calendar,
  DollarSign,
  Target,
  Award,
  MessageSquare,
  Filter,
  Search,
  Download,
  Settings,
  Activity,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Zap,
  Heart,
  ThumbsUp,
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  X
} from 'lucide-react'
import { CreateFormationModal } from './formateur-tabs/create-formation-modal'
import { UploadVideoModal } from './formateur-tabs/upload-video-modal'

interface FormateurDashboardData {
  formateur: {
    name: string
    email?: string
    phone?: string
    bio?: string
    location?: string
    avatar?: string
    website?: string
    linkedin?: string
    twitter?: string
    totalFormations: number
    totalStudents: number
    averageRating: number
    totalRevenue: number
    joinedDate: string
    profileCompleteness: number
  }
  stats: {
    thisMonthEnrollments: number
    activeFormations: number
    totalVideoHours: number
    averageCompletionRate: number
    thisMonthRevenue: number
    totalReviews: number
    averageWatchTime: number
    studentRetentionRate: number
  }
  analytics: {
    enrollmentTrend: Array<{ month: string; enrollments: number }>
    revenueTrend: Array<{ month: string; revenue: number }>
    topFormations: Array<{ id: string; title: string; enrollments: number; revenue: number }>
    studentEngagement: Array<{ date: string; activeStudents: number }>
    completionRates: Array<{ formationId: string; title: string; rate: number }>
  }
  myFormations: Array<{
    id: string
    title: string
    description: string
    level: string
    thumbnail?: string
    totalSections: number
    totalLessons: number
    totalDuration: number
    enrolledStudents: number
    completionRate: number
    averageRating: number
    isActive: boolean
    isPublished: boolean
    createdAt: string
    lastUpdated: string
    revenue: number
  }>
  recentActivity: Array<{
    id: string
    type: 'enrollment' | 'completion' | 'review' | 'question' | 'achievement'
    message: string
    date: string
    formationTitle?: string
    studentName?: string
    rating?: number
  }>
  notifications: Array<{
    id: string
    type: 'info' | 'warning' | 'success' | 'error'
    title: string
    message: string
    date: string
    isRead: boolean
  }>
  categories: Array<{
    label: string
    value: string
    subCategories: { label: string; value: string }[]
  }>
  levels: Array<{
    label: string
    value: string
  }>
  students: Array<{
    id: string
    name: string
    email: string
    enrolledFormations: number
    completedFormations: number
    averageProgress: number
    lastActivity: string
    status: 'active' | 'inactive'
    totalSpent: number
    joinedDate: string
  }>
}

export function FormateurDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboardData, setDashboardData] = useState<FormateurDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFormation, setSelectedFormation] = useState<string | null>(null)
  const [formationFilter, setFormationFilter] = useState<'all' | 'active' | 'draft' | 'published'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  
  // États pour la gestion du profil
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    linkedin: '',
    twitter: ''
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Synchroniser les données du profil quand dashboardData change
  useEffect(() => {
    if (dashboardData?.formateur) {
      setProfileData({
        name: dashboardData.formateur.name || '',
        email: dashboardData.formateur.email || '',
        phone: dashboardData.formateur.phone || '',
        bio: dashboardData.formateur.bio || '',
        location: dashboardData.formateur.location || '',
        website: dashboardData.formateur.website || '',
        linkedin: dashboardData.formateur.linkedin || '',
        twitter: dashboardData.formateur.twitter || ''
      })
    }
  }, [dashboardData])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Données de démonstration sécurisées
      const mockData: FormateurDashboardData = {
        formateur: {
          name: 'Jean Formateur',
          email: 'jean@exemple.com',
          phone: '+33 6 12 34 56 78',
          bio: 'Formateur expert en développement web avec 10 ans d\'expérience',
          location: 'Paris, France',
          avatar: '',
          website: 'https://jean-formateur.com',
          linkedin: 'https://linkedin.com/in/jean-formateur',
          twitter: 'https://twitter.com/jean_formateur',
          totalFormations: 12,
          totalStudents: 340,
          averageRating: 4.8,
          totalRevenue: 45000,
          joinedDate: new Date().toISOString(),
          profileCompleteness: 85
        },
        stats: {
          thisMonthEnrollments: 25,
          activeFormations: 8,
          totalVideoHours: 120,
          averageCompletionRate: 78,
          thisMonthRevenue: 3500,
          totalReviews: 156,
          averageWatchTime: 45,
          studentRetentionRate: 92
        },
        analytics: {
          enrollmentTrend: [],
          revenueTrend: [],
          topFormations: [],
          studentEngagement: [],
          completionRates: []
        },
        myFormations: [],
        recentActivity: [],
        notifications: [],
        categories: [],
        levels: [],
        students: []
      }
      
      setDashboardData(mockData)
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setDashboardData(prev => prev ? {
        ...prev,
        formateur: { ...prev.formateur, ...profileData }
      } : prev)
      setIsEditingProfile(false)
      console.log('Profil mis à jour avec succès')
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Non défini'
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Date invalide'
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date)
    } catch (error) {
      return 'Date invalide'
    }
  }

  const renderProfile = () => {
    if (!dashboardData?.formateur) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Chargement des informations du profil...</p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mon Profil</h2>
            <p className="text-gray-600">Gérez vos informations personnelles et professionnelles</p>
          </div>
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
          {/* Photo de profil et informations de base */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    {dashboardData.formateur.avatar ? (
                      <img
                        src={dashboardData.formateur.avatar}
                        alt={dashboardData.formateur?.name || 'Formateur'}
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-4xl font-bold">
                        {dashboardData.formateur?.name?.charAt(0)?.toUpperCase() || 'F'}
                      </span>
                    )}
                  </div>
                  {isEditingProfile && (
                    <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {dashboardData.formateur?.name || 'Formateur'}
                </h3>
                <p className="text-gray-600 mb-4">Formateur Expert</p>

                {/* Statistiques rapides */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {dashboardData.formateur?.totalFormations || 0}
                    </p>
                    <p className="text-sm text-gray-600">Formations</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {dashboardData.formateur?.totalStudents || 0}
                    </p>
                    <p className="text-sm text-gray-600">Étudiants</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">
                      {(dashboardData.formateur?.averageRating || 0).toFixed(1)}
                    </p>
                    <p className="text-sm text-gray-600">Note moyenne</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      {dashboardData.formateur?.profileCompleteness || 0}%
                    </p>
                    <p className="text-sm text-gray-600">Profil complété</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Informations personnelles
              </h4>

              <form className="space-y-6">
                {/* Nom complet */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={isEditingProfile ? profileData.name : (dashboardData.formateur?.name || '')}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      disabled={!isEditingProfile}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isEditingProfile 
                          ? 'border-gray-300 bg-white' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                      placeholder="Votre nom complet"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={isEditingProfile ? profileData.email : (dashboardData.formateur?.email || '')}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      disabled={!isEditingProfile}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isEditingProfile 
                          ? 'border-gray-300 bg-white' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                      placeholder="votre.email@exemple.com"
                    />
                  </div>
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={isEditingProfile ? profileData.phone : (dashboardData.formateur?.phone || '')}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      disabled={!isEditingProfile}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isEditingProfile 
                          ? 'border-gray-300 bg-white' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>

                {/* Localisation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localisation
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={isEditingProfile ? profileData.location : (dashboardData.formateur?.location || '')}
                      onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                      disabled={!isEditingProfile}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isEditingProfile 
                          ? 'border-gray-300 bg-white' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                      placeholder="Paris, France"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biographie
                  </label>
                  <textarea
                    rows={4}
                    value={isEditingProfile ? profileData.bio : (dashboardData.formateur?.bio || '')}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    disabled={!isEditingProfile}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      isEditingProfile 
                        ? 'border-gray-300 bg-white' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    placeholder="Parlez-nous de votre parcours, vos compétences et votre passion pour l'enseignement..."
                  />
                </div>

                {/* Liens professionnels */}
                <div className="space-y-4">
                  <h5 className="text-md font-medium text-gray-900">Liens professionnels</h5>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site web
                    </label>
                    <input
                      type="url"
                      value={isEditingProfile ? profileData.website : (dashboardData.formateur?.website || '')}
                      onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                      disabled={!isEditingProfile}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isEditingProfile 
                          ? 'border-gray-300 bg-white' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                      placeholder="https://votre-site.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={isEditingProfile ? profileData.linkedin : (dashboardData.formateur?.linkedin || '')}
                      onChange={(e) => setProfileData({...profileData, linkedin: e.target.value})}
                      disabled={!isEditingProfile}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isEditingProfile 
                          ? 'border-gray-300 bg-white' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                      placeholder="https://linkedin.com/in/votre-profil"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter
                    </label>
                    <input
                      type="url"
                      value={isEditingProfile ? profileData.twitter : (dashboardData.formateur?.twitter || '')}
                      onChange={(e) => setProfileData({...profileData, twitter: e.target.value})}
                      disabled={!isEditingProfile}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isEditingProfile 
                          ? 'border-gray-300 bg-white' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                      placeholder="https://twitter.com/votre-compte"
                    />
                  </div>
                </div>

                {/* Bouton de sauvegarde */}
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditingProfile(false)
                        if (dashboardData?.formateur) {
                          setProfileData({
                            name: dashboardData.formateur.name || '',
                            email: dashboardData.formateur.email || '',
                            phone: dashboardData.formateur.phone || '',
                            bio: dashboardData.formateur.bio || '',
                            location: dashboardData.formateur.location || '',
                            website: dashboardData.formateur.website || '',
                            linkedin: dashboardData.formateur.linkedin || '',
                            twitter: dashboardData.formateur.twitter || ''
                          })
                        }
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Informations du compte */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Informations du compte
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-700">Date d'inscription</p>
              <p className="text-gray-900">{formatDate(dashboardData.formateur?.joinedDate || new Date().toISOString())}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Statut du compte</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Actif
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Niveau de vérification</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Vérifié
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Dernier accès</p>
              <p className="text-gray-900">Il y a quelques minutes</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Vue d'ensemble</h2>
        <p className="text-gray-600">Bienvenue sur votre tableau de bord formateur</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Formations</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.formateur?.totalFormations || 0}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Étudiants</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.formateur?.totalStudents || 0}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Note moyenne</p>
              <p className="text-2xl font-bold text-gray-900">{(dashboardData?.formateur?.averageRating || 0).toFixed(1)}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenus</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData?.formateur?.totalRevenue || 0)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  )

  const renderFormations = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Mes Formations</h2>
        <p className="text-gray-600">Gérez vos formations</p>
      </div>
      
      <div className="flex justify-center">
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Créer une formation
        </Button>
      </div>
    </div>
  )

  const renderStudents = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Mes Étudiants</h2>
        <p className="text-gray-600">Suivez vos étudiants</p>
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-600">Analysez vos performances</p>
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'formations', label: 'Mes formations', icon: BookOpen },
    { id: 'students', label: 'Étudiants', icon: Users },
    { id: 'analytics', label: 'Statistiques', icon: TrendingUp },
    { id: 'profile', label: 'Mon Profil', icon: User },
  ]

  // Gestion des états de chargement et d'erreur
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune donnée disponible</h3>
          <p className="text-gray-600">Impossible de charger les données du tableau de bord.</p>
        </div>
      </div>
    )
  }

  const renderTabs = () => (
    <div className="mb-6">
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
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Formateur" 
        subtitle={`Bonjour ${dashboardData?.formateur?.name || 'Formateur'}`}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation tabs */}
        {renderTabs()}

        {/* Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'students' && renderStudents()}
          {activeTab === 'formations' && renderFormations()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'profile' && renderProfile()}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && dashboardData && dashboardData.categories && dashboardData.levels && (
        <CreateFormationModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchDashboardData()
          }}
          categories={dashboardData.categories}
          levels={dashboardData.levels}
        />
      )}

      {showUploadModal && (
        <UploadVideoModal 
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false)
            fetchDashboardData()
          }}
        />
      )}
    </div>
  )
} 