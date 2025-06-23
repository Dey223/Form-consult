import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Fonction pour créer une notification
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
        data: data ? JSON.stringify(data) : undefined,
        isRead: false
      }
    })
    console.log(`✅ Notification créée pour ${userId}: ${title}`)
  } catch (error) {
    console.error('❌ Erreur création notification:', error)
  }
}

const updateFormationSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  overview: z.string().optional(),
  categoryId: z.string().optional(),
  subCategoryId: z.string().optional(),
  levelId: z.string().optional(),
  price: z.number().min(0).optional(),
  thumbnail: z.string().optional(),
  isPublished: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { formationId } = await params

    // Récupérer l'utilisateur pour vérifier son rôle
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    // Construire les conditions de recherche selon le rôle
    let whereCondition;
    
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'CONSULTANT' || user?.role === 'ADMIN_ENTREPRISE') {
      // Super Admin et Consultant : accès à toutes les formations
      whereCondition = { id: formationId }
    } else {
      // Autres rôles : accès selon les conditions
      whereCondition = {
        id: formationId,
        OR: [
          { authorId: session.user.id }, // Auteur de la formation
          { 
            userFormations: {
              some: {
                userId: session.user.id
              }
            }
          } // Employé inscrit à la formation
        ]
      }
    }

    const formation = await prisma.formation.findFirst({
      where: whereCondition,
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
            lessons: {
              include: {
                muxData: true,
                userProgress: {
                  where: {
                    userId: session.user.id,
                  },
                },
              },
              orderBy: { orderIndex: 'asc' },
            },
            resources: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
        resources: true,
        quizzes: true,
        userFormations: {
          where: {
            userId: session.user.id,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            sections: true,
            userFormations: true,
          },
        },
      },
    })

    if (!formation) {
      return NextResponse.json(
        { error: 'Formation non trouvée' },
        { status: 404 }
      )
    }

    const userFormation = formation.userFormations[0]
    const isAuthor = formation.authorId === session.user.id
    const isEnrolled = !!userFormation
    const isPublished = formation.isPublished
    const isConsultant = user?.role === 'CONSULTANT'
    const isSuperAdmin = user?.role === 'SUPER_ADMIN'

    // Permissions d'accès : auteur, inscrit, formation publiée, consultant ou super admin
    if (!isAuthor && !isEnrolled && !isPublished && !isConsultant && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }

    const allLessons = formation.sections.flatMap(section => section.lessons)
    const totalLessons = allLessons.length
    const completedLessons = allLessons.filter(lesson => 
      lesson.userProgress[0]?.isCompleted
    ).length
    const totalDuration = allLessons.reduce((sum, lesson) => sum + lesson.duration, 0)
    const watchedDuration = allLessons.reduce((sum, lesson) => 
      sum + (lesson.userProgress[0]?.watchedSeconds || 0), 0
    )

    const enrichedSections = formation.sections.map(section => ({
      ...section,
      lessons: section.lessons.map(lesson => {
        const progress = lesson.userProgress[0]
        const watchedSeconds = progress?.watchedSeconds || 0
        const watchedPercentage = lesson.duration > 0 
          ? Math.round((watchedSeconds / lesson.duration) * 100) 
          : 0

        return {
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          orderIndex: lesson.orderIndex,
          duration: lesson.duration,
          type: lesson.type,
          muxPlaybackId: lesson.muxPlaybackId,
          isCompleted: progress?.isCompleted || false,
          watchedSeconds,
          watchedPercentage: Math.min(watchedPercentage, 100),
          content: lesson.content,
        }
      }),
    }))

    const enrichedFormation = {
      id: formation.id,
      title: formation.title,
      description: formation.description,
      overview: formation.overview,
      level: formation.level,
      thumbnail: formation.thumbnail,
      totalLessons,
      completedLessons,
      totalDuration,
      watchedDuration,
      progressPercentage: totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100) 
        : 0,
      isEnrolled,
      isCompleted: userFormation?.completedAt ? true : false,
      sections: enrichedSections,
      resources: formation.resources,
      quizzes: formation.quizzes,
      author: formation.author,
      category: formation.category,
      createdAt: formation.createdAt,
    }

    return NextResponse.json(enrichedFormation)

  } catch (error) {
    console.error('Erreur lors de la récupération de la formation:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ formationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { formationId } = await params

    const existingFormation = await prisma.formation.findUnique({
      where: { id: formationId },
      select: { 
        authorId: true, 
        isPublished: true,
        title: true
      },
    })

    if (!existingFormation) {
      return NextResponse.json(
        { error: 'Formation non trouvée' },
        { status: 404 }
      )
    }

    if (
      session.user.role === 'FORMATEUR' &&
      existingFormation.authorId !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateFormationSchema.parse(body)

    // Validation des clés étrangères avant la mise à jour
    if (validatedData.categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: validatedData.categoryId }
      })
      if (!categoryExists) {
        return NextResponse.json(
          { error: 'Catégorie introuvable' },
          { status: 400 }
        )
      }
    }

    if (validatedData.subCategoryId) {
      const subCategoryExists = await prisma.subCategory.findUnique({
        where: { id: validatedData.subCategoryId }
      })
      if (!subCategoryExists) {
        return NextResponse.json(
          { error: 'Sous-catégorie introuvable' },
          { status: 400 }
        )
      }
    }

    if (validatedData.levelId) {
      const levelExists = await prisma.level.findUnique({
        where: { id: validatedData.levelId }
      })
      if (!levelExists) {
        return NextResponse.json(
          { error: 'Niveau introuvable' },
          { status: 400 }
        )
      }
    }

    const updatedFormation = await prisma.formation.update({
      where: { id: formationId },
      data: {
        ...validatedData,
        updatedAt: new Date(),
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

    // Détecter si la formation vient d'être publiée (passage de false à true)
    if (validatedData.isPublished === true && existingFormation.isPublished === false) {
      // Envoyer notification aux ADMIN_ENTREPRISE pour informer de la nouvelle formation publiée
      try {
        const adminEntreprises = await prisma.user.findMany({
          where: { role: 'ADMIN_ENTREPRISE' },
          select: { id: true, name: true }
        })

        const notificationPromises = adminEntreprises.map(admin => 
          createNotification(
            admin.id,
            'formation_published',
            '📚 Nouvelle formation disponible',
            `Une nouvelle formation "${existingFormation.title}" vient d'être publiée par ${updatedFormation.author?.name || 'un formateur'}. Elle est maintenant disponible pour vos équipes.`,
            {
              formationId: formationId,
              formationTitle: existingFormation.title,
              authorName: updatedFormation.author?.name || 'Formateur',
              category: updatedFormation.category?.name,
              level: updatedFormation.level
            }
          )
        )

        await Promise.all(notificationPromises)
        console.log(`✅ ${adminEntreprises.length} notifications envoyées aux admin entreprise`)
      } catch (notificationError) {
        console.error('❌ Erreur lors de l\'envoi des notifications:', notificationError)
        // Ne pas faire échouer la requête principale
      }
    }

    return NextResponse.json(updatedFormation)

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la formation:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ formationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { formationId } = await params

    const existingFormation = await prisma.formation.findUnique({
      where: { id: formationId },
      select: { authorId: true },
    })

    if (!existingFormation) {
      return NextResponse.json(
        { error: 'Formation non trouvée' },
        { status: 404 }
      )
    }

    if (
      session.user.role === 'FORMATEUR' &&
      existingFormation.authorId !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }

    await prisma.formation.delete({
      where: { id: formationId },
    })

    return NextResponse.json({ message: 'Formation supprimée avec succès' })

  } catch (error) {
    console.error('Erreur lors de la suppression de la formation:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 