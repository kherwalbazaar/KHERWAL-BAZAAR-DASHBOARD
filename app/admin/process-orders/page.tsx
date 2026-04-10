'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore'

interface StockReduction {
  productId: string
  productName: string
  currentStock: number
  quantityToReduce: number
  newStock: number
}

interface OrderData {
  orderNum: number
  id: string
  customer: string
  paymentMethod: string
  paidAmount: number
  items: Array<{
    productId: string
    productName: string
    quantity: number
    price: number
  }>
}

interface Summary {
  totalSales: number
  totalStockBefore: number
  totalQuantityOrdered: number
  totalStockAfter: number
}

export default function ProcessOrdersPage() {
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [orders, setOrders] = useState<OrderData[]>([])
  const [stockReductions, setStockReductions] = useState<StockReduction[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchOrderData()
  }, [])

  const fetchOrderData = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)

      // Get all sales
      const salesSnapshot = await getDocs(query(collection(db, 'sales'), orderBy('createdAt', 'desc')))

      if (salesSnapshot.empty) {
        setError('No sales found in database')
        setLoading(false)
        return
      }

      // Get all products
      const productsSnapshot = await getDocs(collection(db, 'products'))
      const products: Record<string, any> = {}
      productsSnapshot.forEach(doc => {
        products[doc.id] = { id: doc.id, ...doc.data() }
      })

      let totalStockBefore = 0
      Object.values(products).forEach((product: any) => {
        totalStockBefore += product.stock || 0
      })

      // Process sales
      const stockUpdates: Record<string, any> = {}
      let totalQuantityOrdered = 0
      const ordersData: OrderData[] = []

      let orderNum = 0
      salesSnapshot.forEach((doc: any) => {
        orderNum++
        const sale = doc.data()

        ordersData.push({
          orderNum,
          id: doc.id,
          customer: sale.customerName || 'N/A',
          paymentMethod: sale.paymentMethod || 'cash',
          paidAmount: sale.paidAmount || 0,
          items: []
        })

        if (sale.items && Array.isArray(sale.items)) {
          sale.items.forEach((item: any) => {
            if (!stockUpdates[item.productId]) {
              stockUpdates[item.productId] = {
                name: item.productName,
                quantityToReduce: 0,
                currentStock: products[item.productId]?.stock || 0
              }
            }
            stockUpdates[item.productId].quantityToReduce += item.quantity
            totalQuantityOrdered += item.quantity

            ordersData[ordersData.length - 1].items.push({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              price: item.price
            })
          })
        }
      })

      let totalStockAfter = totalStockBefore
      const reductions: StockReduction[] = []

      Object.entries(stockUpdates).forEach(([productId, update]: [string, any]) => {
        const newStock = update.currentStock - update.quantityToReduce
        totalStockAfter -= update.quantityToReduce

        reductions.push({
          productId,
          productName: update.name,
          currentStock: update.currentStock,
          quantityToReduce: update.quantityToReduce,
          newStock: Math.max(0, newStock)
        })
      })

      setOrders(ordersData)
      setStockReductions(reductions)
      setSummary({
        totalSales: salesSnapshot.size,
        totalStockBefore,
        totalQuantityOrdered,
        totalStockAfter: Math.max(0, totalStockAfter)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const applyUpdates = async () => {
    try {
      setApplying(true)
      setError(null)

      // Apply stock reductions
      for (const reduction of stockReductions) {
        const productRef = doc(db, 'products', reduction.productId)
        await updateDoc(productRef, {
          stock: reduction.newStock,
          updatedAt: new Date().toISOString()
        })
      }

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        fetchOrderData()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply updates')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading order data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">📊 Process Orders & Reduce Stock</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>Stock updates applied successfully!</AlertDescription>
        </Alert>
      )}

      {summary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-blue-600">{summary.totalSales}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-gray-600 mb-1">Stock Before</p>
              <p className="text-3xl font-bold text-gray-800">{summary.totalStockBefore}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-gray-600 mb-1">Quantity Ordered</p>
              <p className="text-3xl font-bold text-orange-600">{summary.totalQuantityOrdered}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-gray-600 mb-1">Stock After</p>
              <p className="text-3xl font-bold text-green-600">{summary.totalStockAfter}</p>
            </Card>
          </div>

          {/* Stock Reductions Table */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">📦 Stock Reductions Required</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-3 text-left">Product Name</th>
                    <th className="p-3 text-right">Current Stock</th>
                    <th className="p-3 text-right">Ordered Qty</th>
                    <th className="p-3 text-right">New Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {stockReductions.map((reduction) => (
                    <tr key={reduction.productId} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{reduction.productName}</td>
                      <td className="p-3 text-right">{reduction.currentStock}</td>
                      <td className="p-3 text-right">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          -{reduction.quantityToReduce}
                        </Badge>
                      </td>
                      <td className="p-3 text-right font-bold text-green-600">{reduction.newStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Orders Details */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">📋 Order Details</h2>
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold">Order #{order.orderNum}</h3>
                      <p className="text-sm text-gray-600">ID: {order.id}</p>
                    </div>
                    <Badge>{order.paymentMethod}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <p><span className="font-semibold">Customer:</span> {order.customer}</p>
                    <p><span className="font-semibold">Amount:</span> ₹{order.paidAmount}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                    {order.items.map((item, idx) => (
                      <p key={idx}>
                        • {item.productName} (ID: {item.productId}): {item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}
                      </p>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <div className="fixed bottom-4 right-4">
            <Button
              onClick={applyUpdates}
              disabled={applying}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
            >
              {applying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  ✅ Apply Stock Updates
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {!summary && !loading && (
        <Alert>
          <AlertDescription>No order data available</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
