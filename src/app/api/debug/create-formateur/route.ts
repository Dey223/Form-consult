import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const hashedPassword = await bcrypt.hash('password123', 12)

    // Créer directement avec SQL pour éviter les problèmes de types
    const result = await prisma.$executeRaw`
      INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'formateur@formconsult.com', 'Marie Formatrice', ${hashedPassword}, 'FORMATEUR', NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        "updatedAt" = NOW()
    `

    // Vérifier que l'utilisateur a été créé
    const user = await prisma.user.findUnique({
      where: { email: 'formateur@formconsult.com' }
    })

    return NextResponse.json({
      message: 'Formateur créé avec succès',
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      } : null,
      sqlResult: result
    })

  } catch (error) {
    console.error('Erreur création formateur:', error)
    return NextResponse.json({
      error: 'Erreur lors de la création',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
} 