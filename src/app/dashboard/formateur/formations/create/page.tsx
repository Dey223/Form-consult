'use client';

import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Loader2, Save } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import ImageUpload from '@/components/dashboard/ImageUpload';
// RichEditor et ConditionalController supprimés, utilisation d'un textarea simple
import Image from 'next/image';
import Link from 'next/link';
import toast from "react-hot-toast";
import RichEditor from "@/components/dashboard/formateur-tabs/RichEditor";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Le titre est requis et doit contenir au moins 2 caractères",
  }),
  description: z.string().min(10, {
    message: "La description est requise et doit contenir au moins 10 caractères",
  }),
  overview: z.string().optional(),
  categoryId: z.string().min(1, {
    message: "La catégorie est requise",
  }),
  subCategoryId: z.string().min(1, {
    message: "La sous-catégorie est requise",
  }),
  levelId: z.string().optional(),
  level: z.enum(["DEBUTANT", "INTERMEDIAIRE", "AVANCE"]),
  
  thumbnail: z.string().optional(),
});

interface Category {
  label: string;
  value: string;
  subCategories: { label: string; value: string }[];
}

interface Level {
  label: string;
  value: string;
}

type FormData = z.infer<typeof formSchema>;

export default function CreateFormationPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      overview: "",
      categoryId: "",
      subCategoryId: "",
      levelId: "",
      level: "DEBUTANT",
     
      thumbnail: "",
    },
  });

  const { watch, setValue, handleSubmit, formState: { errors, isValid } } = form;

  const selectedCategoryId = watch("categoryId");
  const selectedCategory = categories.find(cat => cat.value === selectedCategoryId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les vraies catégories depuis l'API
        const [categoriesResponse, levelsResponse] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/levels"),
          fetch("/api/subcategories")

        ]);

        if (!categoriesResponse.ok || !levelsResponse.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }

        const categoriesData = await categoriesResponse.json();
        console.log('Categories raw data:', categoriesData);
        const levelsData = await levelsResponse.json();
        console.log('Levels raw data:', levelsData);

        // Transformer les catégories au format attendu par le Combobox
        const formattedCategories = categoriesData.map((category: any) => ({
          label: category.name,
          value: category.id,
          subCategories: category.subCategories?.map((sub: any) => ({
            label: sub.name,
            value: sub.id
          })) || []
        }));

        console.log('Formatted categories:', formattedCategories);

        setCategories(formattedCategories);
        setLevels(levelsData);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        // En cas d'erreur, on peut afficher un message d'erreur ou utiliser des données par défaut
        setCategories([]);
        setLevels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/formations/formateur/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la création de la formation");
      }

      const formation = await response.json();
      router.push(`/dashboard/formateur/formations/${formation.id}/edit`);
      
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la création de la formation");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-start text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour aux formations
              </Link>
              
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/formateur/formations"
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Mes formations
              </Link>
              <Button 
                type="submit" 
                form="formation-form"
                disabled={ isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Créer la formation
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Titre */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Créer une nouvelle formation
            </h1>
          </div>
          <p className="text-gray-600">
            Remplissez les informations ci-dessous pour créer votre formation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire principal */}
          <div className="lg:col-span-2">
            <form id="formation-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Section Image + Titre */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Informations principales</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image de la formation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image de la formation
                    </label>
                    <ImageUpload
                      value={watch("thumbnail") || ""}
                      onChange={(url) => setValue("thumbnail", url || "")}
                      endpoint="formationImage"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Téléchargez une image qui servira de vignette. Formats acceptés : JPG, PNG (max 4MB)
                    </p>
                  </div>

                  {/* Titre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre de la formation *
                    </label>
                    <input
                      type="text"
                      {...form.register("title")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Développement Web pour Débutants"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Description</h2>
                
                <div className="space-y-6 gap-2">
                  {/* Description courte avec React Quill */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description courte *
                    </label>
                    <Controller
                      name="description"
                      control={form.control}
                      render={({ field }) => (
                        <textarea
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="min-h-[150px] resize-none w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={6}
                          placeholder="Description courte qui apparaîtra dans les listings..."
                        />
                      )}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Aperçu détaillé */}
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mt-2">
                      Aperçu détaillé
                    </label>
                    <RichEditor
                      value={watch("overview") || ""}
                      onChange={(value: string) => setValue("overview", value)}
                      placeholder="Description détaillée de ce que les étudiants vont apprendre..."
                    />
                  </div> 
                </div>
              </div>

              {/* Catégorisation */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Catégorisation</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie *
                    </label>
                    <Combobox
                      options={categories}
                      value={watch("categoryId")}
                      onValueChange={(value: string) => {
                        setValue("categoryId", value);
                        setValue("subCategoryId", "");
                      }}
                      placeholder="Sélectionner une catégorie..."
                    />
                    {errors.categoryId && (
                      <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                    )}
                  </div>

                  {selectedCategory && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sous-catégorie *
                      </label>
                      <Combobox
                        options={selectedCategory.subCategories}
                        value={watch("subCategoryId")}
                        onValueChange={(value: string) => setValue("subCategoryId", value)}
                        placeholder="Sélectionner une sous-catégorie..."
                      />
                      {errors.subCategoryId && (
                        <p className="mt-1 text-sm text-red-600">{errors.subCategoryId.message}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Niveau et Prix */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Paramètres</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Niveau prédéfini */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Niveau *
                    </label>
                    <select
                      {...form.register("level")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="DEBUTANT">Débutant</option>
                      <option value="INTERMEDIAIRE">Intermédiaire</option>
                      <option value="AVANCE">Avancé</option>
                    </select>
                  </div>

                  {/* Niveau de difficulté */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Niveau de difficulté
                    </label>
                    <Combobox
                      options={levels}
                      value={watch("levelId")}
                      onValueChange={(value: string) => setValue("levelId", value)}
                      placeholder="Sélectionner un niveau..."
                    />
                  </div>

                  {/* Prix */}
                 
                </div>
              </div>
            </form>
          </div>

          {/* Aperçu */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Aperçu de votre formation
                </h3>
                
                {(watch("title") || watch("thumbnail")) ? (
                  <div className="space-y-4">
                    {watch("thumbnail") && (
                      <div className="relative w-full h-48">
                        <Image
                          src={watch("thumbnail")!}
                          alt="Aperçu formation"
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">
                        {watch("title") || "Titre de la formation"}
                      </h4>
                      
                      {watch("description") && (
                        <div 
                          className="text-sm text-gray-600 mb-3 line-clamp-3"
                          dangerouslySetInnerHTML={{ __html: watch("description") }}
                        />
                      )}
                      
                      <div className="flex items-center space-x-3 text-sm">
                        {watch("level") && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {watch("level")}
                          </span>
                        )}
                        

                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>L&apos;aperçu apparaîtra ici</p>
                    <p className="text-sm">au fur et à mesure que vous remplissez le formulaire</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 