'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Upload, FileVideo, Check, AlertCircle } from 'lucide-react'

interface UploadVideoModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Formation {
  id: string
  title: string
  sections: Array<{
    id: string
    title: string
    orderIndex: number
  }>
}

export function UploadVideoModal({ isOpen, onClose, onSuccess }: UploadVideoModalProps) {
  const [loading, setLoading] = useState(false)
  const [formations, setFormations] = useState<Formation[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle')
  const [formData, setFormData] = useState({
    formationId: '',
    sectionId: '',
    title: '',
    description: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchFormations()
    }
  }, [isOpen])

  const fetchFormations = async () => {
    try {
      const response = await fetch('/api/formations/formateur/my-formations')
      if (response.ok) {
        const data = await response.json()
        setFormations(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('video/')) {
        alert('Veuillez sélectionner un fichier vidéo')
        return
      }

      // Vérifier la taille (limite à 2GB pour la démo)
      const maxSize = 2 * 1024 * 1024 * 1024 // 2GB
      if (file.size > maxSize) {
        alert('Le fichier est trop volumineux (max 2GB)')
        return
      }

      setSelectedFile(file)
      setFormData(prev => ({
        ...prev,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '') // Nom sans extension
      }))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      alert('Veuillez sélectionner un fichier vidéo')
      return
    }

    setLoading(true)
    setUploadStatus('uploading')
    setUploadProgress(0)

    try {
      // 1. Créer l'URL d'upload Mux
      const uploadResponse = await fetch('/api/mux/create-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: selectedFile.name,
          lessonData: formData
        })
      })

      if (!uploadResponse.ok) {
        throw new Error('Erreur lors de la création de l\'upload')
      }

      const { uploadUrl, lessonId } = await uploadResponse.json()

      // 2. Upload du fichier vers Mux
      const xhr = new XMLHttpRequest()

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100
          setUploadProgress(progress)
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          setUploadStatus('processing')
          setUploadProgress(100)
          
          // Polling pour vérifier le statut
          pollUploadStatus(lessonId)
        } else {
          setUploadStatus('error')
          alert('Erreur lors de l\'upload')
        }
      }

      xhr.onerror = () => {
        setUploadStatus('error')
        alert('Erreur lors de l\'upload')
      }

      xhr.open('PUT', uploadUrl)
      xhr.setRequestHeader('Content-Type', selectedFile.type)
      xhr.send(selectedFile)

    } catch (error) {
      console.error('Erreur:', error)
      setUploadStatus('error')
      alert('Erreur lors de l\'upload')
      setLoading(false)
    }
  }

  const pollUploadStatus = async (lessonId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/lessons/${lessonId}/status`)
        const data = await response.json()

        if (data.status === 'ready') {
          clearInterval(pollInterval)
          setUploadStatus('completed')
          setLoading(false)
          setTimeout(() => {
            onSuccess()
          }, 2000)
        } else if (data.status === 'errored') {
          clearInterval(pollInterval)
          setUploadStatus('error')
          setLoading(false)
          alert('Erreur lors du traitement de la vidéo')
        }
      } catch (error) {
        console.error('Erreur polling:', error)
      }
    }, 3000) // Vérifier toutes les 3 secondes

    // Timeout après 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval)
      if (uploadStatus === 'processing') {
        setUploadStatus('completed')
        setLoading(false)
        onSuccess()
      }
    }, 600000)
  }

  const getSelectedFormation = () => {
    return formations.find(f => f.id === formData.formationId)
  }

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <Upload className="h-5 w-5 text-blue-600 animate-pulse" />
      case 'processing':
        return <FileVideo className="h-5 w-5 text-yellow-600 animate-pulse" />
      case 'completed':
        return <Check className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Upload className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusMessage = () => {
    switch (uploadStatus) {
      case 'uploading':
        return `Upload en cours... ${Math.round(uploadProgress)}%`
      case 'processing':
        return 'Traitement de la vidéo par Mux...'
      case 'completed':
        return 'Vidéo uploadée et traitée avec succès !'
      case 'error':
        return 'Erreur lors de l\'upload'
      default:
        return 'Prêt à uploader'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FileVideo className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Uploader une vidéo</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection du fichier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fichier vidéo *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                disabled={loading}
                className="hidden"
                id="video-upload"
              />
              <label htmlFor="video-upload" className="cursor-pointer">
                <FileVideo className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                {selectedFile ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600">Cliquez pour sélectionner une vidéo</p>
                    <p className="text-xs text-gray-500">MP4, MOV, AVI (max 2GB)</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Statut d'upload */}
          {uploadStatus !== 'idle' && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon()}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{getStatusMessage()}</p>
                  {uploadStatus === 'uploading' && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sélection de la formation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formation *
            </label>
            <select
              name="formationId"
              value={formData.formationId}
              onChange={handleInputChange}
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner une formation</option>
              {formations.map(formation => (
                <option key={formation.id} value={formation.id}>
                  {formation.title}
                </option>
              ))}
            </select>
          </div>

          {/* Sélection de la section */}
          {formData.formationId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section *
              </label>
              <select
                name="sectionId"
                value={formData.sectionId}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une section</option>
                {getSelectedFormation()?.sections.map(section => (
                  <option key={section.id} value={section.id}>
                    {section.orderIndex}. {section.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Informations de la leçon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre de la leçon *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Introduction aux concepts de base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={loading}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description de ce que les étudiants vont apprendre dans cette leçon..."
            />
          </div>



          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {uploadStatus === 'completed' ? 'Fermer' : 'Annuler'}
            </Button>
            {uploadStatus !== 'completed' && (
              <Button type="submit" disabled={loading || !selectedFile}>
                {loading ? 'Upload en cours...' : 'Uploader la vidéo'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
} 