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
import { Plus, Search, Clock } from 'lucide-react'
import { useState } from 'react'

interface PrintOrder {
  id: string
  orderNo: string
  customer: string
  service: string
  quantity: number
  status: 'pending' | 'in-progress' | 'completed' | 'delivered'
  dateCreated: string
}

const orders: PrintOrder[] = [
  { id: '1', orderNo: 'PR-2024-001', customer: 'ABC Corp', service: 'Banner Printing', quantity: 500, status: 'completed', dateCreated: '2024-03-01' },
  { id: '2', orderNo: 'PR-2024-002', customer: 'XYZ Events', service: 'Sticker Printing', quantity: 1000, status: 'in-progress', dateCreated: '2024-03-02' },
  { id: '3', orderNo: 'PR-2024-003', customer: 'Tech Startup', service: 'Business Card', quantity: 2000, status: 'delivered', dateCreated: '2024-02-28' },
  { id: '4', orderNo: 'PR-2024-004', customer: 'Design Studio', service: 'Poster Printing', quantity: 250, status: 'pending', dateCreated: '2024-03-03' },
  { id: '5', orderNo: 'PR-2024-005', customer: 'Retail Store', service: 'Label Printing', quantity: 5000, status: 'in-progress', dateCreated: '2024-03-02' },
]

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
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSection, setActiveSection] = useState('printing')

  const filteredOrders = orders.filter((o) =>
    o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.orderNo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate status breakdown
  const statusBreakdown = {
    pending: orders.filter((o) => o.status === 'pending').length,
    'in-progress': orders.filter((o) => o.status === 'in-progress').length,
    completed: orders.filter((o) => o.status === 'completed').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  }

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

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statusBreakdown.pending}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statusBreakdown['in-progress']}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statusBreakdown.completed}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statusBreakdown.delivered}</div>
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
                  <Button className="gap-2">
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
