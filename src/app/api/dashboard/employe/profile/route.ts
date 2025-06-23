import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "EMPLOYE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { name, email, phone, company: companyData } = await request.json()

    if (!name || !email) {
      return NextResponse.json(
        { error: "Le nom et l'email sont requis" }, 
        { status: 400 }
      )
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
        id: { not: session.user.id }
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé par un autre utilisateur" }, 
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur avec ses informations d'entreprise
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Mettre à jour le profil utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Mettre à jour les informations de l'entreprise si elles sont fournies et si l'utilisateur a une entreprise
    if (companyData && user.companyId) {
      await prisma.company.update({
        where: { id: user.companyId },
        data: {
          email: companyData.email || undefined,
          phone: companyData.phone || undefined,
          address: companyData.address || undefined,
          website: companyData.website || undefined,
        }
      })
    }

    return NextResponse.json({ 
      message: "Profil mis à jour avec succès",
      user: updatedUser
    })

  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "EMPLOYE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            website: true,
            logo: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 