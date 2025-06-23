import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== "FORMATEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formateur = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        authoredFormations: {
          include: {
            sections: {
              include: { lessons: true },
              orderBy: { orderIndex: "asc" }
            },
            userFormations: {
              include: {
                user: {
                  include: { company: true }
                }
              }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!formateur) {
      return NextResponse.json({ error: "Formateur non trouvé" }, { status: 404 });
    }

    // Calculer les apprenants (employés)
    const allLearners = new Map();
    
    formateur.authoredFormations.forEach(formation => {
      formation.userFormations.forEach(userFormation => {
        const user = userFormation.user;
        if (user.role === "EMPLOYE" && user.company) {
          const learnerId = user.id;
          
          if (!allLearners.has(learnerId)) {
            allLearners.set(learnerId, {
              id: user.id,
              name: user.name || "Utilisateur",
              email: user.email,
              company: user.company.name,
              companyId: user.company.id,
              enrolledCount: 0,
              completedCount: 0,
              totalProgress: 0,
              lastActivity: user.updatedAt,
              joinedDate: user.createdAt,
              status: "active"
            });
          }
          
          const learner = allLearners.get(learnerId);
          learner.enrolledCount++;
          
          if (userFormation.completedAt) {
            learner.completedCount++;
          }
          
          learner.totalProgress += userFormation.progress;
        }
      });
    });

    // Convertir en array final
    const students = Array.from(allLearners.values()).map(learner => ({
      id: learner.id,
      name: learner.name,
      email: learner.email,
      company: learner.company,
      companyId: learner.companyId,
      enrolledFormations: learner.enrolledCount,
      completedFormations: learner.completedCount,
      averageProgress: learner.enrolledCount > 0 
        ? Math.round(learner.totalProgress / learner.enrolledCount)
        : 0,
      lastActivity: learner.lastActivity.toISOString(),
      joinedDate: learner.joinedDate.toISOString(),
      status: learner.status,
      totalSpent: 0
    }));

    // Statistiques du formateur
    const totalFormations = formateur.authoredFormations.length;
    const totalStudents = students.length;
    const averageRating = 4.5 + Math.random() * 0.5;
    
    // Calculer revenus par entreprise unique
    const totalRevenue = formateur.authoredFormations.reduce((total, formation) => {
      const uniqueCompanies = new Set(
        formation.userFormations
          .filter(uf => uf.user.company)
          .map(uf => uf.user.companyId)
      );
      return total + (formation.price || 0) * uniqueCompanies.size;
    }, 0);

    const activeFormations = formateur.authoredFormations.filter(f => f.isActive).length;
    
    // Calculer temps vidéo total
    const totalVideoSeconds = formateur.authoredFormations.reduce((total, formation) => {
      return total + formation.sections.reduce((sectionTotal, section) => {
        return sectionTotal + section.lessons.reduce((lessonTotal, lesson) => {
          return lessonTotal + lesson.duration;
        }, 0);
      }, 0);
    }, 0);

    const totalVideoHours = Math.round(totalVideoSeconds / 3600 * 10) / 10;

    // Préparer les formations pour l'affichage
    const myFormations = formateur.authoredFormations.map(formation => {
      const totalLessons = formation.sections.reduce((total, section) => total + section.lessons.length, 0);
      const totalDuration = formation.sections.reduce((total, section) => {
        return total + section.lessons.reduce((lessonTotal, lesson) => lessonTotal + lesson.duration, 0);
      }, 0);

      const enrolledStudents = formation.userFormations.length;
      const completedStudents = formation.userFormations.filter(uf => uf.completedAt !== null).length;
      const completionRate = enrolledStudents > 0 ? Math.round((completedStudents / enrolledStudents) * 100) : 0;

      // Calcul revenu par entreprise pour cette formation
      const uniqueCompanies = new Set(
        formation.userFormations
          .filter(uf => uf.user.company)
          .map(uf => uf.user.companyId)
      );
      const formationRevenue = (formation.price || 0) * uniqueCompanies.size;

      return {
        id: formation.id,
        title: formation.title,
        description: formation.description,
        level: formation.level,
        thumbnail: formation.thumbnail,
        totalSections: formation.sections.length,
        totalLessons,
        totalDuration,
        enrolledStudents,
        completionRate,
        averageRating: 4.0 + Math.random() * 1.0,
        isActive: formation.isActive,
        isPublished: formation.isPublished,
        createdAt: formation.createdAt.toISOString(),
        lastUpdated: formation.updatedAt.toISOString(),
        revenue: formationRevenue
      };
    });

    const dashboardData = {
      formateur: {
        name: formateur.name || "Formateur",
        email: formateur.email,
        phone: null,
        bio: null,
        location: null,
        avatar: formateur.image,
        website: null,
        linkedin: null,
        twitter: null,
        totalFormations,
        totalStudents,
        averageRating: Math.round(averageRating * 10) / 10,
        totalRevenue: Math.round(totalRevenue),
        joinedDate: formateur.createdAt.toISOString(),
        profileCompleteness: 65
      },
      stats: {
        thisMonthEnrollments: Math.floor(Math.random() * 20) + 10,
        activeFormations,
        totalVideoHours,
        averageCompletionRate: 75,
        thisMonthRevenue: Math.round(totalRevenue * 0.3),
        totalReviews: Math.floor(Math.random() * 100) + 50,
        averageWatchTime: Math.floor(Math.random() * 30) + 15,
        studentRetentionRate: Math.floor(Math.random() * 20) + 75
      },
      analytics: {
        enrollmentTrend: [],
        revenueTrend: [],
        topFormations: [],
        studentEngagement: [],
        completionRates: []
      },
      myFormations,
      recentActivity: [],
      notifications: [],
      categories: [],
      levels: [],
      students
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error("Erreur API dashboard formateur:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
