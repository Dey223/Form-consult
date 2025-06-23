import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est admin
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN_ENTREPRISE') {
      return NextResponse.json({ error: 'Accès refusé - Droits administrateur requis' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const consultantId = searchParams.get('consultantId')
    const period = searchParams.get('period') || '30d'

    if (!consultantId) {
      return NextResponse.json({ error: 'ID du consultant requis' }, { status: 400 })
    }

    // Vérifier que le consultant existe
    const consultant = await prisma.user.findUnique({
      where: { 
        id: consultantId,
        role: 'CONSULTANT'
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    if (!consultant) {
      return NextResponse.json({ error: 'Consultant non trouvé' }, { status: 404 })
    }

    // Calculer les dates selon la période
    const now = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Récupérer tous les retours du consultant
    const feedbacks = await prisma.consultationFeedback.findMany({
      where: {
        appointment: {
          consultantId: consultantId
        },
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      include: {
        appointment: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculer les statistiques
    const totalFeedbacks = feedbacks.length
    const averageRating = totalFeedbacks > 0 
      ? feedbacks.reduce((sum: number, f: any) => sum + f.rating, 0) / totalFeedbacks 
      : 0

    const satisfactionRating = totalFeedbacks > 0
      ? feedbacks.reduce((sum: number, f: any) => sum + f.satisfactionLevel, 0) / totalFeedbacks
      : 0

    const recommendationRate = totalFeedbacks > 0
      ? (feedbacks.filter((f: any) => f.wouldRecommend).length / totalFeedbacks) * 100
      : 0

    return NextResponse.json({
      consultant,
      period,
      summary: {
        totalFeedbacks,
        averageRating: Math.round(averageRating * 10) / 10,
        satisfactionRating: Math.round(satisfactionRating * 10) / 10,
        recommendationRate: Math.round(recommendationRate * 10) / 10
      },
      recentFeedbacks: feedbacks.slice(0, 10)
    })

  } catch (error) {
    console.error('Erreur récupération feedback consultant (admin):', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 