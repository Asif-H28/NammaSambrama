import { useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setDiet, setPublicFilter, openVideo } from '@/features/ui/uiSlice'
import { ART, artFor, EventIcon } from '@/data/icons'
import { photoForEventType } from '@/data/eventTypePhotos'
import { usePublicLanguage } from '@/hooks/usePublicLanguage'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { fetchEvents, fetchFoods } from '@/features/catalog/catalogThunks'

const pill = (active: boolean) =>
  ({
    font: '600 12.5px/1 Poppins,sans-serif',
    padding: '9px 17px',
    borderRadius: 999,
    cursor: 'pointer',
    border: '1.4px solid var(--p-deep)',
    background: active ? 'var(--p-deep)' : 'transparent',
    color: active ? 'var(--p-gold-light)' : 'var(--p-deep)',
  }) as React.CSSProperties

export function PublicSite({ standalone = false }: { standalone?: boolean }) {
  const dispatch = useAppDispatch()
  const events = useAppSelector((s) => s.catalog.events)
  const foods = useAppSelector((s) => s.catalog.foods)
  const diet = useAppSelector((s) => s.ui.diet)
  const publicFilter = useAppSelector((s) => s.ui.publicFilter)
  const eventsLoaded = useAppSelector((s) => s.catalog.eventsLoaded)
  const foodsLoaded = useAppSelector((s) => s.catalog.foodsLoaded)

  // Reads the catalog from the unauthenticated /public endpoints
  useEffect(() => {
    if (!eventsLoaded) dispatch(fetchEvents())
    if (!foodsLoaded) dispatch(fetchFoods())
  }, [eventsLoaded, foodsLoaded, dispatch])

  const types: string[] = []
  events.forEach((e) => {
    if (e.eventType && !types.includes(e.eventType)) types.push(e.eventType)
  })

  const publicList = publicFilter === 'all' ? events : events.filter((e) => e.eventType === publicFilter)

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

  return (
    <>
    <div className="animate-rise" style={standalone ? undefined : { margin: '-26px -32px -70px' }}>
      <PublicHeader lang={lang} onLangChange={setLang} />

      <div style={{ background: 'var(--p-bg)', color: 'var(--p-text)', fontFamily: "'Poppins',sans-serif" }}>
        <header
          className="relative text-center overflow-hidden"
          style={{
            padding: '52px 24px 44px',
            background: 'linear-gradient(160deg,var(--p-deeper),var(--p-deep) 55%,var(--p-deep-2))',
          }}
        >
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(700px 200px at 50% 0%,color-mix(in srgb,var(--p-gold) 22%,transparent),transparent 70%)' }}
          />
          <div className="relative mx-auto" style={{ maxWidth: 640 }}>
            <h1
              className="m-0"
              style={{
                font: "900 clamp(38px,7vw,62px)/1.12 'Noto Sans Kannada',sans-serif",
                color: 'var(--p-gold-light)',
                textShadow: '0 2px 6px rgba(0,0,0,.45)',
              }}
            >
              ನಮ್ಮ ಸಂಭ್ರಮ
            </h1>
            <div
              className="flex items-center justify-center gap-4"
              style={{ margin: '10px 0 16px', font: "700 clamp(20px,3.4vw,28px)/1 'Playfair Display',serif", letterSpacing: '.28em', color: 'var(--p-bg)' }}
            >
              <span style={{ height: 1, width: 44, background: 'var(--p-gold)', opacity: 0.7 }} />
              {lang === 'kn' ? 'ಈವೆಂಟ್‌ಗಳು' : 'EVENTS'}
              <span style={{ height: 1, width: 44, background: 'var(--p-gold)', opacity: 0.7 }} />
            </div>
            <p className="m-0" style={{ font: "700 clamp(19px,2.6vw,24px)/1.3 'Dancing Script',cursive", color: 'var(--p-gold-light)' }}>
              {lang === 'kn' ? 'ಪ್ರತಿಯೊಂದು ಆಚರಣೆಯನ್ನೂ ಸ್ಮರಣೀಯಗೊಳಿಸುವುದು' : 'Making Every Celebration Memorable'}
            </p>
          </div>
        </header>

        <section className="mx-auto" style={{ maxWidth: 1180, padding: '40px 24px 8px' }}>
          <p className="text-center uppercase" style={{ margin: '0 0 6px', font: "700 13px/1 'Playfair Display',serif", letterSpacing: '.18em', color: 'var(--p-deep)' }}>
            {lang === 'kn' ? 'ನಾವು ಯೋಜಿಸುವುದು' : 'What we plan'}
          </p>
          <p className="text-center text-[14px]" style={{ margin: '0 0 26px', color: 'var(--p-muted)' }}>
            {lang === 'kn'
              ? 'ಕೆಳಗಿನ ಪ್ರತಿಯೊಂದು ಈವೆಂಟ್ ಪ್ರಕಾರವನ್ನು ನಮ್ಮ ತಂಡ ನಿರ್ವಹಿಸುತ್ತದೆ — ಫೋಟೋಗಳು, ಮೆನುಗಳು ಮತ್ತು ಅಲಂಕಾರ, ಎಲ್ಲವೂ ಪ್ರಸ್ತುತವಾಗಿ.'
              : 'Every event type below is managed by our team — photos, menus and décor, all kept current.'}
          </p>
          <div className="flex justify-center flex-wrap gap-[9px] mb-[24px]">
            <button style={pill(publicFilter === 'all')} onClick={() => dispatch(setPublicFilter('all'))}>
              {lang === 'kn' ? 'ಎಲ್ಲಾ ಈವೆಂಟ್‌ಗಳು' : 'All Events'}
            </button>
            {types.map((ty) => (
              <button key={ty} style={pill(publicFilter === ty)} onClick={() => dispatch(setPublicFilter(ty))}>
                {t(ty)}
              </button>
            ))}
          </div>

          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(310px,1fr))' }}>
            {publicList.map((e) => {
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
                  className="flex flex-col overflow-hidden animate-rise"
                  style={{
                    background: 'var(--p-card)',
                    borderRadius: 16,
                    border: '1px solid color-mix(in srgb,var(--p-deep) 12%,transparent)',
                    boxShadow: '0 14px 32px -22px color-mix(in srgb,var(--p-deep) 55%,transparent)',
                  }}
                >
                  <div style={{ height: 6, background: 'linear-gradient(90deg,var(--p-gold-dark),var(--p-gold))' }} />
                  <div className="relative" style={{ height: 190, background: artStyle }}>
                    {e.eventVideo && (
                      <button
                        onClick={() => dispatch(openVideo({ url: e.eventVideo, title: e.eventTitle }))}
                        className="absolute flex items-center gap-[6px] uppercase"
                        style={{
                          right: 10,
                          top: 10,
                          padding: '6px 12px',
                          border: 0,
                          borderRadius: 999,
                          cursor: 'pointer',
                          background: 'color-mix(in srgb,var(--p-deeper) 78%,transparent)',
                          color: 'var(--p-gold-light)',
                          font: "600 10.5px/1 'Poppins',sans-serif",
                          letterSpacing: '.06em',
                        }}
                      >
                        ▶ {lang === 'kn' ? 'ಚಿತ್ರ ನೋಡಿ' : 'Watch film'}
                      </button>
                    )}
                  </div>
                  <div className="flex items-start gap-[13px]" style={{ padding: '18px 20px 10px' }}>
                    <div
                      className="flex-none grid place-items-center"
                      style={{ width: 42, height: 42, borderRadius: 12, background: 'color-mix(in srgb,var(--p-deep) 9%,transparent)', color: 'var(--p-gold-dark)' }}
                    >
                      <EventIcon name={e.eventIcon} />
                    </div>
                    <div className="flex-1 min-w-0">
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
                        {t(e.eventType)}
                      </span>
                      <h3 style={{ margin: 0, font: "700 18.5px/1.25 'Playfair Display',serif", color: 'var(--p-deep)' }}>
                        {t(e.eventTitle)}
                      </h3>
                      <p style={{ margin: '5px 0 0', fontSize: 13, lineHeight: 1.5, color: 'var(--p-muted)' }}>
                        {t(e.eventDescription)}
                      </p>
                    </div>
                  </div>
                  <div
                    className="grid grid-cols-2 mt-auto"
                    style={{ borderTop: '1px solid color-mix(in srgb,var(--p-deep) 10%,transparent)' }}
                  >
                    <div style={{ padding: '15px 18px 18px' }}>
                      <p className="uppercase" style={{ margin: '0 0 8px', font: "600 11px/1 'Poppins',sans-serif", letterSpacing: '.08em', color: 'var(--p-muted)' }}>
                        {lang === 'kn' ? 'ಆಹಾರ' : 'Food'}
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
                    <div
                      style={{ padding: '15px 18px 18px', borderLeft: '1px solid color-mix(in srgb,var(--p-deep) 10%,transparent)' }}
                    >
                      <p className="uppercase" style={{ margin: '0 0 8px', font: "600 11px/1 'Poppins',sans-serif", letterSpacing: '.08em', color: 'var(--p-muted)' }}>
                        {lang === 'kn' ? 'ವಿನ್ಯಾಸ' : 'Design'}
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

        <section className="mx-auto" style={{ maxWidth: 1180, padding: '44px 24px 10px' }}>
          <p className="text-center uppercase" style={{ margin: '0 0 6px', font: "700 13px/1 'Playfair Display',serif", letterSpacing: '.18em', color: 'var(--p-deep)' }}>
            {lang === 'kn' ? 'ನಮ್ಮ ಆಹಾರ ಮೆನು' : 'Our food menu'}
          </p>
          <p className="text-center text-[14px]" style={{ margin: '0 0 22px', color: 'var(--p-muted)' }}>
            {lang === 'kn' ? 'ಶುದ್ಧ ಸಸ್ಯಾಹಾರಿ ಮತ್ತು ಮಾಂಸಾಹಾರಿ, ಎಲ್ಲವೂ ಮನೆಯಲ್ಲಿಯೇ ತಯಾರಿಸಲಾಗಿದೆ.' : 'Pure veg and non-veg, all catered in-house.'}
          </p>
          <div className="flex justify-center gap-[9px] mb-[28px]">
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
                {lang === 'kn' ? d.kn : d.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-[30px]">
            {foodSections.map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center gap-[14px] mb-[14px]">
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      flex: 'none',
                      borderRadius: 14,
                      border: '1.5px solid color-mix(in srgb,var(--p-gold) 50%,transparent)',
                      background: cat.foodtypeimage ? `center/cover no-repeat url(${cat.foodtypeimage})` : artFor(cat.foodType),
                    }}
                  />
                  <div>
                    <h3 style={{ margin: 0, font: "700 19px/1.2 'Playfair Display',serif", color: 'var(--p-deep)' }}>
                      {t(cat.foodType)}
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--p-muted)' }}>
                      {lang === 'kn' ? `${cat.ds.length} ಭಕ್ಷ್ಯಗಳು ಲಭ್ಯವಿದೆ` : `${cat.ds.length} dishes available`}
                    </p>
                  </div>
                </div>
                <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))' }}>
                  {cat.ds.map((d) => (
                    <div
                      key={d.id}
                      className="flex gap-[11px] items-center"
                      style={{
                        background: 'var(--p-card)',
                        border: '1px solid color-mix(in srgb,var(--p-deep) 12%,transparent)',
                        borderRadius: 12,
                        padding: '10px 12px',
                      }}
                    >
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          flex: 'none',
                          borderRadius: 9,
                          background: d.dishImage ? `center/cover no-repeat url(${d.dishImage})` : artFor(d.dishName),
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
                        <p style={{ margin: '2px 0 0', fontSize: 11.5, lineHeight: 1.4, color: 'var(--p-muted)' }}>
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

        <footer
          className="text-center"
          style={{ marginTop: 46, background: 'linear-gradient(160deg,var(--p-deeper),var(--p-deep))', padding: '34px 24px 30px' }}
        >
          <p style={{ margin: '0 0 6px', font: "700 15px/1.4 'Playfair Display',serif", color: 'var(--p-gold-light)' }}>
            {lang === 'kn'
              ? 'ಎನ್ ಎನ್ ಕಾಂಪ್ಲೆಕ್ಸ್, ಪೋಲಾರ್ ಬೇರ್ ಎದುರು, ವಿದ್ಯಾನಗರ, ದಾವಣಗೆರೆ – 577005'
              : 'N N Complex, Opposite Polar Bear, Vidyanagar, Davangere – 577005'}
          </p>
          <p className="m-0" style={{ fontSize: 13.5, color: 'var(--p-bg)' }}>
            {lang === 'kn' ? 'ಬುಕಿಂಗ್ ಮತ್ತು ಉಚಿತ ಸಮಾಲೋಚನೆಗಾಗಿ ಕರೆ ಅಥವಾ ವಾಟ್ಸಾಪ್ ಮಾಡಿ' : 'Call or WhatsApp for bookings and free consultation'}
          </p>
          <p style={{ margin: '22px 0 0', font: "700 20px/1 'Dancing Script',cursive", color: 'var(--p-gold-light)' }}>
            {lang === 'kn' ? 'ನಿಮ್ಮ ಕನಸಿನ ಆಚರಣೆ, ನಮ್ಮ ಪರಿಪೂರ್ಣ ಯೋಜನೆ!' : 'Your Dream Event, Our Perfect Planning!'}
          </p>
        </footer>
      </div>
    </div>

      <a
        href="/book"
        className="flex items-center gap-[8px]"
        style={{
          position: 'fixed',
          right: 22,
          bottom: 22,
          zIndex: 40,
          padding: '14px 20px',
          borderRadius: 999,
          background: 'linear-gradient(150deg,var(--p-gold),var(--p-gold-dark))',
          color: 'var(--p-deeper)',
          font: "700 14px/1 'Poppins',sans-serif",
          boxShadow: '0 10px 26px -8px rgba(0,0,0,.5)',
          textDecoration: 'none',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
        </svg>
        {lang === 'kn' ? 'ಈವೆಂಟ್ ಬುಕ್ ಮಾಡಿ' : 'Book an Event'}
      </a>
    </>
  )
}
