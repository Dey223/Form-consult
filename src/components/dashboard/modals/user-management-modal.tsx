'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Search, Filter, Mail, Shield, Eye, MoreHorizontal, UserCheck, UserX, Loader2 } from 'lucide-react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Company {
  id: string
  name: string
  users: number
  maxUsers: number
}

interface UserManagementModalProps {
  isOpen: boolean
  onClose: () => void
  company: Company | null
}

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  lastActive: string | null
  joinedAt: string
  createdAt: string
  updatedAt: string
  companyId: string
  formationProgress?: number
  completedFormations?: number
}

export function UserManagementModal({ isOpen, onClose, company }: UserManagementModalProps) {
  const [currentView, setCurrentView] = useState<'list' | 'invite' | 'roles'>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserRole, setNewUserRole] = useState('EMPLOYE')
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState('')

  if (!company) return null

  // Charger les utilisateurs de l'entreprise
  useEffect(() => {
    if (isOpen && company) {
      fetchUsers()
    }
  }, [isOpen, company])

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      setError('')
      
      const response = await fetch(`/api/companies/${company.id}/users`)
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des utilisateurs')
      }
      
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Erreur fetch users:', error)
      setError('Impossible de charger les utilisateurs')
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleInviteUser = async () => {
    if (!newUserEmail.trim()) return
    
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`/api/companies/${company.id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newUserEmail,
          role: newUserRole
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de l\'envoi de l\'invitation')
      }

      // Réinitialiser le formulaire
      setNewUserEmail('')
      setNewUserRole('EMPLOYE')
      setCurrentView('list')
      
      // Optionnel: afficher un message de succès
      alert(`Invitation envoyée avec succès à ${newUserEmail}`)
      
    } catch (error) {
      console.error('Erreur invite user:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeUserStatus = async (userId: string, newStatus: string) => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la modification du statut')
      }

      // Recharger la liste des utilisateurs
      await fetchUsers()
      
    } catch (error) {
      console.error('Erreur change status:', error)
      setError('Impossible de modifier le statut de l\'utilisateur')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeUserRole = async (userId: string, newRole: string) => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la modification du rôle')
      }

      // Recharger la liste des utilisateurs
      await fetchUsers()
      
    } catch (error) {
      console.error('Erreur change role:', error)
      setError('Impossible de modifier le rôle de l\'utilisateur')
    } finally {
      setLoading(false)
    }
  }

  const formatLastActive = (lastActive: string | null) => {
    if (!lastActive) return 'Jamais'
    return new Date(lastActive).toLocaleDateString('fr-FR')
  }

  const roleColors = {
    'EMPLOYE': 'bg-blue-100 text-blue-800',
    'FORMATEUR': 'bg-green-100 text-green-800',
    'CONSULTANT': 'bg-purple-100 text-purple-800',
    'ADMIN_ENTREPRISE': 'bg-red-100 text-red-800',
    'SUPER_ADMIN': 'bg-gray-100 text-gray-800'
  }

  const statusColors = {
    'ACTIVE': 'bg-green-100 text-green-800',
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'INACTIVE': 'bg-gray-100 text-gray-800',
    'SUSPENDED': 'bg-red-100 text-red-800'
  }

  const roleLabels = {
    'EMPLOYE': 'Employé',
    'FORMATEUR': 'Formateur',
    'CONSULTANT': 'Consultant',
    'ADMIN_ENTREPRISE': 'Admin Entreprise',
    'SUPER_ADMIN': 'Super Admin'
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Gestion des utilisateurs - {company.name}
          </DialogTitle>
          <DialogDescription>
            Gérez les utilisateurs, invitations et permissions
          </DialogDescription>
        </DialogHeader>

        {/* Affichage des erreurs */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="border-b">
          <nav className="flex space-x-8">
            <button
              onClick={() => setCurrentView('list')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentView === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="h-4 w-4 inline mr-1" />
              Utilisateurs ({users.length})
            </button>
            <button
              onClick={() => setCurrentView('invite')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentView === 'invite'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Plus className="h-4 w-4 inline mr-1" />
              Inviter
            </button>
            <button
              onClick={() => setCurrentView('roles')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentView === 'roles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Shield className="h-4 w-4 inline mr-1" />
              Rôles & Permissions
            </button>
          </nav>
        </div>

        <div className="space-y-6">
          {currentView === 'list' && (
            <div className="space-y-4">
              {/* Quota utilisateurs */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Quota d'utilisateurs</h4>
                    <p className="text-sm text-gray-600">Utilisateurs actifs dans l'entreprise</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {users.length}/{company.maxUsers === 999 ? '∞' : company.maxUsers}
                    </div>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          (users.length / company.maxUsers) > 0.8 ? 'bg-red-500' :
                          (users.length / company.maxUsers) > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((users.length / company.maxUsers) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Filtres */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher par nom ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tous les rôles</option>
                  <option value="EMPLOYE">Employé</option>
                  <option value="FORMATEUR">Formateur</option>
                  <option value="CONSULTANT">Consultant</option>
                  <option value="ADMIN_ENTREPRISE">Admin Entreprise</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="ACTIVE">Actif</option>
                  <option value="PENDING">En attente</option>
                  <option value="INACTIVE">Inactif</option>
                  <option value="SUSPENDED">Suspendu</option>
                </select>

                <Button onClick={() => setCurrentView('invite')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Inviter un utilisateur
                </Button>
              </div>

              {/* Liste des utilisateurs */}
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-600">Chargement des utilisateurs...</span>
                </div>
              ) : (
                <div className="bg-white border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Utilisateur
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rôle
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date d'inscription
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dernière activité
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.name || 'Nom non défini'}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${roleColors[user.role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}`}>
                                {roleLabels[user.role as keyof typeof roleLabels] || user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatLastActive(user.lastActive)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-900">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button className="text-gray-600 hover:text-gray-900">
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {filteredUsers.length === 0 && !loadingUsers && (
                    <div className="text-center py-8 text-gray-500">
                      {users.length === 0 ? 'Aucun utilisateur dans cette entreprise' : 'Aucun utilisateur trouvé avec ces filtres'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentView === 'invite' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Inviter un nouvel utilisateur</h3>
                <p className="text-gray-600">Envoyez une invitation par email à un nouvel utilisateur.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse email *
                    </label>
                    <input
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="nom@entreprise.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rôle
                    </label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="EMPLOYE">Employé - Accès aux formations</option>
                      <option value="FORMATEUR">Formateur - Peut créer et gérer des formations</option>
                      <option value="CONSULTANT">Consultant - Accès au consulting</option>
                      <option value="ADMIN_ENTREPRISE">Admin Entreprise - Accès administrateur</option>
                    </select>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Aperçu de l'invitation
                    </h4>
                    <p className="text-blue-800 text-sm">
                      Un email sera envoyé à <strong>{newUserEmail || 'l\'utilisateur'}</strong> avec un lien d'invitation 
                      pour rejoindre <strong>{company.name}</strong> avec le rôle <strong>{roleLabels[newUserRole as keyof typeof roleLabels]}</strong>.
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={handleInviteUser}
                      disabled={!newUserEmail.trim() || loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Envoyer l'invitation
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentView('list')}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'roles' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Rôles et permissions</h3>
                <p className="text-gray-600">Comprendre les différents niveaux d'accès dans l'entreprise.</p>
              </div>

              <div className="grid gap-4">
                {Object.entries(roleLabels).map(([role, label]) => (
                  <div key={role} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[role as keyof typeof roleColors]}`}>
                        {label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {role === 'EMPLOYE' && 'Accès aux formations assignées, peut consulter son profil et sa progression.'}
                      {role === 'FORMATEUR' && 'Peut créer et gérer des formations, voir les progressions des apprenants.'}
                      {role === 'CONSULTANT' && 'Accès aux consultations, peut gérer les rendez-vous et sessions.'}
                      {role === 'ADMIN_ENTREPRISE' && 'Accès administrateur complet pour gérer l\'entreprise et ses utilisateurs.'}
                      {role === 'SUPER_ADMIN' && 'Accès système complet, gestion de toutes les entreprises.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 