import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  chooseEventType,
  chooseCustomEvent,
  toggleDish,
  addCustomItem,
  removeCustomItem,
  goToStep,
  setContact,
  resetBooking,
  pruneSelections,
} from '@/features/booking/bookingSlice'
import { showToast } from '@/features/ui/uiSlice'
import { submitEnquiry } from '@/features/enquiries/enquiriesThunks'
import { fetchEvents, fetchFoods } from '@/features/catalog/catalogThunks'
import { ART, artFor, EventIcon } from '@/data/icons'
import { photoForEventType } from '@/data/eventTypePhotos'
import { preselectedDishIds } from '@/lib/matchDishes'
import { usePublicLanguage } from '@/hooks/usePublicLanguage'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { Toast } from '@/components/layout/Toast'

/** Items shown in the review summary before "View all" opens the full list. */
const SUMMARY_LIMIT = 6

const STEPS = [
  { key: 'type', en: 'Event', kn: 'ಈವೆಂಟ್' },
  { key: 'menu', en: 'Menu', kn: 'ಮೆನು' },
  { key: 'review', en: 'Review', kn: 'ಪರಿಶೀಲನೆ' },
] as const

export function BookingPage() {
  const dispatch = useAppDispatch()
  const events = useAppSelector((s) => s.catalog.events)
  const foods = useAppSelector((s) => s.catalog.foods)
  const booking = useAppSelector((s) => s.booking)
  const [customName, setCustomName] = useState('')
  const [addingFor, setAddingFor] = useState<string | null>(null)
  const [newItemName, setNewItemName] = useState('')
  const theme = useAppSelector((s) => s.ui.theme)
  const mode = useAppSelector((s) => s.ui.mode)
  const eventsLoaded = useAppSelector((s) => s.catalog.eventsLoaded)
  const foodsLoaded = useAppSelector((s) => s.catalog.foodsLoaded)

  // Public route — reads the catalog from the unauthenticated endpoints
  useEffect(() => {
    if (!eventsLoaded) dispatch(fetchEvents())
    if (!foodsLoaded) dispatch(fetchFoods())
  }, [eventsLoaded, foodsLoaded, dispatch])

  const eventTypes = useMemo(() => {
    const seen = new Map<string, (typeof events)[number]>()
    events.forEach((e) => {
      if (e.eventType && !seen.has(e.eventType)) seen.set(e.eventType, e)
    })
    return Array.from(seen.entries())
  }, [events])

  const dynamicTexts = useMemo(() => {
    const texts: string[] = []
    eventTypes.forEach(([type]) => texts.push(type))
    foods.forEach((c) => {
      if (c.foodType) texts.push(c.foodType)
      c.dishlist.forEach((d) => {
        if (d.dishName) texts.push(d.dishName)
        if (d.dishDescription) texts.push(d.dishDescription)
      })
    })
    return texts
  }, [eventTypes, foods])

  const { lang, setLang, t } = usePublicLanguage(dynamicTexts)

  const selectedEvent = events.find((e) => e.id === booking.eventTypeId)
  const eventLabel = selectedEvent ? t(selectedEvent.eventType) : booking.customEventName

  const stepIndex = STEPS.findIndex((s) => s.key === booking.step)

  const handlePickEvent = (eventTypeId: string) => {
    const ev = events.find((e) => e.id === eventTypeId)
    const preselected = ev ? preselectedDishIds(ev.foodMenu, foods) : []
    dispatch(chooseEventType({ eventTypeId, preselectedDishIds: preselected }))
  }

  const handleCustomSubmit = () => {
    if (!customName.trim()) return
    dispatch(chooseCustomEvent(customName.trim()))
  }

  // Once the catalogue loads, discard any selection ids it no longer contains
  useEffect(() => {
    if (!foodsLoaded || !foods.length) return
    dispatch(pruneSelections(foods.flatMap((c) => c.dishlist.map((d) => d.id))))
  }, [foodsLoaded, foods, dispatch])

  const selectedDishes = foods.flatMap((c) => c.dishlist.filter((d) => booking.selectedDishIds.includes(d.id)))

  const handleSubmitEnquiry = async () => {
    const result = await dispatch(
      submitEnquiry({
        eventLabel,
        isCustomEvent: !selectedEvent,
        items: [
          ...selectedDishes.map((d) => ({ name: d.dishName, isCustom: false })),
          ...booking.customItems.map((c) => ({ name: c.name, isCustom: true })),
        ],
        contactName: booking.contactName.trim(),
        contactPhone: booking.contactPhone.trim(),
        guestCount: booking.guestCount.trim(),
        eventDate: booking.eventDate,
        eventTime: booking.eventTime,
        contactNotes: booking.contactNotes.trim(),
      }),
    )

    if (submitEnquiry.rejected.match(result)) {
      dispatch(
        showToast(
          result.payload ??
            (lang === 'kn' ? 'ವಿನಂತಿ ಸಲ್ಲಿಸಲು ವಿಫಲವಾಗಿದೆ' : 'Failed to submit enquiry'),
        ),
      )
      return
    }

    dispatch(showToast(lang === 'kn' ? '🎉 ನಿಮ್ಮ ವಿನಂತಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!' : '🎉 Your enquiry has been submitted!'))
    dispatch(resetBooking())
  }

  return (
    <div
      data-theme={theme}
      data-mode={mode}
      style={{ background: 'var(--p-bg)', color: 'var(--p-text)', fontFamily: "'Poppins',sans-serif", minHeight: '100vh' }}
    >
      <PublicHeader lang={lang} onLangChange={setLang} />

      <BookingHero lang={lang} stepIndex={stepIndex} />

      <div className="mx-auto" style={{ maxWidth: 1080, padding: '34px 20px 100px' }}>
        {booking.step === 'type' && (
          <EventTypeStep
            eventTypes={eventTypes}
            lang={lang}
            t={t}
            customName={customName}
            setCustomName={setCustomName}
            onPick={handlePickEvent}
            onCustomSubmit={handleCustomSubmit}
          />
        )}

        {booking.step === 'menu' && (
          <MenuStep
            foods={foods}
            booking={booking}
            eventLabel={eventLabel}
            lang={lang}
            t={t}
            addingFor={addingFor}
            setAddingFor={setAddingFor}
            newItemName={newItemName}
            setNewItemName={setNewItemName}
            onToggleDish={(id) => dispatch(toggleDish(id))}
            onAddCustom={(categoryId, name) => {
              dispatch(addCustomItem({ categoryId, name }))
              setNewItemName('')
              setAddingFor(null)
            }}
            onRemoveCustom={(id) => dispatch(removeCustomItem(id))}
            onBack={() => dispatch(goToStep('type'))}
            onNext={() => dispatch(goToStep('review'))}
          />
        )}

        {booking.step === 'review' && (
          <ReviewStep
            eventLabel={eventLabel}
            selectedDishes={selectedDishes}
            booking={booking}
            lang={lang}
            t={t}
            onBack={() => dispatch(goToStep('menu'))}
            onToggleDish={(id) => dispatch(toggleDish(id))}
            onRemoveCustom={(id) => dispatch(removeCustomItem(id))}
            onContactChange={(patch) => dispatch(setContact(patch))}
            onSubmit={handleSubmitEnquiry}
          />
        )}
      </div>
      <Toast />
    </div>
  )
}

