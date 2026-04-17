'use client'

import { useState, useEffect } from 'react'
import { SidebarNav } from '@/components/sidebar-nav'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, ExternalLink, Image as ImageIcon, Trash2, Edit, Upload, Pause, Play, Settings, X, Search, MoreVertical, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Service {
  id: string
  title: string
  thumbnail: string
  link: string
  status: 'active' | 'paused'
  createdAt: string
}

export default function UserPanel() {
  const [activeSection, setActiveSection] = useState('online')
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    thumbnail: '',
    link: ''
  })
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  // Service management modal state
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [editFormData, setEditFormData] = useState({
    title: '',
    thumbnail: '',
    link: ''
  })
  const [editThumbnailFile, setEditThumbnailFile] = useState<File | null>(null)
  
  // Search and form visibility state
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  // Load services from Firebase
  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const { getServices } = await import('@/lib/firebase')
      const result = await getServices()
      
      if (result.success && result.services) {
        setServices(result.services)
      } else {
        console.error('Failed to load services:', result.error)
        toast.error('Failed to load services')
        setServices([])
      }
    } catch (error) {
      console.error('Error loading services:', error)
      toast.error('Failed to load services')
      setServices([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.link) {
      toast.error('Please fill title and link fields')
      return
    }

    setIsSubmitting(true)
    setIsUploading(true)
    
    try {
      let thumbnailUrl = formData.thumbnail
      
      // If a file was selected, upload it first
      if (thumbnailFile) {
        const { uploadImage } = await import('@/lib/firebase')
        const fileName = `service-thumbnails/${Date.now()}-${thumbnailFile.name}`
        const uploadResult = await uploadImage(thumbnailFile, fileName)
        
        if (uploadResult.success && uploadResult.url) {
          thumbnailUrl = uploadResult.url
        } else {
          console.error('Failed to upload thumbnail:', uploadResult.error)
          toast.error('Failed to upload thumbnail image')
          setIsSubmitting(false)
          setIsUploading(false)
          return
        }
      } else if (!thumbnailUrl) {
        // Use automatic logo detection if no thumbnail provided
        thumbnailUrl = getAutoThumbnail(formData.title)
      }
      
      const { addService } = await import('@/lib/firebase')
      const result = await addService({
        title: formData.title,
        thumbnail: thumbnailUrl,
        link: formData.link
      })
      
      if (result.success) {
        // Reload services to get the updated list
        await loadServices()
        setFormData({ title: '', thumbnail: '', link: '' })
        setThumbnailFile(null)
        toast.success('Service added successfully!')
      } else {
        console.error('Failed to add service:', result.error)
        toast.error('Failed to add service')
      }
    } catch (error) {
      console.error('Error adding service:', error)
      toast.error('Failed to add service')
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { deleteService } = await import('@/lib/firebase')
      const result = await deleteService(id)
      
      if (result.success) {
        // Reload services to get the updated list
        await loadServices()
        toast.success('Service deleted successfully!')
      } else {
        console.error('Failed to delete service:', result.error)
        toast.error('Failed to delete service')
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      toast.error('Failed to delete service')
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setEditFormData({
      title: service.title,
      thumbnail: service.thumbnail,
      link: service.link
    })
    setEditThumbnailFile(null)
    setShowServiceModal(true)
  }

  const handlePauseResume = async (service: Service) => {
    try {
      const { updateService } = await import('@/lib/firebase')
      const newStatus = service.status === 'active' ? 'paused' : 'active'
      const result = await updateService(service.id, { status: newStatus })
      
      if (result.success) {
        await loadServices()
        toast.success(`Service ${newStatus === 'active' ? 'resumed' : 'paused'} successfully!`)
      } else {
        console.error('Failed to update service status:', result.error)
        toast.error('Failed to update service status')
      }
    } catch (error) {
      console.error('Error updating service status:', error)
      toast.error('Failed to update service status')
    }
  }

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editFormData.title || !editFormData.link) {
      toast.error('Please fill title and link fields')
      return
    }

    if (!editingService) return

    setIsSubmitting(true)
    setIsUploading(true)
    
    try {
      let thumbnailUrl = editFormData.thumbnail
      
      // If a file was selected, upload it first
      if (editThumbnailFile) {
        const { uploadImage } = await import('@/lib/firebase')
        const fileName = `service-thumbnails/${Date.now()}-${editThumbnailFile.name}`
        const uploadResult = await uploadImage(editThumbnailFile, fileName)
        
        if (uploadResult.success && uploadResult.url) {
          thumbnailUrl = uploadResult.url
        } else {
          console.error('Failed to upload thumbnail:', uploadResult.error)
          toast.error('Failed to upload thumbnail image')
          setIsSubmitting(false)
          setIsUploading(false)
          return
        }
      } else if (!thumbnailUrl) {
        // Use automatic logo detection if no thumbnail provided
        thumbnailUrl = getAutoThumbnail(editFormData.title)
      }
      
      const { updateService } = await import('@/lib/firebase')
      const result = await updateService(editingService.id, {
        title: editFormData.title,
        thumbnail: thumbnailUrl,
        link: editFormData.link
      })
      
      if (result.success) {
        // Reload services to get the updated list
        await loadServices()
        setShowServiceModal(false)
        setEditingService(null)
        setEditFormData({ title: '', thumbnail: '', link: '' })
        setEditThumbnailFile(null)
        toast.success('Service updated successfully!')
      } else {
        console.error('Failed to update service:', result.error)
        toast.error('Failed to update service')
      }
    } catch (error) {
      console.error('Error updating service:', error)
      toast.error('Failed to update service')
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
    }
  }

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      
      setEditThumbnailFile(file)
      // Clear the thumbnail URL when a file is selected
      setEditFormData(prev => ({ ...prev, thumbnail: '' }))
    }
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditFormData(prev => ({ ...prev, [name]: value }))
  }

  // Filter services based on search query
  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      
      setThumbnailFile(file)
      // Clear the thumbnail URL when a file is selected
      setFormData(prev => ({ ...prev, thumbnail: '' }))
    }
  }

  // Automatic logo detection for common services
  const getAutoThumbnail = (title: string): string => {
    const titleLower = title.toLowerCase()
    
    // Government service logos mapping
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
    
    // Generate a placeholder with the service name
    return `https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=${encodeURIComponent(title.toUpperCase())}`
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        dataStatus={'green'}
        handleRefresh={() => {}}
        isRefreshing={false}
      />
      <div className="flex flex-1">
        <SidebarNav activeSection={activeSection} />
        
        {/* Main Content */}
        <main className="flex-1 ml-64 bg-background">
          <div className="p-8 w-full mt-20">
            {/* Header with Back and Add Service Buttons */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">User Panel - Admin Section</h1>
                  <p className="text-gray-600">Manage online services and links</p>
                </div>
              </div>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Service
              </Button>
            </div>

            {/* Add Service Form - Toggleable */}
            {showAddForm && (
              <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        type="text"
                        placeholder="Enter service title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="thumbnail">Thumbnail Image (Optional)</Label>
                      <div className="space-y-2">
                        <Input
                          id="thumbnail"
                          name="thumbnail"
                          type="url"
                          placeholder="Enter image URL (optional)"
                          value={formData.thumbnail}
                          onChange={handleInputChange}
                          disabled={!!thumbnailFile}
                        />
                        <div className="flex items-center gap-2">
                          <Input
                            id="thumbnail-file"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="flex-1"
                            disabled={!!formData.thumbnail}
                          />
                          {thumbnailFile && (
                            <Badge variant="secondary" className="text-xs">
                              {thumbnailFile.name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Upload an image (max 5MB) or provide an image URL. 
                          If left empty, we'll automatically detect and show the appropriate logo for services like Aadhaar, Voter, PAN, etc.
                        </p>
                        
                        {/* Preview automatically detected thumbnail */}
                        {formData.title && !formData.thumbnail && !thumbnailFile && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-600 mb-2">Auto-detected thumbnail preview:</p>
                            <div className="w-32 h-20 border rounded overflow-hidden">
                              <img
                                src={getAutoThumbnail(formData.title)}
                                alt="Auto-detected thumbnail"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="link">Link</Label>
                      <Input
                        id="link"
                        name="link"
                        type="url"
                        placeholder="Enter service link"
                        value={formData.link}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || isUploading}
                    className="w-full md:w-auto"
                  >
                    {isSubmitting || isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isUploading ? 'Uploading...' : 'Adding...'}
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Service
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            )}

            {/* Services List with Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span>All Services</span>
                    <Badge variant="secondary">{services.length} Services</Badge>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search services..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : filteredServices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery ? 'No services found matching your search.' : 'No services added yet. Add your first service above!'}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {filteredServices.map((service) => (
                      <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow w-full max-w-xs">
                        <div className="aspect-[4/3] bg-gray-100 relative p-1">
                          <img
                            src={service.thumbnail}
                            alt={service.title}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = 'https://via.placeholder.com/120x90?text=No+Image'
                            }}
                          />
                          {service.status === 'paused' && (
                            <div className="absolute top-1 right-1">
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs px-1 py-0">
                                Paused
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-2">
                          <div className="flex items-start justify-between mb-0.5">
                            <h3 className="font-semibold text-gray-800 truncate flex-1 text-xs">
                              {service.title}
                            </h3>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => window.open(service.link, '_blank')}>
                                  <ExternalLink className="h-3 w-3 mr-2" />
                                  Visit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(service)}>
                                  <Edit className="h-3 w-3 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handlePauseResume(service)}
                                  className={service.status === 'active' ? 'text-orange-600' : 'text-green-600'}
                                >
                                  {service.status === 'active' ? (
                                    <>
                                      <Pause className="h-3 w-3 mr-2" />
                                      Pause
                                    </>
                                  ) : (
                                    <>
                                      <Play className="h-3 w-3 mr-2" />
                                      Resume
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(service.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-3 w-3 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant={service.status === 'active' ? 'default' : 'secondary'}
                              className={`text-xs ${service.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}
                            >
                              {service.status}
                            </Badge>
                            <a
                              href={service.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-0.5 text-blue-600 hover:text-blue-800 text-xs"
                            >
                              <ExternalLink className="h-2 w-2" />
                              Visit
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Edit Service Modal */}
            {editingService && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">Edit Service</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingService(null)
                          setEditFormData({ title: '', thumbnail: '', link: '' })
                          setEditThumbnailFile(null)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <form onSubmit={handleUpdateService} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="edit-title">Title</Label>
                          <Input
                            id="edit-title"
                            name="title"
                            type="text"
                            placeholder="Enter service title"
                            value={editFormData.title}
                            onChange={handleEditInputChange}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="edit-thumbnail">Thumbnail Image (Optional)</Label>
                          <div className="space-y-2">
                            <Input
                              id="edit-thumbnail"
                              name="thumbnail"
                              type="url"
                              placeholder="Enter image URL (optional)"
                              value={editFormData.thumbnail}
                              onChange={handleEditInputChange}
                              disabled={!!editThumbnailFile}
                            />
                            <div className="flex items-center gap-2">
                              <Input
                                id="edit-thumbnail-file"
                                type="file"
                                accept="image/*"
                                onChange={handleEditFileChange}
                                className="flex-1"
                                disabled={!!editFormData.thumbnail}
                              />
                              {editThumbnailFile && (
                                <Badge variant="secondary" className="text-xs">
                                  {editThumbnailFile.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="edit-link">Link</Label>
                          <Input
                            id="edit-link"
                            name="link"
                            type="url"
                            placeholder="Enter service link"
                            value={editFormData.link}
                            onChange={handleEditInputChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          type="submit" 
                          disabled={isSubmitting || isUploading}
                        >
                          {isSubmitting || isUploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            'Update Service'
                          )}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => {
                            setEditingService(null)
                            setEditFormData({ title: '', thumbnail: '', link: '' })
                            setEditThumbnailFile(null)
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
