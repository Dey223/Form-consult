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
  X,
  Layers,
  Folder,
  Building,
  FileText,
  Globe,
  EyeOff
} from 'lucide-react'
import { CreateFormationModal } from './formateur-tabs/create-formation-modal'
import { UploadVideoModal } from './formateur-tabs/upload-video-modal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from 'react-hot-toast'

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
    companyEnrollments: Array<{ companyName: string; enrollments: number; trend: number }>
    resourcesByLesson: {
      totalLessons: number
      totalSections: number
      averageResourcesPerLesson: number
      totalResources: number
    }
    sectionStats: Array<{
      sectionId: string
      sectionTitle: string
      lessonsCount: number
      resourcesCount: number
      averageCompletionTime: number
      studentProgress: number
    }>
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
    company?: string
    companyId?: string
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
  });

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

  // État pour la suppression de formations
  const [deletingFormation, setDeletingFormation] = useState<string | null>(null)

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'formations', label: 'Mes Formations', icon: BookOpen },
    { id: 'students', label: 'Apprenants', icon: Users },
    { id: 'analytics', label: 'Analytiques', icon: PieChart },
    { id: 'profile', label: 'Mon Profil', icon: User }
  ]

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNotifications) {
        const target = event.target as Element
        if (!target.closest('.notifications-dropdown')) {
          setShowNotifications(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/dashboard/formateur')

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des données')
      }

      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date non disponible'

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Date non disponible'
      }

      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date)
    } catch (error) {
      return 'Date non disponible'
    }
  }

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/dashboard/formateur/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify(profileData),

      })
      console.log(response)
      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde du profil')
      }

      const updatedData = await response.json()
      setDashboardData(prev => prev ? {
        ...prev,
        formateur: { ...prev.formateur, ...updatedData.formateur }
      } : null)

      setIsEditingProfile(false)
      toast.success('Profil mis à jour avec succès')
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur lors de la sauvegarde du profil')
      toast.error('Erreur lors de la sauvegarde du profil')
    }
  }

  const handleChangePassword = async () => {
    try {
      // Reset les erreurs précédentes
      setPasswordErrors({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setError(null)

      // Validation côté client
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordErrors(prev => ({
          ...prev,
          confirmPassword: 'Les mots de passe ne correspondent pas'
        }))
        toast.error('Les mots de passe ne correspondent pas')
        return
      }

      if (passwordData.newPassword.length < 6) {
        setPasswordErrors(prev => ({
          ...prev,
          newPassword: 'Le mot de passe doit contenir au moins 6 caractères'
        }))
        toast.error('Le mot de passe doit contenir au moins 6 caractères')
        return
      }

      if (!passwordData.currentPassword) {
        setPasswordErrors(prev => ({
          ...prev,
          currentPassword: 'Le mot de passe actuel est requis'
        }))
        toast.error('Le mot de passe actuel est requis')
        return
      }

      const response = await fetch('/api/dashboard/formateur/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        // Gérer les erreurs spécifiques du serveur
        if (response.status === 400) {
          if (errorData.error === 'Mot de passe actuel incorrect') {
            setPasswordErrors(prev => ({
              ...prev,
              currentPassword: 'Le mot de passe actuel est incorrect'
            }))
            toast.error('Le mot de passe actuel est incorrect')
          } else if (errorData.error === 'Le nouveau mot de passe doit contenir au moins 6 caractères') {
            setPasswordErrors(prev => ({
              ...prev,
              newPassword: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
            }))
            toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères')
          } else {
            setError(errorData.error || 'Erreur lors du changement de mot de passe')
            toast.error(errorData.error || 'Erreur lors du changement de mot de passe')
          }
        } else {
          setError('Erreur du serveur')
          toast.error('Erreur du serveur')
        }
        return
      }

      // Succès
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setIsChangingPassword(false)
      toast.success('Mot de passe modifié avec succès')
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur lors du changement de mot de passe')
      toast.error('Erreur lors du changement de mot de passe')
    }
  }

  const handleDeleteFormation = async (formationId: string) => {
    try {
      setDeletingFormation(formationId)

      const response = await fetch(`/api/dashboard/formateur/formations/${formationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la formation')
      }

      // Mettre à jour les données localement
      setDashboardData(prev => {
        if (!prev) return null
        return {
          ...prev,
          myFormations: prev.myFormations.filter(f => f.id !== formationId),
          formateur: {
            ...prev.formateur,
            totalFormations: prev.formateur.totalFormations - 1
          }
        }
      })


    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur lors de la suppression de la formation')
    } finally {
      setDeletingFormation(null)
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return null
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Message de bienvenue personnalisé */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="relative">
          <h2 className="text-2xl font-bold mb-2">
            Bienvenue, {dashboardData.formateur.name} ! 👋
          </h2>
          <p className="text-blue-100 mb-4">
            Votre espace formateur pour créer, gérer et analyser vos formations en ligne.
          </p>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-sm text-blue-200">Membre depuis</p>
              <p className="font-semibold">{formatDate(dashboardData.formateur.joinedDate)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-200">Profil complété</p>
              <p className="font-semibold">{dashboardData.formateur.profileCompleteness}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques principales améliorées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200 opacity-20 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="flex items-center justify-between relative">
            <div>
              <p className="text-blue-600 text-sm font-medium">Mes Formations</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{dashboardData.formateur.totalFormations}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-xs text-green-600">+{dashboardData.stats.thisMonthEnrollments} ce mois</span>
              </div>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-200 opacity-20 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="flex items-center justify-between relative">
            <div>
              <p className="text-green-600 text-sm font-medium">Apprenants Actifs</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{dashboardData.formateur.totalStudents}</p>
              <div className="flex items-center mt-2">
                <Heart className="h-4 w-4 text-pink-500 mr-1" />
                <span className="text-xs text-pink-600">{dashboardData.stats.studentRetentionRate}% fidélité</span>
              </div>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-200 opacity-20 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="flex items-center justify-between relative">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Note Moyenne</p>
              <div className="flex items-center mt-1">
                <p className="text-3xl font-bold text-yellow-900">{dashboardData.formateur.averageRating}</p>
                <Star className="h-5 w-5 text-yellow-500 ml-1 fill-current" />
              </div>
              <div className="flex items-center mt-2">
                <ThumbsUp className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-xs text-blue-600">{dashboardData.stats.totalReviews} avis</span>
              </div>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Award className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-200 opacity-20 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="flex items-center justify-between relative">
            <div>
              <p className="text-purple-600 text-sm font-medium">Contenu Créé</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{dashboardData.stats.totalVideoHours}h</p>
              <div className="flex items-center mt-2">
                <Play className="h-4 w-4 text-indigo-500 mr-1" />
                <span className="text-xs text-indigo-600">{dashboardData.stats.averageWatchTime}min moy/session</span>
              </div>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <Video className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Métriques de performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenus ce mois</h3>
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-3">
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.stats.thisMonthRevenue)}</p>
            <div className="flex items-center">
              <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+15% vs mois dernier</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${Math.min((dashboardData.stats.thisMonthRevenue / (dashboardData.formateur.totalRevenue || 1)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Taux de complétion</h3>
            <Target className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-3">
            <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.averageCompletionRate}%</p>
            <div className="flex items-center">
              <Zap className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-sm text-blue-600">Excellent engagement</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${dashboardData.stats.averageCompletionRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Formations actives</h3>
            <Activity className="h-5 w-5 text-purple-500" />
          </div>
          <div className="space-y-3">
            <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.activeFormations}</p>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-purple-500 mr-1" />
              <span className="text-sm text-purple-600">Bien organisé</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${Math.min((dashboardData.stats.activeFormations / (dashboardData.formateur.totalFormations || 1)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides améliorées */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/formateur/formations/create">
            <Button className="h-20 w-full text-left justify-start bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 hover:from-blue-100 hover:to-blue-200 text-gray-900 group">
              <div className="bg-blue-500 p-2 rounded-lg mr-4 group-hover:bg-blue-600 transition-colors">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-blue-900">Créer une formation</p>
                <p className="text-sm text-blue-600">Nouvelle formation interactive</p>
              </div>
            </Button>
          </Link>

          <Button
            onClick={() => setActiveTab('students')}
            className="h-20 w-full text-left justify-start bg-gradient-to-br from-green-50 to-green-100 border border-green-200 hover:from-green-100 hover:to-green-200 text-gray-900 group"
          >
            <div className="bg-green-500 p-2 rounded-lg mr-4 group-hover:bg-green-600 transition-colors">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-green-900">Voir mes apprenants</p>
              <p className="text-sm text-green-600">Suivi et progression</p>
            </div>
          </Button>

          <Button
            onClick={() => setActiveTab('analytics')}
            className="h-20 w-full text-left justify-start bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 hover:from-purple-100 hover:to-purple-200 text-gray-900 group"
          >
            <div className="bg-purple-500 p-2 rounded-lg mr-4 group-hover:bg-purple-600 transition-colors">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-purple-900">Analyser les performances</p>
              <p className="text-sm text-purple-600">Statistiques détaillées</p>
            </div>
          </Button>
        </div>
      </div>

      {/* Activité récente */}
      {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
            <Bell className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {dashboardData.recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'enrollment' ? 'bg-blue-500' :
                  activity.type === 'completion' ? 'bg-green-500' :
                    activity.type === 'review' ? 'bg-yellow-500' :
                      activity.type === 'question' ? 'bg-purple-500' :
                        'bg-gray-500'
                  }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(activity.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderFormations = () => {
    const formatDuration = (seconds: number) => {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      if (hours > 0) {
        return `${hours}h ${minutes}min`
      }
      return `${minutes}min`
    }

    const getLevelBadge = (level: string) => {
      const colors = {
        'Débutant': 'bg-green-100 text-green-800',
        'Intermédiaire': 'bg-yellow-100 text-yellow-800',
        'Avancé': 'bg-red-100 text-red-800'
      }
      return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Mes Formations</h3>
          <Link href="/dashboard/formateur/formations/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Formation
            </Button>
          </Link>
        </div>

        {!dashboardData.myFormations || dashboardData.myFormations.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune formation créée
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Commencez à partager vos connaissances en créant votre première formation.
              C'est facile et vous pouvez commencer dès maintenant !
            </p>
            <Button onClick={() => setShowCreateModal(true)} className="inline-flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Créer ma première formation
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-2 border-gray-200 rounded-lg p-3">
            {dashboardData.myFormations.map((formation) => (
              <div key={formation.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  {formation.thumbnail ? (
                    <img
                      src={formation.thumbnail}
                      alt={formation.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Video className="h-16 w-16 text-white" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 truncate mb-2">{formation.title}</h3>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{formation.description}</p>

                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${getLevelBadge(formation.level)}`}>
                      {formation.level}
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span>{formation.averageRating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>{formation.totalLessons} leçons</span>
                      <span>{formatDuration(formation.totalDuration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{formation.enrolledStudents} apprenants</span>
                      <span>{formation.completionRate}% complété</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Statut de publication dynamique */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Statut:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${formation.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {formation.isPublished ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Publiée
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Brouillon
                          </>
                        )}
                      </span>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex space-x-2">
                      <Link href={`/formations/${formation.id}`}>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                      </Link>
                      <Link href={`/dashboard/formateur/formations/${formation.id}/edit`}>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1"
                            disabled={deletingFormation === formation.id}
                          >
                            {deletingFormation === formation.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer la formation</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer la formation "{formation.title}" ?
                              Cette action est irréversible et supprimera définitivement la formation,
                              toutes ses sections, leçons et le progrès des apprenants.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteFormation(formation.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Supprimer définitivement
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderStudents = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Employés Apprenants</h3>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher un employé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrer par entreprise
          </Button>
        </div>
      </div>

      {/* Statistiques des employés apprenants */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Employés</p>
              <p className="text-xl font-semibold">{dashboardData.students?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">En Formation</p>
              <p className="text-xl font-semibold">
                {dashboardData.students?.filter(s => s.status === 'active').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Progression Moy.</p>
              <p className="text-xl font-semibold">
                {dashboardData.students?.length ?
                  Math.round(dashboardData.students.reduce((acc, s) => acc + s.averageProgress, 0) / dashboardData.students.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Formations Terminées</p>
              <p className="text-xl font-semibold">
                {dashboardData.students?.reduce((acc, s) => acc + s.completedFormations, 0) || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {!dashboardData.students || dashboardData.students.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun employé assigné
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Les employés des entreprises partenaires qui sont inscrits à vos formations apparaîtront ici.
            Ils accèdent aux formations via leur entreprise.
          </p>
          <Button onClick={() => setActiveTab('formations')} className="inline-flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            Voir mes formations
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {dashboardData.students
            .filter(student =>
              student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              student.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((student) => (
              <div key={student.id} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900">{student.name}</h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${student.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}>
                          {student.status === 'active' ? 'En formation' : 'Inactif'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{student.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {student.company && <><span className="font-medium">{student.company}</span> • </>}
                        Employé depuis le {formatDate(student.joinedDate)} •
                        Dernière connexion: {formatDate(student.lastActivity)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="text-center">
                        <p className="font-medium text-gray-900">{student.enrolledFormations}</p>
                        <p className="text-gray-500 text-xs">Assignées</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900">{student.completedFormations}</p>
                        <p className="text-gray-500 text-xs">Terminées</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900">
                          {student.completedFormations > 0 ? Math.round((student.completedFormations / student.enrolledFormations) * 100) : 0}%
                        </p>
                        <p className="text-gray-500 text-xs">Réussite</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Progression moyenne</span>
                    <span className="font-medium">{student.averageProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${student.averageProgress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Contacter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Voir détails
                  </Button>
                </div>
              </div>
            ))}

          {dashboardData.students.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase())
          ).length === 0 && searchTerm && (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun employé trouvé pour "{searchTerm}"</p>
              </div>
            )}
        </div>
      )}
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Analytiques</h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Période
          </Button>
        </div>
      </div>

      {/* Statistiques des ressources pédagogiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total leçons</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.myFormations.reduce((acc, formation) => acc + formation.totalLessons, 0)}
              </p>
              <p className="text-gray-500 text-sm mt-1">Dans {dashboardData.formateur.totalFormations} formations</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total sections</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.myFormations.reduce((acc, formation) => acc + formation.totalSections, 0)}
              </p>
              <p className="text-gray-500 text-sm mt-1">Organisées en modules</p>
            </div>
            <Layers className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Durée totale</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(dashboardData.myFormations.reduce((acc, formation) => acc + formation.totalDuration, 0) / 3600)}h
              </p>
              <p className="text-gray-500 text-sm mt-1">Contenu vidéo</p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Taux de complétion moyen</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.myFormations.length > 0
                  ? Math.round(dashboardData.myFormations.reduce((acc, formation) => acc + formation.completionRate, 0) / dashboardData.myFormations.length)
                  : 0}%
              </p>
              <p className="text-gray-500 text-sm mt-1">Toutes formations</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Graphiques d'analyse */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des apprenants par entreprise */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Apprenants par entreprise</h4>
            <Building className="h-5 w-5 text-gray-400" />
          </div>

          {dashboardData.students && dashboardData.students.length > 0 ? (
            <div className="space-y-4">
              {/* Graphique en barres des entreprises */}
              {Object.entries(
                dashboardData.students.reduce((acc, student) => {
                  const company = student.company || 'Particuliers'
                  acc[company] = (acc[company] || 0) + 1
                  return acc
                }, {} as Record<string, number>)
              ).sort(([, a], [, b]) => b - a).slice(0, 5).map(([company, count], index) => {
                const percentage = Math.round((count / dashboardData.students.length) * 100)
                return (
                  <div key={company} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                        {company}
                      </span>
                      <span className="text-sm text-gray-500">{count} apprenants</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                            index === 2 ? 'bg-purple-500' :
                              index === 3 ? 'bg-yellow-500' :
                                'bg-pink-500'
                          }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Aucune donnée d'entreprise</p>
            </div>
          )}
        </div>

        {/* Statistiques détaillées par formation */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Performance par formation</h4>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>

          {dashboardData.myFormations && dashboardData.myFormations.length > 0 ? (
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {dashboardData.myFormations.map((formation) => (
                <div key={formation.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-gray-900 text-sm truncate max-w-[200px]">
                      {formation.title}
                    </h5>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {formation.level}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Sections:</span> {formation.totalSections}
                    </div>
                    <div>
                      <span className="font-medium">Leçons:</span> {formation.totalLessons}
                    </div>
                    <div>
                      <span className="font-medium">Apprenants:</span> {formation.enrolledStudents}
                    </div>
                    <div>
                      <span className="font-medium">Complétion:</span> {formation.completionRate}%
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progression moyenne</span>
                      <span>{formation.completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${formation.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Aucune formation disponible</p>
            </div>
          )}
        </div>
      </div>

      {/* Tableau détaillé des ressources par section */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">Détail des ressources par formation</h4>
            <Folder className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sections</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leçons</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durée</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apprenants</th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.myFormations && dashboardData.myFormations.length > 0 ? (
                dashboardData.myFormations.map((formation) => (
                  <tr key={formation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 max-w-[200px] truncate">
                            {formation.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formation.isPublished ? 'Publié' : 'Brouillon'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formation.totalSections}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formation.totalLessons}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.round(formation.totalDuration / 3600)}h {Math.round((formation.totalDuration % 3600) / 60)}min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formation.enrolledStudents}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-900">{formation.averageRating.toFixed(1)}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Aucune formation disponible
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Métriques avancées et recommandations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Métriques de ressources */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Métriques des ressources</h4>
            <FileText className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <span className="text-gray-700">Leçons par section (moyenne)</span>
              </div>
              <span className="font-medium">
                {dashboardData.myFormations.length > 0
                  ? Math.round(dashboardData.myFormations.reduce((acc, f) => acc + f.totalLessons, 0) /
                    dashboardData.myFormations.reduce((acc, f) => acc + f.totalSections, 0) || 1)
                  : 0}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">Durée par leçon (moyenne)</span>
              </div>
              <span className="font-medium">
                {dashboardData.myFormations.length > 0
                  ? Math.round(dashboardData.myFormations.reduce((acc, f) => acc + f.totalDuration, 0) /
                    dashboardData.myFormations.reduce((acc, f) => acc + f.totalLessons, 0) / 60 || 1)
                  : 0} min
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-purple-500" />
                <span className="text-gray-700">Apprenants par formation</span>
              </div>
              <span className="font-medium">
                {dashboardData.myFormations.length > 0
                  ? Math.round(dashboardData.myFormations.reduce((acc, f) => acc + f.enrolledStudents, 0) /
                    dashboardData.myFormations.length)
                  : 0}
              </span>
            </div>


          </div>
        </div>

        {/* Top entreprises */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Top entreprises clientes</h4>
            <Building className="h-5 w-5 text-gray-400" />
          </div>

          {dashboardData.students && dashboardData.students.length > 0 ? (
            <div className="space-y-3">
              {Object.entries(
                dashboardData.students.reduce((acc, student) => {
                  const company = student.company || 'Particuliers'
                  acc[company] = {
                    count: (acc[company]?.count || 0) + 1,
                    totalSpent: (acc[company]?.totalSpent || 0) + student.totalSpent
                  }
                  return acc
                }, {} as Record<string, { count: number, totalSpent: number }>)
              ).sort(([, a], [, b]) => b.count - a.count).slice(0, 5).map(([company, data], index) => (
                <div key={company} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${index === 0 ? 'bg-blue-100 text-blue-800' :
                      index === 1 ? 'bg-green-100 text-green-800' :
                        index === 2 ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-600'
                      }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 truncate max-w-[150px]">{company}</p>
                      <p className="text-sm text-gray-500">{data.count} apprenants</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(data.totalSpent)}</p>
                    <p className="text-sm text-gray-500">Total dépensé</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Aucune donnée d'entreprise</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderProfile = () => {
    if (!dashboardData?.formateur) {
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
                  {dashboardData.formateur.avatar ? (
                    <img
                      src={dashboardData.formateur.avatar}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                {isEditingProfile && (
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

              <h4 className="text-xl font-semibold text-gray-900">
                {dashboardData.formateur.name}
              </h4>
              <p className="text-gray-600">{dashboardData.formateur.email}</p>

              <div className="mt-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-sm text-gray-600">Profil complété</span>
                  <span className="text-sm font-medium text-blue-600">
                    {dashboardData.formateur.profileCompleteness}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${dashboardData.formateur.profileCompleteness}%` }}
                  ></div>
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
                    value={isEditingProfile ? profileData.name : dashboardData.formateur.name}
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
                    Email
                  </label>
                  <input
                    type="email"
                    value={isEditingProfile ? profileData.email : dashboardData.formateur.email || ''}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!isEditingProfile}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEditingProfile
                      ? 'border-gray-300 bg-white'
                      : 'border-gray-200 bg-gray-50'
                      }`}
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
                    // Clear error when user starts typing
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
                    // Clear error when user starts typing
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
                    // Clear error when user starts typing
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
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Mot de passe sécurisé</p>
                  <p className="text-sm text-gray-600">Dernière modification: Il y a 30 jours</p>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p className="mb-2">Recommandations pour un mot de passe sécurisé :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Au moins 8 caractères</li>
                  <li>Combinaison de lettres, chiffres et symboles</li>
                  <li>Éviter les informations personnelles</li>
                  <li>Changer régulièrement</li>
                </ul>
              </div>
            </div>
          )}
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
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
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
        {renderTabs()}

        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'appprenant' && renderStudents()}
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