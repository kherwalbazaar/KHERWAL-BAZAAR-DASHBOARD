'use client'

import { SidebarNav } from '@/components/sidebar-nav'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FileText, Download, BarChart3, TrendingUp, PieChart } from 'lucide-react'
import { useState } from 'react'

interface Report {
  id: string
  name: string
  type: string
  period: string
  generatedDate: string
  data: {
    label: string
    value: string
  }[]
}

const [salesData, setSalesData] = useState<any[]>([])
const [stockData, setStockData] = useState<any[]>([])
const [loading, setLoading] = useState(true)

const reports: Report[] = []

export default function ReportsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const typeIcons = {
    Sales: <TrendingUp className="h-4 w-4" />,
    Finance: <BarChart3 className="h-4 w-4" />,
    Analytics: <PieChart className="h-4 w-4" />,
    Operations: <FileText className="h-4 w-4" />,
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
            <h1 className="text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground mt-2">Generate and download business reports</p>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((report) => (
              <Card key={report.id} className="cursor-pointer hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {typeIcons[report.type as keyof typeof typeIcons]}
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                      </div>
                      <CardDescription>{report.period}</CardDescription>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Report Summary */}
                  <div className="space-y-3">
                    {report.data.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-secondary/20 rounded">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <span className="font-semibold text-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">Generated on {report.generatedDate}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Export Options */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>Generate custom reports for specific periods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-medium mb-2">Sales Report</h3>
                  <p className="text-sm text-muted-foreground mb-4">Sales data, inventory, and product performance</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Generate
                  </Button>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-medium mb-2">Financial Report</h3>
                  <p className="text-sm text-muted-foreground mb-4">Revenue, expenses, and profit analysis</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Generate
                  </Button>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-medium mb-2">Customer Report</h3>
                  <p className="text-sm text-muted-foreground mb-4">Customer metrics and purchasing patterns</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Generate
                  </Button>
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
