import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditSectionForm from "@/components/dashboard/formateur-tabs/EditSectionForm";

interface PageProps {
  params: { 
    formationId: string;
    sectionId: string;
  };
}

export default async function SectionDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "FORMATEUR") {
    redirect("/dashboard");
  }

  // Récupérer la formation pour vérifier les permissions
  const formation = await prisma.formation.findFirst({
    where: {
      id: params.formationId,
      authorId: session.user.id,
    },
  });

  if (!formation) {
    redirect("/dashboard/formateur/formations");
  }

  // Récupérer la section avec ses leçons et ressources
  const section = await prisma.section.findFirst({
    where: {
      id: params.sectionId,
      formationId: params.formationId,
    },
    include: {
      lessons: {
        include: {
          muxData: true,
        },
        orderBy: { orderIndex: "asc" },
      },
      resources: true,
    },
  });

  if (!section) {
    redirect(`/dashboard/formateur/formations/${params.formationId}/curriculum`);
  }

  // Vérifier si la section est complète
  const isCompleted = !!(
    section.title &&
    section.description
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <EditSectionForm
          section={section}
          formationId={params.formationId}
          isCompleted={isCompleted}
        />
      </div>
    </div>
  );
} 