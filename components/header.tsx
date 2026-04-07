'use client'

import { useState } from 'react'
import { LogOut, User, LogIn, Shield, RefreshCw, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface HeaderProps {
  activeSection?: string
  setActiveSection?: (section: string) => void
  dataStatus?: 'green' | 'yellow' | 'red'
  handleRefresh?: () => void
  isRefreshing?: boolean
}

export function Header({ 
  activeSection = 'garments', 
  setActiveSection,
  dataStatus = 'green',
  handleRefresh,
  isRefreshing = false
}: HeaderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [activeButton, setActiveButton] = useState<string | null>('kherwal')
  const [adminName, setAdminName] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.email && formData.password) {
      // For demo purposes, accept any credentials
      const nameParts = formData.email.split('@')[0].split('.')
      const displayName =
        nameParts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') ||
        'Admin'
      setAdminName(displayName)
      setIsLoggedIn(true)
      setIsLoginOpen(false)
      setFormData({ email: '', password: '' })
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setAdminName('')
  }

  return (
    <>
      {/* Header Bar */}
      <header className="fixed top-0 right-0 left-0 h-24 bg-blue-500 border-b border-border shadow-sm z-40">
        <div className="h-full px-6 flex items-center justify-between relative">
          {/* Left Side - Logo, Title and Tagline */}
          <div className="flex items-center gap-3">
            <img 
              src="/header.png" 
              alt="Kherwal Bazaar Logo" 
              className="h-12 w-12 object-contain"
            />
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-white">
                KHERWAL BAZAAR - DASHBOARD
              </h1>
              <p className="text-sm text-blue-100 italic">
                Redefining your Style.
              </p>
            </div>
          </div>

          {/* Right - Sync Status Button */}
          {handleRefresh && (
            <div className="absolute right-30 top-0 flex items-start">
              <Button 
                onClick={handleRefresh} 
                variant="outline"
                size="default"
                className="flex items-center gap-2 font-medium transition-all duration-200 h-10 !bg-white !text-green-600 !border-green-300 cursor-pointer hover:!bg-green-50"
              >
                <div className={`w-2.5 h-2.5 rounded-full transition-all ${
                  dataStatus === 'green' ? 'bg-green-500' :
                  dataStatus === 'yellow' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`}></div>
                {dataStatus === 'green' && '✓ Up to date'}
                {dataStatus === 'yellow' && (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Syncing data...
                  </>
                )}
                {dataStatus === 'red' && (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Sync failed
                  </>
                )}
              </Button>
            </div>
          )}
          
          {/* Right Side - Controls */}
          <div className="flex flex-col justify-center items-end gap-4">
          {/* Admin Dropdown - Top */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 font-medium bg-white rounded-sm"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Staff</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <LogIn className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Three Buttons - Bottom */}
          <div className="flex items-center gap-1">
            {!isLoggedIn ? (
              <>
                <Button 
                  variant="outline" 
                  className={cn(
                    "font-medium rounded-sm transition-all duration-200",
                    activeButton === 'kherwal' 
                      ? "!bg-white text-blue-500 border-gray-300" 
                      : "bg-blue-400 text-white hover:bg-blue-500"
                  )}
                  onClick={() => {
                    setActiveButton(activeButton === 'kherwal' ? null : 'kherwal')
                    setActiveSection?.('garments')
                  }}
                >
                  <span 
                    className={activeButton === 'kherwal' ? 
                      'text-blue-600 transform -translate-y-0.5 transition-all duration-200 ease-in-out' 
                    : 
                      'text-white transform translate-y-0 transition-all duration-200 ease-in-out hover:text-white'
                    }
                  >
                    KHERWAL BAZAAR
                  </span>
                </Button>
                <Button 
                  variant="outline" 
                  className={cn(
                    "font-medium rounded-sm transition-all duration-200",
                    activeButton === 'printing' 
                      ? "!bg-white text-blue-500 border-gray-300" 
                      : "bg-gray-400 text-white hover:bg-gray-500"
                  )}
                  onClick={() => {
                    setActiveButton(activeButton === 'printing' ? null : 'printing')
                    setActiveSection?.('printing')
                  }}
                >
                  <span 
                    className={activeButton === 'printing' ? 
                      'text-red-500 -translate-y-0.5' 
                    : 
                      'text-white'
                    }
                  >
                    PRINTING
                  </span>
                </Button>
                <Button 
                  variant="outline" 
                  className={cn(
                    "font-medium rounded-sm transition-all duration-200",
                    activeButton === 'online' 
                      ? "!bg-white text-blue-500 border-gray-300" 
                      : "bg-blue-400 text-white hover:bg-blue-500"
                  )}
                  onClick={() => {
                    setActiveButton(activeButton === 'online' ? null : 'online')
                    setActiveSection?.('online')
                  }}
                >
                  <span 
                    className={activeButton === 'online' ? 
                      'text-green-600 -translate-y-0.5 transition duration-200 ease-in-out' 
                    : 
                      'text-white transition duration-200 ease-in-out'
                    }
                  >
                    ONLINE
                  </span>
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="gap-3 h-10 px-3 hover:bg-muted rounded-lg"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary-foreground">
                        {adminName.split(' ').map((n) => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground hidden sm:inline">
                      {adminName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{adminName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        Admin Account
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          </div>
        </div>
      </header>
      
      {/* Excel-style grid line */}
      <div className="fixed top-24 left-0 right-0 h-px bg-gray-300 border-b border-gray-400 z-30"></div>

      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Login</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@kherwal.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLoginOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Login</Button>
            </DialogFooter>
          </form>

          <div className="mt-4 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
            <p className="font-medium mb-1">Login to access dashboard</p>
            <p>Enter your admin credentials to continue</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
