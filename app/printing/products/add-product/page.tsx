'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Plus, Trash2, Package, Printer } from 'lucide-react'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group'

interface PrintingProduct {
  id: string
  name: string
  sku: string
  category: string
  price: number
  stock: number
  description: string
  paperType: string
  printSize: string
  minQuantity: number
  turnaroundTime: string
  status: string
}


const paperTypes = [
  'Standard',
  'Premium',
  'Glossy',
  'Matte',
  'Recycled',
  'Cardstock',
  'Photo Paper'
]

const printSizes = [
  'A6',
  'A5',
  'A4',
  'A3',
  'A2',
  'A1',
  'Business Card (90x50mm)',
  'Letterhead (A4)',
  'Flyer (A5)',
  'Brochure (A4 Tri-fold)',
  'Poster (A2)',
  'Custom'
]

const turnaroundTimes = [
  'Same Day',
  'Next Day',
  '2-3 Days',
  '3-5 Days',
  '1 Week',
  '2 Weeks'
]

// Recent Products List Component
function RecentProductsList() {
  const [recentProducts, setRecentProducts] = useState<PrintingProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecentProducts()
  }, [])

  const loadRecentProducts = async () => {
    try {
      setLoading(true)
      const { getPrintingProducts } = await import('@/lib/firebase')
      const result = await getPrintingProducts()
      
      if (result.success && result.products) {
        // Sort by createdAt date (newest first) and take first 8
        const sorted = result.products
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 8)
        setRecentProducts(sorted)
      }
    } catch (error) {
      console.error('Error loading recent products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-sm text-muted-foreground">Loading recent products...</span>
      </div>
    )
  }

  if (recentProducts.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No products added yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {recentProducts.map((product) => (
        <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-sm">{product.name}</p>
              <p className="text-xs text-muted-foreground">{product.sku} • {product.category}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium text-sm">₹{product.price.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{product.status}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function AddPrintingProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const isEditing = !!editId

  const [loading, setLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [formData, setFormData] = useState<PrintingProduct>({
    id: '',
    name: '',
    sku: '',
    category: '',
    price: 0,
    stock: 0,
    description: '',
    paperType: '',
    printSize: '',
    minQuantity: 1,
    turnaroundTime: '',
    status: 'In Stock'
  })

  useEffect(() => {
    setIsClient(true)
    loadCategories()
    if (isEditing && editId) {
      loadProductForEdit(editId)
    } else {
      // Generate SKU for new product
      generateSKU()
    }
  }, [isEditing, editId])

  const loadCategories = async () => {
    try {
      const { getPrintingCategories } = await import('@/lib/firebase')
      const result = await getPrintingCategories()
      
      if (result.success && result.categories) {
        const categoryNames = result.categories.map((cat: any) => cat.name)
        setCategories(categoryNames)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      // Fallback to empty array if fetch fails
      setCategories([])
    }
  }

  const generateSKU = () => {
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const sku = `PRINT-${randomNum}`
    setFormData(prev => ({ ...prev, sku }))
  }

  const loadProductForEdit = async (productId: string) => {
    try {
      const { getPrintingProducts } = await import('@/lib/firebase')
      const result = await getPrintingProducts()
      
      if (result.success && result.products) {
        const product = result.products.find((p: PrintingProduct) => p.id === productId)
        if (product) {
          setFormData(product)
        } else {
          alert('Product not found')
          router.push('/printing/products')
        }
      } else {
        alert('Error loading product')
        router.push('/printing/products')
      }
    } catch (error) {
      console.error('Error loading product for edit:', error)
      alert('Error loading product')
      router.push('/printing/products')
    }
  }

  const handleInputChange = (field: keyof PrintingProduct, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.category || !formData.price) {
        alert('Please fill in all required fields')
        return
      }

      const { addPrintingProduct, updatePrintingProduct } = await import('@/lib/firebase')
      
      let result
      if (isEditing && editId) {
        result = await updatePrintingProduct(editId, formData)
      } else {
        result = await addPrintingProduct(formData)
      }

      if (result.success) {
        alert(`Printing product ${isEditing ? 'updated' : 'added'} successfully!`)
        router.push('/printing/products')
      } else {
        console.error('Error saving product:', result.error)
        alert('Error saving product. Please try again.')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Error saving product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Static SSR version to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isEditing ? 'Edit' : 'Add'} Printing Product</h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update printing product details' : 'Add a new printing product to your inventory'}
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Printer className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-medium">Loading form...</h3>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? 'Edit' : 'Add'} Printing Product</h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update printing product details' : 'Add a new printing product to your inventory'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Business Card Printing"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU Code</Label>
                <Input
                  id="sku"
                  placeholder="e.g., PRINT-001"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  readOnly={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
                {!isEditing && (
                  <p className="text-xs text-muted-foreground mt-1">Auto-generated SKU</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                {categories.length > 0 ? (
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 border rounded-md bg-gray-50 text-sm text-gray-500">
                    Loading categories...
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="price">Price per Unit (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the printing product, paper quality, finishing options, etc."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Link href="/printing/products">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditing ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Product' : 'Add Product'}
              </>
            )}
          </Button>
        </div>

        {/* Recently Added Products Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recently Added Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentProductsList />
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

// Wrapper component with Suspense boundary
function AddProductPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddPrintingProductPage />
    </Suspense>
  )
}

export default AddProductPageWrapper
