"use client";

import { useEffect, useState, useRef } from 'react';

interface MuxVideoPlayerProps {
  playbackId: string;
  lessonId?: string;
  videoUrl?: string; // URL de fallback (UploadThing)
  onProgress?: (watchedSeconds: number) => void;
  onComplete?: () => void;
  className?: string;
}

export default function MuxVideoPlayer({
  playbackId,
  lessonId,
  videoUrl,
  onProgress,
  onComplete,
  className = "w-full h-full"
}: MuxVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [currentSource, setCurrentSource] = useState<'mux' | 'fallback' | null>(null);

  useEffect(() => {
    console.log('MuxPlayer - PlaybackId:', playbackId);
    console.log('MuxPlayer - LessonId:', lessonId);
    console.log('MuxPlayer - VideoUrl (fallback):', videoUrl);
  }, [playbackId, lessonId, videoUrl]);

  useEffect(() => {
    if (!videoRef.current) return;

    const loadVideo = async () => {
      setIsLoading(true);
      setError(null);
      
      // Nettoyer l'instance HLS précédente
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      const video = videoRef.current!;

      if (!useFallback && playbackId) {
        // Essayer Mux avec HLS.js
        const hlsUrl = `https://stream.mux.com/${playbackId}.m3u8`;
        
        try {
          // Dynamically import hls.js
          const Hls = (await import('hls.js')).default;
          
          if (Hls.isSupported()) {
            console.log('MuxPlayer - Using HLS.js for Mux stream');
            const hls = new Hls({
              enableWorker: false, // Évite les problèmes avec Next.js
            });
            
            hlsRef.current = hls;
            setCurrentSource('mux');
            
            hls.loadSource(hlsUrl);
            hls.attachMedia(video);
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              console.log('MuxPlayer - HLS manifest loaded');
              setIsLoading(false);
            });
            
            hls.on(Hls.Events.ERROR, (event, data) => {
              console.error('MuxPlayer - HLS Error:', event, data);
              if (data.fatal) {
                handleMuxError();
              }
            });
            
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari supporte HLS nativement
            console.log('MuxPlayer - Using native HLS support');
            setCurrentSource('mux');
            video.src = hlsUrl;
            
          } else {
            console.log('MuxPlayer - HLS not supported, switching to fallback');
            handleMuxError();
          }
          
        } catch (error) {
          console.error('MuxPlayer - Failed to load HLS.js:', error);
          handleMuxError();
        }
        
      } else if (useFallback && videoUrl) {
        // Utiliser la vidéo UploadThing
        console.log('MuxPlayer - Using UploadThing fallback');
        setCurrentSource('fallback');
        video.src = videoUrl;
        
      } else {
        setError('Aucune source vidéo disponible');
        setIsLoading(false);
      }
    };

    loadVideo();

    // Cleanup
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [playbackId, videoUrl, useFallback]);

  const handleMuxError = () => {
    if (videoUrl && !useFallback) {
      console.log('MuxPlayer - Mux failed, switching to UploadThing fallback');
      setUseFallback(true);
    } else {
      setError('Erreur lors du chargement de la vidéo');
      setIsLoading(false);
    }
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    console.log('MuxPlayer - Video ready to play');
  };

  const handleError = () => {
    console.error('MuxPlayer - Video element error');
    handleMuxError();
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (onProgress) {
      const currentTime = e.currentTarget.currentTime;
      onProgress(currentTime);
    }
  };

  const handleEnded = () => {
    if (onComplete) {
      onComplete();
    }
  };

  const retryMux = () => {
    setUseFallback(false);
    setError(null);
  };

  const retryFallback = () => {
    if (videoUrl) {
      setUseFallback(true);
      setError(null);
    }
  };

  if (!playbackId && !videoUrl) {
    return (
      <div className="aspect-video bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">Aucune source vidéo disponible</p>
        </div>
      </div>
    );
  }

  const hlsUrl = `https://stream.mux.com/${playbackId}.m3u8`;
  const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg?width=1280&height=720&fit_mode=smartcrop`;

  return (
    <div className={`relative ${className}`}>
      {/* Debug Info Toggle */}
      <button
        onClick={() => setDebugInfo(!debugInfo)}
        className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs hover:bg-opacity-70"
      >
        {/* Debug */}
      </button> 

      {/* Debug Info Panel */}
      {debugInfo && (
        <div className="absolute top-8 right-2 z-10 bg-black bg-opacity-90 text-white p-3 rounded text-xs max-w-sm">
          <p><strong>Playback ID:</strong> {playbackId}</p>
          <p><strong>Lesson ID:</strong> {lessonId || 'N/A'}</p>
          <p><strong>Current Source:</strong> {currentSource || 'Loading...'}</p>
          <p><strong>Using Fallback:</strong> {useFallback ? '✅ Yes' : '❌ No'}</p>
          <p><strong>HLS.js Ready:</strong> {hlsRef.current ? '✅ Yes' : '❌ No'}</p>
          <hr className="my-2 border-gray-600" />
          <p><strong>HLS URL:</strong> <a href={hlsUrl} target="_blank" className="text-blue-300 underline">Test</a></p>
          {videoUrl && <p><strong>Fallback URL:</strong> <a href={videoUrl} target="_blank" className="text-blue-300 underline">Test</a></p>}
          <p><strong>Thumbnail:</strong> <a href={thumbnailUrl} target="_blank" className="text-blue-300 underline">Voir</a></p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-5">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Chargement de la vidéo...</p>
            <p className="text-xs mt-1">
              Source: {currentSource === 'mux' ? 'Mux (HLS)' : currentSource === 'fallback' ? 'UploadThing' : 'Détection...'}
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 bg-red-100 flex items-center justify-center z-5">
          <div className="text-center text-red-600 p-4">
            <p className="font-semibold">{error}</p>
            <p className="text-sm mt-2">Playback ID: {playbackId}</p>
            <p className="text-sm">Source: {currentSource || 'Unknown'}</p>
            <div className="mt-4 space-x-2">
              {!useFallback && videoUrl && (
                <button
                  onClick={retryFallback}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Essayer UploadThing
                </button>
              )}
              {useFallback && (
                <button
                  onClick={retryMux}
                  className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  Réessayer Mux
                </button>
              )}
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              >
                Recharger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        preload="metadata"
        poster={!useFallback ? thumbnailUrl : undefined}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        crossOrigin="anonymous"
      >
        {/* Fallback message */}
        <p className="text-gray-600 p-4">
          Votre navigateur ne supporte pas la lecture vidéo. 
          <br />
          {videoUrl && (
            <a href={videoUrl} className="text-blue-600 underline" target="_blank">
              Télécharger la vidéo
            </a>
          )}
        </p>
      </video>

      {/* Source indicator */}
      {debugInfo && currentSource && (
        <div className="absolute bottom-2 right-2 z-10">
          <span className={`px-2 py-1 rounded text-xs text-white ${
            currentSource === 'mux' ? 'bg-blue-600' : 'bg-orange-600'
          }`}>
            {currentSource === 'mux' ? 'Mux HLS' : 'UploadThing'}
          </span>
        </div>
      )}

      {/* Quality indicator for Mux */}
      {debugInfo && currentSource === 'mux' && hlsRef.current && (
        <div className="absolute bottom-8 right-2 z-10">
          <span className="px-2 py-1 rounded text-xs text-white bg-green-600">
            Multi-qualité disponible
          </span>
        </div>
      )}
    </div>
  );
} 