'use client'

import { SidebarNav } from '@/components/sidebar-nav'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, DollarSign, Printer, Users, TrendingUp, CheckCircle, Clock, Package } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getPrintingOrders, getPrintingCustomers } from '@/lib/firebase'

interface PrintOrder {
  id: string
  orderNo: string
  customer: string
  service: string
  quantity: number
  status: 'pending' | 'in-progress' | 'completed' | 'delivered'
  dateCreated: string
}

const statusColors = {
  pending: 'secondary',
  'in-progress': 'default',
  completed: 'default',
  delivered: 'default',
}

const statusLabel = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed',
  delivered: 'Delivered',
}

export default function PrintingPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSection, setActiveSection] = useState('printing')
  const [orders, setOrders] = useState<PrintOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalPaid: 0,
    totalOrders: 0,
    completedOrders: 0,
    growthRate: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    inProgressOrders: 0
  })

  // Load orders and metrics from Firebase
  useEffect(() => {
    const loadPrintingData = async () => {
      try {
        setLoading(true)
        
        // Load orders
        const ordersResult = await getPrintingOrders()
        if (ordersResult.success && ordersResult.orders) {
          const firebaseOrders = ordersResult.orders
          
          // Transform to PrintOrder format
          const transformedOrders: PrintOrder[] = firebaseOrders.map((order: any) => ({
            id: order.id,
            orderNo: order.orderNumber || `PR-${order.id}`,
            customer: order.customer?.name || 'Unknown',
            service: order.items?.[0]?.service || 'Printing',
            quantity: order.items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0,
            status: order.status || 'pending',
            dateCreated: new Date(order.createdAt).toISOString().split('T')[0]
          }))
          
          setOrders(transformedOrders)
          
          // Calculate metrics
          const totalSales = firebaseOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0)
          const totalPaid = firebaseOrders.reduce((sum: number, order: any) => sum + (order.advancePayment || 0), 0)
          const completedOrders = firebaseOrders.filter((o: any) => o.status === 'completed' || o.status === 'delivered').length
          const pendingOrders = firebaseOrders.filter((o: any) => o.status === 'pending').length
          const inProgressOrders = firebaseOrders.filter((o: any) => o.status === 'in-progress').length
          
          // Load customers
          const customersResult = await getPrintingCustomers()
          const totalCustomers = customersResult.success && customersResult.customers ? customersResult.customers.length : 0
          
          // Calculate growth rate (simple calculation)
          const totalOrdersCount = firebaseOrders.length
          const growthRate = totalOrdersCount > 0 ? ((completedOrders / totalOrdersCount) * 100).toFixed(1) : '0.0'
          
          setMetrics({
            totalSales,
            totalPaid,
            totalOrders: firebaseOrders.length,
            completedOrders,
            growthRate: parseFloat(growthRate),
            totalCustomers,
            pendingOrders,
            inProgressOrders
          })
        }
      } catch (error) {
        console.error('Error loading printing data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadPrintingData()
  }, [])

  const filteredOrders = orders.filter((o) =>
    o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.orderNo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <div className="flex flex-1">
        <SidebarNav activeSection={activeSection} />
        <main className="flex-1 ml-64 bg-background">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Printing Shop</h1>
            <p className="text-muted-foreground mt-2">Manage printing orders and designs</p>
          </div>

          {/* Stats Cards - Printing Specific Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-blue-500 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{metrics.totalSales.toLocaleString()}</div>
                <p className="text-sm text-blue-100 mt-1">Total paid amount</p>
              </CardContent>
            </Card>

            <Card className="bg-indigo-500 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.totalOrders}</div>
                <p className="text-sm text-indigo-100 mt-1">Total completed orders: {metrics.completedOrders}</p>
              </CardContent>
            </Card>

            <Card className="bg-purple-500 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Growth Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.growthRate}%</div>
                <p className="text-sm text-purple-100 mt-1">Completion rate</p>
              </CardContent>
            </Card>

            <Card className="bg-green-500 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.totalCustomers}</div>
                <p className="text-sm text-green-100 mt-1">Active customers</p>
              </CardContent>
            </Card>

            <Card className="bg-orange-500 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.pendingOrders}</div>
                <p className="text-sm text-orange-100 mt-1">Awaiting processing</p>
              </CardContent>
            </Card>

            <Card className="bg-teal-500 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.inProgressOrders}</div>
                <p className="text-sm text-teal-100 mt-1">Currently processing</p>
              </CardContent>
            </Card>
          </div>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Print Orders</CardTitle>
                  <CardDescription>All printing orders and status tracking</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1 md:flex-none md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button className="gap-2" onClick={() => router.push('/printing/new-order')}>
                    <Plus className="h-4 w-4" />
                    New Order
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order No</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Date Created</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNo}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.service}</TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>{order.dateCreated}</TableCell>
                        <TableCell>
                          <Badge variant={statusColors[order.status] as any}>
                            {statusLabel[order.status]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      </div>
    </div>
  )
}
