'use client'

import { SidebarNav } from '@/components/sidebar-nav'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Upload, FileText, Image, Folder, Download, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  category: string
  size: string
  uploadedDate: string
  lastModified: string
}

const files: FileItem[] = [
  { id: '1', name: 'Garments Inventory 2024.xlsx', type: 'file', category: 'Finance', size: '2.4 MB', uploadedDate: '2024-03-01', lastModified: '2024-03-05' },
  { id: '2', name: 'Product Images', type: 'folder', category: 'Marketing', size: '145 MB', uploadedDate: '2024-02-15', lastModified: '2024-03-04' },
  { id: '3', name: 'Q1 Financial Report.pdf', type: 'file', category: 'Finance', size: '1.8 MB', uploadedDate: '2024-03-01', lastModified: '2024-03-05' },
  { id: '4', name: 'Design Templates', type: 'folder', category: 'Design', size: '320 MB', uploadedDate: '2024-01-10', lastModified: '2024-03-02' },
  { id: '5', name: 'Customer Database.csv', type: 'file', category: 'Data', size: '956 KB', uploadedDate: '2024-02-20', lastModified: '2024-03-06' },
  { id: '6', name: 'Marketing Materials', type: 'folder', category: 'Marketing', size: '85 MB', uploadedDate: '2024-01-25', lastModified: '2024-02-28' },
  { id: '7', name: 'Supplier Contracts.pdf', type: 'file', category: 'Legal', size: '3.2 MB', uploadedDate: '2024-02-10', lastModified: '2024-02-10' },
  { id: '8', name: 'Project Documentation', type: 'folder', category: 'Projects', size: '250 MB', uploadedDate: '2024-02-01', lastModified: '2024-03-03' },
]

const categoryColors = {
  'Finance': 'default',
  'Marketing': 'default',
  'Design': 'default',
  'Data': 'secondary',
  'Legal': 'default',
  'Projects': 'default',
}

export default function FilesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = ['all', ...new Set(files.map((f) => f.category))]

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalSize = files.reduce((sum, f) => {
    const sizeNum = parseFloat(f.size)
    const unit = f.size.split(' ')[1]
    if (unit === 'MB') return sum + sizeNum
    if (unit === 'GB') return sum + sizeNum * 1024
    if (unit === 'KB') return sum + sizeNum / 1024
    return sum
  }, 0)

  const fileCount = files.filter((f) => f.type === 'file').length
  const folderCount = files.filter((f) => f.type === 'folder').length

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex flex-1">
        <SidebarNav />
        <main className="flex-1 ml-64 bg-background">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">File Manager</h1>
            <p className="text-muted-foreground mt-2">Organize and manage all business files</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fileCount}</div>
                <p className="text-xs text-muted-foreground">files stored</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Folders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{folderCount}</div>
                <p className="text-xs text-muted-foreground">organized folders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSize.toFixed(1)} GB</div>
                <p className="text-xs text-muted-foreground">used</p>
              </CardContent>
            </Card>
          </div>

          {/* Files Section */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Files</CardTitle>
                  <CardDescription>All documents, images, and folders</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1 md:flex-none md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search files..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload
                  </Button>
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 mt-4 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category}
                    size="sm"
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === 'all' ? 'All' : category}
                  </Button>
                ))}
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-4 border border-border rounded-lg hover:bg-secondary/20 transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {file.type === 'folder' ? (
                          <Folder className="h-8 w-8 text-primary flex-shrink-0" />
                        ) : (
                          <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <h4 className="font-medium truncate text-sm">{file.name}</h4>
                          <p className="text-xs text-muted-foreground">{file.size}</p>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Badge variant={categoryColors[file.category as keyof typeof categoryColors] as any}>
                        {file.category}
                      </Badge>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Uploaded: {file.uploadedDate}</p>
                        <p>Modified: {file.lastModified}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 h-8">
                        Open
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
          </div>
        </div>
      </main>
      </div>
    </div>
  )
}
