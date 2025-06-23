import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session?.user?.companyId || session.user.role !== 'ADMIN_ENTREPRISE') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const companyId = session.user.companyId
    const { type, period, format } = await request.json()

    // Récupérer les données selon le type de rapport
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        break
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    }

    let data: any = {}

    if (type === 'formations' || type === 'complete') {
      const employees = await prisma.user.findMany({
        where: { companyId, role: 'EMPLOYE' },
        include: {
          userFormations: {
            include: {
              formation: {
                select: { title: true, level: true, description: true }
              }
            },
            where: {
              updatedAt: { gte: startDate }
            }
          }
        }
      })

      data.formations = employees.flatMap(emp => 
        emp.userFormations.map(uf => ({
          employeeName: emp.name || 'Nom non défini',
          employeeEmail: emp.email,
          formationTitle: uf.formation.title,
          formationLevel: uf.formation.level || 'Non défini',
          progress: uf.progress,
          completed: uf.completedAt ? 'Oui' : 'Non',
          completedDate: uf.completedAt?.toLocaleDateString('fr-FR') || '',
          enrolledDate: uf.createdAt.toLocaleDateString('fr-FR')
        }))
      )
    }

    if (type === 'users' || type === 'complete') {
      const employees = await prisma.user.findMany({
        where: { companyId, role: 'EMPLOYE' },
        include: {
          userFormations: {
            where: {
              updatedAt: { gte: startDate }
            }
          },
          appointments: {
            where: {
              scheduledAt: { gte: startDate }
            }
          }
        }
      })

      data.users = employees.map(emp => ({
        name: emp.name || 'Nom non défini',
        email: emp.email,
        joinDate: emp.createdAt.toLocaleDateString('fr-FR'),
        lastActivity: emp.updatedAt.toLocaleDateString('fr-FR'),
        totalFormations: emp.userFormations.length,
        completedFormations: emp.userFormations.filter(uf => uf.completedAt).length,
        averageProgress: emp.userFormations.length > 0 
          ? Math.round(emp.userFormations.reduce((sum, uf) => sum + uf.progress, 0) / emp.userFormations.length)
          : 0,
        consultations: emp.appointments.length,
        status: emp.userFormations.length > 0 || emp.appointments.length > 0 ? 'Actif' : 'Inactif'
      }))
    }

    if (type === 'consultations' || type === 'complete') {
      const appointments = await prisma.appointment.findMany({
        where: {
          companyId,
          scheduledAt: { gte: startDate }
        },
        include: {
          user: {
            select: { name: true, email: true }
          },
          consultant: {
            select: { name: true, email: true }
          }
        }
      })

      data.consultations = appointments.map(apt => ({
        title: apt.title,
        employeeName: apt.user.name || 'Nom non défini',
        employeeEmail: apt.user.email,
        consultantName: apt.consultant?.name || 'Non assigné',
        consultantEmail: apt.consultant?.email || '',
        scheduledDate: apt.scheduledAt.toLocaleDateString('fr-FR'),
        duration: apt.duration || 60,
        status: apt.status,
        createdDate: apt.createdAt.toLocaleDateString('fr-FR')
      }))
    }

    // Générer le fichier selon le format
    if (format === 'csv') {
      return generateCSV(data, type, period)
    } else if (format === 'excel') {
      return generateExcel(data, type, period)
    } else {
      return generatePDF(data, type, period)
    }

  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

