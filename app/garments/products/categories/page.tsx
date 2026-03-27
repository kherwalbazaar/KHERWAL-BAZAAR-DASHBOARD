'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Search, Plus, Edit, Trash2, Package, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

interface Category {
  id: string
  name: string
  code: string
  productCount: number
  totalStock: number
  status: string
  trend: 'up' | 'down'
  trendValue: string
}

export default function CategoriesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '' })
  const [uploadProgress, setUploadProgress] = useState(0)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient) {
      loadCategories()
    }
  }, [isClient])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const { getProducts, getCategories } = await import('@/lib/firebase')
      
      const [productsResult, categoriesResult] = await Promise.all([
        getProducts(),
        getCategories()
      ])
      
      const categoryMap = new Map<string, { count: number; stock: number }>()
      
      if (categoriesResult.success && categoriesResult.categories) {
        categoriesResult.categories.forEach((category: any) => {
          categoryMap.set(category.name, {
            count: category.productCount || 0,
            stock: category.totalStock || 0
          })
        })
      }
      
      if (productsResult.success && productsResult.products) {
        productsResult.products.forEach(product => {
          const categoryName = product.category
          if (categoryMap.has(categoryName)) {
            const existing = categoryMap.get(categoryName)!
            categoryMap.set(categoryName, {
              count: existing.count + 1,
              stock: existing.stock + (Number(product.stock) || 0)
            })
          } else {
            categoryMap.set(categoryName, {
              count: 1,
              stock: Number(product.stock) || 0
            })
          }
        })
      }
      
      const categoriesArray: Category[] = Array.from(categoryMap.entries()).map(([name, data], index) => ({
        id: (index + 1).toString(),
        name: name,
        code: name.toUpperCase().substring(0, 6).replace(/\s/g, ''),
        productCount: data.count,
        totalStock: data.stock,
        status: 'Active',
        trend: 'up',
        trendValue: '+0%'
      }))
      
      setCategories(categoriesArray)
    } catch (error) {
      console.error('Error loading categories:', error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter category name",
        variant: "destructive",
      })
      return
    }

    const existingCategory = categories.find(cat => 
      cat.name.toLowerCase() === newCategory.name.toLowerCase()
    )

    if (existingCategory) {
      toast({
        title: "Error",
        description: `Category "${newCategory.name}" already exists!`,
        variant: "destructive",
      })
      return
    }

    try {
      setIsAddingCategory(true)
      setUploadProgress(0)
      
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const generatedCode = newCategory.name.toUpperCase().substring(0, 6).replace(/[^A-Z0-9]/g, '')
      
      const { addCategory } = await import('@/lib/firebase')
      
      const categoryData = {
        name: newCategory.name,
        code: generatedCode,
        productCount: 0,
        totalStock: 0,
        status: 'Active',
        trend: 'up',
        trendValue: '+0%',
        createdAt: new Date().toISOString()
      }
      
      const result = await addCategory(categoryData)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Category "${newCategory.name}" added successfully!`,
        })
        setNewCategory({ name: '' })
        setShowAddForm(false)
        loadCategories()
      } else {
        throw new Error('Failed to add category')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while adding category.",
        variant: "destructive",
      })
    } finally {
      setIsAddingCategory(false)
      setUploadProgress(0)
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalProducts = categories.reduce((sum, cat) => sum + cat.productCount, 0)
  const totalStock = categories.reduce((sum, cat) => sum + cat.totalStock, 0)
  const activeCategories = categories.filter(cat => cat.status === 'Active').length

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  if (!isClient) return null

  return (
    <div className="p-6 max-w-7xl mx-auto bg-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
            <p className="text-muted-foreground text-sm">Manage product groups</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
          <Button variant="outline" onClick={loadCategories}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <Card className="mb-6 border-blue-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">New Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Name</label>
                <Input
                  placeholder="e.g., Summer Collection"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ name: e.target.value })}
                  disabled={isAddingCategory}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddCategory} disabled={isAddingCategory}>
                  {isAddingCategory ? 'Saving...' : 'Save Category'}
                </Button>
                <Button variant="ghost" onClick={() => window.location.href = '/'} disabled={isAddingCategory}>Cancel</Button>
              </div>
            </div>
            
            {/* Progress Bar */}
            {isAddingCategory && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Uploading category...</span>
                  <span className="text-sm font-medium text-slate-800">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ 
                      width: `${uploadProgress}%`,
                      minWidth: '2px'
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg"><Package className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-sm text-slate-500">Total Products</p>
              <p className="text-xl font-bold">{totalProducts}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-purple-100 rounded-lg"><TrendingUp className="h-5 w-5 text-purple-600" /></div>
            <div>
              <p className="text-sm text-slate-500">Inventory Level</p>
              <p className="text-xl font-bold">{totalStock}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-green-100 rounded-lg"><Badge className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-sm text-slate-500">Active Status</p>
              <p className="text-xl font-bold">{activeCategories}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Filter categories..."
          className="pl-10 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Syncing with Firebase...</p>
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="hover:border-blue-400 transition-colors cursor-default group">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{category.name}</h3>
                    <code className="text-[9px] bg-slate-100 px-1 rounded text-slate-500">{category.code}</code>
                  </div>
                  <Badge className={getStatusColor(category.status)} variant="secondary">
                    {category.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs">Products</p>
                    <p className="font-semibold">{category.productCount}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Stock</p>
                    <p className="font-semibold">{category.totalStock}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <Button variant="outline" size="sm" className="flex-1 h-7 text-xs hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors">
                    <Edit className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 h-7 text-xs text-red-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors">
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white border rounded-xl p-12 text-center">
          <Package className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <h3 className="font-medium text-slate-900">No categories found</h3>
          <p className="text-slate-500 text-sm">Try adjusting your search or add a new category.</p>
        </div>
      )}
    </div>
  )
}