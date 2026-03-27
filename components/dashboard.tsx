'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const revenueData = [
  { month: 'Jan', revenue: 45000, target: 50000 },
  { month: 'Feb', revenue: 52000, target: 50000 },
  { month: 'Mar', revenue: 48000, target: 50000 },
  { month: 'Apr', revenue: 61000, target: 55000 },
  { month: 'May', revenue: 55000, target: 55000 },
  { month: 'Jun', revenue: 67000, target: 60000 },
]

const ordersData = [
  { week: 'Week 1', garments: 120, printing: 45, projects: 28 },
  { week: 'Week 2', garments: 145, printing: 52, projects: 35 },
  { week: 'Week 3', garments: 138, printing: 48, projects: 32 },
  { week: 'Week 4', garments: 165, printing: 61, projects: 42 },
]

const growthData = [
  { month: 'Jan', growth: 8500 },
  { month: 'Feb', growth: 9200 },
  { month: 'Mar', growth: 8800 },
  { month: 'Apr', growth: 10500 },
  { month: 'May', growth: 11200 },
  { month: 'Jun', growth: 12500 },
]

export function Dashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Monthly revenue vs target</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="var(--chart-1)" strokeWidth={2} />
              <Line type="monotone" dataKey="target" stroke="var(--chart-2)" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Orders by Department */}
      <Card>
        <CardHeader>
          <CardTitle>Orders by Department</CardTitle>
          <CardDescription>Weekly orders across all departments</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ordersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                }}
              />
              <Legend />
              <Bar dataKey="garments" fill="var(--chart-1)" />
              <Bar dataKey="printing" fill="var(--chart-2)" />
              <Bar dataKey="projects" fill="var(--chart-3)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Customer Growth */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Customer Growth</CardTitle>
          <CardDescription>New customers acquired monthly</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                }}
              />
              <Area
                type="monotone"
                dataKey="growth"
                stroke="var(--chart-1)"
                fillOpacity={1}
                fill="url(#colorGrowth)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
