"use client";

import { useState } from "react";
import MuxVideoPlayer from "@/components/video/MuxPlayer";

export default function TestVideoPage() {
  // Test avec un Playback ID de démonstration (remplacez par un vrai ID de votre Mux)
  const [testPlaybackId, setTestPlaybackId] = useState("");
  const [showPlayer, setShowPlayer] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🧪 Test Lecteur Vidéo Mux
          </h1>

          {/* Formulaire de test */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Configuration de test</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mux Playback ID
                </label>
                <input
                  type="text"
                  value={testPlaybackId}
                  onChange={(e) => setTestPlaybackId(e.target.value)}
                  placeholder="Ex: ABC123abc456..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Copiez le Playback ID d'une vidéo existante dans votre Mux Dashboard
                </p>
              </div>
              
              <button
                onClick={() => setShowPlayer(!!testPlaybackId)}
                disabled={!testPlaybackId}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                Tester la lecture
              </button>
            </div>
          </div>

          {/* URLs de test direct */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">🔗 Tests directs</h3>
            <p className="text-sm text-yellow-700 mb-3">
              Si vous avez un Playback ID, testez ces URLs directement dans votre navigateur :
            </p>
            {testPlaybackId && (
              <div className="space-y-2 text-sm">
                <div>
                  <strong>HLS (streaming):</strong>
                  <br />
                  <a 
                    href={`https://stream.mux.com/${testPlaybackId}.m3u8`}
                    target="_blank"
                    className="text-blue-600 underline break-all"
                  >
                    https://stream.mux.com/{testPlaybackId}.m3u8
                  </a>
                </div>
                <div>
                  <strong>MP4 (téléchargement direct):</strong>
                  <br />
                  <a 
                    href={`https://stream.mux.com/${testPlaybackId}.mp4`}
                    target="_blank"
                    className="text-blue-600 underline break-all"
                  >
                    https://stream.mux.com/{testPlaybackId}.mp4
                  </a>
                </div>
                <div>
                  <strong>Thumbnail:</strong>
                  <br />
                  <a 
                    href={`https://image.mux.com/${testPlaybackId}/thumbnail.jpg`}
                    target="_blank"
                    className="text-blue-600 underline break-all"
                  >
                    https://image.mux.com/{testPlaybackId}/thumbnail.jpg
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Lecteur de test */}
          {showPlayer && testPlaybackId && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">🎥 Lecteur vidéo</h3>
              <div className="bg-black rounded-lg overflow-hidden">
                <div className="aspect-video">
                  <MuxVideoPlayer
                    playbackId={testPlaybackId}
                    lessonId="test-lesson"
                    onProgress={(seconds) => console.log(`Test - Progrès: ${seconds}s`)}
                    onComplete={() => console.log("Test - Vidéo terminée")}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Instructions de dépannage */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">📋 Guide de dépannage</h3>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>Vérifiez que le Playback ID est correct dans les données de la leçon</li>
              <li>Testez les URLs directes dans un nouvel onglet</li>
              <li>Vérifiez la console navigateur (F12) pour les erreurs</li>
              <li>Assurez-vous que la vidéo a fini d'être traitée par Mux</li>
              <li>Testez avec différents navigateurs (Chrome, Firefox, Safari)</li>
              <li>Vérifiez votre connexion internet</li>
            </ul>
          </div>

          {/* Infos environnement */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">ℹ️ Informations navigateur</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>User Agent:</strong> {navigator.userAgent}</p>
              <p><strong>Supports HLS:</strong> {
                document.createElement('video').canPlayType('application/x-mpegURL') 
                  ? '✅ Oui' : '❌ Non'
              }</p>
              <p><strong>Supports MP4:</strong> {
                document.createElement('video').canPlayType('video/mp4') 
                  ? '✅ Oui' : '❌ Non'
              }</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 