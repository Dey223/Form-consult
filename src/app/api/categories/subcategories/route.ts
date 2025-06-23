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
    const { name, description, categoryId } = body

    if (!name?.trim() || !categoryId) {
      return NextResponse.json({ 
        error: 'Le nom de la sous-catégorie et la catégorie parente sont requis' 
      }, { status: 400 })
    }

    // Vérifier que la catégorie parente existe
    const parentCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!parentCategory) {
      return NextResponse.json({ error: 'Catégorie parente introuvable' }, { status: 404 })
    }

    // Vérifier si la sous-catégorie existe déjà dans cette catégorie
    const existingSubCategory = await prisma.subCategory.findFirst({
      where: { 
        name: name.trim(),
        categoryId: categoryId
      }
    })

    if (existingSubCategory) {
      return NextResponse.json({ 
        error: 'Une sous-catégorie avec ce nom existe déjà dans cette catégorie' 
      }, { status: 409 })
    }

    // Créer la nouvelle sous-catégorie
    const subCategory = await prisma.subCategory.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        categoryId: categoryId
      }
    })

    return NextResponse.json({
      message: 'Sous-catégorie créée avec succès',
      subCategory
    })

  } catch (error) {
    console.error('Erreur création sous-catégorie:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 