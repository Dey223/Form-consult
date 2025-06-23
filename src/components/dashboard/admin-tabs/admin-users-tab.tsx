'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

import { PlanStatistics } from '../plan-statistics'
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Building2,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Crown,
  TrendingUp,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  XCircle,
  Shield,
  Star,
  Award,
  Activity,
  Clock
} from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
  id: string
  name: string
  email: string
  role: 'EMPLOYE' | 'ADMIN_ENTREPRISE' 
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  companyId?: string
  company?: {
    name: string
  }
  createdAt: string
  lastLoginAt?: string
  profile?: {
    phone?: string
    avatar?: string
  }
  stats?: {
    formationsCompleted: number
    consultationsBooked: number
    totalHours: number
    lastActivity: string
  }
}

interface UserStatistics {
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  averageProgress: number
  completedFormations: number
  upcomingConsultations: number
  topPerformers: {
    id: string
    name: string
    score: number
    progress: number
    avatar?: string
  }[]
  activityTrends: {
    logins: { month: string; count: number }[]
    completions: { month: string; count: number }[]
  }
}

interface Invitation {
  id: string
  email: string
  role: 'EMPLOYE' | 'ADMIN_ENTREPRISE' | 'FORMATEUR' | 'CONSULTANT'
  createdAt: string
  expiresAt: string
  acceptedAt?: string | null
  sender: {
    name: string
  }
}

interface AdminUsersTabProps {
  onUpdate: () => void
}

