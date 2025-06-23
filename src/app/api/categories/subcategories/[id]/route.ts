import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est Super Admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ 
        error: 'Seuls les super admins peuvent supprimer des sous-catégories' 
      }, { status: 403 })
    }

    const { id } = await params

    // Vérifier que la sous-catégorie existe
    const subCategory = await prisma.subCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { formations: true }
        }
      }
    })

    if (!subCategory) {
      return NextResponse.json({ 
        error: 'Sous-catégorie non trouvée' 
      }, { status: 404 })
    }

    // Vérifier qu'aucune formation n'utilise cette sous-catégorie
    if (subCategory._count.formations > 0) {
      return NextResponse.json({ 
        error: `Impossible de supprimer la sous-catégorie. ${subCategory._count.formations} formation(s) l'utilisent encore.` 
      }, { status: 400 })
    }

    // Supprimer la sous-catégorie
    await prisma.subCategory.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Sous-catégorie supprimée avec succès' 
    })
  } catch (error) {
    console.error('Erreur suppression sous-catégorie:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 