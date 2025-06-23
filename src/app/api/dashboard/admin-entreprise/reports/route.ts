import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session?.user?.companyId || session.user.role !== 'ADMIN_ENTREPRISE') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const companyId = session.user.companyId
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'

    // Calculer la date de début selon la période
    const now = new Date()
    let startDate: Date
    let periodLabel: string

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        periodLabel = 'Cette semaine'
        break
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        periodLabel = 'Ce trimestre'
        break
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        periodLabel = 'Cette année'
        break
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        periodLabel = 'Ce mois'
    }

    // Récupérer tous les employés de l'entreprise
    const employees = await prisma.user.findMany({
      where: { 
        companyId,
        role: 'EMPLOYE'
      },
      include: {
        userFormations: {
          include: {
            formation: {
              select: { title: true, level: true }
            }
          },
          where: {
            updatedAt: {
              gte: startDate
            }
          }
        },
        appointments: {
          select: {
            id: true,
            status: true,
            duration: true,
            scheduledAt: true
          },
          where: {
            scheduledAt: {
              gte: startDate
            }
          }
        }
      }
    })

    // Calculer les statistiques des formations
    const allUserFormations = employees.flatMap(emp => emp.userFormations)
    const completedFormations = allUserFormations.filter(uf => uf.completedAt)
    const inProgressFormations = allUserFormations.filter(uf => !uf.completedAt && uf.progress > 0)
    
    const averageCompletion = allUserFormations.length > 0 
      ? Math.round(allUserFormations.reduce((sum, uf) => sum + uf.progress, 0) / allUserFormations.length)
      : 0

    // Calculer les statistiques des utilisateurs
    const totalUsers = employees.length
    const activeUsers = employees.filter(emp => 
      emp.userFormations.length > 0 || emp.appointments.length > 0
    ).length
    const inactiveUsers = totalUsers - activeUsers

    // Calculer les statistiques des consultations
    const allAppointments = employees.flatMap(emp => emp.appointments)
    const completedAppointments = allAppointments.filter(apt => apt.status === 'COMPLETED')
    const pendingAppointments = allAppointments.filter(apt => 
      apt.status === 'PENDING' || apt.status === 'ASSIGNED' || apt.status === 'CONFIRMED'
    )
    
    const averageDuration = completedAppointments.length > 0
      ? Math.round(completedAppointments.reduce((sum, apt) => sum + (apt.duration || 60), 0) / completedAppointments.length)
      : 0

    // Données mensuelles pour les tendances
    const monthlyData = []
    for (let i = 2; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const monthFormations = allUserFormations.filter(uf => 
        uf.completedAt && 
        uf.completedAt >= monthStart && 
        uf.completedAt <= monthEnd
      ).length

      const monthAppointments = allAppointments.filter(apt => 
        apt.scheduledAt >= monthStart && 
        apt.scheduledAt <= monthEnd
      ).length

      const monthActiveUsers = employees.filter(emp => {
        const hasActivity = emp.userFormations.some(uf => 
          uf.updatedAt >= monthStart && uf.updatedAt <= monthEnd
        ) || emp.appointments.some(apt => 
          apt.scheduledAt >= monthStart && apt.scheduledAt <= monthEnd
        )
        return hasActivity
      }).length

      const monthCompletedFormations = allUserFormations.filter(uf => 
        uf.completedAt && 
        uf.completedAt >= monthStart && 
        uf.completedAt <= monthEnd
      ).length

      monthlyData.push({
        month: monthStart.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        formations: monthFormations,
        consultations: monthAppointments,
        activeUsers: monthActiveUsers,
        completionRate: allUserFormations.length > 0 ? 
          Math.round((monthCompletedFormations / allUserFormations.length) * 100) : 0
      })
    }

    // Calculer les top performers pour cette période
    const topPerformers = employees
      .map(emp => {
        const completedCount = emp.userFormations.filter(uf => uf.completedAt).length
        const avgProgress = emp.userFormations.length > 0 
          ? emp.userFormations.reduce((sum, uf) => sum + uf.progress, 0) / emp.userFormations.length
          : 0
        const appointmentsCount = emp.appointments.length

        return {
          id: emp.id,
          name: emp.name || 'Utilisateur',
          email: emp.email,
          completedFormations: completedCount,
          avgProgress: Math.round(avgProgress),
          appointmentsCount,
          score: Math.round((avgProgress * 0.6) + (completedCount * 15) + (appointmentsCount * 5))
        }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    const reportData = {
      formations: {
        total: allUserFormations.length,
        completed: completedFormations.length,
        inProgress: inProgressFormations.length,
        averageCompletion
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers
      },
      consultations: {
        total: allAppointments.length,
        completed: completedAppointments.length,
        pending: pendingAppointments.length,
        averageDuration
      },
      timeframe: periodLabel,
      monthlyData,
      topPerformers,
      detailedStats: {
        formationsByLevel: allUserFormations.reduce((acc, uf) => {
          const level = uf.formation.level || 'Non défini'
          acc[level] = (acc[level] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        appointmentsByStatus: allAppointments.reduce((acc, apt) => {
          acc[apt.status] = (acc[apt.status] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        engagementRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
      }
    }

    return NextResponse.json(reportData)

  } catch (error) {
    console.error('Erreur lors du chargement des données de rapport:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 