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

const printingCategories = [
  'Business Cards',
  'Stationery',
  'Marketing Materials',
  'Large Format',
  'Packaging',
  'Labels & Stickers',
  'Books & Booklets',
  'Invitations',
  'Other'
]

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

export default function AddPrintingProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const isEditing = !!editId

  const [loading, setLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
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
    if (isEditing && editId) {
      loadProductForEdit(editId)
    } else {
      // Generate SKU for new product
      generateSKU()
    }
  }, [isEditing, editId])

  const generateSKU = () => {
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const sku = `PRINT-${randomNum}`
    setFormData(prev => ({ ...prev, sku }))
  }

  const loadProductForEdit = async (productId: string) => {
    try {
      // Mock data for editing - in real implementation, fetch from Firebase
      const mockProduct: PrintingProduct = {
        id: productId,
        name: 'Business Card Printing',
        sku: 'BC-001',
        category: 'Business Cards',
        price: 2.50,
        stock: 1000,
        description: 'High-quality business card printing with various paper options.',
        paperType: 'Glossy',
        printSize: 'Business Card (90x50mm)',
        minQuantity: 100,
        turnaroundTime: '2-3 Days',
        status: 'In Stock'
      }
      setFormData(mockProduct)
    } catch (error) {
      console.error('Error loading product for edit:', error)
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

      // In a real implementation, this would save to Firebase
      console.log('Saving printing product:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      alert(`Printing product ${isEditing ? 'updated' : 'added'} successfully!`)
      router.push('/printing/products')
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
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {printingCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Printing Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paperType">Paper Type</Label>
                <Select value={formData.paperType} onValueChange={(value) => handleInputChange('paperType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select paper type" />
                  </SelectTrigger>
                  <SelectContent>
                    {paperTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="printSize">Print Size</Label>
                <Select value={formData.printSize} onValueChange={(value) => handleInputChange('printSize', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select print size" />
                  </SelectTrigger>
                  <SelectContent>
                    {printSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="minQuantity">Minimum Quantity</Label>
                <Input
                  id="minQuantity"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.minQuantity}
                  onChange={(e) => handleInputChange('minQuantity', parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                <Label htmlFor="stock">Available Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="turnaroundTime">Turnaround Time</Label>
                <Select value={formData.turnaroundTime} onValueChange={(value) => handleInputChange('turnaroundTime', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select turnaround" />
                  </SelectTrigger>
                  <SelectContent>
                    {turnaroundTimes.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                  <SelectItem value="Discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-8">
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
      </form>
    </div>
  )
}

// Wrapper component with Suspense boundary
function AddProductPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddProductPage />
    </Suspense>
  )
}

export default AddProductPageWrapper
