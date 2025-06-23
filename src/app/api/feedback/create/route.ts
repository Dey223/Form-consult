import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API Feedback CREATE appelée')
    
    const session = await getServerSession(authOptions)
    console.log('👤 Session:', session ? `User ${session.user?.id} (${session.user?.role})` : 'Aucune session')
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Seuls les employés et admins peuvent créer des retours
    if (!['EMPLOYE', 'ADMIN'].includes(session.user.role)) {
      console.log('🚫 Rôle non autorisé:', session.user.role)
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = await request.json()
    console.log('📦 Body reçu:', body)
    
    const {
      appointmentId,
      rating,
      satisfactionLevel,
      wouldRecommend,
      comments,
      improvementAreas,
      strengths,
      followUpNeeded
    } = body

    // Validation des données
    if (!appointmentId || !rating || rating < 1 || rating > 5) {
      console.log('❌ Validation échouée:', { appointmentId, rating })
      return NextResponse.json({ 
        error: 'Données invalides - appointmentId et rating (1-5) requis' 
      }, { status: 400 })
    }

    console.log('🔍 Recherche appointment:', { appointmentId, userId: session.user.id })

    // D'abord, vérifions si l'appointment existe (sans filtre de statut)
    const appointmentExists = await (prisma as any).appointment.findFirst({
      where: {
        id: appointmentId
      },
      include: {
        consultant: {
          select: { id: true, name: true }
        }
      }
    })

    console.log('📋 Appointment trouvée:', appointmentExists ? {
      id: appointmentExists.id,
      userId: appointmentExists.userId,
      status: appointmentExists.status,
      consultant: appointmentExists.consultant?.name
    } : 'Aucune')

    // Maintenant avec tous les filtres
    const appointment = await (prisma as any).appointment.findFirst({
      where: {
        id: appointmentId,
        userId: session.user.id,
        status: 'COMPLETED'
      },
      include: {
        consultant: {
          select: { id: true, name: true }
        }
      }
    })

    console.log('✅ Appointment avec filtres:', appointment ? 'Trouvée' : 'Non trouvée')

    if (!appointment) {
      let errorDetail = 'Consultation non trouvée'
      if (appointmentExists) {
        if (appointmentExists.userId !== session.user.id) {
          errorDetail = 'Cette consultation ne vous appartient pas'
        } else if (appointmentExists.status !== 'COMPLETED') {
          errorDetail = `Consultation non terminée (statut: ${appointmentExists.status})`
        }
      }
      
      console.log('❌ Erreur appointment:', errorDetail)
      return NextResponse.json({ 
        error: errorDetail
      }, { status: 404 })
    }

    // Vérifier qu'il n'y a pas déjà un feedback
    const existingFeedback = await prisma.consultationFeedback.findUnique({
      where: { appointmentId }
    })

    if (existingFeedback) {
      console.log('⚠️ Feedback déjà existant')
      return NextResponse.json({ 
        error: 'Un retour a déjà été soumis pour cette consultation' 
      }, { status: 409 })
    }

    // Créer le feedback
    const feedbackData = {
      appointmentId,
      rating: parseInt(rating),
      satisfactionLevel: parseInt(satisfactionLevel) || rating,
      wouldRecommend: Boolean(wouldRecommend),
      comments: comments || null,
      improvementAreas: improvementAreas || [],
      strengths: strengths || []
    }

    console.log('💾 Données à sauvegarder:', feedbackData)

    const feedback = await prisma.consultationFeedback.create({
      data: feedbackData,
      include: {
        appointment: {
          include: {
            consultant: {
              select: { id: true, name: true }
            }
          }
        }
      }
    })

    console.log('✅ Feedback créé:', feedback.id)

    // Si un suivi est demandé, créer une tâche pour le consultant
    if (followUpNeeded) {
      try {
        console.log(`📅 Suivi demandé pour consultation ${appointmentId}`)
      } catch (error) {
        console.error('Erreur création tâche de suivi:', error)
      }
    }

    // Réponse de succès
    return NextResponse.json({
      success: true,
      message: 'Retour enregistré avec succès',
      feedback: {
        id: feedback.id,
        rating: feedback.rating,
        consultantName: appointment.consultant?.name,
        createdAt: feedback.createdAt
      }
    })

  } catch (error) {
    console.error('❌ Erreur création feedback:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'enregistrement' },
      { status: 500 }
    )
  }
}

// GET: Récupérer les retours de l'utilisateur connecté
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')

    let whereCondition: any = {
      appointment: {
        userId: session.user.id
      }
    }

    if (appointmentId) {
      whereCondition.appointmentId = appointmentId
    }

    const feedbacks = await (prisma as any).consultationFeedback.findMany({
      where: whereCondition,
      include: {
        appointment: {
          include: {
            consultant: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedFeedbacks = feedbacks.map((feedback: any) => ({
      id: feedback.id,
      appointmentId: feedback.appointmentId,
      rating: feedback.rating,
      satisfactionLevel: feedback.satisfactionLevel,
      wouldRecommend: feedback.wouldRecommend,
      comments: feedback.comments,
      improvementAreas: feedback.improvementAreas,
      strengths: feedback.strengths,
      followUpNeeded: feedback.followUpNeeded,
      createdAt: feedback.createdAt,
      appointment: {
        id: feedback.appointment.id,
        title: feedback.appointment.title,
        date: feedback.appointment.scheduledAt,
        consultant: feedback.appointment.consultant
      }
    }))

    return NextResponse.json({
      feedbacks: formattedFeedbacks,
      total: feedbacks.length
    })

  } catch (error) {
    console.error('Erreur récupération feedbacks:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 