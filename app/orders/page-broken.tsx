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
import { Loader2, Search, Download, X, Eye, Printer, Edit, Trash2, AlertTriangle, MoreVertical, Share, ArrowLeft } from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
  const [activeTab, setActiveTab] = useState<'orders' | 'printing'>('orders')
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
    
    // Calculate total sales (revenue from all completed orders)
    const totalSales = orders.reduce((sum, order) => sum + (order.paidAmount || 0), 0)
    
    // Calculate today's sales
    const todaySales = todayOrders.reduce((sum, order) => sum + (order.paidAmount || 0), 0)
    
    // Calculate total profit (sales - cost)
    // Note: This would need cost data from products, for now using a simple calculation
    const totalCost = orders.reduce((sum, order) => {
      const orderCost = order.items?.reduce((itemSum: number, item: any) => {
        // Assuming we have cost price in product data, this is a simplified calculation
        return itemSum + (item.quantity * (item.costPrice || (item.price * 0.7))) // 70% of selling price as cost
      }, 0) || 0
      return sum + orderCost
    }, 0)
    const totalProfit = totalSales - totalCost

    return {
      totalSales,
      totalOrders: orders.length,
      todaySales,
      totalProfit,
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

  const handleShareOrder = (order: Order) => {
    const orderDetails = `
🧾 ORDER DETAILS
================
Invoice: ${order.invoiceNumber}
Customer: ${order.customerName}
Phone: ${order.customerPhone || 'N/A'}
Date: ${new Date(order.createdAt).toLocaleDateString()}

Items:
${order.items.map((item, idx) => `${idx + 1}. ${item.productName} - ${item.quantity} × ₹${item.price} = ₹${item.quantity * item.price}`).join('\n')}

Total Amount: ₹${order.paidAmount}
Payment: ${order.paymentMethod.toUpperCase()}
Status: ${order.status || 'completed'}
    `.trim()

    if (navigator.share) {
      navigator.share({
        title: `Order ${order.invoiceNumber}`,
        text: orderDetails
      })
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(orderDetails)
      alert('Order details copied to clipboard!')
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
      <div className="mb-8 bg-blue-600 p-6 -mx-8 -mt-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="gap-2 bg-white text-blue-600 hover:bg-red-500 hover:text-white" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2 text-white">Management</h1>
            <p className="text-blue-100">Manage orders and printing operations</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mt-6">
          <Button
            variant={activeTab === 'orders' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('orders')}
            className={activeTab === 'orders' ? 'bg-white text-blue-600' : 'bg-white/20 text-white border-white/30 hover:bg-white/30'}
          >
            <span className="text-lg">Orders</span>
          </Button>
          <Button
            variant={activeTab === 'printing' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('printing')}
            className={activeTab === 'printing' ? 'bg-white text-blue-600' : 'bg-white/20 text-white border-white/30 hover:bg-white/30'}
          >
            <span className="text-lg">Printing</span>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Orders Tab Content */}
      {activeTab === 'orders' && (
        <>
          {/* Dashboard Summary Cards (4 Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-6">
        {/* 🟢 Total Sales */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div>
            <h3 className="font-semibold text-green-800 mb-2">Total Sales</h3>
            <p className="text-2xl font-bold text-green-700">₹{stats.totalSales.toLocaleString()}</p>
          </div>
        </Card>

        {/* 🔵 Total Orders */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">Total Orders</h3>
            <p className="text-2xl font-bold text-blue-700">{stats.totalOrders} Orders</p>
          </div>
        </Card>

        {/* 🟡 Today Sales */}
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div>
            <h3 className="font-semibold text-yellow-800 mb-2">Today Sales</h3>
            <p className="text-2xl font-bold text-yellow-700">₹{stats.todaySales.toLocaleString()}</p>
          </div>
        </Card>

        {/* 🔴 Total Profit */}
        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div>
            <h3 className="font-semibold text-red-800 mb-2">Total Profit</h3>
            <p className="text-2xl font-bold text-red-700">₹{stats.totalProfit.toLocaleString()}</p>
          </div>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="overflow-hidden pt-0">
        {/* Mini Header */}
        <div className="bg-gray-50 px-6 py-2 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span>Payment Method:</span>
                <Button
                  variant={filters.paymentMethod === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('paymentMethod', 'all')}
                  className="h-8"
                >
                  All
                </Button>
                <Button
                  variant={filters.paymentMethod === 'cash' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('paymentMethod', 'cash')}
                  className="h-8"
                >
                  Cash
                </Button>
                <Button
                  variant={filters.paymentMethod === 'upi' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('paymentMethod', 'upi')}
                  className="h-8"
                >
                  Online
                </Button>
                <Button
                  variant={filters.paymentMethod === 'card' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('paymentMethod', 'card')}
                  className="h-8"
                >
                  Card
                </Button>
              </h3>
              <span className="text-sm text-gray-500">({filteredOrders.length} orders)</span>
            </div>
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
                    <TableHead className="font-semibold text-center">Invoice #</TableHead>
                    <TableHead className="font-semibold text-center">Customer</TableHead>
                    <TableHead className="font-semibold text-center">Phone</TableHead>
                    <TableHead className="font-semibold text-center">Date & Time</TableHead>
                    <TableHead className="font-semibold text-center">Amount</TableHead>
                    <TableHead className="font-semibold text-center">Payment</TableHead>
                    <TableHead className="font-semibold text-center">Status</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell className="font-bold text-blue-600 text-center">{order.invoiceNumber}</TableCell>
                      <TableCell className="font-medium text-center">{order.customerName}</TableCell>
                      <TableCell className="text-center">{order.customerPhone || '-'}</TableCell>
                      <TableCell className="text-sm text-center">
                        <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                        <div className="text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</div>
                      </TableCell>
                      <TableCell className="font-bold text-green-600 text-center">₹{order.paidAmount}</TableCell>
                      <TableCell className="text-center">
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
                      <TableCell className="text-center">
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
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* View Details */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
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

                            {/* Print */}
                            <DropdownMenuItem onClick={() => window.print()}>
                              <Printer className="h-4 w-4 mr-2" />
                              Print
                            </DropdownMenuItem>

                            {/* Share */}
                            <DropdownMenuItem onClick={() => handleShareOrder(order)}>
                              <Share className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>

                            {/* Delete */}
                            {deleteConfirm === order.id ? (
                              <>
                                <DropdownMenuItem onClick={() => deleteOrder(order.id)} className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Confirm Delete
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDeleteConfirm(null)}>
                                  <X className="h-4 w-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <DropdownMenuItem onClick={() => setDeleteConfirm(order.id)} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
        </>
      )}

      {/* Printing Tab Content */}
      {activeTab === 'printing' && (
        <div>
          {/* Test Button */}
          <div className="mb-4">
            <Button 
              onClick={() => {
                console.log('Printing tab is working!');
                alert('Printing tab is functional!');
              }}
              className="bg-red-500 text-white"
            >
              Test Printing Tab
            </Button>
          </div>
          
          {/* Printing Categories Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Printing Services</h2>
            <p className="text-gray-600">Professional printing solutions for all your needs</p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Bill Book Printing */}
            <Card className="p-4 border-2 border-blue-200 hover:shadow-lg transition-all cursor-pointer hover:border-blue-400">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Printer className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Bill Book Printing</h3>
                <p className="text-sm text-gray-600 mb-3">Professional bill books</p>
                <Badge className="bg-blue-100 text-blue-800">Popular</Badge>
              </div>
            </Card>

            {/* Money Receipt */}
            <Card className="p-4 border-2 border-green-200 hover:shadow-lg transition-all cursor-pointer hover:border-green-400">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Download className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Money Receipt</h3>
                <p className="text-sm text-gray-600 mb-3">Custom receipt books</p>
                <Badge className="bg-green-100 text-green-800">Available</Badge>
              </div>
            </Card>

            {/* Marriage Card */}
            <Card className="p-4 border-2 border-pink-200 hover:shadow-lg transition-all cursor-pointer hover:border-pink-400">
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Share className="h-8 w-8 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Marriage Card</h3>
                <p className="text-sm text-gray-600 mb-3">Beautiful invitations</p>
                <Badge className="bg-pink-100 text-pink-800">Premium</Badge>
              </div>
            </Card>

            {/* Jatra Ticket */}
            <Card className="p-4 border-2 border-purple-200 hover:shadow-lg transition-all cursor-pointer hover:border-purple-400">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Jatra Ticket</h3>
                <p className="text-sm text-gray-600 mb-3">Event tickets</p>
                <Badge className="bg-purple-100 text-purple-800">Custom</Badge>
              </div>
            </Card>

            {/* Visiting Card */}
            <Card className="p-4 border-2 border-orange-200 hover:shadow-lg transition-all cursor-pointer hover:border-orange-400">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Printer className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Visiting Card</h3>
                <p className="text-sm text-gray-600 mb-3">Professional cards</p>
                <Badge className="bg-orange-100 text-orange-800">Quick</Badge>
              </div>
            </Card>

            {/* Flex / Banner */}
            <Card className="p-4 border-2 border-red-200 hover:shadow-lg transition-all cursor-pointer hover:border-red-400">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Flex / Banner</h3>
                <p className="text-sm text-gray-600 mb-3">Large format prints</p>
                <Badge className="bg-red-100 text-red-800">Large</Badge>
              </div>
            </Card>

            {/* T-Shirt Printing */}
            <Card className="p-4 border-2 border-indigo-200 hover:shadow-lg transition-all cursor-pointer hover:border-indigo-400">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Printer className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">T-Shirt Printing</h3>
                <p className="text-sm text-gray-600 mb-3">Custom apparel</p>
                <Badge className="bg-indigo-100 text-indigo-800">Custom</Badge>
              </div>
            </Card>

            {/* Custom Design */}
            <Card className="p-4 border-2 border-gray-200 hover:shadow-lg transition-all cursor-pointer hover:border-gray-400">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Share className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Custom Design</h3>
                <p className="text-sm text-gray-600 mb-3">Any design work</p>
                <Badge className="bg-gray-100 text-gray-800">Special</Badge>
              </div>
            </Card>
          </div>

          {/* Product Cards Section */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Popular Products</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Bill Book Product Card */}
              <Card className="p-4 border hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">Bill Book (A5)</h4>
                    <p className="text-sm text-gray-600">100 Pages</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">1 Color</Badge>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-3">
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span className="font-medium">A5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Print:</span>
                    <span className="font-medium">1 Color</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paper:</span>
                    <span className="font-medium">70 GSM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pages:</span>
                    <span className="font-medium">100</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">¥120</p>
                    <p className="text-xs text-gray-500">per book</p>
                  </div>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => alert('Custom order form will open here for Bill Book')}
                  >
                    Customize
                  </Button>
                </div>
              </Card>

              {/* Money Receipt Product Card */}
              <Card className="p-4 border hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">Money Receipt</h4>
                    <p className="text-sm text-gray-600">50 Pages</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">2 Color</Badge>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-3">
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span className="font-medium">A4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Print:</span>
                    <span className="font-medium">2 Color</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paper:</span>
                    <span className="font-medium">80 GSM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pages:</span>
                    <span className="font-medium">50</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">¥150</p>
                    <p className="text-xs text-gray-500">per book</p>
                  </div>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => alert('Custom order form will open here for Money Receipt')}
                  >
                    Customize
                  </Button>
                </div>
              </Card>

              {/* Visiting Card Product Card */}
              <Card className="p-4 border hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">Visiting Card</h4>
                    <p className="text-sm text-gray-600">Premium Quality</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">Full Color</Badge>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-3">
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span className="font-medium">90x54mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Print:</span>
                    <span className="font-medium">Full Color</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paper:</span>
                    <span className="font-medium">300 GSM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span className="font-medium">100 pcs</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">¥250</p>
                    <p className="text-xs text-gray-500">per 100 pcs</p>
                  </div>
                  <Button 
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={() => alert('Custom order form will open here for Visiting Card')}
                  >
                    Customize
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">Quick Actions</h4>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                View All Orders
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download Catalog
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Share className="h-4 w-4" />
                Share Services
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
