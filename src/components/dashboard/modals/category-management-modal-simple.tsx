'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Edit, X } from 'lucide-react'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

interface Category {
  id: string
  name: string
  description?: string
  subCategories: Array<{ id: string; name: string }>
  _count: { formations: number }
}

interface CategoryManagementModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  onRefresh?: () => void
}

export function CategoryManagementModal({ 
  isOpen, 
  onClose, 
  categories,
  onRefresh 
}: CategoryManagementModalProps) {
  const [activeTab, setActiveTab] = useState('create-category')
  
  // États pour nouvelle catégorie
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  })
  
  // États pour nouvelle sous-catégorie
  const [newSubCategory, setNewSubCategory] = useState({
    name: '',
    description: '',
    categoryId: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      })
      
      if (response.ok) {
        setNewCategory({ name: '', description: '' })
        onRefresh?.()
        alert('Catégorie créée avec succès !')
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Erreur création catégorie:', error)
      alert('Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubCategory = async () => {
    if (!newSubCategory.name.trim() || !newSubCategory.categoryId) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/categories/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSubCategory.name,
          description: newSubCategory.description,
          categoryId: newSubCategory.categoryId
        })
      })
      
      if (response.ok) {
        setNewSubCategory({ name: '', description: '', categoryId: '' })
        onRefresh?.()
        alert('Sous-catégorie créée avec succès !')
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Erreur création sous-catégorie:', error)
      alert('Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category)
    setShowDeleteDialog(true)
  }

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return
    
    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/categories/${categoryToDelete.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        onRefresh?.()
        setShowDeleteDialog(false)
        setCategoryToDelete(null)
        // Notification de succès silencieuse via l'interface
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Erreur suppression catégorie:', error)
      alert('Erreur lors de la suppression')
    } finally {
      setDeleteLoading(false)
    }
  }

  const tabs = [
    { id: 'create-category', label: 'Nouvelle Catégorie' },
    { id: 'create-subcategory', label: 'Nouvelle Sous-Catégorie' },
    { id: 'manage', label: 'Gérer Existantes' }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🗂️ Gestion des Catégories</DialogTitle>
          <DialogDescription>
            Créez et gérez les catégories et sous-catégories de formations
          </DialogDescription>
        </DialogHeader>

        {/* Onglets simplifiés */}
        <div className="w-full">
          <div className="flex space-x-1 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenu des onglets */}
          <div className="mt-6">
            {/* Onglet Nouvelle Catégorie */}
            {activeTab === 'create-category' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category-name">Nom de la catégorie</Label>
                  <Input
                    id="category-name"
                    placeholder="Ex: Développement Web"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="category-description">Description (optionnelle)</Label>
                  <Textarea
                    id="category-description"
                    placeholder="Description de la catégorie..."
                    value={newCategory.description}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <Button 
                  onClick={handleCreateCategory}
                  disabled={!newCategory.name.trim() || loading}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {loading ? 'Création...' : 'Créer la Catégorie'}
                </Button>
              </div>
            )}

            {/* Onglet Nouvelle Sous-Catégorie */}
            {activeTab === 'create-subcategory' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="parent-category">Catégorie parente</Label>
                  <select
                    id="parent-category"
                    value={newSubCategory.categoryId}
                    onChange={(e) => setNewSubCategory(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    style={{ opacity: newSubCategory.categoryId ? 1 : 0.7 }}
                  >
                    <option value="">Choisir une catégorie</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="subcategory-name">Nom de la sous-catégorie</Label>
                  <Input
                    id="subcategory-name"
                    placeholder="Ex: Frontend React"
                    value={newSubCategory.name}
                    onChange={(e) => setNewSubCategory(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="subcategory-description">Description (optionnelle)</Label>
                  <Textarea
                    id="subcategory-description"
                    placeholder="Description de la sous-catégorie..."
                    value={newSubCategory.description}
                    onChange={(e) => setNewSubCategory(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <Button 
                  onClick={handleCreateSubCategory}
                  disabled={!newSubCategory.name.trim() || !newSubCategory.categoryId || loading}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {loading ? 'Création...' : 'Créer la Sous-Catégorie'}
                </Button>
              </div>
            )}

            {/* Onglet Gérer Existantes */}
            {activeTab === 'manage' && (
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                          {category._count.formations} formations
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteCategory(category)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {category.description && (
                      <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                    )}
                    
                    <div className="pl-4 border-l-2 border-gray-200">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Sous-catégories:</h5>
                      <div className="space-y-1">
                        {category.subCategories.map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">• {sub.name}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        {category.subCategories.length === 0 && (
                          <span className="text-xs text-gray-400">Aucune sous-catégorie</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {categories.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Aucune catégorie trouvée</p>
                    <p className="text-sm">Créez votre première catégorie dans l'onglet "Nouvelle Catégorie"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>

      {/* Dialogue de confirmation de suppression */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setCategoryToDelete(null)
        }}
        onConfirm={confirmDeleteCategory}
        title="Supprimer la catégorie"
        description={`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryToDelete?.name}" ? Cette action est irréversible.${
          categoryToDelete?._count?.formations ? 
          ` Cette catégorie contient ${categoryToDelete._count.formations} formation(s).` : ''
        }`}
        confirmText="Supprimer"
        loading={deleteLoading}
        variant="destructive"
      />
    </Dialog>
  )
} 