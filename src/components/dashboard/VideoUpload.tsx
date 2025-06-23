"use client";

import { useState } from "react";
import { UploadDropzone } from "@/lib/uploadthing";
import { Trash2, Video, Loader2, Upload, CheckCircle, AlertCircle, Play } from "lucide-react";
import MuxPlayer from "@mux/mux-player-react";

interface VideoUploadProps {
  value: string;
  onChange: (url?: string) => void;
  muxPlaybackId?: string;
  onMuxDataChange?: (muxData: { assetId: string; playbackId: string }) => void;
}

export default function VideoUpload({
  value,
  onChange,
  muxPlaybackId,
  onMuxDataChange,
}: VideoUploadProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      // Si on a des données Mux, on doit les supprimer aussi
      if (muxPlaybackId) {
        try {
          await fetch("/api/mux/delete-asset", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ playbackId: muxPlaybackId }),
          });
        } catch (error) {
          console.error("Erreur suppression asset Mux:", error);
        }
      }
      onChange("");
      onMuxDataChange?.({ assetId: "", playbackId: "" });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const onUploadComplete = async (url: string) => {
    try {
      setIsProcessing(true);
      onChange(url);
      
      // Créer l'asset Mux
      const response = await fetch("/api/mux/create-asset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUrl: url }),
      });

      if (response.ok) {
        const muxData = await response.json();
        onMuxDataChange?.(muxData);
      } else {
        console.error("Erreur lors de la création de l'asset Mux");
      }
    } catch (error) {
      console.error("Erreur lors du traitement Mux:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Vidéo prête avec Mux Player
  if (value && muxPlaybackId) {
    return (
      <div className="relative group">
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 shadow-xl">
          <MuxPlayer
            playbackId={muxPlaybackId}
            className="w-full aspect-video"
            style={{
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        {/* Actions overlay */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
            <CheckCircle className="w-3 h-3" />
            Prête
          </div>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            type="button"
            title="Supprimer la vidéo"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Info bar */}
        <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Vidéo optimisée et prête pour le streaming
              </span>
            </div>
            <div className="text-xs text-green-600 font-medium">
              ✨ Mux
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vidéo uploadée mais en cours de traitement Mux
  if (value && !muxPlaybackId) {
    return (
      <div className="relative">
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-4">
              <Video className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            🚀 Optimisation en cours
          </h3>
          <p className="text-sm text-gray-600 text-center max-w-xs mb-4">
            Votre vidéo est en cours de traitement par Mux pour un streaming optimal
          </p>
          
          {/* Progress animation */}
          <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }} />
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            ⏱️ Cela peut prendre quelques minutes selon la taille du fichier
          </div>
        </div>
      </div>
    );
  }

  // Traitement Mux en cours après upload
  if (isProcessing) {
    return (
      <div className="relative">
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg mb-4">
              <Video className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            ⚡ Création de l'asset vidéo
          </h3>
          <p className="text-sm text-gray-600 text-center max-w-xs">
            Configuration du streaming haute qualité
          </p>
        </div>
      </div>
    );
  }

  // Zone d'upload
  return (
    <div className="w-full">
      <div className="relative group">
        <UploadDropzone
          endpoint="lessonVideo"
          onClientUploadComplete={(res) => {
            if (res?.[0]) {
              setIsUploading(false);
              onUploadComplete(res[0].url);
            }
          }}
          onUploadProgress={(progress) => {
            setIsUploading(true);
            setUploadProgress(progress);
          }}
          onUploadError={(error: Error) => {
            console.error("Upload error:", error);
            setIsUploading(false);
            alert(`Erreur d'upload: ${error.message}`);
          }}
          appearance={{
            container: "border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors duration-300 rounded-xl p-8 bg-gradient-to-br from-gray-50 to-blue-50/30 hover:from-blue-50 hover:to-purple-50/50",
            uploadIcon: "text-gray-400 group-hover:text-blue-500 transition-colors duration-300",
            label: "text-gray-600 group-hover:text-blue-700 font-medium transition-colors duration-300",
            allowedContent: "text-gray-500 group-hover:text-gray-600 transition-colors duration-300",
            button: `
              bg-gradient-to-r from-blue-600 to-purple-600 
              hover:from-blue-700 hover:to-purple-700 
              text-white font-semibold py-3 px-6 rounded-lg 
              shadow-lg hover:shadow-xl 
              transition-all duration-200 
              transform hover:scale-105
              flex items-center gap-2
            `,
          }}
          config={{
            mode: "auto",
          }}
          className="group"
        />

        {/* Upload progress overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-4">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              📤 Upload en cours
            </h3>
            <div className="w-64 bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {Math.round(uploadProgress)}% terminé
            </p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-800 mb-1">
              Conseils pour un upload optimal
            </h4>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• Formats recommandés : MP4, MOV, AVI</li>
              <li>• Résolution idéale : 1080p (1920x1080)</li>
              <li>• Taille maximum : 1GB</li>
              <li>• Durée : jusqu'à 3 heures</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 