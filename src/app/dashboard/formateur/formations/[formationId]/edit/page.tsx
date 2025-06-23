import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Settings, BookOpen, Image, Users, Star, Clock, Award, FileText } from "lucide-react";
import EditFormationTabs from "@/components/dashboard/formateur-tabs/EditFormationTabs";
import { PublishButton } from "@/components/dashboard/formateur-tabs/PublishButton";

interface PageProps {
  params: Promise<{ formationId: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function EditFormationPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Attendre les paramètres
  const { formationId } = await params;
  const { tab } = await searchParams;

  console.log("🔍 Debugging - User:", {
    id: session.user.id,
    role: session.user.role,
    formationId
  });

  // Récupérer la formation de base (sans filtrer par authorId)
  const formation = await prisma.formation.findFirst({
    where: {
      id: formationId,
    },
    include: {
      category: true,
      subCategory: true,
      levelRelation: true,
    },
  });

  console.log("🔍 Debugging - Formation:", {
    found: !!formation,
    id: formation?.id,
    title: formation?.title,
    authorId: formation?.authorId,
    isPublished: formation?.isPublished,
    isActive: formation?.isActive
  });

  if (!formation) {
    console.log("❌ Formation not found, redirecting to dashboard");
    redirect("/dashboard");
  }

  // Logique d'autorisation granulaire
  const canEdit = session.user.role === "FORMATEUR" && formation.authorId === session.user.id;
  const canView = session.user.role === "SUPER_ADMIN" || 
                  session.user.role === "FORMATEUR" ||
                  (session.user.role === "ADMIN_ENTREPRISE" && formation.isPublished && formation.isActive);
  const isReadOnly = !canEdit;

  console.log("🔍 Debugging - Permissions:", {
    canEdit,
    canView,
    isReadOnly,
    userRole: session.user.role,
    isOwner: formation.authorId === session.user.id
  });

  // Vérifier les permissions de visualisation
  if (!canView) {
    console.log("❌ Access denied, redirecting to dashboard");
    redirect("/dashboard");
  }

  // Récupérer les catégories avec leurs sous-catégories
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc"
    },
    include: {
      subCategories: true
    }
  });

  // Récupérer les niveaux
  const levels = await prisma.level.findMany({
    orderBy: {
      order: "asc"
    }
  });

  // Récupérer les sections avec leçons
  const sections = await prisma.section.findMany({
    where: {
      formationId: formation.id,
    },
    include: {
      lessons: {
        orderBy: { orderIndex: "asc" },
      },
    },
    orderBy: { orderIndex: "asc" },
  });

  // Récupérer les apprenants inscrits
  const students = await prisma.userFormation.findMany({
    where: {
      formationId: formation.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Calculer les statistiques
  const totalLessons = sections.reduce(
    (acc, section) => acc + section.lessons.length,
    0
  );
  const publishedLessons = sections.reduce(
    (acc, section) => acc + section.lessons.filter(lesson => lesson.isPublished).length,
    0
  );
  const totalDuration = sections.reduce(
    (acc, section) => acc + section.lessons.reduce(
      (lessonAcc, lesson) => lessonAcc + lesson.duration,
      0
    ),
    0
  );

  // Champs requis pour publication
  const requiredFields = [
    formation.title,
    formation.description,
    formation.thumbnail,
    formation.price !== null,
    totalLessons > 0,
    publishedLessons > 0,
  ];
  const completedFields = requiredFields.filter(Boolean).length;
  const isComplete = requiredFields.every(Boolean);

  const activeTab = tab || "basics";
  const resources = await prisma.resource.findMany({
    where: {
      formationId: formation.id,
    },
  });
  console.log(resources.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header avec design amélioré */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" />
                Accueil
              </Link>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                <span className="font-medium text-blue-600">{completedFields}</span>
                <span className="text-gray-500">/{requiredFields.length} complétés</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(completedFields / requiredFields.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {Math.round((completedFields / requiredFields.length) * 100)}%
                </span>
              </div>
              
              {canEdit && (
                <PublishButton 
                  formationId={formation.id}
                  isPublished={formation.isPublished}
                  isComplete={isComplete}
                />
              )}
              
              {isReadOnly && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-full">
                  <span>👁️</span>
                  <span>Mode lecture seule</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Titre et infos de la formation avec design amélioré */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8 relative overflow-hidden">
          {/* Gradient background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100 to-purple-100 rounded-full opacity-50 -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full opacity-50 translate-y-12 -translate-x-12"></div>
          
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <Star className="w-6 h-6 text-yellow-500 mr-2" />
                  <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {formation.title}
                  </h1>
                </div>
                
                {formation.description && (
                  <p className="text-gray-600 mb-6 leading-relaxed max-w-3xl">
                    {formation.description.length > 150 
                      ? formation.description.substring(0, 150) + "..." 
                      : formation.description}
                  </p>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center">
                      <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
                      <div>
                        <div className="text-lg font-bold text-blue-900">{sections.length}</div>
                        <div className="text-xs text-blue-600">Sections</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                                        <div className="text-lg font-bold text-green-900">{students.length}</div>
                <div className="text-xs text-green-600">Apprenants</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-purple-600 mr-2" />
                      <div>
                        <div className="text-lg font-bold text-purple-900">
                          {Math.floor(totalDuration / 3600)}h{Math.floor((totalDuration % 3600) / 60)}m
                        </div>
                        <div className="text-xs text-purple-600">Durée</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-orange-600 mr-2" />
                      <div>
                        <div className="text-lg font-bold text-orange-900">{resources.length || 0}</div>
                        <div className="text-xs text-orange-600">Fichiers</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-3 ml-6">
                <span
                  className={`px-4 py-2 text-sm font-semibold rounded-full shadow-lg ${
                    formation.isPublished
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                      : "bg-gradient-to-r from-yellow-400 to-orange-400 text-white"
                  }`}
                >
                  {formation.isPublished ? "✅ Publiée" : "📝 Brouillon"}
                </span>
                
                {formation.category && (
                  <span className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {formation.category.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Onglets avec design moderne */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            <nav className="flex space-x-0 px-6">
              <TabLink 
                href={`/dashboard/formateur/formations/${formation.id}/edit?tab=basics`}
                active={activeTab === "basics"}
                icon={Settings}
              >
                Informations de base
              </TabLink>
              <TabLink 
                href={`/dashboard/formateur/formations/${formation.id}/curriculum`}
                active={activeTab === "sections"}
                icon={BookOpen}
              >
                Sections & Leçons
              </TabLink>
              <TabLink 
                href={`/dashboard/formateur/formations/${formation.id}/edit?tab=resources`}
                active={activeTab === "resources"}
                icon={Image}
              >
                Ressources
              </TabLink>
              <TabLink 
                href={`/dashboard/formateur/formations/${formation.id}/edit?tab=apprenants`}
                active={activeTab === "apprenants"}
                icon={Users}
              >
                Apprenants
              </TabLink>
            </nav>
          </div>

          <div className="p-0">
            <EditFormationTabs
              formation={formation}
              sections={sections}
              students={students}
              activeTab={activeTab}
              isReadOnly={isReadOnly}
              categories={categories.map((category) => ({
                label: category.name,
                value: category.id,
                subCategories: category.subCategories.map((subcategory) => ({
                  label: subcategory.name,
                  value: subcategory.id
                }))
              }))}
              levels={levels.map((level) => ({
                label: level.name,
                value: level.id
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function TabLink({ 
  href, 
  active, 
  icon: Icon, 
  children 
}: { 
  href: string; 
  active: boolean; 
  icon: React.ComponentType<{ className?: string }>; 
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center py-4 px-6 font-medium text-sm transition-all duration-200 ${
        active
          ? "text-blue-600 bg-white border-b-2 border-blue-500 shadow-sm"
          : "text-gray-600 hover:text-blue-600 hover:bg-white/50 border-b-2 border-transparent"
      }`}
    >
      <Icon className={`w-4 h-4 mr-2 ${active ? "text-blue-600" : "text-gray-500"}`} />
      {children}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
      )}
    </Link>
  );
} 