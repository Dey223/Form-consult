'use client'

import { useState } from 'react'
import { CreditCard, Check, X, Calendar, AlertTriangle, TrendingUp, Star } from 'lucide-react'
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
  plan: string
  planStatus: string
  subscriptionDetails?: {
    planType: string
    status: string
    currentPeriodEnd: Date | null
    cancelAtPeriodEnd: boolean
  } | null
}

interface SubscriptionManagementModalProps {
  isOpen: boolean
  onClose: () => void
  company: Company | null
}

interface PlanDetails {
  name: string
  price: number
  period: string
  description: string
  features: string[]
  maxUsers: number
  consultingHours: number
  popular?: boolean
}

const plans: PlanDetails[] = [
  {
    name: 'ESSENTIEL',
    price: 4999,
    period: 'mois',
    description: 'Parfait pour les petites équipes',
    maxUsers: 10,
    consultingHours: 5,
    features: [
      'Jusqu\'à 10 utilisateurs',
      'Accès au catalogue de formations',
      'Suivi de progression basique',
      'Support email standard',
      'Tableau de bord simple',
      'Rapports mensuels'
    ]
  },
  {
    name: 'PRO',
    price: 9999,
    period: 'mois',
    description: 'Idéal pour les entreprises en croissance',
    maxUsers: 50,
    consultingHours: 50,
    popular: true,
    features: [
      'Jusqu\'à 50 utilisateurs',
      'Tout du plan Essentiel',
      'Sessions de consulting (50h/mois)',
      'Analytics avancées et exports',
      'Support prioritaire (24h)',
      'Formations personnalisées',
      'API et intégrations',
      'Rapports en temps réel'
    ]
  },
  {
    name: 'ENTREPRISE',
    price: 19999,
    period: 'mois',
    description: 'Pour les grandes organisations',
    maxUsers: 999,
    consultingHours: 999,
    features: [
      'Utilisateurs illimités',
      'Tout du plan Pro',
      'Consulting illimité',
      'Formations sur mesure',
      'Support dédié 24/7',
      'Gestionnaire de compte',
      'SLA garanti 99.9%',
      'Intégrations personnalisées',
      'Audit de sécurité',
      'Formation des administrateurs'
    ]
  }
]

