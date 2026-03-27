'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  FileText, 
  Truck, 
  BarChart3, 
  UserCheck, 
  Gift, 
  Settings, 
  LogOut,
  ChevronDown,
  ChevronRight,
  Plus,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface MenuItem {
  id: string
  label: string
  icon: React.ElementType
  children?: MenuItem[]
  badge?: string
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    children: [
      { id: 'overview', label: 'Overview (sales, orders, profit)', icon: BarChart3 },
      { id: 'today', label: "Today's summary", icon: Home }
    ]
  },
  {
    id: 'products',
    label: 'Products / Inventory',
    icon: Package,
    badge: '24',
    children: [
      { id: 'add-product', label: 'Add Product', icon: Plus },
      { id: 'all-products', label: 'All Products', icon: Package },
      { id: 'categories', label: 'Categories (Saree, Shirt, Pant, Kids Wear, etc.)', icon: Package },
      { id: 'stock', label: 'Stock Management', icon: Package },
      { id: 'low-stock', label: 'Low Stock Alert', icon: AlertTriangle, badge: '3' }
    ]
  },
  {
    id: 'orders',
    label: 'Orders / Sales',
    icon: ShoppingCart,
    badge: '18',
    children: [
      { id: 'new-sale', label: 'New Sale (POS billing)', icon: Plus },
      { id: 'all-orders', label: 'All Orders', icon: ShoppingCart },
      { id: 'pending', label: 'Pending Orders', icon: ShoppingCart, badge: '5' },
      { id: 'completed', label: 'Completed Orders', icon: ShoppingCart },
      { id: 'returns', label: 'Return / Exchange', icon: ShoppingCart }
    ]
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: Users,
    badge: '342',
    children: [
      { id: 'customer-list', label: 'Customer List', icon: Users },
      { id: 'add-customer', label: 'Add Customer', icon: Plus },
      { id: 'history', label: 'Customer History', icon: Users }
    ]
  },
  {
    id: 'accounts',
    label: 'Accounts / Finance',
    icon: DollarSign,
    children: [
      { id: 'income', label: 'Income', icon: DollarSign },
      { id: 'expenses', label: 'Expenses', icon: DollarSign },
      { id: 'profit', label: 'Profit Report', icon: BarChart3 },
      { id: 'daily-sales', label: 'Daily Sales Report', icon: BarChart3 }
    ]
  },
  {
    id: 'billing',
    label: 'Billing / Invoice',
    icon: FileText,
    children: [
      { id: 'create-invoice', label: 'Create Invoice', icon: Plus },
      { id: 'print-invoice', label: 'Print Invoice', icon: FileText },
      { id: 'invoice-history', label: 'Invoice History', icon: FileText }
    ]
  },
  {
    id: 'suppliers',
    label: 'Suppliers / Vendors',
    icon: Truck,
    children: [
      { id: 'supplier-list', label: 'Supplier List', icon: Truck },
      { id: 'add-supplier', label: 'Add Supplier', icon: Plus },
      { id: 'purchase-orders', label: 'Purchase Orders', icon: Truck }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    badge: '45',
    children: [
      { id: 'sales-report', label: 'Sales Report', icon: BarChart3 },
      { id: 'stock-report', label: 'Stock Report', icon: Package },
      { id: 'customer-report', label: 'Customer Report', icon: Users }
    ]
  },
  {
    id: 'staff',
    label: 'Staff Management',
    icon: UserCheck,
    children: [
      { id: 'staff-list', label: 'Staff List', icon: UserCheck },
      { id: 'roles', label: 'Roles (Admin, Staff)', icon: UserCheck },
      { id: 'attendance', label: 'Attendance (optional)', icon: UserCheck }
    ]
  },
  {
    id: 'offers',
    label: 'Offers / Discounts',
    icon: Gift,
    children: [
      { id: 'create-offer', label: 'Create Offer', icon: Plus },
      { id: 'coupons', label: 'Coupons', icon: Gift },
      { id: 'festival', label: 'Festival Discounts', icon: Gift }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    children: [
      { id: 'shop-details', label: 'Shop Details', icon: Settings },
      { id: 'branding', label: 'Logo / Branding', icon: Settings },
      { id: 'tax', label: 'Tax (GST) Settings', icon: Settings },
      { id: 'backup', label: 'Backup Data', icon: Settings }
    ]
  },
  {
    id: 'logout',
    label: 'Logout',
    icon: LogOut
  }
]

interface GarmentsSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function GarmentsSidebar({ isOpen, onClose }: GarmentsSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleItemClick = (item: MenuItem) => {
    if (item.children) {
      toggleExpanded(item.id)
    } else if (item.id === 'logout') {
      // Handle logout
      onClose()
    } else {
      // Handle navigation
      console.log(`Navigate to: ${item.id}`)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-blue-500 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Garments Shop</h2>
                <p className="text-blue-100 text-sm">Main Sidebar Menu</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-blue-600"
                onClick={onClose}
              >
                ×
              </Button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isExpanded = expandedItems.includes(item.id)
                const hasChildren = item.children && item.children.length > 0

                return (
                  <div key={item.id}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between h-auto p-3 text-left",
                        item.id === 'logout' && "text-red-600 hover:text-red-700 hover:bg-red-50"
                      )}
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      {hasChildren && (
                        <ChevronRight 
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isExpanded && "rotate-90"
                          )}
                        />
                      )}
                    </Button>

                    {/* Sub-items */}
                    {hasChildren && isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children?.map((child) => {
                          const ChildIcon = child.icon
                          return (
                            <Button
                              key={child.id}
                              variant="ghost"
                              className="w-full justify-start h-auto p-2 pl-8 text-left"
                              onClick={() => handleItemClick(child)}
                            >
                              <div className="flex items-center gap-3">
                                <ChildIcon className="h-3 w-3 flex-shrink-0 text-gray-500" />
                                <span className="text-xs text-gray-700">{child.label}</span>
                                {child.badge && (
                                  <Badge variant="outline" className="text-xs">
                                    {child.badge}
                                  </Badge>
                                )}
                              </div>
                            </Button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <div className="text-xs text-gray-500 text-center">
              © 2024 Kherwal Bazaar Garments Shop
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
