/**
 * NammaSambrama monogram — interlocking N and S inside a gold medallion.
 * Pure SVG so it scales cleanly and needs no asset hosting.
 */
export function NSLogo({
  size = 64,
  showRing = true,
}: {
  size?: number
  showRing?: boolean
}) {
  const id = `ns-${size}-${showRing ? 'r' : 'p'}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      role="img"
      aria-label="Namma Sambrama"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f6e6a8" />
          <stop offset="45%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#a9812e" />
        </linearGradient>
        <linearGradient id={`${id}-deep`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1b2e5c" />
          <stop offset="100%" stopColor="#081128" />
        </linearGradient>
      </defs>

      {showRing && (
        <>
          {/* Outer medallion */}
          <circle cx="50" cy="50" r="47" fill={`url(#${id}-deep)`} />
          <circle cx="50" cy="50" r="47" stroke={`url(#${id}-gold)`} strokeWidth="2" />
          <circle cx="50" cy="50" r="41" stroke={`url(#${id}-gold)`} strokeWidth="0.8" opacity="0.5" />

          {/* Laurel ticks around the rim */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i / 24) * Math.PI * 2
            const inner = 41.5
            const outer = 44.5
            return (
              <line
                key={i}
                x1={50 + Math.cos(angle) * inner}
                y1={50 + Math.sin(angle) * inner}
                x2={50 + Math.cos(angle) * outer}
                y2={50 + Math.sin(angle) * outer}
                stroke={`url(#${id}-gold)`}
                strokeWidth="1"
                opacity={i % 2 === 0 ? 0.75 : 0.3}
              />
            )
          })}
        </>
      )}

      {/* N — left stroke, diagonal, right stroke */}
      <path
        d="M30 68V33l19 26V33"
        stroke={`url(#${id}-gold)`}
        strokeWidth="5.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* S — interlocking, sits to the right and slightly lower */}
      <path
        d="M70 40.5c-1.6-3.4-5.2-5.2-9.2-4.6-4 .6-6.4 3.2-6.2 6.4.2 3.4 3 4.8 7 5.8 4.2 1 7.6 2.4 7.8 6.4.2 3.8-3 7-7.8 7.4-4.4.4-8-1.4-9.6-4.8"
        stroke={`url(#${id}-gold)`}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Small gold flourish under the monogram */}
      <path
        d="M36 76h28"
        stroke={`url(#${id}-gold)`}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.85"
      />
      <circle cx="50" cy="76" r="2.2" fill={`url(#${id}-gold)`} />
    </svg>
  )
}

/** Horizontal lockup: monogram + wordmark, for headers and footers. */
export function NSLockup({
  lang = 'en',
  size = 44,
  stacked = false,
}: {
  lang?: 'en' | 'kn'
  size?: number
  stacked?: boolean
}) {
  return (
    <div
      className={stacked ? 'flex flex-col items-center gap-[10px]' : 'flex items-center gap-[12px]'}
      style={{ lineHeight: 1 }}
    >
      <NSLogo size={size} />
      <div className={stacked ? 'text-center' : ''}>
        <div
          style={{
            font: "700 clamp(15px,1.6vw,19px)/1.1 'Noto Sans Kannada',sans-serif",
            color: 'var(--p-gold-light)',
            letterSpacing: '.01em',
          }}
        >
          ನಮ್ಮ ಸಂಭ್ರಮ
        </div>
        <div
          className="uppercase"
          style={{
            font: "600 9.5px/1 'Poppins',sans-serif",
            letterSpacing: '.26em',
            color: 'var(--p-gold)',
            marginTop: 4,
            opacity: 0.9,
          }}
        >
          {lang === 'kn' ? 'ಈವೆಂಟ್ಸ್' : 'Events'}
        </div>
      </div>
    </div>
  )
}
