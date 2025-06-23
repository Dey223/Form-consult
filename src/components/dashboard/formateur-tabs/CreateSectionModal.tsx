"use client";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Plus, Save, Edit, BookOpen, Eye, Gift, Users, Clock, Target, Layers } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const createSectionSchema = z.object({
  title: z.string().min(2, "Le titre doit contenir au moins 2 caractères"),
  description: z.string().optional(),
  isPublished: z.boolean(),
  isFree: z.boolean(),
  estimatedDuration: z.number().min(0).optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  objectives: z.string().optional(),
});

type FormData = z.infer<typeof createSectionSchema>;

interface Section {
  id: string;
  title: string;
  description: string | null;
  isPublished: boolean;
  isFree: boolean;
  estimatedDuration?: number | null;
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | null;
  objectives?: string | null;
}

interface CreateSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  formationId: string;
  editData?: Section;
  onSuccess?: () => void;
}

export default function CreateSectionModal({
  isOpen,
  onClose,
  formationId,
  editData,
  onSuccess,
}: CreateSectionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!editData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(createSectionSchema),
    defaultValues: {
      title: "",
      description: "",
      isPublished: false,
      isFree: false,
      estimatedDuration: 0,
      difficulty: "BEGINNER",
      objectives: "",
    },
  });

  const isPublished = watch("isPublished");
  const isFree = watch("isFree");
  const difficulty = watch("difficulty");

  // Charger les données d'édition
  useEffect(() => {
    if (isEditing && editData) {
      setValue("title", editData.title);
      setValue("description", editData.description || "");
      setValue("isPublished", editData.isPublished);
      setValue("isFree", editData.isFree);
      setValue("estimatedDuration", editData.estimatedDuration || 0);
      setValue("difficulty", editData.difficulty || "BEGINNER");
      setValue("objectives", editData.objectives || "");
    } else {
      reset({
        title: "",
        description: "",
        isPublished: false,
        isFree: false,
        estimatedDuration: 0,
        difficulty: "BEGINNER",
        objectives: "",
      });
    }
  }, [isEditing, editData, setValue, reset]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const url = isEditing 
        ? `/api/sections/${editData!.id}`
        : `/api/formations/${formationId}/sections`;
      
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de ${isEditing ? 'la modification' : 'la création'}`);
      }

      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(`Erreur lors de ${isEditing ? 'la modification' : 'la création'} de la section`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  const difficultyOptions = [
    { 
      value: "BEGINNER", 
      label: "Débutant", 
      icon: "🌱", 
      description: "Adapté aux nouveaux apprenants",
      color: "text-green-600",
      bgColor: "bg-green-50 border-green-200"
    },
    { 
      value: "INTERMEDIATE", 
      label: "Intermédiaire", 
      icon: "🚀", 
      description: "Quelques connaissances requises",
      color: "text-blue-600",
      bgColor: "bg-blue-50 border-blue-200"
    },
    { 
      value: "ADVANCED", 
      label: "Avancé", 
      icon: "🎯", 
      description: "Pour les apprenants expérimentés",
      color: "text-purple-600",
      bgColor: "bg-purple-50 border-purple-200"
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Header élégant */}
          <DialogHeader className="text-center pb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
              {isEditing ? (
                <Edit className="w-8 h-8 text-white" />
              ) : (
                <Plus className="w-8 h-8 text-white" />
              )}
            </div>
            <DialogTitle className="text-3xl font-bold text-gray-900 mb-2">
              {isEditing ? "✏️ Modifier la Section" : "🎯 Créer une Section"}
            </DialogTitle>
            <DialogDescription className="text-lg text-gray-600 max-w-2xl mx-auto">
              {isEditing 
                ? "Améliorez votre section avec de nouveaux contenus et fonctionnalités" 
                : "Structurez votre formation avec des sections organisées et captivantes"}
            </DialogDescription>
          </DialogHeader>

        {/* Informations principales */}
        <div className="space-y-6">
          
          {/* Titre */}
          <div className="space-y-3">
            <label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <BookOpen className="w-4 h-4 text-blue-500" />
              Titre de la section *
            </label>
            <input
              {...register("title")}
              type="text"
              id="title"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-lg"
              placeholder="Ex: Introduction aux Fondamentaux"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <span>⚠️</span> {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label htmlFor="description" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Layers className="w-4 h-4 text-green-500" />
              Description (optionnelle)
            </label>
            <textarea
              {...register("description")}
              id="description"
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
              placeholder="Décrivez ce que vos étudiants vont apprendre dans cette section..."
            />
          </div>

          {/* Objectifs d'apprentissage */}
          <div className="space-y-3">
            <label htmlFor="objectives" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Target className="w-4 h-4 text-orange-500" />
              Objectifs d'apprentissage
            </label>
            <textarea
              {...register("objectives")}
              id="objectives"
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
              placeholder="À la fin de cette section, les étudiants sauront..."
            />
          </div>

          {/* Durée estimée et difficulté */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Durée estimée */}
            <div className="space-y-3">
              <label htmlFor="estimatedDuration" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Clock className="w-4 h-4 text-blue-500" />
                Durée estimée (minutes)
              </label>
              <div className="relative">
                <input
                  {...register("estimatedDuration", { valueAsNumber: true })}
                  type="number"
                  id="estimatedDuration"
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="60"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  min
                </div>
              </div>
            </div>

            {/* Niveau de difficulté */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Users className="w-4 h-4 text-purple-500" />
                Niveau de difficulté
              </label>
              <div className="space-y-2">
                {difficultyOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      difficulty === option.value
                        ? `${option.bgColor} border-current ${option.color}`
                        : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <input
                      {...register("difficulty")}
                      type="radio"
                      value={option.value}
                      className="sr-only"
                    />
                    <div className={`text-lg mr-3`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-semibold ${
                        difficulty === option.value ? option.color : "text-gray-900"
                      }`}>
                        {option.label}
                      </div>
                      <div className={`text-xs ${
                        difficulty === option.value ? "text-gray-700" : "text-gray-500"
                      }`}>
                        {option.description}
                      </div>
                    </div>
                    {difficulty === option.value && (
                      <div className={option.color}>
                        ✓
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Options de publication */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700">Options de publication</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Section gratuite */}
              <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                isFree 
                  ? "border-green-300 bg-green-50" 
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}>
                <input
                  {...register("isFree")}
                  type="checkbox"
                  id="isFree"
                  className="sr-only"
                />
                <div className={`p-2 rounded-lg mr-3 ${
                  isFree ? "bg-green-100" : "bg-gray-50"
                }`}>
                  <Gift className={`w-5 h-5 ${
                    isFree ? "text-green-600" : "text-gray-400"
                  }`} />
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-semibold ${
                    isFree ? "text-green-700" : "text-gray-900"
                  }`}>
                    Section gratuite
                  </div>
                  <div className={`text-xs ${
                    isFree ? "text-green-600" : "text-gray-500"
                  }`}>
                    Aperçu accessible à tous
                  </div>
                </div>
                {isFree && <div className="text-green-600">✓</div>}
              </label>

              {/* Publier immédiatement */}
              <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                isPublished 
                  ? "border-blue-300 bg-blue-50" 
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}>
                <input
                  {...register("isPublished")}
                  type="checkbox"
                  id="isPublished"
                  className="sr-only"
                />
                <div className={`p-2 rounded-lg mr-3 ${
                  isPublished ? "bg-blue-100" : "bg-gray-50"
                }`}>
                  <Eye className={`w-5 h-5 ${
                    isPublished ? "text-blue-600" : "text-gray-400"
                  }`} />
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-semibold ${
                    isPublished ? "text-blue-700" : "text-gray-900"
                  }`}>
                    {isEditing ? "Section publiée" : "Publier immédiatement"}
                  </div>
                  <div className={`text-xs ${
                    isPublished ? "text-blue-600" : "text-gray-500"
                  }`}>
                    Visible pour les étudiants
                  </div>
                </div>
                {isPublished && <div className="text-blue-600">✓</div>}
              </label>
            </div>
          </div>
        </div>

          <DialogFooter className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  {isEditing ? 'Modification...' : 'Création...'}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEditing ? 'Modifier la section' : 'Créer la section'}
                </>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 