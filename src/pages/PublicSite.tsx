import { useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setDiet, setPublicFilter, openVideo } from '@/features/ui/uiSlice'
import { ART, artFor, EventIcon } from '@/data/icons'
import { photoForEventType } from '@/data/eventTypePhotos'
import { usePublicLanguage } from '@/hooks/usePublicLanguage'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { NSLogo, NSLockup } from '@/components/brand/NSLogo'
import { fetchEvents, fetchFoods } from '@/features/catalog/catalogThunks'

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

/** Trust metrics shown under the hero. */
const STATS = [
  { value: '500+', en: 'Events Delivered', kn: 'ಪೂರ್ಣಗೊಂಡ ಈವೆಂಟ್‌ಗಳು' },
  { value: '12', en: 'Years of Craft', kn: 'ವರ್ಷಗಳ ಅನುಭವ' },
  { value: '50k+', en: 'Guests Hosted', kn: 'ಅತಿಥಿಗಳು' },
  { value: '4.9★', en: 'Client Rating', kn: 'ಗ್ರಾಹಕ ರೇಟಿಂಗ್' },
]

/** What the company does, shown when the catalog is still empty. */
const SERVICES = [
  {
    icon: 'rings' as const,
    en: 'Weddings & Receptions',
    kn: 'ಮದುವೆ ಮತ್ತು ಆರತಕ್ಷತೆ',
    enDesc: 'Full-scale mandap design, muhurta timing and guest hospitality handled end to end.',
    knDesc: 'ಸಂಪೂರ್ಣ ಮಂಟಪ ವಿನ್ಯಾಸ, ಮುಹೂರ್ತ ಸಮಯ ಮತ್ತು ಅತಿಥಿ ಸತ್ಕಾರ.',
  },
  {
    icon: 'cake' as const,
    en: 'Birthdays & Naming Days',
    kn: 'ಹುಟ್ಟುಹಬ್ಬ ಮತ್ತು ನಾಮಕರಣ',
    enDesc: 'Themed décor, custom cakes and entertainment sized for intimate or grand gatherings.',
    knDesc: 'ಥೀಮ್ ಅಲಂಕಾರ, ಕಸ್ಟಮ್ ಕೇಕ್ ಮತ್ತು ಮನರಂಜನೆ.',
  },
  {
    icon: 'briefcase' as const,
    en: 'Corporate & Launches',
    kn: 'ಕಾರ್ಪೊರೇಟ್ ಮತ್ತು ಉದ್ಘಾಟನೆ',
    enDesc: 'Conferences, product launches and annual days with stage, AV and catering managed.',
    knDesc: 'ಸಮ್ಮೇಳನ, ಉತ್ಪನ್ನ ಬಿಡುಗಡೆ ಮತ್ತು ವಾರ್ಷಿಕೋತ್ಸವ.',
  },
  {
    icon: 'plant' as const,
    en: 'Traditional Ceremonies',
    kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಸಮಾರಂಭಗಳು',
    enDesc: 'Gruhapravesha, upanayana and pooja arrangements with authentic ritual support.',
    knDesc: 'ಗೃಹಪ್ರವೇಶ, ಉಪನಯನ ಮತ್ತು ಪೂಜಾ ವ್ಯವಸ್ಥೆ.',
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

const TESTIMONIALS = [
  {
    en: 'They turned our daughter’s wedding into something the whole family still talks about. Every detail was handled before we could even ask.',
    kn: 'ನಮ್ಮ ಮಗಳ ಮದುವೆಯನ್ನು ಇಡೀ ಕುಟುಂಬ ಇನ್ನೂ ನೆನಪಿಸಿಕೊಳ್ಳುವಂತೆ ಮಾಡಿದರು. ಪ್ರತಿಯೊಂದು ವಿವರವೂ ಮೊದಲೇ ಸಿದ್ಧವಾಗಿತ್ತು.',
    name: 'Lakshmi & Ravi',
    role: { en: 'Wedding, Davangere', kn: 'ಮದುವೆ, ದಾವಣಗೆರೆ' },
  },
  {
    en: 'Our annual day for 800 guests ran without a single hitch. The catering was genuinely the best we have served.',
    kn: '800 ಅತಿಥಿಗಳ ನಮ್ಮ ವಾರ್ಷಿಕೋತ್ಸವ ಯಾವುದೇ ತೊಂದರೆಯಿಲ್ಲದೆ ನಡೆಯಿತು. ಅಡುಗೆ ನಿಜವಾಗಿಯೂ ಅತ್ಯುತ್ತಮವಾಗಿತ್ತು.',
    name: 'Suresh Kumar',
    role: { en: 'Corporate Event', kn: 'ಕಾರ್ಪೊರೇಟ್ ಈವೆಂಟ್' },
  },
  {
    en: 'Warm, professional and completely reliable. They made our gruhapravesha feel sacred and effortless at once.',
    kn: 'ಆತ್ಮೀಯ, ವೃತ್ತಿಪರ ಮತ್ತು ಸಂಪೂರ್ಣ ವಿಶ್ವಾಸಾರ್ಹ. ನಮ್ಮ ಗೃಹಪ್ರವೇಶವನ್ನು ಪವಿತ್ರವಾಗಿಸಿದರು.',
    name: 'Anitha Prasad',
    role: { en: 'Gruhapravesha', kn: 'ಗೃಹಪ್ರವೇಶ' },
  },
]

export function PublicSite({ standalone = false }: { standalone?: boolean }) {
  const dispatch = useAppDispatch()
  const events = useAppSelector((s) => s.catalog.events)
  const foods = useAppSelector((s) => s.catalog.foods)
  const diet = useAppSelector((s) => s.ui.diet)
  const publicFilter = useAppSelector((s) => s.ui.publicFilter)
  const eventsLoaded = useAppSelector((s) => s.catalog.eventsLoaded)
  const foodsLoaded = useAppSelector((s) => s.catalog.foodsLoaded)
  const loading = useAppSelector((s) => s.catalog.loading)

  // Reads the catalog from the unauthenticated /public endpoints
  useEffect(() => {
    if (!eventsLoaded) dispatch(fetchEvents())
    if (!foodsLoaded) dispatch(fetchFoods())
  }, [eventsLoaded, foodsLoaded, dispatch])

  const types: string[] = []
  events.forEach((e) => {
    if (e.eventType && !types.includes(e.eventType)) types.push(e.eventType)
  })

  const publicList =
    publicFilter === 'all' ? events : events.filter((e) => e.eventType === publicFilter)

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

  return (
    <>
      <div
        id="top"
        className="animate-rise"
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
            className="relative text-center overflow-hidden"
            style={{
              padding: 'clamp(56px,9vw,96px) 24px clamp(48px,7vw,78px)',
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
                  font: "600 11px/1 'Poppins',sans-serif",
                  letterSpacing: '.34em',
                  textTransform: 'uppercase',
                  color: 'var(--p-gold)',
                  animationDelay: '.06s',
                }}
              >
                {kn ? 'ದಾವಣಗೆರೆ • ಸ್ಥಾಪನೆ ೨೦೧೩' : 'Davangere • Est. 2013'}
              </p>

              <h1
                className="m-0 ps-reveal"
                style={{
                  font: "900 clamp(40px,8vw,74px)/1.08 'Noto Sans Kannada',sans-serif",
                  color: 'var(--p-gold-light)',
                  textShadow: '0 3px 22px rgba(0,0,0,.55)',
                  animationDelay: '.12s',
                }}
              >
                ನಮ್ಮ ಸಂಭ್ರಮ
              </h1>

              <div
                className="flex items-center justify-center gap-4 ps-reveal"
                style={{
                  margin: '14px 0 18px',
                  font: "700 clamp(18px,3vw,26px)/1 'Playfair Display',serif",
                  letterSpacing: '.3em',
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
                  font: "700 clamp(22px,3.2vw,30px)/1.3 'Dancing Script',cursive",
                  color: 'var(--p-gold-light)',
                  animationDelay: '.24s',
                }}
              >
                {kn
                  ? 'ಪ್ರತಿಯೊಂದು ಆಚರಣೆಯನ್ನೂ ಸ್ಮರಣೀಯಗೊಳಿಸುವುದು'
                  : 'Making Every Celebration Memorable'}
              </p>

              <p
                className="mx-auto ps-reveal"
                style={{
                  maxWidth: 540,
                  margin: '20px auto 0',
                  fontSize: 14.5,
                  lineHeight: 1.7,
                  color: 'rgba(244,237,224,.72)',
                  animationDelay: '.3s',
                }}
              >
                {kn
                  ? 'ಮದುವೆಯಿಂದ ಕಾರ್ಪೊರೇಟ್ ಸಮಾರಂಭಗಳವರೆಗೆ — ಅಲಂಕಾರ, ಅಡುಗೆ ಮತ್ತು ಆತಿಥ್ಯವನ್ನು ಒಂದೇ ಸೂರಿನಡಿ ನಿರ್ವಹಿಸುತ್ತೇವೆ.'
                  : 'From intimate ceremonies to grand receptions — décor, catering and hospitality, all managed under one roof.'}
              </p>

              {/* CTAs */}
              <div
                className="flex flex-wrap items-center justify-center gap-[13px] ps-reveal"
                style={{ marginTop: 32, animationDelay: '.36s' }}
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
          </header>

          {/* ══════════════ STATS ══════════════ */}
          <section
            style={{
              background: 'linear-gradient(90deg,var(--p-deeper),var(--p-deep) 50%,var(--p-deeper))',
              borderTop: '1px solid color-mix(in srgb,var(--p-gold) 26%,transparent)',
              borderBottom: '1px solid color-mix(in srgb,var(--p-gold) 26%,transparent)',
            }}
          >
            <div
              className="mx-auto grid text-center"
              style={{
                maxWidth: 1000,
                padding: 'clamp(26px,4vw,40px) 24px',
                gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
                gap: 24,
              }}
            >
              {STATS.map((s) => (
                <div key={s.en}>
                  <div className="ps-stat-value">{s.value}</div>
                  <div className="ps-stat-label">{kn ? s.kn : s.en}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ══════════════ SERVICES ══════════════ */}
          <section
            className="ps-grain"
            style={{ padding: 'clamp(52px,7vw,80px) 24px clamp(20px,3vw,30px)' }}
          >
            <div className="relative mx-auto" style={{ maxWidth: 1180 }}>
              <div className="text-center" style={{ marginBottom: 40 }}>
                <p className="ps-eyebrow m-0">{kn ? 'ನಮ್ಮ ಸೇವೆಗಳು' : 'What We Do'}</p>
                <h2 className="ps-title">
                  {kn ? 'ಪ್ರತಿ ಸಂದರ್ಭಕ್ಕೂ ಪರಿಪೂರ್ಣ ಯೋಜನೆ' : 'Crafted For Every Occasion'}
                </h2>
                <div className="ps-rule" style={{ marginTop: 16 }}>
                  <NSLogo size={22} showRing={false} />
                </div>
              </div>

              <div
                className="grid"
                style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 20 }}
              >
                {SERVICES.map((s, i) => (
                  <article
                    key={s.en}
                    className="ps-card ps-reveal flex flex-col"
                    style={{
                      background: 'var(--p-card)',
                      borderRadius: 18,
                      padding: '30px 24px 26px',
                      border: '1px solid color-mix(in srgb,var(--p-gold) 30%,transparent)',
                      boxShadow: '0 14px 34px -24px color-mix(in srgb,var(--p-deep) 55%,transparent)',
                      animationDelay: `${i * 0.08}s`,
                    }}
                  >
                    <div
                      className="grid place-items-center"
                      style={{
                        width: 58,
                        height: 58,
                        borderRadius: 16,
                        marginBottom: 18,
                        background: 'linear-gradient(150deg,var(--p-deep),var(--p-deeper))',
                        color: 'var(--p-gold-light)',
                        border: '1px solid color-mix(in srgb,var(--p-gold) 32%,transparent)',
                        boxShadow: '0 8px 20px -10px color-mix(in srgb,var(--p-deep) 80%,transparent)',
                      }}
                    >
                      {/* Shared icon renders at 20px — scale up for this hero-sized tile */}
                      <span style={{ display: 'flex', transform: 'scale(1.45)' }}>
                        <EventIcon name={s.icon} />
                      </span>
                    </div>
                    <h3
                      style={{
                        margin: '0 0 9px',
                        font: "700 18px/1.3 'Playfair Display',serif",
                        color: 'var(--p-deep)',
                      }}
                    >
                      {kn ? s.kn : s.en}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13.5,
                        lineHeight: 1.65,
                        color: 'var(--p-muted)',
                      }}
                    >
                      {kn ? s.knDesc : s.enDesc}
                    </p>
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

            {types.length > 0 && (
              <div className="flex justify-center flex-wrap gap-[9px]" style={{ marginBottom: 30 }}>
                <button style={pill(publicFilter === 'all')} onClick={() => dispatch(setPublicFilter('all'))}>
                  {kn ? 'ಎಲ್ಲಾ ಈವೆಂಟ್‌ಗಳು' : 'All Events'}
                </button>
                {types.map((ty) => (
                  <button key={ty} style={pill(publicFilter === ty)} onClick={() => dispatch(setPublicFilter(ty))}>
                    {t(ty)}
                  </button>
                ))}
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

            <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))' }}>
              {publicList.map((e, i) => {
                const typePhoto = photoForEventType(e.eventType)
                const artStyle = e.eventImage
                  ? `center/cover no-repeat url(${e.eventImage})`
                  : typePhoto
                    ? `center/cover no-repeat url(${typePhoto})`
                    : e.eventIcon
                      ? ART[e.eventIcon]
                      : artFor(e.eventTitle)
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
                    }}
                  >
                    <div
                      className="ps-sheen"
                      style={{ height: 5, background: 'linear-gradient(90deg,var(--p-gold-dark),var(--p-gold-light),var(--p-gold-dark))' }}
                    />
                    <div className="relative overflow-hidden" style={{ height: 208 }}>
                      <div className="absolute inset-0 ps-zoom" style={{ background: artStyle }} />
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
                        <button
                          onClick={() => dispatch(openVideo({ url: e.eventVideo, title: e.eventTitle }))}
                          className="absolute flex items-center gap-[6px] uppercase"
                          style={{
                            right: 11,
                            top: 11,
                            padding: '7px 13px',
                            border: '1px solid color-mix(in srgb,var(--p-gold) 40%,transparent)',
                            borderRadius: 999,
                            cursor: 'pointer',
                            background: 'color-mix(in srgb,var(--p-deeper) 80%,transparent)',
                            color: 'var(--p-gold-light)',
                            font: "600 10.5px/1 'Poppins',sans-serif",
                            letterSpacing: '.06em',
                          }}
                        >
                          ▶ {kn ? 'ಚಿತ್ರ ನೋಡಿ' : 'Watch film'}
                        </button>
                      )}
                    </div>

                    <div className="flex items-start gap-[13px]" style={{ padding: '20px 22px 12px' }}>
                      <div
                        className="flex-none grid place-items-center"
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 13,
                          background: 'linear-gradient(150deg,var(--p-deep),var(--p-deeper))',
                          color: 'var(--p-gold-light)',
                        }}
                      >
                        <EventIcon name={e.eventIcon} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 style={{ margin: 0, font: "700 19px/1.25 'Playfair Display',serif", color: 'var(--p-deep)' }}>
                          {t(e.eventTitle)}
                        </h3>
                        <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.6, color: 'var(--p-muted)' }}>
                          {t(e.eventDescription)}
                        </p>
                      </div>
                    </div>

                    <div
                      className="grid grid-cols-2 mt-auto"
                      style={{ borderTop: '1px solid color-mix(in srgb,var(--p-deep) 10%,transparent)' }}
                    >
                      <div style={{ padding: '15px 18px 18px' }}>
                        <p
                          className="uppercase"
                          style={{ margin: '0 0 9px', font: "600 10px/1 'Poppins',sans-serif", letterSpacing: '.14em', color: 'var(--p-gold-dark)' }}
                        >
                          {kn ? 'ಆಹಾರ' : 'Food'}
                        </p>
                        <ul className="list-none m-0 p-0 flex flex-col gap-[6px]">
                          {e.foodMenu.map((line) => (
                            <li key={line.id} className="relative text-[13px] leading-tight" style={{ paddingLeft: 14 }}>
                              <span
                                className="absolute rounded-full"
                                style={{ left: 0, top: 6, width: 5, height: 5, background: 'var(--p-rose)' }}
                              />
                              {t(line.text)}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div style={{ padding: '15px 18px 18px', borderLeft: '1px solid color-mix(in srgb,var(--p-deep) 10%,transparent)' }}>
                        <p
                          className="uppercase"
                          style={{ margin: '0 0 9px', font: "600 10px/1 'Poppins',sans-serif", letterSpacing: '.14em', color: 'var(--p-gold-dark)' }}
                        >
                          {kn ? 'ವಿನ್ಯಾಸ' : 'Design'}
                        </p>
                        <ul className="list-none m-0 p-0 flex flex-col gap-[6px]">
                          {e.eventDesign.map((line) => (
                            <li key={line.id} className="relative text-[13px] leading-tight" style={{ paddingLeft: 14 }}>
                              <span
                                className="absolute rounded-full"
                                style={{ left: 0, top: 6, width: 5, height: 5, background: 'var(--p-gold-dark)' }}
                              />
                              {t(line.text)}
                            </li>
                          ))}
                        </ul>
                      </div>
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

            <div className="flex flex-col gap-[34px]">
              {foodSections.map((cat) => (
                <div key={cat.id}>
                  <div className="flex items-center gap-[14px]" style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        flex: 'none',
                        borderRadius: 15,
                        border: '1.5px solid color-mix(in srgb,var(--p-gold) 55%,transparent)',
                        background: cat.foodtypeimage
                          ? `center/cover no-repeat url(${cat.foodtypeimage})`
                          : artFor(cat.foodType),
                      }}
                    />
                    <div className="min-w-0">
                      <h3 style={{ margin: 0, font: "700 20px/1.2 'Playfair Display',serif", color: 'var(--p-deep)' }}>
                        {t(cat.foodType)}
                      </h3>
                      <p style={{ margin: '3px 0 0', fontSize: 12.5, color: 'var(--p-muted)' }}>
                        {kn ? `${cat.ds.length} ಭಕ್ಷ್ಯಗಳು ಲಭ್ಯವಿದೆ` : `${cat.ds.length} dishes available`}
                      </p>
                    </div>
                    <span
                      style={{
                        flex: 1,
                        height: 1,
                        marginLeft: 8,
                        background: 'linear-gradient(90deg,color-mix(in srgb,var(--p-gold) 55%,transparent),transparent)',
                      }}
                    />
                  </div>
                  <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(238px,1fr))' }}>
                    {cat.ds.map((d) => (
                      <div
                        key={d.id}
                        className="ps-card flex gap-[12px] items-center"
                        style={{
                          background: 'var(--p-card)',
                          border: '1px solid color-mix(in srgb,var(--p-deep) 12%,transparent)',
                          borderRadius: 13,
                          padding: '11px 13px',
                        }}
                      >
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            flex: 'none',
                            borderRadius: 10,
                            background: d.dishImage
                              ? `center/cover no-repeat url(${d.dishImage})`
                              : artFor(d.dishName),
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-[7px]">
                            <span
                              style={{
                                width: 12,
                                height: 12,
                                flex: 'none',
                                borderRadius: 3,
                                border: `1.6px solid ${d.isVeg ? 'var(--p-veg)' : 'var(--p-nonveg)'}`,
                                background: `radial-gradient(circle,${d.isVeg ? 'var(--p-veg)' : 'var(--p-nonveg)'} 34%,transparent 36%)`,
                              }}
                            />
                            <span className="font-semibold text-[13.5px]" style={{ color: 'var(--p-text)' }}>
                              {t(d.dishName)}
                            </span>
                          </div>
                          <p style={{ margin: '3px 0 0', fontSize: 11.5, lineHeight: 1.45, color: 'var(--p-muted)' }}>
                            {t(d.dishDescription)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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

          {/* ══════════════ TESTIMONIALS ══════════════ */}
          <section
            style={{
              padding: 'clamp(52px,7vw,80px) 24px',
              background: 'linear-gradient(165deg,var(--p-deeper),var(--p-deep) 60%,var(--p-deep-2))',
            }}
          >
            <div className="mx-auto" style={{ maxWidth: 1120 }}>
              <div className="text-center" style={{ marginBottom: 40 }}>
                <p className="ps-eyebrow m-0" style={{ color: 'var(--p-gold)' }}>
                  {kn ? 'ಗ್ರಾಹಕರ ಮಾತು' : 'Kind Words'}
                </p>
                <h2 className="ps-title" style={{ color: 'var(--p-gold-light)' }}>
                  {kn ? 'ನಮ್ಮ ಕುಟುಂಬಗಳು ಹೇಳುವುದು' : 'What Our Families Say'}
                </h2>
              </div>

              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
                {TESTIMONIALS.map((tst, i) => (
                  <figure
                    key={tst.name}
                    className="ps-reveal m-0 flex flex-col"
                    style={{
                      padding: '30px 26px 24px',
                      borderRadius: 18,
                      background: 'rgba(255,255,255,.05)',
                      border: '1px solid color-mix(in srgb,var(--p-gold) 26%,transparent)',
                      backdropFilter: 'blur(6px)',
                      animationDelay: `${i * 0.1}s`,
                    }}
                  >
                    <div
                      style={{
                        font: "700 44px/1 'Playfair Display',serif",
                        color: 'var(--p-gold)',
                        opacity: 0.55,
                        height: 26,
                      }}
                    >
                      “
                    </div>
                    <blockquote
                      className="m-0 flex-1"
                      style={{ fontSize: 13.5, lineHeight: 1.75, color: 'rgba(244,237,224,.86)' }}
                    >
                      {kn ? tst.kn : tst.en}
                    </blockquote>
                    <figcaption
                      className="flex items-center gap-[11px]"
                      style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.1)' }}
                    >
                      <div
                        className="grid place-items-center flex-none"
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          background: 'linear-gradient(150deg,var(--p-gold),var(--p-gold-dark))',
                          color: '#12182c',
                          font: "700 14px/1 'Playfair Display',serif",
                        }}
                      >
                        {tst.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ font: "600 13.5px/1.2 'Poppins',sans-serif", color: 'var(--p-gold-light)' }}>
                          {tst.name}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'rgba(244,237,224,.55)', marginTop: 3 }}>
                          {kn ? tst.role.kn : tst.role.en}
                        </div>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

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
                    ? 'ದಾವಣಗೆರೆಯಲ್ಲಿ ೨೦೧೩ ರಿಂದ ಸ್ಮರಣೀಯ ಆಚರಣೆಗಳನ್ನು ರೂಪಿಸುತ್ತಿದ್ದೇವೆ.'
                    : 'Designing memorable celebrations across Davangere since 2013.'}
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
                    { href: '#process', en: 'How It Works', kn: 'ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ' },
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
