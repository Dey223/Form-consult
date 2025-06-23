import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const quizResultSchema = z.object({
  score: z.number().min(0).max(100),
  passed: z.boolean(),
  completedAt: z.string().optional(),
  answers: z.array(z.any()).optional()
});

export async function POST(
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

    const body = await request.json();
    const validatedData = quizResultSchema.parse(body);

    // Vérifier que la leçon existe et que l'utilisateur y a accès
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        OR: [
          // Formateur propriétaire : accès à toutes ses leçons (publiées ou non)
          {
            section: {
              formation: {
                authorId: session.user.id
              }
            }
          },
          // Autres utilisateurs : seulement les leçons et formations publiées
          {
            isPublished: true,
            section: {
              formation: {
                isPublished: true
              }
            }
          }
        ]
      },
      include: {
        section: {
          include: {
            formation: true
          }
        }
      }
    });

    console.log(`🔍 Quiz Results API - Recherche leçon ${lessonId} pour utilisateur ${session.user.id}`);
    console.log(`🔍 Leçon trouvée:`, lesson ? `${lesson.title} (type: ${lesson.type})` : 'NON TROUVÉE');

    if (!lesson) {
      // Debug pour comprendre pourquoi la leçon n'est pas trouvée
      const lessonDebug = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          section: {
            include: {
              formation: true
            }
          }
        }
      });
      
      console.log(`🔍 Debug - Leçon existe:`, lessonDebug ? `${lessonDebug.title} dans formation ${lessonDebug.section.formation.title} (publiée: ${lessonDebug.section.formation.isPublished})` : 'NON TROUVÉE');
      
      return NextResponse.json(
        { error: "Leçon non trouvée ou accès non autorisé" },
        { status: 404 }
      );
    }

    // Vérifier que la leçon est un quiz
    if (lesson.type !== "QUIZ") {
      return NextResponse.json(
        { error: "Cette leçon n'est pas un quiz" },
        { status: 400 }
      );
    }

    try {
      // Sauvegarder le résultat dans la base de données
      // Note: Vous devez créer une table QuizResult dans votre schéma Prisma
      // Pour l'instant, on va le sauvegarder comme un log
      
      console.log(`Quiz result saved for user ${session.user.id}:`, {
        lessonId: lessonId,
        score: validatedData.score,
        passed: validatedData.passed,
        completedAt: validatedData.completedAt || new Date().toISOString()
      });

      // Si le quiz est réussi, mettre à jour la progression de la leçon
      if (validatedData.passed) {
        // Vérifier s'il existe déjà une progression pour cette leçon
        const existingProgress = await prisma.userLessonProgress.findFirst({
          where: {
            userId: session.user.id,
            lessonId: lessonId
          }
        });

        if (existingProgress) {
          // Mettre à jour la progression existante
          await prisma.userLessonProgress.update({
            where: {
              id: existingProgress.id
            },
            data: {
              isCompleted: true,
              watchedSeconds: lesson.duration || 0,
              completedAt: new Date()
            }
          });
        } else {
          // Créer une nouvelle progression
          await prisma.userLessonProgress.create({
            data: {
              userId: session.user.id,
              lessonId: lessonId,
              isCompleted: true,
              watchedSeconds: lesson.duration || 0,
              completedAt: new Date()
            }
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: "Résultat du quiz sauvegardé avec succès",
        score: validatedData.score,
        passed: validatedData.passed
      });

    } catch (saveError) {
      console.error("Erreur lors de la sauvegarde:", saveError);
      return NextResponse.json(
        { error: "Erreur lors de la sauvegarde" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Erreur lors de la sauvegarde du résultat du quiz:", error);
    
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