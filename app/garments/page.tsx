'use client'

import { SidebarNav } from '@/components/sidebar-nav'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { Package, TrendingUp, DollarSign, Shirt } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  productName: string
  skuCode: string
  category: string
  costPrice: number
  stock: number
}

export default function GarmentsPage() {
  const [metrics, setMetrics] = useState({
    totalInventory: 109,
    totalSales: 701,
    totalRevenue: 480000,
    totalProducts: 5
  })
  const [isClient, setIsClient] = useState(false)

  // Load real data from Firebase on component mount
  useEffect(() => {
    setIsClient(true)
    loadGarmentsData()
  }, [])

  const loadGarmentsData = async () => {
    try {
      const { getProducts, getSales } = await import('@/lib/firebase')
      const [productsResult, salesResult] = await Promise.all([
        getProducts(),
        getSales()
      ])
      
      let totalInventory = 109
      let totalRevenue = 480000
      let actualSalesAmount = 0
      
      if (productsResult.success && productsResult.products) {
        const products = productsResult.products
        totalInventory = products.reduce((sum, product) => sum + product.stock, 0)
        totalRevenue = products.reduce((sum, product) => sum + (product.costPrice * totalInventory), 0)
      }
      
      if (salesResult.success && salesResult.sales) {
        actualSalesAmount = salesResult.sales.reduce((sum, sale) => sum + (sale.total || 0), 0)
      }
      
      setMetrics({
        totalInventory,
        totalSales: Math.floor(actualSalesAmount), // Use actual sales amount
        totalRevenue,
        totalProducts: productsResult.success && productsResult.products ? productsResult.products.length : 5
      })
      
      console.log('Garments metrics loaded from Firebase:', { totalInventory, actualSalesAmount, totalRevenue })
    } catch (error) {
      console.error('Error loading garments data:', error)
      // Keep default values if Firebase fails
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex flex-1">
        <SidebarNav />
        <main className="flex-1 ml-64 bg-background">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Garments Shop</h1>
            <p className="text-muted-foreground mt-2">Manage your clothing inventory and sales</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-blue-500 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Inventory</CardTitle>
                <Package className="h-4 w-4 text-blue-100" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {isClient ? metrics.totalInventory.toLocaleString() : '109'}
                </div>
                <p className="text-xs text-blue-100">Units in stock</p>
              </CardContent>
            </Card>

            <Card className="bg-blue-500 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Sale</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-100" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  ₹{isClient ? metrics.totalSales.toLocaleString() : '0'}
                </div>
                <p className="text-xs text-blue-100">+12.5% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-purple-500 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-100" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {isClient ? `₹${(metrics.totalRevenue / 100000).toFixed(1)}L` : '₹4.8L'}
                </div>
                <p className="text-xs text-purple-100">Total revenue</p>
              </CardContent>
            </Card>

            <Card className="bg-orange-500 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Products</CardTitle>
                <Shirt className="h-4 w-4 text-orange-100" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {isClient ? metrics.totalProducts.toLocaleString() : '5'}
                </div>
                <p className="text-xs text-orange-100">Product types</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link href="/garments/products/add-product">
              <Button className="w-full h-20 gap-2 bg-blue-600 hover:bg-blue-700">
                <Package className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Add Product</div>
                  <div className="text-xs opacity-90">Create new product</div>
                </div>
              </Button>
            </Link>

            <Link href="/garments/products/all-products">
              <Button className="w-full h-20 gap-2 bg-green-600 hover:bg-green-700">
                <Shirt className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">All Products</div>
                  <div className="text-xs opacity-90">View inventory</div>
                </div>
              </Button>
            </Link>

            <Link href="/garments/products/categories">
              <Button className="w-full h-20 gap-2 bg-purple-600 hover:bg-purple-700">
                <Package className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Categories</div>
                  <div className="text-xs opacity-90">Manage categories</div>
                </div>
              </Button>
            </Link>

            <Link href="/garments/products/low-stock">
              <Button className="w-full h-20 gap-2 bg-orange-600 hover:bg-orange-700">
                <TrendingUp className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Low Stock Alert</div>
                  <div className="text-xs opacity-90">View alerts</div>
                </div>
              </Button>
            </Link>
          </div>

          {/* Recent Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Garments Shop Overview</CardTitle>
              <CardDescription>Quick summary of your clothing business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {isClient ? metrics.totalInventory.toLocaleString() : '109'}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Units Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {isClient ? metrics.totalSales.toLocaleString() : '701'}
                  </div>
                  <div className="text-sm text-muted-foreground">Units Sold This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {isClient ? `₹${(metrics.totalRevenue / 100000).toFixed(1)}L` : '₹4.8L'}
                  </div>
                  <div className="text-sm text-muted-foreground">Monthly Revenue</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      </div>
    </div>
  )
}
