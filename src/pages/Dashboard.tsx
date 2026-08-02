import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { EventCalendar } from '@/components/dashboard/EventCalendar'
import { fetchEvents, fetchFoods } from '@/features/catalog/catalogThunks'
import { fetchEnquiries } from '@/features/enquiries/enquiriesThunks'

type StatTone = 'accent' | 'accent-2' | 'veg' | 'neutral'

function StatIcon({ name }: { name: string }) {
  const props = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (name) {
    case 'inbox':
      return (
        <svg {...props}>
          <path d="M22 12h-6l-2 3h-4l-2-3H2" />
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      )
    case 'cuisine':
      return (
        <svg {...props}>
          <path d="M6 3v8a2 2 0 0 0 2 2v8M6 3v18M18 3c-2 0-3 2-3 5s1 4 3 4v10" />
        </svg>
      )
    default:
      return (
        <svg {...props}>
          <path d="M12 3a9 9 0 1 0 9 9H12V3z" />
          <path d="M15.5 3.5A9 9 0 0 1 20.5 8.5" />
        </svg>
      )
  }
}

function StatTile({
  kicker,
  value,
  meta,
  icon,
  tone,
}: {
  kicker: string
  value: number
  meta: string
  icon: string
  tone: StatTone
}) {
  return (
    <div className={`dash-stat dash-stat--${tone}`}>
      <div className="dash-stat-top">
        <span className="dash-stat-kicker">{kicker}</span>
        <span className="dash-stat-icon">
          <StatIcon name={icon} />
        </span>
      </div>
      <div className="dash-stat-value">{value}</div>
      <div className="dash-stat-meta">{meta}</div>
      <span className="dash-stat-glow" aria-hidden="true" />
    </div>
  )
}

export function Dashboard() {
  const dispatch = useAppDispatch()
  const events = useAppSelector((s) => s.catalog.events)
  const foods = useAppSelector((s) => s.catalog.foods)
  const enquiries = useAppSelector((s) => s.enquiries.items)
  const eventsLoaded = useAppSelector((s) => s.catalog.eventsLoaded)
  const foodsLoaded = useAppSelector((s) => s.catalog.foodsLoaded)
  const enquiriesLoaded = useAppSelector((s) => s.enquiries.loaded)

  useEffect(() => {
    if (!eventsLoaded) dispatch(fetchEvents())
    if (!foodsLoaded) dispatch(fetchFoods())
    if (!enquiriesLoaded) dispatch(fetchEnquiries())
  }, [eventsLoaded, foodsLoaded, enquiriesLoaded, dispatch])

  const totalDishes = foods.reduce((n, c) => n + c.dishlist.length, 0)
  const countVeg = foods.reduce((n, c) => n + c.dishlist.filter((d) => d.isVeg).length, 0)
  const newEnquiries = enquiries.filter((e) => e.status === 'new').length

  return (
    <div className="animate-rise dash">
      {/* ── Stats ── */}
      <section className="dash-stats">
        <StatTile
          kicker="New enquiries"
          value={newEnquiries}
          meta={`${enquiries.length} total, all time`}
          icon="inbox"
          tone="accent"
        />
        <StatTile
          kicker="Event types"
          value={events.length}
          meta="live on the public grid"
          icon="calendar"
          tone="accent-2"
        />
        <StatTile
          kicker="Food categories"
          value={foods.length}
          meta="cuisines in the menu"
          icon="cuisine"
          tone="neutral"
        />
        <StatTile
          kicker="Dishes"
          value={totalDishes}
          meta={`${countVeg} pure veg`}
          icon="dish"
          tone="veg"
        />
      </section>

      {/* ── Calendar ── */}
      <section className="dash-panel">
        <div className="dash-panel-head">
          <h3 className="dash-panel-title">Bookings calendar</h3>
          <span className="dash-panel-hint">Select a date to see its events</span>
        </div>
        <EventCalendar enquiries={enquiries} />
      </section>
    </div>
  )
}
