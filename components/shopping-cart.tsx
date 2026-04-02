/**
 * Shopping Cart Component
 * Displays cart items and manages checkout
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useCart } from '@/hooks/use-cart'
import { CartItem } from '@/lib/cart-manager'
import { AlertCircle, Trash2, ShoppingCart, X } from 'lucide-react'

interface ShoppingCartProps {
  isOpen: boolean
  onClose: () => void
  onCheckoutSuccess?: (saleId: string) => void
}

export function ShoppingCart({ isOpen, onClose, onCheckoutSuccess }: ShoppingCartProps) {
  const cart = useCart()
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
  const [paymentData, setPaymentData] = useState({
    customerId: '',
    paymentMethod: 'cash',
    paidAmount: cart.totalPrice,
    notes: '',
  })

  const handleCheckout = async () => {
    console.log('🛒 Starting checkout process...')
    console.log('Cart items:', cart.cart.items)
    console.log('Payment data:', paymentData)
    
    const result = await cart.checkout(paymentData)
    console.log('Checkout result:', result)
    
    if (result.success) {
      console.log('✅ Checkout successful! Sale ID:', result.saleId)
      setShowCheckoutDialog(false)
      cart.clearCart()
      onClose()
      if (onCheckoutSuccess && result.saleId) {
        onCheckoutSuccess(result.saleId)
      }
    } else {
      console.error('❌ Checkout failed:', result.error)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({cart.totalItems} items)
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto">
          {cart.cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.cart.items.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell className="text-right">₹{item.price.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cart.updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          −
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          max={item.stock}
                          value={item.quantity}
                          onChange={(e) => cart.updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                          className="w-16 text-center"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cart.updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          +
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{(item.quantity * item.price).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cart.removeFromCart(item.productId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {cart.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{cart.error}</AlertDescription>
          </Alert>
        )}

        {cart.cart.items.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-primary">₹{cart.totalPrice.toLocaleString()}</span>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Continue Shopping
          </Button>
          <Button
            onClick={() => setShowCheckoutDialog(true)}
            disabled={cart.cart.items.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            Proceed to Checkout
          </Button>
        </DialogFooter>

        {/* Checkout Dialog */}
        <CheckoutDialog
          isOpen={showCheckoutDialog}
          onClose={() => setShowCheckoutDialog(false)}
          onConfirm={handleCheckout}
          totalAmount={cart.totalPrice}
          isProcessing={cart.isProcessing}
          paymentData={paymentData}
          onPaymentDataChange={setPaymentData}
        />
      </DialogContent>
    </Dialog>
  )
}

interface CheckoutDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  totalAmount: number
  isProcessing: boolean
  paymentData: any
  onPaymentDataChange: (data: any) => void
}

function CheckoutDialog({
  isOpen,
  onClose,
  onConfirm,
  totalAmount,
  isProcessing,
  paymentData,
  onPaymentDataChange,
}: CheckoutDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Checkout</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Customer ID (Optional)</label>
            <Input
              placeholder="Enter customer ID"
              value={paymentData.customerId}
              onChange={(e) => onPaymentDataChange({ ...paymentData, customerId: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <select
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              value={paymentData.paymentMethod}
              onChange={(e) => onPaymentDataChange({ ...paymentData, paymentMethod: e.target.value })}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Amount Paid (₹{totalAmount.toLocaleString()})
            </label>
            <Input
              type="number"
              placeholder="Enter paid amount"
              value={paymentData.paidAmount}
              onChange={(e) => onPaymentDataChange({ ...paymentData, paidAmount: parseFloat(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
            <textarea
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              placeholder="Add any additional notes"
              rows={3}
              value={paymentData.notes}
              onChange={(e) => onPaymentDataChange({ ...paymentData, notes: e.target.value })}
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold text-primary">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isProcessing} className="bg-green-600 hover:bg-green-700">
            {isProcessing ? 'Processing...' : 'Confirm Checkout'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
