'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export function PaymentStatus() {
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'warning'
    title: string
    description: string
  } | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    const error = searchParams.get('error')

    if (success === 'true') {
      setMessage({
        type: 'success',
        title: 'Paiement réussi !',
        description: 'Votre abonnement a été activé avec succès. Vous pouvez maintenant profiter de toutes les fonctionnalités de votre plan.'
      })
    } else if (canceled === 'true') {
      setMessage({
        type: 'warning',
        title: 'Paiement annulé',
        description: 'Vous avez annulé le processus de paiement. Vous pouvez reprendre l\'abonnement à tout moment.'
      })
    } else if (error) {
      setMessage({
        type: 'error',
        title: 'Erreur de paiement',
        description: 'Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer ou contacter le support.'
      })
    }

    // Nettoyer l'URL après 5 secondes
    if (success || canceled || error) {
      setTimeout(() => {
        const url = new URL(window.location.href)
        url.searchParams.delete('success')
        url.searchParams.delete('canceled')
        url.searchParams.delete('error')
        window.history.replaceState({}, '', url.toString())
        setMessage(null)
      }, 5000)
    }
  }, [searchParams])

  if (!message) return null

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (message.type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
    }
  }

  const getTextColor = () => {
    switch (message.type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
    }
  }

  return (
    <div className={`fixed top-4 right-4 max-w-md w-full z-50 border rounded-lg p-4 shadow-lg ${getBackgroundColor()}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 w-0 flex-1">
          <h3 className={`text-sm font-medium ${getTextColor()}`}>
            {message.title}
          </h3>
          <p className={`mt-1 text-sm ${getTextColor()}`}>
            {message.description}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={() => setMessage(null)}
            className={`inline-flex ${getTextColor()} hover:opacity-75`}
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
} 