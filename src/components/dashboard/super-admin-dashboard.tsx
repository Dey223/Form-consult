'use client'

import { useState, useEffect } from 'react'
import { DashboardHeader } from './dashboard-header'
import { PaymentStatus } from '@/components/payment/payment-status'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  BarChart3,
  Eye,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Edit,
  MoreHorizontal,
  Star,
  Activity,
  CreditCard,
  Settings,
  UserCheck,
  GraduationCap,
  MoreVertical,
  User,
  Bell
} from 'lucide-react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from '@/components/ui/dialog'
import { CompanyDetailsModal } from './modals/company-details-modal'
import { SubscriptionManagementModal } from './modals/subscription-management-modal'
import { UserManagementModal } from './modals/user-management-modal'
// import { UserDetailsModal } from './modals/user-details-modal'
import { CategoryManagementModal } from './modals/category-management-modal-simple'
import { AppointmentActionModal } from './modals/appointment-action-modal'
import { FormationActionsModal } from './modals/formation-actions-modal'
import { NotificationsPanel } from './layout/notifications-panel'
import { NotificationButton } from './layout/notification-button'
import { 
  RevenueChart, 
  PaymentStatusChart, 
  SubscriptionTrendsChart, 
  PlanDistributionChart, 
  PaymentMethodsChart 
} from '@/components/ui/charts'
import { 
  MixedRevenueChart, 
  RadialPerformanceChart, 
  DonutChart 
} from '@/components/ui/advanced-charts'
import toast from 'react-hot-toast'

interface SuperAdminDashboardData {
  globalStats: {
    totalCompanies: number
    totalUsers: number
    monthlyRevenue: number
    activeSubscriptions: number
    newSignups: number
  }
  recentCompanies: Array<{
    id: string
    name: string
    email: string
    plan: string
    planStatus: string
    users: number
    maxUsers: number
    status: string
    createdAt: string
    subscriptionDetails?: {
      planType: string
      status: string
      currentPeriodStart: Date | null
      currentPeriodEnd: Date | null
      cancelAtPeriodEnd: boolean
      stripeCustomerId: string | null
    } | null
    website?: string | null
    phone?: string | null
    address?: string | null
    formationStats: {
      totalFormations: number
      completedFormations: number
      averageProgress: number
      uniqueFormations: number
    }
    consultingStats: {
      totalAppointments: number
      estimatedHours: number
      monthlyLimit: number
    }
  }>
  paymentIssues: Array<{
    id: string
    company: string
    amount: number
    issue: string
    date: string
    planType: string
  }>
  systemHealth: {
    apiStatus: 'healthy' | 'warning' | 'error'
    dbStatus: 'healthy' | 'warning' | 'error'
    stripeStatus: 'healthy' | 'warning' | 'error'
  }
  allUsers: Array<{
    id: string
    name: string
    email: string
    company: { id: string; name: string }
    role: string
    status: string
    lastLogin: string
    createdAt: string
    isCurrentUser: boolean
    specialDetails: {
      // Pour les formateurs
      totalFormations?: number
      publishedFormations?: number
      totalStudents?: number
      latestFormation?: string
      // Pour les consultants
      totalAppointments?: number
      completedAppointments?: number
      totalHours?: number
      rating?: number
      // Pour les employés
      completedFormations?: number
      avgProgress?: number
      companyMember?: boolean
    }
  }>
  currentUserId: string
  contentStats: {
    totalFormations: number
    publishedFormations: number
    draftFormations: number
    totalLessons: number
    totalConsultants: number
    pendingContent: number
  }
  detailedContent: {
    formations: Array<{
      id: string
      title: string
      description: string
      level: string
      isPublished: boolean
      isActive: boolean
      createdAt: string
      author: { name: string; email: string } | null
      category: { name: string } | null
      subCategory: { name: string } | null
      levelRelation: { name: string } | null
      sections: Array<{
        id: string
        title: string
        isPublished: boolean
        lessons: Array<{
          id: string
          title: string
          isPublished: boolean
          duration: number
        }>
      }>
      userFormations: Array<{
        progress: number
        completedAt: string | null
        user: { name: string }
      }>
      _count: { userFormations: number }
    }>
    categories: Array<{
      id: string
      name: string
      subCategories: Array<{ id: string; name: string }>
      _count: { formations: number }
    }>
    recentLessons: Array<{
      id: string
      title: string
      duration: number
      type: string
      isPublished: boolean
      createdAt: string
      section: {
        formation: { title: string }
      }
    }>
  }
  consultingData: {
    appointments: Array<{
      id: string
      title: string
      description: string | null
      scheduledAt: string
      duration: number
      status: string
      user: { name: string; email: string }
      consultant: { name: string; email: string } | null
      company: { name: string }
    }>
    consultants: Array<{
      id: string
      name: string
      email: string
      consultantAppointments: Array<{
        id: string
        status: string
        scheduledAt: string
        duration: number
      }>
    }>
    appointmentStats: {
      total: number
      pending: number
      confirmed: number
      completed: number
      canceled: number
      thisMonth: number
    }
  }
  paymentStats: {
    totalRevenue: number
    thisMonthRevenue: number
    successfulPayments: number
    failedPayments: number
    refunds: number
    averageOrderValue: number
  }
  supportTickets: Array<{
    id: string
    subject: string
    company: string
    priority: string
    status: string
    createdAt: string
  }>
  chartData: {
    revenueData: Array<{
      month: string
      revenue: number
      subscriptions: number
      activeSubscriptions: number
      target: number
      growth: number
    }>
    paymentStatusData: Array<{
      name: string
      value: number
      color: string
    }>
    subscriptionTrendsData: Array<{
      week: string
      new: number
      canceled: number
      active: number
    }>
    planDistributionData: Array<{
      plan: string
      count: number
      revenue: number
    }>
    paymentMethodsData: Array<{
      method: string
      count: number
      percentage: number
    }>
    radialPerformanceData: Array<{
      name: string
      value: number
      target: number
      fill: string
    }>
    donutFinancialData: Array<{
      name: string
      value: number
      amount: number
    }>
  }
}

