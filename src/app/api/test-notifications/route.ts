import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Créer une notification de test
    const notification = await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'test',
        title: 'Test de notification',
        message: 'Ceci est un test pour vérifier que les notifications fonctionnent correctement.',
        data: JSON.stringify({ test: true }),
        isRead: false
      }
    })

    return NextResponse.json({
      message: 'Notification de test créée',
      notification
    })

  } catch (error) {
    console.error('Erreur test notifications:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Compter les notifications de l'utilisateur
    const notificationCount = await prisma.notification.count({
      where: { userId: session.user.id }
    })

    const unreadCount = await prisma.notification.count({
      where: { 
        userId: session.user.id,
        isRead: false 
      }
    })

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    return NextResponse.json({
      userId: session.user.id,
      userRole: session.user.role,
      notificationCount,
      unreadCount,
      recentNotifications: notifications
    })

  } catch (error) {
    console.error('Erreur récupération test:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    )
  }
} 