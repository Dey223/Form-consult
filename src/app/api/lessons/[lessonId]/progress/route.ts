import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est un employé
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'EMPLOYE') {
      return NextResponse.json({ 
        error: 'Seuls les employés peuvent enregistrer leur progression' 
      }, { status: 403 })
    }

    const { watchedSeconds, isCompleted } = await request.json()
    const { lessonId } = await params

    // Vérifier que la leçon existe et que l'employé y a accès (inscrit à la formation)
    const lesson = await prisma.lesson.findFirst({
      where: { 
        id: lessonId,
        section: {
          formation: {
            userFormations: { 
              some: { 
                userId: session.user.id,
                // S'assurer que l'employé est bien inscrit et actif
                user: { role: 'EMPLOYE' }
              } 
            }
          }
        }
      },
      include: {
        section: {
          select: {
            formation: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    })

    if (!lesson) {
      return NextResponse.json({ 
        error: 'Leçon non trouvée ou accès non autorisé pour cet employé' 
      }, { status: 404 })
    }

    // Mettre à jour ou créer le progrès de l'employé
    const progress = await prisma.userLessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lessonId,
        },
      },
      update: {
        watchedSeconds: Math.max(watchedSeconds || 0, 0),
        isCompleted: isCompleted || false,
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        userId: session.user.id,
        lessonId: lessonId,
        watchedSeconds: Math.max(watchedSeconds || 0, 0),
        isCompleted: isCompleted || false,
        completedAt: isCompleted ? new Date() : null,
      },
    })

    // Calculer la progression globale de la formation pour cet employé
    await updateFormationProgress(session.user.id, lesson.section.formation.id)

    return NextResponse.json({
      ...progress,
      message: 'Progression enregistrée avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du progrès:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est un employé
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'EMPLOYE') {
      return NextResponse.json({ 
        error: 'Seuls les employés peuvent enregistrer leur progression' 
      }, { status: 403 })
    }

    const { watchedSeconds, isCompleted } = await request.json()
    const { lessonId } = await params

    // Vérifier que la leçon existe et que l'employé y a accès (inscrit à la formation)
    const lesson = await prisma.lesson.findFirst({
      where: { 
        id: lessonId,
        section: {
          formation: {
            userFormations: { 
              some: { 
                userId: session.user.id,
                // S'assurer que l'employé est bien inscrit
                user: { role: 'EMPLOYE' }
              } 
            }
          }
        }
      },
      include: {
        section: {
          select: {
            formation: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    })

    if (!lesson) {
      return NextResponse.json({ 
        error: 'Leçon non trouvée ou accès non autorisé pour cet employé' 
      }, { status: 404 })
    }

    // Mettre à jour ou créer le progrès de l'employé
    const progress = await prisma.userLessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lessonId,
        },
      },
      update: {
        watchedSeconds: Math.max(watchedSeconds || 0, 0),
        isCompleted: isCompleted || false,
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        userId: session.user.id,
        lessonId: lessonId,
        watchedSeconds: Math.max(watchedSeconds || 0, 0),
        isCompleted: isCompleted || false,
        completedAt: isCompleted ? new Date() : null,
      },
    })

    // Calculer la progression globale de la formation pour cet employé
    await updateFormationProgress(session.user.id, lesson.section.formation.id)

    return NextResponse.json({
      ...progress,
      message: 'Progression enregistrée avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du progrès:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// Fonction pour mettre à jour la progression globale de la formation
async function updateFormationProgress(userId: string, formationId: string) {
  try {
    // Récupérer toutes les leçons de la formation
    const formation = await prisma.formation.findUnique({
      where: { id: formationId },
      include: {
        sections: {
          include: {
            lessons: {
              include: {
                userProgress: {
                  where: { userId: userId }
                }
              }
            }
          }
        }
      }
    })

    if (!formation) return

    // Calculer la progression
    const allLessons = formation.sections.flatMap(section => section.lessons)
    const completedLessons = allLessons.filter(lesson => 
      lesson.userProgress.some(progress => progress.isCompleted)
    )
    
    const progressPercentage = allLessons.length > 0 
      ? Math.round((completedLessons.length / allLessons.length) * 100)
      : 0

    // Mettre à jour UserFormation
    await prisma.userFormation.updateMany({
      where: {
        userId: userId,
        formationId: formationId
      },
      data: {
        progress: progressPercentage,
        completedAt: progressPercentage === 100 ? new Date() : null
      }
    })
  } catch (error) {
    console.error('Erreur mise à jour progression formation:', error)
  }
} 