"use client";

import { useState, useEffect } from "react";
import { Plus, Download, Trash2, FileText, Image, File, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ResourceUpload from "@/components/dashboard/ResourceUpload";
import { AlertDialog } from "@/components/ui/alert-dialog";

interface Formation {
  id: string;
  title: string;
  resources?: Resource[];
}

interface Resource {
  id: string;
  name: string;
  description: string | null;
  fileUrl: string;
  fileSize: number | null;
  fileType: string | null;
}

interface ResourcesTabProps {
  formation: Formation;
  isReadOnly?: boolean;
}

export default function ResourcesTab({ formation, isReadOnly = false }: ResourcesTabProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [resources, setResources] = useState<Resource[]>(formation.resources || []);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadData, setUploadData] = useState({
    name: "",
    description: "",
    fileUrl: "",
    fileName: "",
    fileSize: 0,
    fileType: "",
  });
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    resourceId: "",
    resourceName: "",
    isDeleting: false,
  });

  // Récupérer les ressources depuis l'API au chargement et quand la formation change
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch(`/api/formations/${formation.id}/resources`);
        if (response.ok) {
          const fetchedResources = await response.json();
          setResources(fetchedResources);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des ressources:", error);
      }
    };

    fetchResources();
  }, [formation.id]);

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Taille inconnue";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return Math.round(bytes / 1024) + " KB";
    return Math.round(bytes / 1048576) + " MB";
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <File className="w-5 h-5 text-gray-500" />;
    
    if (fileType.startsWith("image/")) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    
    if (fileType.includes("pdf") || fileType.includes("document")) {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const handleFileUpload = (url?: string, fileName?: string, fileSize?: number, fileType?: string) => {
    if (url) {
      setUploadData({
        ...uploadData,
        fileUrl: url,
        fileName: fileName || "",
        fileSize: fileSize || 0,
        fileType: fileType || "",
        name: uploadData.name || fileName?.split('.')[0] || "",
      });
    } else {
      setUploadData({
        name: "",
        description: "",
        fileUrl: "",
        fileName: "",
        fileSize: 0,
        fileType: "",
      });
    }
  };

  const handleSubmitResource = async () => {
    if (!uploadData.fileUrl || !uploadData.name.trim()) {
      alert("Veuillez sélectionner un fichier et saisir un nom");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/formations/${formation.id}/resources`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: uploadData.name,
          description: uploadData.description || null,
          fileUrl: uploadData.fileUrl,
          fileSize: uploadData.fileSize,
          fileType: uploadData.fileType,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout de la ressource");
      }

      const newResource = await response.json();
      setResources(prev => [newResource, ...prev]);
      
      // Réinitialiser le formulaire
      setUploadData({
        name: "",
        description: "",
        fileUrl: "",
        fileName: "",
        fileSize: 0,
        fileType: "",
      });
      
      setShowUpload(false);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'ajout de la ressource");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteResource = (resourceId: string, resourceName: string) => {
    setDeleteDialog({
      isOpen: true,
      resourceId,
      resourceName,
      isDeleting: false,
    });
  };

  const confirmDeleteResource = async () => {
    setDeleteDialog(prev => ({ ...prev, isDeleting: true }));

    try {
      const response = await fetch(`/api/formations/${formation.id}/resources/${deleteDialog.resourceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setResources(prev => prev.filter(resource => resource.id !== deleteDialog.resourceId));
      setDeleteDialog({
        isOpen: false,
        resourceId: "",
        resourceName: "",
        isDeleting: false,
      });
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la suppression de la ressource");
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const cancelDeleteResource = () => {
    if (!deleteDialog.isDeleting) {
      setDeleteDialog({
        isOpen: false,
        resourceId: "",
        resourceName: "",
        isDeleting: false,
      });
    }
  };

  return (
    <div>
      <div className="m-6  ">
        <div className="flex items-center justify-between mb-4">
          <div>
                          <h2 className="text-xl font-semibold text-gray-900">
                Ressources téléchargeables
              </h2>
              <p className="text-gray-600">
                Ajoutez des fichiers que vos étudiants pourront télécharger
              </p>
            </div>
            {!isReadOnly && (
              <button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Ajouter une ressource
              </button>
            )}
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 w-full">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Total Ressources</p>
                  <p className="text-lg font-semibold">{resources.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 w-full">
              <div className="flex items-center">
                <Download className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Téléchargements</p>
                  <p className="text-lg font-semibold">0</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 w-full">
              <div className="flex items-center">
                <Upload className="w-5 h-5 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Taille totale</p>
                  <p className="text-lg font-semibold">
                    {formatFileSize(
                      resources.reduce((acc, resource) => acc + (resource.fileSize || 0), 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
      </div>

      {/* Liste des ressources */}
      <div className="space-y-4 m-6">
        {resources && resources.length > 0 ? (
          resources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white border-2 border-gray-100 hover:border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-200">
                    {getFileIcon(resource.fileType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate text-lg group-hover:text-blue-700 transition-colors">
                      {resource.name}
                    </h3>
                    {resource.description && (
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                        {resource.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-6 text-sm text-gray-500 mt-3">
                      <span className="flex items-center gap-1">
                        📦 {formatFileSize(resource.fileSize)}
                      </span>
                      <span className="flex items-center gap-1">
                        🎯 {resource.fileType}
                      </span>
                      <span className="flex items-center gap-1">
                        📊 0 téléchargements
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0 my-auto">
                  <button
                    onClick={() => window.open(resource.fileUrl, '_blank')}
                    className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
                    title="Ouvrir le fichier"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  {!isReadOnly && (
                    <button
                      onClick={() => handleDeleteResource(resource.id, resource.name)}
                      className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune ressource ajoutée
            </h3>
            <p className="text-gray-500 mb-4">
              Ajoutez des documents, images ou autres fichiers que vos étudiants pourront télécharger
            </p>
            {!isReadOnly && (
              <button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Ajouter ma première ressource
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal d'upload avec style ShadCN */}
      <Dialog open={showUpload} onOpenChange={(open) => !open && setShowUpload(false)}>
        <DialogContent className="sm:max-w-2xl h-auto">
          <DialogHeader className="text-center pb-4">
            <DialogTitle className="flex items-center justify-center gap-3 text-xl font-bold">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Upload className="w-6 h-6 text-white" />
              </div>
              Ajouter une ressource
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              📚 Téléchargez un fichier pour enrichir votre formation
            </DialogDescription>
          </DialogHeader>
        
        <div className="space-y-6">
          {/* Upload de fichier avec UploadThing */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FileText className="w-4 h-4 text-blue-500" />
              Fichier à télécharger *
            </label>
            <ResourceUpload
              value={uploadData.fileUrl}
              onChange={handleFileUpload}
              endpoint="courseResources"
            />
          </div>

          {/* Nom de la ressource */}
          <div className="space-y-3">
            <label htmlFor="resource-name" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <File className="w-4 h-4 text-purple-500" />
              Nom de la ressource *
            </label>
            <div className="relative">
              <input
                id="resource-name"
                type="text"
                value={uploadData.name}
                onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                placeholder="Ex: Guide pratique PDF"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              />
              {uploadData.name && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                  ✓
                </div>
              )}
            </div>
          </div>
          
          {/* Description */}
          <div className="space-y-3">
            <label htmlFor="resource-description" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Image className="w-4 h-4 text-green-500" />
              Description (optionnelle)
            </label>
            <textarea
              id="resource-description"
              value={uploadData.description}
              onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              rows={3}
              placeholder="Décrivez cette ressource et son utilité pour vos étudiants..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
            />
          </div>
        </div>

          <DialogFooter className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={() => {
                setShowUpload(false);
                setUploadData({
                  name: "",
                  description: "",
                  fileUrl: "",
                  fileName: "",
                  fileSize: 0,
                  fileType: "",
                });
              }}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              onClick={handleSubmitResource}
              disabled={isLoading || !uploadData.fileUrl || !uploadData.name.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Ajout en cours...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Ajouter la ressource
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog
        open={deleteDialog.isOpen}
        onClose={cancelDeleteResource}
        onConfirm={confirmDeleteResource}
        title="Supprimer la ressource"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteDialog.resourceName}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="destructive"
        isLoading={deleteDialog.isDeleting}
      />
    </div>
  );
} 