export function SubscriptionManagementModal({ isOpen, onClose, company }: SubscriptionManagementModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentView, setCurrentView] = useState<'overview' | 'plans' | 'billing'>('overview')

  if (!company) return null

  const currentPlan = plans.find(plan => plan.name === company.plan)
  const isActive = company.subscriptionDetails?.status === 'ACTIVE'

  const handlePlanChange = async (newPlan: string) => {
    setLoading(true)
    
    // Simulation API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    alert(`Changement vers le plan ${newPlan} simulé avec succès !`)
    setLoading(false)
    setCurrentView('overview')
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cet abonnement ?')) return
    
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    alert('Annulation programmée avec succès !')
    setLoading(false)
  }

  const handleReactivateSubscription = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    alert('Abonnement réactivé avec succès !')
    setLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Gestion de l'abonnement - {company.name}
          </DialogTitle>
          <DialogDescription>
            Gérez le plan et la facturation de l'entreprise
          </DialogDescription>
        </DialogHeader>

        {/* Navigation */}
        <div className="border-b">
          <nav className="flex space-x-8">
            <button
              onClick={() => setCurrentView('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentView === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Vue d'ensemble
            </button>
            <button
              onClick={() => setCurrentView('plans')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentView === 'plans'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Changer de plan
            </button>
            <button
              onClick={() => setCurrentView('billing')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentView === 'billing'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Facturation
            </button>
          </nav>
        </div>

        <div className="space-y-6">
          {currentView === 'overview' && (
            <div className="space-y-6">
              {/* Statut actuel */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Plan actuel</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-bold text-blue-600">{company.plan}</span>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{currentPlan?.description}</p>
                    <p className="text-lg font-semibold text-gray-900 mt-2">
                      {currentPlan?.price} MAD/{currentPlan?.period}
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    {company.subscriptionDetails?.currentPeriodEnd && (
                      <p className="text-sm text-gray-600">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Expire le {new Date(company.subscriptionDetails.currentPeriodEnd).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                    {company.subscriptionDetails?.cancelAtPeriodEnd && (
                      <div className="flex items-center text-orange-600">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">Annulation programmée</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Utilisation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.floor(Math.random() * (currentPlan?.maxUsers || 10))}
                        /{currentPlan?.maxUsers === 999 ? '∞' : currentPlan?.maxUsers}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Consulting utilisé</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.floor(Math.random() * (currentPlan?.consultingHours || 2))}h
                        /{currentPlan?.consultingHours === 999 ? '∞' : currentPlan?.consultingHours + 'h'}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Formations actives</p>
                      <p className="text-2xl font-bold text-gray-900">{Math.floor(Math.random() * 20) + 5}</p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="flex space-x-3">
                <Button onClick={() => setCurrentView('plans')} className="flex-1">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Changer de plan
                </Button>
                {isActive && !company.subscriptionDetails?.cancelAtPeriodEnd ? (
                  <Button variant="outline" onClick={handleCancelSubscription} disabled={loading}>
                    <X className="h-4 w-4 mr-2" />
                    Annuler l'abonnement
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleReactivateSubscription} disabled={loading}>
                    <Check className="h-4 w-4 mr-2" />
                    Réactiver
                  </Button>
                )}
              </div>
            </div>
          )}

          {currentView === 'plans' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Choisir un nouveau plan</h3>
                <p className="text-gray-600">Sélectionnez le plan qui correspond le mieux aux besoins de l'entreprise.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                      selectedPlan === plan.name
                        ? 'border-blue-500 bg-blue-50'
                        : plan.name === company.plan
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${plan.popular ? 'relative' : ''}`}
                    onClick={() => setSelectedPlan(plan.name)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white px-3 py-1 text-xs font-medium rounded-full">
                          Populaire
                        </span>
                      </div>
                    )}

                    <div className="text-center">
                      <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                      <p className="text-gray-600 mt-2">{plan.description}</p>
                      <div className="mt-4">
                        <span className="text-3xl font-bold text-gray-900">{plan.price} MAD</span>
                        <span className="text-gray-600">/{plan.period}</span>
                      </div>
                    </div>

                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.name === company.plan && (
                      <div className="mt-6 bg-green-100 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <Check className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-green-800 font-medium">Plan actuel</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedPlan && selectedPlan !== company.plan && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900">
                        Changement vers le plan {selectedPlan}
                      </p>
                      <p className="text-blue-700 text-sm">
                        Le changement sera effectif immédiatement
                      </p>
                    </div>
                    <Button
                      onClick={() => handlePlanChange(selectedPlan)}
                      disabled={loading}
                    >
                      {loading ? 'Traitement...' : 'Confirmer le changement'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentView === 'billing' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Informations de facturation</h3>
                <p className="text-gray-600">Gérez les informations de paiement et consultez l'historique.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Méthode de paiement</h4>
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-6 w-6 text-gray-500" />
                      <div>
                        <p className="font-medium">•••• •••• •••• 4242</p>
                        <p className="text-sm text-gray-600">Expire 12/25</p>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Modifier la méthode de paiement
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Prochaine facture</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Plan {company.plan}</span>
                        <span className="font-medium">{currentPlan?.price} MAD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">TVA (20%)</span>
                        <span className="font-medium">{((currentPlan?.price || 0) * 0.2).toFixed(2)} MAD</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total</span>
                        <span>{((currentPlan?.price || 0) * 1.2).toFixed(2)} MAD</span>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    Consulter l'historique de facturation
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-6">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          {currentView !== 'overview' && (
            <Button variant="outline" onClick={() => setCurrentView('overview')}>
              Retour à la vue d'ensemble
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 