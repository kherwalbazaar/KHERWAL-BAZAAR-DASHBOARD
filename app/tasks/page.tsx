'use client'

import { SidebarNav } from '@/components/sidebar-nav'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Calendar, AlertCircle } from 'lucide-react'
import { useState } from 'react'

interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'todo' | 'in-progress' | 'completed'
  assignee: string
  category: string
  completed: boolean
}

const tasks: Task[] = [
  { id: '1', title: 'Prepare Q1 Financial Report', description: 'Compile all financial data for Q1', dueDate: '2024-03-31', priority: 'high', status: 'in-progress', assignee: 'Finance Team', category: 'Finance', completed: false },
  { id: '2', title: 'Update Product Catalog', description: 'Add new summer collection items', dueDate: '2024-03-25', priority: 'medium', status: 'in-progress', assignee: 'Marketing', category: 'Marketing', completed: false },
  { id: '3', title: 'Customer Feedback Analysis', description: 'Review and analyze customer feedback', dueDate: '2024-03-20', priority: 'medium', status: 'todo', assignee: 'Customer Service', category: 'Operations', completed: false },
  { id: '4', title: 'Follow up with VIP Clients', description: 'Call and email VIP customers', dueDate: '2024-03-15', priority: 'high', status: 'todo', assignee: 'Sales', category: 'Sales', completed: false },
  { id: '5', title: 'Inventory Audit', description: 'Physical count and verification', dueDate: '2024-03-22', priority: 'critical', status: 'todo', assignee: 'Warehouse', category: 'Operations', completed: false },
  { id: '6', title: 'Review Supplier Contracts', description: 'Negotiate better terms with suppliers', dueDate: '2024-04-05', priority: 'low', status: 'todo', assignee: 'Procurement', category: 'Finance', completed: true },
]

const priorityColors = {
  low: 'secondary',
  medium: 'default',
  high: 'default',
  critical: 'destructive',
}

const priorityLabel = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

const statusColors = {
  todo: 'secondary',
  'in-progress': 'default',
  completed: 'default',
}

const statusLabel = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  completed: 'Completed',
}

export default function TasksPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assignee.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    todo: tasks.filter((t) => t.status === 'todo').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  }

  const criticalTasks = tasks.filter((t) => t.priority === 'critical' && !t.completed)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex flex-1">
        <SidebarNav />
        <main className="flex-1 ml-64 bg-background">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Tasks & Calendar</h1>
            <p className="text-muted-foreground mt-2">Manage tasks and track project deadlines</p>
          </div>

          {/* Critical Alert */}
          {criticalTasks.length > 0 && (
            <Card className="mb-8 border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-destructive">Critical Tasks Pending</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      You have {criticalTasks.length} critical task{criticalTasks.length !== 1 ? 's' : ''} that need immediate attention.
                    </p>
          </div>
        </div>
      </main>
      </div>
    </div>
  )
}
