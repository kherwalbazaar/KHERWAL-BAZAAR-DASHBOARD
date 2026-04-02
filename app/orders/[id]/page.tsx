'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft, Printer } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query } from 'firebase/firestore'

interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

interface OrderDetail {
  id: string
  customerName: string
  customerPhone?: string
  paymentMethod: string
  paidAmount: number
  items: OrderItem[]
  notes?: string
  createdAt: string
  status?: string
}

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      setError(null)

      const salesSnapshot = await getDocs(collection(db, 'sales'))
      let foundOrder: OrderDetail | null = null

      salesSnapshot.forEach((doc) => {
        if (doc.id === orderId) {
          const sale = doc.data()
          foundOrder = {
            id: doc.id,
            customerName: sale.customerName || 'Unknown',
            customerPhone: sale.customerPhone || '',
            paymentMethod: sale.paymentMethod || 'cash',
            paidAmount: sale.paidAmount || 0,
            items: sale.items || [],
            notes: sale.notes || '',
            createdAt: sale.createdAt || new Date().toISOString(),
            status: sale.status || 'completed',
          }
        }
      })

      if (foundOrder) {
        setOrder(foundOrder)
      } else {
        setError('Order not found')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button onClick={() => window.history.back()} variant="outline" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error || 'Order not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const itemsTotal = order.items.reduce((sum, item) => sum + item.quantity * item.price, 0)

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Button onClick={() => window.history.back()} variant="outline" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">Order Details</h1>
            <p className="text-gray-600">Order ID: {order.id}</p>
          </div>
          <Button onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" />
            Print Invoice
          </Button>
        </div>
      </div>

      {/* Order Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Order Status</p>
          <Badge className="bg-green-100 text-green-800">{order.status || 'completed'}</Badge>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Order Date</p>
          <p className="text-lg font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Payment Status</p>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Paid
          </Badge>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Total Amount</p>
          <p className="text-2xl font-bold text-green-600">₹{order.paidAmount}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">👤 Customer Information</h2>
            <div className="  grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Name</p>
                <p className="text-lg font-semibold">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone</p>
                <p className="text-lg font-semibold">{order.customerPhone || 'Not provided'}</p>
              </div>
            </div>
          </Card>

          {/* Order Items */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">📦 Order Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-3 text-left">Product Name</th>
                    <th className="p-3 text-right">Quantity</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{item.productName}</td>
                      <td className="p-3 text-right">
                        <Badge variant="outline">{item.quantity}</Badge>
                      </td>
                      <td className="p-3 text-right">₹{item.price}</td>
                      <td className="p-3 text-right font-bold">₹{item.quantity * item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Order Notes */}
          {order.notes && (
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-2">📝 Notes</h2>
              <p className="text-gray-700">{order.notes}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Details */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">💳 Payment Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <p className="text-gray-600">Payment Method</p>
                <Badge
                  variant="outline"
                  className={
                    order.paymentMethod === 'cash'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : order.paymentMethod === 'card'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : order.paymentMethod === 'upi'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                  }
                >
                  {order.paymentMethod.toUpperCase()}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Order Summary */}
          <Card className="p-6 bg-gray-50">
            <h2 className="text-xl font-bold mb-4">📊 Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <p className="text-gray-600">Subtotal</p>
                <p className="font-semibold">₹{itemsTotal}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Total Items</p>
                <p className="font-semibold">{totalItems}</p>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <p className="text-lg font-bold">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">₹{order.paidAmount}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Orders Timeline */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">📅 Timeline</h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="text-green-600 text-2xl">✓</div>
                <div>
                  <p className="font-semibold">Order Placed</p>
                  <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-green-600 text-2xl">✓</div>
                <div>
                  <p className="font-semibold">Payment Received</p>
                  <p className="text-sm text-gray-600">₹{order.paidAmount}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
