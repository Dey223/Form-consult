import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN_ENTREPRISE') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const companyId = session.user.companyId

    if (!companyId) {
      return NextResponse.json({ error: 'ID entreprise manquant' }, { status: 400 })
    }

    // Calculs de dates
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Statistiques utilisateurs de base
    const allUsers = await prisma.user.findMany({
      where: { companyId },
      include: {
        userFormations: {
          include: {
            formation: true
          }
        },
        appointments: true,
        _count: {
          select: {
            userFormations: {
              where: { 
                completedAt: { not: null }
              }
            }
          }
        }
      }
    })

    const totalUsers = allUsers.length
    const activeUsers = allUsers.filter((user: any) => user.role !== 'SUPER_ADMIN').length
    const newUsersThisMonth = allUsers.filter((user: any) => 
      user.createdAt >= startOfMonth
    ).length

    // Calculs de progression
    const allProgress = allUsers.flatMap((user: any) => user.userFormations)
    const completedProgress = allProgress.filter((p: any) => p.completedAt !== null)
    const averageProgress = allProgress.length > 0 
      ? (allProgress.reduce((sum: number, p: any) => sum + (p.progress || 0), 0) / allProgress.length)
      : 0

    const completedFormations = completedProgress.length

    // Consultations à venir (rendez-vous)
    const upcomingConsultations = await prisma.appointment.count({
      where: {
        companyId,
        scheduledAt: { gte: now },
        status: { in: ['CONFIRMED', 'ASSIGNED'] }
      }
    })

    // Top performers (utilisateurs avec le plus de formations complétées et la meilleure progression)
    const topPerformers = allUsers
      .map((user: any) => {
        const completedCount = user._count.userFormations
        const totalProgress = user.userFormations.reduce((sum: number, p: any) => sum + (p.progress || 0), 0)
        const avgProgress = user.userFormations.length > 0 
          ? totalProgress / user.userFormations.length 
          : 0
        
        // Score basé sur les formations complétées (70%) et la progression moyenne (30%)
        const score = Math.round((completedCount * 7) + (avgProgress * 0.3))
        
        return {
          id: user.id,
          name: user.name || user.email,
          score,
          progress: Math.round(avgProgress),
          avatar: user.image
        }
      })
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 5)

    // Tendances d'activité sur 3 mois
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    
    const loginTrends = []
    const completionTrends = []
    
    // Données simulées pour les tendances (à remplacer par vraies données de sessions)
    const months = ['il y a 2 mois', 'le mois dernier', 'ce mois']
    for (let i = 0; i < 3; i++) {
      loginTrends.push({
        month: months[i],
        count: Math.floor(Math.random() * 50) + activeUsers + (i * 5)
      })
      
      const monthStart = new Date(now.getFullYear(), now.getMonth() - (2 - i), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - (2 - i) + 1, 0)
      
      const monthCompletions = await prisma.userFormation.count({
        where: {
          user: { companyId },
          completedAt: {
            gte: monthStart,
            lte: monthEnd,
            not: null
          }
        }
      })
      
      completionTrends.push({
        month: months[i],
        count: monthCompletions
      })
    }

    const statistics = {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      averageProgress: Math.round(averageProgress * 100) / 100,
      completedFormations,
      upcomingConsultations,
      topPerformers,
      activityTrends: {
        logins: loginTrends,
        completions: completionTrends
      }
    }

    return NextResponse.json({ 
      success: true, 
      statistics 
    })

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques utilisateurs:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 