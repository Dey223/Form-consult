"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Image as ImageIcon, Tag, Globe, DollarSign, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import ImageUpload from "../ImageUpload";
import RichEditor from "./RichEditor";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  title: z.string().min(2, "Le titre doit contenir au moins 2 caractères"),
  subtitle: z.string().optional(),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  overview: z.string().optional(),
  // price: z.number().min(0, "Le prix doit être positif").optional(),
  thumbnail: z.string().optional(),
  categoryId: z.string().optional(),
  subCategoryId: z.string().optional(),
  levelId: z.string().optional(),
});

interface Formation {
  id: string;
  title: string;
  subtitle?: string | null;
  description: string;
  overview?: string | null;
  thumbnail: string | null;
  price: number | null;
  isActive: boolean;
  isPublished: boolean;
  category?: { id: string; name: string } | null;
  subCategory?: { id: string; name: string } | null;
  levelRelation?: { id: string; name: string } | null;
}

interface Category {
  label: string;
  value: string;
  subCategories: { label: string; value: string }[];
}

interface Level {
  label: string;
  value: string;
}

interface BasicInfoTabProps {
  formation: Formation;
  categories: Category[];
  levels: Level[];
  isReadOnly?: boolean;
}

type FormData = z.infer<typeof formSchema>;

export default function BasicInfoTab({ formation, categories, levels, isReadOnly = false }: BasicInfoTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(formation.thumbnail);
  const [selectedCategory, setSelectedCategory] = useState<string>(formation.category?.id || "");
  const [availableSubCategories, setAvailableSubCategories] = useState<ComboboxOption[]>([]);

  // Debug: Log formation data
  console.log("Formation data:", formation);
  console.log("Formation description:", formation.description);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    control,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: formation.title || "",
      subtitle: formation.subtitle || "",
      description: formation.description || "",
      overview: formation.overview || "",
      // price: formation.price || 0,
      thumbnail: formation.thumbnail || "",
      categoryId: formation.category?.id || "",
      subCategoryId: formation.subCategory?.id || "",
      levelId: formation.levelRelation?.id || "",
    },
  });

  // Debug: Watch form values
  const watchedValues = watch();
  console.log("Form values:", watchedValues);
  console.log("Description value:", watchedValues.description);

  // Initialiser le formulaire avec les données de la formation
  useEffect(() => {
    reset({
      title: formation.title || "",
      subtitle: formation.subtitle || "",
      description: formation.description || "",
      overview: formation.overview || "",
      // price: formation.price || 0,
      thumbnail: formation.thumbnail || "",
      categoryId: formation.category?.id || "",
      subCategoryId: formation.subCategory?.id || "",
      levelId: formation.levelRelation?.id || "",
    });
    
    // Initialiser la catégorie sélectionnée
    if (formation.category?.id) {
      setSelectedCategory(formation.category.id);
    }
  }, [formation, reset]);

  // Mettre à jour les sous-catégories quand la catégorie change
  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(cat => cat.value === selectedCategory);
      setAvailableSubCategories(category?.subCategories || []);
    } else {
      setAvailableSubCategories([]);
      setValue("subCategoryId", "");
    }
  }, [selectedCategory, categories, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/formations/${formation.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      toast.success("Formation mise à jour avec succès ! 🎉");
      // Recharger la page pour voir les changements
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la mise à jour de la formation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header avec design moderne */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-100">
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ✨ Informations de base
            </h2>
            <p className="text-gray-600">
              Donnez vie à votre formation avec des informations captivantes et professionnelles
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section Image de couverture */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <ImageIcon className="w-5 h-5 text-gray-600 mr-2" />
            <label className="text-lg font-semibold text-gray-900">
              Image de couverture
            </label>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Choisissez une image attrayante qui représente votre formation (recommandé: 1280x720px)
          </p>
          <ImageUpload
            value={imagePreview || ""}
            onChange={(url) => {
              if (!isReadOnly) {
                setImagePreview(url || "");
                setValue("thumbnail", url || "");
              }
            }}
            endpoint="formationImage"
          />
        </div>

        {/* Section Informations principales */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-blue-600" />
            Informations principales
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Titre */}
            <div className="lg:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre de la formation *
              </label>
              <input
                {...register("title")}
                type="text"
                id="title"
                disabled={isReadOnly}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="Ex: Maîtrisez React.js de A à Z - Formation Complète"
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  ⚠️ {errors.title.message}
                </p>
              )}
            </div>

            {/* Sous-titre */}
            <div className="lg:col-span-2">
              <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
                Sous-titre (optionnel)
              </label>
              <input
                {...register("subtitle")}
                type="text"
                id="subtitle"
                disabled={isReadOnly}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="Un résumé accrocheur qui donne envie d'en savoir plus"
              />
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Combobox
                    options={categories}
                    value={field.value}
                    onValueChange={(value) => {
                      if (!isReadOnly) {
                        field.onChange(value);
                        setSelectedCategory(value);
                      }
                    }}
                    placeholder="Sélectionner une catégorie..."
                    searchPlaceholder="Rechercher une catégorie..."
                    emptyText="Aucune catégorie trouvée"
                    disabled={isReadOnly}
                  />
                )}
              />
            </div>

            {/* Sous-catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sous-catégorie
              </label>
              <Controller
                name="subCategoryId"
                control={control}
                render={({ field }) => (
                  <Combobox
                    options={availableSubCategories}
                    value={field.value}
                    onValueChange={(value) => {
                      if (!isReadOnly) {
                        field.onChange(value);
                      }
                    }}
                    placeholder="Sélectionner une sous-catégorie..."
                    searchPlaceholder="Rechercher une sous-catégorie..."
                    emptyText="Aucune sous-catégorie disponible"
                    disabled={!selectedCategory || isReadOnly}
                  />
                )}
              />
            </div>

            {/* Niveau */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau de difficulté
              </label>
              <Controller
                name="levelId"
                control={control}
                render={({ field }) => (
                  <Combobox
                    options={levels}
                    value={field.value}
                    onValueChange={(value) => {
                      if (!isReadOnly) {
                        field.onChange(value);
                      }
                    }}
                    placeholder="Sélectionner un niveau..."
                    searchPlaceholder="Rechercher un niveau..."
                    emptyText="Aucun niveau trouvé"
                    disabled={isReadOnly}
                  />
                )}
              />
            </div>

            {/* Prix */}
            <div>
              {/* <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Prix (€)
              </label>
              <div className="relative">
                
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm font-medium">€</span>
                </div>
              </div>
               {errors.price && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  ⚠️ {errors.price.message}
                </p>
              )}  */}
            </div>
          </div>
        </div>

        {/* Section Description avec RichEditor */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Tag className="w-5 h-5 mr-2 text-purple-600" />
            Description détaillée
          </h3>
          
          <div className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Description principale *
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Décrivez votre formation de manière claire et engageante. Expliquez ce que les étudiants vont apprendre.
              </p>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    placeholder="Décrivez en détail ce que les étudiants vont apprendre dans cette formation..."
                    value={field.value || ""}
                    onChange={(e) => {
                      if (!isReadOnly) {
                        console.log("Description Textarea onChange:", e.target.value);
                        field.onChange(e.target.value);
                      }
                    }}
                    disabled={isReadOnly}
                    className={`min-h-[200px] resize-none ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    rows={8}
                  />
                )}
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  ⚠️ {errors.description.message}
                </p>
              )}
            </div>

            {/* Vue d'ensemble */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Vue d'ensemble (optionnel)
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Ajoutez un aperçu plus détaillé du contenu, des objectifs pédagogiques et des prérequis.
              </p>
              <Controller
                name="overview"
                control={control}
                render={({ field }) => (
                  <RichEditor
                    placeholder="Ajoutez une vue d'ensemble détaillée : objectifs, prérequis, contenu du cours..."
                    value={field.value || ""}
                    onChange={(value) => {
                      if (!isReadOnly) {
                        field.onChange(value);
                      }
                    }}
                    className="min-h-[150px]"
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Debug Panel - À SUPPRIMER EN PRODUCTION */}
        {/* <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-semibold text-red-800 mb-2">🔍 Debug Info (temporaire)</h4>
          <div className="text-xs space-y-1">
            <div><strong>Formation description:</strong> "{formation.description}"</div>
            <div><strong>Form description value:</strong> "{watchedValues.description}"</div>
            <div><strong>Categories count:</strong> {categories.length}</div>
            <div><strong>Selected category:</strong> {selectedCategory}</div>
            <div><strong>isDirty:</strong> {isDirty ? "true" : "false"}</div>
          </div>
          <div className="mt-2 space-x-2">
            <button
              type="button"
              onClick={() => setValue("description", "Test description avec du <strong>HTML</strong>")}
              className="px-3 py-1 bg-blue-500 text-white text-xs rounded"
            >
              Test Description
            </button>
            <button
              type="button"
              onClick={() => setValue("overview", "Test overview avec <em>contenu</em>")}
              className="px-3 py-1 bg-green-500 text-white text-xs rounded"
            >
              Test Overview
            </button>
          </div>
        </div> */}

        {/* Actions */}
        {!isReadOnly && (
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border border-gray-200 mb-1">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {isDirty ? (
                  <span className="text-blue-600 font-medium">📝 Modifications détectées</span>
                ) : (
                  <span>✅ Tout est sauvegardé</span>
                )}
              </div>
              
              <button
                type="submit"
                disabled={!isDirty || isLoading}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
} 