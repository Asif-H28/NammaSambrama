import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { goScreen, setQuery, showToast } from '@/features/ui/uiSlice'
import { startEvent } from '@/features/forms/formsSlice'
import { fetchEvents, removeEvent } from '@/features/catalog/catalogThunks'
import { EventIcon, ART, artFor } from '@/data/icons'
import { Input } from '@/components/ui/input'
import type { EventType } from '@/types'

export function EventTypes() {
  const dispatch = useAppDispatch()
  const events = useAppSelector((s) => s.catalog.events)
  const query = useAppSelector((s) => s.ui.query)
  const loading = useAppSelector((s) => s.catalog.loading)
  const eventsLoaded = useAppSelector((s) => s.catalog.eventsLoaded)

  useEffect(() => {
    if (!eventsLoaded) dispatch(fetchEvents())
  }, [eventsLoaded, dispatch])

  const q = query.trim().toLowerCase()
  const filtered = events.filter(
    (e) => !q || `${e.eventTitle} ${e.eventType} ${e.eventDescription}`.toLowerCase().includes(q),
  )

  const editEvent = (ev: EventType) => {
    dispatch(startEvent(ev))
    dispatch(goScreen('event-form'))
  }

  const thumbBg = (e: EventType) =>
    e.eventImage
      ? `center/cover no-repeat url(${e.eventImage})`
      : e.eventIcon
        ? ART[e.eventIcon]
        : artFor(e.eventTitle)

  return (
    <div className="animate-rise">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-[18px]">
        <div>
          <div className="text-[11px] uppercase" style={{ letterSpacing: '.12em', color: 'var(--color-accent)' }}>
            Catalogue
          </div>
          <h2 style={{ margin: '4px 0 2px', fontSize: 30 }}>Event Types</h2>
          <p className="text-muted m-0 text-[13px]">{events.length} types shown to customers, newest first.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            dispatch(startEvent())
            dispatch(goScreen('event-form'))
          }}
        >
          + Add event type
        </button>
      </div>

      <div className="field mb-[14px]" style={{ maxWidth: 340 }}>
        <Input
          placeholder="Search title, type or description…"
          value={query}
          onChange={(e) => dispatch(setQuery(e.target.value))}
        />
      </div>

      <div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
        {filtered.map((e) => (
          <article key={e.id} className="card elev-sm p-0 overflow-hidden gap-0">
            <div className="relative" style={{ height: 116, background: thumbBg(e) }}>
              <span
                className="absolute uppercase"
                style={{
                  left: 10,
                  top: 10,
                  padding: '3px 9px',
                  borderRadius: 6,
                  background: 'var(--t-scrim)',
                  fontSize: 10.5,
                  letterSpacing: '.08em',
                  color: 'var(--color-accent-300)',
                }}
              >
                {e.eventType || 'Untyped'}
              </span>
              <span
                className="absolute grid place-items-center"
                style={{
                  right: 10,
                  bottom: 10,
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: 'var(--t-scrim)',
                  color: 'var(--color-accent-300)',
                }}
              >
                <EventIcon name={e.eventIcon} />
              </span>
            </div>
            <div className="flex flex-col gap-[7px] p-[13px_14px]">
              <div className="card-title">{e.eventTitle}</div>
              <p className="card-body m-0 text-[12.5px] leading-[1.5]">{e.eventDescription || '—'}</p>
              <div className="flex gap-[6px] flex-wrap">
                <span className="tag tag-neutral">{e.foodMenu.length} menu lines</span>
                <span className="tag tag-neutral">{e.eventDesign.length} design lines</span>
                {e.eventVideo && <span className="tag tag-outline">Video</span>}
              </div>
              <div
                className="flex gap-[6px] mt-1 pt-[9px]"
                style={{ borderTop: '1px solid var(--color-divider)' }}
              >
                <button className="btn btn-secondary flex-1" onClick={() => editEvent(e)}>
                  Edit
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ color: 'var(--t-danger)' }}
                  onClick={() => {
                    dispatch(removeEvent(e.id))
                    dispatch(showToast('Event type removed from the public site'))
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {loading && events.length === 0 && (
        <p className="text-muted text-center" style={{ padding: '34px 0' }}>
          Loading event types…
        </p>
      )}
      {!loading && filtered.length === 0 && (
        <p className="text-muted text-center" style={{ padding: '34px 0' }}>
          {events.length === 0 ? 'No event types yet — create your first one.' : 'No event types match that search.'}
        </p>
      )}
    </div>
  )
}
