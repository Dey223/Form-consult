import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminEntrepriseDashboard } from '@/components/dashboard/admin-entreprise-dashboard'
import { EmployeDashboard } from '@/components/dashboard/employe-dashboard-simple'
import { ConsultantDashboard } from '@/components/dashboard/consultant-dashboard'
import { SuperAdminDashboard } from '@/components/dashboard/super-admin-dashboard'
import { FormateurDashboard } from '@/components/dashboard/formateur-dashboard'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Debug log pour voir le rôle
  console.log('Dashboard - User role:', session.user.role, 'User:', session.user)

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
      console.error('Rôle non reconnu:', session.user.role)
      redirect('/auth/signin?error=invalid-role')
  }
} 