'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AdminEntrepriseDashboard } from '@/components/dashboard/admin-entreprise-dashboard'
import { EmployeDashboard } from '@/components/dashboard/employe-dashboard'
import { ConsultantDashboard } from '@/components/dashboard/consultant-dashboard'
import { SuperAdminDashboard } from '@/components/dashboard/super-admin-dashboard'
import { FormateurDashboard } from '@/components/dashboard/formateur-dashboard'

export default function DashboardClientPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // En cours de chargement

    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <div>Redirection...</div>
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur de session</h1>
          <p className="text-gray-600 mb-4">Aucune session utilisateur trouvée</p>
          <button 
            onClick={() => router.push('/auth/signin')}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Se reconnecter
          </button>
        </div>
      </div>
    )
  }

  console.log('Dashboard Client - User role:', session.user.role, 'User:', session.user)

  switch (session.user.role) {
    case 'SUPER_ADMIN':
      return <SuperAdminDashboard />
    case 'ADMIN_ENTREPRISE':
      return <AdminEntrepriseDashboard />
    case 'EMPLOYE':
      return <EmployeDashboard />
    case 'CONSULTANT':
      return <ConsultantDashboard />
    case 'FORMATEUR':
      return <FormateurDashboard />
    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Rôle non reconnu</h1>
            <p className="text-gray-600 mb-4">
              Rôle utilisateur: <code className="bg-gray-100 px-2 py-1 rounded">{session.user.role}</code>
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Rôles valides: SUPER_ADMIN, ADMIN_ENTREPRISE, EMPLOYE, CONSULTANT, FORMATEUR
            </p>
            <button 
              onClick={() => router.push('/auth/signin')}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Se reconnecter
            </button>
          </div>
        </div>
      )
  }
} 