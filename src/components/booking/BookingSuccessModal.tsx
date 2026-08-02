import { useEffect, useMemo, useState } from 'react'

/** How long the celebration stays up before returning to the public site. */
const AUTO_CLOSE_SECONDS = 6

/**
 * Full-screen celebration shown once an enquiry is accepted by the server.
 *
 * Purely presentational: the caller owns the open/closed state and decides
 * what happens on dismiss. Colours come from the public --p-* tokens so the
 * modal matches the customer site rather than the admin console.
 */
export function BookingSuccessModal({
  open,
  lang,
  eventLabel,
  contactName,
  onClose,
}: {
  open: boolean
  lang: 'en' | 'kn'
  eventLabel: string
  contactName: string
  onClose: () => void
}) {
  const [seconds, setSeconds] = useState(AUTO_CLOSE_SECONDS)

  // Confetti pieces are randomised once per mount so they don't re-shuffle
  // on every parent render.
  const confetti = useMemo(
    () =>
      Array.from({ length: 44 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2.4 + Math.random() * 1.8,
        size: 6 + Math.random() * 8,
        rotate: Math.random() * 360,
        color: [
          'var(--p-gold)',
          'var(--p-gold-light)',
          'var(--p-rose)',
          'var(--p-deep-2)',
          'var(--p-art-b)',
        ][i % 5],
        round: i % 3 === 0,
      })),
    // Re-randomise each time the modal is reopened.
    [open],
  )

  // Close on Escape while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Lock body scroll behind the modal.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Auto-dismiss (and so redirect) after a beat, for anyone who just
  // watches the celebration instead of pressing the button.
  useEffect(() => {
    if (!open) return
    setSeconds(AUTO_CLOSE_SECONDS)
    const tick = setInterval(() => setSeconds((n) => (n > 0 ? n - 1 : 0)), 1000)
    const timer = setTimeout(onClose, AUTO_CLOSE_SECONDS * 1000)
    return () => {
      clearInterval(tick)
      clearTimeout(timer)
    }
  }, [open, onClose])

  if (!open) return null

  const t = {
    title: lang === 'kn' ? 'ಬುಕಿಂಗ್ ಖಚಿತವಾಗಿದೆ!' : 'Booking confirmed!',
    sub:
      lang === 'kn'
        ? 'ನಿಮ್ಮ ವಿನಂತಿ ಸಲ್ಲಿಸಲಾಗಿದೆ. ನಾವು ಶೀಘ್ರದಲ್ಲೇ ಕರೆ ಮಾಡುತ್ತೇವೆ.'
        : 'Your enquiry has been sent. Our team will call you shortly to confirm the details.',
    done: lang === 'kn' ? 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ' : 'Back to home',
  }

  return (
    <div className="bsm-backdrop" role="dialog" aria-modal="true" aria-labelledby="bsm-title">
      {/* Confetti burst */}
      <div className="bsm-confetti" aria-hidden="true">
        {confetti.map((c) => (
          <span
            key={c.id}
            style={{
              left: `${c.left}%`,
              width: c.size,
              height: c.size * (c.round ? 1 : 1.6),
              background: c.color,
              borderRadius: c.round ? '50%' : 2,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
              transform: `rotate(${c.rotate}deg)`,
            }}
          />
        ))}
      </div>

      <div className="bsm-card">
        {/* Animated tick medallion */}
        <div className="bsm-medallion" aria-hidden="true">
          <span className="bsm-ring" />
          <span className="bsm-pulse" />
          <svg viewBox="0 0 52 52" className="bsm-check">
            <circle className="bsm-check-circle" cx="26" cy="26" r="23" />
            <path className="bsm-check-mark" d="M15 27l8 8 15-16" />
          </svg>
        </div>

        <h2 id="bsm-title" className="bsm-title">
          {t.title}
        </h2>
        <p className="bsm-sub">{t.sub}</p>

        {(eventLabel || contactName) && (
          <div className="bsm-meta">
            {eventLabel && <div className="bsm-meta-event">{eventLabel}</div>}
            {contactName && <div className="bsm-meta-name">{contactName}</div>}
          </div>
        )}

        <button type="button" className="bsm-btn" onClick={onClose}>
          {t.done}
        </button>

        <div className="bsm-redirect">
          {lang === 'kn'
            ? `${seconds} ಸೆಕೆಂಡ್‌ಗಳಲ್ಲಿ ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗುತ್ತದೆ…`
            : `Returning to the home page in ${seconds}s…`}
        </div>
      </div>
    </div>
  )
}
