import { useEffect, useState } from 'react'

/**
 * Luxury reveal splash for the public site.
 *
 * Staged choreography rather than a single looping spinner:
 *   0.0s  gold dust rises, spotlight blooms
 *   0.3s  monogram strokes draw themselves on
 *   1.0s  medallion ring sweeps closed, gold flare
 *   1.3s  wordmark slides up behind a wipe, tagline follows
 *   exit  navy curtains part vertically to reveal the page
 */
export function PublicLoader({ lang = 'en' }: { lang?: 'en' | 'kn' }) {
  const kn = lang === 'kn'
  const [stage, setStage] = useState(0)

  // Drive the staged reveal
  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 1000)
    const t2 = setTimeout(() => setStage(2), 1500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  // Deterministic sparkle field — avoids re-randomising on re-render
  const dust = Array.from({ length: 26 }, (_, i) => ({
    left: (i * 37.6) % 100,
    delay: (i % 13) * 0.42,
    dur: 5.5 + ((i * 7) % 5),
    size: i % 4 === 0 ? 3 : i % 3 === 0 ? 2 : 1.5,
    drift: ((i % 5) - 2) * 22,
  }))

  return (
    <div className="nsl-root">
      {/* Deep stage with vignette */}
      <div className="nsl-stage" />
      <div className="nsl-vignette" />

      {/* Overhead spotlight cone */}
      <div className="nsl-spot" />

      {/* Rising gold dust */}
      <div className="nsl-dust">
        {dust.map((d, i) => (
          <span
            key={i}
            style={{
              left: `${d.left}%`,
              width: d.size,
              height: d.size,
              animationDelay: `${d.delay}s`,
              animationDuration: `${d.dur}s`,
              ['--drift' as string]: `${d.drift}px`,
            }}
          />
        ))}
      </div>

      {/* Silk sheen sweeping across the stage */}
      <div className="nsl-silk" />

      <div className="nsl-center">
        {/* ── Medallion ── */}
        <div className="nsl-medallion">
          {/* Outer ring draws itself closed */}
          <svg className="nsl-ring-svg" viewBox="0 0 200 200" fill="none">
            <defs>
              <linearGradient id="nslGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f9edbe" />
                <stop offset="45%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#9c7526" />
              </linearGradient>
            </defs>

            {/* Faint guide ring */}
            <circle cx="100" cy="100" r="88" stroke="#d4af37" strokeWidth="0.7" opacity="0.16" />

            {/* Drawn ring */}
            <circle
              className="nsl-ring-draw"
              cx="100"
              cy="100"
              r="88"
              stroke="url(#nslGold)"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Laurel ticks fade in */}
            {Array.from({ length: 36 }).map((_, i) => {
              const a = (i / 36) * Math.PI * 2
              return (
                <line
                  key={i}
                  className="nsl-tick"
                  x1={100 + Math.cos(a) * 78}
                  y1={100 + Math.sin(a) * 78}
                  x2={100 + Math.cos(a) * 83}
                  y2={100 + Math.sin(a) * 83}
                  stroke="#d4af37"
                  strokeWidth="1.1"
                  style={{ animationDelay: `${0.9 + i * 0.012}s` }}
                />
              )
            })}

            {/* Comet tracing the rim */}
            <circle className="nsl-comet" cx="100" cy="12" r="2.6" fill="#f9edbe" />
          </svg>

          {/* Monogram: strokes draw on, then fill settles */}
          <svg className="nsl-mono" viewBox="0 0 100 100" fill="none">
            <path
              className="nsl-draw nsl-draw-n"
              d="M30 68V33l19 26V33"
              stroke="url(#nslGold)"
              strokeWidth="5.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="nsl-draw nsl-draw-s"
              d="M70 40.5c-1.6-3.4-5.2-5.2-9.2-4.6-4 .6-6.4 3.2-6.2 6.4.2 3.4 3 4.8 7 5.8 4.2 1 7.6 2.4 7.8 6.4.2 3.8-3 7-7.8 7.4-4.4.4-8-1.4-9.6-4.8"
              stroke="url(#nslGold)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              className="nsl-flourish"
              d="M36 76h28"
              stroke="url(#nslGold)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <circle className="nsl-flourish" cx="50" cy="76" r="2.2" fill="url(#nslGold)" />
          </svg>

          {/* Flare at ring closure */}
          <div className={`nsl-flare ${stage >= 1 ? 'is-on' : ''}`} />
        </div>

        {/* ── Wordmark ── */}
        <div className="nsl-word-mask">
          <div className={`nsl-word ${stage >= 1 ? 'is-in' : ''}`}>ನಮ್ಮ ಸಂಭ್ರಮ</div>
        </div>

        {/* Rule + EVENTS */}
        <div className={`nsl-rule ${stage >= 1 ? 'is-in' : ''}`}>
          <span />
          <em>{kn ? 'ಈವೆಂಟ್ಸ್' : 'EVENTS'}</em>
          <span />
        </div>

        {/* Tagline */}
        <p className={`nsl-tag ${stage >= 2 ? 'is-in' : ''}`}>
          {kn ? 'ನಿಮ್ಮ ಆಚರಣೆ ಸಿದ್ಧವಾಗುತ್ತಿದೆ' : 'Setting the celebration'}
          <b>.</b>
          <b>.</b>
          <b>.</b>
        </p>
      </div>

      {/* Curtain panels — sit at the edges, part on unmount via CSS */}
      <div className="nsl-curtain nsl-curtain-l" />
      <div className="nsl-curtain nsl-curtain-r" />
    </div>
  )
}
