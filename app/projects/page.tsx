'use client'

import { SidebarNav } from '@/components/sidebar-nav'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Plus, Search } from 'lucide-react'
import { useState } from 'react'

interface Project {
  id: string
  name: string
  client: string
  type: string
  status: 'planning' | 'in-development' | 'testing' | 'completed' | 'on-hold'
  progress: number
  budget: number
  spent: number
  dueDate: string
}

const projects: Project[] = [
  { id: '1', name: 'E-Commerce Platform', client: 'RetailHub', type: 'Web App', status: 'in-development', progress: 65, budget: 500000, spent: 325000, dueDate: '2024-04-15' },
  { id: '2', name: 'Mobile Fitness App', client: 'FitLife', type: 'Mobile', status: 'testing', progress: 85, budget: 350000, spent: 297500, dueDate: '2024-03-20' },
  { id: '3', name: 'Dashboard Redesign', client: 'TechCorp', type: 'Web Design', status: 'completed', progress: 100, budget: 150000, spent: 148000, dueDate: '2024-02-28' },
  { id: '4', name: 'API Integration', client: 'DataSync', type: 'Backend', status: 'in-development', progress: 45, budget: 200000, spent: 90000, dueDate: '2024-04-01' },
  { id: '5', name: 'CMS Migration', client: 'MediaCo', type: 'DevOps', status: 'planning', progress: 10, budget: 120000, spent: 12000, dueDate: '2024-05-10' },
]

const statusColors = {
  planning: 'secondary',
  'in-development': 'default',
  testing: 'default',
  completed: 'default',
  'on-hold': 'destructive',
}

const statusLabel = {
  planning: 'Planning',
  'in-development': 'In Development',
  testing: 'Testing',
  completed: 'Completed',
  'on-hold': 'On Hold',
}

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0)
  const avgProgress = Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex flex-1">
        <SidebarNav />
        <main className="flex-1 ml-64 bg-background">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Development Projects</h1>
            <p className="text-muted-foreground mt-2">Track and manage all development projects</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{(totalBudget / 100000).toFixed(1)}L</div>
                <p className="text-xs text-muted-foreground">Across all projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{(totalSpent / 100000).toFixed(1)}L</div>
                <p className="text-xs text-muted-foreground">{Math.round((totalSpent / totalBudget) * 100)}% of budget</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgProgress}%</div>
                <p className="text-xs text-muted-foreground">Portfolio completion</p>
              </CardContent>
            </Card>
          </div>

          {/* Projects Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Active Projects</CardTitle>
                  <CardDescription>All development projects with progress tracking</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1 md:flex-none md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search projects..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Project
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell>{project.client}</TableCell>
                        <TableCell>{project.type}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={project.progress} className="w-24" />
                            <span className="text-sm">{project.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>₹{(project.budget / 100000).toFixed(1)}L</TableCell>
                        <TableCell>
                          <Badge variant={statusColors[project.status] as any}>
                            {statusLabel[project.status]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      </div>
    </div>
  )
}
