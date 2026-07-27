import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { goScreen, setTheme } from '@/features/ui/uiSlice'
import type { ThemeKey } from '@/types'
import { cn } from '@/lib/utils'

const THEME_LIST: { key: ThemeKey; name: string; dot: string }[] = [
  { key: 'blurple', name: 'Nocturne Blurple', dot: 'linear-gradient(135deg,#9184d9 50%,#2b2741 50%)' },
  { key: 'royal', name: 'Royal Saffron', dot: 'linear-gradient(135deg,#f0b429 50%,#2a1052 50%)' },
  { key: 'peacock', name: 'Peacock Emerald', dot: 'linear-gradient(135deg,#2fd3ac 50%,#0a3b3a 50%)' },
  { key: 'merlot', name: 'Merlot & Rose Gold', dot: 'linear-gradient(135deg,#ff8f6b 50%,#5c1030 50%)' },
]

const NAV_ITEMS: { screen: 'dashboard' | 'events' | 'foods' | 'public'; label: string; matches: string[] }[] = [
  { screen: 'dashboard', label: 'Dashboard', matches: ['dashboard'] },
  { screen: 'events', label: 'Event Types', matches: ['events', 'event-form'] },
  { screen: 'foods', label: 'Food Categories', matches: ['foods', 'food-form'] },
  { screen: 'public', label: 'Public Site', matches: ['public'] },
]

export function Sidebar() {
  const dispatch = useAppDispatch()
  const screen = useAppSelector((s) => s.ui.screen)
  const theme = useAppSelector((s) => s.ui.theme)
  const showPicker = useAppSelector((s) => s.ui.showThemePicker)
  const themeRec = THEME_LIST.find((t) => t.key === theme) ?? THEME_LIST[0]

  return (
    <aside
      className="app-side flex-none flex flex-col gap-[22px] p-[20px_14px]"
      style={{
        width: 236,
        background: 'linear-gradient(185deg,var(--t-side-a),var(--t-side-b) 70%)',
        borderRight: '1px solid var(--color-divider)',
      }}
    >
      <div className="app-side-brand flex items-center gap-[10px] px-2 pt-1">
        <div
          className="flex-none grid place-items-center"
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'linear-gradient(150deg,var(--color-accent-500),var(--color-accent-700))',
            font: "700 15px/1 'Noto Sans Kannada',sans-serif",
            color: 'var(--color-accent-100)',
          }}
        >
          ನ
        </div>
        <div className="min-w-0">
          <div style={{ font: "500 14px/1.2 var(--font-heading)", letterSpacing: '-.01em' }}>ನಮ್ಮ ಸಂಭ್ರಮ</div>
          <div
            className="text-[10px] uppercase"
            style={{ letterSpacing: '.14em', color: 'var(--color-neutral-500)' }}
          >
            Admin console
          </div>
        </div>
      </div>

      <nav className="app-nav flex flex-col gap-[3px]">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.screen}
            onClick={() => dispatch(goScreen(item.screen))}
            className={cn('nav-item', item.matches.includes(screen) && 'is-active')}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {showPicker && (
        <div
          className="mt-auto flex flex-col gap-2 p-[11px] elev-sm"
          style={{ borderRadius: 'var(--radius-md)', background: 'var(--color-surface)' }}
        >
          <div
            className="text-[10px] uppercase"
            style={{ letterSpacing: '.14em', color: 'var(--color-neutral-500)' }}
          >
            Colour theme
          </div>
          <div className="flex gap-[7px] flex-wrap">
            {THEME_LIST.map((t) => (
              <button
                key={t.key}
                title={t.name}
                onClick={() => dispatch(setTheme(t.key))}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 9,
                  cursor: 'pointer',
                  background: t.dot,
                  border: `2px solid ${theme === t.key ? 'var(--color-accent)' : 'transparent'}`,
                  boxShadow:
                    'var(--color-divider) 0 0 0 1px' +
                    (theme === t.key ? ', color-mix(in srgb,var(--color-accent) 22%,transparent) 0 0 0 4px' : ''),
                }}
              />
            ))}
          </div>
          <div className="text-[11.5px] leading-tight" style={{ color: 'var(--color-neutral-400)' }}>
            {themeRec.name}
          </div>
        </div>
      )}

      <div
        className="flex items-center gap-[9px] p-[10px] elev-sm"
        style={{ borderRadius: 'var(--radius-md)', background: 'var(--color-surface)' }}
      >
        <div
          className="grid place-items-center text-[11px]"
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'var(--color-accent-800)',
            color: 'var(--color-accent-100)',
          }}
        >
          SK
        </div>
        <div className="min-w-0 text-[12px] leading-tight">
          <div>Suresh K.</div>
          <div style={{ color: 'var(--color-neutral-500)', fontSize: 11 }}>Owner</div>
        </div>
      </div>
    </aside>
  )
}
