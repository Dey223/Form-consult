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

    if (session.user.role !== 'EMPLOYE') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const userId = session.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            website: true,
            logo: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const consultations = await prisma.appointment.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const userFormations = await prisma.userFormation.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    })

    const formationIds = userFormations.map(uf => uf.formationId)
    const formations = formationIds.length > 0 ? await prisma.formation.findMany({
      where: { id: { in: formationIds } }
    }) : []

    const stats = {
      totalConsultations: consultations.length,
      pendingConsultations: consultations.filter(c => c.status === 'PENDING').length,
      completedConsultations: consultations.filter(c => c.status === 'COMPLETED').length,
      totalFormations: userFormations.length,
      completedFormations: userFormations.filter(f => f.progress === 100).length,
      inProgressFormations: userFormations.filter(f => f.progress > 0 && f.progress < 100).length
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    const upcomingConsultations = consultations
      .filter(c => c.status === 'CONFIRMED' && new Date(c.scheduledAt) > new Date())
      .slice(0, 3)

    const formationsWithProgress = userFormations.map(uf => {
      const formation = formations.find(f => f.id === uf.formationId)
      return {
        id: formation?.id || uf.formationId,
        title: formation?.title || 'Formation',
        description: formation?.description || '',
        price: formation?.price || 0,
        level: formation?.level || 'BEGINNER',
        createdAt: formation?.createdAt || uf.createdAt,
        enrolledAt: uf.createdAt,
        progress: uf.progress,
        completedAt: uf.completedAt
      }
    })

    const dashboardData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company ? {
          id: user.company.id,
          name: user.company.name,
          email: user.company.email,
          phone: user.company.phone,
          address: user.company.address,
          website: user.company.website,
          logo: user.company.logo
        } : null
      },
      stats,
      recentConsultations: consultations.slice(0, 5),
      upcomingConsultations,
      formations: formationsWithProgress,
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt
      }))
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Erreur dashboard employé:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 