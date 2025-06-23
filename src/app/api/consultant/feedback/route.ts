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

    if (session.user.role !== 'CONSULTANT') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d, 1y
    const consultantId = session.user.id

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

    // 1. Récupérer toutes les consultations terminées du consultant
    const completedAppointments = await prisma.appointment.findMany({
      where: {
        consultantId: consultantId,
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 2. Récupérer tous les retours du consultant
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

    // 3. Calculer les statistiques globales
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

    // 4. Distribution des notes
    const ratingDistribution = {
      5: feedbacks.filter((f: any) => f.rating === 5).length,
      4: feedbacks.filter((f: any) => f.rating === 4).length,
      3: feedbacks.filter((f: any) => f.rating === 3).length,
      2: feedbacks.filter((f: any) => f.rating === 2).length,
      1: feedbacks.filter((f: any) => f.rating === 1).length
    }

    // 5. Évolution des notes par semaine
    const weeklyRatings = []
    const weeksCount = Math.min(8, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)))

    for (let i = 0; i < weeksCount; i++) {
      const weekStart = new Date(startDate)
      weekStart.setDate(startDate.getDate() + i * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 7)

      const weekFeedbacks = feedbacks.filter((f: any) => 
        new Date(f.createdAt) >= weekStart && new Date(f.createdAt) < weekEnd
      )

      const weekAvgRating = weekFeedbacks.length > 0
        ? weekFeedbacks.reduce((sum: number, f: any) => sum + f.rating, 0) / weekFeedbacks.length
        : 0

      weeklyRatings.push({
        week: `S${i + 1}`,
        rating: Math.round(weekAvgRating * 10) / 10,
        count: weekFeedbacks.length,
        satisfaction: weekFeedbacks.length > 0
          ? Math.round((weekFeedbacks.reduce((sum: number, f: any) => sum + f.satisfactionLevel, 0) / weekFeedbacks.length) * 10) / 10
          : 0
      })
    }

    // 6. Analyse des commentaires par catégorie
    const positiveKeywords = ['excellent', 'parfait', 'super', 'génial', 'professionnel', 'efficace', 'recommande']
    const negativeKeywords = ['décevant', 'mauvais', 'problème', 'difficile', 'insatisfait']
    
    const commentAnalysis = {
      positive: 0,
      negative: 0,
      neutral: 0,
      totalComments: feedbacks.filter((f: any) => f.comments && f.comments.trim().length > 0).length
    }

    feedbacks.forEach((feedback: any) => {
      if (feedback.comments) {
        const comment = feedback.comments.toLowerCase()
        const hasPositive = positiveKeywords.some(keyword => comment.includes(keyword))
        const hasNegative = negativeKeywords.some(keyword => comment.includes(keyword))
        
        if (hasPositive && !hasNegative) {
          commentAnalysis.positive++
        } else if (hasNegative && !hasPositive) {
          commentAnalysis.negative++
        } else {
          commentAnalysis.neutral++
        }
      }
    })

    // 7. Top des domaines d'amélioration
    const improvementAreas: Record<string, number> = {}
    feedbacks.forEach((feedback: any) => {
      if (feedback.improvementAreas && Array.isArray(feedback.improvementAreas)) {
        feedback.improvementAreas.forEach((area: string) => {
          improvementAreas[area] = (improvementAreas[area] || 0) + 1
        })
      }
    })

    const topImprovementAreas = Object.entries(improvementAreas)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([area, count]) => ({ area, count }))

    // 8. Consultations sans retour
    const appointmentsWithoutFeedback = completedAppointments.filter(apt => 
      !feedbacks.some((f: any) => f.appointmentId === apt.id)
    )

    // 9. Insights calculés
    const bestRatedWeek = weeklyRatings.reduce((max, week) => 
      week.rating > (max?.rating || 0) ? week : max, null as any
    )

    const avgResponseTime = feedbacks.length > 0 
      ? Math.round(
          feedbacks.reduce((sum: number, f: any) => {
            const daysDiff = Math.floor((new Date(f.createdAt).getTime() - new Date(f.appointment.createdAt).getTime()) / (1000 * 60 * 60 * 24))
            return sum + Math.max(0, daysDiff)
          }, 0) / feedbacks.length
        )
      : 0

    const responseData = {
      summary: {
        totalFeedbacks,
        averageRating: Math.round(averageRating * 10) / 10,
        satisfactionRating: Math.round(satisfactionRating * 10) / 10,
        recommendationRate: Math.round(recommendationRate),
        totalConsultations: completedAppointments.length,
        responseRate: completedAppointments.length > 0 
          ? Math.round((totalFeedbacks / completedAppointments.length) * 100) 
          : 0
      },
      ratingDistribution,
      weeklyRatings,
      recentFeedbacks: feedbacks.slice(0, 10).map((feedback: any) => ({
        id: feedback.id,
        rating: feedback.rating,
        satisfactionLevel: feedback.satisfactionLevel,
        wouldRecommend: feedback.wouldRecommend,
        comments: feedback.comments,
        improvementAreas: feedback.improvementAreas || [],
        createdAt: feedback.createdAt,
        client: {
          name: feedback.appointment.user.name,
          company: feedback.appointment.company.name
        },
        appointment: {
          id: feedback.appointment.id,
          title: feedback.appointment.title,
          date: feedback.appointment.scheduledAt
        }
      })),
      commentAnalysis,
      topImprovementAreas,
      pendingFeedback: appointmentsWithoutFeedback.map(apt => ({
        id: apt.id,
        title: apt.title,
        clientName: apt.user.name,
        companyName: apt.company.name,
        completedAt: apt.createdAt,
        daysSinceCompletion: Math.floor((now.getTime() - new Date(apt.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      })),
      insights: {
        bestRatedMonth: bestRatedWeek,
        mostCommonImprovement: topImprovementAreas[0]?.area || null,
        avgResponseTime
      }
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Erreur récupération retours consultant:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 