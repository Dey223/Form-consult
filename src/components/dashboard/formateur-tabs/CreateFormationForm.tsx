"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Combobox } from "@/components/ui/combobox";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Le titre est requis et doit contenir au moins 2 caractères",
  }),
  description: z.string().min(10, {
    message: "La description est requise et doit contenir au moins 10 caractères",
  }),
  categoryId: z.string().min(1, {
    message: "La catégorie est requise",
  }),
  subCategoryId: z.string().min(1, {
    message: "La sous-catégorie est requise",
  }),
  levelId: z.string().optional(),
  price: z.number().min(0, {
    message: "Le prix doit être positif",
  }).optional(),
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

export default function CreateFormationForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      subCategoryId: "",
      levelId: "",
      price: 0,
    },
  });

  // Récupérer les données depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, levelsResponse] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/levels")
        ]);

        if (!categoriesResponse.ok || !levelsResponse.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }

        const categoriesData = await categoriesResponse.json();
        const levelsData = await levelsResponse.json();

        setCategories(categoriesData);
        setLevels(levelsData);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setCategories([]);
        setLevels([]);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedCategoryId = watch("categoryId");
  const selectedCategory = categories.find(cat => cat.value === selectedCategoryId);

  if (dataLoading) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/formations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la formation");
      }

      const formation = await response.json();
      router.push(`/dashboard/formateur/formations/${formation.id}/edit`);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la création de la formation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Titre */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Titre de la formation
          </label>
          <input
            {...register("title")}
            type="text"
            id="title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Développement Web pour Débutants"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            {...register("description")}
            id="description"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Décrivez votre formation..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie
          </label>
          <Combobox
            options={categories}
            value={watch("categoryId")}
            onChange={(value) => {
              setValue("categoryId", value);
              setValue("subCategoryId", ""); // Reset subcategory
            }}
            placeholder="Sélectionner une catégorie..."
          />
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
          )}
        </div>

        {/* Sous-catégorie */}
        {selectedCategory && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sous-catégorie
            </label>
            <Combobox
              options={selectedCategory.subCategories}
              value={watch("subCategoryId")}
              onChange={(value) => setValue("subCategoryId", value)}
              placeholder="Sélectionner une sous-catégorie..."
            />
            {errors.subCategoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.subCategoryId.message}</p>
            )}
          </div>
        )}

        {/* Niveau */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Niveau (optionnel)
          </label>
          <Combobox
            options={levels}
            value={watch("levelId")}
            onChange={(value) => setValue("levelId", value)}
            placeholder="Sélectionner un niveau..."
          />
          {errors.levelId && (
            <p className="mt-1 text-sm text-red-600">{errors.levelId.message}</p>
          )}
        </div>

        {/* Prix */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            Prix (€)
          </label>
          <input
            {...register("price", { valueAsNumber: true })}
            type="number"
            id="price"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>

        {/* Boutons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Création..." : "Créer la formation"}
          </button>
        </div>
      </form>
    </div>
  );
} 