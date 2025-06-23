import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, BookOpen, Users, BarChart3, Settings } from "lucide-react";
import FormateurDashboardStats from "@/components/dashboard/FormateurDashboardStats";

export default async function FormateurDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "FORMATEUR") {
    redirect("/dashboard");
  }

  // Récupérer les statistiques du formateur
  const formations = await prisma.formation.findMany({
    where: {
      authorId: session.user.id,
    },
    include: {
      sections: {
        include: {
          lessons: true,
        },
      },
      userFormations: true,
    },
  });

  const totalFormations = formations.length;
  const publishedFormations = formations.filter(f => f.isActive).length;
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
            Dashboard Formateur
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez vos formations et suivez vos étudiants
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

      {/* Statistiques */}
      <FormateurDashboardStats />

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/dashboard/formateur/formations"
          className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors group"
        >
          <BookOpen className="w-10 h-10 text-blue-600 group-hover:text-blue-700" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Mes Formations
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            Gérez vos formations existantes et créez-en de nouvelles
          </p>
        </Link>

        <Link
          href="/dashboard/formateur/formations/create"
          className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-colors group"
        >
          <Plus className="w-10 h-10 text-green-600 group-hover:text-green-700" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Créer une Formation
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            Commencez une nouvelle formation avec notre outil de création
          </p>
        </Link>

        <Link
          href="/dashboard/formateur/analytics"
          className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors group"
        >
          <BarChart3 className="w-10 h-10 text-purple-600 group-hover:text-purple-700" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Analytiques
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            Suivez les performances et l'engagement de vos étudiants
          </p>
        </Link>
      </div>

      {/* Formations récentes */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Formations Récentes
          </h2>
        </div>
        <div className="p-6">
          {formations.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune formation
              </h3>
              <p className="text-gray-500 mb-4">
                Commencez par créer votre première formation
              </p>
              <Link
                href="/dashboard/formateur/formations/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer ma première formation
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {formations.slice(0, 5).map((formation) => (
                <div
                  key={formation.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {formation.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formation.sections.length} sections • {" "}
                        {formation.sections.reduce((acc, section) => 
                          acc + section.lessons.length, 0
                        )} leçons
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        formation.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {formation.isActive ? "Publiée" : "Brouillon"}
                    </span>
                    <Link
                      href={`/dashboard/formateur/formations/${formation.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Gérer
                    </Link>
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