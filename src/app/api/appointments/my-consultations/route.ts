import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Récupération des consultations employé')
    
    // Vérifier la session
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      console.log('❌ Session non trouvée')
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    console.log('👤 Session utilisateur:', {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role
    })

    // Vérifier que l'utilisateur est un employé ou admin
    if (!['EMPLOYE', 'ADMIN_ENTREPRISE', 'SUPER_ADMIN'].includes(session.user.role)) {
      console.log('❌ Rôle non autorisé:', session.user.role)
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Récupérer les consultations de l'utilisateur
    // Utilisation de (prisma as any) pour éviter les erreurs TypeScript temporairement
    const appointments = await (prisma as any).appointment.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        consultant: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        feedback: {
          select: {
            id: true,
            rating: true,
            satisfactionLevel: true,
            wouldRecommend: true,
            comments: true,
            createdAt: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            company: {
              select: {
                id: true,
                name: true
              }
            }
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
        scheduledAt: 'desc'
      }
    })

    console.log(`📋 Trouvé ${appointments.length} consultations pour l'employé`)

    // Formater les données pour le frontend
    const formattedAppointments = appointments.map((appointment: any) => ({
      id: appointment.id,
      title: appointment.title || 'Consultation',
      description: appointment.description,
      consultantName: appointment.consultant?.name || appointment.consultant?.email || 'Consultant inconnu',
      consultantId: appointment.consultantId,
      date: appointment.scheduledAt.toISOString(),
      duration: appointment.duration || 60,
      status: appointment.status,
      company: appointment.company?.name || appointment.user?.company?.name || 'Entreprise',
      meetingUrl: appointment.meetingUrl,
      hasFeedback: !!appointment.feedback,
      feedback: appointment.feedback ? {
        id: appointment.feedback.id,
        rating: appointment.feedback.rating,
        satisfactionLevel: appointment.feedback.satisfactionLevel,
        wouldRecommend: appointment.feedback.wouldRecommend,
        comments: appointment.feedback.comments,
        createdAt: appointment.feedback.createdAt.toISOString()
      } : undefined
    }))

    return NextResponse.json({ 
      appointments: formattedAppointments,
      count: formattedAppointments.length
    })

  } catch (error) {
    console.error('❌ Erreur API consultations:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des consultations' },
      { status: 500 }
    )
  }
} 