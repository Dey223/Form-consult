'use client'

import { useEffect, useRef } from 'react'
import MuxPlayer from '@mux/mux-player-react'

interface MuxVideoPlayerProps {
  playbackId: string
  lessonId: string
  onProgress?: (watchedSeconds: number) => void
  onComplete?: () => void
  className?: string
  autoplay?: boolean
  startTime?: number
}

export function MuxVideoPlayer({
  playbackId,
  lessonId,
  onProgress,
  onComplete,
  className = '',
  autoplay = false,
  startTime = 0
}: MuxVideoPlayerProps) {
  const playerRef = useRef<any>(null)
  const progressUpdateInterval = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const player = playerRef.current
    if (!player) return

    // Démarrer à un moment spécifique si fourni
    if (startTime > 0) {
      player.currentTime = startTime
    }

    // Écouter les événements du player
    const handleTimeUpdate = () => {
      if (onProgress && player.currentTime) {
        onProgress(Math.floor(player.currentTime))
      }
    }

    const handleEnded = () => {
      if (onComplete) {
        onComplete()
      }
    }

    const handleLoadedMetadata = () => {
      if (startTime > 0) {
        player.currentTime = startTime
      }
    }

    // Ajouter les event listeners
    player.addEventListener('timeupdate', handleTimeUpdate)
    player.addEventListener('ended', handleEnded)
    player.addEventListener('loadedmetadata', handleLoadedMetadata)

    // Mettre à jour la progression toutes les 5 secondes
    progressUpdateInterval.current = setInterval(() => {
      if (player.currentTime && onProgress) {
        onProgress(Math.floor(player.currentTime))
      }
    }, 5000)

    return () => {
      if (player) {
        player.removeEventListener('timeupdate', handleTimeUpdate)
        player.removeEventListener('ended', handleEnded)
        player.removeEventListener('loadedmetadata', handleLoadedMetadata)
      }
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current)
      }
    }
  }, [onProgress, onComplete, startTime])

  return (
    <div className={`relative ${className}`}>
      <MuxPlayer
        ref={playerRef}
        streamType="on-demand"
        playbackId={playbackId}
        autoPlay={autoplay}
        controls
        style={{
          height: '100%',
          maxWidth: '100%',
          aspectRatio: '16 / 9'
        }}
        thumbnailTime={0}
        primaryColor="#3B82F6"
        secondaryColor="#1E40AF"
      />
    </div>
  )
}

// Composant pour les thumbnails vidéo
interface VideoThumbnailProps {
  playbackId: string
  time?: number
  width?: number
  height?: number
  className?: string
  alt?: string
}

export function VideoThumbnail({
  playbackId,
  time = 0,
  width = 480,
  height = 270,
  className = '',
  alt = 'Video thumbnail'
}: VideoThumbnailProps) {
  const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.png?time=${time}&width=${width}&height=${height}&fit_mode=crop`

  return (
    <img
      src={thumbnailUrl}
      alt={alt}
      width={width}
      height={height}
      className={`object-cover ${className}`}
      loading="lazy"
    />
  )
} 