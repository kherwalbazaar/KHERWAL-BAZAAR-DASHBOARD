'use client'

import { useState, useEffect } from 'react'
import { SidebarNav } from '@/components/sidebar-nav'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dashboard } from '@/components/dashboard'
import { TrendingUp, ShoppingCart, Users, DollarSign, Package, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastDataHash, setLastDataHash] = useState('')
  const [dataStatus, setDataStatus] = useState<'green' | 'yellow' | 'red'>('yellow')
  const [isSyncing, setIsSyncing] = useState(true)
  const [changeDetectedTime, setChangeDetectedTime] = useState<number | null>(null)
  const [customOrderOpen, setCustomOrderOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

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

            <Card className="bg-indigo-500 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-indigo-100" />
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
                <p className="text-xs text-indigo-100">Total completed orders</p>
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

            {/* Printing Section */}
            {activeSection === 'printing' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Printing Services</h2>
                  <p className="text-gray-600">Professional printing solutions for all your needs</p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {/* Bill Book Printing */}
                  <Card className="p-4 border-2 border-blue-200 hover:shadow-lg transition-all cursor-pointer hover:border-blue-400">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Package className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">Bill Book Printing</h3>
                      <p className="text-sm text-gray-600 mb-3">Professional bill books</p>
                      <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Popular</div>
                    </div>
                  </Card>

                  {/* Money Receipt */}
                  <Card className="p-4 border-2 border-green-200 hover:shadow-lg transition-all cursor-pointer hover:border-green-400">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">Money Receipt</h3>
                      <p className="text-sm text-gray-600 mb-3">Custom receipt books</p>
                      <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Available</div>
                    </div>
                  </Card>

                  {/* Marriage Card */}
                  <Card className="p-4 border-2 border-pink-200 hover:shadow-lg transition-all cursor-pointer hover:border-pink-400">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="h-8 w-8 text-pink-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">Marriage Card</h3>
                      <p className="text-sm text-gray-600 mb-3">Beautiful invitations</p>
                      <div className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded">Premium</div>
                    </div>
                  </Card>

                  {/* Jatra Ticket */}
                  <Card className="p-4 border-2 border-purple-200 hover:shadow-lg transition-all cursor-pointer hover:border-purple-400">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <ShoppingCart className="h-8 w-8 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">Jatra Ticket</h3>
                      <p className="text-sm text-gray-600 mb-3">Event tickets</p>
                      <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Custom</div>
                    </div>
                  </Card>

                  {/* Visiting Card */}
                  <Card className="p-4 border-2 border-orange-200 hover:shadow-lg transition-all cursor-pointer hover:border-orange-400">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Package className="h-8 w-8 text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">Visiting Card</h3>
                      <p className="text-sm text-gray-600 mb-3">Professional cards</p>
                      <div className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">Quick</div>
                    </div>
                  </Card>

                  {/* Flex / Banner */}
                  <Card className="p-4 border-2 border-red-200 hover:shadow-lg transition-all cursor-pointer hover:border-red-400">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <RefreshCw className="h-8 w-8 text-red-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">Flex / Banner</h3>
                      <p className="text-sm text-gray-600 mb-3">Large format prints</p>
                      <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Large</div>
                    </div>
                  </Card>

                  {/* T-Shirt Printing */}
                  <Card className="p-4 border-2 border-indigo-200 hover:shadow-lg transition-all cursor-pointer hover:border-indigo-400">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Package className="h-8 w-8 text-indigo-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">T-Shirt Printing</h3>
                      <p className="text-sm text-gray-600 mb-3">Custom apparel</p>
                      <div className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">Custom</div>
                    </div>
                  </Card>

                  {/* Custom Design */}
                  <Card className="p-4 border-2 border-gray-200 hover:shadow-lg transition-all cursor-pointer hover:border-gray-400">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Package className="h-8 w-8 text-gray-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">Custom Design</h3>
                      <p className="text-sm text-gray-600 mb-3">Any design work</p>
                      <div className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Special</div>
                    </div>
                  </Card>
                </div>

                {/* Product Cards Section */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Popular Products</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Bill Book Product Card */}
                    <Card className="p-4 border hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800">Bill Book (A5)</h4>
                          <p className="text-sm text-gray-600">100 Pages</p>
                        </div>
                        <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">1 Color</div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 mb-3">
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span className="font-medium">A5</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Print:</span>
                          <span className="font-medium">1 Color</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Paper:</span>
                          <span className="font-medium">70 GSM</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pages:</span>
                          <span className="font-medium">100</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-2xl font-bold text-green-600">¥120</p>
                          <p className="text-xs text-gray-500">per book</p>
                        </div>
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            window.location.href = '/orders';
                            setActiveSection('printing');
                            setSelectedProduct({
                              name: 'Bill Book (A5)',
                              type: 'Bill Book',
                              basePrice: 120
                            });
                            setCustomOrderOpen(true);
                          }}
                        >
                          Customize
                        </Button>
                      </div>
                    </Card>

                    {/* Money Receipt Product Card */}
                    <Card className="p-4 border hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800">Money Receipt</h4>
                          <p className="text-sm text-gray-600">50 Pages</p>
                        </div>
                        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">2 Color</div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 mb-3">
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span className="font-medium">A4</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Print:</span>
                          <span className="font-medium">2 Color</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Paper:</span>
                          <span className="font-medium">80 GSM</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pages:</span>
                          <span className="font-medium">50</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-2xl font-bold text-green-600">¥150</p>
                          <p className="text-xs text-gray-500">per book</p>
                        </div>
                        <Button 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            window.location.href = '/orders';
                            setActiveSection('printing');
                            setSelectedProduct({
                              name: 'Money Receipt',
                              type: 'Money Receipt',
                              basePrice: 150
                            });
                            setCustomOrderOpen(true);
                          }}
                        >
                          Customize
                        </Button>
                      </div>
                    </Card>

                    {/* Visiting Card Product Card */}
                    <Card className="p-4 border hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800">Visiting Card</h4>
                          <p className="text-sm text-gray-600">Premium Quality</p>
                        </div>
                        <div className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">Full Color</div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 mb-3">
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span className="font-medium">90x54mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Print:</span>
                          <span className="font-medium">Full Color</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Paper:</span>
                          <span className="font-medium">300 GSM</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quantity:</span>
                          <span className="font-medium">100 pcs</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-2xl font-bold text-green-600">¥250</p>
                          <p className="text-xs text-gray-500">per 100 pcs</p>
                        </div>
                        <Button 
                          className="bg-orange-600 hover:bg-orange-700"
                          onClick={() => {
                            window.location.href = '/orders';
                            setActiveSection('printing');
                            setSelectedProduct({
                              name: 'Visiting Card',
                              type: 'Visiting Card',
                              basePrice: 250
                            });
                            setCustomOrderOpen(true);
                          }}
                        >
                          Customize
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Quick Actions</h4>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      View All Orders
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Download Catalog
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Share Services
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Printing Section */}

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
