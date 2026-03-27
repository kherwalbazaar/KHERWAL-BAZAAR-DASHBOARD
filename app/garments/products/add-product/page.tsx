'use client'

import { useState, useEffect, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Package, DollarSign, Box, FileText, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

function AddProductContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const editId = searchParams.get('edit')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    productName: '',
    skuCode: '',
    category: '',
    costPrice: '',
    stock: ''
  })

  const [categories, setCategories] = useState<any[]>([])
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [recentProducts, setRecentProducts] = useState<any[]>([])

  // Load product data for editing
  useEffect(() => {
    if (editId) {
      setIsEditing(true)
      loadProductForEdit(editId)
    }
    loadRecentProducts()
    loadCategories()
  }, [editId])

  const loadCategories = async () => {
    try {
      const { getCategories } = await import('@/lib/firebase')
      const result = await getCategories()
      
      if (result.success && result.categories) {
        setCategories(result.categories)
        console.log('Categories loaded for product form:', result.categories)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      // If categories collection doesn't exist or fails, keep empty array
      setCategories([])
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter category name",
        variant: "destructive",
      })
      return
    }

    try {
      // Auto-generate category code from name
      const generatedCode = newCategoryName.toUpperCase().substring(0, 6).replace(/[^A-Z0-9]/g, '')
      
      // Save to Firebase categories collection
      const { addCategory } = await import('@/lib/firebase')
      const categoryData = {
        name: newCategoryName,
        code: generatedCode,
        productCount: 0,
        totalStock: 0,
        status: 'Active',
        trend: 'up',
        trendValue: '+0%',
        createdAt: new Date().toISOString()
      }
      
      const result = await addCategory(categoryData)
      
      if (result.success && result.id) {
        // Add to local state
        const newCategory = {
          id: result.id,
          name: newCategoryName,
          code: generatedCode,
          productCount: 0,
          totalStock: 0,
          status: 'Active',
          trend: 'up',
          trendValue: '+0%'
        }
        
        setCategories([...categories, newCategory])
        setNewCategoryName('')
        setShowAddCategoryForm(false)
        
        // Auto-select the newly created category
        setFormData({ ...formData, category: newCategory.name })
        
        toast({
          title: "Category Added Successfully!",
          description: `${newCategory.name} (${newCategory.code}) has been created and selected.`,
          variant: "success",
        })
      } else {
        throw new Error(result.error && typeof result.error === 'object' && 'message' in result.error 
          ? (result.error as any).message 
          : 'Failed to save to Firebase')
      }
    } catch (error) {
      console.error('Error adding category:', error)
      toast({
        title: "Error Adding Category",
        description: "Failed to save category to Firebase. Please try again.",
        variant: "destructive",
      })
    }
  }

  const loadProductForEdit = async (productId: string) => {
    try {
      setLoading(true)
      const { getProducts } = await import('@/lib/firebase')
      const result = await getProducts()
      
      if (result.success && result.products) {
        const product = result.products.find(p => p.id === productId)
        if (product) {
          setFormData({
            productName: product.productName,
            skuCode: product.skuCode,
            category: product.category,
            costPrice: product.costPrice.toString(),
            stock: product.stock.toString()
          })
          console.log('Product loaded for editing:', product)
        } else {
          toast({
            title: "Product Not Found ❌",
            description: "The requested product could not be found.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error('Error loading product for edit:', error)
      toast({
        title: "Load Failed ⚠️",
        description: "Error loading product data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Load recent products from Firebase on component mount
  const loadRecentProducts = async () => {
    try {
      const { getProducts } = await import('@/lib/firebase')
      const result = await getProducts()
      
      if (result.success && result.products && result.products.length > 0) {
        // Sort by creation date (most recent first) and take last 3
        const sortedProducts = result.products
          .sort((a: any, b: any) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
          .slice(0, 3)
          .map(product => ({
            id: product.id,
            name: product.productName,
            sku: product.skuCode,
            price: `₹${product.costPrice}`,
            stock: product.stock,
            status: product.stock === 0 ? 'Out of Stock' : 
                   product.stock <= 10 ? 'Low Stock' : 'Active'
          }))
        
        setRecentProducts(sortedProducts)
        console.log('Recent products loaded from Firebase:', sortedProducts)
      }
    } catch (error) {
      console.error('Error loading recent products:', error)
      // Keep showing default products if Firebase fails
    }
  }

  const generateSKU = (productName: string, category: string) => {
    if (!productName || !category) return ''
    
    // Get category code
    const getCategoryCode = (categoryName: string) => {
      // Find category in loaded categories to get its code
      const category = categories.find(cat => cat.name === categoryName)
      return category ? category.code : categoryName.toUpperCase().substring(0, 6)
    }
    
    const categoryCode = getCategoryCode(category)
    
    // Generate product code from first 3 letters of product name (uppercase, no spaces)
    const productCode = productName
      .replace(/[^a-zA-Z\s]/g, '') // Remove special characters
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.substring(0, 3).toUpperCase())
      .join('')
      .substring(0, 6) // Limit to 6 characters
    
    // Generate random 3-digit number
    const randomNum = Math.floor(Math.random() * 900) + 100
    
    return `${categoryCode}-${productCode}${randomNum}`
  }

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value }
    
    // Auto-generate SKU when product name or category changes (only for new products, not editing)
    if (!isEditing && (field === 'productName' || field === 'category')) {
      if (newFormData.productName && newFormData.category) {
        newFormData.skuCode = generateSKU(newFormData.productName, newFormData.category)
      }
    }
    
    setFormData(newFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Import Firebase functions
      const { addProduct, updateProduct } = await import('@/lib/firebase')
      
      // Prepare product data for Firebase
      const productData = {
        productName: formData.productName,
        skuCode: formData.skuCode,
        category: formData.category,
        costPrice: parseFloat(formData.costPrice),
        stock: parseInt(formData.stock),
        updatedAt: new Date().toISOString(),
        status: 'Active'
      }
      
      let result
      
      if (isEditing && editId) {
        // Update existing product
        result = await updateProduct(editId, productData)
        if (result.success) {
          console.log('Product updated in Firebase with ID:', result.id)
          toast({
            title: "Product Updated Successfully! 🎉",
            description: `${formData.productName} has been updated in your inventory.`,
            variant: "success",
          })
        }
      } else {
        // Add new product
        const newProductData = {
          ...productData,
          createdAt: new Date().toISOString()
        }
        result = await addProduct(newProductData)
        if (result.success) {
          console.log('Product saved to Firebase with ID:', result.id)
          toast({
            title: "Product Added Successfully! 🎉",
            description: `${formData.productName} (${formData.skuCode}) has been added to your inventory.`,
            variant: "success",
          })
        }
      }
      
      if (result.success) {
        // Reset form for new products, or redirect for edited products
        if (!isEditing) {
          setFormData({
            productName: '',
            skuCode: '',
            category: '',
            costPrice: '',
            stock: ''
          })
          
          // Refresh recent products to show the newly added product
          await loadRecentProducts()
        } else {
          // Redirect back to all products after successful edit
          setTimeout(() => {
            window.location.href = '/garments/products/all-products'
          }, 1500)
        }
      } else {
        console.error('Failed to save to Firebase:', result.error)
        toast({
          title: "Operation Failed ❌",
          description: `Failed to ${isEditing ? 'update' : 'save'} product. Please check console for details.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error submitting product:', error)
      toast({
        title: "Error Occurred ⚠️",
        description: `Error ${isEditing ? 'updating' : 'submitting'} product. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800'
      case 'Out of Stock': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? 'Edit Product' : 'Add Product'}</h1>
          <p className="text-muted-foreground">{isEditing ? 'Update product information' : 'Add new product to your inventory'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Product Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Name */}
                <div>
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    placeholder="Enter product name"
                    value={formData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    required
                  />
                </div>

                {/* Category and Cost Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => {
                      if (value === 'create-new') {
                        setShowAddCategoryForm(true)
                      } else {
                        handleInputChange('category', value)
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length > 0 ? (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name} ({category.code})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="create-new">
                            <div className="flex items-center gap-2">
                              <Plus className="h-3 w-3" />
                              Create New Category
                            </div>
                          </SelectItem>
                        )}
                        {categories.length > 0 && (
                          <SelectItem value="create-new">
                            <div className="flex items-center gap-2 text-blue-600">
                              <Plus className="h-3 w-3" />
                              Add New Category
                            </div>
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="costPrice">Cost Price (₹) *</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      placeholder="Enter cost price"
                      value={formData.costPrice}
                      onChange={(e) => handleInputChange('costPrice', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Stock Quantity */}
                <div>
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="Enter stock quantity"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button type="submit" className="gap-2" disabled={loading}>
                    {loading ? (
                      'Saving...'
                    ) : (
                      <>
                        {isEditing ? (
                          <>
                            <Plus className="h-4 w-4" />
                            Update Product
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Add Product
                          </>
                        )}
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          {showAddCategoryForm && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Create New Category
                  <Button variant="outline" size="sm" onClick={() => setShowAddCategoryForm(false)}>
                    Cancel
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="newCategoryName">Category Name</Label>
                    <Input
                      id="newCategoryName"
                      placeholder="Enter category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Category code will be auto-generated from the name
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddCategory}>
                      Create Category
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddCategoryForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Products */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Recent Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProducts.map((product) => (
                  <div key={product.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{product.name}</h4>
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-semibold text-blue-600">{product.price}</span>
                          <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(product.status)}>
                        {product.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Link href="/garments/products/all-products">
                  <Button variant="outline" className="w-full gap-2">
                    <Box className="h-4 w-4" />
                    View All Products
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function AddProductPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddProductContent />
    </Suspense>
  )
}
