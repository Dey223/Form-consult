import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Récupérer la leçon avec vérification des permissions
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

    console.log(`🔍 Quiz API - Recherche leçon ${lessonId} pour utilisateur ${session.user.id}`);
    console.log(`🔍 Leçon trouvée:`, lesson ? `${lesson.title} (type: ${lesson.type})` : 'NON TROUVÉE');

    if (!lesson) {
      // Essayons de trouver la leçon sans restrictions pour debug
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
      
      console.log(`🔍 Debug - Leçon existe:`, lessonDebug ? `${lessonDebug.title} dans formation ${lessonDebug.section.formation.title}` : 'NON TROUVÉE');
      
      return NextResponse.json(
        { error: "Leçon non trouvée ou accès non autorisé" },
        { status: 404 }
      );
    }

    // Vérifier que la leçon est de type QUIZ
    if (lesson.type !== "QUIZ") {
      return NextResponse.json(
        { error: "Cette leçon n'est pas un quiz" },
        { status: 400 }
      );
    }

    // Tenter de parser le contenu du quiz
    if (!lesson.content) {
      return NextResponse.json(
        { error: "Aucun quiz trouvé pour cette leçon" },
        { status: 404 }
      );
    }

    try {
      const quizData = JSON.parse(lesson.content);
      
      // Validation basique du format du quiz
      if (!quizData.title || !quizData.questions || !Array.isArray(quizData.questions)) {
        return NextResponse.json(
          { error: "Format de quiz invalide" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        id: lesson.id,
        title: quizData.title,
        description: quizData.description || lesson.description,
        questions: quizData.questions,
        passingScore: quizData.passingScore || 70,
        timeLimit: quizData.timeLimit,
        allowRetries: quizData.allowRetries !== false
      });

    } catch (parseError) {
      console.error("Erreur parsing quiz:", parseError);
      return NextResponse.json(
        { error: "Format de quiz invalide" },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Erreur lors de la récupération du quiz:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
} 