function generateCSV(data: any, type: string, period: string) {
  let csvContent = `# Rapport ${type} - ${period}\n# Généré le ${new Date().toLocaleDateString('fr-FR')}\n\n`
  
  if (type === 'formations' || type === 'complete') {
    if (data.formations && data.formations.length > 0) {
      csvContent += 'FORMATIONS\n'
      csvContent += 'Nom Employé,Email,Formation,Niveau,Progrès,Terminé,Date Completion,Date Inscription\n'
      data.formations.forEach((row: any) => {
        csvContent += `"${row.employeeName}","${row.employeeEmail}","${row.formationTitle}","${row.formationLevel}",${row.progress}%,"${row.completed}","${row.completedDate}","${row.enrolledDate}"\n`
      })
      csvContent += '\n'
    }
  }
  
  if (type === 'users' || type === 'complete') {
    if (data.users && data.users.length > 0) {
      csvContent += 'UTILISATEURS\n'
      csvContent += 'Nom,Email,Date Inscription,Dernière Activité,Total Formations,Formations Terminées,Progrès Moyen,Consultations,Statut\n'
      data.users.forEach((row: any) => {
        csvContent += `"${row.name}","${row.email}","${row.joinDate}","${row.lastActivity}",${row.totalFormations},${row.completedFormations},${row.averageProgress}%,${row.consultations},"${row.status}"\n`
      })
      csvContent += '\n'
    }
  }
  
  if (type === 'consultations' || type === 'complete') {
    if (data.consultations && data.consultations.length > 0) {
      csvContent += 'CONSULTATIONS\n'
      csvContent += 'Titre,Employé,Email Employé,Consultant,Email Consultant,Date Programmée,Durée,Statut,Date Création\n'
      data.consultations.forEach((row: any) => {
        csvContent += `"${row.title}","${row.employeeName}","${row.employeeEmail}","${row.consultantName}","${row.consultantEmail}","${row.scheduledDate}",${row.duration},"${row.status}","${row.createdDate}"\n`
      })
    }
  }

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="rapport-${type}-${period}-${new Date().toISOString().slice(0,10)}.csv"`
    }
  })
}

function generateExcel(data: any, type: string, period: string) {
  // Génération d'un fichier HTML compatible Excel
  let htmlContent = `
    <html xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta charset="utf-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>Rapport ${type} - ${period}</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .header { text-align: center; margin-bottom: 20px; }
          .section-title { font-size: 16px; font-weight: bold; margin: 20px 0 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Rapport ${type.charAt(0).toUpperCase() + type.slice(1)}</h1>
          <p>Période: ${period} | Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
  `

  if (type === 'formations' || type === 'complete') {
    if (data.formations && data.formations.length > 0) {
      htmlContent += `
        <div class="section-title">FORMATIONS (${data.formations.length})</div>
        <table>
          <tr>
            <th>Nom Employé</th><th>Email</th><th>Formation</th><th>Niveau</th>
            <th>Progrès</th><th>Terminé</th><th>Date Completion</th><th>Date Inscription</th>
          </tr>
      `
      data.formations.forEach((row: any) => {
        htmlContent += `
          <tr>
            <td>${row.employeeName}</td>
            <td>${row.employeeEmail}</td>
            <td>${row.formationTitle}</td>
            <td>${row.formationLevel}</td>
            <td>${row.progress}%</td>
            <td>${row.completed}</td>
            <td>${row.completedDate}</td>
            <td>${row.enrolledDate}</td>
          </tr>
        `
      })
      htmlContent += '</table>'
    }
  }

  if (type === 'users' || type === 'complete') {
    if (data.users && data.users.length > 0) {
      htmlContent += `
        <div class="section-title">UTILISATEURS (${data.users.length})</div>
        <table>
          <tr>
            <th>Nom</th><th>Email</th><th>Date Inscription</th><th>Dernière Activité</th>
            <th>Total Formations</th><th>Formations Terminées</th><th>Progrès Moyen</th><th>Consultations</th><th>Statut</th>
          </tr>
      `
      data.users.forEach((row: any) => {
        htmlContent += `
          <tr>
            <td>${row.name}</td>
            <td>${row.email}</td>
            <td>${row.joinDate}</td>
            <td>${row.lastActivity}</td>
            <td>${row.totalFormations}</td>
            <td>${row.completedFormations}</td>
            <td>${row.averageProgress}%</td>
            <td>${row.consultations}</td>
            <td>${row.status}</td>
          </tr>
        `
      })
      htmlContent += '</table>'
    }
  }

  if (type === 'consultations' || type === 'complete') {
    if (data.consultations && data.consultations.length > 0) {
      htmlContent += `
        <div class="section-title">CONSULTATIONS (${data.consultations.length})</div>
        <table>
          <tr>
            <th>Titre</th><th>Employé</th><th>Email Employé</th><th>Consultant</th>
            <th>Email Consultant</th><th>Date Programmée</th><th>Durée</th><th>Statut</th><th>Date Création</th>
          </tr>
      `
      data.consultations.forEach((row: any) => {
        htmlContent += `
          <tr>
            <td>${row.title}</td>
            <td>${row.employeeName}</td>
            <td>${row.employeeEmail}</td>
            <td>${row.consultantName}</td>
            <td>${row.consultantEmail}</td>
            <td>${row.scheduledDate}</td>
            <td>${row.duration}min</td>
            <td>${row.status}</td>
            <td>${row.createdDate}</td>
          </tr>
        `
      })
      htmlContent += '</table>'
    }
  }

  htmlContent += '</body></html>'

  return new NextResponse(htmlContent, {
    headers: {
      'Content-Type': 'application/vnd.ms-excel',
      'Content-Disposition': `attachment; filename="rapport-${type}-${period}-${new Date().toISOString().slice(0,10)}.xls"`
    }
  })
}

function generatePDF(data: any, type: string, period: string) {
  // Génération d'un fichier HTML stylé pour impression/PDF
  let htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Rapport ${type} - ${period}</title>
        <style>
          @page { margin: 2cm; }
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.4;
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px;
            border-bottom: 2px solid #3B82F6;
            padding-bottom: 20px;
          }
          .header h1 { 
            color: #3B82F6; 
            margin: 0;
            font-size: 24px;
          }
          .header p { 
            margin: 10px 0 0 0; 
            color: #666;
          }
          .section { 
            margin-bottom: 30px; 
            page-break-inside: avoid;
          }
          .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            margin: 20px 0 15px 0;
            color: #1F2937;
            border-left: 4px solid #3B82F6;
            padding-left: 10px;
          }
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin-bottom: 20px;
            font-size: 12px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
          }
          th { 
            background-color: #F3F4F6; 
            font-weight: bold;
            color: #374151;
          }
          .summary { 
            background-color: #F9FAFB; 
            padding: 15px; 
            border-radius: 8px; 
            margin-bottom: 20px;
            border-left: 4px solid #10B981;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            text-align: center;
            font-size: 10px;
            color: #6B7280;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Rapport d'Activité - ${type.charAt(0).toUpperCase() + type.slice(1)}</h1>
          <p>Période: ${period} | Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        </div>
  `

  if (type === 'formations' || type === 'complete') {
    if (data.formations && data.formations.length > 0) {
      const completedFormations = data.formations.filter((f: any) => f.completed === 'Oui').length
      const completionRate = Math.round((completedFormations / data.formations.length) * 100)
      
      htmlContent += `
        <div class="section">
          <div class="section-title">FORMATIONS</div>
          <div class="summary">
            <h3>Résumé</h3>
            <p><strong>Total des inscriptions:</strong> ${data.formations.length}</p>
            <p><strong>Formations terminées:</strong> ${completedFormations}</p>
            <p><strong>Taux de completion:</strong> ${completionRate}%</p>
          </div>
          
          <table>
            <tr>
              <th>Employé</th><th>Formation</th><th>Niveau</th><th>Progrès</th>
              <th>Statut</th><th>Date Completion</th>
            </tr>
      `
      data.formations.forEach((row: any) => {
        htmlContent += `
          <tr>
            <td>${row.employeeName}</td>
            <td>${row.formationTitle}</td>
            <td>${row.formationLevel}</td>
            <td>${row.progress}%</td>
            <td style="color: ${row.completed === 'Oui' ? '#10B981' : '#F59E0B'}">${row.completed}</td>
            <td>${row.completedDate}</td>
          </tr>
        `
      })
      htmlContent += '</table></div>'
    }
  }

  if (type === 'users' || type === 'complete') {
    if (data.users && data.users.length > 0) {
      const activeUsers = data.users.filter((u: any) => u.status === 'Actif').length
      const engagementRate = Math.round((activeUsers / data.users.length) * 100)
      
      htmlContent += `
        <div class="section">
          <div class="section-title">UTILISATEURS</div>
          <div class="summary">
            <h3>Résumé</h3>
            <p><strong>Total utilisateurs:</strong> ${data.users.length}</p>
            <p><strong>Utilisateurs actifs:</strong> ${activeUsers}</p>
            <p><strong>Taux d'engagement:</strong> ${engagementRate}%</p>
          </div>
          
          <table>
            <tr>
              <th>Nom</th><th>Email</th><th>Formations</th><th>Progrès Moyen</th>
              <th>Consultations</th><th>Statut</th>
            </tr>
      `
      data.users.forEach((row: any) => {
        htmlContent += `
          <tr>
            <td>${row.name}</td>
            <td>${row.email}</td>
            <td>${row.completedFormations}/${row.totalFormations}</td>
            <td>${row.averageProgress}%</td>
            <td>${row.consultations}</td>
            <td style="color: ${row.status === 'Actif' ? '#10B981' : '#6B7280'}">${row.status}</td>
          </tr>
        `
      })
      htmlContent += '</table></div>'
    }
  }

  if (type === 'consultations' || type === 'complete') {
    if (data.consultations && data.consultations.length > 0) {
      const completedConsultations = data.consultations.filter((c: any) => c.status === 'COMPLETED').length
      const avgDuration = Math.round(data.consultations.reduce((sum: number, c: any) => sum + c.duration, 0) / data.consultations.length)
      
      htmlContent += `
        <div class="section">
          <div class="section-title">CONSULTATIONS</div>
          <div class="summary">
            <h3>Résumé</h3>
            <p><strong>Total consultations:</strong> ${data.consultations.length}</p>
            <p><strong>Consultations terminées:</strong> ${completedConsultations}</p>
            <p><strong>Durée moyenne:</strong> ${avgDuration} minutes</p>
          </div>
          
          <table>
            <tr>
              <th>Titre</th><th>Employé</th><th>Consultant</th><th>Date</th>
              <th>Durée</th><th>Statut</th>
            </tr>
      `
      data.consultations.forEach((row: any) => {
        htmlContent += `
          <tr>
            <td>${row.title}</td>
            <td>${row.employeeName}</td>
            <td>${row.consultantName}</td>
            <td>${row.scheduledDate}</td>
            <td>${row.duration}min</td>
            <td style="color: ${row.status === 'COMPLETED' ? '#10B981' : '#F59E0B'}">${row.status}</td>
          </tr>
        `
      })
      htmlContent += '</table></div>'
    }
  }

  htmlContent += `
        <div class="footer">
          <p>Ce rapport a été généré automatiquement par le système de gestion de formation.</p>
          <p>Pour toute question, contactez l'équipe support.</p>
        </div>
      </body>
    </html>
  `

  return new NextResponse(htmlContent, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `attachment; filename="rapport-${type}-${period}-${new Date().toISOString().slice(0,10)}.html"`
    }
  })
} 