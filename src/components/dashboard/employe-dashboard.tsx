'use client'

import { useState, useEffect } from 'react'
import { DashboardHeader } from './dashboard-header'
import { PaymentStatus } from '@/components/payment/payment-status'
import { Button } from '@/components/ui/button'
import { CreateConsultationModal } from './modals/create-consultation-modal'
import { NotificationButton } from './layout/notification-button'
import { NotificationTest } from './layout/notification-test'
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Award, 
  Clock, 
  BarChart3,
  HelpCircle,
  Download,
  TrendingUp,
  Target,
  Calendar,
  MessageCircle,
  FileText,
  Phone,
  Mail,
  Users,
  Zap,
  Star
} from 'lucide-react'
import Link from 'next/link'

interface EmployeeDashboardData {
  user: {
    id: string
    name: string
    email: string
    role: string
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
  const [activeTab, setActiveTab] = useState('formations')
  const [dashboardData, setDashboardData] = useState<EmployeeDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showConsultationModal, setShowConsultationModal] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError(null)
        const response = await fetch('/api/dashboard/employe')
        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Erreur lors du chargement des données')
        }
      } catch (error) {
        console.error('Erreur:', error)
        setError('Erreur de connexion. Veuillez réessayer.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PaymentStatus />
        <DashboardHeader 
          title="Espace Employé" 
          subtitle="Chargement de vos données..."
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm border animate-pulse">
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PaymentStatus />
        <DashboardHeader 
          title="Espace Employé" 
          subtitle="Une erreur est survenue"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="p-3 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4">
              <HelpCircle className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-red-900 mb-2">Erreur de chargement</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderFormations = () => (
    <div className="space-y-6">
      {/* Vue d'ensemble améliorée */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Bonjour {dashboardData?.user.name} ! 👋</h3>
            <p className="text-blue-100">Continuez votre parcours d'apprentissage</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Dernière activité</div>
            <div className="text-lg font-medium">
              Aujourd'hui
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{dashboardData?.stats.completedFormations}</div>
              <div className="text-sm text-gray-600">Formations terminées</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{dashboardData?.stats.totalConsultations}</div>
              <div className="text-sm text-gray-600">Consultations</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round((dashboardData?.stats.completedFormations || 0) / (dashboardData?.stats.totalFormations || 1) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Progression globale</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{dashboardData?.stats.totalFormations}</div>
              <div className="text-sm text-gray-600">Formations assignées</div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des formations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardData?.formations?.map((formation) => (
          <div key={formation.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2">{formation.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{formation.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Formation
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    En ligne
                  </div>
                </div>
                <span className="bg-gray-100 px-2 py-1 rounded text-xs">{formation.level}</span>
              </div>

              {/* Barre de progression */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progression</span>
                  <span>{formation.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${formation.completedAt ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${formation.progress}%` }}
                  ></div>
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
                    <Button size="sm" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger le certificat
                    </Button>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderProgress = () => (
    <div className="space-y-6">
      {/* Statistiques mensuelles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Heures ce mois</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.progressData.monthlyStats.hoursThisMonth}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Formations terminées</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.progressData.monthlyStats.formationsCompleted}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En cours</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.progressData.monthlyStats.formationsStarted}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Score moyen</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.progressData.monthlyStats.averageScore}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progression hebdomadaire */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Progression hebdomadaire</h3>
          <div className="space-y-4">
            {dashboardData?.progressData.weeklyProgress.map((week) => (
              <div key={week.week} className="flex items-center">
                <div className="w-8 text-sm font-medium text-gray-600">{week.week}</div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(week.hours / 20) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 text-sm font-medium text-gray-900">{week.hours}h</div>
              </div>
            ))}
          </div>
        </div>

        {/* Progression par compétences */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Progression par compétences</h3>
          <div className="space-y-4">
            {dashboardData?.progressData.skillsProgress.map((skill) => (
              <div key={skill.skill} className="flex items-center">
                <div className="w-24 text-sm font-medium text-gray-600">{skill.skill}</div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        skill.level >= 80 ? 'bg-green-500' :
                        skill.level >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 text-sm font-medium text-gray-900">{skill.level}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accomplissements récents */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Accomplissements récents</h3>
        <div className="space-y-3">
          {dashboardData?.recentAchievements.length ? dashboardData.recentAchievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center p-3 bg-green-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                {achievement.type === 'completion' && <CheckCircle className="h-5 w-5 text-green-600" />}
                {achievement.type === 'certificate' && <Award className="h-5 w-5 text-green-600" />}
                {achievement.type === 'streak' && <Zap className="h-5 w-5 text-green-600" />}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{achievement.title}</p>
                <p className="text-xs text-gray-500">{new Date(achievement.date).toLocaleDateString()}</p>
              </div>
            </div>
          )) : (
            <p className="text-gray-500 text-center py-4">Aucun accomplissement récent</p>
          )}
        </div>
      </div>
    </div>
  )

  const handleConsultationSuccess = () => {
    // Optionnel: rafraîchir les données ou montrer un message
    console.log('Consultation créée avec succès')
  }

  const renderSupport = () => (
    <div className="space-y-6">
      {/* Contact rapide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border text-center">
          <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4">
            <MessageCircle className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chat en direct</h3>
          <p className="text-sm text-gray-600 mb-4">Discutez avec notre équipe support</p>
          <Button className="w-full">Démarrer le chat</Button>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border text-center">
          <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4">
            <Phone className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Support téléphonique</h3>
          <p className="text-sm text-gray-600 mb-4">Appelez-nous directement</p>
          <Button variant="outline" className="w-full">01 23 45 67 89</Button>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border text-center">
          <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4">
            <Mail className="h-10 w-10 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Support par email</h3>
          <p className="text-sm text-gray-600 mb-4">Envoyez-nous un message</p>
          <Button variant="outline" className="w-full">support@formation.com</Button>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Questions fréquentes</h3>
        <div className="space-y-4">
          <details className="border rounded-lg p-4">
            <summary className="font-medium cursor-pointer">Comment accéder à mes formations ?</summary>
            <p className="mt-2 text-sm text-gray-600">
              Vous pouvez accéder à vos formations depuis l'onglet "Mes formations" ou en cliquant sur "Commencer" ou "Continuer" sur une formation.
            </p>
          </details>
          
          <details className="border rounded-lg p-4">
            <summary className="font-medium cursor-pointer">Comment télécharger mon certificat ?</summary>
            <p className="mt-2 text-sm text-gray-600">
              Une fois votre formation terminée avec succès, un bouton "Télécharger le certificat" apparaîtra sur la carte de formation.
            </p>
          </details>
          
          <details className="border rounded-lg p-4">
            <summary className="font-medium cursor-pointer">Ma progression n'est pas sauvegardée</summary>
            <p className="mt-2 text-sm text-gray-600">
              Vérifiez votre connexion internet. La progression est automatiquement sauvegardée pendant que vous regardez les vidéos.
            </p>
          </details>
          
          <details className="border rounded-lg p-4">
            <summary className="font-medium cursor-pointer">Comment contacter mon formateur ?</summary>
            <p className="mt-2 text-sm text-gray-600">
              Vous pouvez contacter votre formateur via la section commentaires de chaque formation ou par email.
            </p>
          </details>
        </div>
      </div>

      {/* Ressources utiles */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ressources utiles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="#" className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
            <FileText className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="font-medium">Guide utilisateur</p>
              <p className="text-sm text-gray-600">Comment utiliser la plateforme</p>
            </div>
          </a>
          
          <a href="#" className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
            <Users className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="font-medium">Communauté</p>
              <p className="text-sm text-gray-600">Rejoignez nos forums</p>
            </div>
          </a>
          
          <button 
            onClick={() => setShowConsultationModal(true)}
            className="flex items-center p-3 border rounded-lg hover:bg-blue-50 transition-colors w-full text-left"
          >
            <Calendar className="h-5 w-5 text-blue-500 mr-3" />
            <div>
              <p className="font-medium text-blue-900">Planifier une session</p>
              <p className="text-sm text-blue-600">Réservez un créneau avec un expert</p>
            </div>
          </button>
          
          <a href="#" className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
            <Target className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="font-medium">Objectifs de formation</p>
              <p className="text-sm text-gray-600">Définir vos objectifs</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: 'formations', label: 'Mes formations', icon: BookOpen },
    { id: 'progress', label: 'Ma progression', icon: BarChart3 },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <PaymentStatus />
      <DashboardHeader 
        title="Espace Employé" 
        subtitle="Suivez vos formations et votre progression"
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
            <div className="flex items-center space-x-4">
              <NotificationTest />
              <NotificationButton />
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'formations' && renderFormations()}
          {activeTab === 'progress' && renderProgress()}
          {activeTab === 'support' && renderSupport()}
        </div>
      </div>

      {/* Modal de création de consultation */}
      <CreateConsultationModal
        isOpen={showConsultationModal}
        onClose={() => setShowConsultationModal(false)}
        onSuccess={handleConsultationSuccess}
        userName={dashboardData?.user.name}
        companyName="FormConsult" // À récupérer depuis les données utilisateur
      />
    </div>
  )
} 