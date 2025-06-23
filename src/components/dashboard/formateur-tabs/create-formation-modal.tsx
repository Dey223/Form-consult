'use client'

import { useState } from 'react'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from '@/components/ui/button'
import { X, Upload, BookOpen, Loader2 } from 'lucide-react'
import { Combobox } from '@/components/ui/combobox'
import ImageUpload from '@/components/dashboard/ImageUpload'
import Image from 'next/image'

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
  price: z.number().min(0, {
    message: "Le prix doit être positif",
  }).optional(),
  thumbnail: z.string().optional(),
})

interface Category {
  label: string;
  value: string;
  subCategories: { label: string; value: string }[];
}

interface Level {
  label: string;
  value: string;
}

interface CreateFormationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  categories: Category[]
  levels: Level[]
}

type FormData = z.infer<typeof formSchema>

export function CreateFormationModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  categories,
  levels 
}: CreateFormationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      price: 0,
      thumbnail: "",
    },
  })

  const { watch, setValue, handleSubmit, formState: { errors, isValid } } = form

  const selectedCategoryId = watch("categoryId")
  const selectedCategory = categories.find(cat => cat.value === selectedCategoryId)

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch("/api/formations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la création de la formation")
      }

      const formation = await response.json()
      onSuccess()
      onClose()
      
      // Optionnel: rediriger vers l'édition
      // window.location.href = `/dashboard/formateur/formations/${formation.id}/edit`
      
    } catch (error) {
      console.error("Erreur:", error)
      alert(error instanceof Error ? error.message : "Erreur lors de la création de la formation")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Créer une nouvelle formation</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Section Image + Titre */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                Téléchargez une image qui servira de vignette pour votre formation. Formats acceptés : JPG, PNG (max 4MB)
              </p>
            </div>

            {/* Informations de base */}
            <div className="space-y-4">
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

              {/* Description courte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description courte *
                </label>
                <textarea
                  {...form.register("description")}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Description courte qui apparaîtra dans les listings..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Aperçu détaillé */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aperçu détaillé
            </label>
            <textarea
              {...form.register("overview")}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description détaillée de ce que les étudiants vont apprendre..."
            />
          </div>

          {/* Catégorie et Sous-catégorie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              <Combobox
                options={categories}
                value={watch("categoryId")}
                onChange={(value) => {
                  setValue("categoryId", value)
                  setValue("subCategoryId", "") // Reset subcategory
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
                  onChange={(value) => setValue("subCategoryId", value)}
                  placeholder="Sélectionner une sous-catégorie..."
                />
                {errors.subCategoryId && (
                  <p className="mt-1 text-sm text-red-600">{errors.subCategoryId.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Niveau et Prix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {/* Niveau de difficulté (optionnel) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau de difficulté
              </label>
              <Combobox
                options={levels}
                value={watch("levelId")}
                onChange={(value) => setValue("levelId", value)}
                placeholder="Sélectionner un niveau..."
              />
            </div>

            {/* Prix */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix (€)
              </label>
              <input
                type="number"
                {...form.register("price", { valueAsNumber: true })}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
          </div>

          {/* Aperçu de la formation */}
          {(watch("title") || watch("thumbnail")) && (
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Aperçu de votre formation
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start space-x-4">
                  {watch("thumbnail") && (
                    <div className="flex-shrink-0 relative w-20 h-20">
                      <Image
                        src={watch("thumbnail")!}
                        alt="Aperçu formation"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-gray-900 truncate">
                      {watch("title") || "Titre de la formation"}
                    </h4>
                    {watch("description") && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {watch("description")}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      {watch("level") && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {watch("level")}
                        </span>
                      )}
                      {watch("price") !== undefined && watch("price")! > 0 && (
                        <span className="font-medium text-green-600">
                          {watch("price")}€
                        </span>
                      )}
                      {watch("price") !== undefined && watch("price") === 0 && (
                        <span className="font-medium text-green-600">
                          Gratuit
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Création...
                </>
              ) : (
                "Créer la formation"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 