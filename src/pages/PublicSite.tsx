import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setDiet, setPublicFilter, openVideo } from '@/features/ui/uiSlice'
import { ART, artFor, EventIcon } from '@/data/icons'
import { photoForEventType } from '@/data/eventTypePhotos'
import { usePublicLanguage } from '@/hooks/usePublicLanguage'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { NSLogo, NSLockup } from '@/components/brand/NSLogo'
import { EventDetailDialog } from '@/components/layout/EventDetailDialog'
import { PublicLoader } from '@/components/layout/PublicLoader'
import { LazyImage } from '@/components/layout/LazyImage'
import { PaymentQrSection } from '@/components/layout/PaymentQrSection'
import { fetchEvents, fetchFoods } from '@/features/catalog/catalogThunks'
import { fetchPublicPayment } from '@/features/payment/paymentThunks'
import type { EventType, IconKey } from '@/types'

const pill = (active: boolean) =>
  ({
    font: '600 12.5px/1 Poppins,sans-serif',
    padding: '10px 19px',
    borderRadius: 999,
    cursor: 'pointer',
    transition: 'all .25s ease',
    border: '1.4px solid var(--p-deep)',
    background: active ? 'linear-gradient(150deg,var(--p-deep),var(--p-deeper))' : 'transparent',
    color: active ? 'var(--p-gold-light)' : 'var(--p-deep)',
    boxShadow: active ? '0 8px 18px -10px color-mix(in srgb,var(--p-deep) 70%,transparent)' : 'none',
  }) as React.CSSProperties

/**
 * Honest commitments shown under the hero. Deliberately not headline numbers —
 * this is a new company, so these are promises we can keep on day one rather
 * than counts of work not yet done.
 */
const PROMISES: { icon: IconKey; en: string; kn: string; enSub: string; knSub: string }[] = [
  {
    icon: 'rings',
    en: 'One Team, End to End',
    kn: 'ಒಂದೇ ತಂಡ, ಆರಂಭದಿಂದ ಕೊನೆಗೆ',
    enSub: 'Décor, catering and coordination under one roof — no juggling vendors.',
    knSub: 'ಅಲಂಕಾರ, ಅಡುಗೆ ಮತ್ತು ಸಂಯೋಜನೆ ಒಂದೇ ಸೂರಿನಡಿ.',
  },
  {
    icon: 'plant',
    en: 'In-House Kitchen',
    kn: 'ಸ್ವಂತ ಅಡುಗೆಮನೆ',
    enSub: 'Our own chefs and menus. Taste it before you commit to it.',
    knSub: 'ನಮ್ಮದೇ ಬಾಣಸಿಗರು. ಬುಕ್ ಮಾಡುವ ಮೊದಲು ರುಚಿ ನೋಡಿ.',
  },
  {
    icon: 'briefcase',
    en: 'Transparent Pricing',
    kn: 'ಪಾರದರ್ಶಕ ಬೆಲೆ',
    enSub: 'A written quote that holds. No surprises on the invoice.',
    knSub: 'ಲಿಖಿತ ಬೆಲೆ ಪಟ್ಟಿ. ಕೊನೆಯಲ್ಲಿ ಯಾವುದೇ ಅಚ್ಚರಿ ಇಲ್ಲ.',
  },
  {
    icon: 'camera',
    en: 'Free Consultation',
    kn: 'ಉಚಿತ ಸಮಾಲೋಚನೆ',
    enSub: 'Sit with us, plan it out, decide later. Costs you nothing.',
    knSub: 'ನಮ್ಮೊಂದಿಗೆ ಕುಳಿತು ಯೋಜಿಸಿ, ನಂತರ ನಿರ್ಧರಿಸಿ.',
  },
]

/** Booking journey. */
const PROCESS = [
  {
    n: '01',
    en: 'Share your vision',
    kn: 'ನಿಮ್ಮ ಕನಸನ್ನು ಹಂಚಿಕೊಳ್ಳಿ',
    enDesc: 'Tell us the occasion, date and guest count. Consultation is always free.',
    knDesc: 'ಸಂದರ್ಭ, ದಿನಾಂಕ ಮತ್ತು ಅತಿಥಿಗಳ ಸಂಖ್ಯೆ ತಿಳಿಸಿ. ಸಮಾಲೋಚನೆ ಉಚಿತ.',
  },
  {
    n: '02',
    en: 'We design the plan',
    kn: 'ನಾವು ಯೋಜನೆ ರೂಪಿಸುತ್ತೇವೆ',
    enDesc: 'Décor concepts, menu tasting and a transparent quote — no hidden costs.',
    knDesc: 'ಅಲಂಕಾರ ಪರಿಕಲ್ಪನೆ, ಮೆನು ರುಚಿ ಮತ್ತು ಪಾರದರ್ಶಕ ಬೆಲೆ.',
  },
  {
    n: '03',
    en: 'Relax on the day',
    kn: 'ಆ ದಿನ ನಿರಾಳವಾಗಿರಿ',
    enDesc: 'Our team runs setup, service and teardown while you enjoy the celebration.',
    knDesc: 'ನಮ್ಮ ತಂಡ ಎಲ್ಲವನ್ನೂ ನಿರ್ವಹಿಸುತ್ತದೆ, ನೀವು ಆಚರಣೆಯನ್ನು ಆನಂದಿಸಿ.',
  },
]

/**
 * Event-type groups for the portfolio filter. 19 flat pills was unreadable, so
 * types are bucketed; anything unmatched falls into "Social & Others".
 * `match` holds lowercase eventType values as stored in MongoDB.
 */
