import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, BookOpen, Users, BarChart3, Edit, Eye, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";

interface FormationData {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  price: number | null;
  isPublished: boolean;
  isActive: boolean;
  level: string;
  createdAt: Date;
  category: { name: string } | null;
  subCategory: { name: string } | null;
  levelRelation: { name: string } | null;
  sections: Array<{
    id: string;
    lessons: Array<{ id: string }>;
  }>;
  userFormations: Array<{
    id: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
}

export default async function FormationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "FORMATEUR") {
    redirect("/dashboard");
  }

  // Récupérer les vraies formations du formateur connecté
  const formations: FormationData[] = await prisma.formation.findMany({
    where: {
      authorId: session.user.id
    },
    include: {
      category: {
        select: { name: true }
      },
      subCategory: {
        select: { name: true }
      },
      levelRelation: {
        select: { name: true }
      },
      sections: {
        include: {
          lessons: {
            select: { id: true }
          }
        },
        orderBy: {
          orderIndex: 'asc'
        }
      },
      userFormations: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  }) as FormationData[];

  const totalFormations = formations.length;
  const publishedFormations = formations.filter(f => f.isPublished).length;
  const totalStudents = formations.reduce((acc, formation) => 
    acc + formation.userFormations.length, 0
  );
  const totalLessons = formations.reduce((acc, formation) => 
    acc + formation.sections.reduce((sectionAcc, section) => 
      sectionAcc + section.lessons.length, 0
    ), 0
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Mes Formations
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez et créez vos formations
          </p>
        </div>
        <Link
          href="/dashboard/formateur/formations/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle Formation
        </Link>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-lg font-bold text-gray-900">{totalFormations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <BarChart3 className="w-6 h-6 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Publiées</p>
              <p className="text-lg font-bold text-gray-900">{publishedFormations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-purple-600" />
            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-500">Apprenants</p>
                <p className="text-lg font-bold text-gray-900">{totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <BookOpen className="w-6 h-6 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Leçons</p>
              <p className="text-lg font-bold text-gray-900">{totalLessons}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des formations */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Toutes mes formations
          </h2>
        </div>
        <div className="p-6">
          {formations.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Aucune formation
              </h3>
              <p className="text-gray-500 mb-6">
                Commencez par créer votre première formation
              </p>
              <Link
                href="/dashboard/formateur/formations/create"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Créer ma première formation
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {formations.map((formation) => (
                <div
                  key={formation.id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          {formation.thumbnail ? (
                            <img 
                              src={formation.thumbnail} 
                              alt={formation.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <BookOpen className="w-8 h-8 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {formation.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {formation.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{formation.category?.name || "Non catégorisé"}</span>
                            <span>•</span>
                            <span>{formation.subCategory?.name || "Non spécifié"}</span>
                            <span>•</span>
                            <span>{formation.level || formation.levelRelation?.name || "Non défini"}</span>
                            <span>•</span>
                            <span>{formation.price ? `${formation.price}€` : "Gratuit"}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span>
                          {formation.sections.length} section{formation.sections.length > 1 ? 's' : ''}
                        </span>
                        <span>
                          {formation.sections.reduce((acc, section) => acc + section.lessons.length, 0)} leçon{formation.sections.reduce((acc, section) => acc + section.lessons.length, 0) > 1 ? 's' : ''}
                        </span>
                        <span>
                          {formation.userFormations.length} étudiant{formation.userFormations.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          formation.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {formation.isPublished ? "Publiée" : "Brouillon"}
                      </span>

                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/dashboard/formateur/formations/${formation.id}/edit`}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        
                        <Link
                          href={`/formations/${formation.id}`}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        
                        <button
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 