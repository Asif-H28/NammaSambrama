import { useEffect, useRef, useState } from 'react'

/**
 * Viewport-lazy image with a branded skeleton.
 *
 * CSS background-image can't be lazy-loaded by the browser, so these render as
 * real <img> elements with loading="lazy" plus an IntersectionObserver gate —
 * nothing is requested until the frame is near the viewport. Makes no API
 * calls; it only defers image bytes.
 *
 * `fallback` is a CSS background value (the generated gradient) used when a
 * record has no uploaded image or the fetch fails.
 */

/**
 * URLs whose bytes are already decoded by the browser this session.
 *
 * Remounting (switching a portfolio filter and back) would otherwise reset
 * `loaded` to false and flash a skeleton over an image that is already in
 * cache. Tracking it module-side survives unmount, so a revisit paints
 * instantly.
 */
const settled = new Set<string>()

/** True when the browser can paint this URL with no network round trip. */
function isReady(src?: string) {
  if (!src) return false
  if (settled.has(src)) return true
  // A cached image reports complete + non-zero dimensions synchronously.
  const probe = new Image()
  probe.src = src
  if (probe.complete && probe.naturalWidth > 0) {
    settled.add(src)
    return true
  }
  return false
}

export function LazyImage({
  src,
  fallback,
  alt = '',
  className = '',
  /** Start loading this many px before the frame scrolls into view. */
  rootMargin = '300px',
  eager = false,
}: {
  src?: string
  fallback: string
  alt?: string
  className?: string
  rootMargin?: string
  eager?: boolean
}) {
  const holder = useRef<HTMLDivElement>(null)

  // Cached images skip both the observer gate and the skeleton entirely
  const cached = isReady(src)

  const [visible, setVisible] = useState(eager || cached)
  const [loaded, setLoaded] = useState(cached)
  const [failed, setFailed] = useState(false)

  // Reset when the src changes (card reused for a different record)
  useEffect(() => {
    const ready = isReady(src)
    setLoaded(ready)
    setFailed(false)
    if (ready || eager) setVisible(true)
  }, [src, eager])

  useEffect(() => {
    if (eager || visible) return
    const el = holder.current
    if (!el) return

    // No observer support — just load it
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [eager, visible, rootMargin])

  const showFallback = !src || failed

  const onLoaded = () => {
    if (src) settled.add(src)
    setLoaded(true)
  }

  return (
    <div ref={holder} className={`lz ${className}`}>
      {/* Branded skeleton — only while bytes are genuinely in flight */}
      {!showFallback && !loaded && (
        <div className="lz-skeleton" aria-hidden="true">
          <span className="lz-sk-sweep" />
          <span className="lz-sk-mark">
            <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
              <circle
                className="lz-sk-ring"
                cx="50"
                cy="50"
                r="34"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="60 154"
              />
              <path
                d="M36 66V36l14 20V36"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M64 44c-1.1-2.3-3.6-3.6-6.3-3.2-2.8.4-4.4 2.2-4.3 4.4.1 2.3 2 3.3 4.8 4 2.9.7 5.2 1.6 5.4 4.4.1 2.6-2.1 4.8-5.4 5.1-3 .3-5.5-1-6.6-3.3"
                stroke="currentColor"
                strokeWidth="4.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </div>
      )}

      {showFallback ? (
        <div className="lz-fill" style={{ background: fallback }} aria-hidden="true" />
      ) : (
        visible && (
          <img
            src={src}
            alt={alt}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            className={`lz-img ${loaded ? 'is-loaded' : ''}`}
            onLoad={onLoaded}
            onError={() => setFailed(true)}
          />
        )
      )}
    </div>
  )
}
