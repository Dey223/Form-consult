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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Plus, Trash2, Edit, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'

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
  
  // États pour les confirmations
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    type: 'category' | 'subcategory'
    id: string
    name: string
  }>({
    isOpen: false,
    type: 'category',
    id: '',
    name: ''
  })

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
        toast.success('Catégorie créée avec succès')
      } else {
        toast.error('Erreur lors de la création de la catégorie')
      }
    } catch (error) {
      console.error('Erreur création catégorie:', error)
      toast.error('Erreur lors de la création de la catégorie')
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
        toast.success('Sous-catégorie créée avec succès')
      } else {
        toast.error('Erreur lors de la création de la sous-catégorie')
      }
    } catch (error) {
      console.error('Erreur création sous-catégorie:', error)
      toast.error('Erreur lors de la création de la sous-catégorie')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'category',
      id: categoryId,
      name: categoryName
    })
  }

  const handleDeleteSubCategory = (subCategoryId: string, subCategoryName: string) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'subcategory',
      id: subCategoryId,
      name: subCategoryName
    })
  }

  const confirmDelete = async () => {
    setLoading(true)
    try {
      const endpoint = deleteConfirm.type === 'category' 
        ? `/api/categories/${deleteConfirm.id}`
        : `/api/categories/subcategories/${deleteConfirm.id}`
      
      const response = await fetch(endpoint, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        onRefresh?.()
        toast.success(`${deleteConfirm.type === 'category' ? 'Catégorie' : 'Sous-catégorie'} supprimée avec succès`)
      } else {
        toast.error(`Erreur lors de la suppression de la ${deleteConfirm.type === 'category' ? 'catégorie' : 'sous-catégorie'}`)
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
      toast.error(`Erreur lors de la suppression de la ${deleteConfirm.type === 'category' ? 'catégorie' : 'sous-catégorie'}`)
    } finally {
      setLoading(false)
      setDeleteConfirm({ isOpen: false, type: 'category', id: '', name: '' })
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>🗂️ Gestion des Catégories</DialogTitle>
            <DialogDescription>
              Créez et gérez les catégories et sous-catégories de formations
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create-category">Nouvelle Catégorie</TabsTrigger>
              <TabsTrigger value="create-subcategory">Nouvelle Sous-Catégorie</TabsTrigger>
              <TabsTrigger value="manage">Gérer Existantes</TabsTrigger>
            </TabsList>

            {/* Onglet Nouvelle Catégorie */}
            <TabsContent value="create-category" className="space-y-4">
              <div className="grid gap-4">
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
            </TabsContent>

            {/* Onglet Nouvelle Sous-Catégorie */}
            <TabsContent value="create-subcategory" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="parent-category">Catégorie parente</Label>
                  <Select 
                    value={newSubCategory.categoryId} 
                    onValueChange={(value: string) => setNewSubCategory(prev => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger style={{ opacity: newSubCategory.categoryId ? 1 : 0.7 }}>
                      <SelectValue placeholder="Choisir une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            </TabsContent>

            {/* Onglet Gérer Existantes */}
            <TabsContent value="manage" className="space-y-4">
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
                          onClick={() => handleDeleteCategory(category.id, category.name)}
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
                              onClick={() => handleDeleteSubCategory(sub.id, sub.name)}
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
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, type: 'category', id: '', name: '' })}
        onConfirm={confirmDelete}
        title={`Supprimer ${deleteConfirm.type === 'category' ? 'la catégorie' : 'la sous-catégorie'}`}
        description={`Êtes-vous sûr de vouloir supprimer "${deleteConfirm.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="destructive"
        isLoading={loading}
      />
    </>
  )
} 