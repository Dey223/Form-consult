'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, XCircle, Loader2 } from 'lucide-react'

interface InvitationData {
  id: string
  email: string
  role: string
  company: {
    name: string
  }
  sender: {
    name: string
  }
  expiresAt: string
}

export default function AcceptInvitationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (!token) {
      setError('Token d\'invitation manquant')
      setLoading(false)
      return
    }

    const fetchInvitation = async () => {
      try {
        const response = await fetch(`/api/auth/accept-invitation?token=${token}`)
        const data = await response.json()

        if (response.ok) {
          setInvitation(data.invitation)
        } else {
          setError(data.error || 'Invitation invalide ou expirée')
        }
      } catch (error) {
        setError('Erreur lors de la vérification de l\'invitation')
      } finally {
        setLoading(false)
      }
    }

    fetchInvitation()
  }, [token])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setAccepting(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/accept-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          name: formData.name,
          password: formData.password
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Rediriger vers la page de connexion avec un message de succès
        router.push('/auth/signin?message=Compte créé avec succès, vous pouvez maintenant vous connecter')
      } else {
        setError(data.error || 'Erreur lors de l\'acceptation de l\'invitation')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Vérification de l'invitation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation invalide</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/auth/signin')} variant="outline">
              Retour à la connexion
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation à rejoindre</h1>
          <h2 className="text-xl font-semibold text-blue-600 mb-4">{invitation?.company.name}</h2>
          <p className="text-gray-600">
            <strong>{invitation?.sender.name}</strong> vous invite à rejoindre l'équipe en tant que{' '}
            <strong>{invitation?.role === 'ADMIN_ENTREPRISE' ? 'Administrateur' : 'Employé'}</strong>
          </p>
        </div>

        <form onSubmit={handleAccept} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={invitation?.email || ''}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nom complet *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Votre nom complet"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Choisissez un mot de passe"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmer le mot de passe *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirmez votre mot de passe"
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={accepting}
          >
            {accepting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Création du compte...
              </>
            ) : (
              'Accepter l\'invitation et créer mon compte'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Cette invitation expire le {new Date(invitation?.expiresAt || '').toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>
    </div>
  )
} 