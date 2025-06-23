"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MuxData, Resource, Section, Lesson } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Loader2, Trash, Eye, EyeOff, Save, X } from "lucide-react";

import { Button } from '@/components/ui/button';
import RichEditor from './RichEditor';
import toast from "react-hot-toast";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Le titre est requis et doit contenir au moins 2 caractères",
  }),
  description: z.string().optional(),
  isFree: z.boolean().optional(),
});

interface EditSectionFormProps {
  section: Section & { 
    lessons: (Lesson & { muxData?: MuxData | null })[];
    resources: Resource[];
  };
  formationId: string;
  isCompleted: boolean;
}

export default function EditSectionForm({
  section,
  formationId,
  isCompleted,
}: EditSectionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: section.title,
      description: section.description || "",
      isFree: section.isFree,
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/formations/${formationId}/sections/${section.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      router.refresh();
      // Optionnel: afficher un toast de succès
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la mise à jour de la section");
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette section ?")) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/formations/${formationId}/sections/${section.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      router.push(`/dashboard/formateur/formations/${formationId}/curriculum`);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression de la section");
    } finally {
      setIsDeleting(false);
    }
  };

  const togglePublish = async () => {
    try {
      const endpoint = section.isPublished 
        ? `/api/formations/${formationId}/sections/${section.id}/unpublish`
        : `/api/formations/${formationId}/sections/${section.id}/publish`;
      
      const response = await fetch(endpoint, { method: "POST" });
      
      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header avec navigation */}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between mb-7">
        <Link 
          href={`/dashboard/formateur/formations/${formationId}/curriculum`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au curriculum
        </Link>

        <div className="flex gap-3 items-center">
          <Button
            onClick={togglePublish}
            disabled={!isCompleted}
            variant={section.isPublished ? "secondary" : "default"}
            size="sm"
          >
            {section.isPublished ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Dépublier
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Publier
              </>
            )}
          </Button>
          
          <Button
            onClick={onDelete}
            disabled={isDeleting}
            variant="destructive"
            size="sm"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash className="h-4 w-4 mr-2" />
                Supprimer
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Titre et description */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Détails de la section
        </h1>
        <p className="text-gray-600">
          Complétez cette section avec des informations détaillées pour offrir la meilleure expérience d'apprentissage à vos étudiants
        </p>
      </div>

      {/* Statut */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Statut de la section</h3>
            <p className="text-sm text-gray-600">
              {isCompleted 
                ? "Cette section est prête à être publiée" 
                : "Complétez les champs requis pour publier"
              }
            </p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            section.isPublished
              ? 'bg-green-100 text-green-800'
              : isCompleted
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {section.isPublished ? 'Publiée' : isCompleted ? 'Prête' : 'Brouillon'}
          </span>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Titre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            {...form.register("title")}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Introduction au développement web"
          />
          {form.formState.errors.title && (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            {...form.register("description")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="De quoi parle cette section ?"
            rows={4}
          />
          {form.formState.errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>

        {/* Accessibilité */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">Accessibilité</h3>
            <p className="text-sm text-gray-600">
              Permettre à tous d'accéder à cette section gratuitement
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              {...form.register("isFree")}
              type="checkbox"
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <Link href={`/dashboard/formateur/formations/${formationId}/curriculum`}>
            <Button variant="outline" type="button">
              Annuler
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={!isValid || isSubmitting || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting || isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Statistiques */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900">Leçons</h4>
          <p className="text-2xl font-bold text-blue-700">{section.lessons.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900">Ressources</h4>
          <p className="text-2xl font-bold text-green-700">{section.resources.length}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-medium text-purple-900">Durée</h4>
          <p className="text-2xl font-bold text-purple-700">
            {Math.floor(section.lessons.reduce((total, lesson) => total + lesson.duration, 0) / 60)} min
          </p>
        </div>
      </div>
    </div>
  );
} 