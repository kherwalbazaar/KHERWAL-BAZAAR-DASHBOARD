'use client'

import { useState, useEffect } from 'react'
import { SidebarNav } from '@/components/sidebar-nav'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dashboard } from '@/components/dashboard'
import { TrendingUp, ShoppingCart, Users, DollarSign, Package, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import CustomOrderForm from './orders/custom-order'

export default function Home() {
  const [activeSection, setActiveSection] = useState('garments')
  const [metrics, setMetrics] = useState({
    totalSale: 0,
    totalOrders: 0,
    activeCustomers: 0,
    growthRate: 0,
    totalProducts: 0,
    totalStock: 0,
    totalProductCost: 0
  })

  const [printingMetrics, setPrintingMetrics] = useState({
    totalPrintingSales: 0,
    totalPrintingOrders: 0,
    activePrintingCustomers: 0,
    printingGrowthRate: 0,
    totalPrintingProducts: 0,
    totalPrintingStock: 0,
    totalPrintingCost: 0,
    pendingJobs: 0,
    completedJobs: 0
  })
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastDataHash, setLastDataHash] = useState('')
  const [dataStatus, setDataStatus] = useState<'green' | 'yellow' | 'red'>('yellow')
  const [isSyncing, setIsSyncing] = useState(true)
  const [changeDetectedTime, setChangeDetectedTime] = useState<number | null>(null)
  const [customOrderOpen, setCustomOrderOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  
  // Customer state for printing orders
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [customerName, setCustomerName] = useState<string>('')
  const [customerPhone, setCustomerPhone] = useState<string>('')

  // Load real data from Firebase on component mount
  useEffect(() => {
    setIsClient(true)
    setDataStatus('yellow') // Set to yellow during initial load
    setIsSyncing(true)
    loadDashboardData()
    loadCustomers()
    loadPrintingMetrics()
  }, [])

  // Set up change detection listener - checks for data changes every 3 seconds when not syncing
  useEffect(() => {
    if (!isClient || isSyncing || dataStatus === 'yellow') return // Skip if still loading or syncing
    
    const interval = setInterval(async () => {
      try {
        const { getProducts, getOrders, getSales } = await import('@/lib/firebase')
        
        const productsResult = await getProducts()
        let salesData: any[] = []
        try {
          const salesResult = await getSales()
          if (salesResult.success && salesResult.sales) {
            salesData = salesResult.sales
          }
        } catch (error) {
          salesData = []
        }
        
        const products = productsResult.success && productsResult.products ? productsResult.products : []
        const sales = salesData
        
        const totalProducts = products.length
        const totalStock = products.reduce((sum: number, product: any) => sum + (Number(product.stock || 0)), 0)
        const totalProductCost = products.reduce((sum: number, product: any) => sum + (Number(product.costPrice || 0) * Number(product.stock || 0)), 0)
        
        const realTotalPaid = sales.reduce((sum: number, sale: any) => sum + (sale.paidAmount || 0), 0)
        const totalCheckouts = sales.length
        
        const checkMetrics = {
          totalSale: realTotalPaid,
          totalOrders: totalCheckouts,
          activeCustomers: new Set(sales.map((sale: any) => sale.customerId)).size,
          growthRate: 0,
          totalProducts,
          totalStock,
          totalProductCost
        }
        
        const newDataHash = JSON.stringify(checkMetrics)
        
        // If data changed and not currently showing red status
        if (lastDataHash && newDataHash !== lastDataHash && dataStatus !== 'red') {
          console.log('Data change detected - showing waiting for sync')
          setDataStatus('red') // Show red "Waiting for sync"
          setChangeDetectedTime(Date.now())
        }
      } catch (error) {
        console.log('Change detection check failed:', error)
      }
    }, 3000)
    
    return () => clearInterval(interval)
  }, [isClient, isSyncing, dataStatus, lastDataHash])

  // Auto-sync after detecting changes for 3 seconds
  useEffect(() => {
    if (changeDetectedTime && dataStatus === 'red') {
      const timer = setTimeout(async () => {
        if (Date.now() - changeDetectedTime >= 3000) {
          console.log('Auto-syncing after detecting data changes...')
          setIsRefreshing(true)
          setIsSyncing(true)
          setDataStatus('yellow') // Set to yellow during sync
          await loadDashboardData()
          setChangeDetectedTime(null)
        }
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [changeDetectedTime, dataStatus])

  const loadDashboardData = async () => {
    try {
      const { getProducts, getOrders, getSales } = await import('@/lib/firebase')
      
      // Get products from Firebase (includes current stock values)
      const productsResult = await getProducts()
      
      // Try to get orders, but handle permission errors gracefully
      let ordersData: any[] = []
      try {
        const ordersResult = await getOrders()
        if (ordersResult.success && ordersResult.orders) {
          ordersData = ordersResult.orders
        }
      } catch (ordersError) {
        console.log('Orders collection not available yet, showing 0 orders')
        ordersData = []
      }
      
      // Get sales data
      let salesData: any[] = []
      try {
        const salesResult = await getSales()
        if (salesResult.success && salesResult.sales) {
          salesData = salesResult.sales
        }
      } catch (salesError) {
        console.log('Sales collection not available yet, showing 0 sales')
        salesData = []
      }
      
      const products = productsResult.success && productsResult.products ? productsResult.products : []
      const orders = ordersData
      const sales = salesData
      
      const totalProducts = products.length
      
      // IMPORTANT: totalStock shows CURRENT stock in database (already reduced after checkouts)
      // This is the actual real-time stock value from Firebase products
      const totalStock = products.reduce((sum: number, product: any) => sum + (Number(product.stock || 0)), 0)
      
      // Total product cost using CURRENT stock values (not historical)
      const totalProductCost = products.reduce((sum: number, product: any) => sum + (Number(product.costPrice || 0) * Number(product.stock || 0)), 0)
      
      const realTotalPaid = sales.reduce((sum: number, sale: any) => sum + (sale.paidAmount || 0), 0) // Total paid amount
      const totalCheckouts = sales.length // Total number of checkouts
      
      const realTotalOrders = totalCheckouts // Total number of completed checkouts/carts
      const realActiveCustomers = new Set(sales.map((sale: any) => sale.customerId)).size // Unique customers from checkouts
      
      // Use only real data from Firebase
      const calculatedMetrics = {
        totalSale: realTotalPaid, // Show total paid amount
        totalOrders: realTotalOrders, // Total completed carts/checkouts
        activeCustomers: realActiveCustomers, // Unique customers from checkouts
        growthRate: 0, // No growth calculation until we have real data
        totalProducts,
        totalStock, // REAL stock from database (auto-reduced on checkout)
        totalProductCost // Total product cost value using current stock
      }
      
      // Check if data has changed
      const newDataHash = JSON.stringify(calculatedMetrics)
      const hasDataChanged = lastDataHash && newDataHash !== lastDataHash
      
      setMetrics(calculatedMetrics)
      console.log('Dashboard metrics loaded from Firebase:', calculatedMetrics)
      
      // Data successfully synced - set to green (up to date)
      setDataStatus('green')
      setLastDataHash(newDataHash)
      
      // If data changed, set up auto-sync for next changes
      if (hasDataChanged) {
        console.log('Data changed detected - will auto-sync next change after 3 seconds')
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // Set all metrics to 0 if Firebase fails
      setMetrics({
        totalSale: 0,
        totalOrders: 0,
        activeCustomers: 0,
        growthRate: 0,
        totalProducts: 0,
        totalStock: 0,
        totalProductCost: 0
      })
      setDataStatus('red') // Error status
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
      setIsSyncing(false)
    }
  }

  const loadCustomers = async () => {
    try {
      // For now, create a mock customers list. In a real implementation, 
      // this would fetch from Firebase customers collection
      const mockCustomers = [
        { id: '1', name: 'John Doe', phone: '9876543210' },
        { id: '2', name: 'Jane Smith', phone: '9876543211' },
        { id: '3', name: 'Bob Johnson', phone: '9876543212' },
        { id: '4', name: 'Alice Brown', phone: '9876543213' },
        { id: '5', name: 'Charlie Wilson', phone: '9876543214' },
      ]
      setCustomers(mockCustomers)
      console.log('Customers loaded:', mockCustomers)
    } catch (error) {
      console.error('Error loading customers:', error)
      setCustomers([])
    }
  }

  const loadPrintingMetrics = async () => {
    try {
      // Mock printing metrics - in real implementation, fetch from Firebase
      const mockPrintingMetrics = {
        totalPrintingSales: 45000,
        totalPrintingOrders: 125,
        activePrintingCustomers: 45,
        printingGrowthRate: 12.5,
        totalPrintingProducts: 8,
        totalPrintingStock: 2500,
        totalPrintingCost: 18000,
        pendingJobs: 8,
        completedJobs: 117
      }
      setPrintingMetrics(mockPrintingMetrics)
      console.log('Printing metrics loaded:', mockPrintingMetrics)
    } catch (error) {
      console.error('Error loading printing metrics:', error)
    }
  }

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomer(customerId)
    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      setCustomerName(customer.name)
      setCustomerPhone(customer.phone)
    } else {
      setCustomerName('')
      setCustomerPhone('')
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setIsSyncing(true)
    setDataStatus('yellow') // Set to yellow during sync
    await loadDashboardData()
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        dataStatus={dataStatus}
        handleRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
      <div className="flex flex-1">
        <SidebarNav activeSection={activeSection} />
        {/* Main Content */}
        <main className="flex-1 ml-64 bg-background">
        <div className="p-8 w-full mt-20">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className={activeSection === 'printing' ? "bg-purple-500 text-white" : "bg-blue-500 text-white"}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  {activeSection === 'printing' ? 'Printing Sales' : 'Total Sales'}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-blue-100" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    isClient ? `₹${(activeSection === 'printing' ? printingMetrics.totalPrintingSales : metrics.totalSale).toLocaleString()}` : '₹0'
                  )}
                </div>
                <p className="text-xs text-blue-100">
                  {activeSection === 'printing' ? 'Total printing revenue' : 'Total paid amount'}
                </p>
              </CardContent>
            </Card>

            <Card className={activeSection === 'printing' ? "bg-indigo-600 text-white" : "bg-indigo-500 text-white"}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  {activeSection === 'printing' ? 'Printing Orders' : 'Total Orders'}
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-indigo-100" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    isClient ? (activeSection === 'printing' ? printingMetrics.totalPrintingOrders : metrics.totalOrders).toLocaleString() : '0'
                  )}
                </div>
                <p className="text-xs text-indigo-100">
                  {activeSection === 'printing' ? 'Total printing jobs' : 'Total completed orders'}
                </p>
              </CardContent>
            </Card>

            <Card className={activeSection === 'printing' ? "bg-pink-500 text-white" : "bg-purple-500 text-white"}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  {activeSection === 'printing' ? 'Pending Jobs' : 'Growth Rate'}
                </CardTitle>
                {activeSection === 'printing' ? (
                  <Package className="h-4 w-4 text-pink-100" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-purple-100" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    isClient ? (
                      activeSection === 'printing' ? 
                        printingMetrics.pendingJobs : 
                        `${metrics.growthRate.toFixed(1)}%`
                    ) : (
                      activeSection === 'printing' ? '0' : '0%'
                    )
                  )}
                </div>
                <p className="text-xs text-purple-100">
                  {activeSection === 'printing' ? 'Jobs in progress' : 'Year-over-year'}
                </p>
              </CardContent>
            </Card>

            <Card className={activeSection === 'printing' ? "bg-green-600 text-white" : "bg-purple-500 text-white"}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  {activeSection === 'printing' ? 'Completed Jobs' : 'Total Products'}
                </CardTitle>
                <Package className="h-4 w-4 text-purple-100" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    isClient ? (activeSection === 'printing' ? printingMetrics.completedJobs : metrics.totalProducts).toLocaleString() : '0'
                  )}
                </div>
                <p className="text-xs text-purple-100">
                  {activeSection === 'printing' ? 'Finished printing jobs' : 'Products in inventory'}
                </p>
              </CardContent>
            </Card>

            <Card className={activeSection === 'printing' ? "bg-orange-600 text-white" : "bg-green-500 text-white"}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  {activeSection === 'printing' ? 'Printing Stock' : 'Total Stock'}
                </CardTitle>
                <Package className="h-4 w-4 text-green-100" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    isClient ? (activeSection === 'printing' ? printingMetrics.totalPrintingStock : metrics.totalStock).toLocaleString() : '0'
                  )}
                </div>
                <p className="text-xs text-green-100">
                  {activeSection === 'printing' ? 'Printing materials available' : 'Units available (auto-reduced on checkout)'}
                </p>
              </CardContent>
            </Card>

            <Card className={activeSection === 'printing' ? "bg-red-600 text-white" : "bg-orange-500 text-white"}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  {activeSection === 'printing' ? 'Material Cost' : 'Total Invest'}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-orange-100" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    isClient ? `₹${(activeSection === 'printing' ? printingMetrics.totalPrintingCost : metrics.totalProductCost).toLocaleString()}` : '₹0'
                  )}
                </div>
                <p className="text-xs text-orange-100">
                  {activeSection === 'printing' ? 'Total material investment' : 'Total inventory cost (updated with stock)'}
                </p>
              </CardContent>
            </Card>
          </div>

            {/* KHERWAL BAZAAR Section */}
            {activeSection === 'garments' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">KHERWAL BAZAAR</h2>
                  <p className="text-gray-600">Premium garments and fashion collection</p>
                </div>

                              </div>
            )}

            {/* Printing Section */}
            {activeSection === 'printing' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Printing Dashboard</h2>
                  <p className="text-gray-600">Manage your printing business efficiently</p>
                </div>
              </div>
            )}

            {/* Charts */}
          <Dashboard />
        </div>
      </main>
      </div>
      
      {/* Custom Order Form */}
      <CustomOrderForm 
        isOpen={customOrderOpen} 
        onClose={() => setCustomOrderOpen(false)}
        productType="custom"
        basePrice={0}
      />
    </div>
  )
}
