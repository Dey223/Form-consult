import Mux from '@mux/mux-node'

export const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
})

export const { video } = mux;

export interface MuxAsset {
  id: string
  status: string
  playback_ids: Array<{
    id: string
    policy: 'public' | 'signed'
  }>
  duration?: number
  aspect_ratio?: string
  tracks?: Array<{
    type: 'video' | 'audio'
    duration: number
  }>
}

export interface MuxUploadUrl {
  url: string
  id: string
}

// Créer un nouvel asset Mux depuis une URL
export async function createMuxAsset(url: string): Promise<MuxAsset> {
  try {
    const asset = await video.assets.create({
      input: [{ url }],
      playback_policy: ['public'],
      normalize_audio: true,
    })
    
    return asset as MuxAsset
  } catch (error) {
    console.error('Erreur création asset Mux:', error)
    throw new Error('Impossible de créer l\'asset Mux')
  }
}

// Créer une URL d'upload direct
export async function createMuxUploadUrl(): Promise<MuxUploadUrl> {
  try {
    const upload = await video.uploads.create({
      cors_origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      new_asset_settings: {
        playback_policy: ['public'],
        normalize_audio: true,
      },
    })
    
    return {
      url: upload.url,
      id: upload.id,
    }
  } catch (error) {
    console.error('Erreur création upload URL Mux:', error)
    throw new Error('Impossible de créer l\'URL d\'upload')
  }
}

// Récupérer les informations d'un asset
export async function getMuxAsset(assetId: string): Promise<MuxAsset> {
  try {
    const asset = await video.assets.retrieve(assetId)
    return asset as MuxAsset
  } catch (error) {
    console.error('Erreur récupération asset Mux:', error)
    throw new Error('Asset Mux non trouvé')
  }
}

// Supprimer un asset
export async function deleteMuxAsset(assetId: string): Promise<void> {
  try {
    await video.assets.delete(assetId)
  } catch (error) {
    console.error('Erreur suppression asset Mux:', error)
    throw new Error('Impossible de supprimer l\'asset Mux')
  }
}

// Créer un signed URL pour la lecture privée
export async function createSignedUrl(
  playbackId: string,
  options: {
    expiration?: number // timestamp
    type?: 'video' | 'thumbnail' | 'gif'
  } = {}
): Promise<string> {
  try {
    if (!process.env.MUX_SIGNING_KEY) {
      throw new Error('MUX_SIGNING_KEY non configuré')
    }

    const jwt = Mux.JWT.signPlaybackId(playbackId, {
      keyId: process.env.MUX_SIGNING_KEY_ID!,
      keySecret: process.env.MUX_SIGNING_KEY!,
      expiration: options.expiration || Math.floor(Date.now() / 1000) + 3600, // 1h par défaut
      type: options.type || 'video',
    })
    
    return `https://stream.mux.com/${playbackId}.m3u8?token=${jwt}`
  } catch (error) {
    console.error('Erreur création signed URL:', error)
    throw new Error('Impossible de créer l\'URL signée')
  }
}

// Générer une thumbnail d'une vidéo
export function getMuxThumbnail(
  playbackId: string,
  options: {
    time?: number // secondes
    width?: number
    height?: number
    fit_mode?: 'preserve' | 'stretch' | 'crop'
  } = {}
): string {
  const params = new URLSearchParams()
  
  if (options.time) params.append('time', options.time.toString())
  if (options.width) params.append('width', options.width.toString())
  if (options.height) params.append('height', options.height.toString())
  if (options.fit_mode) params.append('fit_mode', options.fit_mode)
  
  return `https://image.mux.com/${playbackId}/thumbnail.png?${params.toString()}`
}

// Webhook pour traiter les événements Mux
export function verifyMuxWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  try {
    return Mux.Webhooks.verifyHeader(rawBody, signature, secret)
  } catch (error) {
    console.error('Erreur vérification webhook Mux:', error)
    return false
  }
} 