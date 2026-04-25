'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ArrowLeft, Plus, Search, Edit, Trash2, Printer, User, MoreVertical } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PrintingCustomer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  totalOrders: number
  totalSpent: number
  createdAt: string
}

export default function PrintingCustomersPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [customers, setCustomers] = useState<PrintingCustomer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPrintingCustomers()
  }, [])

  const loadPrintingCustomers = async () => {
    try {
      setLoading(true)
      const { getPrintingCustomers } = await import('@/lib/firebase')
      const result = await getPrintingCustomers()
      
      if (result.success && result.customers) {
        setCustomers(result.customers)
      } else {
        setCustomers([])
      }
    } catch (error) {
      console.error('Error loading printing customers:', error)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  )

  const handleDeleteCustomer = async (customerId: string, customerName: string) => {
    if (window.confirm(`Are you sure you want to delete "${customerName}"?`)) {
      try {
        const { deletePrintingCustomer } = await import('@/lib/firebase')
        const result = await deletePrintingCustomer(customerId)
        
        if (result.success) {
          setCustomers(customers.filter(c => c.id !== customerId))
          alert(`Customer "${customerName}" deleted successfully`)
        } else {
          console.error('Error deleting customer:', result.error)
          alert('Failed to delete customer. Please try again.')
        }
      } catch (error) {
        console.error('Error deleting customer:', error)
        alert('Failed to delete customer. Please try again.')
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-purple-600 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="gap-2 bg-white text-purple-600 hover:bg-white hover:text-purple-700" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Printing Customers</h1>
            <p className="text-purple-100">Manage your printing shop customers</p>
          </div>
        </div>
        <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white" onClick={() => router.push('/printing/customers/add')}>
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Customers Table */}
      <Card className="rounded-none">
        <CardHeader className="bg-gray-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              All Customers ({filteredCustomers.length})
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Printer className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-medium">Loading customers...</h3>
            </div>
          ) : filteredCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-gray-300">
                    <TableHead className="font-semibold">Customer Name</TableHead>
                    <TableHead className="font-semibold">Phone</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Total Orders</TableHead>
                    <TableHead className="font-semibold">Total Spent</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.email || '-'}</TableCell>
                      <TableCell>{customer.totalOrders}</TableCell>
                      <TableCell>₹{customer.totalSpent.toLocaleString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Edit className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 text-red-600"
                              onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                            >
                              <Trash2 className="h-4 w-4" />
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
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No printing customers found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search' : 'Start by adding your first printing customer'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
