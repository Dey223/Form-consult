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
    const period = searchParams.get('period') || '3months'

    // Calculer la date de début selon la période
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case '1month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
        break
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default: // 3months
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
    }

    // Récupérer tous les employés de l'entreprise avec leurs données
    const employees = await prisma.user.findMany({
      where: { 
        companyId,
        role: 'EMPLOYE'
      },
      include: {
        userFormations: {
          include: {
            formation: {
              select: {
                title: true,
                level: true
              }
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
            title: true,
            status: true,
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

    // Calculer les statistiques globales
    const totalEmployees = employees.length
    const activeEmployees = employees.filter(emp => 
      emp.userFormations.length > 0 || emp.appointments.length > 0
    ).length

    // Calculer les formations complétées
    const allFormations = employees.flatMap(emp => emp.userFormations)
    const completedFormations = allFormations.filter(uf => uf.completedAt).length
    const totalFormationsCompleted = completedFormations

    // Calculer le taux de completion moyen
    const avgCompletionRate = allFormations.length > 0 
      ? Math.round(allFormations.reduce((sum, uf) => sum + uf.progress, 0) / allFormations.length)
      : 0

    // Calculer les consultations
    const allConsultations = employees.flatMap(emp => emp.appointments)
    const totalConsultationsRequested = allConsultations.length

    // Générer les données mensuelles pour le graphique
    const monthlyProgress = []
    for (let i = 0; i < 3; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const monthFormations = allFormations.filter(uf => 
        uf.completedAt && 
        uf.completedAt >= monthStart && 
        uf.completedAt <= monthEnd
      ).length

      const monthConsultations = allConsultations.filter(appointment => 
        appointment.scheduledAt >= monthStart && 
        appointment.scheduledAt <= monthEnd
      ).length

      monthlyProgress.unshift({
        month: monthStart.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        formations: monthFormations,
        consultations: monthConsultations
      })
    }

    // Identifier les top performers
    const employeesWithScores = employees.map(emp => {
      const completedCount = emp.userFormations.filter(uf => uf.completedAt).length
      const avgProgress = emp.userFormations.length > 0 
        ? emp.userFormations.reduce((sum, uf) => sum + uf.progress, 0) / emp.userFormations.length
        : 0
      const consultationsCount = emp.appointments.length

      return {
        id: emp.id,
        name: emp.name || 'Utilisateur',
        completedFormations: completedCount,
        avgProgress: Math.round(avgProgress),
        consultationsCount,
        score: Math.round((avgProgress * 0.7) + (completedCount * 10) + (consultationsCount * 5))
      }
    }).sort((a, b) => b.score - a.score)

    const topPerformers = employeesWithScores.slice(0, 3)

    // Préparer les données détaillées des employés
    const employeesData = employees.map(emp => {
      const completedFormations = emp.userFormations.filter(uf => uf.completedAt).length
      const totalFormations = emp.userFormations.length
      const avgProgress = totalFormations > 0 
        ? Math.round(emp.userFormations.reduce((sum, uf) => sum + uf.progress, 0) / totalFormations)
        : 0
      
      // Calculer le temps total d'apprentissage (estimation)
      const totalHoursLearning = Math.round(completedFormations * 2.5 + (totalFormations - completedFormations) * 0.5)
      
      // Score moyen basé sur le progrès
      const averageScore = avgProgress

      return {
        id: emp.id,
        name: emp.name || 'Utilisateur',
        email: emp.email,
        formationsCompleted: completedFormations,
        consultationsCount: emp.appointments.length,
        averageScore,
        totalHoursLearning,
        lastActivity: emp.updatedAt.toISOString()
      }
    })

    // Statistiques globales
    const stats = {
      totalEmployees,
      activeEmployees,
      avgCompletionRate,
      totalFormationsCompleted,
      totalConsultationsRequested,
      topPerformers,
      monthlyProgress
    }

    return NextResponse.json({
      stats,
      employees: employeesData
    })

  } catch (error) {
    console.error('Erreur lors du chargement des données de performance:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 