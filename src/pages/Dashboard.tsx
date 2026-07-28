import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { goScreen } from '@/features/ui/uiSlice'
import { startEvent, startFood } from '@/features/forms/formsSlice'
import { EventCalendar } from '@/components/dashboard/EventCalendar'

export function Dashboard() {
  const dispatch = useAppDispatch()
  const events = useAppSelector((s) => s.catalog.events)
  const foods = useAppSelector((s) => s.catalog.foods)
  const enquiries = useAppSelector((s) => s.enquiries.items)

  const totalDishes = foods.reduce((n, c) => n + c.dishlist.length, 0)
  const countVeg = foods.reduce((n, c) => n + c.dishlist.filter((d) => d.isVeg).length, 0)
  const newEnquiries = enquiries.filter((e) => e.status === 'new').length

  return (
    <div className="animate-rise">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-[22px]">
        <div>
          <div className="text-[11px] uppercase" style={{ letterSpacing: '.12em', color: 'var(--color-accent)' }}>
            Overview
          </div>
          <h2 style={{ margin: '4px 0 2px', fontSize: 30 }}>Good evening, Suresh</h2>
          <p className="text-muted m-0 text-[13px]">
            Everything you publish here appears on the customer site immediately.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => {
              dispatch(startFood())
              dispatch(goScreen('food-form'))
            }}
          >
            + Food category
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              dispatch(startEvent())
              dispatch(goScreen('event-form'))
            }}
          >
            + Event type
          </button>
        </div>
      </div>

      <div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))' }}>
        <div
          className="card elev-sm gap-[6px] p-[16px]"
          style={{ background: 'linear-gradient(160deg,var(--color-accent-900),var(--color-surface) 65%)' }}
        >
          <div className="card-kicker">New enquiries</div>
          <div style={{ font: '500 34px/1 var(--font-heading)' }}>{newEnquiries}</div>
          <div className="card-meta">{enquiries.length} total, all time</div>
        </div>
        <div className="card elev-sm gap-[6px] p-[16px]">
          <div className="card-kicker">Event types</div>
          <div style={{ font: '500 34px/1 var(--font-heading)' }}>{events.length}</div>
          <div className="card-meta">live on the public grid</div>
        </div>
        <div className="card elev-sm gap-[6px] p-[16px]">
          <div className="card-kicker">Food categories</div>
          <div style={{ font: '500 34px/1 var(--font-heading)' }}>{foods.length}</div>
          <div className="card-meta">cuisines in the menu</div>
        </div>
        <div className="card elev-sm gap-[6px] p-[16px]">
          <div className="card-kicker">Dishes</div>
          <div style={{ font: '500 34px/1 var(--font-heading)' }}>{totalDishes}</div>
          <div className="card-meta">{countVeg} pure veg</div>
        </div>
      </div>

      <div className="mt-4">
        <EventCalendar enquiries={enquiries} />
      </div>
    </div>
  )
}
