import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { goScreen, setDiet, setPublicFilter, openVideo } from '@/features/ui/uiSlice'
import { ART, artFor, EventIcon } from '@/data/icons'

const pill = (active: boolean) =>
  ({
    font: '600 12.5px/1 Inter,sans-serif',
    padding: '9px 17px',
    borderRadius: 999,
    cursor: 'pointer',
    border: '1.4px solid var(--p-deep)',
    background: active ? 'var(--p-deep)' : 'transparent',
    color: active ? 'var(--p-gold-light)' : 'var(--p-deep)',
  }) as React.CSSProperties

export function PublicSite() {
  const dispatch = useAppDispatch()
  const events = useAppSelector((s) => s.catalog.events)
  const foods = useAppSelector((s) => s.catalog.foods)
  const diet = useAppSelector((s) => s.ui.diet)
  const publicFilter = useAppSelector((s) => s.ui.publicFilter)

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

  return (
    <div className="animate-rise" style={{ margin: '-26px -32px -70px' }}>
      <div
        className="flex items-center gap-[10px] flex-wrap text-[12px]"
        style={{ padding: '9px 18px', background: '#1b1e2f', borderBottom: '1px solid var(--color-divider)' }}
      >
        <span className="rounded-full" style={{ width: 7, height: 7, background: 'var(--t-veg)' }} />
        <span>Live customer site</span>
        <span className="text-muted">nammasambhrama.in — reflects everything published in admin</span>
        <button className="btn btn-ghost ml-auto" onClick={() => dispatch(goScreen('events'))}>
          Back to admin
        </button>
      </div>

      <div style={{ background: 'var(--p-bg)', color: 'var(--p-text)', fontFamily: "'Mukta',sans-serif" }}>
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
              EVENTS
              <span style={{ height: 1, width: 44, background: 'var(--p-gold)', opacity: 0.7 }} />
            </div>
            <p className="m-0" style={{ font: "700 clamp(19px,2.6vw,24px)/1.3 'Dancing Script',cursive", color: 'var(--p-gold-light)' }}>
              Making Every Celebration Memorable
            </p>
          </div>
        </header>

        <section className="mx-auto" style={{ maxWidth: 1180, padding: '40px 24px 8px' }}>
          <p className="text-center uppercase" style={{ margin: '0 0 6px', font: "700 13px/1 'Playfair Display',serif", letterSpacing: '.18em', color: 'var(--p-deep)' }}>
            What we plan
          </p>
          <p className="text-center text-[14px]" style={{ margin: '0 0 26px', color: 'var(--p-muted)' }}>
            Every event type below is managed by our team — photos, menus and décor, all kept current.
          </p>
          <div className="flex justify-center flex-wrap gap-[9px] mb-[24px]">
            <button style={pill(publicFilter === 'all')} onClick={() => dispatch(setPublicFilter('all'))}>
              All Events
            </button>
            {types.map((t) => (
              <button key={t} style={pill(publicFilter === t)} onClick={() => dispatch(setPublicFilter(t))}>
                {t}
              </button>
            ))}
          </div>

          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(310px,1fr))' }}>
            {publicList.map((e) => {
              const artStyle = e.eventImage
                ? `center/cover no-repeat url(${e.eventImage})`
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
                          font: "600 10.5px/1 'Inter',sans-serif",
                          letterSpacing: '.06em',
                        }}
                      >
                        ▶ Watch film
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
                          font: "600 9.5px/1 'Inter',sans-serif",
                          letterSpacing: '.1em',
                          padding: '4px 9px',
                          borderRadius: 999,
                          background: 'color-mix(in srgb,var(--p-rose) 20%,transparent)',
                          color: 'var(--p-rose)',
                        }}
                      >
                        {e.eventType}
                      </span>
                      <h3 style={{ margin: 0, font: "700 18.5px/1.25 'Playfair Display',serif", color: 'var(--p-deep)' }}>
                        {e.eventTitle}
                      </h3>
                      <p style={{ margin: '5px 0 0', fontSize: 13, lineHeight: 1.5, color: 'var(--p-muted)' }}>
                        {e.eventDescription}
                      </p>
                    </div>
                  </div>
                  <div
                    className="grid grid-cols-2 mt-auto"
                    style={{ borderTop: '1px solid color-mix(in srgb,var(--p-deep) 10%,transparent)' }}
                  >
                    <div style={{ padding: '15px 18px 18px' }}>
                      <p className="uppercase" style={{ margin: '0 0 8px', font: "600 11px/1 'Inter',sans-serif", letterSpacing: '.08em', color: 'var(--p-muted)' }}>
                        Food
                      </p>
                      <ul className="list-none m-0 p-0 flex flex-col gap-[6px]">
                        {e.foodMenu.map((line) => (
                          <li key={line.id} className="relative text-[13px] leading-tight" style={{ paddingLeft: 14 }}>
                            <span
                              className="absolute rounded-full"
                              style={{ left: 0, top: 6, width: 5, height: 5, background: 'var(--p-rose)' }}
                            />
                            {line.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div
                      style={{ padding: '15px 18px 18px', borderLeft: '1px solid color-mix(in srgb,var(--p-deep) 10%,transparent)' }}
                    >
                      <p className="uppercase" style={{ margin: '0 0 8px', font: "600 11px/1 'Inter',sans-serif", letterSpacing: '.08em', color: 'var(--p-muted)' }}>
                        Design
                      </p>
                      <ul className="list-none m-0 p-0 flex flex-col gap-[6px]">
                        {e.eventDesign.map((line) => (
                          <li key={line.id} className="relative text-[13px] leading-tight" style={{ paddingLeft: 14 }}>
                            <span
                              className="absolute rounded-full"
                              style={{ left: 0, top: 6, width: 5, height: 5, background: 'var(--p-gold-dark)' }}
                            />
                            {line.text}
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
            Our food menu
          </p>
          <p className="text-center text-[14px]" style={{ margin: '0 0 22px', color: 'var(--p-muted)' }}>
            Pure veg and non-veg, all catered in-house.
          </p>
          <div className="flex justify-center gap-[9px] mb-[28px]">
            {[
              { key: 'all', label: 'All Items' },
              { key: 'veg', label: 'Pure Veg' },
              { key: 'nonveg', label: 'Non-Veg' },
            ].map((d) => (
              <button
                key={d.key}
                style={pill(diet === d.key)}
                onClick={() => dispatch(setDiet(d.key as 'all' | 'veg' | 'nonveg'))}
              >
                {d.label}
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
                      {cat.foodType}
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--p-muted)' }}>
                      {cat.ds.length} dishes available
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
                            {d.dishName}
                          </span>
                        </div>
                        <p style={{ margin: '2px 0 0', fontSize: 11.5, lineHeight: 1.4, color: 'var(--p-muted)' }}>
                          {d.dishDescription}
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
            N N Complex, Opposite Polar Bear, Vidyanagar, Davangere – 577005
          </p>
          <p className="m-0" style={{ fontSize: 13.5, color: 'var(--p-bg)' }}>
            Call or WhatsApp for bookings and free consultation
          </p>
          <p style={{ margin: '22px 0 0', font: "700 20px/1 'Dancing Script',cursive", color: 'var(--p-gold-light)' }}>
            Your Dream Event, Our Perfect Planning!
          </p>
        </footer>
      </div>
    </div>
  )
}
