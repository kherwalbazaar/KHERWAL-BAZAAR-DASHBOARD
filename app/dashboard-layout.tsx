'use client'

import { SidebarNav } from '@/components/sidebar-nav'
import { Header } from '@/components/header'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <Header />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
