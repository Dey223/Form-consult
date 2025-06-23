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

interface SuperAdminUser {
  id: string
  name: string
  email: string
  company: string
  role: string
  status: string
  lastLogin: string
  createdAt: string
  isCurrentUser: boolean
  specialDetails: {
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

interface SimpleUserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  user: SuperAdminUser | null
}

export function SimpleUserDetailsModal({ isOpen, onClose, user }: SimpleUserDetailsModalProps) {
  const [currentTab, setCurrentTab] = useState<'overview' | 'stats'>('overview')

  if (!user) return null

  const roleColors = {
    'EMPLOYE': 'bg-blue-100 text-blue-800',
    'FORMATEUR': 'bg-green-100 text-green-800',
    'CONSULTANT': 'bg-purple-100 text-purple-800',
    'ADMIN_ENTREPRISE': 'bg-orange-100 text-orange-800',
    'SUPER_ADMIN': 'bg-red-100 text-red-800'
  }

  const statusColors = {
    'active': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'inactive': 'bg-gray-100 text-gray-800',
    'suspended': 'bg-red-100 text-red-800'
  }

  const getRoleName = (role: string) => {
    const roleNames = {
      'EMPLOYE': 'Employé',
      'FORMATEUR': 'Formateur',
      'CONSULTANT': 'Consultant',
      'ADMIN_ENTREPRISE': 'Admin Entreprise',
      'SUPER_ADMIN': 'Super Admin'
    }
    return roleNames[role as keyof typeof roleNames] || role
  }

  const getStatusName = (status: string) => {
    const statusNames = {
      'active': 'Actif',
      'pending': 'En attente',
      'inactive': 'Inactif',
      'suspended': 'Suspendu'
    }
    return statusNames[status as keyof typeof statusNames] || status
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Profil utilisateur - {user.name || 'Utilisateur'}
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
              onClick={() => setCurrentTab('stats')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Statistiques
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
                          <p className="text-sm font-medium text-gray-900">{user.name || 'Non défini'}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Entreprise</p>
                          <p className="text-sm text-gray-600">{user.company}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Membre depuis</p>
                          <p className="text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Activity className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Dernière connexion</p>
                          <p className="text-sm text-gray-600">
                            {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Statut et rôle</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Rôle</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[user.role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}`}>
                          {getRoleName(user.role)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Statut</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[user.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                          {getStatusName(user.status)}
                        </span>
                      </div>

                      {user.isCurrentUser && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Compte actuel</span>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Vous
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'stats' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">
                  Statistiques {user.role === 'EMPLOYE' ? 'de formation' : 
                                user.role === 'FORMATEUR' ? 'de formateur' :
                                user.role === 'CONSULTANT' ? 'de consulting' : 'générales'}
                </h4>
                
                {user.role === 'EMPLOYE' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-700">{user.specialDetails.completedFormations || 0}</p>
                          <p className="text-sm text-gray-600">Formations complétées</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Trophy className="h-6 w-6 text-green-600" />
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-700">{user.specialDetails.avgProgress || 0}%</p>
                          <p className="text-sm text-gray-600">Progression moyenne</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Target className="h-6 w-6 text-purple-600" />
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-700">{user.specialDetails.totalFormations || 0}</p>
                          <p className="text-sm text-gray-600">Total formations</p>
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
                          <p className="text-2xl font-bold text-green-700">{user.specialDetails.totalFormations || 0}</p>
                          <p className="text-sm text-gray-600">Formations créées</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <User className="h-6 w-6 text-blue-600" />
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-700">{user.specialDetails.totalStudents || 0}</p>
                          <p className="text-sm text-gray-600">Étudiants formés</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Trophy className="h-6 w-6 text-purple-600" />
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-700">{user.specialDetails.publishedFormations || 0}</p>
                          <p className="text-sm text-gray-600">Formations publiées</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Clock className="h-6 w-6 text-orange-600" />
                        <div className="text-right">
                          <p className="text-sm text-orange-700">{user.specialDetails.latestFormation || 'Aucune'}</p>
                          <p className="text-sm text-gray-600">Dernière formation</p>
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
                          <p className="text-2xl font-bold text-purple-700">{user.specialDetails.totalAppointments || 0}</p>
                          <p className="text-sm text-gray-600">Consultations totales</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Clock className="h-6 w-6 text-blue-600" />
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-700">{user.specialDetails.totalHours || 0}h</p>
                          <p className="text-sm text-gray-600">Heures de consulting</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Trophy className="h-6 w-6 text-green-600" />
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-700">{user.specialDetails.rating || 0}/5</p>
                          <p className="text-sm text-gray-600">Note moyenne</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <User className="h-6 w-6 text-orange-600" />
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange-700">{user.specialDetails.completedAppointments || 0}</p>
                          <p className="text-sm text-gray-600">Consultations terminées</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
            Gérer l'utilisateur
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 