export function AdminUsersTab({ onUpdate }: AdminUsersTabProps) {
  const [users, setUsers] = useState<User[]>([])
  const [userStats, setUserStats] = useState<UserStatistics | null>(null)
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('EMPLOYE')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [activeView, setActiveView] = useState<'statistics' | 'users' | 'plan'>('statistics')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Récupérer les utilisateurs avec la logique corrigée
      await fetchUsers()

      // Récupérer les invitations
      const invitationsResponse = await fetch('/api/users/invite')
      if (invitationsResponse.ok) {
        const invitationsData = await invitationsResponse.json()
        setInvitations(invitationsData)
      }

      // Récupérer les statistiques utilisateurs
      await fetchUserStatistics()
    } catch (error) {
      console.error('Erreur chargement données utilisateurs:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/admin-entreprise/users')
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        toast.error('Erreur lors du chargement des utilisateurs')
      }
    } catch (error) {
      toast.error('Impossible de charger les utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStatistics = async () => {
    try {
      const response = await fetch('/api/dashboard/admin-entreprise/user-statistics')
      
      if (response.ok) {
        const data = await response.json()
        setUserStats(data.statistics)
      } else {
        toast.error('Erreur lors du chargement des statistiques')
      }
    } catch (error) {
      toast.error('Impossible de charger les statistiques utilisateurs')
    }
  }

  const handleUserAction = async (userId: string, action: 'deactivate' | 'delete') => {
    try {
      const response = await fetch(`/api/dashboard/admin-entreprise/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        toast.success(`Utilisateur ${action === 'deactivate' ? 'désactivé' : 'supprimé'} avec succès`)
        fetchUsers()
        onUpdate()
      } else {
        const data = await response.json()
        toast.error(`Erreur: ${data.error}`)
      }
    } catch (error) {
      toast.error('Erreur lors de l\'action sur l\'utilisateur')
    }
  }

  const handleRefresh = async () => {
    await fetchData()
    toast.success('Données actualisées')
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviteLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Invitation envoyée à ${inviteEmail}. Lien: ${data.invitation.invitationLink}` 
        })
        setInviteEmail('')
        setShowInviteForm(false)
        fetchData()
        onUpdate()
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de l\'envoi de l\'invitation' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion' })
    } finally {
      setInviteLoading(false)
    }
  }

  const handleResendInvitation = async (email: string) => {
    try {
      const response = await fetch('/api/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          role: 'EMPLOYE' // Rôle par défaut pour renvoyer
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Invitation renvoyée à ${email}`)
        fetchData()
      } else {
        toast.error(data.error || 'Erreur lors du renvoi de l\'invitation')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    }
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const getStatusBadgeSimple = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Actif
        </span>
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          En attente
        </span>
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <XCircle className="w-3 h-3 mr-1" />
          Inactif
        </span>
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { color: string; text: string; icon: any } } = {
      'ACTIVE': { color: 'bg-green-100 text-green-800', text: 'Actif', icon: CheckCircle },
      'INACTIVE': { color: 'bg-red-100 text-red-800', text: 'Inactif', icon: X },
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', text: 'En attente', icon: AlertCircle }
    }

    const config = statusConfig[status] || statusConfig['PENDING']
    const Icon = config.icon

    return (
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </div>
    )
  }

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { color: string; text: string; icon: any }> = {
      'ADMIN_ENTREPRISE': { color: 'bg-purple-100 text-purple-800', text: 'Admin', icon: Crown },
      'FORMATEUR': { color: 'bg-blue-100 text-blue-800', text: 'Formateur', icon: Award },
      'CONSULTANT': { color: 'bg-indigo-100 text-indigo-800', text: 'Consultant', icon: Shield },
      'EMPLOYE': { color: 'bg-gray-100 text-gray-800', text: 'Employé', icon: Users }
    }

    const config = roleConfig[role] || roleConfig['EMPLOYE']
    const Icon = config.icon

    return (
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </div>
    )
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderUserStatistics = () => (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="bg-white rounded-lg p-4 md:p-6 border shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Activity className="h-6 w-6 text-green-600" />
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Statistiques Utilisateurs</h2>
              <p className="text-sm text-gray-600">Analytics et performances de l'équipe</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Actualiser</span>
            </Button>
            <Button
              onClick={() => setShowInviteForm(true)}
              size="sm"
              className="flex items-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Inviter utilisateur</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Métriques principales - Grid Responsive */}
      {userStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-blue-500" />
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{userStats.totalUsers}</div>
            <div className="text-xs text-gray-600">Total utilisateurs</div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <UserCheck className="h-5 w-5 text-green-500" />
              <div className="text-xs font-medium text-green-600">
                {((userStats.activeUsers / userStats.totalUsers) * 100).toFixed(0)}%
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{userStats.activeUsers}</div>
            <div className="text-xs text-gray-600">Utilisateurs actifs</div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <UserPlus className="h-5 w-5 text-purple-500" />
              <Star className="h-4 w-4 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{userStats.newUsersThisMonth}</div>
            <div className="text-xs text-gray-600">Nouveaux ce mois</div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Award className="h-5 w-5 text-orange-500" />
              <div className="text-xs font-medium text-orange-600">
                {userStats.averageProgress.toFixed(0)}%
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{userStats.averageProgress.toFixed(1)}%</div>
            <div className="text-xs text-gray-600">Progression moyenne</div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{userStats.completedFormations}</div>
            <div className="text-xs text-gray-600">Formations terminées</div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <AlertCircle className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{userStats.upcomingConsultations}</div>
            <div className="text-xs text-gray-600">Consultations prévues</div>
          </div>
        </div>
      )}

      {/* Top performers et tendances */}
      {userStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div className="bg-white rounded-lg p-4 md:p-6 border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Top Performers</h3>
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            
            <div className="space-y-3">
              {userStats.topPerformers.map((performer, index) => (
                <div key={performer.id} className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 text-sm truncate">
                        {performer.name}
                      </span>
                      <span className="text-sm font-medium text-gray-600">
                        {performer.score}pts
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${performer.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{performer.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tendances d'activité */}
          <div className="bg-white rounded-lg p-4 md:p-6 border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Tendances d'activité</h3>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Connexions (3 derniers mois)</span>
                  <span className="text-xs text-green-600 font-medium">+12%</span>
                </div>
                <div className="flex items-end space-x-1 h-20">
                  {userStats.activityTrends.logins.map((data, index) => (
                    <div key={index} className="flex-1 bg-blue-200 rounded-t" style={{
                      height: `${(data.count / Math.max(...userStats.activityTrends.logins.map(d => d.count))) * 100}%`,
                      minHeight: '4px'
                    }}>
                      <div className="w-full bg-blue-500 rounded-t h-full"></div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  {userStats.activityTrends.logins.map((data, index) => (
                    <span key={index}>{data.month}</span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Formations complétées</span>
                  <span className="text-xs text-green-600 font-medium">+8%</span>
                </div>
                <div className="flex items-end space-x-1 h-16">
                  {userStats.activityTrends.completions.map((data, index) => (
                    <div key={index} className="flex-1 bg-green-200 rounded-t" style={{
                      height: `${(data.count / Math.max(...userStats.activityTrends.completions.map(d => d.count))) * 100}%`,
                      minHeight: '4px'
                    }}>
                      <div className="w-full bg-green-500 rounded-t h-full"></div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  {userStats.activityTrends.completions.map((data, index) => (
                    <span key={index}>{data.month}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="bg-white rounded-lg p-4 md:p-6 border shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Exporter données</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setActiveView('users')}>
            <Users className="h-4 w-4 mr-2" />
            <span>Voir utilisateurs</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setActiveView('plan')}>
            <Crown className="h-4 w-4 mr-2" />
            <span>Statistiques plan</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            <span>Actualiser</span>
          </Button>
        </div>
      </div>
    </div>
  )

  const renderUsersList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 md:p-6 border shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Gestion des Utilisateurs</h2>
              <p className="text-sm text-gray-600">{filteredUsers.length} utilisateur(s) sur {users.length}</p>
            </div>
          </div>
          <Button
            onClick={() => setShowInviteForm(true)}
            size="sm"
            className="flex items-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Inviter un employé</span>
          </Button>
        </div>
      </div>

      {/* Message de statut */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Formulaire d'invitation */}
      {showInviteForm && (
        <div className="border rounded-lg p-4 mb-4 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Inviter un nouvel employé</h3>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email de l'employé
                </label>
                <Input
                  type="email"
                  id="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="exemple@entreprise.com"
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Rôle
                </label>
                <select
                  id="role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="EMPLOYE">Employé</option>
                 
                  <option value="ADMIN_ENTREPRISE">Admin Entreprise</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                type="submit"
                disabled={inviteLoading}
                className="flex items-center space-x-2"
              >
                {inviteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    <span>Envoyer l'invitation</span>
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowInviteForm(false)
                  setInviteEmail('')
                  setMessage(null)
                }}
              >
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filtres - Mobile Responsive */}
      <div className="bg-white rounded-lg p-4 border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les rôles</option>
            <option value="ADMIN_ENTREPRISE">Admin Entreprise</option>
            <option value="FORMATEUR">Formateur</option>
            <option value="CONSULTANT">Consultant</option>
            <option value="EMPLOYE">Employé</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="ACTIVE">Actif</option>
            <option value="INACTIVE">Inactif</option>
            <option value="PENDING">En attente</option>
          </select>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 md:p-12 text-center">
          <Users className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-base md:text-lg mb-2">
            {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
              ? 'Aucun utilisateur trouvé avec ces filtres' 
              : 'Aucun utilisateur inscrit pour le moment'
            }
          </p>
          <p className="text-gray-400 text-sm">
            Les utilisateurs invités apparaîtront ici une fois qu'ils auront accepté leur invitation.
          </p>
          <Button onClick={() => setShowInviteForm(true)} className="mt-4">
            <UserPlus className="h-4 w-4 mr-2" />
            Inviter le premier utilisateur
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-start space-x-4 flex-1 min-w-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <h4 className="font-medium text-gray-900 truncate">{user.name}</h4>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(user.status)}
                        {getRoleBadge(user.role)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      
                      {user.profile?.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span>{user.profile.phone}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span>Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      
                      {user.lastLoginAt && (
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span>Dernière connexion: {new Date(user.lastLoginAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      )}
                    </div>

                    {user.stats && (
                      <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-100">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{user.stats.formationsCompleted}</div>
                          <div className="text-xs text-gray-500">Formations</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{user.stats.consultationsBooked}</div>
                          <div className="text-xs text-gray-500">Consultations</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{user.stats.totalHours}h</div>
                          <div className="text-xs text-gray-500">Temps total</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 lg:flex-col xl:flex-row">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewUser(user)}
                    className="flex items-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Détails</span>
                  </Button>
                  
                  {user.status === 'ACTIVE' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUserAction(user.id, 'deactivate')}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      <span>Désactiver</span>
                    </Button>
                  ) : (
                    <div className="text-center">
                      <p className="text-xs text-yellow-600 font-medium">En attente d'acceptation</p>
                      <p className="text-xs text-gray-500">Invitation non acceptée</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResendInvitation(user.email)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 mt-1"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        <span>Renvoyer</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invitations en cours */}
      {invitations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Invitations en cours</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {invitations.filter(inv => !inv.acceptedAt).map((invitation) => (
              <div key={invitation.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{invitation.email}</p>
                      <p className="text-sm text-gray-600">
                        {invitation.role === 'ADMIN_ENTREPRISE' ? 'Administrateur' : 'Employé'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Invité le {new Date(invitation.createdAt).toLocaleDateString('fr-FR')} par {invitation.sender.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Clock className="w-3 h-3 mr-1" />
                      En attente
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Expire le {new Date(invitation.expiresAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test de configuration email */}
      {/* <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Test de configuration email</h3>
        <p className="text-gray-600 text-sm">Configuration email en cours de développement...</p>
      </div> */}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Navigation tabs - Mobile Responsive */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex space-x-4 md:space-x-8 px-4 md:px-6 py-4 overflow-x-auto">
          <button
            onClick={() => setActiveView('statistics')}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeView === 'statistics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Statistiques</span>
          </button>
          
          <button
            onClick={() => setActiveView('users')}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeView === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Utilisateurs</span>
          </button>
          
          <button
            onClick={() => setActiveView('plan')}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeView === 'plan'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Crown className="h-4 w-4" />
            <span>Plan & Usage</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {activeView === 'statistics' && renderUserStatistics()}
      {activeView === 'users' && renderUsersList()}
      {activeView === 'plan' && <PlanStatistics />}

      {/* Modals */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Détails de l'utilisateur</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUserModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <p className="text-gray-900">{selectedUser.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rôle</label>
                <p className="text-gray-900">{selectedUser.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <p className="text-gray-900">{selectedUser.status}</p>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  )
} 