'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Header } from '@/components/header'
import { SidebarNav } from '@/components/sidebar-nav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Package, ShoppingCart, TrendingUp, Loader2 } from 'lucide-react'

interface PrintingLayoutProps {
  children: React.ReactNode
}

export default function PrintingLayout({ children }: PrintingLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [activeSection, setActiveSection] = useState('printing')
  const [metrics, setMetrics] = useState({
    totalPrintingSales: 45000,
    totalPrintingOrders: 125,
    activePrintingCustomers: 45,
    printingGrowthRate: 12.5,
    totalPrintingProducts: 8,
    totalPrintingStock: 2500,
    totalPrintingCost: 18000,
    pendingJobs: 8,
    completedJobs: 117
  })
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Hide sidebar for add-product page
  const showSidebar = !pathname?.includes('/add-product')

  // Handle section changes - navigate to main dashboard when switching sections
  const handleSectionChange = (section: string) => {
    if (section !== 'printing') {
      // Navigate to main dashboard when switching to other sections
      router.push('/')
    } else {
      // Stay in printing section
      setActiveSection('printing')
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header 
        activeSection={activeSection} 
        setActiveSection={handleSectionChange}
        dataStatus={'green'}
      />
      <div className="flex flex-1">
        {showSidebar && <SidebarNav activeSection={activeSection} />}
        {/* Main Content */}
        <main className={`flex-1 ${showSidebar ? 'ml-64' : ''} bg-background`}>
          <div className="w-full mt-20">
            {/* Page Content Only */}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
