'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { addPrintingOrder, addPrintingCustomer, getPrintingCustomers } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  Minus, 
  Trash2, 
  Upload, 
  FileText, 
  User, 
  Phone, 
  MapPin, 
  Calendar,
  DollarSign,
  Package,
  Palette,
  Printer,
  CheckCircle,
  AlertCircle,
  Search,
  UserPlus
} from 'lucide-react'

interface OrderItem {
  id: string
  serviceType: string
  description: string
  quantity: number
  unitPrice: number
  color: string
  size: string
  paperType: string
  sides: 'single' | 'double'
}

interface CustomerDetails {
  id?: string
  name: string
  phone: string
  email: string
  address: string
}

// Sample existing customers (in real app, this would come from database)
const existingCustomers: CustomerDetails[] = [
  { id: '1', name: 'ABC Corporation', phone: '9876543210', email: 'abc@corp.com', address: 'Main Street, City' },
  { id: '2', name: 'XYZ Events', phone: '9876543211', email: 'info@xyz.com', address: 'Event Plaza, Downtown' },
  { id: '3', name: 'Tech Startup Pvt Ltd', phone: '9876543212', email: 'contact@tech.com', address: 'IT Park, Sector 5' },
  { id: '4', name: 'Design Studio', phone: '9876543213', email: 'hello@design.com', address: 'Creative Hub, Art District' },
  { id: '5', name: 'Retail Store Chain', phone: '9876543214', email: 'orders@retail.com', address: 'Shopping Mall, Floor 2' },
]

