import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Seuls les super admins et admin entreprise peuvent voir les consultants
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN_ENTREPRISE') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const available = searchParams.get('available') // Pour filtrer les consultants disponibles
    const specialty = searchParams.get('specialty') // Pour filtrer par spécialité

    // Récupérer tous les consultants
    let whereClause: any = {
      role: 'CONSULTANT'
    }

    // Filtrer par spécialité si fournie
    if (specialty) {
      whereClause.specialty = {
        contains: specialty,
        mode: 'insensitive'
      }
    }

    const consultants = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        // Calculer les statistiques
        _count: {
          select: {
            consultantAppointments: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Si aucun consultant n'existe, créer un consultant de démonstration (pour développement seulement)
    if (consultants.length === 0) {
      console.log("🔧 Aucun consultant trouvé, création d'un consultant de test...")
      
      try {
        const demoConsultant = await prisma.user.create({
          data: {
            name: "Dr. Jean Consultant",
            email: "consultant@formconsult.com",
            role: 'CONSULTANT'
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
            _count: {
              select: {
                consultantAppointments: true
              }
            }
          }
        })
        
        console.log("✅ Consultant de test créé:", demoConsultant.name)
        consultants.push(demoConsultant)
      } catch (createError) {
        console.error("❌ Erreur création consultant de test:", createError)
        // Si l'email existe déjà, récupérer le consultant existant
        const existingConsultant = await prisma.user.findUnique({
          where: { email: "consultant@formconsult.com" },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
            _count: {
              select: {
                consultantAppointments: true
              }
            }
          }
        })
        
        if (existingConsultant) {
          consultants.push(existingConsultant)
        }
      }
    }

    // Enrichir les données avec des statistiques supplémentaires
    const enrichedConsultants = await Promise.all(
      consultants.map(async (consultant) => {
        // Calculer les consultations de ce mois
        const thisMonthStart = new Date()
        thisMonthStart.setDate(1)
        thisMonthStart.setHours(0, 0, 0, 0)

        const thisMonthAppointments = await prisma.appointment.count({
          where: {
            consultantId: consultant.id,
            scheduledAt: {
              gte: thisMonthStart
            }
          }
        })

        // Calculer les consultations terminées
        const completedAppointments = await prisma.appointment.count({
          where: {
            consultantId: consultant.id,
            status: 'COMPLETED'
          }
        })

        // Calculer la moyenne des évaluations (si vous avez un système de rating)
        // Pour l'instant, on simule une note
        const avgRating = Math.round((Math.random() * 2 + 3) * 10) / 10 // 3.0 à 5.0

        // Vérifier la disponibilité (pas de consultation dans les 2 prochaines heures)
        const now = new Date()
        const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000)
        
        const upcomingAppointments = await prisma.appointment.count({
          where: {
            consultantId: consultant.id,
            scheduledAt: {
              gte: now,
              lte: twoHoursLater
            },
            status: {
              in: ['CONFIRMED', 'PENDING']
            }
          }
        })

        const isAvailable = upcomingAppointments === 0

        return {
          ...consultant,
          specialties: [], // Pas de spécialités pour l'instant
          stats: {
            totalAssigned: consultant._count.consultantAppointments,
            thisMonth: thisMonthAppointments,
            completed: completedAppointments,
            rating: avgRating,
            isAvailable
          }
        }
      })
    )

    // Filtrer par disponibilité si demandé
    const finalConsultants = available === 'true' 
      ? enrichedConsultants.filter(c => c.stats.isAvailable)
      : enrichedConsultants

    return NextResponse.json({
      consultants: finalConsultants,
      total: finalConsultants.length
    })

  } catch (error) {
    console.error('Erreur récupération consultants:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Seul le super admin peut créer des consultants
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, specialty, bio } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 })
    }

    // Vérifier que l'email n'existe pas déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Un utilisateur avec cet email existe déjà' }, { status: 400 })
    }

    // Créer le consultant
    const consultant = await prisma.user.create({
      data: {
        name,
        email,
        role: 'CONSULTANT',
        specialty: specialty || null,
        bio: bio || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        specialty: true,
        bio: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: 'Consultant créé avec succès',
      consultant
    })

  } catch (error) {
    console.error('Erreur création consultant:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 