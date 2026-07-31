import { useEffect, useRef, useState } from 'react'

/**
 * Viewport-lazy image with a shimmer skeleton.
 *
 * CSS background-image can't be lazy-loaded by the browser, so these render as
 * real <img> elements with loading="lazy" plus an IntersectionObserver gate —
 * nothing is requested until the frame is near the viewport. Makes no API
 * calls; it only defers image bytes.
 *
 * `fallback` is a CSS background value (the generated gradient) used when a
 * record has no uploaded image or the fetch fails.
 */
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
  const [visible, setVisible] = useState(eager)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

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

  return (
    <div ref={holder} className={`lz ${className}`}>
      {/* Skeleton shimmer until the bytes land */}
      {!showFallback && !loaded && <div className="lz-skeleton" aria-hidden="true" />}

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
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        )
      )}
    </div>
  )
}
