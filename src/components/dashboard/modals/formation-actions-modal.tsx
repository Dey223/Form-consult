'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import {
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Users,
  BookOpen,
  Clock,
  AlertCircle
} from 'lucide-react'

interface Formation {
  id: string
  title: string
  description: string
  level: string
  isPublished: boolean
  isActive: boolean
  createdAt: string
  author: { name: string; email: string } | null
  category: { name: string } | null
  subCategory: { name: string } | null
  sections: Array<{
    id: string
    title: string
    isPublished: boolean
    lessons: Array<{
      id: string
      title: string
      isPublished: boolean
      duration: number
    }>
  }>
  userFormations: Array<{
    progress: number
    completedAt: string | null
    user: { name: string }
  }>
  _count: { userFormations: number }
}

interface FormationActionsModalProps {
  isOpen: boolean
  onClose: () => void
  formation: Formation | null
  onToggleActive: (formationId: string, currentIsActive: boolean) => void
  onViewFormation: (formationId: string) => void
  onEditFormation: (formationId: string) => void
}

export function FormationActionsModal({
  isOpen,
  onClose,
  formation,
  onToggleActive,
  onViewFormation,
  onEditFormation
}: FormationActionsModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!formation) return null

  const handleToggleActive = async () => {
    setIsLoading(true)
    try {
      await onToggleActive(formation.id, formation.isActive)
      onClose()
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalDuration = formation.sections.reduce((total, section) => {
    return total + section.lessons.reduce((sectionTotal, lesson) => sectionTotal + lesson.duration, 0)
  }, 0)

  const hours = Math.floor(totalDuration / 60)
  const minutes = totalDuration % 60

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Actions pour "{formation.title}"
          </DialogTitle>
          <DialogDescription>
            Gérer cette formation et ses paramètres d'activation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de la formation */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{formation.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{formation.description}</p>
              </div>
              <div className="flex flex-col gap-1 ml-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  formation.isPublished 
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-500 text-white'
                }`}>
                  {formation.isPublished ? '✅ Publié' : '📝 Brouillon'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  formation.isActive 
                    ? 'bg-blue-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  {formation.isActive ? '🟢 Actif' : '🔴 Inactif'}
                </span>
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>{hours}h {minutes}min</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span>{formation._count.userFormations} étudiants</span>
              </div>
              <div className="flex items-center text-gray-600">
                <BookOpen className="h-4 w-4 mr-2" />
                <span>{formation.sections.length} sections</span>
              </div>
            </div>

            {formation.author && (
              <div className="mt-2 text-sm text-gray-600">
                <strong>Formateur:</strong> {formation.author.name}
              </div>
            )}
          </div>

          {/* Actions principales */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Actions disponibles</h4>
            
            <div className="grid grid-cols-1 gap-3">
              {/* Bouton Voir */}
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => {
                  onViewFormation(formation.id)
                  onClose()
                }}
              >
                <Eye className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Voir la formation</div>
                  <div className="text-sm text-gray-500">Consulter le contenu public</div>
                </div>
              </Button>

              {/* Bouton Éditer */}
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => {
                  onEditFormation(formation.id)
                  onClose()
                }}
              >
                <Edit className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Éditer (lecture seule)</div>
                  <div className="text-sm text-gray-500">Consulter les détails et paramètres</div>
                </div>
              </Button>

              {/* Bouton Activer/Désactiver */}
              <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-gray-900">Contrôle d'activation</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {formation.isActive 
                        ? "Cette formation est actuellement active et visible pour les utilisateurs."
                        : "Cette formation est désactivée et non visible pour les utilisateurs."
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      Note: Ce contrôle technique est indépendant du statut de publication géré par le formateur.
                    </p>
                  </div>
                </div>
                
                <Button
                  variant={formation.isActive ? "destructive" : "default"}
                  onClick={handleToggleActive}
                  disabled={isLoading}
                  className="w-full mt-3"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Modification...
                    </>
                  ) : formation.isActive ? (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Désactiver la formation
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Activer la formation
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 