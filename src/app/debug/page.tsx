'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

interface DebugData {
  session: any
  availableRoles: string[]
  usersByRole: any[]
  dbConnected: boolean
  timestamp: string
}

export default function DebugPage() {
  const { data: session, status } = useSession()
  const [debugData, setDebugData] = useState<DebugData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDebugData = async () => {
      try {
        const response = await fetch('/api/debug/auth')
        if (response.ok) {
          const data = await response.json()
          setDebugData(data)
        }
      } catch (error) {
        console.error('Erreur debug:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDebugData()
  }, [])

  const handleTestDashboard = () => {
    window.location.href = '/dashboard'
  }

  const handleClearSession = async () => {
    await signOut({ redirect: false })
    window.location.reload()
  }

  const handleCreateFormateur = async () => {
    try {
      const response = await fetch('/api/debug/create-formateur', {
        method: 'POST'
      })
      const data = await response.json()
      alert(JSON.stringify(data, null, 2))
      window.location.reload()
    } catch (error) {
      alert('Erreur: ' + error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug - Authentification</h1>
        
        {/* Session Status */}
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <h2 className="text-xl font-semibold mb-4">Statut de la session</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            {session ? (
              <div>
                <p><strong>User ID:</strong> {session.user?.id}</p>
                <p><strong>Email:</strong> {session.user?.email}</p>
                <p><strong>Name:</strong> {session.user?.name}</p>
                <p><strong>Role:</strong> {session.user?.role}</p>
                <p><strong>Company ID:</strong> {session.user?.companyId || 'N/A'}</p>
              </div>
            ) : (
              <p className="text-red-600">Aucune session active</p>
            )}
          </div>
        </div>

        {/* Debug Data */}
        {!loading && debugData && (
          <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
            <h2 className="text-xl font-semibold mb-4">Données de debug</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Rôles disponibles:</h3>
                <ul className="list-disc list-inside">
                  {debugData.availableRoles.map(role => (
                    <li key={role}>{role}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium">Utilisateurs par rôle:</h3>
                <ul className="list-disc list-inside">
                  {debugData.usersByRole.map(item => (
                    <li key={item.role}>{item.role}: {item._count._all} utilisateur(s)</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <p><strong>DB Connectée:</strong> {debugData.dbConnected ? '✅ Oui' : '❌ Non'}</p>
                <p><strong>Timestamp:</strong> {debugData.timestamp}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Actions de test</h2>
          <div className="space-x-4">
            <Button onClick={handleTestDashboard}>
              Tester l'accès au Dashboard
            </Button>
            <Button variant="outline" onClick={handleClearSession}>
              Effacer la session
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/auth/signin'}>
              Page de connexion
            </Button>
            <Button variant="outline" onClick={handleCreateFormateur}>
              Créer Formateur
            </Button>
          </div>
        </div>

        {/* Raw Data */}
        {debugData && (
          <div className="bg-gray-100 rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Données brutes</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify({ session, debugData }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
} 