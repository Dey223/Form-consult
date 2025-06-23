'use client'

import React from 'react'

interface VideoThumbnailProps {
  playbackId: string
  width?: number
  height?: number
  className?: string
  time?: number
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  playbackId,
  width = 160,
  height = 90,
  className = '',
  time = 0
}) => {
  const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg?width=${width}&height=${height}&fit_mode=crop&time=${time}`

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      <img
        src={thumbnailUrl}
        alt="Video thumbnail"
        width={width}
        height={height}
        className="object-cover w-full h-full"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.src = `data:image/svg+xml;base64,${btoa(`
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="#f3f4f6"/>
              <circle cx="50%" cy="50%" r="20" fill="#6b7280"/>
              <polygon points="45,35 45,65 70,50" fill="#ffffff"/>
            </svg>
          `)}`
        }}
        loading="lazy"
      />
      
      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
        <div className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-gray-800 ml-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M8 5v10l8-5-8-5z" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default VideoThumbnail 