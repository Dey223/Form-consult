'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'

interface PricingCardProps {
  plan: {
    id: 'ESSENTIEL' | 'PRO' | 'ENTREPRISE'
    name: string
    price: number | null
    originalPrice?: number
    currency?: string
    description: string
    features: string[]
    popular?: boolean
    highlight?: string
    enterprise?: boolean
  }
}

export function PricingCard({ plan }: PricingCardProps) {
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  const handleSubscribe = async () => {
    if (!session) {
      // Rediriger vers la page d'inscription avec le plan présélectionné
      router.push(`/auth/signup?plan=${plan.id}`)
      return
    }

    if (plan.id === 'ENTREPRISE' || plan.enterprise) {
      // Pour le plan entreprise, rediriger vers une page de contact
      window.open('mailto:contact@formconsult.com?subject=Demande%20plan%20Entreprise&body=Bonjour%2C%0A%0AJe%20souhaite%20obtenir%20plus%20d%27informations%20sur%20le%20plan%20Entreprise.%0A%0AMerci', '_blank')
      return
    }

    setLoading(true)

    try {
      // Créer une session de checkout Stripe
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: plan.id
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session de paiement')
      }

      const { checkoutUrl } = await response.json()

      if (checkoutUrl) {
        // Rediriger vers Stripe Checkout
        window.location.href = checkoutUrl
      }
    } catch (error) {
      console.error('Erreur lors de la souscription:', error)
      alert('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const getButtonText = () => {
    if (loading) return 'Chargement...'
    if (!session) return 'Commencer'
    if (plan.id === 'ENTREPRISE' || plan.enterprise) return 'Nous contacter'
    return 'S\'abonner maintenant'
  }

  const getButtonVariant = () => {
    if (plan.id === 'ENTREPRISE' || plan.enterprise) return 'outline' as const
    if (plan.popular) return 'default' as const
    return 'default' as const
  }

  return (
    <div className={`p-8 rounded-xl shadow-sm border relative ${
      plan.popular 
        ? 'bg-blue-50 border-2 border-blue-200' 
        : 'bg-white border-gray-200'
    }`}>
      {(plan.popular || plan.highlight) && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
          {plan.highlight || 'Populaire'}
        </div>
      )}
      
      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
      <div className="mb-4">
        {plan.price ? (
          <div>
            <div className="text-4xl font-bold text-gray-900">
              {plan.price} {plan.currency || 'MAD'}
              <span className="text-lg text-gray-600">/mois</span>
            </div>
            {plan.originalPrice && (
              <div className="text-sm text-gray-500 mt-1">
                <span className="line-through">{plan.originalPrice} {plan.currency || 'MAD'}</span>
                <span className="ml-2 text-green-600 font-medium">
                  Économisez {plan.originalPrice - plan.price} {plan.currency || 'MAD'}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-4xl font-bold text-gray-900">Sur devis</div>
        )}
      </div>
      <p className="text-gray-600 mb-6">{plan.description}</p>
      
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      
      <Button
        className={`w-full ${
          plan.popular 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : ''
        }`}
        variant={getButtonVariant()}
        onClick={handleSubscribe}
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {getButtonText()}
      </Button>
    </div>
  )
} 