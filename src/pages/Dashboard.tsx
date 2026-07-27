import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { goScreen } from '@/features/ui/uiSlice'
import { startEvent, startFood } from '@/features/forms/formsSlice'
import type { EventType } from '@/types'

export function Dashboard() {
  const dispatch = useAppDispatch()
  const events = useAppSelector((s) => s.catalog.events)
  const foods = useAppSelector((s) => s.catalog.foods)

  const totalDishes = foods.reduce((n, c) => n + c.dishlist.length, 0)
  const countVeg = foods.reduce((n, c) => n + c.dishlist.filter((d) => d.isVeg).length, 0)
  const countLines = events.reduce((n, e) => n + e.foodMenu.length + e.eventDesign.length, 0)
  const maxDishes = Math.max(1, ...foods.map((c) => c.dishlist.length))
  const recentEvents = events.slice(0, 5)

  const editEvent = (ev: EventType) => {
    dispatch(startEvent(ev))
    dispatch(goScreen('event-form'))
  }

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
        <div className="card elev-sm gap-[6px] p-[16px]">
          <div className="card-kicker">Menu &amp; design lines</div>
          <div style={{ font: '500 34px/1 var(--font-heading)' }}>{countLines}</div>
          <div className="card-meta">bullet points across events</div>
        </div>
      </div>

      <div className="app-split grid gap-4 mt-4 items-start" style={{ gridTemplateColumns: '1.3fr 1fr' }}>
        <div className="card elev-sm p-[16px] gap-[10px]">
          <div className="flex items-baseline justify-between">
            <h5 className="m-0">Recently updated events</h5>
            <button className="btn btn-ghost" onClick={() => dispatch(goScreen('events'))}>
              View all
            </button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Menu</th>
                <th>Design</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.map((e) => (
                <tr key={e.id}>
                  <td style={{ cursor: 'pointer' }} onClick={() => editEvent(e)}>
                    {e.eventTitle}
                  </td>
                  <td>
                    <span className="tag tag-accent">{e.eventType}</span>
                  </td>
                  <td className="text-muted">{e.foodMenu.length} lines</td>
                  <td className="text-muted">{e.eventDesign.length} lines</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card elev-sm p-[16px] gap-[12px]">
          <h5 className="m-0">Cuisine spread</h5>
          {foods.map((c) => (
            <div key={c.id} className="flex flex-col gap-[5px]">
              <div className="flex justify-between text-[12.5px]">
                <span>{c.foodType}</span>
                <span className="text-muted">{c.dishlist.length} dishes</span>
              </div>
              <div
                className="overflow-hidden"
                style={{ height: 6, borderRadius: 4, background: 'var(--color-neutral-900)' }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.round((c.dishlist.length / maxDishes) * 100)}%`,
                    borderRadius: 4,
                    background: 'linear-gradient(90deg,var(--color-accent-700),var(--color-accent-400))',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
