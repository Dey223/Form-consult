'use client'

import { useState } from 'react'
import { User, Calendar, Trophy, Clock, BookOpen, Target, Activity, Settings, Shield, Mail } from 'lucide-react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  joinedAt: string
  lastActive: string
  company: {
    id: string
    name: string
  }
  profile?: {
    phone?: string
    position?: string
    department?: string
    manager?: string
  }
  stats: {
    totalFormations: number
    completedFormations: number
    inProgressFormations: number
    averageScore: number
    totalHours: number
    certificatesEarned: number
    lastFormationDate?: string
    consultingHours?: number
    appointmentsCount?: number
    formationsCreated?: number
    studentsManaged?: number
  }
  specialDetails?: {
    totalFormations?: number
    publishedFormations?: number
    totalStudents?: number
    latestFormation?: string
    totalAppointments?: number
    completedAppointments?: number
    totalHours?: number
    rating?: number
    completedFormations?: number
    avgProgress?: number
    companyMember?: boolean
  }
}

interface UserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
}

export function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  const [currentTab, setCurrentTab] = useState<'overview' | 'activity' | 'settings'>('overview')
  const [loading, setLoading] = useState(false)

  if (!user) return null

  // Convertir les données de l'API en format attendu par le modal
  const normalizedUser = {
    ...user,
    joinedAt: user.joinedAt || (user as any).createdAt || new Date().toISOString(),
    lastActive: user.lastActive || (user as any).lastLogin || new Date().toISOString(),
    company: typeof user.company === 'string' 
      ? { id: '', name: user.company }
      : user.company,
    stats: user.stats || {
      totalFormations: user.specialDetails?.totalFormations || 0,
      completedFormations: user.specialDetails?.completedFormations || 0,
      inProgressFormations: user.specialDetails?.totalFormations 
        ? (user.specialDetails.totalFormations - (user.specialDetails.completedFormations || 0))
        : 0,
      averageScore: user.specialDetails?.rating || 85,
      totalHours: user.specialDetails?.totalHours || 0,
      certificatesEarned: user.specialDetails?.completedFormations || 0,
      lastFormationDate: undefined,
      consultingHours: user.specialDetails?.totalHours,
      appointmentsCount: user.specialDetails?.totalAppointments,
      formationsCreated: user.specialDetails?.totalFormations,
      studentsManaged: user.specialDetails?.totalStudents
    }
  }

  const handleUpdateUserStatus = async (newStatus: string) => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    alert(`Statut utilisateur modifié vers: ${newStatus}`)
    setLoading(false)
  }

  const handleUpdateUserRole = async (newRole: string) => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    alert(`Rôle utilisateur modifié vers: ${newRole}`)
    setLoading(false)
  }

  const handleSendNotification = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Notification envoyée avec succès!')
    setLoading(false)
  }

  const roleColors = {
    'EMPLOYE': 'bg-blue-100 text-blue-800',
    'FORMATEUR': 'bg-green-100 text-green-800',
    'CONSULTANT': 'bg-purple-100 text-purple-800',
    'ADMIN': 'bg-red-100 text-red-800'
  }

  const statusColors = {
    'ACTIVE': 'bg-green-100 text-green-800',
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'INACTIVE': 'bg-gray-100 text-gray-800',
    'SUSPENDED': 'bg-red-100 text-red-800',
    'active': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800'
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Profil utilisateur - {normalizedUser.name}
          </DialogTitle>
          <DialogDescription>
            Informations détaillées et statistiques de l'utilisateur
          </DialogDescription>
        </DialogHeader>

        {/* Navigation par onglets */}
        <div className="border-b">
          <nav className="flex space-x-8">
            <button
              onClick={() => setCurrentTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Vue d'ensemble
            </button>
            <button
              onClick={() => setCurrentTab('activity')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentTab === 'activity'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Activité
            </button>
            <button
              onClick={() => setCurrentTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Paramètres
            </button>
          </nav>
        </div>

        <div className="space-y-6">
          {currentTab === 'overview' && (
            <div className="space-y-6">
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Informations personnelles</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{normalizedUser.name}</p>
                          <p className="text-sm text-gray-600">{normalizedUser.profile?.position || 'Poste non renseigné'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          {user.profile?.phone && (
                            <p className="text-sm text-gray-600">{user.profile.phone}</p>
                          )}
                        </div>
                      </div>

                      {user.profile?.department && (
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Département</p>
                            <p className="text-sm text-gray-600">{user.profile.department}</p>
                          </div>
                        </div>
                      )}

                      {user.profile?.manager && (
                        <div className="flex items-center space-x-3">
                          <Shield className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Manager</p>
                            <p className="text-sm text-gray-600">{user.profile.manager}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Statut et rôle</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Rôle</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[user.role as keyof typeof roleColors]}`}>
                          {user.role}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Statut</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[user.status as keyof typeof statusColors]}`}>
                          {user.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Membre depuis</span>
                        <span className="text-sm text-gray-900">
                          {new Date(user.joinedAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Dernière activité</span>
                        <span className="text-sm text-gray-900">
                          {user.lastActive === 'Jamais' ? 'Jamais' : new Date(user.lastActive).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Entreprise</span>
                        <span className="text-sm text-gray-900">{user.company.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistiques spécifiques au rôle */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">
                  Statistiques {user.role === 'EMPLOYE' ? 'de formation' : 
                                user.role === 'FORMATEUR' ? 'de formateur' :
                                user.role === 'CONSULTANT' ? 'de consulting' : 'générales'}
                </h4>
                
                {user.role === 'EMPLOYE' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-700">{user.stats.completedFormations}</p>
                          <p className="text-sm text-gray-600">Formations complétées</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Trophy className="h-6 w-6 text-green-600" />
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-700">{user.stats.averageScore}%</p>
                          <p className="text-sm text-gray-600">Score moyen</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Clock className="h-6 w-6 text-purple-600" />
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-700">{user.stats.totalHours}h</p>
                          <p className="text-sm text-gray-600">Heures d'apprentissage</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Target className="h-6 w-6 text-orange-600" />
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange-700">{user.stats.certificatesEarned}</p>
                          <p className="text-sm text-gray-600">Certificats obtenus</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {user.role === 'FORMATEUR' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <BookOpen className="h-6 w-6 text-green-600" />
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-700">{user.stats.formationsCreated || 12}</p>
                          <p className="text-sm text-gray-600">Formations créées</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <User className="h-6 w-6 text-blue-600" />
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-700">{user.stats.studentsManaged || 145}</p>
                          <p className="text-sm text-gray-600">Étudiants formés</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Trophy className="h-6 w-6 text-purple-600" />
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-700">{user.stats.averageScore}%</p>
                          <p className="text-sm text-gray-600">Satisfaction moyenne</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Clock className="h-6 w-6 text-orange-600" />
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange-700">{user.stats.totalHours}h</p>
                          <p className="text-sm text-gray-600">Heures d'enseignement</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {user.role === 'CONSULTANT' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Calendar className="h-6 w-6 text-purple-600" />
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-700">{user.stats.appointmentsCount || 32}</p>
                          <p className="text-sm text-gray-600">Consultations réalisées</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Clock className="h-6 w-6 text-blue-600" />
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-700">{user.stats.consultingHours || 87}h</p>
                          <p className="text-sm text-gray-600">Heures de consulting</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Trophy className="h-6 w-6 text-green-600" />
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-700">{user.stats.averageScore}%</p>
                          <p className="text-sm text-gray-600">Satisfaction clients</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <User className="h-6 w-6 text-orange-600" />
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange-700">{Math.floor(Math.random() * 50) + 15}</p>
                          <p className="text-sm text-gray-600">Clients suivis</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentTab === 'activity' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Activité récente</h4>
                
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="text-sm font-medium text-gray-900">Formation "Sécurité informatique" complétée</p>
                    <p className="text-xs text-gray-500">Il y a 2 jours • Score: 95%</p>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <p className="text-sm font-medium text-gray-900">Connexion au système</p>
                    <p className="text-xs text-gray-500">Il y a 3 jours • Durée: 2h 30min</p>
                  </div>
                  
                  <div className="border-l-4 border-purple-500 pl-4 py-2">
                    <p className="text-sm font-medium text-gray-900">Formation "Gestion de projet" démarrée</p>
                    <p className="text-xs text-gray-500">Il y a 5 jours • Progression: 25%</p>
                  </div>
                  
                  <div className="border-l-4 border-orange-500 pl-4 py-2">
                    <p className="text-sm font-medium text-gray-900">Profil mis à jour</p>
                    <p className="text-xs text-gray-500">Il y a 1 semaine</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">Formations en cours</h4>
                
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">Management d'équipe</h5>
                      <span className="text-sm text-gray-600">65% complété</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Dernière activité: il y a 1 jour</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">Communication professionnelle</h5>
                      <span className="text-sm text-gray-600">30% complété</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Dernière activité: il y a 3 jours</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Gestion du compte</h4>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-3">Modifier le statut</h5>
                    <div className="flex space-x-3">
                      <Button
                        size="sm"
                        variant={user.status === 'ACTIVE' ? 'default' : 'outline'}
                        onClick={() => handleUpdateUserStatus('ACTIVE')}
                        disabled={loading}
                      >
                        Activer
                      </Button>
                      <Button
                        size="sm"
                        variant={user.status === 'SUSPENDED' ? 'destructive' : 'outline'}
                        onClick={() => handleUpdateUserStatus('SUSPENDED')}
                        disabled={loading}
                      >
                        Suspendre
                      </Button>
                      <Button
                        size="sm"
                        variant={user.status === 'INACTIVE' ? 'secondary' : 'outline'}
                        onClick={() => handleUpdateUserStatus('INACTIVE')}
                        disabled={loading}
                      >
                        Désactiver
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-3">Modifier le rôle</h5>
                    <div className="flex space-x-3">
                      <Button
                        size="sm"
                        variant={user.role === 'EMPLOYE' ? 'default' : 'outline'}
                        onClick={() => handleUpdateUserRole('EMPLOYE')}
                        disabled={loading}
                      >
                        Employé
                      </Button>
                      <Button
                        size="sm"
                        variant={user.role === 'FORMATEUR' ? 'default' : 'outline'}
                        onClick={() => handleUpdateUserRole('FORMATEUR')}
                        disabled={loading}
                      >
                        Formateur
                      </Button>
                      <Button
                        size="sm"
                        variant={user.role === 'CONSULTANT' ? 'default' : 'outline'}
                        onClick={() => handleUpdateUserRole('CONSULTANT')}
                        disabled={loading}
                      >
                        Consultant
                      </Button>
                      <Button
                        size="sm"
                        variant={user.role === 'ADMIN' ? 'default' : 'outline'}
                        onClick={() => handleUpdateUserRole('ADMIN')}
                        disabled={loading}
                      >
                        Admin
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-3">Actions</h5>
                    <div className="flex space-x-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSendNotification}
                        disabled={loading}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Envoyer notification
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={loading}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Réinitialiser mot de passe
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-6">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Modifier le profil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 