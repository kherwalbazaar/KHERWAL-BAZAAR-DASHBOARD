'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Plus, Search, Edit, Trash2, Folder, Package, MoreVertical } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface Category {
  id: string
  name: string
  description: string
  productCount: number
  status: 'active' | 'inactive'
  createdAt: string
}

export default function PrintingCategoriesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'inactive'
  })

  useEffect(() => {
    setIsClient(true)
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      // Mock categories data - in real implementation, fetch from Firebase
      const mockCategories: Category[] = [
        {
          id: 'cat1',
          name: 'Business Cards',
          description: 'Professional business cards in various sizes and paper types',
          productCount: 15,
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 'cat2',
          name: 'Stationery',
          description: 'Letterheads, envelopes, and office stationery items',
          productCount: 8,
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 'cat3',
          name: 'Marketing Materials',
          description: 'Flyers, brochures, and promotional materials',
          productCount: 12,
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 'cat4',
          name: 'Large Format',
          description: 'Posters, banners, and large format printing',
          productCount: 6,
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 'cat5',
          name: 'Packaging',
          description: 'Custom packaging solutions and boxes',
          productCount: 4,
          status: 'inactive',
          createdAt: new Date().toISOString()
        },
        {
          id: 'cat6',
          name: 'Labels & Stickers',
          description: 'Custom labels and stickers for various applications',
          productCount: 9,
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 'cat7',
          name: 'Books & Booklets',
          description: 'Book printing, booklets, and bound documents',
          productCount: 3,
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 'cat8',
          name: 'Invitations',
          description: 'Wedding invitations, event invitations, and cards',
          productCount: 11,
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ]
      
      setCategories(mockCategories)
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddCategory = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      description: '',
      status: 'active'
    })
    setIsDialogOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      status: category.status
    })
    setIsDialogOpen(true)
  }

  const handleSaveCategory = async () => {
    try {
      if (!formData.name.trim()) {
        alert('Category name is required')
        return
      }

      if (editingCategory) {
        // Update existing category
        setCategories(categories.map(cat => 
          cat.id === editingCategory.id 
            ? { ...cat, name: formData.name, description: formData.description, status: formData.status }
            : cat
        ))
      } else {
        // Add new category
        const newCategory: Category = {
          id: `cat${Date.now()}`,
          name: formData.name,
          description: formData.description,
          productCount: 0,
          status: formData.status,
          createdAt: new Date().toISOString()
        }
        setCategories([...categories, newCategory])
      }

      setIsDialogOpen(false)
      alert(`Category ${editingCategory ? 'updated' : 'added'} successfully!`)
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Error saving category')
    }
  }

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (window.confirm(`Are you sure you want to delete "${categoryName}"?`)) {
      try {
        setCategories(categories.filter(cat => cat.id !== categoryId))
        alert('Category deleted successfully')
      } catch (error) {
        console.error('Error deleting category:', error)
        alert('Error deleting category')
      }
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  const totalCategories = categories.length
  const activeCategories = categories.filter(cat => cat.status === 'active').length
  const totalProducts = categories.reduce((sum, cat) => sum + cat.productCount, 0)

  // Static SSR version to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between bg-purple-500 p-4 -mx-6 -mt-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="gap-2 bg-white text-purple-600 hover:bg-red-500 hover:text-white" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Product Categories</h1>
              <p className="text-purple-100">Manage printing product categories</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Categories</p>
                  <p className="text-lg font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Categories</p>
                  <p className="text-lg font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-lg font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Categories (0)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Loading categories...</h3>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Product Categories</h1>
            <p className="text-gray-600">Manage printing product categories</p>
          </div>
        </div>
        <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white" onClick={handleAddCategory}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-6">
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-purple-600">Total Categories</p>
                <p className="text-lg font-bold text-purple-700">{totalCategories}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-green-600">Active Categories</p>
                <p className="text-lg font-bold text-green-700">{activeCategories}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-blue-600">Total Products</p>
                <p className="text-lg font-bold text-blue-700">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Categories ({filteredCategories.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-medium">Loading categories...</h3>
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-gray-300">
                    <TableHead className="font-semibold">Category Name</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Products</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Folder className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="font-medium">{category.name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={category.description}>
                          {category.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          {category.productCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(category.status)}>
                          {category.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleEditCategory(category)}
                              className="flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteCategory(category.id, category.name)}
                              className="flex items-center gap-2 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No categories found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search' : 'Start by adding your first category'}
              </p>
              {!searchTerm && (
                <Button className="mt-4 gap-2" onClick={handleAddCategory}>
                  <Plus className="h-4 w-4" />
                  Add Your First Category
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Update the category details below.' : 'Create a new product category for your printing services.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Business Cards"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Describe the category..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory} className="bg-purple-600 hover:bg-purple-700">
              {editingCategory ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
