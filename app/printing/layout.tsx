'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { SidebarNav } from '@/components/sidebar-nav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Package, ShoppingCart, TrendingUp, Loader2 } from 'lucide-react'

export default function PrintingLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        dataStatus={'green'}
      />
      <div className="flex flex-1">
        <SidebarNav activeSection={activeSection} />
        {/* Main Content */}
        <main className="flex-1 ml-64 bg-background">
          <div className="p-8 w-full mt-20">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="bg-purple-500 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Printing Sales</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-100" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      isClient ? `₹${metrics.totalPrintingSales.toLocaleString()}` : '₹0'
                    )}
                  </div>
                  <p className="text-xs text-blue-100">Total printing revenue</p>
                </CardContent>
              </Card>

              <Card className="bg-indigo-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Printing Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-indigo-100" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      isClient ? metrics.totalPrintingOrders.toLocaleString() : '0'
                    )}
                  </div>
                  <p className="text-xs text-indigo-100">Total printing jobs</p>
                </CardContent>
              </Card>

              <Card className="bg-pink-500 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Pending Jobs</CardTitle>
                  <Package className="h-4 w-4 text-pink-100" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      isClient ? metrics.pendingJobs : '0'
                    )}
                  </div>
                  <p className="text-xs text-purple-100">Jobs in progress</p>
                </CardContent>
              </Card>

              <Card className="bg-green-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Completed Jobs</CardTitle>
                  <Package className="h-4 w-4 text-purple-100" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      isClient ? metrics.completedJobs.toLocaleString() : '0'
                    )}
                  </div>
                  <p className="text-xs text-purple-100">Finished printing jobs</p>
                </CardContent>
              </Card>

              <Card className="bg-orange-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Printing Stock</CardTitle>
                  <Package className="h-4 w-4 text-green-100" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      isClient ? metrics.totalPrintingStock.toLocaleString() : '0'
                    )}
                  </div>
                  <p className="text-xs text-green-100">Printing materials available</p>
                </CardContent>
              </Card>

              <Card className="bg-red-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Material Cost</CardTitle>
                  <DollarSign className="h-4 w-4 text-orange-100" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      isClient ? `₹${metrics.totalPrintingCost.toLocaleString()}` : '₹0'
                    )}
                  </div>
                  <p className="text-xs text-orange-100">Total material investment</p>
                </CardContent>
              </Card>
            </div>

            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
