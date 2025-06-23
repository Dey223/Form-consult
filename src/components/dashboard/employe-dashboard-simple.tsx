'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Play, 
  TrendingUp,
  MessageSquare,
  Bell,
  User,
  BarChart3,
  HelpCircle,
  Download,
  RefreshCcw,
  EyeIcon,
  Save,
  Edit2,
  Building,
  Phone,
  Mail,
  Globe,
  MapPin
} from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { NotificationButton } from '@/components/dashboard/layout/notification-button'
import { CreateConsultationModal } from '@/components/dashboard/modals/create-consultation-modal'
import FormationsCalendar from './formations-calendar'
import ProgressAnalytics from './progress-analytics'
import { ConsultationsTab } from './employe-tabs/consultations-tab'

interface EmployeeDashboardData {
  user: {
    id: string
    name: string
    email: string
    role: string
    company?: {
      id: string
      name: string
      email: string
      phone: string
      address: string
      website: string
      logo: string
    } | null
  }
  stats: {
    totalConsultations: number
    pendingConsultations: number
    completedConsultations: number
    totalFormations: number
    completedFormations: number
    inProgressFormations: number
  }
  recentConsultations: Array<{
    id: string
    title: string
    description: string
    status: string
    scheduledAt: string
    createdAt: string
  }>
  upcomingConsultations: Array<{
    id: string
    title: string
    description: string
    status: string
    scheduledAt: string
  }>
  formations: Array<{
    id: string
    title: string
    description: string
    price: number
    level: string
    createdAt: string
    enrolledAt: string
    progress: number
    completedAt: string | null
  }>
  notifications: Array<{
    id: string
    type: string
    title: string
    message: string
    isRead: boolean
    createdAt: string
  }>
}

