'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { 
  Home, 
  FileText, 
  Briefcase, 
  Users, 
  CreditCard, 
  Settings, 
  BarChart3, 
  Bell, 
  Upload, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  User, 
  Building, 
  GraduationCap, 
  Phone, 
  Mail, 
  MessageSquare,
  ShoppingCart,
  Receipt,
  Shield,
  Database,
  Globe,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Zap
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
  isAdmin?: boolean
}

const userMenuItems: MenuItem[] = [
  {
    id: 'user-dashboard',
    label: 'Dashboard',
    icon: Home,
    children: [
      { id: 'overview', label: 'My Overview', icon: BarChart3 },
      { id: 'recent-activity', label: 'Recent Activity', icon: Clock },
      { id: 'notifications', label: 'Notifications', icon: Bell, badge: '3' }
    ]
  },
  {
    id: 'certificates',
    label: 'Apply Certificate',
    icon: FileText,
    isImportant: true,
    children: [
      { id: 'income-certificate', label: 'Income Certificate', icon: FileText },
      { id: 'residence-certificate', label: 'Residence Certificate', icon: Home },
      { id: 'caste-certificate', label: 'Caste Certificate', icon: Users },
      { id: 'birth-certificate', label: 'Birth Certificate', icon: FileText },
      { id: 'death-certificate', label: 'Death Certificate', icon: FileText }
    ]
  },
  {
    id: 'job-services',
    label: 'Job Services',
    icon: Briefcase,
    children: [
      { id: 'govt-jobs', label: '🏛️ Government Jobs', icon: Building, badge: '12' },
      { id: 'private-jobs', label: '🏢 Private Jobs', icon: Briefcase, badge: '8' },
      { id: 'resume-upload', label: 'Upload Resume', icon: Upload },
      { id: 'job-search', label: 'Search Jobs', icon: Search }
    ]
  },
  {
    id: 'my-applications',
    label: 'My Applications',
    icon: FileText,
    badge: '5',
    children: [
      { id: 'certificate-apps', label: 'Certificate Applications', icon: FileText, badge: '3' },
      { id: 'job-apps', label: 'Job Applications', icon: Briefcase, badge: '2' },
      { id: 'track-status', label: 'Track Status', icon: Search }
    ]
  },
  {
    id: 'my-orders',
    label: 'My Orders',
    icon: ShoppingCart,
    badge: '2',
    children: [
      { id: 'printing-orders', label: 'Printing Orders', icon: FileText },
      { id: 'service-orders', label: 'Service Orders', icon: Briefcase },
      { id: 'order-history', label: 'Order History', icon: Clock }
    ]
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: CreditCard,
    children: [
      { id: 'make-payment', label: 'Make Payment', icon: CreditCard },
      { id: 'payment-history', label: 'Payment History', icon: Receipt },
      { id: 'pending-payments', label: 'Pending Payments', icon: AlertCircle, badge: '1' }
    ]
  }
]

const adminMenuItems: MenuItem[] = [
  {
    id: 'admin-dashboard',
    label: '🏠 Dashboard',
    icon: Home,
    isAdmin: true,
    children: [
      { id: 'admin-overview', label: 'Admin Overview', icon: BarChart3 },
      { id: 'system-stats', label: 'System Statistics', icon: Database },
      { id: 'recent-activities', label: 'Recent Activities', icon: Clock }
    ]
  },
  {
    id: 'printing-orders',
    label: '🛒 Orders (Printing)',
    icon: ShoppingCart,
    isAdmin: true,
    badge: '18',
    children: [
      { id: 'all-printing-orders', label: 'All Printing Orders', icon: ShoppingCart },
      { id: 'pending-printing', label: 'Pending Printing', icon: AlertCircle, badge: '5' },
      { id: 'completed-printing', label: 'Completed Printing', icon: CheckCircle }
    ]
  },
  {
    id: 'govt-services',
    label: '🏢 Government Services',
    icon: Building,
    isAdmin: true,
    badge: '45',
    children: [
      { id: 'certificate-applications', label: 'Certificates', icon: FileText, badge: '23' },
      { id: 'job-applications', label: 'Jobs', icon: Briefcase, badge: '22' },
      { id: 'pending-approval', label: 'Pending Approval', icon: AlertCircle, badge: '8' }
    ]
  },
  {
    id: 'customers',
    label: '👥 Customers',
    icon: Users,
    isAdmin: true,
    badge: '156',
    children: [
      { id: 'all-customers', label: 'All Customers', icon: Users },
      { id: 'customer-details', label: 'Customer Details', icon: User },
      { id: 'customer-activity', label: 'Customer Activity', icon: Clock }
    ]
  },
  {
    id: 'payments',
    label: '💳 Payments',
    icon: CreditCard,
    isAdmin: true,
    children: [
      { id: 'all-payments', label: 'All Payments', icon: CreditCard },
      { id: 'payment-status', label: 'Payment Status', icon: Receipt },
      { id: 'revenue-report', label: 'Revenue Report', icon: BarChart3 }
    ]
  },
  {
    id: 'reports',
    label: '📊 Reports',
    icon: BarChart3,
    isAdmin: true,
    children: [
      { id: 'service-reports', label: 'Service Reports', icon: FileText },
      { id: 'customer-reports', label: 'Customer Reports', icon: Users },
      { id: 'financial-reports', label: 'Financial Reports', icon: CreditCard }
    ]
  },
  {
    id: 'settings',
    label: '⚙️ Settings',
    icon: Settings,
    isAdmin: true,
    children: [
      { id: 'service-pricing', label: 'Service Pricing', icon: CreditCard },
      { id: 'notification-settings', label: 'Notification Settings', icon: Bell },
      { id: 'system-settings', label: 'System Settings', icon: Shield },
      { id: 'backup-data', label: 'Backup Data', icon: Database }
    ]
  }
]