/** Compact progress rail — steps stay legible on a phone. */
function BookingHero({ lang, stepIndex }: { lang: 'en' | 'kn'; stepIndex: number }) {
  const kn = lang === 'kn'
  return (
    <header className="bk-hero">
      <div className="bk-hero-inner">
        <p className="bk-kicker">{kn ? 'ಬುಕಿಂಗ್ ಪ್ರಾರಂಭಿಸಿ' : 'Start your booking'}</p>
        <h1 className="bk-title">
          {kn ? 'ನಿಮ್ಮ ಕನಸಿನ ಆಚರಣೆ' : 'Design your dream celebration'}
        </h1>

        <ol className="bk-rail">
          {STEPS.map((st, i) => (
            <li
              key={st.key}
              className={`bk-rail-step ${i === stepIndex ? 'is-now' : ''} ${i < stepIndex ? 'is-done' : ''}`}
            >
              <span className="bk-rail-dot">{i < stepIndex ? '✓' : i + 1}</span>
              <span className="bk-rail-lbl">{kn ? st.kn : st.en}</span>
            </li>
          ))}
        </ol>
      </div>
    </header>
  )
}

/* ── Step 1: choose the occasion ───────────────────────────────── */
function EventTypeStep({
  eventTypes,
  lang,
  t,
  customName,
  setCustomName,
  onPick,
  onCustomSubmit,
}: {
  eventTypes: [string, import('@/types').EventType][]
  lang: 'en' | 'kn'
  t: (s: string) => string
  customName: string
  setCustomName: (v: string) => void
  onPick: (id: string) => void
  onCustomSubmit: () => void
}) {
  const kn = lang === 'kn'
  const [query, setQuery] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const filtered = query.trim()
    ? eventTypes.filter(([type]) => t(type).toLowerCase().includes(query.trim().toLowerCase()))
    : eventTypes

  return (
    <section>
      <div className="bk-head">
        <h2 className="bk-h2">{kn ? 'ಯಾವ ಸಂದರ್ಭ?' : 'What are we celebrating?'}</h2>
        <p className="bk-sub">
          {kn
            ? 'ಕೆಳಗಿನ ಆಚರಣೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ — ಅಥವಾ ನಿಮ್ಮದೇ ತಿಳಿಸಿ.'
            : 'Pick a celebration below — or tell us your own.'}
        </p>
      </div>

      {/* Search keeps 19 options manageable */}
      {eventTypes.length > 8 && (
        <div className="bk-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={kn ? 'ಹುಡುಕಿ…' : 'Search celebrations…'}
            aria-label={kn ? 'ಹುಡುಕಿ' : 'Search celebrations'}
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label={kn ? 'ತೆರವುಗೊಳಿಸಿ' : 'Clear'}>
              ×
            </button>
          )}
        </div>
      )}

      <div className="bk-grid">
        {filtered.map(([type, ev]) => {
          const photo = ev.eventImage || photoForEventType(type)
          return (
            <button key={ev.id} className="bk-card" onClick={() => onPick(ev.id)}>
              <span className="bk-card-media">
                {photo ? (
                  <img src={photo} alt="" loading="lazy" decoding="async" />
                ) : (
                  <span className="bk-card-art" style={{ background: ev.eventIcon ? ART[ev.eventIcon] : artFor(type) }} />
                )}
              </span>
              <span className="bk-card-body">
                <span className="bk-card-ico">
                  <EventIcon name={ev.eventIcon} />
                </span>
                <span className="bk-card-name">{t(type)}</span>
              </span>
              <span className="bk-card-check">✓</span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="bk-empty">{kn ? 'ಯಾವುದೂ ಸಿಗಲಿಲ್ಲ.' : 'No match — try your own below.'}</p>
      )}

      {/* Custom occasion */}
      <div className="bk-custom">
        {!showCustom ? (
          <button className="bk-link" onClick={() => setShowCustom(true)}>
            {kn ? '+ ಬೇರೆ ಸಂದರ್ಭವೇ? ನಮಗೆ ತಿಳಿಸಿ' : "+ Something else? Tell us about it"}
          </button>
        ) : (
          <div className="bk-custom-row">
            <input
              value={customName}
              autoFocus
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onCustomSubmit()}
              placeholder={kn ? 'ಉದಾ. ನಿವೃತ್ತಿ ಸಮಾರಂಭ' : 'e.g. Retirement party'}
              aria-label={kn ? 'ನಿಮ್ಮ ಸಂದರ್ಭ' : 'Your occasion'}
            />
            <button className="bk-btn bk-btn-primary" disabled={!customName.trim()} onClick={onCustomSubmit}>
              {kn ? 'ಮುಂದೆ' : 'Continue'} →
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

/* ── Step 2: menu, optional and skippable ──────────────────────── */
function MenuStep({
  foods,
  booking,
  eventLabel,
  lang,
  t,
  addingFor,
  setAddingFor,
  newItemName,
  setNewItemName,
  onToggleDish,
  onAddCustom,
  onRemoveCustom,
  onBack,
  onNext,
}: {
  foods: import('@/types').FoodCategory[]
  booking: import('@/types').BookingState
  eventLabel: string
  lang: 'en' | 'kn'
  t: (s: string) => string
  addingFor: string | null
  setAddingFor: (v: string | null) => void
  newItemName: string
  setNewItemName: (v: string) => void
  onToggleDish: (id: string) => void
  onAddCustom: (categoryId: string, name: string) => void
  onRemoveCustom: (id: string) => void
  onBack: () => void
  onNext: () => void
}) {
  const kn = lang === 'kn'
  const [query, setQuery] = useState('')
  const [diet, setDiet] = useState<'all' | 'veg' | 'nonveg'>('all')
  const [cartOpen, setCartOpen] = useState(false)
  const [activeCat, setActiveCat] = useState(foods[0]?.id ?? '')

  const q = query.trim().toLowerCase()

  // Filter by diet and search; keep the category grouping like a real menu
  const sections = foods
    .map((c) => ({
      ...c,
      ds: c.dishlist.filter((d) => {
        if (diet !== 'all' && (diet === 'veg') !== d.isVeg) return false
        if (!q) return true
        return (
          t(d.dishName).toLowerCase().includes(q) ||
          t(d.dishDescription || '').toLowerCase().includes(q)
        )
      }),
    }))
    .filter((c) => c.ds.length)

  // Resolve selections by id so each chosen dish appears exactly once, and any
  // id that is no longer in the catalogue is ignored rather than rendering a
  // phantom row that cannot be removed.
  const dishById = new Map(foods.flatMap((c) => c.dishlist.map((d) => [d.id, d] as const)))
  const selectedDishes = Array.from(new Set(booking.selectedDishIds))
    .map((id) => dishById.get(id))
    .filter((d): d is import('@/types').Dish => Boolean(d))

  const chosenCount = selectedDishes.length + booking.customItems.length

  const jumpTo = (id: string) => {
    setActiveCat(id)
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section>
      <div className="bk-head">
        <p className="bk-crumb">
          <button className="bk-link" onClick={onBack}>← {kn ? 'ಬದಲಾಯಿಸಿ' : 'Change'}</button>
          <b>{eventLabel}</b>
        </p>
        <h2 className="bk-h2">{kn ? 'ಮೆನು ಆಯ್ಕೆ' : 'Choose your menu'}</h2>
        <p className="bk-sub">
          {kn
            ? 'ಇಷ್ಟವಾದ ಭಕ್ಷ್ಯಗಳನ್ನು ಸೇರಿಸಿ — ಅಥವಾ ಬಿಟ್ಟುಬಿಡಿ, ನಾವು ಸಲಹೆ ನೀಡುತ್ತೇವೆ.'
            : "Add what you like — or skip it and we'll advise during the consultation."}
        </p>
      </div>

      {/* Sticky toolbar: search + veg filter, as on a food-delivery menu */}
      <div className="mn-tools">
        <div className="mn-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={kn ? 'ಭಕ್ಷ್ಯ ಹುಡುಕಿ…' : 'Search dishes…'}
            aria-label={kn ? 'ಭಕ್ಷ್ಯ ಹುಡುಕಿ' : 'Search dishes'}
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label={kn ? 'ತೆರವು' : 'Clear'}>×</button>
          )}
        </div>
        <div className="mn-diet">
          {([
            { k: 'all', en: 'All', kn: 'ಎಲ್ಲಾ' },
            { k: 'veg', en: 'Veg', kn: 'ಸಸ್ಯ' },
            { k: 'nonveg', en: 'Non-veg', kn: 'ಮಾಂಸ' },
          ] as const).map((o) => (
            <button
              key={o.k}
              className={diet === o.k ? 'is-on' : ''}
              onClick={() => setDiet(o.k)}
            >
              {o.k !== 'all' && (
                <i className={o.k === 'veg' ? 'fc-dot fc-dot-veg' : 'fc-dot fc-dot-nonveg'} />
              )}
              {kn ? o.kn : o.en}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile course chips — same jump targets as the desktop rail */}
      <div className="mn-chips">
        {sections.map((c) => {
          const n = c.ds.filter((d) => booking.selectedDishIds.includes(d.id)).length
          return (
            <button
              key={c.id}
              className={`mn-chip ${c.id === activeCat ? 'is-on' : ''}`}
              onClick={() => jumpTo(c.id)}
            >
              <i style={c.foodtypeimage ? { backgroundImage: `url(${c.foodtypeimage})` } : undefined} />
              {t(c.foodType)}
              {n > 0 && <b>{n}</b>}
            </button>
          )
        })}
      </div>

      <div className="mn-body">
        {/* Left rail — jump between courses, desktop only */}
        <nav className="mn-rail">
          {sections.map((c) => {
            const n = c.ds.filter((d) => booking.selectedDishIds.includes(d.id)).length
            return (
              <button
                key={c.id}
                className={c.id === activeCat ? 'is-on' : ''}
                onClick={() => jumpTo(c.id)}
              >
                <i
                  className="mn-rail-img"
                  style={
                    c.foodtypeimage
                      ? { backgroundImage: `url(${c.foodtypeimage})` }
                      : undefined
                  }
                />
                <span>{t(c.foodType)}</span>
                {n > 0 ? <b>{n}</b> : <em>{c.ds.length}</em>}
              </button>
            )
          })}
        </nav>

        {/* The menu itself */}
        <div className="mn-list">
          {sections.map((c) => (
            <div className="mn-sec" id={`cat-${c.id}`} key={c.id}>
              <div className="mn-sec-hd">
                {c.foodtypeimage && (
                  <span className="mn-sec-img">
                    <img src={c.foodtypeimage} alt="" loading="lazy" decoding="async" />
                  </span>
                )}
                <span className="mn-sec-txt">
                  <h3>{t(c.foodType)}</h3>
                  <em>
                    {c.ds.length} {kn ? 'ಭಕ್ಷ್ಯಗಳು' : 'items'}
                    {(() => {
                      const n = c.ds.filter((d) => booking.selectedDishIds.includes(d.id)).length
                      return n > 0 ? ` · ${n} ${kn ? 'ಆಯ್ಕೆ' : 'added'}` : ''
                    })()}
                  </em>
                </span>
                <span className="mn-sec-acts">
                  {/* Add every dish in this course at once */}
                  {(() => {
                    const allOn = c.ds.every((d) => booking.selectedDishIds.includes(d.id))
                    return (
                      <button
                        className="mn-sec-all"
                        onClick={() =>
                          c.ds.forEach((d) => {
                            const on = booking.selectedDishIds.includes(d.id)
                            if (allOn ? on : !on) onToggleDish(d.id)
                          })
                        }
                      >
                        {allOn ? (kn ? 'ಎಲ್ಲಾ ತೆಗೆದುಹಾಕಿ' : 'Clear all') : kn ? 'ಎಲ್ಲಾ ಸೇರಿಸಿ' : 'Add all'}
                      </button>
                    )
                  })()}
                </span>
              </div>

              {c.ds.map((d) => {
                const on = booking.selectedDishIds.includes(d.id)
                return (
                  <div className={`mn-row ${on ? 'is-on' : ''}`} key={d.id}>
                    <div className="mn-row-txt">
                      <p className="mn-row-name">
                        <i className={d.isVeg ? 'fc-dot fc-dot-veg' : 'fc-dot fc-dot-nonveg'} />
                        {t(d.dishName)}
                      </p>
                      {d.dishDescription && <p className="mn-row-desc">{t(d.dishDescription)}</p>}
                    </div>
                    {d.dishImage && (
                      <span className="mn-row-img">
                        <img src={d.dishImage} alt="" loading="lazy" decoding="async" />
                      </span>
                    )}
                    <button
                      className={`mn-add ${on ? 'is-on' : ''}`}
                      onClick={() => onToggleDish(d.id)}
                      aria-pressed={on}
                      aria-label={`${on ? 'Remove' : 'Add'} ${d.dishName}`}
                    >
                      {on ? (kn ? '✓ ಸೇರಿಸಲಾಗಿದೆ' : '✓ Added') : kn ? '+ ಸೇರಿಸಿ' : '+ Add'}
                    </button>
                  </div>
                )
              })}

              {/* Request an off-menu dish for this course */}
              {addingFor !== c.id ? (
                <button className="mn-req" onClick={() => setAddingFor(c.id)}>
                  {kn ? '+ ಬೇರೆ ಭಕ್ಷ್ಯ ಕೇಳಿ' : '+ Request something not listed'}
                </button>
              ) : (
                <div className="bk-custom-row" style={{ marginTop: 10 }}>
                  <input
                    value={newItemName}
                    autoFocus
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && newItemName.trim() && onAddCustom(c.id, newItemName.trim())
                    }
                    placeholder={kn ? 'ಭಕ್ಷ್ಯದ ಹೆಸರು' : 'Dish name'}
                    aria-label={kn ? 'ಭಕ್ಷ್ಯದ ಹೆಸರು' : 'Dish name'}
                  />
                  <button
                    className="bk-btn bk-btn-ghost"
                    disabled={!newItemName.trim()}
                    onClick={() => onAddCustom(c.id, newItemName.trim())}
                  >
                    {kn ? 'ಸೇರಿಸಿ' : 'Add'}
                  </button>
                </div>
              )}
            </div>
          ))}

          {sections.length === 0 && (
            <p className="bk-empty">{kn ? 'ಯಾವುದೂ ಸಿಗಲಿಲ್ಲ.' : 'Nothing matches that search.'}</p>
          )}
        </div>
      </div>

      {/* Cart sheet — review and remove what's chosen */}
      {cartOpen && chosenCount > 0 && (
        <div className="mn-cart" onClick={() => setCartOpen(false)}>
          <div className="mn-cart-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mn-cart-hd">
              <h4>{kn ? 'ನಿಮ್ಮ ಆಯ್ಕೆ' : 'Your selection'} ({chosenCount})</h4>
              <button onClick={() => setCartOpen(false)} aria-label={kn ? 'ಮುಚ್ಚಿ' : 'Close'}>×</button>
            </div>
            <div className="mn-cart-list">
              {selectedDishes.map((d) => (
                <div className="mn-cart-row" key={d.id}>
                  <i className={d.isVeg ? 'fc-dot fc-dot-veg' : 'fc-dot fc-dot-nonveg'} />
                  <span>{t(d.dishName)}</span>
                  <button onClick={() => onToggleDish(d.id)} aria-label="Remove">×</button>
                </div>
              ))}
              {booking.customItems.map((c) => (
                <div className="mn-cart-row is-custom" key={c.id}>
                  <span>{c.name}</span>
                  <button onClick={() => onRemoveCustom(c.id)} aria-label="Remove">×</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sticky bar doubles as the cart trigger */}
      <div className="bk-bar">
        <div className="bk-bar-in">
          {chosenCount > 0 ? (
            <button className="mn-cart-btn" onClick={() => setCartOpen(true)}>
              <b>{chosenCount}</b>
              {kn ? 'ಆಯ್ಕೆಯಾಗಿದೆ · ನೋಡಿ' : 'items selected · view'}
            </button>
          ) : (
            <span className="bk-bar-info">
              {kn ? 'ಆಯ್ಕೆ ಐಚ್ಛಿಕ' : 'Selection is optional'}
            </span>
          )}
          <div className="bk-bar-acts">
            <button className="bk-btn bk-btn-ghost" onClick={onBack}>
              {kn ? 'ಹಿಂದೆ' : 'Back'}
            </button>
            <button className="bk-btn bk-btn-primary" onClick={onNext}>
              {chosenCount > 0
                ? `${kn ? 'ಮುಂದೆ' : 'Continue'} →`
                : `${kn ? 'ಬಿಟ್ಟುಬಿಡಿ' : 'Skip'} →`}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Step 3: contact details ───────────────────────────────────── */
function ReviewStep({
  eventLabel,
  selectedDishes,
  booking,
  lang,
  t,
  onBack,
  onToggleDish,
  onRemoveCustom,
  onContactChange,
  onSubmit,
}: {
  eventLabel: string
  selectedDishes: import('@/types').Dish[]
  booking: import('@/types').BookingState
  lang: 'en' | 'kn'
  t: (s: string) => string
  onBack: () => void
  onToggleDish: (id: string) => void
  onRemoveCustom: (id: string) => void
  onContactChange: (
    patch: Partial<
      Pick<import('@/types').BookingState, 'contactName' | 'contactPhone' | 'guestCount' | 'eventDate' | 'eventTime' | 'contactNotes'>
    >,
  ) => void
  onSubmit: () => void
}) {
  const kn = lang === 'kn'
  const [touched, setTouched] = useState(false)
  const [sending, setSending] = useState(false)
  const [viewAll, setViewAll] = useState(false)

  // Escape closes the list, and the page behind must not scroll
  useEffect(() => {
    if (!viewAll) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setViewAll(false)
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [viewAll])


  const phoneDigits = booking.contactPhone.replace(/\D/g, '')
  const nameOk = booking.contactName.trim().length > 1
  const phoneOk = phoneDigits.length >= 10
  const valid = nameOk && phoneOk
  const itemCount = selectedDishes.length + booking.customItems.length

  // Catalogue dishes and custom requests in one list for the summary
  const allItems = [
    ...selectedDishes.map((d) => ({
      key: d.id,
      name: t(d.dishName),
      isVeg: d.isVeg,
      isCustom: false,
    })),
    ...booking.customItems.map((c) => ({
      key: c.id,
      name: c.name,
      isVeg: true,
      isCustom: true,
    })),
  ]

  const submit = async () => {
    setTouched(true)
    if (!valid || sending) return
    setSending(true)
    await onSubmit()
    setSending(false)
  }

  return (
    <section>
      <div className="bk-head">
        <p className="bk-crumb">
          <button className="bk-link" onClick={onBack}>← {kn ? 'ಮೆನು' : 'Menu'}</button>
          <b>{eventLabel}</b>
        </p>
        <h2 className="bk-h2">{kn ? 'ನಿಮ್ಮ ವಿವರಗಳು' : 'Almost there'}</h2>
        <p className="bk-sub">
          {kn
            ? 'ನಿಮ್ಮ ಸಂಪರ್ಕ ವಿವರ ನೀಡಿ — ನಾವು ಶೀಘ್ರದಲ್ಲೇ ಕರೆ ಮಾಡುತ್ತೇವೆ.'
            : "Leave your details and we'll call you back to plan the rest."}
        </p>
      </div>

      <div className="bk-review">
        {/* Summary */}
        <aside className="bk-summary">
          <p className="bk-summary-hd">{kn ? 'ಸಾರಾಂಶ' : 'Your enquiry'}</p>
          <dl>
            <dt>{kn ? 'ಸಂದರ್ಭ' : 'Occasion'}</dt>
            <dd>{eventLabel || '—'}</dd>
            <dt>{kn ? 'ಆಯ್ಕೆಗಳು' : 'Menu items'}</dt>
            <dd>
              {itemCount > 0
                ? `${itemCount} ${kn ? 'ಆಯ್ಕೆಯಾಗಿದೆ' : 'selected'}`
                : kn
                  ? 'ಸಮಾಲೋಚನೆಯಲ್ಲಿ ನಿರ್ಧರಿಸಲಾಗುವುದು'
                  : "We'll advise on the menu"}
            </dd>
          </dl>
          {itemCount > 0 && (
            <>
              <div className="bk-summary-items">
                {allItems.slice(0, SUMMARY_LIMIT).map((it) => (
                  <span key={it.key}>{it.name}</span>
                ))}
                {itemCount > SUMMARY_LIMIT && (
                  <span className="is-more">+{itemCount - SUMMARY_LIMIT}</span>
                )}
              </div>
              <button className="bk-summary-view" onClick={() => setViewAll(true)}>
                {kn ? `ಎಲ್ಲಾ ${itemCount} ನೋಡಿ` : `View all ${itemCount} items`} →
              </button>
            </>
          )}
        </aside>

        {/* Contact form */}
        <form
          className="bk-form"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <div className="bk-field">
            <label htmlFor="bk-name">
              {kn ? 'ನಿಮ್ಮ ಹೆಸರು' : 'Your name'} <i>*</i>
            </label>
            <input
              id="bk-name"
              value={booking.contactName}
              onChange={(e) => onContactChange({ contactName: e.target.value })}
              onBlur={() => setTouched(true)}
              placeholder={kn ? 'ಪೂರ್ಣ ಹೆಸರು' : 'Full name'}
              className={touched && !nameOk ? 'is-bad' : ''}
            />
            {touched && !nameOk && (
              <small>{kn ? 'ಹೆಸರು ನಮೂದಿಸಿ' : 'Please enter your name'}</small>
            )}
          </div>

          <div className="bk-field">
            <label htmlFor="bk-phone">
              {kn ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ' : 'Mobile number'} <i>*</i>
            </label>
            <input
              id="bk-phone"
              inputMode="tel"
              value={booking.contactPhone}
              onChange={(e) => onContactChange({ contactPhone: e.target.value })}
              onBlur={() => setTouched(true)}
              placeholder={kn ? '10 ಅಂಕಿಗಳ ಸಂಖ್ಯೆ' : '10-digit number'}
              className={touched && !phoneOk ? 'is-bad' : ''}
            />
            {touched && !phoneOk && (
              <small>{kn ? 'ಸರಿಯಾದ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ' : 'Enter a valid contact number'}</small>
            )}
          </div>

          <div className="bk-field-row">
            <div className="bk-field">
              <label htmlFor="bk-guests">{kn ? 'ಅತಿಥಿಗಳು' : 'Guests'}</label>
              <input
                id="bk-guests"
                inputMode="numeric"
                value={booking.guestCount}
                onChange={(e) => onContactChange({ guestCount: e.target.value })}
                placeholder={kn ? 'ಉದಾ. 250' : 'e.g. 250'}
              />
            </div>
            <div className="bk-field">
              <label htmlFor="bk-date">{kn ? 'ದಿನಾಂಕ' : 'Date'}</label>
              <input
                id="bk-date"
                type="date"
                value={booking.eventDate}
                onChange={(e) => onContactChange({ eventDate: e.target.value })}
              />
            </div>
            <div className="bk-field">
              <label htmlFor="bk-time">{kn ? 'ಸಮಯ' : 'Time'}</label>
              <input
                id="bk-time"
                type="time"
                value={booking.eventTime}
                onChange={(e) => onContactChange({ eventTime: e.target.value })}
              />
            </div>
          </div>

          <div className="bk-field">
            <label htmlFor="bk-notes">{kn ? 'ಟಿಪ್ಪಣಿ' : 'Anything else?'}</label>
            <textarea
              id="bk-notes"
              rows={3}
              value={booking.contactNotes}
              onChange={(e) => onContactChange({ contactNotes: e.target.value })}
              placeholder={
                kn ? 'ಸ್ಥಳ, ಬಜೆಟ್, ವಿಶೇಷ ವಿನಂತಿ…' : 'Venue, budget, special requests…'
              }
            />
          </div>

          <p className="bk-assure">
            {kn
              ? '✓ ಉಚಿತ ಸಮಾಲೋಚನೆ · ಯಾವುದೇ ಬದ್ಧತೆ ಇಲ್ಲ'
              : '✓ Free consultation · No commitment'}
          </p>
        </form>
      </div>

      {/* Full item list */}
      {viewAll && (
        <div className="mn-modal" onClick={() => setViewAll(false)} role="dialog" aria-modal="true">
          <div className="mn-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mn-modal-hd">
              <span className="mn-modal-txt">
                <h4>{kn ? 'ನಿಮ್ಮ ಆಯ್ಕೆ' : 'Your menu selection'}</h4>
                <em>
                  {itemCount} {kn ? 'ಭಕ್ಷ್ಯಗಳು' : 'items'} · {eventLabel}
                </em>
              </span>
              <button
                className="mn-modal-x"
                onClick={() => setViewAll(false)}
                aria-label={kn ? 'ಮುಚ್ಚಿ' : 'Close'}
              >
                ×
              </button>
            </div>

            <div className="mn-modal-list">
              {allItems.map((it) => (
                <div className="mn-cart-row" key={it.key}>
                  {!it.isCustom && (
                    <i className={it.isVeg ? 'fc-dot fc-dot-veg' : 'fc-dot fc-dot-nonveg'} />
                  )}
                  <span>{it.name}</span>
                  {it.isCustom && (
                    <em style={{ fontStyle: 'normal', fontSize: 11, opacity: 0.6 }}>
                      {kn ? 'ವಿನಂತಿ' : 'requested'}
                    </em>
                  )}
                  <button
                    onClick={() => (it.isCustom ? onRemoveCustom(it.key) : onToggleDish(it.key))}
                    aria-label={`${kn ? 'ತೆಗೆದುಹಾಕಿ' : 'Remove'} ${it.name}`}
                    title={kn ? 'ತೆಗೆದುಹಾಕಿ' : 'Remove'}
                  >
                    ×
                  </button>
                </div>
              ))}

              {allItems.length === 0 && (
                <p className="mn-modal-empty">
                  {kn
                    ? 'ಯಾವುದೂ ಆಯ್ಕೆಯಾಗಿಲ್ಲ — ನಾವು ಮೆನು ಸಲಹೆ ನೀಡುತ್ತೇವೆ.'
                    : "Nothing selected — we'll advise on the menu."}
                </p>
              )}
            </div>

            <div className="mn-modal-ft">
              <button className="bk-btn bk-btn-ghost" onClick={onBack}>
                {kn ? 'ಮೆನು ಬದಲಾಯಿಸಿ' : 'Edit menu'}
              </button>
              <button className="bk-btn bk-btn-primary" onClick={() => setViewAll(false)}>
                {kn ? 'ಮುಗಿಯಿತು' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky submit */}
      <div className="bk-bar">
        <div className="bk-bar-in">
          <span className="bk-bar-info">
            {valid || !touched
              ? kn
                ? 'ನಾವು 24 ಗಂಟೆಗಳಲ್ಲಿ ಕರೆ ಮಾಡುತ್ತೇವೆ'
                : "We'll call you within 24 hours"
              : kn
                ? 'ಅಗತ್ಯ ವಿವರ ಭರ್ತಿ ಮಾಡಿ'
                : 'Fill the required fields'}
          </span>
          <div className="bk-bar-acts">
            <button className="bk-btn bk-btn-ghost" onClick={onBack}>
              {kn ? 'ಹಿಂದೆ' : 'Back'}
            </button>
            <button
              className="bk-btn bk-btn-primary"
              disabled={sending}
              onClick={submit}
            >
              {sending
                ? kn
                  ? 'ಕಳುಹಿಸುತ್ತಿದೆ…'
                  : 'Sending…'
                : kn
                  ? 'ವಿನಂತಿ ಕಳುಹಿಸಿ'
                  : 'Send my enquiry'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
