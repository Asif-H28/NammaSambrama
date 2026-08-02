import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchEnquiries, updateEnquiryStatus } from '@/features/enquiries/enquiriesThunks'
import type { Enquiry } from '@/types'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const STATUS_LABEL: Record<Enquiry['status'], string> = {
  new: 'New',
  contacted: 'Contacted',
  closed: 'Closed',
}

const STATUS_DOT: Record<Enquiry['status'], string> = {
  new: 'var(--color-accent-400)',
  contacted: 'var(--color-accent-2)',
  closed: 'var(--color-neutral-500)',
}

function ymd(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function todayYmd() {
  const now = new Date()
  return ymd(now.getFullYear(), now.getMonth(), now.getDate())
}

function formatLongDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

/** First letters of the contact name, for the chat avatar. */
function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
}


/**
 * One booking rendered as a chat bubble. Shared by the day panel and the
 * "View all" modal so both stay visually identical.
 */
function EnquiryBubble({
  e,
  onStatusChange,
}: {
  e: Enquiry
  onStatusChange: (status: Enquiry['status']) => void
}) {
  return (
    <div className="chat-row">
      <div className="chat-avatar" aria-hidden="true">
        {initials(e.contactName)}
      </div>

      <div className={`chat-bubble chat-bubble--${e.status}`}>
        <div className="chat-bubble-top">
          <span className="chat-name">{e.eventLabel}</span>
          <select
            className={`chat-status chat-status--${e.status}`}
            value={e.status}
            onChange={(ev) => onStatusChange(ev.target.value as Enquiry['status'])}
          >
            {(['new', 'contacted', 'closed'] as const).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="chat-contact">
          {e.contactName}
          {e.contactPhone && <span className="chat-phone"> · {e.contactPhone}</span>}
        </div>

        <div className="chat-chips">
          <span className="chat-chip">👥 {e.guestCount || '—'} guests</span>
          <span className="chat-chip">🍽 {e.items.length} items</span>
        </div>

        {e.items.length > 0 && (
          <div className="chat-menu">
            <span className="chat-menu-label">Menu</span>
            {e.items.map((it) => it.name).join(', ')}
          </div>
        )}

        {e.contactNotes && <div className="chat-note">📝 {e.contactNotes}</div>}

        <div className="chat-time">
          {e.eventTime || '—'}
          <svg viewBox="0 0 18 12" className="chat-ticks" aria-hidden="true">
            <path d="M1 6.5 4.2 9.7 10 3.2" />
            <path d="M7.6 6.7 10.4 9.7 16.4 3.2" />
          </svg>
        </div>

        <span className="chat-tail" aria-hidden="true" />
      </div>
    </div>
  )
}


/**
 * Compact card used by the card view. Shows a few key fields; the expand
 * button reveals every remaining detail of the booking.
 */
function EnquiryCard({
  e,
  expanded,
  onToggle,
  onStatusChange,
}: {
  e: Enquiry
  expanded: boolean
  onToggle: () => void
  onStatusChange: (status: Enquiry['status']) => void
}) {
  return (
    <div className={`ev-card ev-card--${e.status}${expanded ? ' is-open' : ''}`}>
      <div className="ev-card-head">
        <div className="ev-card-avatar" aria-hidden="true">
          {initials(e.contactName)}
        </div>
        <div className="ev-card-headtext">
          <div className="ev-card-title">{e.eventLabel}</div>
          <div className="ev-card-contact">
            {e.contactName}
            {e.contactPhone && <span className="ev-card-phone"> · {e.contactPhone}</span>}
          </div>
        </div>
        <select
          className={`chat-status chat-status--${e.status} flex-none`}
          value={e.status}
          onChange={(ev) => onStatusChange(ev.target.value as Enquiry['status'])}
          aria-label="Booking status"
        >
          {(['new', 'contacted', 'closed'] as const).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Summary fields, always visible */}
      <div className="ev-card-chips">
        <span className="chat-chip">🕐 {e.eventTime || '—'}</span>
        <span className="chat-chip">👥 {e.guestCount || '—'} guests</span>
        <span className="chat-chip">🍽 {e.items.length} items</span>
      </div>

      {/* Full detail, revealed on expand */}
      {expanded && (
        <div className="ev-card-detail">
          <div className="ev-card-grid">
            <div>
              <span className="ev-card-label">Date</span>
              {e.eventDate ? formatLongDate(e.eventDate) : '—'}
            </div>
            <div>
              <span className="ev-card-label">Time</span>
              {e.eventTime || '—'}
            </div>
            <div>
              <span className="ev-card-label">Guests</span>
              {e.guestCount || '—'}
            </div>
            <div>
              <span className="ev-card-label">Booked on</span>
              {new Date(e.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <span className="ev-card-label">Contact</span>
              {e.contactName}
              {e.contactPhone && ` · ${e.contactPhone}`}
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <span className="ev-card-label">Event type</span>
              {e.eventLabel}
              {e.isCustomEvent && <span className="ev-card-custom">custom</span>}
            </div>
          </div>

          {e.items.length > 0 && (
            <div className="ev-card-block">
              <span className="ev-card-label">Menu · {e.items.length} items</span>
              <div className="ev-card-items">
                {e.items.map((it, i) => (
                  <span key={`${it.name}-${i}`} className={`ev-item${it.isCustom ? ' is-custom' : ''}`}>
                    {it.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {e.contactNotes && (
            <div className="ev-card-block">
              <span className="ev-card-label">Notes</span>
              <div className="ev-card-notes">{e.contactNotes}</div>
            </div>
          )}
        </div>
      )}

      <button className="ev-card-expand" onClick={onToggle} aria-expanded={expanded}>
        {expanded ? 'Show less' : 'View details'}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </div>
  )
}

export function EventCalendar({ enquiries }: { enquiries: Enquiry[] }) {
  const dispatch = useAppDispatch()
  const loading = useAppSelector((s) => s.enquiries.loading)
  const theme = useAppSelector((s) => s.ui.theme)
  const mode = useAppSelector((s) => s.ui.mode)
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [view, setView] = useState<'calendar' | 'cards'>('calendar')
  const [query, setQuery] = useState('')
  const [fullscreen, setFullscreen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | Enquiry['status']>('all')
  /** Ids of cards expanded to their full detail in card view. */
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  /**
   * Search + status filter applied once at the source, so every surface
   * (calendar dots, day panel, cards, modal) reflects the same result set.
   */
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return enquiries.filter((e) => {
      if (statusFilter !== 'all' && e.status !== statusFilter) return false
      if (!q) return true
      return (
        e.eventLabel.toLowerCase().includes(q) ||
        e.contactName.toLowerCase().includes(q) ||
        e.contactPhone.toLowerCase().includes(q) ||
        e.items.some((it) => it.name.toLowerCase().includes(q))
      )
    })
  }, [enquiries, query, statusFilter])

  // Escape closes the topmost layer: the View-all modal first, then
  // fullscreen. Without the modal check, one press would dismiss both.
  useEffect(() => {
    if (!fullscreen && !showAll) return
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key !== 'Escape') return
      if (showAll) setShowAll(false)
      else setFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fullscreen, showAll])

  // The page behind the fullscreen panel must not scroll. The panel is
  // portalled to <body>, outside .app-shell where data-theme lives, so mirror
  // those attributes onto <html> — without them the portal inherits none of
  // the --color-* tokens and renders unstyled.
  useEffect(() => {
    if (!fullscreen) return
    const root = document.documentElement
    const prevOverflow = document.body.style.overflow
    const prevTheme = root.getAttribute('data-theme')
    const prevMode = root.getAttribute('data-mode')
    document.body.style.overflow = 'hidden'
    root.setAttribute('data-theme', theme)
    root.setAttribute('data-mode', mode)
    return () => {
      document.body.style.overflow = prevOverflow
      if (prevTheme === null) root.removeAttribute('data-theme')
      else root.setAttribute('data-theme', prevTheme)
      if (prevMode === null) root.removeAttribute('data-mode')
      else root.setAttribute('data-mode', prevMode)
    }
  }, [fullscreen, theme, mode])

  const byDate = useMemo(() => {
    const map = new Map<string, Enquiry[]>()
    visible.forEach((e) => {
      if (!e.eventDate) return
      const list = map.get(e.eventDate) ?? []
      list.push(e)
      map.set(e.eventDate, list)
    })
    // Chronological within a day, so the schedule reads top to bottom.
    map.forEach((list) => list.sort((a, b) => (a.eventTime || '').localeCompare(b.eventTime || '')))
    return map
  }, [visible])

  const isFiltering = query.trim() !== '' || statusFilter !== 'all'

  const goPrevMonth = () => {
    setSelectedDay(null)
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const goNextMonth = () => {
    setSelectedDay(null)
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  const goToday = () => {
    setYear(now.getFullYear())
    setMonth(now.getMonth())
    setSelectedDay(todayYmd())
  }

  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = todayYmd()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const monthEnquiries = useMemo(() => {
    const list: Enquiry[] = []
    cells.forEach((day) => {
      if (day === null) return
      list.push(...(byDate.get(ymd(year, month, day)) ?? []))
    })
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byDate, year, month, daysInMonth, firstWeekday])

  const monthEventCount = monthEnquiries.length

  /**
   * Counts for the status chips. Derived from the search-filtered but
   * status-UNfiltered set: if these followed the active status filter, every
   * other chip would read 0 and look disabled.
   */
  const chipCounts = useMemo(() => {
    const q = query.trim().toLowerCase()
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`
    const inScope = enquiries.filter((e) => {
      if (!e.eventDate || !e.eventDate.startsWith(prefix)) return false
      if (!q) return true
      return (
        e.eventLabel.toLowerCase().includes(q) ||
        e.contactName.toLowerCase().includes(q) ||
        e.contactPhone.toLowerCase().includes(q) ||
        e.items.some((it) => it.name.toLowerCase().includes(q))
      )
    })
    return {
      all: inScope.length,
      new: inScope.filter((e) => e.status === 'new').length,
      contacted: inScope.filter((e) => e.status === 'contacted').length,
      closed: inScope.filter((e) => e.status === 'closed').length,
    }
  }, [enquiries, query, year, month])

  const selectedEnquiries = selectedDay ? byDate.get(selectedDay) ?? [] : []

  /** Every booking this month, grouped by date and sorted chronologically. */
  const monthGrouped = useMemo(() => {
    const groups = new Map<string, Enquiry[]>()
    cells.forEach((day) => {
      if (day === null) return
      const key = ymd(year, month, day)
      const list = byDate.get(key)
      if (list && list.length) groups.set(key, list)
    })
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byDate, year, month, daysInMonth, firstWeekday])

  /** Month stepper + Today, shared by both views so navigation never moves. */
  const dateNav = (
    <div className="ev-nav">
      <button className="ev-nav-arrow" aria-label="Previous month" onClick={goPrevMonth}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <div className="ev-nav-label">
        <span className="ev-nav-month">{MONTH_NAMES[month]}</span>
        <span className="ev-nav-year">{year}</span>
      </div>
      <button className="ev-nav-arrow" aria-label="Next month" onClick={goNextMonth}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
      <button className="ev-nav-today" onClick={goToday}>
        Today
      </button>
    </div>
  )

  /** Search, status filter and refresh — identical in both views. */
  const toolbar = (
    <div className="ev-toolbar">
      <div className="ev-search">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.2-3.2" />
        </svg>
        <input
          value={query}
          onChange={(ev) => setQuery(ev.target.value)}
          placeholder="Search event, name, phone or dish…"
          aria-label="Search bookings"
        />
        {query && (
          <button className="ev-search-clear" onClick={() => setQuery('')} aria-label="Clear search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="ev-filters" role="group" aria-label="Filter by status">
        {(['all', 'new', 'contacted', 'closed'] as const).map((s) => (
          <button
            key={s}
            className={`ev-filter${statusFilter === s ? ' is-active' : ''}`}
            onClick={() => setStatusFilter(s)}
            aria-pressed={statusFilter === s}
          >
            {s !== 'all' && <i style={{ background: STATUS_DOT[s] }} />}
            {s === 'all' ? 'All' : STATUS_LABEL[s]}
            <span className="ev-filter-n">{chipCounts[s]}</span>
          </button>
        ))}
      </div>

      <button
        className={`cal-refresh${loading ? ' is-busy' : ''}`}
        onClick={() => dispatch(fetchEnquiries())}
        disabled={loading}
        aria-label="Refresh bookings"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 1 1-2.64-6.36" />
          <path d="M21 3v6h-6" />
        </svg>
        <span>{loading ? 'Syncing…' : 'Refresh'}</span>
      </button>
    </div>
  )

  const expandBtn = (
    <button
      className="ev-expand-btn"
      onClick={() => setFullscreen((v) => !v)}
      title={fullscreen ? 'Exit fullscreen (Esc)' : 'Expand to fullscreen'}
      aria-label={fullscreen ? 'Exit fullscreen' : 'Expand to fullscreen'}
      aria-pressed={fullscreen}
    >
      {fullscreen ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" />
        </svg>
      )}
      <span>{fullscreen ? 'Exit' : 'Expand'}</span>
    </button>
  )

  const tabs = (
    <div className="ev-tabs" role="tablist" aria-label="Bookings view">
      <button
        role="tab"
        aria-selected={view === 'calendar'}
        className={`ev-tab${view === 'calendar' ? ' is-active' : ''}`}
        onClick={() => setView('calendar')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
        Calendar
      </button>
      <button
        role="tab"
        aria-selected={view === 'cards'}
        className={`ev-tab${view === 'cards' ? ' is-active' : ''}`}
        onClick={() => setView('cards')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="7" rx="1.8" />
          <rect x="3" y="13" width="18" height="7" rx="1.8" />
        </svg>
        Cards
        {monthEventCount > 0 && <span className="ev-tab-count">{monthEventCount}</span>}
      </button>
    </div>
  )

  if (view === 'cards') {
    // A date chosen in calendar view can point outside the month shown here,
    // so fall back to "All" unless it belongs to the visible month.
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`
    const activeDay = selectedDay && selectedDay.startsWith(monthPrefix) ? selectedDay : null

    const cardView = (
      <div className={`ev-cardview${fullscreen ? ' is-fullscreen' : ''}`}>
        <div className="ev-topbar">
          <div className="ev-topbar-left">
            {tabs}
            {expandBtn}
          </div>
        </div>

        {/* One shared header: nav on the left, tools on the right */}
        <div className="ev-header">
          {dateNav}
          {toolbar}
        </div>

        {/* Day filter — only days that actually have bookings */}
        {monthGrouped.length > 0 && (
          <div className="ev-daystrip">
            <button
              className={`ev-daypill${activeDay === null ? ' is-active' : ''}`}
              onClick={() => setSelectedDay(null)}
            >
              <span className="ev-daypill-wd">All</span>
              <span className="ev-daypill-count">{monthEventCount}</span>
            </button>
            {monthGrouped.map(([date, list]) => {
              const dayNum = Number(date.slice(-2))
              const weekday = WEEKDAYS[new Date(year, month, dayNum).getDay()]
              const isToday = date === today
              return (
                <button
                  key={date}
                  className={`ev-daypill${activeDay === date ? ' is-active' : ''}${isToday ? ' is-today' : ''}`}
                  onClick={() => setSelectedDay(activeDay === date ? null : date)}
                >
                  <span className="ev-daypill-wd">{weekday}</span>
                  <span className="ev-daypill-day">{dayNum}</span>
                  <span className="ev-daypill-count">{list.length}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Cards */}
        {monthEventCount === 0 ? (
          <div className="ev-empty">
            <div className="chat-empty-icon">{isFiltering ? '🔍' : '📭'}</div>
            <div className="chat-empty-text">
              {isFiltering
                ? `No bookings match your filters in ${MONTH_NAMES[month]} ${year}.`
                : `No bookings in ${MONTH_NAMES[month]} ${year}.`}
            </div>
            {isFiltering && (
              <button
                className="ev-clear-filters"
                onClick={() => {
                  setQuery('')
                  setStatusFilter('all')
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          (activeDay ? [[activeDay, byDate.get(activeDay) ?? []] as const] : monthGrouped).map(
            ([date, list]) => (
              <div key={date} className="ev-group">
                <div className="ev-group-head">
                  <span className="ev-group-date">{formatLongDate(date)}</span>
                  <span className="ev-group-count">
                    {list.length} event{list.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="ev-grid">
                  {list.map((e) => (
                    <EnquiryCard
                      key={e.id}
                      e={e}
                      expanded={expanded.has(e.id)}
                      onToggle={() => toggleExpanded(e.id)}
                      onStatusChange={(status) => dispatch(updateEnquiryStatus({ id: e.id, status }))}
                    />
                  ))}
                </div>
              </div>
            ),
          )
        )}
      </div>
    )

    // Fullscreen renders through a portal: .app-shell sets `isolation:
    // isolate`, which traps any z-index inside it and would keep the sidebar
    // painted over a fixed-position descendant.
    return fullscreen ? createPortal(cardView, document.body) : cardView
  }

  const calendarView = (
    <div className={`ev-calendarview${fullscreen ? ' is-fullscreen' : ''}`}>
      <div className="ev-topbar">
        <div className="ev-topbar-left">
          {tabs}
          {expandBtn}
        </div>
        {dateNav}
      </div>
      {toolbar}
      <div
        className="app-split calendar-shell grid gap-[18px] items-stretch"
        style={{ gridTemplateColumns: 'minmax(0,1.4fr) minmax(300px,1fr)' }}
      >
      {/* ── Calendar ── */}
      <div className="cal-card">
        <div className="cal-head">
          <span className="cal-head-count">
            {monthEventCount === 0
              ? isFiltering
                ? 'No matches this month'
                : 'Nothing booked this month'
              : `${monthEventCount} booking${monthEventCount === 1 ? '' : 's'}`}
          </span>
          {monthEventCount > 0 && (
            <button className="cal-viewall" onClick={() => setShowAll(true)}>
              View all
              <span className="cal-viewall-count">{monthEventCount}</span>
            </button>
          )}
        </div>

        <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
          {WEEKDAYS.map((w) => (
            <div key={w} className="cal-weekday">
              {w}
            </div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />
            const dateKey = ymd(year, month, day)
            const dayEnquiries = byDate.get(dateKey) ?? []
            const isToday = dateKey === today
            const isSelected = dateKey === selectedDay
            const count = dayEnquiries.length
            const hasEvents = count > 0
            // Dominant status drives the cell's accent colour.
            const lead = dayEnquiries.some((e) => e.status === 'new')
              ? 'new'
              : dayEnquiries.some((e) => e.status === 'contacted')
                ? 'contacted'
                : 'closed'

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDay(isSelected ? null : dateKey)}
                className={[
                  'cal-cell',
                  hasEvents && 'has-events',
                  isToday && 'is-today',
                  isSelected && 'is-selected',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ ['--cell-tone' as string]: STATUS_DOT[lead] }}
                aria-label={
                  hasEvents ? `${day}: ${count} event${count === 1 ? '' : 's'}` : String(day)
                }
              >
                <span className="cal-cell-num">{day}</span>

                {/* Count badge for multi-event days */}
                {count > 1 && <span className="cal-cell-badge">{count}</span>}

                {hasEvents && (
                  <span className="cal-cell-dots">
                    {dayEnquiries.slice(0, 3).map((e) => (
                      <span key={e.id} style={{ background: STATUS_DOT[e.status] }} />
                    ))}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-[16px] flex-wrap" style={{ paddingTop: 4 }}>
          {(['new', 'contacted', 'closed'] as const).map((s) => (
            <div key={s} className="flex items-center gap-[6px] text-[11.5px]" style={{ color: 'var(--color-neutral-400)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_DOT[s] }} />
              {STATUS_LABEL[s]}
            </div>
          ))}
        </div>
      </div>

      {/* ── Day detail: WhatsApp-style conversation ── */}
      <div className="chat-panel">
        {!selectedDay ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <div className="chat-empty-text">
              Pick a date to see its bookings.
              {monthEventCount > 0 && ' Highlighted days already have events.'}
            </div>
            {monthGrouped.length > 0 && (
              <button className="ev-jump" onClick={() => setSelectedDay(monthGrouped[0][0])}>
                Jump to first booking
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="chat-head">
              <div className="chat-head-avatar">{selectedDay.slice(-2)}</div>
              <div className="min-w-0">
                <div className="chat-head-title">{formatLongDate(selectedDay)}</div>
                <div className="chat-head-sub">
                  {selectedEnquiries.length === 0
                    ? 'No events on this date'
                    : `${selectedEnquiries.length} event${selectedEnquiries.length === 1 ? '' : 's'}`}
                </div>
              </div>
            </div>

            <div className="chat-thread calendar-day-list">
              {selectedEnquiries.length === 0 && (
                <div className="chat-daystamp">Nothing booked for this day yet</div>
              )}

              {selectedEnquiries.length > 0 && (
                <div className="chat-daystamp">{formatLongDate(selectedDay)}</div>
              )}

              {selectedEnquiries.map((e) => (
                <EnquiryBubble
                  key={e.id}
                  e={e}
                  onStatusChange={(status) => dispatch(updateEnquiryStatus({ id: e.id, status }))}
                />
              ))}
            </div>
          </>
        )}
      </div>

      </div>

      {/* ── View-all modal: every booking this month ── */}
      {showAll && (
        <div
          className="cal-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cal-modal-title"
          onClick={() => setShowAll(false)}
        >
          <div className="cal-modal" onClick={(ev) => ev.stopPropagation()}>
            <div className="cal-modal-head">
              <div className="min-w-0">
                <h5 id="cal-modal-title" className="cal-modal-title">
                  {MONTH_NAMES[month]} {year}
                </h5>
                <div className="cal-modal-sub">
                  {monthEventCount} booking{monthEventCount === 1 ? '' : 's'} ·{' '}
                  {monthGrouped.length} day{monthGrouped.length === 1 ? '' : 's'}
                </div>
              </div>
              <button
                className="cal-modal-close"
                onClick={() => setShowAll(false)}
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="cal-modal-body chat-thread">
              {monthGrouped.map(([date, list]) => (
                <div key={date} className="cal-modal-group">
                  <div className="chat-daystamp">
                    {formatLongDate(date)} · {list.length}
                  </div>
                  {list.map((e) => (
                    <EnquiryBubble
                      key={e.id}
                      e={e}
                      onStatusChange={(status) =>
                        dispatch(updateEnquiryStatus({ id: e.id, status }))
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return fullscreen ? createPortal(calendarView, document.body) : calendarView
}