export default function NewPrintingOrder() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Customer Selection
  const [customerMode, setCustomerMode] = useState<'select' | 'new'>('select')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [dbCustomers, setDbCustomers] = useState<CustomerDetails[]>([])

  // Load customers from Firebase
  const loadCustomers = async () => {
    try {
      const result = await getPrintingCustomers()
      if (result.success && result.customers) {
        setDbCustomers(result.customers)
      }
    } catch (error) {
      console.error('Error loading customers:', error)
    }
  }

  // Load customers on component mount
  useEffect(() => {
    loadCustomers()
  })

  // Customer Details
  const [customer, setCustomer] = useState<CustomerDetails>({
    id: '',
    name: '',
    phone: '',
    email: '',
    address: ''
  })

  const selectCustomer = (selectedCustomer: CustomerDetails) => {
    setCustomer(selectedCustomer)
    setShowCustomerDropdown(false)
    setSearchTerm('')
  }

  const filteredCustomers = dbCustomers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  )

  // Order Items
  const [items, setItems] = useState<OrderItem[]>([])
  const [currentItem, setCurrentItem] = useState<Partial<OrderItem>>({
    serviceType: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    color: 'black',
    size: 'A4',
    paperType: '80gsm',
    sides: 'single'
  })

  // Order Details
  const [urgency, setUrgency] = useState('normal')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [designFile, setDesignFile] = useState<File | null>(null)

  // Pricing
  const [discount, setDiscount] = useState(0)
  const [paymentType, setPaymentType] = useState<'full' | 'advance'>('full')
  const [advancePayment, setAdvancePayment] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('cash')

  // Service types with base prices
  const serviceTypes = [
    { value: 'bill-book', label: 'Bill Book', basePrice: 120, icon: FileText },
    { value: 'money-receipt', label: 'Money Receipt', basePrice: 150, icon: FileText },
    { value: 'visiting-card', label: 'Visiting Card', basePrice: 250, icon: Package },
    { value: 'marriage-card', label: 'Marriage Card', basePrice: 500, icon: Palette },
    { value: 'banner', label: 'Banner/Flex', basePrice: 800, icon: Printer },
    { value: 'poster', label: 'Poster', basePrice: 300, icon: FileText },
    { value: 'sticker', label: 'Sticker', basePrice: 200, icon: Package },
    { value: 'tshirt', label: 'T-Shirt Printing', basePrice: 450, icon: Palette },
    { value: 'jatra-ticket', label: 'Jatra Ticket', basePrice: 350, icon: FileText },
    { value: 'custom', label: 'Custom Design', basePrice: 0, icon: Palette },
  ]

  const addItem = () => {
    if (!currentItem.serviceType) {
      alert('Please select a service type')
      return
    }

    const newItem: OrderItem = {
      id: Date.now().toString(),
      serviceType: currentItem.serviceType || '',
      description: currentItem.description || '',
      quantity: currentItem.quantity || 1,
      unitPrice: currentItem.unitPrice || 0,
      color: currentItem.color || 'black',
      size: currentItem.size || 'A4',
      paperType: currentItem.paperType || '80gsm',
      sides: currentItem.sides || 'single'
    }

    setItems([...items, newItem])
    setCurrentItem({
      serviceType: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      color: 'black',
      size: 'A4',
      paperType: '80gsm',
      sides: 'single'
    })
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItemQuantity = (id: string, delta: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    }))
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  const calculateDiscount = () => {
    return (calculateSubtotal() * discount) / 100
  }

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount()
  }

  const calculateBalance = () => {
    return calculateTotal() - advancePayment
  }

  const handleServiceTypeChange = (value: string) => {
    const service = serviceTypes.find(s => s.value === value)
    setCurrentItem({
      ...currentItem,
      serviceType: value,
      unitPrice: service?.basePrice || 0
    })
  }

  const handleSubmit = async () => {
    // Validate advance payment
    if (paymentType === 'advance' && advancePayment <= 0) {
      alert('Please enter advance payment amount')
      return
    }

    if (paymentType === 'advance' && advancePayment >= calculateTotal()) {
      alert('Advance payment cannot be equal to or greater than total. Please select Full Payment instead.')
      return
    }

    setIsSubmitting(true)
    
    try {
      // If new customer, save to Firebase first
      let customerId = customer.id
      if (customerMode === 'new' && !customer.id) {
        const customerResult = await addPrintingCustomer({
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address
        })
        
        if (customerResult.success) {
          customerId = customerResult.id
        }
      }

      // Create order data
      const orderData = {
        customerId,
        customer: {
          id: customerId,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address
        },
        items,
        urgency,
        deliveryDate,
        notes,
        designFile: designFile?.name || null,
        subtotal: calculateSubtotal(),
        discount,
        total: calculateTotal(),
        paymentType,
        paymentMethod,
        advancePayment: paymentType === 'full' ? calculateTotal() : advancePayment,
        balance: paymentType === 'full' ? 0 : calculateTotal() - advancePayment,
        status: paymentType === 'full' ? 'confirmed' : 'pending',
        paymentStatus: paymentType === 'full' ? 'paid' : 'partial',
        orderNumber: `PR-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Save to Firebase
      const result = await addPrintingOrder(orderData)
      
      if (result.success) {
        console.log('Order saved to Firebase with ID:', result.id)
        setShowSuccess(true)
      } else {
        alert('Failed to create order. Please try again.')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      alert('An error occurred while creating the order.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDesignFile(e.target.files[0])
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Printing Order</h1>
          <p className="text-gray-600 mt-1">Create a new printing order with all details</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Customer Details' },
              { num: 2, label: 'Order Items' },
              { num: 3, label: 'Pricing & Payment' }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={`text-sm font-medium ${
                    step >= s.num ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {idx < 2 && <div className={`flex-1 h-1 mx-4 ${
                  step > s.num ? 'bg-blue-600' : 'bg-gray-200'
                }`} />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Customer Details */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </CardTitle>
            <CardDescription>Select existing customer or add new customer details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Selection Mode */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <Button
                type="button"
                variant={customerMode === 'select' ? 'default' : 'ghost'}
                className="flex-1"
                onClick={() => {
                  setCustomerMode('select')
                  setCustomer({ id: '', name: '', phone: '', email: '', address: '' })
                }}
              >
                <Search className="w-4 h-4 mr-2" />
                Select Customer
              </Button>
              <Button
                type="button"
                variant={customerMode === 'new' ? 'default' : 'ghost'}
                className="flex-1"
                onClick={() => setCustomerMode('new')}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                New Customer
              </Button>
            </div>

            {/* Select Existing Customer */}
            {customerMode === 'select' && (
              <div className="space-y-2">
                <Label>Search Customer</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or phone..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setShowCustomerDropdown(true)
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    className="pl-10"
                  />
                  
                  {/* Customer Dropdown */}
                  {showCustomerDropdown && searchTerm && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((cust) => (
                          <div
                            key={cust.id}
                            className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => selectCustomer(cust)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{cust.name}</p>
                                <p className="text-sm text-gray-600">{cust.phone}</p>
                              </div>
                              {customer.id === cust.id && (
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                            {cust.email && (
                              <p className="text-xs text-gray-500 mt-1">{cust.email}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          <p>No customers found</p>
                          <Button
                            variant="link"
                            className="mt-2"
                            onClick={() => {
                              setCustomerMode('new')
                              setCustomer({ ...customer, name: searchTerm })
                              setShowCustomerDropdown(false)
                            }}
                          >
                            Add as new customer
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {customer.id && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-blue-900">{customer.name}</p>
                        <p className="text-sm text-blue-700">{customer.phone}</p>
                        {customer.email && <p className="text-xs text-blue-600">{customer.email}</p>}
                        {customer.address && <p className="text-xs text-blue-600">{customer.address}</p>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCustomer({ id: '', name: '', phone: '', email: '', address: '' })
                          setSearchTerm('')
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* New Customer Form */}
            {customerMode === 'new' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Customer Name *
                  </Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerPhone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number *
                  </Label>
                  <Input
                    id="customerPhone"
                    placeholder="Enter phone number"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    placeholder="customer@email.com"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerAddress" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </Label>
                  <Input
                    id="customerAddress"
                    placeholder="Enter address"
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button 
                onClick={() => setStep(2)}
                disabled={
                  (customerMode === 'select' && !customer.id) ||
                  (customerMode === 'new' && (!customer.name || !customer.phone))
                }
                className="px-8"
              >
                Next: Add Order Items →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Order Items */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Add New Item */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Order Item
              </CardTitle>
              <CardDescription>Add printing services to this order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Service Type *</Label>
                  <Select 
                    value={currentItem.serviceType} 
                    onValueChange={handleServiceTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map(service => (
                        <SelectItem key={service.value} value={service.value}>
                          {service.label} (₹{service.basePrice})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Unit Price (₹) *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={currentItem.unitPrice}
                    onChange={(e) => setCurrentItem({ ...currentItem, unitPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Size</Label>
                  <Select 
                    value={currentItem.size} 
                    onValueChange={(value) => setCurrentItem({ ...currentItem, size: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="A3">A3</SelectItem>
                      <SelectItem value="A5">A5</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Paper Type</Label>
                  <Select 
                    value={currentItem.paperType} 
                    onValueChange={(value) => setCurrentItem({ ...currentItem, paperType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="70gsm">70 GSM</SelectItem>
                      <SelectItem value="80gsm">80 GSM</SelectItem>
                      <SelectItem value="100gsm">100 GSM</SelectItem>
                      <SelectItem value="130gsm">130 GSM</SelectItem>
                      <SelectItem value="300gsm">300 GSM (Card)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Print Side</Label>
                  <Select 
                    value={currentItem.sides} 
                    onValueChange={(value: 'single' | 'double') => setCurrentItem({ ...currentItem, sides: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Side</SelectItem>
                      <SelectItem value="double">Double Side</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <Select 
                    value={currentItem.color} 
                    onValueChange={(value) => setCurrentItem({ ...currentItem, color: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="black">Black & White</SelectItem>
                      <SelectItem value="color">Color</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Additional details about this item..."
                  value={currentItem.description}
                  onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                  rows={2}
                />
              </div>

              <Button onClick={addItem} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Item to Order
              </Button>
            </CardContent>
          </Card>

          {/* Items List */}
          {items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((item) => {
                    const service = serviceTypes.find(s => s.value === item.serviceType)
                    return (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{service?.label || item.serviceType}</h4>
                            <Badge variant="outline">{item.size}</Badge>
                            <Badge variant="outline">{item.paperType}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{item.description || 'No description'}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            ₹{item.unitPrice} × {item.quantity} = ₹{(item.unitPrice * item.quantity).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemQuantity(item.id, -1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-12 text-center font-bold">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemQuantity(item.id, 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              ← Back
            </Button>
            <Button 
              onClick={() => setStep(3)}
              disabled={items.length === 0}
              className="px-8"
            >
              Next: Pricing & Payment →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Pricing & Payment */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item) => {
                  const service = serviceTypes.find(s => s.value === item.serviceType)
                  return (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{service?.label}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold">₹{(item.unitPrice * item.quantity).toLocaleString()}</p>
                    </div>
                  )
                })}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">₹{calculateSubtotal().toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-4">
                    <span>Discount (%):</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount Amount:</span>
                      <span>- ₹{calculateDiscount().toLocaleString()}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">₹{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Delivery Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment & Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Delivery Date *
                  </Label>
                  <Input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Urgency</Label>
                  <Select value={urgency} onValueChange={setUrgency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal (3-5 days)</SelectItem>
                      <SelectItem value="urgent">Urgent (1-2 days) +20%</SelectItem>
                      <SelectItem value="express">Express (Same day) +50%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment Type *</Label>
                  <Select 
                    value={paymentType} 
                    onValueChange={(value: 'full' | 'advance') => {
                      setPaymentType(value)
                      if (value === 'full') {
                        setAdvancePayment(calculateTotal())
                      } else {
                        setAdvancePayment(0)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Payment</SelectItem>
                      <SelectItem value="advance">Advance Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment Method *</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI/Online</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {paymentType === 'advance' && (
                <div className="space-y-2">
                  <Label>Advance Payment Amount (₹) *</Label>
                  <Input
                    type="number"
                    min="0"
                    max={calculateTotal()}
                    value={advancePayment}
                    onChange={(e) => setAdvancePayment(parseFloat(e.target.value) || 0)}
                    placeholder="Enter advance amount"
                  />
                  <p className="text-xs text-gray-500">
                    Total: ₹{calculateTotal().toLocaleString()} | 
                    Remaining: ₹{(calculateTotal() - advancePayment).toLocaleString()}
                  </p>
                </div>
              )}

              {paymentType === 'full' && advancePayment < calculateTotal() && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      Full Payment: ₹{calculateTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Upload Design File (Optional)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="fileUpload"
                    className="hidden"
                    accept=".pdf,.ai,.psd,.jpg,.png"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {designFile ? designFile.name : 'Click to upload design file'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF, AI, PSD, JPG, PNG (Max 10MB)</p>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea
                  placeholder="Any special instructions or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              ← Back
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={
                isSubmitting || 
                !deliveryDate || 
                (paymentType === 'advance' && advancePayment <= 0)
              }
              className="px-8"
              size="lg"
            >
              {isSubmitting ? (
                <>Creating Order...</>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {paymentType === 'full' 
                    ? `Complete Order - ₹${calculateTotal().toLocaleString()}`
                    : `Create Order - Advance ₹${advancePayment.toLocaleString()}`
                  }
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              Order Created Successfully!
            </DialogTitle>
            <DialogDescription>
              The printing order has been created and is ready for processing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Order Total</p>
              <p className="text-2xl font-bold text-green-700">₹{calculateTotal().toLocaleString()}</p>
              
              {paymentType === 'full' ? (
                <div className="mt-2 space-y-1">
                  <Badge className="bg-green-600">✓ Fully Paid</Badge>
                  <p className="text-sm text-green-700">
                    Payment Method: {paymentMethod.toUpperCase()}
                  </p>
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Advance Paid:</span>
                    <span className="font-bold text-green-700">₹{advancePayment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Balance Due:</span>
                    <span className="font-bold text-orange-600">₹{(calculateTotal() - advancePayment).toLocaleString()}</span>
                  </div>
                  <Badge className="bg-orange-500">Partial Payment</Badge>
                  <p className="text-xs text-orange-600 mt-1">
                    Payment Method: {paymentMethod.toUpperCase()}
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-medium">{customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone:</span>
                <span className="font-medium">{customer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span>Items:</span>
                <span className="font-medium">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span className="font-medium">{deliveryDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Type:</span>
                <span className="font-medium">
                  {paymentType === 'full' ? 'Full Payment' : 'Advance Payment'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setShowSuccess(false)
                router.push('/printing/orders')
              }}
            >
              View Orders
            </Button>
            <Button 
              className="flex-1"
              onClick={() => {
                setShowSuccess(false)
                router.push('/printing/new-order')
              }}
            >
              New Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
