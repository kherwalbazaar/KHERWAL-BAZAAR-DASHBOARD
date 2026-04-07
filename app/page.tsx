'use client'

import { useState, useEffect } from 'react'
import { SidebarNav } from '@/components/sidebar-nav'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dashboard } from '@/components/dashboard'
import { TrendingUp, ShoppingCart, Users, DollarSign, Package, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastDataHash, setLastDataHash] = useState('')
  const [dataStatus, setDataStatus] = useState<'green' | 'yellow' | 'red'>('yellow')
  const [isSyncing, setIsSyncing] = useState(true)
  const [changeDetectedTime, setChangeDetectedTime] = useState<number | null>(null)

  // Load real data from Firebase on component mount
  useEffect(() => {
    setIsClient(true)
    setDataStatus('yellow') // Set to yellow during initial load
    setIsSyncing(true)
    loadDashboardData()
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
            <Card className="bg-blue-500 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total sales</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-100" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    isClient ? `₹${metrics.totalSale.toLocaleString()}` : '₹0'
                  )}
                </div>
                <p className="text-xs text-blue-100">Total paid amount</p>
              </CardContent>
            </Card>

            <Card className="bg-green-500 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-green-100" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    isClient ? metrics.totalOrders.toLocaleString() : '0'
                  )}
                </div>
                <p className="text-xs text-green-100">+8.2% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-purple-500 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Growth Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-100" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    isClient ? `${metrics.growthRate.toFixed(1)}%` : '0%'
                  )}
                </div>
                <p className="text-xs text-purple-100">Year-over-year</p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Product Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-purple-500 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Products</CardTitle>
                <Package className="h-4 w-4 text-purple-100" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    isClient ? metrics.totalProducts.toLocaleString() : '0'
                  )}
                </div>
                <p className="text-xs text-purple-100">Products in inventory</p>
              </CardContent>
            </Card>

            <Card className="bg-green-500 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Stock</CardTitle>
                <Package className="h-4 w-4 text-green-100" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    isClient ? metrics.totalStock.toLocaleString() : '0'
                  )}
                </div>
                <p className="text-xs text-green-100">Units available (auto-reduced on checkout)</p>
              </CardContent>
            </Card>

            <Card className="bg-orange-500 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Invest</CardTitle>
                <DollarSign className="h-4 w-4 text-orange-100" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    isClient ? `₹${metrics.totalProductCost.toLocaleString()}` : '₹0'
                  )}
                </div>
                <p className="text-xs text-orange-100">Total inventory cost (updated with stock)</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Dashboard />
        </div>
      </main>
      </div>
    </div>
  )
}
