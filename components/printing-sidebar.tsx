'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Plus, 
  List, 
  FileText, 
  Users, 
  Settings, 
  Package, 
  BarChart3, 
  LogOut, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Phone, 
  DollarSign,
  AlertCircle,
  Printer,
  Scissors,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface MenuItem {
  id: string
  label: string
  icon: React.ElementType
  children?: MenuItem[]
  badge?: string
  isImportant?: boolean
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    children: [
      { id: 'today-orders', label: 'Today Orders', icon: List, badge: '12' },
      { id: 'pending-jobs', label: 'Pending Jobs', icon: AlertCircle, badge: '5' },
      { id: 'daily-income', label: 'Daily Income', icon: DollarSign }
    ]
  },
  {
    id: 'new-order',
    label: 'New Order',
    icon: Plus,
    isImportant: true,
    children: [
      { id: 'quick-entry', label: 'Quick order entry', icon: Plus },
      { id: 'customer-details', label: 'Customer name + mobile', icon: Users },
      { id: 'job-type', label: 'Job type (Bill book, card, etc.)', icon: FileText },
      { id: 'quantity-price', label: 'Quantity + price', icon: DollarSign }
    ]
  },
  {
    id: 'orders-list',
    label: 'Orders List',
    icon: List,
    badge: '18',
    children: [
      { id: 'all-orders', label: 'All Orders', icon: List },
      { id: 'pending', label: 'Pending', icon: AlertCircle, badge: '5' },
      { id: 'completed', label: 'Completed', icon: CheckCircle, badge: '13' },
      { id: 'search', label: 'Search by name/mobile', icon: Search }
    ]
  },
  {
    id: 'job-types',
    label: 'Job Types',
    icon: FileText,
    children: [
      { id: 'bill-book', label: 'Bill Book', icon: FileText },
      { id: 'money-receipt', label: 'Money Receipt', icon: DollarSign },
      { id: 'invitation-card', label: 'Invitation Card', icon: FileText },
      { id: 'marriage-card', label: 'Marriage Card', icon: FileText },
      { id: 'banner', label: 'Banner / Flex', icon: FileText },
      { id: 't-shirt', label: 'T-Shirt Print', icon: FileText }
    ]
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: Users,
    badge: '45',
    children: [
      { id: 'add-customer', label: 'Add Customer', icon: Plus },
      { id: 'customer-list', label: 'Customer List', icon: Users },
      { id: 'repeat-orders', label: 'Repeat Orders', icon: List }
    ]
  },
  {
    id: 'work-status',
    label: 'Work Status (Production)',
    icon: Settings,
    children: [
      { id: 'designing', label: 'Designing', icon: FileText, badge: '3' },
      { id: 'printing', label: 'Printing', icon: Printer, badge: '2' },
      { id: 'cutting', label: 'Cutting', icon: Scissors, badge: '1' },
      { id: 'ready', label: 'Ready', icon: CheckCircle, badge: '6' }
    ]
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: DollarSign,
    children: [
      { id: 'generate-bill', label: 'Generate Bill', icon: FileText },
      { id: 'print-receipt', label: 'Print Receipt', icon: Printer },
      { id: 'payment-methods', label: 'Payment (Cash / UPI)', icon: DollarSign },
      { id: 'pending-payment', label: 'Pending Payment', icon: AlertCircle, badge: '4' }
    ]
  },
  {
    id: 'stock',
    label: 'Stock (Simple)',
    icon: Package,
    children: [
      { id: 'paper', label: 'Paper', icon: Package },
      { id: 'ink', label: 'Ink', icon: Package },
      { id: 'materials', label: 'Other materials', icon: Package }
    ]
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    children: [
      { id: 'all-products', label: 'All Products', icon: Package, badge: '5' },
      { id: 'add-product', label: 'Add Product', icon: Plus },
      { id: 'categories', label: 'Categories', icon: FileText }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    children: [
      { id: 'daily-sales', label: 'Daily Sales', icon: BarChart3 },
      { id: 'monthly-sales', label: 'Monthly Sales', icon: BarChart3 },
      { id: 'pending-payments', label: 'Pending Payments', icon: AlertCircle, badge: '4' }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    children: [
      { id: 'shop-name', label: 'Shop Name', icon: Settings },
      { id: 'price-setup', label: 'Price Setup', icon: DollarSign },
      { id: 'backup', label: 'Backup Data (VERY IMPORTANT for offline)', icon: AlertCircle }
    ]
  },
  {
    id: 'logout',
    label: 'Exit / Logout',
    icon: LogOut
  }
]

interface PrintingSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function PrintingSidebar({ isOpen, onClose }: PrintingSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['new-order'])
  const [searchQuery, setSearchQuery] = useState('')

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
      if (item.id === 'quick-entry') {
        // Quick order entry - open fast billing modal
        console.log('Opening quick order entry...')
      } else if (item.id === 'all-products') {
        // Navigate to printing products page
        window.location.href = '/printing/products'
      } else if (item.id === 'add-product') {
        // Navigate to add printing product page
        window.location.href = '/printing/products/add-product'
      } else if (item.id === 'categories') {
        // Navigate to categories page
        window.location.href = '/printing/products/categories'
      } else {
        // Other navigation
        console.log(`Navigating to ${item.id}`)
        onClose()
      }
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
      <div className="fixed left-0 top-0 h-full w-80 bg-green-600 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-green-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Printing Shop</h2>
                <p className="text-gray-300 text-sm">Quick Billing & Order Management</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-green-700"
                onClick={onClose}
              >
                ×
              </Button>
            </div>
            
            {/* Quick Search */}
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-200" />
                <Input
                  placeholder="Quick search orders..."
                  className="pl-10 bg-green-700 border-green-500 text-white placeholder-green-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="p-4 border-b border-green-500">
            <Button 
              className="w-full bg-white hover:bg-gray-100 text-green-600 font-bold py-3"
              onClick={() => {
                console.log('Opening quick order entry...')
                onClose()
              }}
            >
              <Plus className="h-5 w-5 mr-2" />
              NEW ORDER (Quick Billing)
            </Button>
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
                        "w-full justify-between h-auto p-3 text-left text-white hover:bg-green-700",
                        item.isImportant && "bg-green-700 border border-green-400 hover:bg-green-800",
                        item.id === 'logout' && "text-red-300 hover:text-red-200 hover:bg-red-900"
                      )}
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn(
                          "h-4 w-4 flex-shrink-0 text-green-200",
                          item.isImportant && "text-white"
                        )} />
                        <span className={cn(
                          "text-sm font-medium text-green-100",
                          item.isImportant && "text-white font-bold"
                        )}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <Badge variant={item.isImportant ? "default" : "secondary"} className="text-xs">
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
                              className="w-full justify-start h-auto p-2 pl-8 text-left text-green-100 hover:bg-green-700"
                              onClick={() => handleItemClick(child)}
                            >
                              <div className="flex items-center gap-3">
                                <ChildIcon className="h-3 w-3 flex-shrink-0 text-green-300" />
                                <span className="text-xs text-green-100">{child.label}</span>
                                {child.badge && (
                                  <Badge variant="outline" className="text-xs border-green-400 text-green-100">
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
          <div className="border-t border-green-500 p-4 bg-green-700">
            <div className="text-xs text-green-100 text-center">
              <p className="font-medium text-white">💾 Remember to backup data daily!</p>
              <p>© 2024 Kherwal Bazaar Printing Shop</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