export function EmployeDashboard() {
  const [dashboardData, setDashboardData] = useState<EmployeeDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('formations')
  const [showConsultationModal, setShowConsultationModal] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    company: {
      name: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      logo: ''
    }
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/employe')
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setDashboardData(data)
      
      // Initialiser les données de profil
      setProfileData({
        name: data.user.name || '',
        email: data.user.email || '',
        company: {
          name: data.user.company?.name || '',
          email: data.user.company?.email || '',
          phone: data.user.company?.phone || '',
          address: data.user.company?.address || '',
          website: data.user.company?.website || '',
          logo: data.user.company?.logo || ''
        }
      })
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement du dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/dashboard/employe/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      if (response.ok) {
        setIsEditingProfile(false)
        toast.success('Profil mis à jour avec succès')
        await fetchDashboardData() // Rafraîchir les données
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error('Erreur de connexion')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de votre dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Erreur lors du chargement des données</p>
          <Button onClick={fetchDashboardData} className="mt-4">
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  const renderFormations = () => (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formations totales</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.totalFormations}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.completedFormations}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.inProgressFormations}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progression</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((dashboardData.stats.completedFormations / (dashboardData.stats.totalFormations || 1)) * 100)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des formations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardData.formations.length > 0 ? (
          dashboardData.formations.map((formation) => (
            <Card key={formation.id} className="overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-white" />
              </div>
              
              <CardHeader>
                <CardTitle className="text-lg">{formation.title}</CardTitle>
                <CardDescription>{formation.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="secondary">{formation.level}</Badge>
                  <span className="text-muted-foreground">
                    Inscrit le {new Date(formation.enrolledAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Barre de progression */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progression</span>
                    <span>{formation.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${formation.completedAt ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${formation.progress}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {formation.completedAt ? (
                    <>
                      <Button variant="outline" className="w-full" size="sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Formation terminée
                      </Button>
                      <Link href={`/formations/${formation.id}`}>
                      <Button variant="outline" className="w-full" size="sm">
                        <EyeIcon className="h-4 w-4 mr-2" />
                        Revoir la formation 
                      </Button>
                      </Link>
                     
                     
                    </>
                  ) : (
                    <Link href={`/formations/${formation.id}`}>
                      <Button className="w-full" size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        {formation.progress > 0 ? 'Continuer' : 'Commencer'}
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune formation assignée pour le moment</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderConsultations = () => (
    <div className="space-y-6">
      {/* Statistiques consultations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total consultations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.totalConsultations}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.pendingConsultations}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.completedConsultations}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bouton nouvelle consultation */}
      <Card>
        <CardHeader>
          <CardTitle>Demander une consultation</CardTitle>
          <CardDescription>
            Planifiez une session avec nos experts pour résoudre vos défis professionnels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowConsultationModal(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            Nouvelle consultation
          </Button>
        </CardContent>
      </Card>

      {/* Consultations récentes */}
      <Card>
        <CardHeader>
          <CardTitle>Consultations récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData.recentConsultations.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentConsultations.map((consultation) => (
                <div key={consultation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{consultation.title}</h4>
                    <p className="text-sm text-gray-600">{consultation.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Créé le {new Date(consultation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge 
                    variant={consultation.status === 'CONFIRMED' ? 'default' : 
                            consultation.status === 'PENDING' ? 'secondary' : 'destructive'}
                  >
                    {consultation.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Aucune consultation récente</p>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderProfile = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Mon Profil</CardTitle>
            <CardDescription>Gérez vos informations personnelles et celles de votre entreprise</CardDescription>
          </div>
          <div className="flex gap-2">
            {isEditingProfile ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditingProfile(false)
                    // Restaurer les données originales
                    if (dashboardData) {
                      setProfileData({
                        name: dashboardData.user.name || '',
                        email: dashboardData.user.email || '',
                        company: {
                          name: dashboardData.user.company?.name || '',
                          email: dashboardData.user.company?.email || '',
                          phone: dashboardData.user.company?.phone || '',
                          address: dashboardData.user.company?.address || '',
                          website: dashboardData.user.company?.website || '',
                          logo: dashboardData.user.company?.logo || ''
                        }
                      })
                    }
                  }}
                >
                  Annuler
                </Button>
                <Button size="sm" onClick={handleSaveProfile}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setIsEditingProfile(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Informations personnelles */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informations personnelles
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={isEditingProfile ? profileData.name : dashboardData?.user.name}
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
                  Email professionnel
                </label>
                <input
                  type="email"
                  value={isEditingProfile ? profileData.email : dashboardData?.user.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!isEditingProfile}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEditingProfile
                      ? 'border-gray-300 bg-white'
                      : 'border-gray-200 bg-gray-50'
                    }`}
                  placeholder="votre.email@entreprise.com"
                />
              </div>
            </div>
          </div>

          {/* Informations de l'entreprise */}
          {dashboardData?.user.company && (
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Informations de l'entreprise
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    value={profileData.company.name}
                    onChange={(e) => setProfileData({ ...profileData, company: { ...profileData.company, name: e.target.value }})}
                    disabled={!isEditingProfile}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEditingProfile
                        ? 'border-gray-300 bg-white'
                        : 'border-gray-200 bg-gray-50'
                      }`}
                    placeholder="Nom de votre entreprise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email entreprise
                  </label>
                  <input
                    type="email"
                    value={profileData.company.email}
                    onChange={(e) => setProfileData({ ...profileData, company: { ...profileData.company, email: e.target.value }})}
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
                    value={profileData.company.phone}
                    onChange={(e) => setProfileData({ ...profileData, company: { ...profileData.company, phone: e.target.value }})}
                    disabled={!isEditingProfile}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEditingProfile
                        ? 'border-gray-300 bg-white'
                        : 'border-gray-200 bg-gray-50'
                      }`}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site web
                  </label>
                  <input
                    type="url"
                    value={profileData.company.website}
                    onChange={(e) => setProfileData({ ...profileData, company: { ...profileData.company, website: e.target.value }})}
                    disabled={!isEditingProfile}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEditingProfile
                        ? 'border-gray-300 bg-white'
                        : 'border-gray-200 bg-gray-50'
                      }`}
                    placeholder="https://www.entreprise.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse complète
                  </label>
                  <textarea
                    value={profileData.company.address}
                    onChange={(e) => setProfileData({ ...profileData, company: { ...profileData.company, address: e.target.value }})}
                    disabled={!isEditingProfile}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEditingProfile
                        ? 'border-gray-300 bg-white'
                        : 'border-gray-200 bg-gray-50'
                      }`}
                    placeholder="Adresse complète de l'entreprise"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL du logo
                  </label>
                  <input
                    type="url"
                    value={profileData.company.logo}
                    onChange={(e) => setProfileData({ ...profileData, company: { ...profileData.company, logo: e.target.value }})}
                    disabled={!isEditingProfile}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEditingProfile
                        ? 'border-gray-300 bg-white'
                        : 'border-gray-200 bg-gray-50'
                      }`}
                    placeholder="https://www.entreprise.com/logo.png"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const tabs = [
    { id: 'formations', label: 'Mes formations', icon: BookOpen },
    { id: 'calendar', label: 'Calendrier', icon: Calendar },
    { id: 'analytics', label: 'Progression', icon: BarChart3 },
    { id: 'consultations', label: 'Consultations', icon: MessageSquare },
    { id: 'profile', label: 'Mon Profil', icon: User },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title={`Bonjour ${dashboardData.user.name} 👋`}
        subtitle="Bienvenue dans votre espace employé"
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
            
           
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'formations' && renderFormations()}
          {activeTab === 'calendar' && <FormationsCalendar />}
          {activeTab === 'analytics' && <ProgressAnalytics />}
          {activeTab === 'consultations' && <ConsultationsTab />}
          {activeTab === 'profile' && renderProfile()}
        </div>
      </div>

      {/* Modal de création de consultation */}
      <CreateConsultationModal
        isOpen={showConsultationModal}
        onClose={() => setShowConsultationModal(false)}
        onSuccess={() => {
          setShowConsultationModal(false)
          fetchDashboardData()
        }}
        userName={dashboardData.user.name}
        companyName="FormConsult"
      />
    </div>
  )
} 