import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyMuxWebhookSignature } from '@/lib/mux'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('mux-signature')

    if (!signature || !process.env.MUX_WEBHOOK_SECRET) {
      console.error('❌ Mux signature ou secret manquant')
      return NextResponse.json(
        { error: 'Signature manquante' },
        { status: 400 }
      )
    }

    // Vérifier la signature du webhook
    const isValid = verifyMuxWebhookSignature(body, signature, process.env.MUX_WEBHOOK_SECRET)
    
    if (!isValid) {
      console.error('❌ Signature Mux invalide')
      return NextResponse.json(
        { error: 'Signature invalide' },
        { status: 400 }
      )
    }

    const event = JSON.parse(body)
    console.log(`🎬 Webhook Mux reçu: ${event.type}`)

    switch (event.type) {
      case 'video.asset.ready':
        await handleAssetReady(event.data)
        break

      case 'video.asset.errored':
        await handleAssetErrored(event.data)
        break

      case 'video.upload.asset_created':
        await handleUploadAssetCreated(event.data)
        break

      case 'video.asset.deleted':
        await handleAssetDeleted(event.data)
        break

      default:
        console.log(`⚠️ Événement Mux non géré: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Erreur webhook Mux:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

async function handleAssetReady(data: any) {
  console.log('✅ Asset Mux prêt:', data.id)
  
  try {
    const assetId = data.id
    const playbackIds = data.playback_ids || []
    const duration = data.duration || 0

    // Trouver la leçon correspondante
    const lesson = await prisma.lesson.findFirst({
      where: { muxAssetId: assetId }
    })

    if (lesson) {
      // Mettre à jour la leçon avec l'ID de lecture et la durée
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          muxPlaybackId: playbackIds[0]?.id || null,
          duration: Math.round(duration), // Convertir en secondes entières
          isActive: true
        }
      })

      console.log(`✅ Leçon ${lesson.id} mise à jour avec playback ID: ${playbackIds[0]?.id}`)
    } else {
      console.warn(`⚠️ Aucune leçon trouvée pour l'asset Mux: ${assetId}`)
    }
  } catch (error) {
    console.error('❌ Erreur traitement asset ready:', error)
  }
}

async function handleAssetErrored(data: any) {
  console.log('❌ Erreur asset Mux:', data.id)
  
  try {
    const assetId = data.id
    const errors = data.errors || []

    // Trouver la leçon correspondante
    const lesson = await prisma.lesson.findFirst({
      where: { muxAssetId: assetId }
    })

    if (lesson) {
      // Marquer la leçon comme inactive en cas d'erreur
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          isActive: false
        }
      })

      console.error(`❌ Erreur pour la leçon ${lesson.id}:`, errors)
    }
  } catch (error) {
    console.error('❌ Erreur traitement asset errored:', error)
  }
}

async function handleUploadAssetCreated(data: any) {
  console.log('📁 Upload Mux terminé, asset créé:', data.asset_id)
  
  try {
    const assetId = data.asset_id
    const uploadId = data.id

    // On pourrait ici mettre à jour une table de tracking des uploads
    // ou envoyer une notification à l'utilisateur
    console.log(`📁 Upload ${uploadId} -> Asset ${assetId}`)
  } catch (error) {
    console.error('❌ Erreur traitement upload asset created:', error)
  }
}

async function handleAssetDeleted(data: any) {
  console.log('🗑️ Asset Mux supprimé:', data.id)
  
  try {
    const assetId = data.id

    // Nettoyer les références dans la base de données
    await prisma.lesson.updateMany({
      where: { muxAssetId: assetId },
      data: {
        muxAssetId: null,
        muxPlaybackId: null,
        isActive: false
      }
    })

    console.log(`🗑️ Références à l'asset ${assetId} supprimées`)
  } catch (error) {
    console.error('❌ Erreur traitement asset deleted:', error)
  }
} 