export function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboardData, setDashboardData] = useState<SuperAdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // États pour les modals
  const [selectedCompany, setSelectedCompany] = useState<SuperAdminDashboardData['recentCompanies'][0] | null>(null)
  const [selectedUser, setSelectedUser] = useState<SuperAdminDashboardData['allUsers'][0] | null>(null)
  const [selectedFormation, setSelectedFormation] = useState<string | null>(null)
  const [selectedFormationForActions, setSelectedFormationForActions] = useState<SuperAdminDashboardData['detailedContent']['formations'][0] | null>(null)
  const [showFormationActionsModal, setShowFormationActionsModal] = useState(false)
  const [showCompanyDetails, setShowCompanyDetails] = useState(false)
  const [showSubscriptionManagement, setShowSubscriptionManagement] = useState(false)
  const [showUserManagement, setShowUserManagement] = useState(false)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<SuperAdminDashboardData['consultingData']['appointments'][0] | null>(null)
  const [appointmentAction, setAppointmentAction] = useState<'accept' | 'cancel' | 'assign' | null>(null)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'canceled'>('all')
  
  // État pour les notifications
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard/super-admin')
        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
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

  // Handlers pour les modals
  const handleViewCompanyDetails = (company: SuperAdminDashboardData['recentCompanies'][0]) => {
    setSelectedCompany(company)
    setShowCompanyDetails(true)
  }

  const handleManageSubscription = (company: SuperAdminDashboardData['recentCompanies'][0]) => {
    setSelectedCompany(company)
    setShowSubscriptionManagement(true)
  }

  const handleManageUsers = (company: SuperAdminDashboardData['recentCompanies'][0]) => {
    setSelectedCompany(company)
    setShowUserManagement(true)
  }

  const handleViewUserDetails = (user: SuperAdminDashboardData['allUsers'][0]) => {
    setSelectedUser(user)
    setShowUserDetails(true)
  }

  const handleManageUser = (user: SuperAdminDashboardData['allUsers'][0]) => {
    setSelectedUser(user)
    setShowUserDetails(true)
  }

  // Nouvelles fonctions pour les formations
  const handleViewFormation = (formationId: string) => {
    window.open(`/formations/${formationId}`, '_blank')
  }

  const handleEditFormation = (formationId: string) => {
    window.open(`/dashboard/formations/${formationId}/edit`, '_blank')
  }

  const handleFormationActions = (formation: SuperAdminDashboardData['detailedContent']['formations'][0]) => {
    setSelectedFormationForActions(formation)
    setShowFormationActionsModal(true)
  }

  const handleToggleActive = async (formationId: string, currentIsActive: boolean) => {
    try {
      const response = await fetch(`/api/formations/${formationId}/toggle-active`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentIsActive })
      })

      if (response.ok) {
        // Recharger les données du dashboard
        const fetchDashboardData = async () => {
          try {
            const response = await fetch('/api/dashboard/super-admin')
            if (response.ok) {
              const data = await response.json()
              toast.success('Statut modifié avec succès')
              setDashboardData(data)
            }
          } catch (error) {
            console.error('Erreur lors du rechargement:', error)
          }
        }
        fetchDashboardData()
      } else {
        console.error('Erreur lors de la modification du statut')
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  // Fonctions pour les rendez-vous
  const handleAppointmentAction = (
    appointment: SuperAdminDashboardData['consultingData']['appointments'][0], 
    action: 'accept' | 'cancel' | 'assign'
  ) => {
    setSelectedAppointment(appointment)
    setAppointmentAction(action)
    setShowAppointmentModal(true)
  }

  const handleAppointmentSuccess = () => {
    // Recharger les données du dashboard
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard/super-admin')
        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
        }
      } catch (error) {
        console.error('Erreur lors du rechargement:', error)
      }
    }
    fetchDashboardData()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h1 className="text-4xl font-bold mb-2">
                Bienvenue dans FormConsult
              </h1>
              <p className="text-xl text-blue-100 mb-6">
                Plateforme de formation et consulting nouvelle génération
              </p>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{dashboardData?.globalStats.totalCompanies || '0'}</div>
                  <div className="text-blue-200 text-sm">Entreprises</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{dashboardData?.globalStats.totalUsers || '0'}</div>
                  <div className="text-blue-200 text-sm">Utilisateurs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{dashboardData?.globalStats.activeSubscriptions || '0'}</div>
                  <div className="text-blue-200 text-sm">Abonnements</div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-48 h-48 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Star className="w-24 h-24 text-yellow-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          onClick={() => setActiveTab('companies')}
          className="group cursor-pointer bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <Building2 className="w-8 h-8 text-emerald-600 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 mb-1">Entreprises</h3>
              <p className="text-sm text-emerald-700">Gérer les organisations</p>
            </div>
            <div className="text-2xl font-bold text-emerald-600">
              {dashboardData?.globalStats.totalCompanies || '0'}
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('users')}
          className="group cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <Users className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 mb-1">Utilisateurs</h3>
              <p className="text-sm text-blue-700">Gérer les comptes</p>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {dashboardData?.globalStats.totalUsers || '0'}
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('content')}
          className="group cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <BookOpen className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 mb-1">Contenu</h3>
              <p className="text-sm text-purple-700">Formations & cours</p>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {dashboardData?.contentStats.totalFormations || '0'}
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('consultations')}
          className="group cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <Star className="w-8 h-8 text-orange-600 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 mb-1">Consulting</h3>
              <p className="text-sm text-orange-700">Rendez-vous experts</p>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {dashboardData?.consultingData.appointmentStats.total || '0'}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Platform Features */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 ml-4">Fonctionnalités Avancées</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-gray-700">Gestion multi-entreprises</span>
            </div>
            <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-gray-700">Formations interactives</span>
            </div>
            <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-gray-700">Consulting personnalisé</span>
            </div>
            <div className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-gray-700">Analytics en temps réel</span>
            </div>
          </div>
        </div>

        {/* Activity Overview */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 ml-4">Activité Récente</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Nouvelles entreprises</p>
                  <p className="text-sm text-gray-600">Ce mois</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {dashboardData?.globalStats.newSignups || '0'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Formations publiées</p>
                  <p className="text-sm text-gray-600">Disponibles</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {dashboardData?.contentStats.publishedFormations || '0'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Consultations ce mois</p>
                  <p className="text-sm text-gray-600">Planifiées</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-purple-600">
                {dashboardData?.consultingData.appointmentStats.thisMonth || '0'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Développez votre plateforme</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Découvrez toutes les fonctionnalités de gestion et d'analyse
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              onClick={() => setActiveTab('companies')}
              className="bg-white text-indigo-600 hover:bg-indigo-50"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Gérer les entreprises
            </Button>
            <Button 
              onClick={() => setActiveTab('payments')}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
              variant="outline"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Voir les revenus
            </Button>
            <Button 
              onClick={() => setActiveTab('consultations')}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
              variant="outline"
            >
              <Star className="w-4 h-4 mr-2" />
              Consultations
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCompanies = () => (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Gestion des entreprises</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrer
          </Button>
          
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entreprise
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan & Abonnement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateurs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dashboardData?.recentCompanies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{company.name}</div>
                    <div className="text-sm text-gray-500">{company.email}</div>
                    <div className="text-xs text-gray-400">Créé le {company.createdAt}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        company.plan === 'ENTREPRISE' ? 'bg-purple-100 text-purple-800' :
                        company.plan === 'PRO' ? 'bg-blue-100 text-blue-800' :
                        company.plan === 'ESSENTIEL' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {company.plan}
                      </span>
                    </div>
                    {company.subscriptionDetails && (
                      <div className="text-xs text-gray-500">
                        {company.subscriptionDetails.currentPeriodEnd && (
                          <div>Expire: {new Date(company.subscriptionDetails.currentPeriodEnd).toLocaleDateString('fr-FR')}</div>
                        )}
                        {company.subscriptionDetails.cancelAtPeriodEnd && (
                          <div className="text-orange-600 font-medium">⚠️ Annulation programmée</div>
                        )}
                        {company.subscriptionDetails.stripeCustomerId && (
                          <div className="font-mono">Stripe: {company.subscriptionDetails.stripeCustomerId.slice(-8)}</div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-medium">
                    {company.users}/{company.maxUsers === 999 ? '∞' : company.maxUsers}
                  </div>
                  <div className="text-xs text-gray-500">
                    utilisateurs
                    {company.users >= company.maxUsers && company.maxUsers < 999 && (
                      <span className="text-orange-600 font-medium ml-1">⚠️ Limite atteinte</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    company.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800'
                      : company.status === 'PAST_DUE'
                        ? 'bg-orange-100 text-orange-800'
                      : company.status === 'UNPAID'
                        ? 'bg-yellow-100 text-yellow-800'
                      : company.status === 'CANCELED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {company.status === 'ACTIVE' ? 'Actif' : 
                     company.status === 'PAST_DUE' ? 'Retard' :
                     company.status === 'UNPAID' ? 'Impayé' : 
                     company.status === 'CANCELED' ? 'Annulé' : 
                     company.status === 'INACTIVE' ? 'Inactif' : company.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                  {company.phone && <div>📞 {company.phone}</div>}
                  {company.website && (
                    <div>
                      <a href={company.website} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:text-blue-800">
                        🌐 Site web
                      </a>
                    </div>
                  )}
                  {company.address && <div>📍 {company.address.slice(0, 20)}...</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Voir les détails"
                      onClick={() => handleViewCompanyDetails(company)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Gérer l'abonnement"
                      onClick={() => handleManageSubscription(company)}
                    >
                      <CreditCard className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Gérer les utilisateurs"
                      onClick={() => handleManageUsers(company)}
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Plus d'options">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Légende des plans */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Types de plans disponibles:</h4>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-1">
            <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 font-semibold">ESSENTIEL</span>
            <span className="text-gray-600">4999 MAD/mois</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold">PRO</span>
            <span className="text-gray-600">9999 MAD/mois</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800 font-semibold">ENTREPRISE</span>
            <span className="text-gray-600">19999 MAD/mois</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Gestion des utilisateurs</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrer
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entreprise
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rôle & Détails
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dernière connexion
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dashboardData?.allUsers.map((user) => (
              <tr key={user.id} className={user.isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                        {user.isCurrentUser && (
                          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                            (moi)
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.company.name}
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'SUPER_ADMIN' 
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'ADMIN_ENTREPRISE'
                          ? 'bg-blue-100 text-blue-800'
                          : user.role === 'FORMATEUR'
                            ? 'bg-green-100 text-green-800'
                            : user.role === 'CONSULTANT'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                    
                    {/* Détails spécialisés selon le rôle */}
                    {user.role === 'FORMATEUR' && user.specialDetails && (
                      <div className="text-xs text-gray-600 mt-1">
                        <div>📚 {user.specialDetails.publishedFormations}/{user.specialDetails.totalFormations} formations</div>
                        <div>👥 {user.specialDetails.totalStudents} étudiants</div>
                        {user.specialDetails.latestFormation !== 'Aucune' && (
                          <div>📖 Dernière: {user.specialDetails.latestFormation}</div>
                        )}
                      </div>
                    )}
                    
                    {user.role === 'CONSULTANT' && user.specialDetails && (
                      <div className="text-xs text-gray-600 mt-1">
                        <div>📅 {user.specialDetails.completedAppointments}/{user.specialDetails.totalAppointments} RDV</div>
                        <div>⏰ {user.specialDetails.totalHours}h consulting</div>
                        <div>⭐ {user.specialDetails.rating}/5 évaluation</div>
                      </div>
                    )}
                    
                    {(user.role === 'EMPLOYE' || user.role === 'ADMIN_ENTREPRISE') && user.specialDetails && user.specialDetails.companyMember && (
                      <div className="text-xs text-gray-600 mt-1">
                        <div>📋 {user.specialDetails.completedFormations}/{user.specialDetails.totalFormations} formations</div>
                        <div>📊 {user.specialDetails.avgProgress}% progression</div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.status === 'active' ? 'Actif' : 'En attente'}
                  </span>
                  {(user.role === 'FORMATEUR' || user.role === 'CONSULTANT') && (
                    <div className="text-xs text-green-600 mt-1">Membre plateforme</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Voir les détails"
                      onClick={() => handleViewUserDetails(user)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Gérer"
                      onClick={() => handleManageUser(user)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderContent = () => {
    const formations = dashboardData?.detailedContent?.formations || []
    const categories = dashboardData?.detailedContent?.categories || []
    const recentLessons = dashboardData?.detailedContent?.recentLessons || []

    return (
      <div className="space-y-6">
        {/* Stats du contenu */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Formations</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.contentStats.totalFormations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Publiées</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.contentStats.publishedFormations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Edit className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Brouillons</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.contentStats.draftFormations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Leçons</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.contentStats.totalLessons}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Consultants</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.contentStats.totalConsultants}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.contentStats.pendingContent}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vue d'ensemble des catégories */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📚 Catégories de Formations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                    {category._count.formations} formations
                  </span>
                </div>
                <div className="space-y-1">
                  {category.subCategories.map((sub) => (
                    <div key={sub.id} className="text-sm text-gray-600">
                      • {sub.name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formations récentes */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">🎓 Formations Récentes</h3>
            <Button variant="outline" size="sm" onClick={() => setShowCategoryModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Catégories
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auteur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étudiants</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contenu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formations.map((formation) => {
                  const totalLessons = formation.sections.reduce((acc, section) => acc + section.lessons.length, 0)
                  const publishedLessons = formation.sections.reduce((acc, section) => 
                    acc + section.lessons.filter(lesson => lesson.isPublished).length, 0)
                  // Calcul de la progression réelle des employés
                  const totalEmployees = formation.userFormations.length
                  const completedEmployees = formation.userFormations.filter(uf => uf.completedAt !== null).length
                  const avgProgress = totalEmployees > 0 
                    ? Math.round(formation.userFormations.reduce((acc, uf) => acc + (uf.progress || 0), 0) / totalEmployees)
                    : 0

                  return (
                    <tr key={formation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{formation.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{formation.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formation.author?.name || 'Anonyme'}</div>
                        <div className="text-sm text-gray-500">{formation.author?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formation.category?.name || 'Sans catégorie'}</div>
                        <div className="text-sm text-gray-500">{formation.subCategory?.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          formation.level === 'DEBUTANT' ? 'bg-green-100 text-green-800' :
                          formation.level === 'INTERMEDIAIRE' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {formation.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          formation.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {formation.isPublished ? 'Publiée' : 'Brouillon'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{totalEmployees} employés</div>
                        <div className="text-sm text-gray-500">
                          {totalEmployees > 0 ? (
                            <>
                              Progression: {avgProgress}% • {completedEmployees} terminé{completedEmployees > 1 ? 's' : ''}
                              {completedEmployees === totalEmployees && totalEmployees > 0 && (
                                <span className="ml-2 text-green-600 font-medium">✓ Tous terminés</span>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400">Aucun employé inscrit</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formation.sections.length} sections</div>
                        <div className="text-sm text-gray-500">{publishedLessons}/{totalLessons} leçons</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm" onClick={() => handleViewFormation(formation.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditFormation(formation.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleFormationActions(formation)}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leçons récentes */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📝 Leçons Récemment Ajoutées</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentLessons.map((lesson) => (
              <div key={lesson.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 truncate">{lesson.title}</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    lesson.type === 'VIDEO' ? 'bg-blue-100 text-blue-800' :
                    lesson.type === 'QUIZ' ? 'bg-purple-100 text-purple-800' :
                    lesson.type === 'TEXT' ? 'bg-green-100 text-green-800' :
                    lesson.type === 'DOCUMENT' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {lesson.type || 'VIDEO'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Formation: {lesson.section.formation.title}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{Math.floor(lesson.duration / 60)} min</span>
                  <span>{new Date(lesson.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions de contenu */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">⚡ Actions de Modération</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="h-16 flex flex-col space-y-2">
              <CheckCircle className="h-6 w-6" />
              <span>Approuver formations</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col space-y-2">
              <Edit className="h-6 w-6" />
              <span>Modérer contenu</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span>Gérer formateurs</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col space-y-2">
              <BarChart3 className="h-6 w-6" />
              <span>Analytiques</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderPayments = () => {
    // Utilisation des données réelles de l'API
    const revenueData = dashboardData?.chartData?.revenueData || []
    const paymentStatusData = dashboardData?.chartData?.paymentStatusData || []
    const subscriptionTrendsData = dashboardData?.chartData?.subscriptionTrendsData || []
    const planDistributionData = dashboardData?.chartData?.planDistributionData || []
    const paymentMethodsData = dashboardData?.chartData?.paymentMethodsData || []

    return (
      <div className="space-y-6">
        {/* Stats des paiements */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Chiffre total</p>
                <p className="text-xl font-bold text-gray-900">{dashboardData?.paymentStats.totalRevenue.toLocaleString()} MAD</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Ce mois</p>
                <p className="text-xl font-bold text-gray-900">{dashboardData?.paymentStats.thisMonthRevenue.toLocaleString()} MAD</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Réussis</p>
                <p className="text-xl font-bold text-gray-900">{dashboardData?.paymentStats.successfulPayments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Échoués</p>
                <p className="text-xl font-bold text-gray-900">{dashboardData?.paymentStats.failedPayments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Remboursements</p>
                <p className="text-xl font-bold text-gray-900">{dashboardData?.paymentStats.refunds}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Panier moyen</p>
                <p className="text-xl semi-bold text-gray-900">{dashboardData?.paymentStats.averageOrderValue} MAD</p>
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques financiers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart data={revenueData} />
          <PaymentStatusChart data={paymentStatusData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SubscriptionTrendsChart data={subscriptionTrendsData} />
          <PlanDistributionChart data={planDistributionData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PaymentMethodsChart data={paymentMethodsData} />
          
          {/* Actions de paiement */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button className="h-16 flex flex-col space-y-2">
                <DollarSign className="h-6 w-6" />
                <span className="text-sm">Gérer les paiements</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col space-y-2">
                <XCircle className="h-6 w-6" />
                <span className="text-sm">Résoudre les échecs</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col space-y-2">
                <Clock className="h-6 w-6" />
                <span className="text-sm">Traiter remboursements</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col space-y-2">
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm">Rapport financier</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Graphiques avancés avec données réelles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MixedRevenueChart data={revenueData.map(item => ({
            month: item.month,
            revenue: item.revenue,
            target: item.target,
            growth: item.growth
          }))} />
          <RadialPerformanceChart data={dashboardData?.chartData?.radialPerformanceData || []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DonutChart data={dashboardData?.chartData?.donutFinancialData || []} />
          
          {/* Insights financiers */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">💡 Insights financiers</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-medium text-blue-900">Tendance positive</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Croissance de {revenueData.length > 1 ? revenueData[revenueData.length - 1]?.growth || 0 : 0}% ce mois-ci
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <h4 className="font-medium text-green-900">Performance des plans</h4>
                <p className="text-sm text-green-700 mt-1">
                  Le plan PRO génère le plus de revenus
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-medium text-purple-900">Recommandation</h4>
                <p className="text-sm text-purple-700 mt-1">
                  Optimiser la conversion vers les plans premium
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Problèmes de paiement */}
        {dashboardData?.paymentIssues && dashboardData.paymentIssues.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Problèmes de paiement urgents
            </h3>
            <div className="space-y-3">
              {dashboardData.paymentIssues.slice(0, 5).map((issue) => (
                <div key={issue.id} className="flex justify-between items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <p className="font-medium text-red-900">{issue.company}</p>
                    <p className="text-sm text-red-700">{issue.issue}</p>
                    <p className="text-xs text-red-600">{issue.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-900">{issue.amount} MAD</p>
                    <Button size="sm" variant="outline" className="mt-1">
                      Résoudre
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderConsultations = () => {
    const appointments = dashboardData?.consultingData?.appointments || []
    const consultants = dashboardData?.consultingData?.consultants || []
    const stats = dashboardData?.consultingData?.appointmentStats

    // Filtrer les rendez-vous selon le filtre sélectionné
    const filteredAppointments = appointments.filter(appointment => {
      if (appointmentFilter === 'all') return true
      return appointment.status.toLowerCase() === appointmentFilter
    })

    return (
      <div className="space-y-6">
        {/* Stats des consultations */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total RDV</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.pending || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmés</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.confirmed || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Complétés</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.completed || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Annulés</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.canceled || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ce mois</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.thisMonth || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Consultants actifs */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">👨‍💼 Consultants Actifs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {consultants.map((consultant) => {
              const totalSessions = consultant.consultantAppointments.filter(apt => apt.status === 'COMPLETED').length
              const upcomingSessions = consultant.consultantAppointments.filter(apt => 
                new Date(apt.scheduledAt) > new Date() && apt.status !== 'CANCELED'
              ).length
              const totalHours = consultant.consultantAppointments
                .filter(apt => apt.status === 'COMPLETED')
                .reduce((acc, apt) => acc + apt.duration, 0) / 60

              return (
                <div key={consultant.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{consultant.name || 'Consultant'}</h4>
                      <p className="text-sm text-gray-600">{consultant.email}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${upcomingSessions > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">{totalSessions}</div>
                      <div className="text-xs text-gray-500">Sessions</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{Math.round(totalHours)}h</div>
                      <div className="text-xs text-gray-500">Heures</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">{upcomingSessions}</div>
                      <div className="text-xs text-gray-500">À venir</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Rendez-vous récents */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">📅 Rendez-vous Récents</h3>
            <div className="flex space-x-2">
              <select
                value={appointmentFilter}
                onChange={(e) => setAppointmentFilter(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Tous les RDV</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmés</option>
                <option value="completed">Terminés</option>
                <option value="canceled">Annulés</option>
              </select>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau RDV
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consultation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consultant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Heure</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durée</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{appointment.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{appointment.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{appointment.user.name}</div>
                      <div className="text-sm text-gray-500">{appointment.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {appointment.consultant?.name || 'Non assigné'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.consultant?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{appointment.company.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(appointment.scheduledAt).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(appointment.scheduledAt).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{appointment.duration} min</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                        appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'CANCELED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status === 'COMPLETED' ? 'Terminé' :
                         appointment.status === 'CONFIRMED' ? 'Confirmé' :
                         appointment.status === 'PENDING' ? 'En attente' :
                         appointment.status === 'CANCELED' ? 'Annulé' :
                         appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        {appointment.status === 'PENDING' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleAppointmentAction(appointment, 'accept')}
                              title="Accepter"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-blue-600 hover:text-blue-700"
                              onClick={() => handleAppointmentAction(appointment, 'assign')}
                              title="Assigner consultant"
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleAppointmentAction(appointment, 'cancel')}
                          title="Annuler"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedAppointment(appointment)}
                          title="Voir détails"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions de consultation */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">⚡ Actions de Gestion</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              className="h-16 flex flex-col space-y-2"
              onClick={() => setActiveTab('users')}
            >
              <Users className="h-6 w-6" />
              <span>Gérer consultants</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex flex-col space-y-2"
              onClick={() => setAppointmentFilter('pending')}
            >
              <CheckCircle className="h-6 w-6" />
              <span>Approuver RDV</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex flex-col space-y-2"
              onClick={() => alert('Fonctionnalité de planification à venir')}
            >
              <Settings className="h-6 w-6" />
              <span>Planification</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex flex-col space-y-2"
              onClick={() => setActiveTab('payments')}
            >
              <BarChart3 className="h-6 w-6" />
              <span>Rapports</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderSupport = () => (
    <div className="space-y-6">
      {/* Header avec stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-red-700">Tickets ouverts</p>
              <p className="text-2xl font-bold text-red-900">
                {dashboardData?.supportTickets.filter(t => t.status === 'open').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-700">En cours</p>
              <p className="text-2xl font-bold text-yellow-900">
                {dashboardData?.supportTickets.filter(t => t.status === 'in_progress').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-700">Résolus</p>
              <p className="text-2xl font-bold text-green-900">
                {dashboardData?.supportTickets.filter(t => t.status === 'closed').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <HelpCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-700">Total tickets</p>
              <p className="text-2xl font-bold text-blue-900">
                {dashboardData?.supportTickets.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-xl p-6 shadow-lg border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau ticket
          </Button>
          <Button variant="outline" className="flex items-center justify-center border-orange-200 hover:bg-orange-50">
            <Filter className="h-4 w-4 mr-2" />
            Filtrer les tickets
          </Button>
          <Button variant="outline" className="flex items-center justify-center border-purple-200 hover:bg-purple-50">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" className="flex items-center justify-center border-green-200 hover:bg-green-50">
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistiques
          </Button>
        </div>
      </div>

      {/* Liste des tickets sous forme de cartes */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Tickets récents</h3>
        {dashboardData?.supportTickets.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-lg border">
            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun ticket</h3>
            <p className="text-gray-600">Il n'y a pas encore de tickets de support.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData?.supportTickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-xl p-6 shadow-lg border hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{ticket.subject}</h4>
                    <p className="text-sm text-gray-600">{ticket.company}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${
                    ticket.priority === 'high' 
                      ? 'bg-red-100 text-red-800'
                      : ticket.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {ticket.priority === 'high' ? '🔴 Haute' : 
                     ticket.priority === 'medium' ? '🟡 Moyenne' : '🟢 Basse'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                    ticket.status === 'open' 
                      ? 'bg-red-100 text-red-800'
                      : ticket.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {ticket.status === 'open' ? '📥 Ouvert' : 
                     ticket.status === 'in_progress' ? '⚡ En cours' : '✅ Fermé'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    💬 Répondre
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
      {/* Header avec stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-700">Total formations</p>
              <p className="text-2xl font-bold text-blue-900">
                {dashboardData?.contentStats.totalFormations || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-700">Publiées</p>
              <p className="text-2xl font-bold text-green-900">
                {dashboardData?.contentStats.publishedFormations || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <Edit className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-700">Brouillons</p>
              <p className="text-2xl font-bold text-orange-900">
                {dashboardData?.contentStats.draftFormations || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-700">Étudiants actifs</p>
              <p className="text-2xl font-bold text-purple-900">
                {dashboardData?.detailedContent?.formations.reduce((sum, f) => sum + f._count.userFormations, 0) || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et actions */}
      <div className="bg-white rounded-xl p-6 shadow-lg border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-lg font-medium text-gray-900">Catalogue des formations</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50">
              <Filter className="h-4 w-4 mr-2" />
              Tous niveaux
            </Button>
            <Button variant="outline" size="sm" className="border-green-200 hover:bg-green-50">
              <CheckCircle className="h-4 w-4 mr-2" />
              Publiées
            </Button>
            <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50">
              <Edit className="h-4 w-4 mr-2" />
              Brouillons
            </Button>
          </div>
        </div>
      </div>

      {/* Grille des formations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dashboardData?.detailedContent?.formations.map((formation) => {
          const totalDuration = formation.sections.reduce((sum, section) => 
            sum + section.lessons.reduce((lessonSum, lesson) => lessonSum + (lesson.duration || 0), 0), 0
          )
          const hours = Math.floor(totalDuration / 3600)
          const minutes = Math.floor((totalDuration % 3600) / 60)
          
          return (
            <div key={formation.id} className="group bg-white rounded-2xl shadow-lg border hover:shadow-xl transition-all duration-300 overflow-hidden">
              {/* Image placeholder avec gradient */}
              <div className="h-48 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-white/80" />
                </div>
                {/* Badge niveau */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    formation.level === 'DEBUTANT' 
                      ? 'bg-green-500 text-white'
                      : formation.level === 'INTERMEDIAIRE'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-red-500 text-white'
                  }`}>
                    {formation.level === 'DEBUTANT' ? '🟢 Débutant' :
                     formation.level === 'INTERMEDIAIRE' ? '🟡 Intermédiaire' : '🔴 Avancé'}
                  </span>
                </div>
                {/* Badge statut et activation */}
                <div className="absolute top-3 right-3 flex flex-col gap-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    formation.isPublished 
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}>
                    {formation.isPublished ? '✅ Publié' : '📝 Brouillon'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    formation.isActive 
                      ? 'bg-blue-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {formation.isActive ? '🟢 Actif' : '🔴 Inactif'}
                  </span>
                </div>
              </div>
              
              {/* Contenu */}
              <div className="p-6">
                <div className="mb-3">
                  <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {formation.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {formation.description}
                  </p>
                </div>
                
                {/* Métadonnées */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{hours}h {minutes}min</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{formation._count.userFormations} étudiants</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span>{formation.sections.length} sections</span>
                  </div>
                  {formation.author && (
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-2" />
                      <span>{formation.author.name}</span>
                    </div>
                  )}
                </div>
                
                {/* Catégories */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {formation.category && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {formation.category.name}
                    </span>
                  )}
                  {formation.subCategory && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      {formation.subCategory.name}
                    </span>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="flex-1 hover:bg-blue-50"
                    onClick={() => handleViewFormation(formation.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="flex-1 hover:bg-green-50"
                    onClick={() => handleEditFormation(formation.id)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Éditer
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="hover:bg-gray-50"
                    onClick={() => handleFormationActions(formation)}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Message si pas de formations */}
      {(!dashboardData?.detailedContent?.formations || dashboardData.detailedContent.formations.length === 0) && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg border">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune formation</h3>
          <p className="text-gray-600">Il n'y a pas encore de formations créées sur la plateforme.</p>
        </div>
      )}
    </div>
  )

  const tabs = [
    { id: 'overview', label: 'Vue générale', icon: BarChart3 },
    { id: 'companies', label: 'Entreprises', icon: Building2 },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'content', label: 'Contenu', icon: BookOpen },
    { id: 'formations', label: 'Formations', icon: GraduationCap },
    { id: 'consultations', label: 'Consultations', icon: Star },
    { id: 'payments', label: 'Paiements', icon: DollarSign },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <PaymentStatus />
      <DashboardHeader 
        title="Super Admin" 
        subtitle="Administration globale de la plateforme FormConsult"
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
          {activeTab === 'companies' && renderCompanies()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'content' && renderContent()}
          {activeTab === 'formations' && renderFormations()}
          {activeTab === 'consultations' && renderConsultations()}
          {activeTab === 'payments' && renderPayments()}
          {activeTab === 'support' && renderSupport()}
        </div>
      </div>

      {/* Modals */}
      <CompanyDetailsModal
        isOpen={showCompanyDetails}
        onClose={() => setShowCompanyDetails(false)}
        company={selectedCompany}
      />

      <SubscriptionManagementModal
        isOpen={showSubscriptionManagement}
        onClose={() => setShowSubscriptionManagement(false)}
        company={selectedCompany}
      />

      <UserManagementModal
        isOpen={showUserManagement}
        onClose={() => setShowUserManagement(false)}
        company={selectedCompany}
      />

      {/* UserDetailsModal temporarily disabled due to type incompatibility */}
      {showUserDetails && selectedUser && (
        <Dialog open={showUserDetails} onOpenChange={(open) => !open && setShowUserDetails(false)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Détails utilisateur</DialogTitle>
              <DialogDescription>
                Informations sur {selectedUser.name || 'Utilisateur'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p><strong>Nom:</strong> {selectedUser.name}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Rôle:</strong> {selectedUser.role}</p>
                <p><strong>Entreprise:</strong> {selectedUser.company.name}</p>
                <p><strong>Statut:</strong> {selectedUser.status}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUserDetails(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <CategoryManagementModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        categories={dashboardData?.detailedContent?.categories || []}
        onRefresh={() => {
          // Refrescher les données du dashboard
          window.location.reload()
        }}
      />

      <AppointmentActionModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        appointment={selectedAppointment}
        action={appointmentAction}
        onSuccess={handleAppointmentSuccess}
      />

      <FormationActionsModal
        isOpen={showFormationActionsModal}
        onClose={() => setShowFormationActionsModal(false)}
        formation={selectedFormationForActions}
        onToggleActive={handleToggleActive}
        onViewFormation={handleViewFormation}
        onEditFormation={handleEditFormation}
      />
    </div>
  )
} 