'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2, Search, Download, X, Eye, Printer, Edit, Trash2, AlertTriangle } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

interface Order {
  id: string
  customerName: string
  customerPhone?: string
  paymentMethod: string
  paidAmount: number
  items: OrderItem[]
  notes?: string
  createdAt: string
  status?: string
  invoiceNumber?: string
}

interface Filters {
  search: string
  paymentMethod: string
  status: string
  dateRange: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({
    search: '',
    paymentMethod: 'all',
    status: 'all',
    dateRange: 'all',
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const salesSnapshot = await getDocs(query(collection(db, 'sales'), orderBy('createdAt', 'desc')))

      const ordersData: Order[] = []
      let invoiceCounter = 1000
      
      salesSnapshot.forEach((doc) => {
        const sale = doc.data()
        ordersData.push({
          id: doc.id,
          customerName: sale.customerName || 'Unknown',
          customerPhone: sale.customerPhone || '',
          paymentMethod: sale.paymentMethod || 'cash',
          paidAmount: sale.paidAmount || 0,
          items: sale.items || [],
          notes: sale.notes || '',
          createdAt: sale.createdAt || new Date().toISOString(),
          status: sale.status || 'completed',
          invoiceNumber: sale.invoiceNumber || `INV${invoiceCounter++}`,
        })
      })

      setOrders(ordersData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  // Filter and search logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch =
        order.customerName.toLowerCase().includes(searchLower) ||
        order.customerPhone?.includes(filters.search) ||
        order.id.toLowerCase().includes(searchLower) ||
        order.invoiceNumber?.includes(filters.search)

      const matchesPayment = filters.paymentMethod === 'all' || order.paymentMethod === filters.paymentMethod
      const matchesStatus = filters.status === 'all' || order.status === filters.status

      // Date range filter
      const orderDate = new Date(order.createdAt)
      const today = new Date()
      let matchesDate = true

      if (filters.dateRange === 'today') {
        matchesDate = orderDate.toDateString() === today.toDateString()
      } else if (filters.dateRange === 'week') {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        matchesDate = orderDate >= weekAgo
      } else if (filters.dateRange === 'month') {
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        matchesDate = orderDate >= monthAgo
      }

      return matchesSearch && matchesPayment && matchesStatus && matchesDate
    })
  }, [orders, filters])

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage)

  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date()
    const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today.toDateString())
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled')

    return {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.paidAmount, 0),
      todayOrders: todayOrders.length,
      todayRevenue: todayOrders.reduce((sum, order) => sum + order.paidAmount, 0),
      cancelledOrders: cancelledOrders.length,
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.paidAmount, 0) / orders.length : 0,
    }
  }, [orders])

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      paymentMethod: 'all',
      status: 'all',
      dateRange: 'all',
    })
    setCurrentPage(1)
  }

  const deleteOrder = async (orderId: string) => {
    try {
      // Get order to restore stock
      const orderDoc = await getDoc(doc(db, 'sales', orderId))
      if (orderDoc.exists()) {
        const order = orderDoc.data()
        
        // Restore stock for each item
        if (order.items && Array.isArray(order.items)) {
          for (const item of order.items) {
            const productRef = doc(db, 'products', item.productId)
            const productDoc = await getDoc(productRef)
            if (productDoc.exists()) {
              const currentStock = productDoc.data().stock || 0
              await updateDoc(productRef, {
                stock: currentStock + item.quantity,
                updatedAt: new Date().toISOString()
              })
            }
          }
        }
      }

      // Delete order
      await deleteDoc(doc(db, 'sales', orderId))
      setOrders(orders.filter((o) => o.id !== orderId))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete order')
    }
  }

  const exportToCSV = () => {
    const csv = [
      ['Order ID', 'Customer', 'Phone', 'Payment', 'Amount', 'Items', 'Date', 'Status'],
      ...filteredOrders.map((order) => [
        order.id,
        order.customerName,
        order.customerPhone || '',
        order.paymentMethod,
        order.paidAmount,
        order.items?.length || 0,
        new Date(order.createdAt).toLocaleDateString(),
        order.status || 'completed',
      ]),
    ]

    const csvContent = csv.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🧾 Orders Management</h1>
        <p className="text-gray-600">Manage and track all customer orders with complete details</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-sm text-gray-600 mb-2">🧾 Total Orders</p>
          <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-sm text-gray-600 mb-2">💰 Total Revenue</p>
          <p className="text-3xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100">
          <p className="text-sm text-gray-600 mb-2">📦 Today Orders</p>
          <p className="text-3xl font-bold text-orange-600">{stats.todayOrders}</p>
          <p className="text-xs text-gray-600 mt-1">₹{stats.todayRevenue.toLocaleString()}</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100">
          <p className="text-sm text-gray-600 mb-2">❌ Cancelled</p>
          <p className="text-3xl font-bold text-red-600">{stats.cancelledOrders}</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <p className="text-sm text-gray-600 mb-2">📊 Avg Value</p>
          <p className="text-3xl font-bold text-purple-600">₹{stats.averageOrderValue.toFixed(0)}</p>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="overflow-hidden">
        {/* Mini Header */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              📋 All Orders
              <span className="text-sm text-gray-500">({filteredOrders.length} orders)</span>
            </h3>
            {/* Search Section */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search orders..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No orders found matching your filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell className="font-bold text-blue-600">{order.invoiceNumber}</TableCell>
                      <TableCell className="font-medium">{order.customerName}</TableCell>
                      <TableCell>{order.customerPhone || '-'}</TableCell>
                      <TableCell className="text-sm">
                        <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                        <div className="text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</div>
                      </TableCell>
                      <TableCell className="font-bold text-green-600 text-right">₹{order.paidAmount}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            order.paymentMethod === 'cash'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : order.paymentMethod === 'upi'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : order.paymentMethod === 'card'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-orange-50 text-orange-700 border-orange-200'
                          }
                        >
                          {order.paymentMethod.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            order.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }
                        >
                          {order.status || 'completed'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {/* View Details */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="gap-1" title="View Details">
                                <Eye className="h-3 w-3" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Order Details - {order.invoiceNumber}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                {/* Customer Info */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-600">Customer Name</p>
                                    <p className="font-semibold">{order.customerName}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-semibold">{order.customerPhone || '-'}</p>
                                  </div>
                                </div>

                                {/* Items */}
                                <div>
                                  <p className="font-semibold mb-2">📦 Items</p>
                                  <div className="space-y-2">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="flex justify-between bg-gray-50 p-2 rounded">
                                        <span>{item.productName}</span>
                                        <span>{item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Summary */}
                                <div className="bg-blue-50 p-4 rounded">
                                  <div className="flex justify-between mb-2">
                                    <span>Subtotal:</span>
                                    <span>₹{order.items.reduce((sum, item) => sum + item.quantity * item.price, 0)}</span>
                                  </div>
                                  <div className="border-t pt-2">
                                    <div className="flex justify-between font-bold text-lg">
                                      <span>Total:</span>
                                      <span className="text-green-600">₹{order.paidAmount}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Payment Info */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-600">Payment Method</p>
                                    <p className="font-semibold">{order.paymentMethod.toUpperCase()}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Date & Time</p>
                                    <p className="font-semibold">{new Date(order.createdAt).toLocaleString()}</p>
                                  </div>
                                </div>

                                {order.notes && (
                                  <div>
                                    <p className="text-sm text-gray-600">Notes</p>
                                    <p className="text-sm">{order.notes}</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          {/* Print Bill */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => window.print()}
                            title="Print Bill"
                          >
                            <Printer className="h-3 w-3" />
                            Print
                          </Button>

                          {/* Delete */}
                          {deleteConfirm === order.id ? (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 gap-1"
                                onClick={() => deleteOrder(order.id)}
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDeleteConfirm(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="gap-1"
                              onClick={() => setDeleteConfirm(order.id)}
                              title="Delete Order"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="border-t p-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of{' '}
                {filteredOrders.length} orders
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Per page:</label>
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                    setItemsPerPage(parseInt(value))
                    setCurrentPage(1)
                  }}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        className="w-10"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
