import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getMuxAsset } from '@/lib/mux'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { lessonId } = await params

    // Récupérer la leçon
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            formation: {
              select: {
                id: true,
                authorId: true
              }
            }
          }
        }
      }
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Leçon non trouvée' }, { status: 404 })
    }

    // Vérifier les permissions
    const isAuthor = lesson.section.formation.authorId === session.user.id
    const isFormateur = session.user.role === 'FORMATEUR'
    
    if (!isAuthor && !isFormateur && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Si la leçon a un asset Mux, vérifier son statut
    let muxStatus = 'unknown'
    if (lesson.muxAssetId) {
      try {
        const muxAsset = await getMuxAsset(lesson.muxAssetId)
        muxStatus = muxAsset.status
      } catch (error) {
        console.error('Erreur récupération asset Mux:', error)
      }
    }

    return NextResponse.json({
      lessonId: lesson.id,
      title: lesson.title,
      status: lesson.isActive ? 'ready' : (lesson.muxAssetId ? muxStatus : 'pending'),
      muxAssetId: lesson.muxAssetId,
      muxPlaybackId: lesson.muxPlaybackId,
      duration: lesson.duration,
      isActive: lesson.isActive
    })

  } catch (error) {
    console.error('Erreur récupération statut leçon:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 