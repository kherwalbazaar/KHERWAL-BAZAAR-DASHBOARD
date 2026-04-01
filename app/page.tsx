'use client'

import { useState, useEffect } from 'react'
import { SidebarNav } from '@/components/sidebar-nav'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dashboard } from '@/components/dashboard'
import { TrendingUp, ShoppingCart, Users, DollarSign, Package, Loader2 } from 'lucide-react'

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

  // Load real data from Firebase on component mount
  useEffect(() => {
    setIsClient(true)
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const { getProducts, getOrders, getSales } = await import('@/lib/firebase')
      
      // Get products from Firebase
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
      const totalStock = products.reduce((sum: number, product: any) => sum + (Number(product.stock || 0)), 0)
      const totalProductCost = products.reduce((sum: number, product: any) => sum + (Number(product.costPrice || 0) * Number(product.stock || 0)), 0)
      const realTotalSale = sales.reduce((sum: number, sale: any) => sum + (sale.total || 0), 0) // Actual sales from Firebase
      const realTotalPaid = sales.reduce((sum: number, sale: any) => sum + (sale.paidAmount || 0), 0) // Total paid amount
      const totalCheckouts = sales.length // Total number of checkouts
      
      // Calculate sold items from all checkouts
      const soldItems = sales.reduce((sum: number, sale: any) => {
        if (sale.items && Array.isArray(sale.items)) {
          return sum + sale.items.reduce((itemSum: number, item: any) => itemSum + (item.quantity || 0), 0)
        }
        return sum
      }, 0)
      
      const remainingStock = totalStock - soldItems // Stock that decreases with checkouts
      
      const realTotalOrders = orders.length
      const realActiveCustomers = new Set(orders.map((order: any) => order.customerId)).size
      
      // Use only real data from Firebase
      const calculatedMetrics = {
        totalSale: realTotalPaid, // Show total paid amount
        totalOrders: realTotalOrders, // Real orders from Firebase
        activeCustomers: realActiveCustomers, // Real customers from orders
        growthRate: 0, // No growth calculation until we have real data
        totalProducts,
        totalStock,
        totalProductCost // Total product cost value
      }
      
      setMetrics(calculatedMetrics)
      console.log('Dashboard metrics loaded from Firebase:', calculatedMetrics)
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
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />
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
                <p className="text-xs text-green-100">Units available</p>
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
                <p className="text-xs text-orange-100">Total product cost price</p>
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
