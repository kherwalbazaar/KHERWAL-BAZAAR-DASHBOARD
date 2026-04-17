'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getPrintingOrders, updatePrintingOrder, deletePrintingOrder } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  Printer,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface PrintingOrder {
  id: string
  orderNumber: string
  customer: {
    name: string
    phone: string
    email?: string
  }
  items: any[]
  total?: number
  advancePayment?: number
  balance?: number
  paymentType: 'full' | 'advance'
  status: string
  deliveryDate: string
  createdAt: string
}

export default function PrintingOrdersList() {
  const router = useRouter()
  const [orders, setOrders] = useState<PrintingOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const loadOrders = async () => {
    try {
      setLoading(true)
      const result = await getPrintingOrders()
      if (result.success && result.orders) {
        // Ensure numeric fields are valid numbers
        const processedOrders = result.orders.map(order => ({
          ...order,
          total: typeof order.total === 'number' && !isNaN(order.total) ? order.total : 0,
          advancePayment: typeof order.advancePayment === 'number' && !isNaN(order.advancePayment) ? order.advancePayment : 0,
          balance: typeof order.balance === 'number' && !isNaN(order.balance) ? order.balance : 0
        }))
        setOrders(processedOrders)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.phone.includes(searchTerm)
    
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-indigo-100 text-indigo-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusBadge = (order: PrintingOrder) => {
    if (order.paymentType === 'full') {
      return <Badge className="bg-green-600">✓ Paid</Badge>
    }
    const balance = order.balance || 0
    return (
      <div className="space-y-1">
        <Badge className="bg-orange-500">Partial</Badge>
        {balance > 0 && (
          <p className="text-xs text-orange-600">Due: ₹{balance.toLocaleString()}</p>
        )}
      </div>
    )
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return

    try {
      const result = await deletePrintingOrder(orderId)
      if (result.success) {
        loadOrders()
        alert('Order deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      alert('Failed to delete order')
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const result = await updatePrintingOrder(orderId, { status: newStatus })
      if (result.success) {
        loadOrders()
      }
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Printing Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track all printing orders</p>
        </div>
        <Button onClick={() => router.push('/printing/new-order')}>
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Printer className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Orders List</CardTitle>
            <div className="flex gap-2">
              <div className="relative flex-1 md:flex-none md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="border border-gray-300 rounded-md px-3 py-2"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No orders found</p>
              <Button
                variant="link"
                onClick={() => router.push('/printing/new-order')}
                className="mt-2"
              >
                Create your first order
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-bold text-blue-600">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer.name}</p>
                          <p className="text-sm text-gray-500">{order.customer.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{(order.items || []).length} items</TableCell>
                      <TableCell className="font-bold">
                        ₹{(order.total || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(order)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(order.deliveryDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/printing/orders/${order.id}`)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/printing/orders/${order.id}/edit`)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Order
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'in-progress')}>
                              <Clock className="w-4 h-4 mr-2" />
                              Mark In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'completed')}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteOrder(order.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
