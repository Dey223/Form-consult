'use client'

import { Building2, Users, Calendar, CreditCard, BarChart3, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
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
}

interface CompanyDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  company: Company | null
}

export function CompanyDetailsModal({ isOpen, onClose, company }: CompanyDetailsModalProps) {
  if (!company) return null

  const planColors = {
    'ESSENTIEL': 'bg-green-100 text-green-800',
    'PRO': 'bg-blue-100 text-blue-800', 
    'ENTREPRISE': 'bg-purple-100 text-purple-800'
  }

  const statusColors = {
    'ACTIVE': 'bg-green-100 text-green-800',
    'PAST_DUE': 'bg-yellow-100 text-yellow-800',
    'CANCELED': 'bg-red-100 text-red-800',
    'INACTIVE': 'bg-gray-100 text-gray-800'
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Détails - {company.name}
          </DialogTitle>
          <DialogDescription>
            Informations complètes de l'entreprise et statistiques d'utilisation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Building2 className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Entreprise</p>
                  <p className="text-sm text-gray-600">{company.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Plan actuel</p>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${planColors[company.plan as keyof typeof planColors] || 'bg-gray-100 text-gray-800'}`}>
                      {company.plan}
                    </span>
                    <span className="text-sm text-gray-600">
                      {company.plan === 'ESSENTIEL' ? '49€/mois' : 
                       company.plan === 'PRO' ? '99€/mois' : 
                       company.plan === 'ENTREPRISE' ? '199€/mois' : 'Non défini'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Utilisateurs</p>
                  <p className="text-sm text-gray-600">
                    {company.users}/{company.maxUsers === 999 ? '∞' : company.maxUsers}
                    {company.users >= company.maxUsers && company.maxUsers < 999 && (
                      <span className="text-orange-600 font-medium ml-2">⚠️ Limite atteinte</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Créé le</p>
                  <p className="text-sm text-gray-600">{new Date(company.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </div>

            {/* Contact & Statut */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Contact</p>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">📧 {company.email}</p>
                  {company.phone && <p className="text-sm text-gray-600">📞 {company.phone}</p>}
                  {company.website && (
                    <a href={company.website} target="_blank" rel="noopener noreferrer" 
                       className="text-sm text-blue-600 hover:text-blue-800">
                      🌐 {company.website}
                    </a>
                  )}
                  {company.address && <p className="text-sm text-gray-600">📍 {company.address}</p>}
                </div>
              </div>

              {company.subscriptionDetails && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Abonnement</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Statut</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[company.subscriptionDetails.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                        {company.subscriptionDetails.status}
                      </span>
                    </div>
                    {company.subscriptionDetails.currentPeriodEnd && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Expire le</span>
                        <span className="text-sm text-gray-900">
                          {new Date(company.subscriptionDetails.currentPeriodEnd).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}
                    {company.subscriptionDetails.cancelAtPeriodEnd && (
                      <div className="flex items-center space-x-1 text-orange-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">Annulation programmée</span>
                      </div>
                    )}
                    {company.subscriptionDetails.stripeCustomerId && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">ID Stripe</span>
                        <span className="text-xs text-gray-500 font-mono">
                          {company.subscriptionDetails.stripeCustomerId.slice(0, 8)}...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statistiques formations */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Statistiques de formation
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{company.formationStats.totalFormations}</p>
                <p className="text-sm text-gray-600">Formations suivies</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-green-700">{company.formationStats.completedFormations}</p>
                <p className="text-sm text-gray-600">Complétées</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">{company.formationStats.averageProgress}%</p>
                <p className="text-sm text-gray-600">Progression moyenne</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-purple-700">{company.formationStats.uniqueFormations}</p>
                <p className="text-sm text-gray-600">Formations uniques</p>
              </div>
            </div>
          </div>

          {/* Statistiques consulting */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Statistiques de consulting
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-yellow-700">{company.consultingStats.totalAppointments}</p>
                <p className="text-sm text-gray-600">Rendez-vous total</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-orange-700">{company.consultingStats.estimatedHours}h</p>
                <p className="text-sm text-gray-600">Heures estimées</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-indigo-700">
                  {company.consultingStats.monthlyLimit === 999 ? '∞' : company.consultingStats.monthlyLimit + 'h'}
                </p>
                <p className="text-sm text-gray-600">Limite mensuelle</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-6">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button>
            <CreditCard className="h-4 w-4 mr-2" />
            Gérer l'abonnement
          </Button>
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Gérer les utilisateurs
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 