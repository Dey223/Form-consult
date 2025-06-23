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

    // Récupérer l'utilisateur actuel pour obtenir son entreprise
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!currentUser?.companyId) {
      return NextResponse.json({ error: 'Aucune entreprise associée' }, { status: 400 })
    }

    // Récupérer tous les employés de l'entreprise (seulement les employés, pas les formateurs)
    const employees = await prisma.user.findMany({
      where: {
        companyId: currentUser.companyId,
        role: 'EMPLOYE' // Seuls les employés appartiennent aux entreprises
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        userFormations: {
          include: {
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

    return NextResponse.json(employees)

  } catch (error) {
    console.error('Erreur récupération employés:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' }, 
      { status: 500 }
    )
  }
}
