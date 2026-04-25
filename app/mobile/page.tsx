'use client'

import { useState, useEffect } from 'react'
import { 
  Menu, 
  Search, 
  Plus, 
  ShoppingCart, 
  Printer, 
  DollarSign, 
  Camera, 
  Home, 
  Package, 
  Users, 
  Settings,
  Clock,
  CheckCircle,
  UserPlus,
  List
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function MobileDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('home')
  const [todaySales, setTodaySales] = useState(0)
  const [totalStock, setTotalStock] = useState(0)
  const [totalInvest, setTotalInvest] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [pendingOrders, setPendingOrders] = useState(0)
  const [completedOrders, setCompletedOrders] = useState(0)

  // Load real data from Firebase
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const { getSales, getProducts } = await import('@/lib/firebase')
      
      // Fetch sales data
      const salesResult = await getSales()
      const productsResult = await getProducts()
      
      const sales = salesResult.success && salesResult.sales ? salesResult.sales : []
      const products = productsResult.success && productsResult.products ? productsResult.products : []
      
      const today = new Date().toDateString()
      
      // Calculate today's sales
      const todaySalesData = sales.filter((sale: any) => 
        new Date(sale.createdAt).toDateString() === today
      )
      
      const todaySalesAmount = todaySalesData.reduce((sum: number, sale: any) => 
        sum + (sale.paidAmount || 0), 0
      )
      
      // Calculate total stock
      const totalStockAmount = products.reduce((sum: number, product: any) => 
        sum + (product.stock || 0), 0
      )
      
      // Calculate total invest (cost price * stock)
      const totalInvestAmount = products.reduce((sum: number, product: any) => 
        sum + ((product.costPrice || 0) * (product.stock || 0)), 0
      )
      
      // Calculate total orders
      const totalOrdersCount = sales.length
      
      // Calculate order status
      const pending = todaySalesData.filter((sale: any) => 
        sale.status === 'pending' || sale.status === 'in-progress'
      ).length
      
      const completed = todaySalesData.filter((sale: any) => 
        sale.status === 'completed'
      ).length
      
      setTodaySales(todaySalesAmount)
      setTotalStock(totalStockAmount)
      setTotalInvest(totalInvestAmount)
      setTotalOrders(totalOrdersCount)
      setPendingOrders(pending)
      setCompletedOrders(completed)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const quickActions = [
    { icon: Plus, label: 'Add Order', color: 'bg-green-500', route: '/orders/custom-order' },
    { icon: ShoppingCart, label: 'New Sale', color: 'bg-blue-500', route: '/garments/orders' },
    { icon: Printer, label: 'Printing Order', color: 'bg-purple-500', route: '/printing/orders' },
    { icon: DollarSign, label: 'Receive Payment', color: 'bg-yellow-500', route: '/garments/orders' },
    { icon: Camera, label: 'Scan QR', color: 'bg-pink-500', route: null, action: () => alert('QR Scanner coming soon!') },
  ]

  return (
    <div className="min-h-screen bg-gray-100 max-w-[480px] mx-auto relative pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">KHERWAL BAZAAR</h1>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-green-700 rounded-full transition">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-green-700 rounded-full transition">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                if (action.action) {
                  action.action()
                } else if (action.route) {
                  router.push(action.route)
                }
              }}
              className={`${action.color} text-white p-4 rounded-2xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 flex flex-col items-center justify-center gap-2 min-h-[100px]`}
            >
              <action.icon className="w-8 h-8" />
              <span className="text-sm font-semibold text-center">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-800">Today's Summary</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-2xl shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-500">Today's Sale</span>
              </div>
              <p className="text-lg font-bold text-gray-800">₹{todaySales.toLocaleString()}</p>
            </div>
            <div className="bg-white p-3 rounded-2xl shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-500">Total Stock</span>
              </div>
              <p className="text-lg font-bold text-gray-800">{totalStock}</p>
            </div>
            <div className="bg-white p-3 rounded-2xl shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-500">Total Invest</span>
              </div>
              <p className="text-lg font-bold text-gray-800">₹{totalInvest.toLocaleString()}</p>
            </div>
            <div className="bg-white p-3 rounded-2xl shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-gray-500">Total Orders</span>
              </div>
              <p className="text-lg font-bold text-gray-800">{totalOrders}</p>
            </div>
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white p-4 rounded-2xl shadow-md">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Order Status</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                <Clock className="w-4 h-4 inline mr-1" />
                Pending: {pendingOrders}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Completed: {completedOrders}
              </div>
            </div>
          </div>
        </div>

        {/* Customers Section */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-800">Customers</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/orders/custom-order')}
              className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center gap-3"
            >
              <div className="bg-green-100 p-2 rounded-xl">
                <UserPlus className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-semibold text-gray-800">Add Customer</span>
            </button>
            <button
              onClick={() => router.push('/customers')}
              className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center gap-3"
            >
              <div className="bg-blue-100 p-2 rounded-xl">
                <List className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-semibold text-gray-800">View Customers</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg max-w-[480px] mx-auto">
        <div className="flex items-center justify-around p-3">
          <button
            onClick={() => router.push('/mobile')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${
              activeTab === 'home' ? 'bg-green-100 text-green-600' : 'text-gray-500'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={() => router.push('/garments/orders')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${
              activeTab === 'orders' ? 'bg-green-100 text-green-600' : 'text-gray-500'
            }`}
          >
            <Package className="w-6 h-6" />
            <span className="text-xs font-medium">Orders</span>
          </button>
          <button
            onClick={() => router.push('/orders/custom-order')}
            className="flex flex-col items-center gap-1 p-2 rounded-xl transition"
          >
            <div className="bg-green-600 p-3 rounded-full shadow-lg -mt-6">
              <Plus className="w-6 h-6 text-white" />
            </div>
          </button>
          <button
            onClick={() => router.push('/customers')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${
              activeTab === 'customers' ? 'bg-green-100 text-green-600' : 'text-gray-500'
            }`}
          >
            <Users className="w-6 h-6" />
            <span className="text-xs font-medium">Customers</span>
          </button>
          <button
            onClick={() => alert('Profile settings coming soon!')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${
              activeTab === 'profile' ? 'bg-green-100 text-green-600' : 'text-gray-500'
            }`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}
