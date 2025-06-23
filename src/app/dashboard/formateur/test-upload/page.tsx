"use client";

import { useState } from "react";
import VideoUpload from "@/components/dashboard/VideoUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, TestTube, CheckCircle } from "lucide-react";

export default function TestUploadPage() {
  const [videoData, setVideoData] = useState<{
    url?: string;
    muxAssetId?: string;
    muxPlaybackId?: string;
  }>({});

  const handleVideoChange = (url?: string) => {
    setVideoData(prev => ({ ...prev, url }));
  };

  const handleMuxDataChange = (muxData: { assetId: string; playbackId: string }) => {
    setVideoData(prev => ({
      ...prev,
      muxAssetId: muxData.assetId,
      muxPlaybackId: muxData.playbackId,
    }));
  };

  const resetTest = () => {
    setVideoData({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <TestTube className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Test Upload Vidéo + Mux
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            🧪 Page de test pour vérifier l'intégration UploadThing + Mux.
            Uploadez une vidéo pour tester le workflow complet.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Video className="w-4 h-4 text-blue-500" />
                Étape 1: Upload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex items-center gap-2 ${
                videoData.url ? 'text-green-600' : 'text-gray-400'
              }`}>
                {videoData.url ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Terminé</span>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    <span className="text-sm">En attente</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Video className="w-4 h-4 text-purple-500" />
                Étape 2: Asset Mux
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex items-center gap-2 ${
                videoData.muxAssetId ? 'text-green-600' : 'text-gray-400'
              }`}>
                {videoData.muxAssetId ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Créé</span>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    <span className="text-sm">En attente</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Video className="w-4 h-4 text-red-500" />
                Étape 3: Playback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex items-center gap-2 ${
                videoData.muxPlaybackId ? 'text-green-600' : 'text-gray-400'
              }`}>
                {videoData.muxPlaybackId ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Prêt</span>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    <span className="text-sm">En attente</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Component */}
        <Card className="border-2 border-gray-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-500" />
              Test d'Upload Vidéo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VideoUpload
              value={videoData.url || ""}
              onChange={handleVideoChange}
              muxPlaybackId={videoData.muxPlaybackId}
              onMuxDataChange={handleMuxDataChange}
            />
          </CardContent>
        </Card>

        {/* Debug Info */}
        <Card className="mt-8 border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              🔍 Informations de Debug
              <Button
                onClick={resetTest}
                variant="outline"
                size="sm"
                className="ml-auto"
              >
                Reset Test
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs">
              <div className="space-y-2">
                <div>
                  <span className="text-gray-600">Video URL:</span>
                  <span className="ml-2 text-blue-600">
                    {videoData.url || "Non défini"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Mux Asset ID:</span>
                  <span className="ml-2 text-purple-600">
                    {videoData.muxAssetId || "Non défini"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Mux Playback ID:</span>
                  <span className="ml-2 text-red-600">
                    {videoData.muxPlaybackId || "Non défini"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-8 border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
          <CardHeader>
            <CardTitle className="text-sm text-amber-800">
              📋 Instructions de Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-amber-700 space-y-2">
              <p>1. Cliquez sur la zone d'upload pour sélectionner une vidéo</p>
              <p>2. Attendez que l'upload se termine (Étape 1 ✅)</p>
              <p>3. Mux va automatiquement créer un asset (Étape 2 ✅)</p>
              <p>4. Une fois prêt, le player Mux s'affichera (Étape 3 ✅)</p>
              <p>5. Vous pouvez supprimer la vidéo avec le bouton rouge</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 