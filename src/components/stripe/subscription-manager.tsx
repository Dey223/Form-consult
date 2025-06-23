'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, ExternalLink, Loader2, Shield, Check, AlertTriangle, Info, Crown } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SubscriptionManagerProps {
  currentPlan?: 'ESSENTIEL' | 'PRO' | 'ENTREPRISE'
  subscriptionStatus?: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'UNPAID'
  hasStripeCustomer?: boolean
  nextBillingDate?: string
  currentPeriodEnd?: string
}

export function SubscriptionManager({
  currentPlan,
  subscriptionStatus,
  hasStripeCustomer,
  nextBillingDate,
  currentPeriodEnd
}: SubscriptionManagerProps) {
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>(currentPlan || 'PRO')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingPlan, setPendingPlan] = useState<string>('')

  const plans = [
    {
      id: 'ESSENTIEL',
      name: 'Essentiel',
      price: 4999,
      originalPrice: 6999,
      currency: 'MAD',
      description: 'Parfait pour les petites équipes',
      highlight: 'Économique',
      color: 'blue',
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
      id: 'PRO',
      name: 'Pro',
      price: 9999,
      originalPrice: 13999,
      currency: 'MAD',
      description: 'Idéal pour les entreprises en croissance',
      highlight: 'Le plus populaire',
      color: 'purple',
      features: [
        'Jusqu\'à 50 utilisateurs',
        'Tout du plan Essentiel',
        'Sessions de consulting (50h/mois)',
        'Analytics avancées et exports',
        'Support prioritaire (24h)',
        'Formations personnalisées',
        'API et intégrations',
        'Rapports en temps réel'
      ],
      popular: true
    },
    {
      id: 'ENTREPRISE',
      name: 'Entreprise',
      price: null,
      currency: 'MAD',
      description: 'Pour les grandes organisations',
      highlight: 'Solution complète',
      color: 'gold',
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
      ],
      enterprise: true
    }
  ]

  const handleSubscribe = async (planType: string) => {
    if (planType === 'ENTREPRISE') {
      // Rediriger vers le contact pour les plans entreprise
      toast.success('Redirection vers notre équipe commerciale...')
      setTimeout(() => {
        window.location.href = '/contact?plan=entreprise'
      }, 1000)
      return
    }

    if (currentPlan && planType !== currentPlan) {
      setPendingPlan(planType)
      setShowConfirmation(true)
      return
    }

    await performSubscription(planType)
  }

  const performSubscription = async (planType: string) => {
    setLoading(true)
    try {
      toast.loading('Préparation du paiement sécurisé...')
      
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planType,
          upgradeFrom: currentPlan 
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la création du checkout')
      }

      const { checkoutUrl } = await response.json()
      toast.dismiss()
      toast.success('Redirection vers le paiement sécurisé...')
      
      setTimeout(() => {
        window.location.href = checkoutUrl
      }, 1000)
    } catch (error) {
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
      setShowConfirmation(false)
    }
  }

  const handleBillingPortal = async () => {
    setLoading(true)
    try {
      toast.loading('Ouverture du portail de facturation...')
      
      const response = await fetch('/api/stripe/billing-portal', {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de l\'accès au portail')
      }

      const { portalUrl } = await response.json()
      toast.dismiss()
      toast.success('Redirection vers le portail de facturation...')
      
      setTimeout(() => {
        window.location.href = portalUrl
      }, 1000)
    } catch (error) {
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const getSubscriptionStatusBadge = () => {
    const badges = {
      ACTIVE: { 
        text: 'Actif', 
        class: 'bg-green-100 text-green-800 border-green-200',
        icon: <Check className="h-3 w-3 mr-1" />
      },
      CANCELED: { 
        text: 'Annulé', 
        class: 'bg-red-100 text-red-800 border-red-200',
        icon: <AlertTriangle className="h-3 w-3 mr-1" />
      },
      PAST_DUE: { 
        text: 'Paiement en retard', 
        class: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: <AlertTriangle className="h-3 w-3 mr-1" />
      },
      UNPAID: { 
        text: 'Non payé', 
        class: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <AlertTriangle className="h-3 w-3 mr-1" />
      }
    }

    if (!subscriptionStatus) return null

    const badge = badges[subscriptionStatus as keyof typeof badges]
    if (!badge) return null
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${badge.class}`}>
        {badge.icon}
        {badge.text}
      </span>
    )
  }

  const getCurrentPlanDetails = () => {
    return plans.find(p => p.id === currentPlan)
  }

  const getPlanColor = (planId: string, isSelected: boolean = false) => {
    const colors = {
      ESSENTIEL: isSelected ? 'border-blue-500 bg-blue-50' : 'border-blue-200',
      PRO: isSelected ? 'border-purple-500 bg-purple-50' : 'border-purple-200',
      ENTREPRISE: isSelected ? 'border-yellow-500 bg-yellow-50' : 'border-yellow-200'
    }
    return colors[planId as keyof typeof colors] || 'border-gray-200'
  }

  return (
    <div className="space-y-8">
      {/* Plan actuel - Section améliorée */}
      {currentPlan && (
        <div className="bg-gradient-to-r from-white to-gray-50 p-6 rounded-xl border-2 border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Crown className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Votre Plan Actuel</h3>
                <p className="text-sm text-gray-600">Gérez votre abonnement et facturation</p>
              </div>
            </div>
            {getSubscriptionStatusBadge()}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-base md:text-lg text-gray-900">
                  Plan {getCurrentPlanDetails()?.name}
                </h4>
                <p className="text-xl md:text-2xl font-bold text-blue-600">
                  {getCurrentPlanDetails()?.price 
                    ? `${getCurrentPlanDetails()?.price}${getCurrentPlanDetails()?.currency}/mois`
                    : 'Sur devis'
                  }
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {getCurrentPlanDetails()?.description}
                </p>
              </div>

              {(nextBillingDate || currentPeriodEnd) && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Informations de facturation</span>
                  </div>
                  <p className="text-sm text-blue-800">
                    {subscriptionStatus === 'ACTIVE' 
                      ? `Prochain paiement : ${nextBillingDate || new Date(currentPeriodEnd!).toLocaleDateString('fr-FR')}`
                      : `Période se termine : ${new Date(currentPeriodEnd!).toLocaleDateString('fr-FR')}`
                    }
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {hasStripeCustomer && (
                <Button
                  variant="outline"
                  onClick={handleBillingPortal}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 h-12"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <ExternalLink className="h-5 w-5" />
                  )}
                  <span>Portail de Facturation</span>
                </Button>
              )}
              
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Factures et historique des paiements</p>
                <p>• Modifier les informations de paiement</p>
                <p>• Télécharger les reçus</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sélection de plan - Interface améliorée */}
      <div>
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {currentPlan ? 'Changer de Plan' : 'Choisissez Votre Plan'}
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Sélectionnez le plan qui correspond le mieux aux besoins de votre équipe. 
            Vous pouvez changer ou annuler à tout moment.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id
            const isCurrent = currentPlan === plan.id
            
            return (
              <div
                key={plan.id}
                className={`relative p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                  isSelected
                    ? getPlanColor(plan.id, true)
                    : isCurrent 
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {/* Badge populaire ou actuel */}
                {plan.popular && !isCurrent && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                    {plan.highlight}
                  </div>
                )}
                
                {isCurrent && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                    Plan Actuel
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold mb-2 text-gray-900">{plan.name}</h4>
                  
                  <div className="mb-3">
                    {plan.price ? (
                      <div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          {plan.price}{plan.currency}
                          <span className="text-lg text-gray-600">/mois</span>
                        </div>
                        {plan.originalPrice && (
                          <div className="text-sm text-gray-500">
                            <span className="line-through">{plan.originalPrice}{plan.currency}</span>
                            <span className="ml-2 text-green-600 font-medium">
                              Économisez {plan.originalPrice - plan.price}{plan.currency}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-gray-900">Sur devis</div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5 mr-3">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className={`w-full h-12 font-medium ${
                    isCurrent 
                      ? 'bg-green-600 hover:bg-green-700 cursor-default'
                      : plan.id === 'ESSENTIEL'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : plan.id === 'PRO'
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-yellow-600 hover:bg-yellow-700'
                  }`}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading || isCurrent}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : isCurrent ? (
                    <Check className="h-5 w-5 mr-2" />
                  ) : (
                    <CreditCard className="h-5 w-5 mr-2" />
                  )}
                  {isCurrent 
                    ? 'Plan Actuel'
                    : plan.enterprise 
                      ? 'Nous Contacter'
                      : currentPlan 
                        ? 'Changer de Plan'
                        : 'Choisir ce Plan'
                  }
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Section sécurité et garanties */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-6 w-6 text-blue-600" />
          <h4 className="font-bold text-blue-900">Sécurité et Garanties</h4>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-600" />
              Paiement sécurisé avec Stripe (niveau bancaire)
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-600" />
              Conformité PCI DSS et RGPD
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-600" />
              Chiffrement SSL 256-bit de bout en bout
            </li>
          </ul>
          
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-600" />
              Annulation sans frais à tout moment
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-600" />
              Changements de plan proratisés automatiquement
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-600" />
              Support client réactif et expertise technique
            </li>
          </ul>
        </div>
      </div>

      {/* Modal de confirmation */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Confirmer le changement de plan
              </h3>
              <p className="text-gray-600">
                Vous allez passer du plan <strong>{getCurrentPlanDetails()?.name}</strong> au plan{' '}
                <strong>{plans.find(p => p.id === pendingPlan)?.name}</strong>.
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-800">
                Le changement sera effectif immédiatement et votre facturation sera ajustée au prorata.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={() => performSubscription(pendingPlan)}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 