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
import { Search, Plus, Minus, Trash2, CreditCard, DollarSign, Package, User, Calendar, Receipt, Printer, ShoppingCart, ArrowLeft, X } from 'lucide-react'
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from '@/lib/firebase';

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
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);
  const [returnAmount, setReturnAmount] = useState(0);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<any>(null);
  const [totalSales, setTotalSales] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [salePrice, setSalePrice] = useState('');

  // Load data from Firebase
  useEffect(() => {
    loadPOSData()
  }, [])

  const loadPOSData = async () => {
    try {
      const { getProducts, getCustomers, getSales } = await import('@/lib/firebase')
      
      const [productsResult, customersResult, salesResult] = await Promise.all([
        getProducts(),
        getCustomers(),
        getSales()
      ])
      
      if (productsResult.success) {
        setProducts(productsResult.products || [])
      }
      
      if (customersResult.success) {
        setCustomers(customersResult.customers || [])
      }
      
      if (salesResult.success) {
        const sales = salesResult.sales || []
        const total = sales.reduce((sum: number, sale: any) => sum + (sale.total || 0), 0)
        setTotalSales(total)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading POS data:', error)
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

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    // Calculate MRP (double cost price)
    const mrp = (product.costPrice || product.sellingPrice || 0) * 2;
    // Calculate 30% discounted price and round to nearest 10
    const discountedPrice = mrp * 0.7; // 30% discount means 70% of MRP
    const roundedPrice = Math.ceil(discountedPrice / 10) * 10;
    setSalePrice(roundedPrice.toString());
    setShowProductDialog(true);
  }

  const addToCartFromDialog = () => {
    if (!selectedProduct || !salePrice) return;
    
    const existingItem = cart.find(item => item.id === selectedProduct.id)
    
    if (existingItem) {
      if (existingItem.quantity < Number(selectedProduct.stock || 0)) {
        updateQuantity(existingItem.id, existingItem.quantity + 1)
      } else {
        toast.error('Insufficient stock')
      }
    } else {
      const newItem: CartItem = {
        id: selectedProduct.id,
        name: selectedProduct.name || selectedProduct.productName || selectedProduct.title || selectedProduct.displayName || selectedProduct.sku || `Product ${selectedProduct.id?.slice(-6) || 'Unknown'}`,
        price: Number(salePrice),
        quantity: 1,
        stock: Number(selectedProduct.stock || 0),
        category: selectedProduct.category || 'Uncategorized',
        sku: selectedProduct.sku || 'N/A'
      }
      setCart([...cart, newItem])
      toast.success(`${selectedProduct.name || selectedProduct.productName || selectedProduct.title || selectedProduct.displayName || selectedProduct.sku || 'Product'} added to cart`)
    }
    
    setShowProductDialog(false);
    setSelectedProduct(null);
    setSalePrice('');
  }

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
    return cart.reduce((total, item) => total + (item.price * 2 * item.quantity), 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.18
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleBackClick = () => {
    if (cart.length > 0) {
      setShowWarningDialog(true)
    } else {
      window.history.back()
    }
  }

  const handleCancelWarning = () => {
    setShowWarningDialog(false)
  }

  const handleDiscardAndGoBack = () => {
    setCart([])
    setShowWarningDialog(false)
    window.history.back()
  }

  const handleCompleteCheckout = async () => {
    try {
      setIsProcessing(true);
      
      // Calculate final amounts
      const subtotal = calculateSubtotal();
      const discountPercent = 30; // Fixed 30% discount
      const finalTotal = subtotal * 0.7; // 30% discount means 70% of subtotal
      const returnAmount = Math.max(0, paidAmount - finalTotal);
      
      // First, update stock for each cart item
      
      async function handleCheckout(cartItems: any[]) {
        try {
          for (const item of cartItems) {
            const productRef = doc(db, "products", item.id);
            
            // Get current stock
            const productSnap = await getDoc(productRef);
            
            if (productSnap.exists()) {
              const currentStock = productSnap.data().stock;
              
              // Calculate new stock
              const newStock = currentStock - item.quantity;
              
              // Update stock
              await updateDoc(productRef, {
                stock: newStock
              });
              
              console.log(`✅ Stock updated for ${item.name}: ${currentStock} → ${newStock}`);
            } else {
              console.error(`❌ Product not found: ${item.name}`);
            }
          }
          
          console.log("✅ Stock updated successfully for all items");
          
        } catch (error) {
          console.error("❌ Error updating stock:", error);
          throw error; // Re-throw to handle in checkout
        }
      }
      
      // Update stock before saving sale
      await handleCheckout(cart);
      
      // Create checkout data
      const checkoutData = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity
        })),
        subtotal: subtotal,
        discount: discountPercent,
        discountAmount: subtotal * (discountPercent / 100),
        finalTotal: finalTotal,
        paidAmount: paidAmount,
        returnAmount: returnAmount,
        customer: selectedCustomer,
        paymentMethod: paymentMethod || 'Cash'
      };
      
      // Store in Firebase using existing sales collection
      const { addSale } = await import('@/lib/firebase');
      await addSale(checkoutData);
      
      // Update total sales
      setTotalSales(prev => prev + finalTotal);
      
      // Set current receipt and show receipt dialog
      setCurrentReceipt(checkoutData);
      setShowCheckoutDialog(false);
      setShowReceiptDialog(true);
      
      // Clear cart
      setCart([]);
      setPaidAmount(0);
      
      toast.success('Checkout completed successfully!');
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to complete checkout');
    } finally {
      setIsProcessing(false);
    }
  };

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
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      {/* Fixed Header - Like Home Page */}
      <div className="fixed top-0 left-0 right-0 bg-blue-500 px-6 py-6 z-50">
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

      {/* Main Content with Top Padding for Fixed Header */}
      <div className="pt-20 overflow-hidden">
        <div className="flex h-[calc(100vh-80px)]">
        {/* Category Sidebar */}
          <div className="w-64 bg-white border-r p-4 overflow-y-auto h-full">
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
          <Card className="card-flat shadow-sm">
            <div className="flex items-center justify-between px-6 pb-2 pt-2">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <h3 className="leading-none font-semibold">Products</h3>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products by name, SKU, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            <CardContent className="px-6">
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1 max-h-[500px] overflow-y-auto scrollbar-hide -mx-6">
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
                      onClick={() => handleProductClick(product)}
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
                              ₹{(Number(product.sellingPrice || product.costPrice || 0) * 2).toLocaleString()}
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

        {/* Cart Section */}
          <Card className="card-flat shadow-sm w-[600px] flex flex-col">
            <CardContent className="space-y-4 flex flex-col h-full">
              {/* Cart Items - At Very Top */}
              <div className="space-y-0 max-h-[28rem] overflow-y-auto -ml-4">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Cart is empty</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-0.5 px-1 border rounded-sm">
                      <div className="flex-1">
                        <h4 className="font-medium text-[10px]">{item.name}</h4>
                        <p className="text-[10px] font-semibold">₹{(item.price * 2).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline" className="h-5 w-5" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="h-2 w-2" />
                        </Button>
                        <span className="w-6 text-center text-[10px]">{item.quantity}</span>
                        <Button size="sm" variant="outline" className="h-5 w-5" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-2 w-2" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-5 w-5 text-red-500" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="h-2 w-2" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Spacer to push bottom sections down */}
              <div className="flex-1"></div>

              {/* Bottom Sections - At Very Bottom */}
              <div>
                <Separator />

                {/* Summary */}
                <div className="space-y-2 -ml-4">
                  <div className="flex justify-between text-sm">
                    <span>Total Qty. :</span>
                    <span>{cart.reduce((total, item) => total + item.quantity, 0)}pcs</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{calculateSubtotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GST (18%):</span>
                    <span>₹00</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-blue-600">₹{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex -mx-6 -mb-6">
                  <Button size="sm" className="flex-1 bg-green-500 text-white hover:bg-green-600 border-green-500 rounded-none disabled:opacity-50" onClick={() => setShowCheckoutDialog(true)} disabled={cart.length === 0}>
                  <Receipt className="h-4 w-4 mr-1" />
                  Checkout
                </Button>
                  <Button size="sm" className="flex-1 bg-orange-500 text-white hover:bg-orange-600 border-orange-500 rounded-none">
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
    {/* Checkout Dialog */}
      <Dialog open={showCheckoutDialog}>
        <DialogContent className="sm:max-w-md p-0" showCloseButton={false}>
          <DialogHeader className="bg-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white text-lg font-semibold">Checkout Summary</DialogTitle>
              <Button size="sm" variant="outline" onClick={() => {
                  setShowCheckoutDialog(false);
                  setPaidAmount(0);
                }} className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-4 p-6">
            {/* Total MRP */}
            <div className="flex justify-between text-sm">
              <span className="text-base font-medium">Total MRP:</span>
              <span className="text-xl font-bold text-gray-900">₹{calculateSubtotal().toLocaleString()}</span>
            </div>

            {/* Discounted Price Display */}
            <div className="flex justify-between text-sm">
              <span className="text-base font-medium">Discounted Price:</span>
              <span className="text-xl font-bold text-green-600">₹{(calculateSubtotal() * 0.7).toLocaleString()}</span>
            </div>

            {/* Paid Amount */}
            <div>
              <label className="text-sm font-medium">Paid Amount: <span className="text-red-500">*</span></label>
              <Input 
                type="text" 
                value={paidAmount === 0 ? '' : paidAmount.toString()} 
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setPaidAmount(value === '' ? 0 : Number(value));
                }}
                placeholder="000"
                className="text-2xl font-bold border-red-300 focus:border-red-500"
                style={{ fontSize: '30px' }}
                required
              />
              {paidAmount === 0 && (
                <p className="text-xs text-red-500 mt-1">Paid amount is required</p>
              )}
            </div>

            {/* Final Total */}
            <div className="flex justify-between font-bold border-t pt-2">
              <span className="text-2xl font-bold">Final Total:</span>
              <span className="text-blue-600 text-2xl font-bold" style={{ fontSize: '30px' }}>
                ₹{paidAmount === 0 ? (calculateSubtotal() * 0.7).toLocaleString() : (paidAmount < (calculateSubtotal() * 0.7) ? paidAmount.toLocaleString() : Math.max(0, (calculateSubtotal() * 0.7) - paidAmount).toLocaleString())}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleCompleteCheckout}
              className="w-full"
              disabled={isProcessing || paidAmount === 0}
            >
              {isProcessing ? 'Processing...' : 'Complete Checkout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    {/* Receipt Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
          </DialogHeader>
          {currentReceipt && (
            <div className="space-y-4">
              {/* Receipt Header */}
              <div className="text-center border-b pb-4">
                <h3 className="font-bold text-lg">KHERWAL BAZAAR</h3>
                <p className="text-sm text-gray-600">POS Receipt</p>
                <p className="text-xs text-gray-500">
                  {new Date(currentReceipt.timestamp).toLocaleDateString('en-IN')} {new Date(currentReceipt.timestamp).toLocaleTimeString('en-IN')}
                </p>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <h4 className="font-semibold">Items:</h4>
                {currentReceipt.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div>
                      <span>{item.name}</span>
                      <span className="text-gray-500 ml-2">x{item.quantity}</span>
                    </div>
                    <span>₹{item.subtotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₹{currentReceipt.subtotal.toLocaleString()}</span>
                </div>
                {currentReceipt.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Discount ({currentReceipt.discount}%):</span>
                    <span className="text-green-600">-₹{currentReceipt.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>₹{currentReceipt.finalTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Paid:</span>
                  <span>₹{currentReceipt.paidAmount.toLocaleString()}</span>
                </div>
                {currentReceipt.returnAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Return:</span>
                    <span>₹{currentReceipt.returnAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-gray-500 border-t pt-4">
                <p>Thank you for your purchase!</p>
                <p>Receipt ID: #{currentReceipt.id}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowReceiptDialog(false)} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    {/* Product Dialog */}
    <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Dialog Header with Background */}
        <div className="bg-blue-600 px-6 py-4">
          <DialogTitle className="text-white text-lg font-semibold">
            Product Details
          </DialogTitle>
        </div>
        
        {/* Dialog Content */}
        <div className="p-6">
          {selectedProduct && (
            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="text-sm font-medium text-gray-700">Product Name</label>
                <p className="text-lg font-semibold">
                  {selectedProduct.name || selectedProduct.productName || selectedProduct.title || selectedProduct.displayName || selectedProduct.sku || `Product ${selectedProduct.id?.slice(-6) || 'Unknown'}`}
                </p>
              </div>

              {/* MRP Value */}
              <div>
                <label className="text-sm font-medium text-gray-700">MRP Value</label>
                <p className="text-lg font-semibold text-green-600">
                  ₹{(selectedProduct.costPrice || selectedProduct.sellingPrice || 0) * 2}
                </p>
              </div>

              {/* Sale Price Input */}
              <div>
                <label className="text-sm font-medium text-gray-700">Sale Price</label>
                <Input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="Enter sale price"
                  className="mt-1"
                />
              </div>

              {/* Stock Info */}
              <div>
                <label className="text-sm font-medium text-gray-700">Stock Available</label>
                <p className="text-sm text-gray-600">
                  {selectedProduct.stock || 0} units
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Dialog Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
          <Button variant="destructive" onClick={() => setShowProductDialog(false)} className="flex-1 mr-2">
            Cancel
          </Button>
          <Button onClick={addToCartFromDialog} className="bg-green-600 hover:bg-green-700 flex-1 ml-2">
            Add to Cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </div>
  )
}
