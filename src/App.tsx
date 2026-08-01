import { useEffect, useState } from 'react'
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
import { PaymentSettings } from '@/pages/PaymentSettings'
import { GallerySettings } from '@/pages/GallerySettings'
import { AdminSettingsPage } from '@/pages/AdminSettingsPage'
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
    case 'payment':
      return <PaymentSettings />
    case 'gallery':
      return <GallerySettings />
    case 'settings':
      return <AdminSettingsPage />
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
      className="app-mode-toggle grid place-items-center"
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

function MobileTopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <div
      className="app-mobile-bar flex items-center gap-[12px]"
      style={{
        padding: '12px 16px',
        background: 'linear-gradient(185deg,var(--t-side-a),var(--t-side-b) 70%)',
        borderBottom: '1px solid var(--color-divider)',
      }}
    >
      <button
        onClick={onOpenMenu}
        aria-label="Open menu"
        className="flex-none grid place-items-center"
        style={{
          width: 36,
          height: 36,
          borderRadius: 9,
          border: '1px solid var(--color-divider)',
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          cursor: 'pointer',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      <div
        className="flex-none grid place-items-center"
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: 'linear-gradient(150deg,var(--color-accent-500),var(--color-accent-700))',
          font: "700 13px/1 'Noto Sans Kannada',sans-serif",
          color: 'var(--color-accent-100)',
        }}
      >
        ನ
      </div>
      <div style={{ font: "500 14px/1.2 var(--font-heading)" }}>ನಮ್ಮ ಸಂಭ್ರಮ</div>
    </div>
  )
}

const SIDEBAR_COLLAPSED_KEY = 'namma-sambrama:sidebar-collapsed'

function App() {
  const theme = useAppSelector((s) => s.ui.theme)
  const mode = useAppSelector((s) => s.ui.mode)
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
    } catch {
      return false
    }
  })

  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth > 820)

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 821px)')
    const onChange = () => setIsDesktop(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0')
      } catch {
        // ignore storage errors
      }
      return next
    })
  }

  return (
    <div
      data-theme={theme}
      data-mode={mode}
      className="app-shell flex min-h-screen"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: 15 }}
    >
      <MobileTopBar onOpenMenu={() => setMenuOpen(true)} />
      {menuOpen && (
        <div
          className="app-scrim"
          onClick={() => setMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 39 }}
        />
      )}
      <Sidebar
        mobileOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        collapsed={isDesktop && collapsed}
        onToggleCollapse={toggleCollapsed}
      />
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
