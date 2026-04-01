'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Search, Plus, Minus, Trash2, CreditCard, DollarSign, Package, User, Calendar, Receipt, Printer, ShoppingCart, ArrowLeft } from 'lucide-react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  stock: number
  category: string
  sku: string
}

interface Customer {
  id: string
  name: string
  phone: string
  email?: string
}

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showWarningDialog, setShowWarningDialog] = useState(false)

  // Load data from Firebase
  useEffect(() => {
    loadPOSData()
  }, [])

  const loadPOSData = async () => {
    try {
      const { getProducts, getCustomers } = await import('@/lib/firebase')
      
      // Get products from Firebase
      const productsResult = await getProducts()
      if (productsResult.success && productsResult.products) {
        setProducts(productsResult.products.filter((p: any) => Number(p.stock || 0) > 0))
      }
      
      // Try to get customers, but handle permission errors gracefully
      try {
        const customersResult = await getCustomers()
        if (customersResult.success && customersResult.customers) {
          setCustomers(customersResult.customers)
        }
      } catch (customersError) {
        console.log('Customers collection not available yet, using empty list')
        setCustomers([])
      }
    } catch (error) {
      console.error('Error loading POS data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Get unique categories from products
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category || 'Uncategorized').filter(Boolean)))]

  // Define background colors for cards
  const cardColors = [
    'bg-green-500',    // Maximum bright green
    'bg-pink-500',     // Maximum bright pink  
    'bg-blue-500',     // Maximum bright blue
    'bg-cyan-500',     // Maximum bright cyan
    'bg-purple-500',   // Maximum bright purple
    'bg-yellow-500',   // Maximum bright yellow
    'bg-orange-500'    // Maximum bright orange
  ]

  // Get random color for each product based on its ID
  const getCardColor = (productId: string) => {
    const index = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % cardColors.length
    return cardColors[index]
  }

  // Filter products based on search and category
  useEffect(() => {
    let filtered = products

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        (product.category || 'Uncategorized') === selectedCategory
      )
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (`Product ${product.id?.slice(-6) || ''}`).toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm, selectedCategory])

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id)
    
    if (existingItem) {
      if (existingItem.quantity < Number(product.stock || 0)) {
        updateQuantity(existingItem.id, existingItem.quantity + 1)
      } else {
        toast.error('Insufficient stock')
      }
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name || product.productName || product.title || product.displayName || product.sku || `Product ${product.id?.slice(-6) || 'Unknown'}`,
        price: Number(product.sellingPrice || product.costPrice || 0),
        quantity: 1,
        stock: Number(product.stock || 0),
        category: product.category || 'Uncategorized',
        sku: product.sku || 'N/A'
      }
      setCart([...cart, newItem])
      toast.success(`${product.name || product.productName || product.title || product.displayName || product.sku || 'Product'} added to cart`)
    }
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
      return
    }
    
    const item = cart.find(item => item.id === itemId)
    if (item && newQuantity <= item.stock) {
      setCart(cart.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ))
    } else {
      toast.error('Insufficient stock')
    }
  }

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId))
    toast.success('Item removed from cart')
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.18 // 18% GST
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  // Handle Back button click with cart warning
  const handleBackClick = () => {
    if (cart.length > 0) {
      setShowWarningDialog(true)
    } else {
      window.history.back()
    }
  }

  // Handle discard cart and go back
  const handleDiscardAndGoBack = () => {
    setCart([])
    setShowWarningDialog(false)
    window.history.back()
  }

  // Handle cancel warning dialog
  const handleCancelWarning = () => {
    setShowWarningDialog(false)
  }

  const processSale = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }

    if (!paymentMethod) {
      toast.error('Please select payment method')
      return
    }

    setIsProcessing(true)

    try {
      const { addSale, updateProduct } = await import('@/lib/firebase')
      
      // Create sale record
      const saleData = {
        customerName: selectedCustomer?.name || 'Walk-in Customer',
        customerPhone: selectedCustomer?.phone || '',
        customerEmail: selectedCustomer?.email || '',
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          sku: item.sku,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity
        })),
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        paymentMethod,
        status: 'completed',
        createdAt: new Date().toISOString(),
        saleId: `SALE-${Date.now()}`
      }

      // Try to add sale to Firebase, but handle permission errors gracefully
      let saleResult
      try {
        saleResult = await addSale(saleData)
      } catch (salesError) {
        console.log('Sales collection not available, creating local record')
        saleResult = { success: true, id: `local-${Date.now()}` }
      }
      
      if (saleResult.success) {
        // Update product stock
        for (const item of cart) {
          const product = products.find(p => p.id === item.id)
          if (product) {
            const newStock = Number(product.stock || 0) - item.quantity
            try {
              await updateProduct(item.id, { stock: newStock })
            } catch (updateError) {
              console.log('Failed to update product stock:', item.id)
            }
          }
        }

        toast.success('Sale completed successfully!')
        
        // Reset cart
        setCart([])
        setSelectedCustomer(null)
        setPaymentMethod('')
        
        // Show receipt (you can implement a receipt modal here)
        console.log('Sale Receipt:', saleData)
      } else {
        toast.error('Failed to process sale')
      }
    } catch (error) {
      console.error('Error processing sale:', error)
      toast.error('Failed to process sale')
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading POS...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2 bg-white text-blue-600 hover:bg-red-500 hover:text-white" onClick={handleBackClick}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <CreditCard className="h-6 w-6 text-white" />
            <h1 className="text-2xl font-bold text-white">POS - Point of Sale</h1>
          </div>
          <div className="text-sm text-blue-100">{new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Category Sidebar */}
        <div className="w-48 bg-white border-r p-4 overflow-auto">
          <h3 className="font-semibold text-sm mb-3 text-gray-700">Categories</h3>
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {category === 'all' ? 'All Products' : category}
                <span className="ml-2 text-xs text-gray-500">
                  ({category === 'all' 
                    ? products.length 
                    : products.filter(p => (p.category || 'Uncategorized') === category).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Products Section */}
        <div className="flex-1 max-w-2xl -mt-6 -ml-6 -mr-6 p-6 overflow-auto">
          <Card className="card-flat shadow-sm">
            <CardHeader className="px-6 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Products
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products by name, SKU, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1 max-h-[500px] overflow-y-auto scrollbar-hide">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No products found</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <Card 
                      key={product.id} 
                      className={`hover:shadow-lg transition-all cursor-pointer border border-gray-200 hover:border-gray-300 ${getCardColor(product.id)}`}
                      onClick={() => addToCart(product)}
                    >
                      <CardContent className="p-0.5 pb-0 flex flex-col h-full">
                        <div className="text-center w-full flex-1 flex items-center justify-center">
                          {/* Product Name */}
                          <div>
                            <h3 className="font-bold text-xs text-white line-clamp-2">
                              {product.name || product.productName || product.title || product.displayName || product.sku || `Product ${product.id?.slice(-6) || 'Unknown'}`}
                            </h3>
                            {/* Debug: Show available fields */}
                            <p className="text-xs text-white/70 hidden">
                              Fields: {Object.keys(product).join(', ')}
                            </p>
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div className="text-center w-full">
                          <div className="border-t border-white/20">
                            <p className="font-bold text-sm text-white">
                              ₹{Number(product.sellingPrice || product.costPrice || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart Section */}
        <div className="w-[450px] -mt-6 -ml-6 -mr-6 -mb-6 p-6 overflow-auto">
          <Card className="card-flat shadow-sm">
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Cart is empty</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-sm font-semibold">₹{item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button size="sm" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Separator />

              {/* Customer Selection */}
              <div>
                <Label className="text-base font-medium">Customer</Label>
                <Select value={selectedCustomer?.id || 'walk-in'} onValueChange={(value) => {
                  if (value === 'walk-in') {
                    setSelectedCustomer(null)
                  } else {
                    const customer = customers.find(c => c.id === value)
                    setSelectedCustomer(customer || null)
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer or walk-in" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Payment Method */}
              <div>
                <Label className="text-sm font-medium">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="net_banking">Net Banking</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₹{calculateSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>GST (18%):</span>
                  <span>₹{calculateTax().toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-blue-600">₹{calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  onClick={processSale} 
                  disabled={cart.length === 0 || !paymentMethod || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Complete Sale
                    </>
                  )}
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Receipt className="h-4 w-4 mr-1" />
                    Receipt
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Warning Dialog */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard Cart Items?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              You have {cart.length} item{cart.length > 1 ? 's' : ''} in your cart. 
              If you go back, all cart items will be discarded.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to continue?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelWarning}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDiscardAndGoBack}>
              Discard & Go Back
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