const EVENT_GROUPS: {
  key: string
  en: string
  kn: string
  icon: IconKey
  match: string[]
}[] = [
  {
    key: 'weddings',
    en: 'Weddings',
    kn: 'ಮದುವೆ',
    icon: 'rings',
    match: ['wedding', 'engagement', 'reception', 'mehendi & sangeet', 'haldi'],
  },
  {
    key: 'ceremonies',
    en: 'Ceremonies',
    kn: 'ಸಮಾರಂಭ',
    icon: 'plant',
    match: [
      'gruhapravesha',
      'namakarana',
      'upanayana',
      'seemantha',
      'shashtiabdapoorthi',
      'satyanarayana pooja',
      'ritu shanti',
    ],
  },
  {
    key: 'milestones',
    en: 'Milestones',
    kn: 'ಸಂಭ್ರಮ',
    icon: 'cake',
    match: ['birthday', 'anniversary'],
  },
  {
    key: 'corporate',
    en: 'Corporate',
    kn: 'ಕಾರ್ಪೊರೇಟ್',
    icon: 'briefcase',
    match: ['corporate event', 'product launch'],
  },
  {
    key: 'social',
    en: 'Social',
    kn: 'ಸಾಮಾಜಿಕ',
    icon: 'music',
    match: ['school function', 'get-together', 'festival event'],
  },
]

/** Which group a stored eventType belongs to. */
function groupOf(eventType: string): string {
  const v = eventType.trim().toLowerCase()
  const hit = EVENT_GROUPS.find((g) => g.match.includes(v))
  return hit ? hit.key : 'social'
}

/** Compact "6 menu items" style chip used on the public cards. */
function CountChip({ n, label, dot }: { n: number; label: string; dot: string }) {
  return (
    <span
      className="inline-flex items-center gap-[6px]"
      style={{
        padding: '6px 11px',
        borderRadius: 999,
        background: 'color-mix(in srgb,var(--p-deep) 6%,transparent)',
        border: '1px solid color-mix(in srgb,var(--p-deep) 11%,transparent)',
        font: "500 11.5px/1 'Poppins',sans-serif",
        color: 'var(--p-muted)',
      }}
    >
      <span className="rounded-full" style={{ width: 5, height: 5, background: dot }} />
      <strong style={{ color: 'var(--p-deep)', fontWeight: 600 }}>{n}</strong>
      {label}
    </span>
  )
}

