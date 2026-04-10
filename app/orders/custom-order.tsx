'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
import { Upload } from 'lucide-react'

interface CustomOrderFormProps {
  isOpen: boolean
  onClose: () => void
  productType: string
  basePrice: number
}

export default function CustomOrderForm({ isOpen, onClose, productType, basePrice }: CustomOrderFormProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    quantity: '1',
    urgency: 'normal',
    textDetails: '',
    colorPrint: false,
    urgentDelivery: false,
    designWork: false,
  })

  const [errors, setErrors] = useState({
    customerName: '',
    mobileNumber: '',
    quantity: '',
  })

  const calculateTotal = () => {
    let total = basePrice
    if (formData.colorPrint) total += 50
    if (formData.urgentDelivery) total += 30
    if (formData.designWork) total += 100
    return total * parseInt(formData.quantity || '1')
  }

  const validateForm = () => {
    const newErrors = {
      customerName: formData.customerName ? '' : 'Customer name is required',
      mobileNumber: formData.mobileNumber ? '' : 'Mobile number is required',
      quantity: formData.quantity ? '' : 'Quantity is required',
    }
    setErrors(newErrors)
    return Object.values(newErrors).every(error => error === '')
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      alert('Please fill in all required fields')
      return
    }

    const orderData = {
      ...formData,
      productType,
      basePrice,
      totalPrice: calculateTotal(),
      orderDate: new Date().toISOString(),
    }

    console.log('Custom order submitted:', orderData)
    alert(`Order placed successfully! Total: ¥${orderData.totalPrice}`)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Custom Order - {productType}</DialogTitle>
          <DialogDescription>
            Fill in the details below to place your custom printing order
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter customer name"
                className={errors.customerName ? 'border-red-500' : ''}
              />
              {errors.customerName && (
                <p className="text-sm text-red-500 mt-1">{errors.customerName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number *</Label>
              <Input
                id="mobileNumber"
                value={formData.mobileNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                placeholder="Enter 10-digit mobile number"
                className={errors.mobileNumber ? 'border-red-500' : ''}
              />
              {errors.mobileNumber && (
                <p className="text-sm text-red-500 mt-1">{errors.mobileNumber}</p>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="Enter quantity"
                min="1"
                className={errors.quantity ? 'border-red-500' : ''}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500 mt-1">{errors.quantity}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency</Label>
              <Select value={formData.urgency} onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal (3-5 days)</SelectItem>
                  <SelectItem value="urgent">Urgent (1-2 days)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Text Details */}
          <div className="space-y-2">
            <Label htmlFor="textDetails">Text for Printing</Label>
            <Textarea
              id="textDetails"
              value={formData.textDetails}
              onChange={(e) => setFormData(prev => ({ ...prev, textDetails: e.target.value }))}
              placeholder="Enter the text you want printed..."
              rows={4}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="fileUpload">Upload Design (Optional)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="fileUpload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.ai,.eps"
                className="flex-1"
              />
              <div className="text-sm text-gray-500">
                <Upload className="h-4 w-4 mr-2" />
                Upload PDF, JPG, PNG, AI, EPS files
              </div>
            </div>
          </div>

          {/* Price Options */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 mb-3">Additional Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="colorPrint"
                  checked={formData.colorPrint}
                  onChange={(e) => setFormData(prev => ({ ...prev, colorPrint: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="colorPrint">Color Print (+¥50)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="urgentDelivery"
                  checked={formData.urgentDelivery}
                  onChange={(e) => setFormData(prev => ({ ...prev, urgentDelivery: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="urgentDelivery">Urgent Delivery (+¥30)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="designWork"
                  checked={formData.designWork}
                  onChange={(e) => setFormData(prev => ({ ...prev, designWork: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="designWork">Design Work (+¥100)</Label>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <Card className="p-4 bg-gray-50">
            <h4 className="font-semibold text-gray-800 mb-3">Price Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Base Price:</span>
                <span className="font-medium">¥{basePrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span className="font-medium">{formData.quantity || '1'}</span>
              </div>
              {formData.colorPrint && (
                <div className="flex justify-between">
                  <span>Color Print:</span>
                  <span className="font-medium text-blue-600">+¥50</span>
                </div>
              )}
              {formData.urgentDelivery && (
                <div className="flex justify-between">
                  <span>Urgent Delivery:</span>
                  <span className="font-medium text-orange-600">+¥30</span>
                </div>
              )}
              {formData.designWork && (
                <div className="flex justify-between">
                  <span>Design Work:</span>
                  <span className="font-medium text-purple-600">+¥100</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-green-600">¥{calculateTotal()}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Place Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
