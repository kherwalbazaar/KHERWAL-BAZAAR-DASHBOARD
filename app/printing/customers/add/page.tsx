'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, User, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AddPrintingCustomerPage() {
  const router = useRouter()
  const [customerName, setCustomerName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [recentCustomers, setRecentCustomers] = useState<any[]>([])

  useEffect(() => {
    loadRecentCustomers()
  }, [])

  const loadRecentCustomers = async () => {
    try {
      const { getPrintingCustomers } = await import('@/lib/firebase')
      const result = await getPrintingCustomers()
      
      if (result.success && result.customers) {
        // Get the 5 most recent customers
        const recent = result.customers
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
        setRecentCustomers(recent)
      }
    } catch (error) {
      console.error('Error loading recent customers:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!customerName || !contactNumber) {
        alert('Please fill in all required fields')
        setLoading(false)
        return
      }

      const { addPrintingCustomer } = await import('@/lib/firebase')
      
      const customerData = {
        name: customerName,
        organization: organizationName,
        phone: contactNumber,
        address: address,
        createdAt: new Date().toISOString(),
        totalOrders: 0,
        totalSpent: 0
      }

      const result = await addPrintingCustomer(customerData)
      
      if (result.success) {
        alert('Customer added successfully!')
        router.push('/printing/customers')
      } else {
        console.error('Error adding customer:', result.error)
        alert('Error adding customer. Please try again.')
      }
    } catch (error) {
      console.error('Error adding customer:', error)
      alert('Error adding customer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between bg-purple-600 p-6">
        <div className="max-w-2xl mx-auto w-full flex items-center gap-4">
          <Button variant="outline" size="sm" className="gap-2 bg-white text-purple-600 hover:bg-white hover:text-purple-700" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Add Printing Customer</h1>
            <p className="text-purple-100">Add a new customer to your printing shop</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 max-w-7xl mx-auto">
        {/* Left - Form */}
        <div className="lg:col-span-3">
          <Card className="rounded-none">
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name</Label>
                <Input
                  id="organizationName"
                  placeholder="Enter organization name (optional)"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  placeholder="Enter contact number"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Enter address (optional)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Customer'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right - Recent Customers */}
      <div className="lg:col-span-2">
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentCustomers.length > 0 ? (
              <div className="space-y-0">
                {recentCustomers.map((customer, index) => (
                  <div
                    key={customer.id}
                    className={`p-3 hover:bg-gray-50 cursor-pointer ${index !== recentCustomers.length - 1 ? 'border-b' : ''}`}
                    onClick={() => {
                      setCustomerName(customer.name)
                      setContactNumber(customer.phone)
                      setOrganizationName(customer.organization || '')
                      setAddress(customer.address || '')
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">{customer.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">{customer.phone}</div>
                    {customer.organization && (
                      <div className="text-xs text-gray-500">{customer.organization}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent customers</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
  )
}