interface OnlineSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function OnlineSidebar({ isOpen, onClose }: OnlineSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['certificates'])
  const [isAdminMode, setIsAdminMode] = useState(false)
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
    } else {
      // Handle navigation
      console.log(`Navigate to: ${item.id}`)
      if (item.id === 'income-certificate') {
        console.log('Opening income certificate application...')
      } else if (item.id === 'govt-jobs') {
        console.log('Opening government jobs portal...')
      }
      onClose()
    }
  }

  if (!isOpen) return null

  const currentMenuItems = isAdminMode ? adminMenuItems : userMenuItems

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Online Services</h2>
                <p className="text-purple-100 text-sm">Government & Job Services</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-purple-700"
                onClick={onClose}
              >
                ×
              </Button>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex bg-white/20 rounded-lg p-1">
              <Button
                variant={isAdminMode ? "ghost" : "default"}
                size="sm"
                className={cn(
                  "flex-1 text-xs",
                  !isAdminMode && "bg-white text-purple-600"
                )}
                onClick={() => setIsAdminMode(false)}
              >
                👤 User Panel
              </Button>
              <Button
                variant={isAdminMode ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "flex-1 text-xs",
                  isAdminMode && "bg-white text-purple-600"
                )}
                onClick={() => setIsAdminMode(true)}
              >
                🧑‍💼 Admin Panel
              </Button>
            </div>
            
            {/* Quick Search */}
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-200" />
                <Input
                  placeholder="Quick search services..."
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder-purple-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                onClick={() => {
                  console.log('Quick certificate application...')
                  onClose()
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Apply Certificate
              </Button>
              <Button 
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                onClick={() => {
                  console.log('Quick job search...')
                  onClose()
                }}
              >
                <Briefcase className="h-3 w-3 mr-1" />
                Find Jobs
              </Button>
            </div>
            
            {/* Status Indicators */}
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Live Tracking</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-yellow-500" />
                <span>Fast Processing</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-blue-500" />
                <span>Secure</span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {currentMenuItems.map((item) => {
                const Icon = item.icon
                const isExpanded = expandedItems.includes(item.id)
                const hasChildren = item.children && item.children.length > 0

                return (
                  <div key={item.id}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between h-auto p-3 text-left",
                        item.isImportant && "bg-purple-50 border border-purple-200 hover:bg-purple-100",
                        item.isAdmin && "bg-gray-50 border-l-4 border-l-purple-500 hover:bg-gray-100"
                      )}
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn(
                          "h-4 w-4 flex-shrink-0",
                          item.isImportant && "text-purple-600",
                          item.isAdmin && "text-purple-600"
                        )} />
                        <span className={cn(
                          "text-sm font-medium",
                          item.isImportant && "text-purple-700 font-bold",
                          item.isAdmin && "text-gray-700"
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
          <div className="border-t border-gray-200 p-4 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="text-xs text-gray-600 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MessageSquare className="h-3 w-3 text-green-500" />
                <span className="font-medium">WhatsApp & SMS Notifications</span>
              </div>
              <p>📄 Upload Documents • 🔄 Live Status • 💳 Online Payments</p>
              <p className="mt-1">© 2024 Kherwal Bazaar Online Services</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
