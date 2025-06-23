import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est super admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Le nom de la catégorie est requis' }, { status: 400 })
    }

    // Vérifier si la catégorie existe déjà
    const existingCategory = await prisma.category.findFirst({
      where: { name: name.trim() }
    })

    if (existingCategory) {
      return NextResponse.json({ error: 'Une catégorie avec ce nom existe déjà' }, { status: 409 })
    }

    // Créer la nouvelle catégorie
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null
      }
    })

    return NextResponse.json({
      message: 'Catégorie créée avec succès',
      category
    })

  } catch (error) {
    console.error('Erreur création catégorie:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subCategories: {
          select: { id: true, name: true }
        },
        _count: {
          select: { formations: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(categories)

  } catch (error) {
    console.error('Erreur récupération catégories:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 