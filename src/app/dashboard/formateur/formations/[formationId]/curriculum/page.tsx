import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, BookOpen, Plus } from "lucide-react";
import CurriculumTab from "@/components/dashboard/formateur-tabs/CurriculumTab";

interface PageProps {
  params: Promise<{ formationId: string }>;
}

export default async function CurriculumPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "FORMATEUR") {
    redirect("/dashboard");
  }

  // Attendre les paramètres
  const { formationId } = await params;

  // Récupérer la formation avec ses sections et leçons
  const formation = await prisma.formation.findFirst({
    where: {
      id: formationId,
      authorId: session.user.id,
    },
    include: {
      sections: {
        include: {
          lessons: {
            include: {
              muxData: true,
            },
            orderBy: { orderIndex: "asc" },
          },
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!formation) {
    redirect("/dashboard/formateur/formations");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href={`/dashboard/formateur/formations/${formation.id}/edit`}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour à l'édition
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <BookOpen className="w-4 h-4 mr-2" />
                <span>Curriculum - {formation.title}</span>
              </div>
              
              {/* Bouton pour créer une nouvelle formation */}
              <Link
                href="/dashboard/formateur/formations/create"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle formation
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <CurriculumTab formation={formation} />
        </div>
      </div>
    </div>
  );
} 