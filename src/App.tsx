import { useAppSelector } from '@/store/hooks'
import { Sidebar } from '@/components/layout/Sidebar'
import { Toast } from '@/components/layout/Toast'
import { VideoDialog } from '@/components/layout/VideoDialog'
import { PreviewDialog } from '@/components/layout/PreviewDialog'
import { Dashboard } from '@/pages/Dashboard'
import { EventTypes } from '@/pages/EventTypes'
import { EventForm } from '@/pages/EventForm'
import { FoodCategories } from '@/pages/FoodCategories'
import { FoodForm } from '@/pages/FoodForm'
import { PublicSite } from '@/pages/PublicSite'

function Screen() {
  const screen = useAppSelector((s) => s.ui.screen)
  switch (screen) {
    case 'dashboard':
      return <Dashboard />
    case 'events':
      return <EventTypes />
    case 'event-form':
      return <EventForm />
    case 'foods':
      return <FoodCategories />
    case 'food-form':
      return <FoodForm />
    case 'public':
      return <PublicSite />
  }
}

function App() {
  const theme = useAppSelector((s) => s.ui.theme)

  return (
    <div
      data-theme={theme}
      className="app-shell flex min-h-screen"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: 15 }}
    >
      <Sidebar />
      <main className="app-pad flex-1 min-w-0" style={{ padding: '26px 32px 70px' }}>
        <Screen />
      </main>
      <PreviewDialog />
      <VideoDialog />
      <Toast />
    </div>
  )
}

export default App
