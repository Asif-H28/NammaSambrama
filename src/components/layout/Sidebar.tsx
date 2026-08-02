import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { goScreen } from '@/features/ui/uiSlice'
import { logout } from '@/features/auth/authSlice'
import { cn } from '@/lib/utils'
import { NSLogo } from '@/components/brand/NSLogo'

type NavScreen = 'dashboard' | 'events' | 'foods' | 'payment' | 'gallery' | 'settings' | 'public'

const NAV_ITEMS: { screen: NavScreen; label: string; matches: string[] }[] = [
  { screen: 'dashboard', label: 'Dashboard', matches: ['dashboard'] },
  { screen: 'events', label: 'Event Types', matches: ['events', 'event-form'] },
  { screen: 'foods', label: 'Food Categories', matches: ['foods', 'food-form'] },
  { screen: 'payment', label: 'Payment', matches: ['payment'] },
  { screen: 'gallery', label: 'Gallery', matches: ['gallery'] },
  { screen: 'settings', label: 'Settings', matches: ['settings'] },
  { screen: 'public', label: 'Public Site', matches: ['public'] },
]

function NavIcon({ screen }: { screen: NavScreen }) {
  const props = {
    width: 17,
    height: 17,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (screen) {
    case 'dashboard':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="8" height="9" rx="1.5" />
          <rect x="13" y="3" width="8" height="5" rx="1.5" />
          <rect x="13" y="10" width="8" height="11" rx="1.5" />
          <rect x="3" y="14" width="8" height="7" rx="1.5" />
        </svg>
      )
    case 'events':
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      )
    case 'foods':
      return (
        <svg {...props}>
          <path d="M6 3v8a2 2 0 0 0 2 2v8M6 3v18M18 3c-2 0-3 2-3 5s1 4 3 4v10" />
        </svg>
      )
    case 'public':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 4 6 4 9s-1.5 6.4-4 9c-2.5-2.6-4-6-4-9s1.5-6.4 4-9Z" />
        </svg>
      )
    case 'payment':
      return (
        <svg {...props}>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M7 15h0M2 9.5h20" />
        </svg>
      )
    case 'gallery':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      )
    case 'settings':
      return (
        <svg {...props}>
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
  }
}

export function Sidebar({
  mobileOpen = false,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: {
  mobileOpen?: boolean
  onClose?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}) {
  const dispatch = useAppDispatch()
  const screen = useAppSelector((s) => s.ui.screen)
  const admin = useAppSelector((s) => s.auth.admin)

  const go = (screenKey: Parameters<typeof goScreen>[0]) => {
    dispatch(goScreen(screenKey))
    onClose?.()
  }

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.screen === 'settings') {
      return admin?.email === 'asif28072001@gmail.com'
    }
    return true
  })

  return (
    <aside
      className={cn(
        'app-side flex-none flex flex-col gap-[22px] p-[20px_14px]',
        mobileOpen && 'is-open',
        collapsed && 'is-collapsed',
      )}
      style={{
        width: collapsed ? 72 : 236,
        background: 'linear-gradient(185deg,var(--t-side-a),var(--t-side-b) 70%)',
        borderRight: '1px solid var(--color-divider)',
        transition: 'width .18s ease',
      }}
    >
      <div className="app-side-brand flex items-center gap-[10px] px-2 pt-1">
        <div className="flex-none">
          <NSLogo size={34} />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div style={{ font: "500 14px/1.2 var(--font-heading)", letterSpacing: '-.01em' }}>ನಮ್ಮ ಸಂಭ್ರಮ</div>
            <div
              className="text-[10px] uppercase"
              style={{ letterSpacing: '.14em', color: 'var(--color-neutral-500)' }}
            >
              Admin console
            </div>
          </div>
        )}
        <button
          onClick={onClose}
          className="app-side-close flex-none grid place-items-center"
          aria-label="Close menu"
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            border: '1px solid var(--color-divider)',
            background: 'var(--color-surface)',
            color: 'var(--color-neutral-400)',
            cursor: 'pointer',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="app-nav flex flex-col gap-[3px]">
        {visibleNavItems.map((item) =>
          item.screen === 'public' ? (
            <a
              key={item.screen}
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              title={collapsed ? item.label : undefined}
              className={cn(
                'nav-item flex items-center gap-[10px]',
                item.matches.includes(screen) && 'is-active',
                collapsed && 'justify-center',
              )}
            >
              <NavIcon screen={item.screen} />
              {!collapsed && item.label}
            </a>
          ) : (
            <button
              key={item.screen}
              onClick={() => go(item.screen)}
              title={collapsed ? item.label : undefined}
              className={cn(
                'nav-item flex items-center gap-[10px]',
                item.matches.includes(screen) && 'is-active',
                collapsed && 'justify-center',
              )}
            >
              <NavIcon screen={item.screen} />
              {!collapsed && item.label}
            </button>
          ),
        )}
      </nav>

      <button
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="app-side-collapse-btn flex-none flex items-center gap-[8px]"
        style={{
          marginTop: 'auto',
          padding: '9px 10px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-divider)',
          background: 'var(--color-surface)',
          color: 'var(--color-neutral-400)',
          cursor: 'pointer',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform .18s ease' }}
        >
          <path d="M15 5 8 12l7 7" />
        </svg>
        {!collapsed && <span className="text-[12.5px]">Collapse</span>}
      </button>

      <div
        className="flex items-center gap-[9px] p-[10px] elev-sm"
        style={{ borderRadius: 'var(--radius-md)', background: 'var(--color-surface)' }}
      >
        <div
          className="grid place-items-center text-[11px] flex-none uppercase"
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'var(--color-accent-800)',
            color: 'var(--color-accent-100)',
          }}
        >
          {(admin?.username || '?').slice(0, 2)}
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 text-[12px] leading-tight flex-1">
              <div className="truncate">{admin?.username ?? 'Admin'}</div>
              <div className="truncate" style={{ color: 'var(--color-neutral-500)', fontSize: 11 }}>
                {admin?.email ?? 'Admin'}
              </div>
            </div>
            <button
              onClick={() => dispatch(logout())}
              title="Sign out"
              aria-label="Sign out"
              className="btn btn-secondary btn-icon flex-none"
              style={{ width: 28, height: 28 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </>
        )}
      </div>
    </aside>
  )
}
