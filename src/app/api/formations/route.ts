import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createFormationSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  categoryId: z.string().min(1),
  subCategoryId: z.string().min(1),
  levelId: z.string().optional(),
  price: z.number().min(0).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const authorId = searchParams.get('authorId')

    // Logique spéciale pour les admin d'entreprise
    if (session.user.role === 'ADMIN_ENTREPRISE' && session.user.companyId) {
      const formations = await prisma.formation.findMany({
        where: {
          isPublished: true
        },
        include: {
          category: true,
          subCategory: true,
          levelRelation: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          sections: {
            include: {
              lessons: true,
            },
          },
          userFormations: {
            where: {
              user: {
                companyId: session.user.companyId
              }
            },
            include: {
              user: true
            }
          },
          _count: {
            select: {
              sections: true,
              userFormations: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' }
      })

      // Transformer les données pour inclure les statistiques spécifiques à l'entreprise
      const formationsWithStats = formations.map(formation => {
        // Calculer la durée totale des leçons
        const totalDuration = formation.sections.reduce((sectionSum, section) => {
          return sectionSum + section.lessons.reduce((lessonSum, lesson) => {
            return lessonSum + (lesson.duration || 0)
          }, 0)
        }, 0)

        // Statistiques pour cette entreprise
        const enrolledCount = formation.userFormations.length
        const completedCount = formation.userFormations.filter(uf => uf.completedAt).length
        const totalProgress = formation.userFormations.reduce((sum, uf) => sum + uf.progress, 0)
        const averageProgress = enrolledCount > 0 ? Math.round(totalProgress / enrolledCount) : 0

        return {
          ...formation,
          duration: totalDuration,
          enrolledCount,
          completedCount,
          averageProgress
        }
      })

      return NextResponse.json(formationsWithStats)
    }

    // Logique originale pour les autres rôles
    const whereClause = session.user.role === 'FORMATEUR' 
      ? { authorId: session.user.id }
      : authorId 
        ? { authorId } 
        : {}

    const formations = await prisma.formation.findMany({
      where: whereClause,
      include: {
        category: true,
        subCategory: true,
        levelRelation: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sections: {
          include: {
            lessons: true,
          },
        },
        userFormations: true,
        _count: {
          select: {
            sections: true,
            userFormations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(formations)

  } catch (error) {
    console.error('Erreur lors de la récupération des formations:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'FORMATEUR') {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createFormationSchema.parse(body)

    // Créer la formation
    const formation = await prisma.formation.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        categoryId: validatedData.categoryId,
        subCategoryId: validatedData.subCategoryId,
        levelId: validatedData.levelId || null,
        price: validatedData.price || 0,
        authorId: session.user.id,
        level: 'DEBUTANT', // Niveau par défaut
        isActive: true, // Inactive par défaut jusqu'à publication
        isPublished: false,
      },
      include: {
        category: true,
        subCategory: true,
        levelRelation: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(formation, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création de la formation:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 