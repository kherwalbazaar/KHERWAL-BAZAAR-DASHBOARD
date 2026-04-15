'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Shirt,
  Printer,
  Code2,
  Users,
  User,
  FileText,
  Calendar,
  FileBox,
  Heart,
  Settings,
  ShoppingCart,
  DollarSign,
  Truck,
  BarChart3,
  UserCheck,
  Gift,
  LogOut,
  Plus,
  List,
  Package,
  Briefcase,
  CreditCard,
  Shield,
  Building,
  ChevronDown,
  RotateCcw,
  FolderOpen,
  AlertTriangle,
  Book,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  BookOpen,
  CheckCircle,
  Clock,
  PieChart,
  Percent,
  Ticket,
  Store,
  HardDrive,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarNavProps {
  activeSection?: string
}

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<any>
  count: number | null
  children?: NavItem[]
}

interface SectionData {
  totalSale?: number
  totalOrders?: number
  activeCustomers?: number
  totalProducts?: number
  totalStock?: number
  growthRate?: number
}

export function SidebarNav({ activeSection = 'dashboard' }: SidebarNavProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [sectionData, setSectionData] = useState<SectionData>({})
  const [printingData, setPrintingData] = useState({
    totalOrders: 0,
    totalCustomers: 0,
    totalJobTypes: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0
  })
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev: string[]) =>
      prev.includes(itemId)
        ? prev.filter((id: string) => id !== itemId)
        : [...prev, itemId]
    )
  }

  // Load section-specific data from Firebase
  useEffect(() => {
    const loadSectionData = async () => {
      try {
        setLoading(true)
        
        // Load Garments Data
        if (activeSection === 'garments' || activeSection === 'dashboard') {
          const { getProducts } = await import('@/lib/firebase')
          const result = await getProducts()
          
          if (result.success && result.products) {
            const products = result.products
            const totalProducts = products.length
            const totalStock = products.reduce((sum, product) => sum + product.stock, 0)
            const totalSale = products.reduce((sum, product) => sum + (product.costPrice * product.stock), 0)
            const totalOrders = Math.floor(totalStock * 0.8)
            const activeCustomers = Math.floor(totalStock * 0.3)
            const growthRate = 23.5 + (totalProducts * 0.5)

            setSectionData({
              totalSale,
              totalOrders,
              activeCustomers,
              totalProducts,
              totalStock,
              growthRate
            })
          }
        }
        
        // Load Printing Data
        if (activeSection === 'printing') {
          const { getPrintingOrders, getPrintingCustomers, getJobTypes } = await import('@/lib/firebase')
          
          // Load orders
          const ordersResult = await getPrintingOrders()
          const orders = ordersResult.success && ordersResult.orders ? ordersResult.orders : []
          
          // Load customers
          const customersResult = await getPrintingCustomers()
          const customers = customersResult.success && customersResult.customers ? customersResult.customers : []
          
          // Load job types
          const jobTypesResult = await getJobTypes()
          const jobTypes = jobTypesResult.success && jobTypesResult.jobTypes ? jobTypesResult.jobTypes : []
          
          setPrintingData({
            totalOrders: orders.length,
            totalCustomers: customers.length,
            totalJobTypes: jobTypes.length,
            pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
            inProgressOrders: orders.filter((o: any) => o.status === 'in-progress').length,
            completedOrders: orders.filter((o: any) => o.status === 'completed').length
          })
        }
      } catch (error) {
        console.error('Error loading section data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSectionData()
  }, [activeSection])

  // Define navigation items for different sections
  // Main business navigation
  const mainNavItems = [
    {
      label: 'Sales & Orders',
      href: '#',
      icon: ShoppingCart,
      count: null,
      children: [
        {
          label: 'POS (New Sale)',
          href: '/garments/pos',
          icon: Plus,
          count: null,
        },
        {
          label: 'Orders',
          href: '/orders',
          icon: List,
          count: null,
        },
      ],
    },
    {
      label: 'Products',
      href: '/garments/products/all-products',
      icon: Shirt,
      count: sectionData.totalProducts ?? 0,
    },
    {
      label: 'Customers',
      href: '/customers',
      icon: Users,
      count: null,
    },
    {
      label: 'Suppliers',
      href: '/suppliers',
      icon: Truck,
      count: null,
    },
    {
      label: 'Accounts',
      href: '/accounts',
      icon: DollarSign,
      count: null,
    },
    {
      label: 'Reports',
      href: '/reports',
      icon: BarChart3,
      count: null,
    },
    {
      label: 'Staff Management',
      href: '/staff',
      icon: UserCheck,
      count: null,
    },
    {
      label: 'Offers & Marketing',
      href: '/offers',
      icon: Gift,
      count: null,
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
      count: null,
    },
  ]

  const garmentsNavItems = [
    {
      label: 'Sales & Orders',
      href: '/garments/sales-orders',
      icon: ShoppingCart,
      count: null,
      children: [
        {
          label: 'POS (New Sale)',
          href: '/garments/pos',
          icon: Plus,
          count: null,
        },
        {
          label: 'Orders',
          href: '/garments/orders',
          icon: List,
          count: 18,
        },
      ],
    },
    {
      label: 'Products',
      href: '/garments/products',
      icon: Shirt,
      count: null,
      children: [
        {
          label: 'Add Product',
          href: '/garments/products/add-product',
          icon: Plus,
          count: null,
        },
        {
          label: 'All Products',
          href: '/garments/products/all-products',
          icon: List,
          count: sectionData.totalProducts ?? 0,
        },
        {
          label: 'Categories',
          href: '/garments/products/categories',
          icon: FolderOpen,
          count: 0,
        },
        {
          label: 'Low Stock Alert',
          href: '/garments/products/low-stock',
          icon: AlertTriangle,
          count: null,
        },
      ],
    },
    {
      label: 'Customers',
      href: '/garments/customers',
      icon: Users,
      count: null,
      children: [
        {
          label: 'All Customers',
          href: '/garments/customers/all',
          icon: Users,
          count: sectionData.activeCustomers ?? 0,
        },
        {
          label: 'Customer Ledger',
          href: '/garments/customers/ledger',
          icon: Book,
          count: null,
        },
        {
          label: 'Credit / Due',
          href: '/garments/customers/credit',
          icon: CreditCard,
          count: null,
        },
      ],
    },
    {
      label: 'Suppliers',
      href: '/garments/suppliers',
      icon: Truck,
      count: null,
      children: [
        {
          label: 'All Suppliers',
          href: '/garments/suppliers/all',
          icon: Truck,
          count: 12,
        },
        {
          label: 'Purchase Orders',
          href: '/garments/suppliers/orders',
          icon: ClipboardList,
          count: null,
        },
        {
          label: 'Supplier Ledger',
          href: '/garments/suppliers/ledger',
          icon: Book,
          count: null,
        },
      ],
    },
    {
      label: 'Accounts',
      href: '/garments/accounts',
      icon: DollarSign,
      count: null,
      children: [
        {
          label: 'Income',
          href: '/garments/accounts/income',
          icon: TrendingUp,
          count: null,
        },
        {
          label: 'Expense',
          href: '/garments/accounts/expense',
          icon: TrendingDown,
          count: null,
        },
        {
          label: 'Cash Book',
          href: '/garments/accounts/cash-book',
          icon: BookOpen,
          count: null,
        },
        {
          label: 'Daily Report',
          href: '/garments/accounts/daily-report',
          icon: Calendar,
          count: null,
        },
      ],
    },
    {
      label: 'Reports',
      href: '/garments/reports',
      icon: BarChart3,
      count: null,
      children: [
        {
          label: 'Sales Report',
          href: '/garments/reports/sales',
          icon: BarChart3,
          count: 23,
        },
        {
          label: 'Profit/Loss',
          href: '/garments/reports/profit-loss',
          icon: PieChart,
          count: null,
        },
        {
          label: 'Stock Report',
          href: '/garments/reports/stock',
          icon: Package,
          count: null,
        },
        {
          label: 'Customer Report',
          href: '/garments/reports/customers',
          icon: Users,
          count: null,
        },
      ],
    },
    {
      label: 'Staff Management',
      href: '/garments/staff',
      icon: UserCheck,
      count: null,
      children: [
        {
          label: 'Staff List',
          href: '/garments/staff/list',
          icon: UserCheck,
          count: 8,
        },
        {
          label: 'Roles & Permissions',
          href: '/garments/staff/roles',
          icon: Shield,
          count: null,
        },
        {
          label: 'Attendance',
          href: '/garments/staff/attendance',
          icon: Clock,
          count: null,
        },
      ],
    },
    {
      label: 'Offers & Marketing',
      href: '/garments/offers',
      icon: Gift,
      count: null,
      children: [
        {
          label: 'Offers',
          href: '/garments/offers/list',
          icon: Gift,
          count: 5,
        },
        {
          label: 'Discounts',
          href: '/garments/offers/discounts',
          icon: Percent,
          count: null,
        },
        {
          label: 'Coupons',
          href: '/garments/offers/coupons',
          icon: Ticket,
          count: null,
        },
      ],
    },
    {
      label: 'Settings',
      href: '/garments/settings',
      icon: Settings,
      count: null,
      children: [
        {
          label: 'Shop Details',
          href: '/garments/settings/shop',
          icon: Store,
          count: null,
        },
        {
          label: 'Printer Setup',
          href: '/garments/settings/printer',
          icon: Printer,
          count: null,
        },
        {
          label: 'Backup & Restore',
          href: '/garments/settings/backup',
          icon: HardDrive,
          count: null,
        },
        {
          label: 'User Settings',
          href: '/garments/settings/user',
          icon: User,
          count: null,
        },
      ],
    },
  ]

  const printingNavItems = [
    {
      label: '📦 Products',
      href: '/printing/products',
      icon: Package,
      count: null,
      children: [
        {
          label: '➕ Add Product',
          href: '/printing/products/add-product',
          icon: Plus,
          count: null,
        },
        {
          label: '📋 All Products',
          href: '/printing/products',
          icon: Package,
          count: null,
        },
        {
          label: '🗂️ Categories',
          href: '/printing/products/categories',
          icon: FileText,
          count: null,
        },
        {
          label: '⚠️ Low Stock',
          href: '/printing/products/low-stock',
          icon: AlertTriangle,
          count: 3,
        },
      ],
    },
    {
      label: '📋 Orders',
      href: '/printing/orders',
      icon: List,
      count: loading ? null : printingData.totalOrders,
      children: [
        {
          label: '➕ New Order',
          href: '/printing/new-order',
          icon: Plus,
          count: null,
        },
        {
          label: '📋 All Orders',
          href: '/printing/orders',
          icon: List,
          count: loading ? null : printingData.totalOrders,
        },
        {
          label: '⏳ Pending',
          href: '/printing/orders?status=pending',
          icon: Clock,
          count: loading ? null : printingData.pendingOrders,
        },
        {
          label: '⚙️ In Progress',
          href: '/printing/orders?status=in-progress',
          icon: Settings,
          count: loading ? null : printingData.inProgressOrders,
        },
        {
          label: '✅ Completed',
          href: '/printing/orders?status=completed',
          icon: CheckCircle,
          count: loading ? null : printingData.completedOrders,
        },
      ],
    },
    {
      label: 'Customers',
      href: '/printing/customers',
      icon: Users,
      count: loading ? null : printingData.totalCustomers,
    },
    {
      label: 'Job Types',
      href: '/printing/job-types',
      icon: FileText,
      count: loading ? null : printingData.totalJobTypes,
    },
    {
      label: 'Reports',
      href: '/printing/reports',
      icon: BarChart3,
      count: null,
    },
    {
      label: 'Settings',
      href: '/printing/settings',
      icon: Settings,
      count: null,
    },
  ]

  const onlineNavItems = [
    {
      label: 'User Panel',
      href: '/online/user',
      icon: User,
      count: null,
    },
    {
      label: 'Apply Certificate',
      href: '/online/certificates',
      icon: FileText,
      count: 23,
    },
    {
      label: 'Job Services',
      href: '/online/jobs',
      icon: Briefcase,
      count: 20,
    },
    {
      label: 'My Applications',
      href: '/online/applications',
      icon: List,
      count: 5,
    },
    {
      label: 'Payments',
      href: '/online/payments',
      icon: CreditCard,
      count: 1,
    },
    {
      label: 'Orders',
      href: '/online/admin/orders',
      icon: ShoppingCart,
      count: 18,
    },
    {
      label: 'Services',
      href: '/online/admin/services',
      icon: Building,
      count: 45,
    },
    {
      label: 'Customers',
      href: '/online/admin/customers',
      icon: Users,
      count: 156,
    },
    {
      label: 'Reports',
      href: '/online/admin/reports',
      icon: BarChart3,
      count: 34,
    },
    {
      label: 'Settings',
      href: '/online/admin/settings',
      icon: Settings,
      count: null,
    },
  ]

  // Select navigation items based on active section
  let navItems: NavItem[] = mainNavItems

  if (activeSection === 'garments' || activeSection === 'dashboard') {
    navItems = garmentsNavItems
  } else if (activeSection === 'printing') {
    navItems = printingNavItems
  } else if (activeSection === 'online') {
    navItems = onlineNavItems
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Sidebar - Always Visible */}
      <aside className={`fixed left-0 top-24 h-[calc(100vh-6rem)] w-64 flex flex-col overflow-hidden ${
        activeSection === 'printing' ? 'bg-green-500' : 
        activeSection === 'online' ? 'bg-pink-500' : 
        'bg-blue-500'
      }`}>
        {/* Section Header */}
        <div className={`px-4 py-3 border-b ${
          activeSection === 'printing' ? 'bg-green-600 border-green-400' : 
          activeSection === 'online' ? 'bg-pink-600 border-pink-400' : 
          'bg-blue-600 border-blue-400'
        }`}>
          <h2 className="text-lg font-bold text-white">
            {activeSection === 'printing' ? '🖨️ PRINTING HUB' : 
             activeSection === 'online' ? '🌐 ONLINE SERVICES' : 
             '👕 KHERWAL BAZAAR'}
          </h2>
          <p className={`text-xs mt-1 ${
            activeSection === 'printing' ? 'text-green-100' : 
            activeSection === 'online' ? 'text-pink-100' : 
            'text-blue-100'
          }`}>
            {activeSection === 'printing' ? 'Professional Printing Solutions' : 
             activeSection === 'online' ? 'Digital Services Portal' : 
             'Redefining your Style'}
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-0 overflow-y-auto pt-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            const isExpanded = expandedItems.includes(item.href)
            const hasChildren = (item as NavItem).children && (item as NavItem).children!.length > 0

            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium border-b border-gray-300',
                    active
                      ? activeSection === 'printing' 
                        ? 'bg-white text-green-600 shadow-md scale-105'
                        : activeSection === 'online'
                        ? 'bg-white text-pink-600 shadow-md scale-105'
                        : 'bg-white text-blue-600 shadow-md scale-105'
                      : activeSection === 'printing'
                        ? 'text-white hover:bg-white hover:text-green-600'
                        : activeSection === 'online'
                        ? 'text-white hover:bg-white hover:text-pink-600'
                        : 'text-white hover:bg-white hover:text-blue-600'
                  )}
                  onClick={(e) => {
                    if (hasChildren) {
                      e.preventDefault()
                      toggleExpanded(item.href)
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn(
                      'h-5 w-5 flex-shrink-0',
                      active 
                        ? activeSection === 'printing' 
                          ? 'text-green-600' 
                          : activeSection === 'online'
                          ? 'text-pink-600'
                          : 'text-blue-600'
                        : 'text-white'
                    )} />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {loading ? (
                      <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse" />
                    ) : item.count !== null ? (
                      <span className={cn(
                        'text-xs px-2 py-1 rounded-full font-semibold',
                        active 
                          ? activeSection === 'printing' 
                            ? 'bg-green-500 text-white' 
                            : activeSection === 'online'
                            ? 'bg-pink-500 text-white'
                            : 'bg-blue-500 text-white'
                          : 'bg-white/20 text-white'
                      )}>
                        {item.count}
                      </span>
                    ) : null}
                  </div>
                  {hasChildren && (
                    <ChevronDown 
                      className={cn(
                        'h-4 w-4 transition-transform duration-200',
                        active 
                          ? activeSection === 'printing' 
                            ? 'text-green-600' 
                            : activeSection === 'online'
                            ? 'text-pink-600'
                            : 'text-blue-600'
                          : 'text-white',
                        isExpanded ? 'rotate-180' : ''
                      )}
                    />
                  )}
                </Link>

                {/* Sub-menu items */}
                {hasChildren && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {(item as NavItem).children?.map((child: NavItem) => {
                      const ChildIcon = child.icon
                      const childActive = isActive(child.href)
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 border-b border-gray-200',
                            childActive
                              ? activeSection === 'printing'
                                ? 'bg-green-100 text-green-800'
                                : activeSection === 'online'
                                ? 'bg-pink-100 text-pink-800'
                                : 'bg-blue-100 text-blue-800'
                              : activeSection === 'printing'
                                ? 'text-white hover:bg-white hover:text-green-600'
                                : activeSection === 'online'
                                ? 'text-white hover:bg-white hover:text-pink-600'
                                : 'text-white hover:bg-white hover:text-blue-600'
                          )}
                        >
                          <ChildIcon className={cn(
                            'h-4 w-4 flex-shrink-0',
                            childActive 
                              ? activeSection === 'printing' 
                                ? 'text-green-800' 
                                : activeSection === 'online'
                                ? 'text-pink-800'
                                : 'text-blue-800'
                              : 'text-white'
                          )} />
                          <span>{child.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-accent/30">
          <p className="text-xs text-sidebar-foreground/60 text-center">
            2024 Kherwal Bazaar
          </p>
        </div>
      </aside>
    </>
  )
}