export function PublicSite({ standalone = false }: { standalone?: boolean }) {
  const dispatch = useAppDispatch()
  const events = useAppSelector((s) => s.catalog.events)
  const foods = useAppSelector((s) => s.catalog.foods)
  const diet = useAppSelector((s) => s.ui.diet)
  const publicFilter = useAppSelector((s) => s.ui.publicFilter)
  const eventsLoaded = useAppSelector((s) => s.catalog.eventsLoaded)
  const foodsLoaded = useAppSelector((s) => s.catalog.foodsLoaded)
  const loading = useAppSelector((s) => s.catalog.loading)
  const paymentData = useAppSelector((s) => s.payment.data)
  const paymentLoaded = useAppSelector((s) => s.payment.loaded)

  // Which event's full detail dialog is open
  const [detail, setDetail] = useState<EventType | null>(null)

  // Reads the catalog from the unauthenticated /public endpoints
  useEffect(() => {
    if (!eventsLoaded) dispatch(fetchEvents())
    if (!foodsLoaded) dispatch(fetchFoods())
    if (!paymentLoaded) dispatch(fetchPublicPayment())
  }, [eventsLoaded, foodsLoaded, paymentLoaded, dispatch])

  const types: string[] = []
  events.forEach((e) => {
    if (e.eventType && !types.includes(e.eventType)) types.push(e.eventType)
  })

  // publicFilter is 'all', a group key, or a specific eventType
  const isGroupFilter = EVENT_GROUPS.some((g) => g.key === publicFilter)
  const publicList =
    publicFilter === 'all'
      ? events
      : isGroupFilter
        ? events.filter((e) => groupOf(e.eventType) === publicFilter)
        : events.filter((e) => e.eventType === publicFilter)

  // Groups that actually have events, with counts for the tab badges
  const activeGroups = EVENT_GROUPS.map((g) => ({
    ...g,
    count: events.filter((e) => groupOf(e.eventType) === g.key).length,
  })).filter((g) => g.count > 0)

  // Types inside the selected group, for the secondary chip row
  const subTypes = isGroupFilter
    ? Array.from(
        new Set(events.filter((e) => groupOf(e.eventType) === publicFilter).map((e) => e.eventType)),
      )
    : []

  const foodSections = foods
    .map((c) => {
      const ds = c.dishlist.filter((d) => diet === 'all' || (diet === 'veg') === d.isVeg)
      return { ...c, ds }
    })
    .filter((c) => c.ds.length)

  const dynamicTexts = useMemo(() => {
    const texts: string[] = []
    events.forEach((e) => {
      if (e.eventType) texts.push(e.eventType)
      if (e.eventTitle) texts.push(e.eventTitle)
      if (e.eventDescription) texts.push(e.eventDescription)
      e.foodMenu.forEach((l) => l.text && texts.push(l.text))
      e.eventDesign.forEach((l) => l.text && texts.push(l.text))
    })
    foods.forEach((c) => {
      if (c.foodType) texts.push(c.foodType)
      c.dishlist.forEach((d) => {
        if (d.dishName) texts.push(d.dishName)
        if (d.dishDescription) texts.push(d.dishDescription)
      })
    })
    return texts
  }, [events, foods])

  const { lang, setLang, t } = usePublicLanguage(dynamicTexts)
  const kn = lang === 'kn'

  // Up to 7 real event photos for the hero deck, widest variety of types first
  const heroPhotos = useMemo(() => {
    const seen = new Set<string>()
    const picked: { id: string; src: string; label: string }[] = []
    for (const e of events) {
      if (!e.eventImage || seen.has(e.eventType)) continue
      seen.add(e.eventType)
      picked.push({ id: e.id, src: e.eventImage, label: e.eventType })
      if (picked.length === 7) break
    }
    return picked
  }, [events])

  // Hold the page behind the branded splash until both public endpoints have
  // settled, so customers never see a half-populated site.
  const ready = eventsLoaded && foodsLoaded
  if (!ready) return <PublicLoader lang={lang} />

  return (
    <>
      <div
        id="top"
        data-lang={lang}
        className="animate-rise pl-reveal-page"
        style={standalone ? undefined : { margin: '-26px -32px -70px' }}
      >
        <PublicHeader lang={lang} onLangChange={setLang} />

        <div
          style={{
            background: 'var(--p-bg)',
            color: 'var(--p-text)',
            fontFamily: "'Poppins',sans-serif",
          }}
        >
          {/* ══════════════ HERO ══════════════ */}
          <header
            className="ps-hero relative text-center overflow-hidden"
            style={{
              background:
                'linear-gradient(165deg,#050a18,var(--p-deeper) 42%,var(--p-deep) 78%,var(--p-deep-2))',
            }}
          >
            {/* Layered glows */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(760px 300px at 50% -6%,color-mix(in srgb,var(--p-gold) 26%,transparent),transparent 68%)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(500px 240px at 12% 108%,color-mix(in srgb,var(--p-rose) 20%,transparent),transparent 70%)',
              }}
            />

            {/* Corner filigree */}
            {[
              { side: 'left' as const, deg: 0 },
              { side: 'right' as const, deg: 90 },
            ].map((pos) => (
              <svg
                key={pos.side}
                width="72"
                height="72"
                viewBox="0 0 72 72"
                fill="none"
                className="absolute ps-float hidden md:block"
                style={{
                  top: 22,
                  [pos.side]: 22,
                  opacity: 0.4,
                  transform: `rotate(${pos.deg}deg)`,
                }}
              >
                <path
                  d="M2 34C2 16 16 2 34 2"
                  stroke="var(--p-gold)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <path
                  d="M2 22C2 11 11 2 22 2"
                  stroke="var(--p-gold)"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  opacity="0.6"
                />
                <circle cx="34" cy="34" r="2.4" fill="var(--p-gold)" />
              </svg>
            ))}

            <div className="relative mx-auto" style={{ maxWidth: 780 }}>
              {/* Medallion logo */}
              <div className="flex justify-center ps-reveal" style={{ marginBottom: 22 }}>
                <NSLogo size={92} />
              </div>

              <p
                className="ps-reveal"
                style={{
                  margin: '0 0 16px',
                  font: kn
                    ? "600 12.5px/1.5 'Noto Sans Kannada',sans-serif"
                    : "600 11px/1 'Poppins',sans-serif",
                  // Kannada is a conjunct script — letter-spacing breaks ligatures
                  letterSpacing: kn ? 'normal' : '.34em',
                  textTransform: kn ? 'none' : 'uppercase',
                  color: 'var(--p-gold)',
                  animationDelay: '.06s',
                }}
              >
                {kn ? 'ದಾವಣಗೆರೆ • ಈವೆಂಟ್ ಯೋಜನೆ ಮತ್ತು ಅಡುಗೆ' : 'Davangere • Event Planning & Catering'}
              </p>

              <h1
                className="m-0 ps-reveal"
                style={{
                  // Tiro Kannada has a true italic cut; Noto Sans Kannada does not,
                  // so faux-slanting it would distort the glyphs.
                  font: "italic 400 clamp(42px,8.4vw,80px)/1.14 'Tiro Kannada',serif",
                  color: 'var(--p-gold-light)',
                  textShadow: '0 3px 26px rgba(0,0,0,.6)',
                  animationDelay: '.12s',
                }}
              >
                ನಮ್ಮ ಸಂಭ್ರಮ
              </h1>

              <div
                className="flex items-center justify-center gap-4 ps-reveal"
                style={{
                  margin: '14px 0 18px',
                  font: kn
                    ? "600 clamp(15px,2.2vw,20px)/1.6 'Noto Sans Kannada',sans-serif"
                    : "700 clamp(18px,3vw,26px)/1 'Playfair Display',serif",
                  letterSpacing: kn ? 'normal' : '.3em',
                  color: '#f4ede0',
                  animationDelay: '.18s',
                }}
              >
                <span style={{ height: 1, width: 52, background: 'var(--p-gold)', opacity: 0.7 }} />
                {kn ? 'ಈವೆಂಟ್‌ಗಳು' : 'EVENTS'}
                <span style={{ height: 1, width: 52, background: 'var(--p-gold)', opacity: 0.7 }} />
              </div>

              <p
                className="m-0 ps-reveal"
                style={{
                  font: kn
                    ? "600 clamp(17px,2.4vw,23px)/1.6 'Noto Sans Kannada',sans-serif"
                    : "700 clamp(22px,3.2vw,30px)/1.3 'Dancing Script',cursive",
                  color: 'var(--p-gold-light)',
                  animationDelay: '.24s',
                }}
              >
                {kn
                  ? 'ಪ್ರತಿಯೊಂದು ಆಚರಣೆಯನ್ನೂ ಸ್ಮರಣೀಯಗೊಳಿಸುವುದು'
                  : 'Making Every Celebration Memorable'}
              </p>

              {/* CTAs */}
              <div
                className="flex flex-wrap items-center justify-center gap-[13px] ps-reveal"
                style={{ marginTop: 34, animationDelay: '.3s' }}
              >
                <a
                  href="/book"
                  className="flex items-center gap-[9px]"
                  style={{
                    padding: '15px 30px',
                    borderRadius: 999,
                    background: 'linear-gradient(150deg,var(--p-gold-light),var(--p-gold) 45%,var(--p-gold-dark))',
                    color: '#12182c',
                    font: "700 14.5px/1 'Poppins',sans-serif",
                    textDecoration: 'none',
                    boxShadow: '0 14px 34px -12px rgba(212,175,55,.75)',
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
                  </svg>
                  {kn ? 'ಈವೆಂಟ್ ಬುಕ್ ಮಾಡಿ' : 'Plan My Event'}
                </a>
                <a
                  href="#events"
                  style={{
                    padding: '15px 28px',
                    borderRadius: 999,
                    border: '1.4px solid color-mix(in srgb,var(--p-gold) 55%,transparent)',
                    color: 'var(--p-gold-light)',
                    font: "600 14px/1 'Poppins',sans-serif",
                    textDecoration: 'none',
                    background: 'rgba(255,255,255,.04)',
                  }}
                >
                  {kn ? 'ನಮ್ಮ ಕೆಲಸ ನೋಡಿ' : 'View Our Work'}
                </a>
              </div>
            </div>

            {/* Fanned deck of real event photos — fills the hero's base with
                actual work rather than abstract shapes. */}
            {heroPhotos.length > 0 && (
              <div className="hd" aria-hidden="true">
                <div className="hd-glow" />
                <div className="hd-fan">
                  {heroPhotos.map((ph, i) => (
                    <span
                      className="hd-card"
                      key={ph.id}
                      style={{ ['--i' as string]: i - (heroPhotos.length - 1) / 2 }}
                    >
                      <img src={ph.src} alt="" loading="lazy" decoding="async" />
                      <em>{t(ph.label)}</em>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Scroll cue — only when no photo deck is present, since the deck
                itself already signals there is more below. */}
            {heroPhotos.length === 0 && (
              <a href="#promise" className="ps-scroll" aria-label={kn ? 'ಕೆಳಗೆ ಸ್ಕ್ರಾಲ್ ಮಾಡಿ' : 'Scroll down'}>
                <span className="ps-scroll-txt">{kn ? 'ಕೆಳಗೆ ನೋಡಿ' : 'Scroll'}</span>
                <span className="ps-scroll-line" />
              </a>
            )}
          </header>

          {/* ══════════════ OUR PROMISE ══════════════ */}
          <section id="promise" className="pr-sec ps-grain">
            <div className="pr-inner">
              <div className="text-center" style={{ marginBottom: 'clamp(30px,4vw,46px)' }}>
                <p className="ps-eyebrow m-0">{kn ? 'ನಮ್ಮ ಭರವಸೆ' : 'Why Choose Us'}</p>
                <h2 className="ps-title">
                  {kn ? 'ನಮ್ಮ ಬದ್ಧತೆ' : 'Our Promise To You'}
                </h2>
                <div className="ps-rule" style={{ marginTop: 16 }}>
                  <NSLogo size={22} showRing={false} />
                </div>
              </div>

              <div className="pr-grid">
                {PROMISES.map((p, i) => (
                  <article
                    key={p.en}
                    className="pr-card"
                    style={{ animationDelay: `${i * 0.09}s` }}
                  >
                    <span className="pr-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="pr-ico">
                      <EventIcon name={p.icon} />
                    </span>
                    <h4>{kn ? p.kn : p.en}</h4>
                    <p>{kn ? p.knSub : p.enSub}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════ EVENT CATALOG ══════════════ */}
          <section
            id="events"
            className="mx-auto"
            style={{ maxWidth: 1180, padding: 'clamp(44px,6vw,68px) 24px 8px', scrollMarginTop: 70 }}
          >
            <div className="text-center" style={{ marginBottom: 30 }}>
              <p className="ps-eyebrow m-0">{kn ? 'ನಾವು ಯೋಜಿಸುವುದು' : 'Our Portfolio'}</p>
              <h2 className="ps-title">
                {kn ? 'ಈವೆಂಟ್ ಸಂಗ್ರಹ' : 'Signature Celebrations'}
              </h2>
              <p
                className="mx-auto"
                style={{ maxWidth: 520, margin: '14px auto 0', fontSize: 14, lineHeight: 1.7, color: 'var(--p-muted)' }}
              >
                {kn
                  ? 'ಕೆಳಗಿನ ಪ್ರತಿಯೊಂದು ಈವೆಂಟ್ ಪ್ರಕಾರವನ್ನು ನಮ್ಮ ತಂಡ ನಿರ್ವಹಿಸುತ್ತದೆ — ಫೋಟೋಗಳು, ಮೆನುಗಳು ಮತ್ತು ಅಲಂಕಾರ, ಎಲ್ಲವೂ ಪ್ರಸ್ತುತವಾಗಿ.'
                  : 'Every event type below is managed by our team — photos, menus and décor, all kept current.'}
              </p>
            </div>

            {activeGroups.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                {/* Primary: grouped category tabs */}
                <div className="ev-tabs">
                  <button
                    className={`ev-tab ${publicFilter === 'all' ? 'is-active' : ''}`}
                    onClick={() => dispatch(setPublicFilter('all'))}
                  >
                    <span className="ev-tab-ico">
                      <NSLogo size={19} showRing={false} />
                    </span>
                    <span className="ev-tab-txt">
                      {kn ? 'ಎಲ್ಲಾ' : 'All'}
                      <b>{events.length}</b>
                    </span>
                  </button>

                  {activeGroups.map((g) => (
                    <button
                      key={g.key}
                      className={`ev-tab ${publicFilter === g.key ? 'is-active' : ''}`}
                      onClick={() => dispatch(setPublicFilter(g.key))}
                    >
                      <span className="ev-tab-ico">
                        <EventIcon name={g.icon} />
                      </span>
                      <span className="ev-tab-txt">
                        {kn ? g.kn : g.en}
                        <b>{g.count}</b>
                      </span>
                    </button>
                  ))}
                </div>

                {/* Secondary: specific types within the chosen group */}
                {subTypes.length > 1 && (
                  <div className="ev-subrow">
                    {subTypes.map((ty) => (
                      <button
                        key={ty}
                        className="ev-sub"
                        onClick={() => dispatch(setPublicFilter(ty))}
                      >
                        {t(ty)}
                      </button>
                    ))}
                  </div>
                )}

                {/* Breadcrumb when a single type is selected */}
                {!isGroupFilter && publicFilter !== 'all' && (
                  <div className="ev-subrow">
                    <button className="ev-sub is-active" onClick={() => dispatch(setPublicFilter('all'))}>
                      {t(publicFilter)} <span style={{ opacity: 0.6, marginLeft: 4 }}>×</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {loading && events.length === 0 && (
              <p className="text-center" style={{ padding: '30px 0', color: 'var(--p-muted)', fontSize: 14 }}>
                {kn ? 'ಲೋಡ್ ಆಗುತ್ತಿದೆ…' : 'Loading our collection…'}
              </p>
            )}

            {!loading && events.length === 0 && (
              <div
                className="text-center mx-auto"
                style={{
                  maxWidth: 520,
                  padding: '44px 30px',
                  borderRadius: 18,
                  background: 'var(--p-card)',
                  border: '1.4px dashed color-mix(in srgb,var(--p-gold) 45%,transparent)',
                }}
              >
                <div className="flex justify-center" style={{ marginBottom: 16 }}>
                  <NSLogo size={52} />
                </div>
                <h3 style={{ margin: '0 0 8px', font: "700 19px/1.3 'Playfair Display',serif", color: 'var(--p-deep)' }}>
                  {kn ? 'ಹೊಸ ಸಂಗ್ರಹ ಶೀಘ್ರದಲ್ಲೇ' : 'Our Showcase Is Coming Soon'}
                </h3>
                <p style={{ margin: '0 0 20px', fontSize: 13.5, lineHeight: 1.65, color: 'var(--p-muted)' }}>
                  {kn
                    ? 'ನಾವು ನಮ್ಮ ಇತ್ತೀಚಿನ ಈವೆಂಟ್‌ಗಳನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತಿದ್ದೇವೆ. ಅಷ್ಟರಲ್ಲಿ ನೇರವಾಗಿ ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ.'
                    : 'We are curating our latest events. In the meantime, tell us what you are planning and we will design it with you.'}
                </p>
                <a
                  href="/book"
                  style={{
                    display: 'inline-block',
                    padding: '13px 26px',
                    borderRadius: 999,
                    background: 'linear-gradient(150deg,var(--p-deep),var(--p-deeper))',
                    color: 'var(--p-gold-light)',
                    font: "600 13.5px/1 'Poppins',sans-serif",
                    textDecoration: 'none',
                  }}
                >
                  {kn ? 'ಉಚಿತ ಸಮಾಲೋಚನೆ' : 'Get a Free Consultation'}
                </a>
              </div>
            )}

            {/* auto-fill (not auto-fit) keeps a lone card at column width instead of
                stretching it across the container and squashing its 16:9 image.
                justify-center keeps a part-filled last row balanced. */}
            <div
              className="grid gap-6"
              style={{
                gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))',
                justifyContent: 'center',
              }}
            >
              {publicList.map((e, i) => {
                const typePhoto = photoForEventType(e.eventType)
                // Real URL goes to <img> so it can lazy-load; the generated
                // gradient is only a fallback.
                const photoSrc = e.eventImage || typePhoto || ''
                const artFallback = e.eventIcon ? ART[e.eventIcon] : artFor(e.eventTitle)
                return (
                  <article
                    key={e.id}
                    className="ps-card ps-reveal flex flex-col overflow-hidden"
                    style={{
                      background: 'var(--p-card)',
                      borderRadius: 18,
                      border: '1px solid color-mix(in srgb,var(--p-deep) 12%,transparent)',
                      boxShadow: '0 16px 36px -24px color-mix(in srgb,var(--p-deep) 55%,transparent)',
                      animationDelay: `${Math.min(i, 6) * 0.07}s`,
                      // Cap so a single card keeps card proportions instead of
                      // spanning the full container width.
                      maxWidth: 460,
                      width: '100%',
                      justifySelf: 'center',
                    }}
                  >
                    <div
                      className="ps-sheen"
                      style={{ height: 5, background: 'linear-gradient(90deg,var(--p-gold-dark),var(--p-gold-light),var(--p-gold-dark))' }}
                    />
                    {/* 16:9 frame — matches the recommended upload ratio, so photos
                        are never squashed regardless of column width. */}
                    <div className="relative overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
                      <LazyImage
                        src={photoSrc}
                        fallback={artFallback}
                        alt={e.eventTitle}
                        eager={i < 3}
                      />
                      {/* Bottom scrim so the type chip stays legible */}
                      <div
                        className="absolute inset-x-0 bottom-0"
                        style={{ height: 76, background: 'linear-gradient(transparent,rgba(8,17,40,.6))' }}
                      />
                      <span
                        className="absolute uppercase"
                        style={{
                          left: 13,
                          bottom: 12,
                          font: "600 9.5px/1 'Poppins',sans-serif",
                          letterSpacing: '.12em',
                          padding: '6px 12px',
                          borderRadius: 999,
                          background: 'color-mix(in srgb,var(--p-deeper) 82%,transparent)',
                          color: 'var(--p-gold-light)',
                          border: '1px solid color-mix(in srgb,var(--p-gold) 40%,transparent)',
                        }}
                      >
                        {t(e.eventType)}
                      </span>
                      {e.eventVideo && (
                        <span
                          className="absolute grid place-items-center"
                          style={{
                            right: 11,
                            top: 11,
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            border: '1px solid color-mix(in srgb,var(--p-gold) 45%,transparent)',
                            background: 'color-mix(in srgb,var(--p-deeper) 78%,transparent)',
                            color: 'var(--p-gold-light)',
                            fontSize: 11,
                          }}
                          title={kn ? 'ಚಿತ್ರ ಲಭ್ಯವಿದೆ' : 'Film available'}
                        >
                          ▶
                        </span>
                      )}
                    </div>

                    {/* Light body — title, a single teaser line, and what is
                        included as counts. Full lists live in the dialog. */}
                    <div
                      className="flex flex-col flex-1"
                      style={{ padding: '18px 20px 20px', gap: 12 }}
                    >
                      <div className="flex items-start gap-[12px]">
                        <div
                          className="flex-none grid place-items-center"
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            background: 'linear-gradient(150deg,var(--p-deep),var(--p-deeper))',
                            color: 'var(--p-gold-light)',
                          }}
                        >
                          <EventIcon name={e.eventIcon} />
                        </div>
                        <h3
                          className="flex-1 min-w-0"
                          style={{
                            margin: 0,
                            font: "700 18.5px/1.3 'Playfair Display',serif",
                            color: 'var(--p-deep)',
                          }}
                        >
                          {t(e.eventTitle)}
                        </h3>
                      </div>

                      {e.eventDescription && (
                        <p
                          className="ps-clamp-2"
                          style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--p-muted)' }}
                        >
                          {t(e.eventDescription)}
                        </p>
                      )}

                      {/* At-a-glance counts replace the two long bullet lists */}
                      <div className="flex flex-wrap gap-[7px]">
                        {e.foodMenu.filter((l) => l.text.trim()).length > 0 && (
                          <CountChip
                            n={e.foodMenu.filter((l) => l.text.trim()).length}
                            label={kn ? 'ಆಹಾರ' : 'menu items'}
                            dot="var(--p-rose)"
                          />
                        )}
                        {e.eventDesign.filter((l) => l.text.trim()).length > 0 && (
                          <CountChip
                            n={e.eventDesign.filter((l) => l.text.trim()).length}
                            label={kn ? 'ವಿನ್ಯಾಸ' : 'décor touches'}
                            dot="var(--p-gold-dark)"
                          />
                        )}
                      </div>

                      <button
                        onClick={() => setDetail(e)}
                        className="flex items-center justify-between mt-auto"
                        style={{
                          width: '100%',
                          marginTop: 'auto',
                          padding: '11px 15px',
                          borderRadius: 11,
                          cursor: 'pointer',
                          border: '1px solid color-mix(in srgb,var(--p-deep) 16%,transparent)',
                          background: 'color-mix(in srgb,var(--p-gold) 8%,transparent)',
                          color: 'var(--p-deep)',
                          font: "600 12.5px/1 'Poppins',sans-serif",
                          transition: 'all .22s ease',
                        }}
                        onMouseEnter={(ev) => {
                          ev.currentTarget.style.background = 'var(--p-deep)'
                          ev.currentTarget.style.color = 'var(--p-gold-light)'
                        }}
                        onMouseLeave={(ev) => {
                          ev.currentTarget.style.background =
                            'color-mix(in srgb,var(--p-gold) 8%,transparent)'
                          ev.currentTarget.style.color = 'var(--p-deep)'
                        }}
                      >
                        {kn ? 'ವಿವರಗಳನ್ನು ನೋಡಿ' : 'View details'}
                        <span style={{ fontSize: 14 }}>→</span>
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          {/* ══════════════ FOOD MENU ══════════════ */}
          <section
            id="menu"
            className="mx-auto"
            style={{ maxWidth: 1180, padding: 'clamp(48px,6vw,72px) 24px 10px', scrollMarginTop: 70 }}
          >
            <div className="text-center" style={{ marginBottom: 30 }}>
              <p className="ps-eyebrow m-0">{kn ? 'ನಮ್ಮ ಆಹಾರ ಮೆನು' : 'In-House Kitchen'}</p>
              <h2 className="ps-title">{kn ? 'ರುಚಿಯ ಸಂಗ್ರಹ' : 'Our Food Menu'}</h2>
              <p
                className="mx-auto"
                style={{ maxWidth: 500, margin: '14px auto 0', fontSize: 14, lineHeight: 1.7, color: 'var(--p-muted)' }}
              >
                {kn
                  ? 'ಶುದ್ಧ ಸಸ್ಯಾಹಾರಿ ಮತ್ತು ಮಾಂಸಾಹಾರಿ, ಎಲ್ಲವೂ ಮನೆಯಲ್ಲಿಯೇ ತಯಾರಿಸಲಾಗಿದೆ.'
                  : 'Pure veg and non-veg, all catered in-house by our own chefs.'}
              </p>
            </div>

            {foods.length > 0 && (
              <div className="flex justify-center flex-wrap gap-[9px]" style={{ marginBottom: 34 }}>
                {[
                  { key: 'all', label: 'All Items', kn: 'ಎಲ್ಲಾ ಐಟಂಗಳು' },
                  { key: 'veg', label: 'Pure Veg', kn: 'ಶುದ್ಧ ಸಸ್ಯಾಹಾರಿ' },
                  { key: 'nonveg', label: 'Non-Veg', kn: 'ಮಾಂಸಾಹಾರಿ' },
                ].map((d) => (
                  <button
                    key={d.key}
                    style={pill(diet === d.key)}
                    onClick={() => dispatch(setDiet(d.key as 'all' | 'veg' | 'nonveg'))}
                  >
                    {kn ? d.kn : d.label}
                  </button>
                ))}
              </div>
            )}

            {!loading && foods.length === 0 && (
              <p
                className="text-center"
                style={{
                  maxWidth: 460,
                  margin: '0 auto',
                  padding: '34px 26px',
                  borderRadius: 16,
                  background: 'var(--p-card)',
                  border: '1.4px dashed color-mix(in srgb,var(--p-gold) 45%,transparent)',
                  fontSize: 13.5,
                  lineHeight: 1.7,
                  color: 'var(--p-muted)',
                }}
              >
                {kn
                  ? 'ನಮ್ಮ ಮೆನು ಶೀಘ್ರದಲ್ಲೇ ಪ್ರಕಟವಾಗುತ್ತದೆ. ರುಚಿ ಪರೀಕ್ಷೆಗಾಗಿ ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ.'
                  : 'Our full menu is being published shortly. Contact us to arrange a tasting session.'}
              </p>
            )}

            <div className="fc-grid">
              {foodSections.map((cat, ci) => {
                const veg = cat.ds.filter((d) => d.isVeg).length
                const nonVeg = cat.ds.length - veg
                return (
                  <article
                    key={cat.id}
                    className="ps-reveal overflow-hidden"
                    style={{
                      borderRadius: 20,
                      background: 'var(--p-card)',
                      border: '1px solid color-mix(in srgb,var(--p-gold) 30%,transparent)',
                      boxShadow: '0 20px 46px -30px color-mix(in srgb,var(--p-deep) 60%,transparent)',
                      animationDelay: `${Math.min(ci, 5) * 0.07}s`,
                    }}
                  >
                    {/* Cinematic category banner — the image finally gets room */}
                    <div className="fc-banner">
                      <LazyImage
                        src={cat.foodtypeimage}
                        fallback={artFor(cat.foodType)}
                        alt={cat.foodType}
                        eager={ci < 2}
                      />
                      {/* Navy scrim keeps the title legible over any photo */}
                      <div className="fc-banner-scrim" />
                      <div className="fc-sheen" />

                      <div className="fc-banner-body">
                        <div className="fc-eyebrow">
                          <span />
                          {kn ? 'ಮೆನು' : 'Menu'}
                        </div>
                        <h3 className="fc-title">{t(cat.foodType)}</h3>
                        <div className="fc-meta">
                          <span>
                            <b>{cat.ds.length}</b> {kn ? 'ಭಕ್ಷ್ಯಗಳು' : 'dishes'}
                          </span>
                          {veg > 0 && (
                            <span className="fc-diet">
                              <i className="fc-dot fc-dot-veg" />
                              {veg} {kn ? 'ಸಸ್ಯಾಹಾರಿ' : 'veg'}
                            </span>
                          )}
                          {nonVeg > 0 && (
                            <span className="fc-diet">
                              <i className="fc-dot fc-dot-nonveg" />
                              {nonVeg} {kn ? 'ಮಾಂಸಾಹಾರಿ' : 'non-veg'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Name-only chips — light, scannable, no repeated placeholders */}
                    <div className="fc-chips">
                      {cat.ds.map((d, di) => (
                        <span
                          key={d.id}
                          className="fc-chip"
                          style={{ animationDelay: `${Math.min(di, 12) * 0.035}s` }}
                        >
                          <i className={`fc-dot ${d.isVeg ? 'fc-dot-veg' : 'fc-dot-nonveg'}`} />
                          {t(d.dishName)}
                        </span>
                      ))}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          {/* ══════════════ PROCESS ══════════════ */}
          <section
            id="process"
            className="ps-grain"
            style={{ padding: 'clamp(52px,7vw,80px) 24px', marginTop: 30, scrollMarginTop: 70 }}
          >
            <div className="relative mx-auto" style={{ maxWidth: 1080 }}>
              <div className="text-center" style={{ marginBottom: 42 }}>
                <p className="ps-eyebrow m-0">{kn ? 'ಪ್ರಕ್ರಿಯೆ' : 'The Process'}</p>
                <h2 className="ps-title">{kn ? 'ಮೂರು ಸರಳ ಹಂತಗಳು' : 'Three Simple Steps'}</h2>
                <div className="ps-rule" style={{ marginTop: 16 }}>
                  <NSLogo size={22} showRing={false} />
                </div>
              </div>

              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 22 }}>
                {PROCESS.map((p, i) => (
                  <div
                    key={p.n}
                    className="ps-reveal relative text-center"
                    style={{
                      padding: '34px 24px 28px',
                      borderRadius: 18,
                      background: 'var(--p-card)',
                      border: '1px solid color-mix(in srgb,var(--p-gold) 30%,transparent)',
                      animationDelay: `${i * 0.1}s`,
                    }}
                  >
                    <div
                      className="mx-auto grid place-items-center"
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: '50%',
                        marginBottom: 16,
                        background: 'linear-gradient(150deg,var(--p-gold-light),var(--p-gold) 50%,var(--p-gold-dark))',
                        color: '#12182c',
                        font: "700 17px/1 'Playfair Display',serif",
                        boxShadow: '0 10px 24px -12px rgba(212,175,55,.8)',
                      }}
                    >
                      {p.n}
                    </div>
                    <h3 style={{ margin: '0 0 9px', font: "700 17.5px/1.3 'Playfair Display',serif", color: 'var(--p-deep)' }}>
                      {kn ? p.kn : p.en}
                    </h3>
                    <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: 'var(--p-muted)' }}>
                      {kn ? p.knDesc : p.enDesc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════ PAYMENT QR ══════════════ */}
          {paymentData && (paymentData.upiId || paymentData.qrImageUrl) && (() => {
            const upiLink = paymentData.upiId
              ? `upi://pay?pa=${encodeURIComponent(paymentData.upiId)}&pn=${encodeURIComponent(paymentData.payeeName || 'Namma Sambrama')}`
              : ''
            return <PaymentQrSection
              paymentData={paymentData}
              upiLink={upiLink}
              kn={kn}
            />
          })()}

          {/* ══════════════ CLOSING CTA ══════════════ */}
          <section
            className="ps-grain text-center"
            style={{ padding: 'clamp(56px,7vw,84px) 24px' }}
          >
            <div className="relative mx-auto" style={{ maxWidth: 660 }}>
              <div className="flex justify-center" style={{ marginBottom: 20 }}>
                <NSLogo size={64} />
              </div>
              <h2 className="ps-title" style={{ marginTop: 0 }}>
                {kn ? 'ನಿಮ್ಮ ಆಚರಣೆಯನ್ನು ಯೋಜಿಸೋಣ' : "Let's Plan Something Beautiful"}
              </h2>
              <p style={{ margin: '14px 0 26px', fontSize: 14.5, lineHeight: 1.7, color: 'var(--p-muted)' }}>
                {kn
                  ? 'ದಿನಾಂಕ ಮತ್ತು ಅತಿಥಿಗಳ ಸಂಖ್ಯೆ ತಿಳಿಸಿ — ಉಳಿದೆಲ್ಲವನ್ನೂ ನಾವು ನೋಡಿಕೊಳ್ಳುತ್ತೇವೆ. ಸಮಾಲೋಚನೆ ಸಂಪೂರ್ಣ ಉಚಿತ.'
                  : 'Tell us your date and guest count — we will handle everything else. Consultation is completely free.'}
              </p>
              <a
                href="/book"
                className="inline-flex items-center gap-[9px]"
                style={{
                  padding: '16px 34px',
                  borderRadius: 999,
                  background: 'linear-gradient(150deg,var(--p-deep),var(--p-deeper))',
                  color: 'var(--p-gold-light)',
                  font: "700 15px/1 'Poppins',sans-serif",
                  textDecoration: 'none',
                  boxShadow: '0 16px 36px -16px color-mix(in srgb,var(--p-deep) 85%,transparent)',
                }}
              >
                {kn ? 'ಈವೆಂಟ್ ಬುಕ್ ಮಾಡಿ' : 'Start Planning'}
                <span style={{ fontSize: 17 }}>→</span>
              </a>
            </div>
          </section>

          {/* ══════════════ FOOTER ══════════════ */}
          <footer
            id="contact"
            style={{
              background: 'linear-gradient(165deg,#050a18,var(--p-deeper) 55%,var(--p-deep))',
              borderTop: '1px solid color-mix(in srgb,var(--p-gold) 30%,transparent)',
              scrollMarginTop: 70,
            }}
          >
            <div
              className="mx-auto grid"
              style={{
                maxWidth: 1120,
                padding: 'clamp(40px,5vw,58px) 24px 30px',
                gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))',
                gap: 34,
              }}
            >
              {/* Brand column */}
              <div>
                <NSLockup lang={lang} size={52} />
                <p
                  style={{
                    margin: '18px 0 0',
                    fontSize: 13,
                    lineHeight: 1.7,
                    color: 'rgba(244,237,224,.6)',
                    maxWidth: 260,
                  }}
                >
                  {kn
                    ? 'ದಾವಣಗೆರೆ ಮತ್ತು ಸುತ್ತಮುತ್ತ ಸ್ಮರಣೀಯ ಆಚರಣೆಗಳನ್ನು ರೂಪಿಸುತ್ತೇವೆ.'
                    : 'Designing memorable celebrations across Davangere and around.'}
                </p>
              </div>

              {/* Visit */}
              <div>
                <p className="ps-eyebrow m-0" style={{ color: 'var(--p-gold)' }}>
                  {kn ? 'ಭೇಟಿ ನೀಡಿ' : 'Visit Us'}
                </p>
                <p
                  style={{
                    margin: '14px 0 0',
                    font: "600 13.5px/1.7 'Playfair Display',serif",
                    color: 'var(--p-gold-light)',
                  }}
                >
                  {kn
                    ? 'ಎನ್ ಎನ್ ಕಾಂಪ್ಲೆಕ್ಸ್, ಪೋಲಾರ್ ಬೇರ್ ಎದುರು, ವಿದ್ಯಾನಗರ, ದಾವಣಗೆರೆ – 577005'
                    : 'N N Complex, Opposite Polar Bear, Vidyanagar, Davangere – 577005'}
                </p>
              </div>

              {/* Contact */}
              <div>
                <p className="ps-eyebrow m-0" style={{ color: 'var(--p-gold)' }}>
                  {kn ? 'ಸಂಪರ್ಕಿಸಿ' : 'Get In Touch'}
                </p>
                <p style={{ margin: '14px 0 0', fontSize: 13, lineHeight: 1.8, color: 'rgba(244,237,224,.72)' }}>
                  {kn
                    ? 'ಬುಕಿಂಗ್ ಮತ್ತು ಉಚಿತ ಸಮಾಲೋಚನೆಗಾಗಿ ಕರೆ ಅಥವಾ ವಾಟ್ಸಾಪ್ ಮಾಡಿ'
                    : 'Call or WhatsApp for bookings and free consultation'}
                </p>
                <a
                  href="/book"
                  className="inline-flex items-center gap-[7px]"
                  style={{
                    marginTop: 16,
                    padding: '11px 20px',
                    borderRadius: 999,
                    border: '1.3px solid color-mix(in srgb,var(--p-gold) 50%,transparent)',
                    color: 'var(--p-gold-light)',
                    font: "600 12.5px/1 'Poppins',sans-serif",
                    textDecoration: 'none',
                  }}
                >
                  {kn ? 'ವಿನಂತಿ ಕಳುಹಿಸಿ' : 'Send an Enquiry'}
                </a>
              </div>

              {/* Sections */}
              <div>
                <p className="ps-eyebrow m-0" style={{ color: 'var(--p-gold)' }}>
                  {kn ? 'ವಿಭಾಗಗಳು' : 'Explore'}
                </p>
                <div className="flex flex-col" style={{ gap: 9, marginTop: 14 }}>
                  {[
                    { href: '#events', en: 'Our Events', kn: 'ನಮ್ಮ ಈವೆಂಟ್‌ಗಳು' },
                    { href: '#menu', en: 'Food Menu', kn: 'ಆಹಾರ ಮೆನು' },
                    { href: '#payment', en: 'Payment', kn: 'ಪಾವತಿ' },
                  ].map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      style={{
                        fontSize: 13,
                        color: 'rgba(244,237,224,.7)',
                        textDecoration: 'none',
                      }}
                    >
                      {kn ? l.kn : l.en}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Tagline bar */}
            <div
              className="text-center"
              style={{
                padding: '24px',
                borderTop: '1px solid rgba(255,255,255,.08)',
              }}
            >
              <p
                className="m-0"
                style={{ font: "700 22px/1.3 'Dancing Script',cursive", color: 'var(--p-gold-light)' }}
              >
                {kn ? 'ನಿಮ್ಮ ಕನಸಿನ ಆಚರಣೆ, ನಮ್ಮ ಪರಿಪೂರ್ಣ ಯೋಜನೆ!' : 'Your Dream Event, Our Perfect Planning!'}
              </p>
              <p
                className="m-0"
                style={{ marginTop: 12, fontSize: 11.5, color: 'rgba(244,237,224,.42)' }}
              >
                © {new Date().getFullYear()} ನಮ್ಮ ಸಂಭ್ರಮ Events · Davangere
              </p>
            </div>
          </footer>
        </div>
      </div>

      <EventDetailDialog
        event={detail}
        lang={lang}
        t={t}
        onClose={() => setDetail(null)}
        onPlayVideo={(url, title) => {
          setDetail(null)
          dispatch(openVideo({ url, title }))
        }}
      />

      {/* Floating book button */}
      <a
        href="/book"
        className="flex items-center gap-[8px]"
        style={{
          position: 'fixed',
          right: 22,
          bottom: 22,
          zIndex: 40,
          padding: '14px 22px',
          borderRadius: 999,
          background: 'linear-gradient(150deg,var(--p-gold-light),var(--p-gold) 45%,var(--p-gold-dark))',
          color: 'var(--p-deeper)',
          font: "700 14px/1 'Poppins',sans-serif",
          boxShadow: '0 12px 30px -8px rgba(0,0,0,.55)',
          textDecoration: 'none',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
        </svg>
        {kn ? 'ಈವೆಂಟ್ ಬುಕ್ ಮಾಡಿ' : 'Book an Event'}
      </a>
    </>
  )
}
