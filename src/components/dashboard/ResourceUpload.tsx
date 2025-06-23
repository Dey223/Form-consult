"use client";

import { useState } from "react";
import { UploadDropzone } from "@/lib/uploadthing";
import { Trash2, File, FileText, Image, Video, Download, Upload } from "lucide-react";

interface ResourceUploadProps {
  value?: string;
  onChange: (url?: string, fileName?: string, fileSize?: number, fileType?: string) => void;
  endpoint: "courseResources";
  accept?: string;
  maxFileSize?: string;
}

export default function ResourceUpload({
  value,
  onChange,
  endpoint,
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip,.rar",
  maxFileSize = "16MB",
}: ResourceUploadProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async () => {
    setIsDeleting(true);
    onChange("");
    setIsDeleting(false);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    
    if (['pdf'].includes(extension || '')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    
    if (['mp4', 'avi', 'mov', 'wmv'].includes(extension || '')) {
      return <Video className="w-5 h-5 text-purple-500" />;
    }
    
    return <File className="w-5 h-5 text-gray-500" />;
  };

  if (value) {
    const fileName = value.split('/').pop() || "Fichier téléchargé";
    
    return (
      <div className="relative w-full border-2 border-green-200 bg-green-50 rounded-lg p-4 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 p-2 bg-green-100 rounded-lg">
              {getFileIcon(fileName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-green-600 truncate">
                {fileName}
              </p>
              <p className="text-xs text-green-600">✓ Fichier téléchargé avec succès</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => window.open(value, '_blank')}
              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors"
              type="button"
              title="Ouvrir le fichier"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              type="button"
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <UploadDropzone
        endpoint={endpoint}
        onClientUploadComplete={(res) => {
          if (res?.[0]) {
            const file = res[0];
            onChange(
              file.url, 
              file.name,
              file.size,
              file.type || undefined
            );
          }
        }}
        onUploadError={(error: Error) => {
          console.error("Upload error:", error);
          alert(`Erreur d'upload: ${error.message}`);
        }}
        appearance={{
          button: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105",
          allowedContent: "text-gray-500 text-sm mt-2",
          label: "text-gray-700 font-semibold text-lg mb-2",
          container: "border-2 border-dashed border-blue-300 hover:border-blue-400 bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-xl p-8 transition-all duration-300 cursor-pointer group",
          uploadIcon: "text-blue-500 group-hover:text-blue-600 transition-colors duration-200",
        }}
        content={{
          button: (
            <span className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Choisir un fichier
            </span>
          ),
          allowedContent: (
            <div className="text-center">
              <p className="text-gray-600 mb-1">Formats acceptés: PDF, DOC, XLS, PPT, images, vidéos...</p>
              <p className="text-sm text-gray-500">Taille maximum: {maxFileSize}</p>
            </div>
          ),
          label: (
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700 mb-1">📎 Glissez-déposez votre fichier ici</p>
              <p className="text-gray-500">ou cliquez pour parcourir</p>
            </div>
          ),
        }}
      />
    </div>
  );
} 