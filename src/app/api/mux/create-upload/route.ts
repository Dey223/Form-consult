import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createMuxUploadUrl } from '@/lib/mux'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'FORMATEUR') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { filename, lessonData } = body
    const { formationId, sectionId, title, description, orderIndex } = lessonData

    if (!formationId || !sectionId || !title) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Vérifier que la formation appartient au formateur
    const formation = await prisma.formation.findFirst({
      where: {
        id: formationId,
        authorId: session.user.id
      }
    })

    if (!formation) {
      return NextResponse.json({ error: 'Formation non trouvée ou non autorisée' }, { status: 404 })
    }

    // Calculer le prochain orderIndex disponible pour cette section
    const maxOrderIndex = await prisma.lesson.aggregate({
      where: { sectionId },
      _max: { orderIndex: true }
    })
    
    const nextOrderIndex = (maxOrderIndex._max.orderIndex || 0) + 1

    // Créer l'URL d'upload Mux
    const muxUpload = await createMuxUploadUrl()

    // Créer la leçon en base de données
    const lesson = await prisma.lesson.create({
      data: {
        sectionId,
        title,
        description: description || '',
        orderIndex: orderIndex || nextOrderIndex,
        duration: 0, // Sera mis à jour par le webhook Mux
        type: 'VIDEO',
        muxAssetId: null, // Sera mis à jour par le webhook Mux
        muxPlaybackId: null, // Sera mis à jour par le webhook Mux
        isActive: false // Sera activé quand la vidéo sera prête
      }
    })

    // Stocker l'association entre l'upload Mux et la leçon
    // Note: Dans un cas réel, vous voudriez stocker cette association en base
    // Pour cette démo, nous utilisons le metadata de Mux
    
    return NextResponse.json({
      uploadUrl: muxUpload.url,
      lessonId: lesson.id,
      message: 'Upload créé avec succès'
    })

  } catch (error) {
    console.error('Erreur création upload Mux:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 