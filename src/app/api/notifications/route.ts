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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unread') === 'true'

    const whereClause: any = {
      userId: session.user.id
    }

    if (unreadOnly) {
      whereClause.isRead = false
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    // Compter les notifications non lues
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false
      }
    })

    return NextResponse.json({
      notifications,
      unreadCount
    })

  } catch (error) {
    console.error('Erreur récupération notifications:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, markAllAsRead } = body

    if (markAllAsRead) {
      // Marquer toutes les notifications comme lues
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          isRead: false
        },
        data: {
          isRead: true
        }
      })
    } else if (notificationId) {
      // Marquer une notification spécifique comme lue
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId: session.user.id // Sécurité
        },
        data: {
          isRead: true
        }
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erreur mise à jour notifications:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')
    const deleteAll = searchParams.get('all') === 'true'

    if (deleteAll) {
      // Supprimer toutes les notifications de l'utilisateur
      await prisma.notification.deleteMany({
        where: {
          userId: session.user.id
        }
      })
      return NextResponse.json({ message: 'Toutes les notifications supprimées' })
    } else if (notificationId) {
      // Supprimer une notification spécifique
      await prisma.notification.delete({
        where: {
          id: notificationId,
          userId: session.user.id // Sécurité
        }
      })
      return NextResponse.json({ message: 'Notification supprimée' })
    } else {
      return NextResponse.json({ error: 'ID de notification requis' }, { status: 400 })
    }

  } catch (error) {
    console.error('Erreur suppression notifications:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const { type, title, message, targetUserId, data } = await request.json()

    // Créer la notification
    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        userId: targetUserId || user.id,
        data: data ? JSON.stringify(data) : undefined,
        isRead: false
      }
    })

    return NextResponse.json({ notification })

  } catch (error) {
    console.error('Erreur création notification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la notification' },
      { status: 500 }
    )
  }
} 