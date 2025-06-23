import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    let users: any[]

    if (session.user.role === 'SUPER_ADMIN') {
      // Super admin peut voir tous les utilisateurs
      const whereClause: any = {}
      if (role) {
        whereClause.role = role
      }

      users = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          company: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })

      return NextResponse.json(users.map(user => ({
        id: user.id,
        name: user.name || 'Utilisateur',
        email: user.email,
        role: user.role,
        company: user.company,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      })))

    } else if (session.user.role === 'ADMIN_ENTREPRISE' && session.user.companyId) {
      // Admin entreprise peut voir les membres de son entreprise
      users = await prisma.user.findMany({
        where: {
          companyId: session.user.companyId,
          // Exclure l'admin lui-même
          id: { not: session.user.id }
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          userFormations: {
            select: {
              formationId: true,
              progress: true,
              completedAt: true,
              formation: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })

      return NextResponse.json(users.map(user => ({
        id: user.id,
        name: user.name || 'Utilisateur',
        email: user.email,
        role: user.role,
        userFormations: user.userFormations,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      })))

    } else {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
    }

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 