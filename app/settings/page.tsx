'use client'

import { SidebarNav } from '@/components/sidebar-nav'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Building2, Bell, Lock } from 'lucide-react'
import { useState } from 'react'

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    address: '',
    industry: '',
  })

  const [notifications, setNotifications] = useState({
    orderAlerts: true,
    lowStock: true,
    paymentReminders: true,
    reportDigest: true,
    charityUpdates: false,
  })

  const handleFormChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications({ ...notifications, [field]: value })
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex flex-1">
        <SidebarNav />
        <main className="flex-1 ml-64 bg-background">
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your account and preferences</p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4 hidden sm:block" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="business" className="gap-2">
                <Building2 className="h-4 w-4 hidden sm:block" />
                Business
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4 hidden sm:block" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Lock className="h-4 w-4 hidden sm:block" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleFormChange('email', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleFormChange('phone', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button>Save Changes</Button>
                    <Button variant="outline">Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Business Tab */}
            <TabsContent value="business">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>Manage your business details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        value={formData.businessName}
                        onChange={(e) => handleFormChange('businessName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry Type</Label>
                      <Input
                        id="industry"
                        value={formData.industry}
                        onChange={(e) => handleFormChange('industry', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="address">Business Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleFormChange('address', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button>Save Changes</Button>
                    <Button variant="outline">Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Control how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {[
                      { key: 'orderAlerts', label: 'Order Alerts', description: 'Get notified about new orders' },
                      { key: 'lowStock', label: 'Low Stock Alerts', description: 'Notify when inventory is running low' },
                      { key: 'paymentReminders', label: 'Payment Reminders', description: 'Remind about pending payments' },
                      { key: 'reportDigest', label: 'Weekly Report Digest', description: 'Receive weekly business reports' },
                      { key: 'charityUpdates', label: 'Charity Updates', description: 'Updates on charitable activities' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <Switch
                          checked={notifications[item.key as keyof typeof notifications]}
                          onCheckedChange={(checked) => handleNotificationChange(item.key, checked)}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={() => console.log('Settings saved:', { formData, notifications })}>Save Preferences</Button>
                    <Button variant="outline">Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Change Password</p>
                          <p className="text-sm text-muted-foreground">Update your password regularly for security</p>
                        </div>
                        <Button variant="outline">Change</Button>
                      </div>
                    </div>

                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                        </div>
                        <Switch defaultChecked={false} />
                      </div>
                    </div>

                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Login Activity</p>
                          <p className="text-sm text-muted-foreground">View and manage your login history</p>
                        </div>
                        <Button variant="outline">View</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      </div>
    </div>
  )
}
