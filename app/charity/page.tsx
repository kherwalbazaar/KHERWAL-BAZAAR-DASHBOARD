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
import { Plus, Search, Calendar } from 'lucide-react'
import { useState } from 'react'

interface Activity {
  id: string
  title: string
  type: 'donation' | 'volunteer' | 'event' | 'awareness'
  description: string
  date: string
  impact: string
  status: 'planned' | 'ongoing' | 'completed'
}

const activities: Activity[] = [
  { id: '1', title: 'Education Scholarship', type: 'donation', description: 'Scholarships for underprivileged students', date: '2024-03-10', impact: '50 students', status: 'completed' },
  { id: '2', title: 'Health Camp', type: 'event', description: 'Free medical checkup camp', date: '2024-03-15', impact: '200 people', status: 'planned' },
  { id: '3', title: 'Donation Drive', type: 'donation', description: 'Clothes and food donation campaign', date: '2024-02-28', impact: '₹2,50,000', status: 'completed' },
  { id: '4', title: 'Volunteer Work', type: 'volunteer', description: 'Community cleanup drive', date: '2024-03-08', impact: '100 volunteers', status: 'completed' },
  { id: '5', title: 'Awareness Campaign', type: 'awareness', description: 'Environmental awareness workshop', date: '2024-03-20', impact: '300 people', status: 'planned' },
]

const typeColors = {
  donation: 'default',
  volunteer: 'default',
  event: 'default',
  awareness: 'secondary',
}

const statusColors = {
  planned: 'secondary',
  ongoing: 'default',
  completed: 'default',
}

const typeLabel = {
  donation: 'Donation',
  volunteer: 'Volunteer',
  event: 'Event',
  awareness: 'Awareness',
}

const statusLabel = {
  planned: 'Planned',
  ongoing: 'Ongoing',
  completed: 'Completed',
}

export default function CharityPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredActivities = activities.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalActivities = activities.length
  const completedActivities = activities.filter((a) => a.status === 'completed').length
  const donationAmount = activities
    .filter((a) => a.type === 'donation' && a.status === 'completed')
    .reduce((sum, a) => {
      const match = a.impact.match(/₹([0-9,]+)/)
      return sum + (match ? parseInt(match[1].replace(/,/g, '')) : 0)
    }, 0)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex flex-1">
        <SidebarNav />
        <main className="flex-1 ml-64 bg-background">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Charity Foundation</h1>
            <p className="text-muted-foreground mt-2">Track charitable activities and social impact</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalActivities}</div>
                <p className="text-xs text-muted-foreground">{completedActivities} completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{(donationAmount / 100000).toFixed(1)}L</div>
                <p className="text-xs text-muted-foreground">Funds raised</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Impact Reach</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.2K+</div>
                <p className="text-xs text-muted-foreground">People impacted</p>
              </CardContent>
            </Card>
          </div>

          {/* Activities Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Activities</CardTitle>
                  <CardDescription>All charitable activities and initiatives</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1 md:flex-none md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search activities..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Activity
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Activity</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Impact</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{activity.title}</div>
                            <div className="text-sm text-muted-foreground">{activity.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={typeColors[activity.type] as any}>
                            {typeLabel[activity.type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {activity.date}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{activity.impact}</TableCell>
                        <TableCell>
                          <Badge variant={statusColors[activity.status] as any}>
                            {statusLabel[activity.status]}
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
