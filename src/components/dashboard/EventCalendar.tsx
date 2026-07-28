import { useMemo, useState } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { setEnquiryStatus } from '@/features/enquiries/enquiriesSlice'
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

const STATUS_TAG: Record<Enquiry['status'], string> = {
  new: 'tag-accent',
  contacted: 'tag-accent-2',
  closed: 'tag-neutral',
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

export function EventCalendar({ enquiries }: { enquiries: Enquiry[] }) {
  const dispatch = useAppDispatch()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const byDate = useMemo(() => {
    const map = new Map<string, Enquiry[]>()
    enquiries.forEach((e) => {
      if (!e.eventDate) return
      const list = map.get(e.eventDate) ?? []
      list.push(e)
      map.set(e.eventDate, list)
    })
    return map
  }, [enquiries])

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
  const monthNewCount = monthEnquiries.filter((e) => e.status === 'new').length
  const monthContactedCount = monthEnquiries.filter((e) => e.status === 'contacted').length
  const monthClosedCount = monthEnquiries.filter((e) => e.status === 'closed').length

  const selectedEnquiries = selectedDay ? byDate.get(selectedDay) ?? [] : []

  return (
    <div
      className="app-split calendar-shell grid gap-[18px] items-stretch"
      style={{ gridTemplateColumns: 'minmax(0,1.4fr) minmax(280px,1fr)' }}
    >
      <div
        className="card elev-sm p-[20px] gap-[16px]"
        style={{ background: 'linear-gradient(160deg,var(--color-surface),var(--color-neutral-900) 130%)' }}
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h5 className="m-0" style={{ fontSize: 19 }}>
              {MONTH_NAMES[month]} {year}
            </h5>
            <div className="flex items-center gap-[10px] flex-wrap" style={{ marginTop: 4 }}>
              <span
                className="tag"
                style={{ background: 'color-mix(in srgb,var(--color-accent) 16%,transparent)', color: 'var(--color-accent-300)', fontWeight: 600 }}
              >
                {monthEventCount} booked
              </span>
              {monthEventCount > 0 && (
                <span className="text-muted" style={{ fontSize: 11.5 }}>
                  {monthNewCount} new · {monthContactedCount} contacted · {monthClosedCount} closed
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-[6px] flex-wrap">
            <button className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={goToday}>
              Today
            </button>
            <button
              className="btn btn-secondary btn-icon"
              aria-label="Previous month"
              onClick={goPrevMonth}
              style={{ width: 32, height: 32 }}
            >
              ‹
            </button>
            <select
              value={month}
              onChange={(e) => {
                setMonth(Number(e.target.value))
                setSelectedDay(null)
              }}
              className="input"
              style={{ padding: '6px 8px', minHeight: 32, fontSize: 12.5, width: 'auto' }}
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={i}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => {
                setYear(Number(e.target.value))
                setSelectedDay(null)
              }}
              className="input"
              style={{ padding: '6px 8px', minHeight: 32, fontSize: 12.5, width: 'auto' }}
            >
              {Array.from({ length: 8 }, (_, i) => now.getFullYear() - 2 + i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button
              className="btn btn-secondary btn-icon"
              aria-label="Next month"
              onClick={goNextMonth}
              style={{ width: 32, height: 32 }}
            >
              ›
            </button>
          </div>
        </div>

        <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="text-center uppercase"
              style={{ fontSize: 10.5, letterSpacing: '.08em', color: 'var(--color-neutral-500)', padding: '2px 0 8px', fontWeight: 600 }}
            >
              {w}
            </div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />
            const dateKey = ymd(year, month, day)
            const dayEnquiries = byDate.get(dateKey) ?? []
            const isToday = dateKey === today
            const isSelected = dateKey === selectedDay
            const hasEvents = dayEnquiries.length > 0
            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDay(isSelected ? null : dateKey)}
                className="calendar-cell flex flex-col items-center justify-center"
                style={{
                  aspectRatio: '1',
                  width: '100%',
                  borderRadius: 12,
                  cursor: 'pointer',
                  transition: 'transform .12s ease, box-shadow .12s ease',
                  border: isSelected
                    ? '2px solid var(--color-accent)'
                    : isToday
                      ? '1.5px solid color-mix(in srgb,var(--color-accent) 55%,transparent)'
                      : '1px solid transparent',
                  background: isSelected
                    ? 'linear-gradient(160deg,color-mix(in srgb,var(--color-accent) 30%,transparent),color-mix(in srgb,var(--color-accent) 12%,transparent))'
                    : hasEvents
                      ? 'var(--color-neutral-900)'
                      : 'transparent',
                  boxShadow: isSelected ? '0 6px 16px -8px color-mix(in srgb,var(--color-accent) 60%,transparent)' : 'none',
                }}
              >
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: isToday || isSelected ? 700 : 500,
                    color: isSelected ? 'var(--color-accent-100)' : isToday ? 'var(--color-accent-300)' : 'var(--color-text)',
                  }}
                >
                  {day}
                </span>
                {hasEvents && (
                  <span
                    className="flex items-center gap-[3px]"
                    style={{ marginTop: 3 }}
                    aria-label={`${dayEnquiries.length} event${dayEnquiries.length === 1 ? '' : 's'}`}
                  >
                    {dayEnquiries.slice(0, 4).map((e) => (
                      <span
                        key={e.id}
                        style={{ width: 5.5, height: 5.5, borderRadius: '50%', background: STATUS_DOT[e.status] }}
                      />
                    ))}
                    {dayEnquiries.length > 4 && (
                      <span style={{ fontSize: 8.5, color: 'var(--color-neutral-500)', fontWeight: 700 }}>
                        +{dayEnquiries.length - 4}
                      </span>
                    )}
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

      <div className="card elev-sm p-[18px] gap-[12px]" style={{ height: '100%', minHeight: 320, overflow: 'hidden' }}>
        {!selectedDay ? (
          <div className="flex flex-col items-center justify-center text-center gap-[8px]" style={{ padding: '40px 12px', flex: 1 }}>
            <div
              className="grid place-items-center"
              style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-neutral-900)', fontSize: 20 }}
            >
              📅
            </div>
            <div className="text-[13.5px]" style={{ color: 'var(--color-neutral-400)' }}>
              Select a date on the calendar to see its events.
            </div>
          </div>
        ) : (
          <>
            <div>
              <h5 className="m-0" style={{ fontSize: 15.5 }}>
                {formatLongDate(selectedDay)}
              </h5>
              <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>
                {selectedEnquiries.length === 0
                  ? 'No events on this date'
                  : `${selectedEnquiries.length} event${selectedEnquiries.length === 1 ? '' : 's'}`}
              </div>
            </div>

            <div
              className="calendar-day-list flex flex-col gap-[10px]"
              style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: 4 }}
            >
              {selectedEnquiries.length === 0 && (
                <div className="text-muted text-[13px]" style={{ padding: '8px 0' }}>
                  Nothing booked for this day yet.
                </div>
              )}
              {selectedEnquiries.map((e) => (
                <div
                  key={e.id}
                  className="flex flex-col gap-[10px]"
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: 'var(--color-neutral-900)',
                    border: '1px solid var(--color-divider)',
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold" style={{ fontSize: 14.5 }}>
                        {e.eventLabel}
                      </div>
                      {e.eventTime && (
                        <div className="text-muted" style={{ fontSize: 12 }}>
                          🕐 {e.eventTime}
                        </div>
                      )}
                    </div>
                    <select
                      className={`tag ${STATUS_TAG[e.status]} flex-none`}
                      style={{ border: 0, cursor: 'pointer', font: 'inherit' }}
                      value={e.status}
                      onChange={(ev) => dispatch(setEnquiryStatus({ id: e.id, status: ev.target.value as Enquiry['status'] }))}
                    >
                      {(['new', 'contacted', 'closed'] as const).map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div
                    className="grid gap-[8px] text-[12.5px]"
                    style={{ gridTemplateColumns: '1fr 1fr', paddingTop: 10, borderTop: '1px solid var(--color-divider)' }}
                  >
                    <div>
                      <div className="text-muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                        Guests
                      </div>
                      <div>{e.guestCount || '—'}</div>
                    </div>
                    <div>
                      <div className="text-muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                        Items
                      </div>
                      <div>{e.items.length}</div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div className="text-muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                        Contact
                      </div>
                      <div>{e.contactName}</div>
                      <div className="text-muted" style={{ fontSize: 11.5 }}>
                        {e.contactPhone}
                      </div>
                    </div>
                    {e.items.length > 0 && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div className="text-muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                          Menu
                        </div>
                        <div className="text-muted" style={{ fontSize: 12, lineHeight: 1.5 }}>
                          {e.items.map((it) => it.name).join(', ')}
                        </div>
                      </div>
                    )}
                    {e.contactNotes && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div className="text-muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                          Notes
                        </div>
                        <div className="text-muted" style={{ fontSize: 12, lineHeight: 1.5 }}>
                          {e.contactNotes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
