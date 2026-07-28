import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { closePreview } from '@/features/ui/uiSlice'
import { commitEvent, commitFood } from '@/features/forms/formsThunks'
import { artFor, ART } from '@/data/icons'

export function PreviewDialog() {
  const dispatch = useAppDispatch()
  const previewOpen = useAppSelector((s) => s.ui.previewOpen)
  const screen = useAppSelector((s) => s.ui.screen)
  const f = useAppSelector((s) => s.forms.event)
  const g = useAppSelector((s) => s.forms.food)

  if (!previewOpen) return null

  const isEventForm = screen === 'event-form'

  const artStyle = f.eventImage
    ? `center/cover no-repeat url(${f.eventImage})`
    : f.eventIcon
      ? ART[f.eventIcon]
      : artFor(f.eventTitle || 'event')

  const publish = () => {
    if (isEventForm) dispatch(commitEvent())
    else dispatch(commitFood())
  }

  return (
    <div
      className="dialog-backdrop"
      style={{ background: 'color-mix(in srgb,var(--color-bg) 78%,transparent)', backdropFilter: 'blur(3px)' }}
    >
      <div className="dialog" style={{ width: 'min(760px,100%)', maxHeight: '88vh', overflow: 'auto' }}>
        <div className="flex items-center gap-[10px]">
          <div className="dialog-title flex-1">Before you publish</div>
          <button className="btn btn-secondary btn-icon" onClick={() => dispatch(closePreview())}>
            ×
          </button>
        </div>
        <p className="dialog-body m-0">This is exactly what customers will see on the public site.</p>
        <div
          className="overflow-hidden p-[18px]"
          style={{ borderRadius: 'var(--radius-md)', background: 'var(--p-bg)' }}
        >
          {isEventForm ? (
            <article
              className="overflow-hidden mx-auto"
              style={{
                background: 'var(--p-card)',
                borderRadius: 14,
                border: '1px solid color-mix(in srgb,var(--p-deep) 12%,transparent)',
                maxWidth: 380,
                fontFamily: "'Poppins',sans-serif",
                color: 'var(--p-text)',
              }}
            >
              <div style={{ height: 6, background: 'linear-gradient(90deg,var(--p-gold-dark),var(--p-gold))' }} />
              <div style={{ position: 'relative', height: 128, background: artStyle }} />
              <div style={{ padding: '16px 18px 10px' }}>
                <span
                  className="inline-block uppercase mb-[6px]"
                  style={{
                    font: "600 9.5px/1 'Poppins',sans-serif",
                    letterSpacing: '.1em',
                    padding: '4px 9px',
                    borderRadius: 999,
                    background: 'color-mix(in srgb,var(--p-rose) 20%,transparent)',
                    color: 'var(--p-rose)',
                  }}
                >
                  {f.eventType || 'Event type'}
                </span>
                <h3 style={{ margin: 0, font: "700 18px/1.25 'Playfair Display',serif", color: 'var(--p-deep)' }}>
                  {f.eventTitle || 'Your event title appears here'}
                </h3>
                <p style={{ margin: '5px 0 0', fontSize: 13, lineHeight: 1.5, color: 'var(--p-muted)' }}>
                  {f.eventDescription || 'The description you write shows up right here on the card.'}
                </p>
              </div>
              <div
                className="grid grid-cols-2"
                style={{ borderTop: '1px solid color-mix(in srgb,var(--p-deep) 10%,transparent)' }}
              >
                <div style={{ padding: '14px 16px' }}>
                  <p
                    className="uppercase"
                    style={{ margin: '0 0 7px', font: "600 10.5px/1 'Poppins',sans-serif", letterSpacing: '.08em', color: 'var(--p-muted)' }}
                  >
                    Food
                  </p>
                  <ul className="list-none m-0 p-0 flex flex-col gap-[5px]">
                    {f.foodMenu.filter((l) => l.text.trim()).map((l) => (
                      <li key={l.id} style={{ fontSize: 12.5, color: 'var(--p-text)' }}>{l.text}</li>
                    ))}
                  </ul>
                </div>
                <div style={{ padding: '14px 16px', borderLeft: '1px solid color-mix(in srgb,var(--p-deep) 10%,transparent)' }}>
                  <p
                    className="uppercase"
                    style={{ margin: '0 0 7px', font: "600 10.5px/1 'Poppins',sans-serif", letterSpacing: '.08em', color: 'var(--p-muted)' }}
                  >
                    Design
                  </p>
                  <ul className="list-none m-0 p-0 flex flex-col gap-[5px]">
                    {f.eventDesign.filter((l) => l.text.trim()).map((l) => (
                      <li key={l.id} style={{ fontSize: 12.5, color: 'var(--p-text)' }}>{l.text}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ) : (
            <div style={{ fontFamily: "'Poppins',sans-serif", color: 'var(--p-text)' }}>
              <h3 style={{ margin: '0 0 12px', font: "700 19px/1.2 'Playfair Display',serif", color: 'var(--p-deep)' }}>
                {g.foodType || 'Food category'}
              </h3>
              <div className="grid gap-[10px]" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))' }}>
                {g.dishlist.filter((d) => d.dishName.trim()).map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-[9px]"
                    style={{
                      background: 'var(--p-card)',
                      border: '1px solid color-mix(in srgb,var(--p-deep) 12%,transparent)',
                      borderRadius: 11,
                      padding: '9px 11px',
                    }}
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        flex: 'none',
                        borderRadius: 2,
                        border: `1.6px solid ${d.isVeg ? 'var(--p-veg)' : 'var(--p-nonveg)'}`,
                        background: `radial-gradient(circle,${d.isVeg ? 'var(--p-veg)' : 'var(--p-nonveg)'} 34%,transparent 36%)`,
                      }}
                    />
                    <span className="font-semibold" style={{ fontSize: 13 }}>{d.dishName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={() => dispatch(closePreview())}>
            Keep editing
          </button>
          <button className="btn btn-primary" onClick={publish}>
            Publish now
          </button>
        </div>
      </div>
    </div>
  )
}
