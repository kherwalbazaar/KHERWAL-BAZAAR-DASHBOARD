'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Plus, Search, Filter, Edit, Trash2, Package, DollarSign, Box, FileText, TrendingUp, MoreVertical, Printer, AlertTriangle, List } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// Define Printing Product interface
interface PrintingProduct {
  id: string
  name: string
  sku: string
  category: string
  price?: number
  stock?: number
  sales?: number
  status: string
  image: string
  createdAt: string
  paperType?: string
  printSize?: string
  minQuantity?: number
}

export default function PrintingProductsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<PrintingProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Load printing products from Firebase on component mount
  useEffect(() => {
    setIsClient(true)
    loadPrintingProducts()
  }, [])

  const loadPrintingProducts = async () => {
    try {
      setLoading(true)
      const { getPrintingProducts } = await import('@/lib/firebase')
      const result = await getPrintingProducts()
      
      if (result.success && result.products) {
        // Ensure numeric fields are valid numbers
        const processedProducts = result.products.map(product => ({
          ...product,
          price: typeof product.price === 'number' && !isNaN(product.price) ? product.price : 0,
          stock: typeof product.stock === 'number' && !isNaN(product.stock) ? product.stock : 0,
          sales: typeof product.sales === 'number' && !isNaN(product.sales) ? product.sales : 0
        }))
        setProducts(processedProducts)
      } else {
        // If no products in Firebase, show empty state
        setProducts([])
      }
    } catch (error) {
      console.error('Error loading printing products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const totalStock = products.reduce((sum, product) => sum + product.stock, 0)

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        const { deletePrintingProduct } = await import('@/lib/firebase')
        const result = await deletePrintingProduct(productId)
        
        if (result.success) {
          setProducts(products.filter(p => p.id !== productId))
          console.log(`Product ${productName} deleted successfully`)
        } else {
          console.error('Error deleting product:', result.error)
          alert('Failed to delete product. Please try again.')
        }
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Failed to delete product. Please try again.')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800'
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800'
      case 'Out of Stock': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Static SSR version to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between bg-purple-500 p-4 -mx-6 -mt-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="gap-2 bg-white text-purple-600 hover:bg-red-500 hover:text-white" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Printing Products</h1>
              <p className="text-purple-100">All printing services and materials</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm px-3 py-1 bg-white text-purple-600">
              Total Qty: 0
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2 bg-white text-purple-600 hover:bg-green-500 hover:text-white">
                  <Plus className="h-4 w-4" />
                  Add Items
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/printing/products/add-product" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Items
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/printing/products" className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    All Items
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/printing/products/categories" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Category
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/printing/products/low-stock" className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Low Stock Alert
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Printer className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-lg font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Box className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Stock</p>
                  <p className="text-lg font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Products</p>
                  <p className="text-lg font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock Items</p>
                  <p className="text-lg font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Printing Products (0 products)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Printer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Loading printing products...</h3>
              <p className="text-muted-foreground">Please wait while we fetch your printing inventory.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Printing Products</h1>
            <p className="text-gray-600">All printing services and materials</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Total Qty: {totalStock}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="h-4 w-4" />
                Add Items
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/printing/products/add-product" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Items
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/printing/products" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  All Items
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/printing/products/categories" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Category
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/printing/products/low-stock" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Low Stock Alert
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Printer className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-purple-600">Total Products</p>
                <p className="text-lg font-bold text-purple-700">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Box className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-green-600">Total Stock</p>
                <p className="text-lg font-bold text-green-700">{totalStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-blue-600">Active Products</p>
                <p className="text-lg font-bold text-blue-700">{products.filter(p => p.status === 'In Stock').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-orange-600">Low Stock Items</p>
                <p className="text-lg font-bold text-orange-700">{products.filter(p => p.status === 'Low Stock').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Printing Products ({filteredProducts.length} products)
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search printing products..."
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
              <Printer className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-medium">Loading printing products...</h3>
              <p className="text-muted-foreground">Please wait while we fetch your printing inventory.</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-gray-300">
                    <TableHead className="font-semibold">Product Name</TableHead>
                    <TableHead className="font-semibold">SKU</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Price</TableHead>
                    <TableHead className="font-semibold">Stock</TableHead>
                    <TableHead className="font-semibold">Sales</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Printer className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            {product.printSize && (
                              <div className="text-sm text-gray-500">Size: {product.printSize}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="font-semibold">₹{(product.price || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Box className="h-4 w-4 text-muted-foreground" />
                          {product.stock || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          {product.sales || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(product.status)}>
                          {product.status}
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
                            <DropdownMenuItem asChild>
                              <Link href={`/printing/products/add-product?edit=${product.id}`} className="flex items-center gap-2">
                                <Edit className="h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteProduct(product.id, product.name)}
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
              <Printer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No printing products found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search' : 'Start by adding your first printing product'}
              </p>
              {!searchTerm && (
                <Link href="/printing/products/add-product" className="mt-4 inline-block">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Your First Printing Product
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
