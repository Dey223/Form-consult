import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSectionSchema = z.object({
  title: z.string().min(2, "Le titre doit contenir au moins 2 caractères"),
  description: z.string().optional(),
  isPublished: z.boolean(),
  isFree: z.boolean(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    if (session.user.role !== "FORMATEUR") {
      return NextResponse.json(
        { error: "Accès interdit" },
        { status: 403 }
      );
    }

    // Attendre les paramètres
    const { sectionId } = await params;

    const body = await request.json();
    const validatedData = updateSectionSchema.parse(body);

    // Vérifier que la section appartient au formateur
    const section = await prisma.section.findFirst({
      where: {
        id: sectionId,
        formation: {
          authorId: session.user.id,
        },
      },
    });

    if (!section) {
      return NextResponse.json(
        { error: "Section non trouvée" },
        { status: 404 }
      );
    }

    // Mettre à jour la section
    const updatedSection = await prisma.section.update({
      where: {
        id: sectionId,
      },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        isPublished: validatedData.isPublished,
        isFree: validatedData.isFree,
      },
    });

    return NextResponse.json(updatedSection);
  } catch (error) {
    console.error("Erreur lors de la modification de la section:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    if (session.user.role !== "FORMATEUR") {
      return NextResponse.json(
        { error: "Accès interdit" },
        { status: 403 }
      );
    }

    // Attendre les paramètres
    const { sectionId } = await params;

    // Vérifier que la section appartient au formateur
    const section = await prisma.section.findFirst({
      where: {
        id: sectionId,
        formation: {
          authorId: session.user.id,
        },
      },
      include: {
        lessons: true,
      },
    });

    if (!section) {
      return NextResponse.json(
        { error: "Section non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer toutes les leçons de la section (avec assets Mux si nécessaire)
    for (const lesson of section.lessons) {
      if (lesson.muxAssetId) {
        try {
          await fetch(`${process.env.NEXTAUTH_URL}/api/mux/delete-asset`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ assetId: lesson.muxAssetId }),
          });
        } catch (error) {
          console.error("Erreur suppression asset Mux:", error);
        }
      }
    }

    // Supprimer la section (cascade delete s'occupera des leçons)
    await prisma.section.delete({
      where: {
        id: sectionId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de la section:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
} 