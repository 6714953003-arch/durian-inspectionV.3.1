import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ZoneListPage } from './pages/ZoneListPage'
import { ZoneDetailPage } from './pages/ZoneDetailPage'
import { HistoryPage } from './pages/HistoryPage'
import { SettingsPage } from './pages/SettingsPage'

export type Page = 'dashboard' | 'zones' | 'zone-detail' | 'history' | 'settings'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [selectedZoneId, setSelectedZoneId] = useState<number>(1)

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />
  }

  const handleSelectZone = (id: number) => {
    setSelectedZoneId(id)
    setCurrentPage('zone-detail')
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage onSelectZone={handleSelectZone} />
      case 'zones': return <ZoneListPage onSelectZone={handleSelectZone} />
      case 'zone-detail': return <ZoneDetailPage zoneId={selectedZoneId} onBack={() => setCurrentPage('zones')} />
      case 'history': return <HistoryPage />
      case 'settings': return <SettingsPage onLogout={() => setIsLoggedIn(false)} />
      default: return <DashboardPage onSelectZone={handleSelectZone} />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar onLogout={() => setIsLoggedIn(false)} />
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
