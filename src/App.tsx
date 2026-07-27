import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toggleMode } from '@/features/ui/uiSlice'
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

function ModeToggle() {
  const dispatch = useAppDispatch()
  const mode = useAppSelector((s) => s.ui.mode)

  return (
    <button
      onClick={() => dispatch(toggleMode())}
      title={mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      className="grid place-items-center"
      style={{
        position: 'fixed',
        top: 16,
        right: 20,
        zIndex: 50,
        width: 34,
        height: 34,
        borderRadius: 9,
        cursor: 'pointer',
        color: 'var(--color-text)',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-divider)',
      }}
    >
      {mode === 'dark' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}

function App() {
  const theme = useAppSelector((s) => s.ui.theme)
  const mode = useAppSelector((s) => s.ui.mode)

  return (
    <div
      data-theme={theme}
      data-mode={mode}
      className="app-shell flex min-h-screen"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: 15 }}
    >
      <Sidebar />
      <main className="app-pad flex-1 min-w-0" style={{ padding: '26px 32px 70px' }}>
        <Screen />
      </main>
      <ModeToggle />
      <PreviewDialog />
      <VideoDialog />
      <Toast />
    </div>
  )
}

export default App
