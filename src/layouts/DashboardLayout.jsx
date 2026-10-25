import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import MobileAppInstallPrompt from '@/components/MobileAppInstallPrompt'

function DashboardLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="app-shell flex h-screen overflow-hidden bg-canvas">
      <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setMobileNavOpen(true)} />
        <main className="app-content flex-1 overflow-y-auto overflow-x-hidden bg-canvas p-4 sm:p-6 lg:p-7">
          <Outlet />
        </main>
        <MobileAppInstallPrompt />
      </div>
    </div>
  )
}

export default DashboardLayout
