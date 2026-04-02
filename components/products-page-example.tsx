/**
 * Example: Add Shopping Cart to Products Page
 * 
 * This is a reference implementation showing how to integrate the shopping cart
 * into your product listing pages (e.g., garments, products, printing, etc.)
 */

'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/hooks/use-cart'
import { ShoppingCart } from '@/components/shopping-cart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getProducts } from '@/lib/firebase'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart as CartIcon, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ProductsPageExample() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cartOpen, setCartOpen] = useState(false)
  const cart = useCart()

  // Load products from Firebase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const result = await getProducts()
        if (result.success) {
          setProducts(result.products || [])
        }
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const handleAddToCart = (product: any) => {
    const success = cart.addToCart({
      productId: product.id,
      productName: product.name,
      quantity: 1,
      price: product.price || 0,
      costPrice: product.costPrice || 0,
      stock: product.stock || 0,
    })

    if (!success) {
      // Error is automatically in cart.error
      // You can show a toast notification here
    } else {
      // Success - maybe show a toast
      console.log('Product added to cart')
    }
  }

  const getStockBadge = (stock: number) => {
    if (stock <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    }
    if (stock < 5) {
      return <Badge variant="outline" className="bg-orange-100 text-orange-800">Low Stock</Badge>
    }
    return <Badge className="bg-green-100 text-green-800">In Stock</Badge>
  }

  return (
    <div className="p-8">
      {/* Page Header with Cart Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex items-center gap-4">
          {cart.error && (
            <Alert variant="destructive" className="w-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{cart.error}</AlertDescription>
            </Alert>
          )}
          <Button
            onClick={() => setCartOpen(true)}
            className="gap-2"
            size="lg"
          >
            <CartIcon className="h-5 w-5" />
            Cart ({cart.totalItems})
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image Placeholder */}
              <div className="bg-muted h-48 flex items-center justify-center">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground">No image</div>
                )}
              </div>

              <CardHeader>
                <div className="space-y-2">
                  <CardTitle className="line-clamp-2">{product.name}</CardTitle>
                  <div className="flex justify-between items-start">
                    <div>
                      {product.category && (
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      )}
                    </div>
                    {getStockBadge(product.stock || 0)}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Product Details */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-semibold">₹{(product.price || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost:</span>
                    <span className="text-sm">₹{(product.costPrice || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stock:</span>
                    <span className="font-semibold">{product.stock || 0} units</span>
                  </div>
                </div>

                {/* Product Description */}
                {product.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* Add to Cart Button */}
                <Button
                  onClick={() => handleAddToCart(product)}
                  disabled={(product.stock || 0) <= 0}
                  className="w-full gap-2"
                >
                  <CartIcon className="h-4 w-4" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Shopping Cart Sidebar/Modal */}
      <ShoppingCart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckoutSuccess={(saleId) => {
          console.log('Order completed:', saleId)
          // Optionally reload products to show updated stock
          loadProducts()
        }}
      />
    </div>
  )
}

// Helper function to reload products
async function loadProducts() {
  const result = await getProducts()
  return result.success ? result.products : []
}
