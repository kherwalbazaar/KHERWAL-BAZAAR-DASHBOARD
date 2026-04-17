'use client'

import { useState, useEffect, useRef } from 'react'
import { SidebarNav } from '@/components/sidebar-nav'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dashboard } from '@/components/dashboard'
import { TrendingUp, ShoppingCart, Users, DollarSign, Package, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  const [services, setServices] = useState<any[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(true)
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
  
  // Age Calculator state
  const [ageCalculatorOpen, setAgeCalculatorOpen] = useState(false)
  const [birthYear, setBirthYear] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthDay, setBirthDay] = useState('')
  const [calculatedAge, setCalculatedAge] = useState<{
    years: number
    months: number
    days: number
    nextBirthday: string
  } | null>(null)
  
  const yearInputRef = useRef<HTMLInputElement>(null)
  const dayInputRef = useRef<HTMLInputElement>(null)
  const [monthInputFocused, setMonthInputFocused] = useState(false)
  
  // Customer state for printing orders
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [customerName, setCustomerName] = useState<string>('')
  const [customerPhone, setCustomerPhone] = useState<string>('')

  // Auto-detect thumbnail based on service title
  const getAutoThumbnail = (title: string): string => {
    const titleLower = title.toLowerCase()
    
    const serviceLogos: { [key: string]: string } = {
      'aadhaar': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Aadhaar_Logo.svg/2560px-Aadhaar_Logo.svg.png',
      'voter': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/93/Election_Commission_of_India_logo.svg/2560px-Election_Commission_of_India_logo.svg.png',
      'pan': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/95/Income_Tax_Department_India.svg/2560px-Income_Tax_Department_India.svg.png',
      'lpg': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/45/Indian_Oil_Corporation_logo.svg/2560px-Indian_Oil_Corporation_logo.svg.png',
      'gas': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/45/Indian_Oil_Corporation_logo.svg/2560px-Indian_Oil_Corporation_logo.svg.png',
      'train': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/43/Indian_Railways_logo.svg/2560px-Indian_Railways_logo.svg.png',
      'irctc': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/43/Indian_Railways_logo.svg/2560px-Indian_Railways_logo.svg.png',
      'banking': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/55/State_Bank_of_India_logo.svg/2560px-State_Bank_of_India_logo.svg.png',
      'sbi': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/55/State_Bank_of_India_logo.svg/2560px-State_Bank_of_India_logo.svg.png',
      'ration': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/95/Department_of_Food_and_Public_Distribution_India.svg/2560px-Department_of_Food_and_Public_Distribution_India.svg.png',
      'passport': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/68/Ministry_of_External_Affairs_India.svg/2560px-Ministry_of_External_Affairs_India.svg.png',
      'postal': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e4/India_Post_Logo.svg/2560px-India_Post_Logo.svg.png',
      'post': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e4/India_Post_Logo.svg/2560px-India_Post_Logo.svg.png',
      'driving': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/49/Ministry_of_Road_Transport_and_Highways_India.svg/2560px-Ministry_of_Road_Transport_and_Highways_India.svg.png',
      'license': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/49/Ministry_of_Road_Transport_and_Highways_India.svg/2560px-Ministry_of_Road_Transport_and_Highways_India.svg.png',
      'agriculture': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/86/Ministry_of_Agriculture_and_Farmers_Welfare_India.svg/2560px-Ministry_of_Agriculture_and_Farmers_Welfare_India.svg.png',
      'pf': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/68/EPFO_India_logo.svg/2560px-EPFO_India_logo.svg.png',
      'epf': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/68/EPFO_India_logo.svg/2560px-EPFO_India_logo.svg.png',
      'bus': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c7/RedBus_logo.svg/2560px-RedBus_logo.svg.png',
      'redbus': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c7/RedBus_logo.svg/2560px-RedBus_logo.svg.png',
      'job': 'https://upload.wikimedia.org/wikipedia/en/thumb/2/29/National_Career_Service_India.svg/2560px-National_Career_Service_India.svg.png',
      'ncs': 'https://upload.wikimedia.org/wikipedia/en/thumb/2/29/National_Career_Service_India.svg/2560px-National_Career_Service_India.svg.png',
      'digilocker': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e7/DigiLocker_Logo.svg/2560px-DigiLocker_Logo.svg.png',
      'digital': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e7/DigiLocker_Logo.svg/2560px-DigiLocker_Logo.svg.png',
      'locker': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e7/DigiLocker_Logo.svg/2560px-DigiLocker_Logo.svg.png',
      'electricity': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/68/Ministry_of_Power_India.svg/2560px-Ministry_of_Power_India.svg.png',
      'water': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/86/Ministry_of_Jal_Shakti_India.svg/2560px-Ministry_of_Jal_Shakti_India.svg.png',
      'education': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/68/Ministry_of_Education_India.svg/2560px-Ministry_of_Education_India.svg.png',
      'health': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/68/Ministry_of_Health_and_Family_Welfare_India.svg/2560px-Ministry_of_Health_and_Family_Welfare_India.svg.png',
      'helpline': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/86/Government_of_India_logo.svg/2560px-Government_of_India_logo.svg.png',
      'government': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/86/Government_of_India_logo.svg/2560px-Government_of_India_logo.svg.png',
      'govt': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/86/Government_of_India_logo.svg/2560px-Government_of_India_logo.svg.png',
      'yojana': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/86/Government_of_India_logo.svg/2560px-Government_of_India_logo.svg.png',
      'scheme': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/86/Government_of_India_logo.svg/2560px-Government_of_India_logo.svg.png'
    }
    
    // Check for exact matches first
    for (const [key, url] of Object.entries(serviceLogos)) {
      if (titleLower.includes(key)) {
        return url
      }
    }
    
    // Generate a placeholder with the first letter of the service name
    return `https://via.placeholder.com/48x48/4F46E5/FFFFFF?text=${encodeURIComponent(title.toUpperCase().substring(0, 1))}`
  }

  // Load services from Firebase
  const loadServices = async () => {
    try {
      const { getServices } = await import('@/lib/firebase')
      const result = await getServices()
      
      if (result.success && result.services) {
        // Temporarily show all services to debug
        setServices(result.services)
        console.log('All services from DB:', result.services)
        console.log('Total services count:', result.services.length)
      } else {
        console.error('Failed to load services:', result.error)
        setServices([])
      }
    } catch (error) {
      console.error('Error loading services:', error)
      setServices([])
    } finally {
      setIsLoadingServices(false)
    }
  }

  // Load real data from Firebase on component mount
  useEffect(() => {
    setIsClient(true)
    setDataStatus('yellow') // Set to yellow during initial load
    setIsSyncing(true)
    loadDashboardData()
    loadCustomers()
    loadPrintingMetrics()
    loadServices()
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
          setDataStatus('yellow')
          await loadDashboardData()
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

  const calculateAge = () => {
    if (!birthYear || !birthMonth || !birthDay) return
    
    const birth = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay))
    const today = new Date()
    
    let years = today.getFullYear() - birth.getFullYear()
    let months = today.getMonth() - birth.getMonth()
    let days = today.getDate() - birth.getDate()
    
    if (days < 0) {
      months--
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      days += lastMonth.getDate()
    }
    
    if (months < 0) {
      years--
      months += 12
    }
    
    // Calculate next birthday
    const nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1)
    }
    const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    setCalculatedAge({
      years,
      months,
      days,
      nextBirthday: daysUntilBirthday === 0 ? 'Today! 🎉' : `${daysUntilBirthday} days`
    })
  }

  const resetAgeCalculator = () => {
    setBirthYear('')
    setBirthMonth('')
    setBirthDay('')
    setCalculatedAge(null)
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
          {activeSection !== 'online' && (
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
          )}

          {/* KHERWAL BAZAAR Section */}
          {activeSection === 'garments' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">KHERWAL BAZAAR</h2>
                  <p className="text-gray-600">Premium garments and fashion collection</p>
                </div>
                
                {/* Garments Categories */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Package className="h-8 w-8 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg">Men's Wear</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm text-gray-600">Shirts, Pants, T-shirts</p>
                      <Badge variant="secondary" className="mt-2">125 Items</Badge>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Package className="h-8 w-8 text-pink-600" />
                      </div>
                      <CardTitle className="text-lg">Women's Wear</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm text-gray-600">Dresses, Tops, Bottoms</p>
                      <Badge variant="secondary" className="mt-2">89 Items</Badge>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Package className="h-8 w-8 text-green-600" />
                      </div>
                      <CardTitle className="text-lg">Kids Wear</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm text-gray-600">Boys & Girls Collection</p>
                      <Badge variant="secondary" className="mt-2">67 Items</Badge>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Package className="h-8 w-8 text-purple-600" />
                      </div>
                      <CardTitle className="text-lg">Accessories</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm text-gray-600">Bags, Belts, Watches</p>
                      <Badge variant="secondary" className="mt-2">43 Items</Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Printing Section */}
            {activeSection === 'printing' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Printing Services</h2>
                  <p className="text-gray-600">Professional printing solutions for all needs</p>
                </div>
                
                {/* Printing Categories */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Package className="h-8 w-8 text-green-600" />
                      </div>
                      <CardTitle className="text-lg">Business Cards</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm text-gray-600">Premium quality cards</p>
                      <Badge className="mt-2 bg-green-100 text-green-800">15 Types</Badge>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Package className="h-8 w-8 text-green-600" />
                      </div>
                      <CardTitle className="text-lg">Stationery</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm text-gray-600">Letterheads, Envelopes</p>
                      <Badge className="mt-2 bg-green-100 text-green-800">8 Types</Badge>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Package className="h-8 w-8 text-green-600" />
                      </div>
                      <CardTitle className="text-lg">Marketing</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm text-gray-600">Flyers, Brochures</p>
                      <Badge className="mt-2 bg-green-100 text-green-800">12 Types</Badge>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Package className="h-8 w-8 text-green-600" />
                      </div>
                      <CardTitle className="text-lg">Large Format</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm text-gray-600">Posters, Banners</p>
                      <Badge className="mt-2 bg-green-100 text-green-800">6 Types</Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Online Section */}
            {activeSection === 'online' && (
              <div className="min-h-screen bg-gray-100 -m-8 -mt-20 p-8">
                {/* Mini Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-0 shadow-lg mb-4 mt-6 -mx-8">
                  <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-center">
                      KHERWAL ONLINE SERVICES
                    </h1>
                  </div>
                </div>
                
                <div className="p-4">

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {/* Static Age Calculator Card */}
                  <div 
                    onClick={() => setAgeCalculatorOpen(true)}
                    className="bg-white p-4 rounded-xl shadow text-center cursor-pointer hover:shadow-lg transition flex flex-col items-center"
                  >
                    <div className="w-12 h-12 mb-3 flex items-center justify-center">
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                        alt="Age Calculator"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 leading-tight">
                      Age Calculator
                    </h3>
                  </div>

                  {isLoadingServices ? (
                    // Loading state
                    Array.from({ length: 24 }).map((_, index) => (
                      <div 
                        key={`loading-${index}`}
                        className="bg-white p-4 rounded-xl shadow text-center cursor-pointer hover:shadow-lg transition flex flex-col items-center animate-pulse"
                      >
                        <div className="w-12 h-12 mb-3 bg-gray-300 rounded-lg"></div>
                        <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                      </div>
                    ))
                  ) : services.length > 0 ? (
                    // Dynamic services from Firebase
                    services.map((service) => (
                      <div 
                        key={service.id}
                        onClick={() => window.open(service.link, '_blank')}
                        className="bg-white p-4 rounded-xl shadow text-center cursor-pointer hover:shadow-lg transition flex flex-col items-center"
                      >
                        <div className="w-12 h-12 mb-3 flex items-center justify-center">
                          <img
                            src={service.thumbnail && service.thumbnail.trim() ? service.thumbnail : getAutoThumbnail(service.title)}
                            alt={service.title}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = getAutoThumbnail(service.title)
                            }}
                          />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 leading-tight">
                          {service.title}
                        </h3>
                      </div>
                    ))
                  ) : (
                    // No services state
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-500 text-lg">No services available</p>
                      <p className="text-gray-400 text-sm mt-2">Add services from the User Panel to see them here</p>
                    </div>
                  )}
                </div>
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

      {/* Age Calculator Dialog */}
      <Dialog open={ageCalculatorOpen} onOpenChange={setAgeCalculatorOpen}>
        <DialogContent 
          className="sm:max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Age Calculator</DialogTitle>
            <DialogDescription>
              Enter your birth date to calculate your exact age
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Horizontal Date Input YYYY-MM-DD */}
            <div className="space-y-2">
              <label className="text-xl font-bold text-center block">Date of Birth (YYYYMMDD)</label>
              <div className="flex justify-center items-center gap-0">
                <Input
                  ref={yearInputRef}
                  type="text"
                  inputMode="numeric"
                  placeholder="YYYY"
                  value={birthYear}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                    setBirthYear(value)
                    if (value.length === 4) {
                      // Auto-focus to month input after entering year
                      document.getElementById('month-input')?.focus()
                    }
                  }}
                  className="w-24 text-center text-5xl font-bold rounded-l-lg rounded-r-none"
                  maxLength={4}
                  id="year-input"
                />
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="MM"
                  value={birthMonth}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 2)
                    setBirthMonth(value)
                    if (value.length === 2) {
                      // Auto-focus to day input after entering month
                      dayInputRef.current?.focus()
                    }
                  }}
                  onFocus={() => setMonthInputFocused(true)}
                  onBlur={() => setTimeout(() => setMonthInputFocused(false), 200)}
                  className="w-16 text-center text-5xl font-bold rounded-none"
                  maxLength={2}
                  id="month-input"
                />
                <Input
                  ref={dayInputRef}
                  type="text"
                  inputMode="numeric"
                  placeholder="DD"
                  value={birthDay}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 2)
                    setBirthDay(value)
                  }}
                  className="w-16 text-center text-5xl font-bold rounded-r-lg rounded-l-none"
                  maxLength={2}
                  id="day-input"
                />
              </div>
            </div>
            
            {/* Month Grid - Shows when month input is focused */}
            {monthInputFocused && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Month</label>
                <div className="grid grid-cols-4 gap-0">
                  {[
                    { code: '01', name: 'January' },
                    { code: '02', name: 'February' },
                    { code: '03', name: 'March' },
                    { code: '04', name: 'April' },
                    { code: '05', name: 'May' },
                    { code: '06', name: 'June' },
                    { code: '07', name: 'July' },
                    { code: '08', name: 'August' },
                    { code: '09', name: 'September' },
                    { code: '10', name: 'October' },
                    { code: '11', name: 'November' },
                    { code: '12', name: 'December' },
                  ].map((month) => (
                    <button
                      key={month.code}
                      onClick={() => {
                        setBirthMonth(month.code)
                        setMonthInputFocused(false)
                        dayInputRef.current?.focus()
                      }}
                      className={`p-2 text-xs rounded-lg border transition-colors ${
                        birthMonth === month.code
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white hover:bg-blue-50 border-gray-200'
                      }`}
                    >
                      <div className="font-semibold text-sm">{month.code}</div>
                      <div className="text-xs">{month.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {calculatedAge && (
              <div className="space-y-4">
                {/* Age Result */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">{calculatedAge.years}</div>
                      <div className="text-xs text-gray-600">Years</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-2xl font-bold text-purple-600">{calculatedAge.months}</div>
                      <div className="text-xs text-gray-600">Months</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-2xl font-bold text-pink-600">{calculatedAge.days}</div>
                      <div className="text-xs text-gray-600">Days</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                    <div className="text-sm text-gray-600">Next Birthday</div>
                    <div className="text-lg font-semibold text-green-600">{calculatedAge.nextBirthday}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={resetAgeCalculator}
              disabled={!birthYear && !birthMonth && !birthDay && !calculatedAge}
            >
              Reset
            </Button>
            <Button
              onClick={calculateAge}
              disabled={!birthYear || !birthMonth || !birthDay}
            >
              Calculate Age
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
