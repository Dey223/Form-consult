import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateLessonSchema = z.object({
  title: z.string().min(2, "Le titre doit contenir au moins 2 caractères"),
  description: z.string().optional(),
  type: z.enum(["VIDEO", "TEXT", "QUIZ", "DOCUMENT"]),
  duration: z.number().min(0),
  isPublished: z.boolean(),
  isFree: z.boolean(),
  videoUrl: z.string().optional(),
  muxAssetId: z.string().optional(),
  muxPlaybackId: z.string().optional(),
  quizData: z.any().optional(), // Données du quiz
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Attendre les paramètres
    const { lessonId } = await params;

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        section: {
          formation: {
            OR: [
              { authorId: session.user.id },
              { 
                userFormations: {
                  some: {
                    userId: session.user.id
                  }
                }
              }
            ]
          }
        }
      },
      include: {
        section: {
          include: {
            formation: true
          }
        },
        muxData: true
      }
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Leçon non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Erreur lors de la récupération de la leçon:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
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
    const { lessonId } = await params;

    const body = await request.json();
    const validatedData = updateLessonSchema.parse(body);

    // Vérifier que la leçon appartient au formateur
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        section: {
          formation: {
            authorId: session.user.id,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Leçon non trouvée" },
        { status: 404 }
      );
    }

    // Mettre à jour la leçon
    const updatedLesson = await prisma.lesson.update({
      where: {
        id: lessonId,
      },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        type: validatedData.type,
        duration: validatedData.duration,
        isPublished: validatedData.isPublished,
        isFree: validatedData.isFree,
        videoUrl: validatedData.videoUrl,
        muxAssetId: validatedData.muxAssetId,
        muxPlaybackId: validatedData.muxPlaybackId,
        content: validatedData.quizData ? JSON.stringify(validatedData.quizData) : undefined,
      },
    });

    return NextResponse.json(updatedLesson);
  } catch (error) {
    console.error("Erreur lors de la modification de la leçon:", error);
    
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
  { params }: { params: Promise<{ lessonId: string }> }
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
    const { lessonId } = await params;

    // Vérifier que la leçon appartient au formateur
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        section: {
          formation: {
            authorId: session.user.id,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Leçon non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer l'asset Mux s'il existe
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

    // Supprimer la leçon
    await prisma.lesson.delete({
      where: {
        id: lessonId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de la leçon:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
} 