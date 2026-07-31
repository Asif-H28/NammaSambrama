import { useEffect } from 'react'
import type { EventType } from '@/types'
import { ART, artFor } from '@/data/icons'
import { LazyImage } from '@/components/layout/LazyImage'
import { photoForEventType } from '@/data/eventTypePhotos'

/**
 * Full detail for one event type — the food and design lists that used to
 * crowd the public card now live here, opened on demand.
 */
export function EventDetailDialog({
  event,
  lang,
  t,
  onClose,
  onPlayVideo,
}: {
  event: EventType | null
  lang: 'en' | 'kn'
  t: (s: string) => string
  onClose: () => void
  onPlayVideo: (url: string, title: string) => void
}) {
  const kn = lang === 'kn'

  // Escape to dismiss, and stop the page behind from scrolling
  useEffect(() => {
    if (!event) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [event, onClose])

  if (!event) return null

  const typePhoto = photoForEventType(event.eventType)
  const photoSrc = event.eventImage || typePhoto || ''
  const artFallback = event.eventIcon ? ART[event.eventIcon] : artFor(event.eventTitle)

  const food = event.foodMenu.filter((l) => l.text.trim())
  const design = event.eventDesign.filter((l) => l.text.trim())

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center"
      style={{
        padding: 'clamp(12px,3vw,28px)',
        background: 'rgba(6,10,22,.72)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={event.eventTitle}
    >
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: 'min(720px,100%)',
          maxHeight: '90vh',
          borderRadius: 20,
          background: 'var(--p-card)',
          border: '1px solid color-mix(in srgb,var(--p-gold) 34%,transparent)',
          boxShadow: '0 40px 90px -30px rgba(0,0,0,.7)',
          fontFamily: "'Poppins',sans-serif",
          color: 'var(--p-text)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header image */}
        <div className="relative flex-none" style={{ aspectRatio: '16 / 7' }}>
          <LazyImage src={photoSrc} fallback={artFallback} alt={event.eventTitle} eager />
          <div
            className="absolute inset-x-0 bottom-0"
            style={{ height: 130, background: 'linear-gradient(transparent,rgba(8,17,40,.86))' }}
          />

          <button
            onClick={onClose}
            aria-label={kn ? 'ಮುಚ್ಚಿ' : 'Close'}
            className="absolute grid place-items-center"
            style={{
              right: 12,
              top: 12,
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,.28)',
              background: 'rgba(8,17,40,.6)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
              backdropFilter: 'blur(4px)',
            }}
          >
            ×
          </button>

          <div className="absolute" style={{ left: 'clamp(18px,4vw,28px)', bottom: 18, right: 18 }}>
            <span
              className="inline-block uppercase"
              style={{
                font: "600 9.5px/1 'Poppins',sans-serif",
                letterSpacing: '.14em',
                padding: '5px 11px',
                borderRadius: 999,
                background: 'rgba(8,17,40,.72)',
                color: 'var(--p-gold-light)',
                border: '1px solid color-mix(in srgb,var(--p-gold) 42%,transparent)',
              }}
            >
              {t(event.eventType)}
            </span>
            <h2
              style={{
                margin: '10px 0 0',
                font: "700 clamp(21px,3.2vw,28px)/1.2 'Playfair Display',serif",
                color: '#fff',
                textShadow: '0 2px 12px rgba(0,0,0,.5)',
              }}
            >
              {t(event.eventTitle)}
            </h2>
          </div>
        </div>

        {/* Scrollable body */}
        <div
          className="flex-1 min-h-0"
          style={{ overflowY: 'auto', padding: 'clamp(20px,4vw,28px)' }}
        >
          {event.eventDescription && (
            <p style={{ margin: '0 0 22px', fontSize: 14.5, lineHeight: 1.75, color: 'var(--p-muted)' }}>
              {t(event.eventDescription)}
            </p>
          )}

          <div
            className="grid"
            style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 24 }}
          >
            {food.length > 0 && (
              <DetailList
                label={kn ? 'ಆಹಾರ' : 'Food & Catering'}
                items={food.map((l) => t(l.text))}
                dot="var(--p-rose)"
              />
            )}
            {design.length > 0 && (
              <DetailList
                label={kn ? 'ವಿನ್ಯಾಸ' : 'Décor & Design'}
                items={design.map((l) => t(l.text))}
                dot="var(--p-gold-dark)"
              />
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div
          className="flex flex-wrap items-center gap-[10px] flex-none"
          style={{
            padding: 'clamp(14px,3vw,18px) clamp(20px,4vw,28px)',
            borderTop: '1px solid color-mix(in srgb,var(--p-deep) 12%,transparent)',
            background: 'color-mix(in srgb,var(--p-gold) 6%,transparent)',
          }}
        >
          <a
            href="/book"
            className="flex items-center gap-[8px]"
            style={{
              padding: '13px 24px',
              borderRadius: 999,
              background: 'linear-gradient(150deg,var(--p-deep),var(--p-deeper))',
              color: 'var(--p-gold-light)',
              font: "700 13.5px/1 'Poppins',sans-serif",
              textDecoration: 'none',
            }}
          >
            {kn ? 'ಇದನ್ನು ಬುಕ್ ಮಾಡಿ' : 'Enquire About This'}
            <span style={{ fontSize: 15 }}>→</span>
          </a>

          {event.eventVideo && (
            <button
              onClick={() => onPlayVideo(event.eventVideo, event.eventTitle)}
              style={{
                padding: '13px 22px',
                borderRadius: 999,
                cursor: 'pointer',
                border: '1.3px solid color-mix(in srgb,var(--p-deep) 30%,transparent)',
                background: 'transparent',
                color: 'var(--p-deep)',
                font: "600 13px/1 'Poppins',sans-serif",
              }}
            >
              ▶ {kn ? 'ಚಿತ್ರ ನೋಡಿ' : 'Watch film'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function DetailList({ label, items, dot }: { label: string; items: string[]; dot: string }) {
  return (
    <div>
      <p
        className="uppercase"
        style={{
          margin: '0 0 12px',
          font: "600 10px/1 'Poppins',sans-serif",
          letterSpacing: '.16em',
          color: 'var(--p-gold-dark)',
        }}
      >
        {label}
      </p>
      <ul className="list-none m-0 p-0 flex flex-col gap-[9px]">
        {items.map((text, i) => (
          <li
            key={i}
            className="relative"
            style={{ paddingLeft: 16, fontSize: 13.5, lineHeight: 1.55 }}
          >
            <span
              className="absolute rounded-full"
              style={{ left: 0, top: 7, width: 5, height: 5, background: dot }}
            />
            {text}
          </li>
        ))}
      </ul>
    </div>
  )
}
