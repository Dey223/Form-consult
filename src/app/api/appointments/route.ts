import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Fonction helper pour créer une notification
async function createNotification(
  userId: string, 
  type: string, 
  title: string, 
  message: string, 
  data?: any
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data || null,
        isRead: false
      }
    })
  } catch (error) {
    console.error('Erreur création notification:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, scheduledAt, duration = 60 } = body

    if (!title || !scheduledAt) {
      return NextResponse.json({ error: 'Titre et date requis' }, { status: 400 })
    }

    // Vérifier que l'utilisateur peut créer des rendez-vous
    if (session.user.role === 'EMPLOYE' && !session.user.companyId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    let companyId = session.user.companyId
    
    // Si c'est un admin entreprise, utiliser son companyId
    if (session.user.role === 'ADMIN_ENTREPRISE') {
      companyId = session.user.companyId!
    }

    // Créer le rendez-vous
    const appointment = await prisma.appointment.create({
      data: {
        title,
        description,
        scheduledAt: new Date(scheduledAt),
        duration,
        companyId: companyId!,
        userId: session.user.id,
        status: 'PENDING'
      },
      include: {
        user: true,
        company: true
      }
    })

    // Créer une notification pour les super admins
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' }
    })

    for (const admin of superAdmins) {
      await createNotification(
        admin.id,
        'consultation_request',
        'Nouvelle demande de consultation',
        `${session.user.name} de ${appointment.company.name} a demandé une consultation: "${title}"`,
        { appointmentId: appointment.id }
      )
    }

    return NextResponse.json({
      message: 'Demande de consultation créée avec succès',
      appointment
    })

  } catch (error) {
    console.error('Erreur création rendez-vous:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    let whereClause: any = {}

    // Filtrer selon le rôle
    if (session.user.role === 'ADMIN_ENTREPRISE' || session.user.role === 'EMPLOYE') {
      whereClause.companyId = session.user.companyId
    } else if (session.user.role === 'CONSULTANT') {
      whereClause = {
        OR: [
          { consultantId: session.user.id },
          { status: 'PENDING' } // Les consultants voient aussi les demandes en attente
        ]
      }
    } else if (session.user.role === 'SUPER_ADMIN') {
      // Les super admins voient tout
    }

    // Filtrer par statut si spécifié
    if (status) {
      whereClause.status = status.toUpperCase()
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        consultant: {
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
      orderBy: [
        { createdAt: 'desc' },
        { scheduledAt: 'asc' }
      ],
      take: limit
    })

    return NextResponse.json({ appointments })

  } catch (error) {
    console.error('Erreur récupération rendez-vous:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { appointmentId, status, notes, meetingUrl, consultantId } = body

    if (!appointmentId) {
      return NextResponse.json({ error: 'ID du rendez-vous requis' }, { status: 400 })
    }

    // Vérifier que le rendez-vous existe
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { 
        user: true,
        consultant: true,
        company: true 
      }
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Rendez-vous non trouvé' }, { status: 404 })
    }
    // Vérifications d'autorisation
    const canModify = 
      (session.user.role === 'ADMIN_ENTREPRISE' && session.user.companyId === appointment.companyId) ||
      (session.user.role === 'CONSULTANT' && session.user.id === appointment.consultantId) ||
      (session.user.role === 'SUPER_ADMIN')

    if (!canModify) {
      return NextResponse.json({ error: 'Non autorisé à modifier ce rendez-vous' }, { status: 403 })
    }

    // Mettre à jour le rendez-vous
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        ...(status && { status }),
        ...(notes && { notes }),
        ...(meetingUrl && { meetingUrl }),
        ...(consultantId && { consultantId })
      },
      include: {
        user: true,
        consultant: true,
        company: true
      }
    })

    // Créer des notifications selon l'action
    if (status) {
      switch (status) {
        case 'ASSIGNED':
          if (consultantId) {
            await createNotification(
              consultantId,
              'consultation_assigned',
              'Nouvelle consultation assignée',
              `Une consultation "${appointment.title}" vous a été assignée`,
              { appointmentId: appointment.id }
            )
          }
          
          // Notifier le demandeur
          await createNotification(
            appointment.userId,
            'consultation_assigned',
            'Consultant assigné',
            `Un consultant a été assigné à votre demande "${appointment.title}"`,
            { appointmentId: appointment.id }
          )
          break

        case 'ACCEPTED':
          await createNotification(
            appointment.userId,
            'consultation_accepted',
            'Consultation acceptée',
            `Votre consultation "${appointment.title}" a été acceptée par le consultant`,
            { appointmentId: appointment.id }
          )
          break

        case 'REFUSED':
          await createNotification(
            appointment.userId,
            'consultation_refused',
            'Consultation refusée',
            `Votre consultation "${appointment.title}" a été refusée. Un autre consultant vous sera assigné.`,
            { appointmentId: appointment.id }
          )
          
          // Notifier les super admins pour réassignation
          const superAdmins = await prisma.user.findMany({
            where: { role: 'SUPER_ADMIN' }
          })

          for (const admin of superAdmins) {
            await createNotification(
              admin.id,
              'consultation_refused',
              'Consultation refusée - Réassignation nécessaire',
              `La consultation "${appointment.title}" a été refusée et nécessite une réassignation`,
              { appointmentId: appointment.id }
            )
          }
          break

        case 'COMPLETED':
          await createNotification(
            appointment.userId,
            'consultation_completed',
            'Consultation terminée',
            `Votre consultation "${appointment.title}" est terminée. Un rapport vous sera envoyé.`,
            { appointmentId: appointment.id }
          )
          break
      }
    }

    return NextResponse.json({
      message: 'Rendez-vous mis à jour avec succès',
      appointment: updatedAppointment
    })

  } catch (error) {
    console.error('Erreur mise à jour rendez-vous:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 