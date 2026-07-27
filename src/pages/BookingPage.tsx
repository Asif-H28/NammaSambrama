import { useMemo, useState } from 'react'
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
} from '@/features/booking/bookingSlice'
import { showToast } from '@/features/ui/uiSlice'
import { ART, artFor, EventIcon } from '@/data/icons'
import { photoForEventType } from '@/data/eventTypePhotos'
import { preselectedDishIds } from '@/lib/matchDishes'
import { usePublicLanguage } from '@/hooks/usePublicLanguage'
import { PublicHeader } from '@/components/layout/PublicHeader'

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

  const handleSubmitEnquiry = () => {
    dispatch(showToast(lang === 'kn' ? 'ನಿಮ್ಮ ವಿನಂತಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!' : 'Your enquiry has been submitted!'))
    dispatch(resetBooking())
  }

  const selectedDishes = foods.flatMap((c) => c.dishlist.filter((d) => booking.selectedDishIds.includes(d.id)))
  const theme = useAppSelector((s) => s.ui.theme)
  const mode = useAppSelector((s) => s.ui.mode)

  return (
    <div
      data-theme={theme}
      data-mode={mode}
      style={{ background: 'var(--p-bg)', color: 'var(--p-text)', fontFamily: "'Mukta',sans-serif", minHeight: '100vh' }}
    >
      <PublicHeader lang={lang} onLangChange={setLang} />

      <div
        className="flex items-center justify-center gap-[6px] flex-wrap"
        style={{ padding: '18px 16px 6px' }}
      >
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center gap-[6px]">
            <div
              className="flex items-center gap-[8px]"
              style={{
                padding: '7px 14px',
                borderRadius: 999,
                background: i <= stepIndex ? 'var(--p-deep)' : 'color-mix(in srgb,var(--p-deep) 8%,transparent)',
                color: i <= stepIndex ? 'var(--p-gold-light)' : 'var(--p-muted)',
                font: "600 12.5px/1 'Inter',sans-serif",
              }}
            >
              <span
                className="grid place-items-center"
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  fontSize: 10.5,
                  background: i <= stepIndex ? 'var(--p-gold)' : 'transparent',
                  color: i <= stepIndex ? 'var(--p-deeper)' : 'var(--p-muted)',
                  border: i <= stepIndex ? 'none' : '1.4px solid var(--p-muted)',
                }}
              >
                {i + 1}
              </span>
              {lang === 'kn' ? s.kn : s.en}
            </div>
            {i < STEPS.length - 1 && (
              <span style={{ width: 20, height: 1, background: 'var(--p-muted)', opacity: 0.4 }} />
            )}
          </div>
        ))}
      </div>

      <div className="mx-auto" style={{ maxWidth: 980, padding: '18px 20px 90px' }}>
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
            foods={foods}
            selectedDishes={selectedDishes}
            booking={booking}
            lang={lang}
            t={t}
            onBack={() => dispatch(goToStep('menu'))}
            onContactChange={(patch) => dispatch(setContact(patch))}
            onSubmit={handleSubmitEnquiry}
          />
        )}
      </div>
    </div>
  )
}

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
  onPick: (eventTypeId: string) => void
  onCustomSubmit: () => void
}) {
  return (
    <div className="animate-rise">
      <h2 className="text-center" style={{ font: "700 26px/1.2 'Playfair Display',serif", color: 'var(--p-deep)', margin: '6px 0 4px' }}>
        {lang === 'kn' ? 'ನಿಮ್ಮ ಈವೆಂಟ್ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ' : 'Choose your event type'}
      </h2>
      <p className="text-center text-[13.5px]" style={{ color: 'var(--p-muted)', margin: '0 0 26px' }}>
        {lang === 'kn'
          ? 'ಪಟ್ಟಿಯಲ್ಲಿ ಇಲ್ಲದಿದ್ದರೆ, ಕೆಳಗೆ ನಿಮ್ಮ ಈವೆಂಟ್ ಹೆಸರನ್ನು ಸೇರಿಸಿ.'
          : "Not listed? Add your own event name below."}
      </p>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))' }}>
        {eventTypes.map(([type, ev]) => {
          const typePhoto = photoForEventType(type)
          const bg = ev.eventImage
            ? `center/cover no-repeat url(${ev.eventImage})`
            : typePhoto
              ? `center/cover no-repeat url(${typePhoto})`
              : ev.eventIcon
                ? ART[ev.eventIcon]
                : artFor(type)
          return (
            <button
              key={type}
              onClick={() => onPick(ev.id)}
              className="flex flex-col overflow-hidden text-left"
              style={{
                borderRadius: 16,
                background: 'var(--p-card)',
                border: '1px solid color-mix(in srgb,var(--p-deep) 12%,transparent)',
                cursor: 'pointer',
                boxShadow: '0 10px 24px -18px color-mix(in srgb,var(--p-deep) 55%,transparent)',
              }}
            >
              <div className="relative" style={{ height: 110, background: bg }}>
                <div
                  className="absolute grid place-items-center"
                  style={{
                    left: 10,
                    top: 10,
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: 'color-mix(in srgb,var(--p-deeper) 65%,transparent)',
                    color: 'var(--p-gold-light)',
                  }}
                >
                  <EventIcon name={ev.eventIcon} />
                </div>
              </div>
              <div style={{ padding: '12px 14px 14px' }}>
                <div className="font-semibold text-[14.5px]" style={{ color: 'var(--p-deep)' }}>
                  {t(type)}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div
        className="mx-auto flex items-center gap-[10px] flex-wrap"
        style={{ maxWidth: 520, marginTop: 30, padding: 16, borderRadius: 14, background: 'var(--p-card)', border: '1px dashed color-mix(in srgb,var(--p-deep) 30%,transparent)' }}
      >
        <input
          className="input flex-1 min-w-[180px]"
          placeholder={lang === 'kn' ? 'ನಿಮ್ಮ ಈವೆಂಟ್ ಹೆಸರನ್ನು ಬರೆಯಿರಿ...' : 'Type your event name...'}
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          style={{ background: 'var(--p-bg)', color: 'var(--p-text)', border: '1px solid color-mix(in srgb,var(--p-deep) 20%,transparent)' }}
        />
        <button
          className="btn btn-primary"
          disabled={!customName.trim()}
          onClick={onCustomSubmit}
          style={{ borderColor: 'var(--p-deep)', color: 'var(--p-deep)' }}
        >
          {lang === 'kn' ? 'ಮುಂದುವರಿಸಿ' : 'Continue'}
        </button>
      </div>
    </div>
  )
}

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
  setAddingFor: (id: string | null) => void
  newItemName: string
  setNewItemName: (v: string) => void
  onToggleDish: (id: string) => void
  onAddCustom: (categoryId: string, name: string) => void
  onRemoveCustom: (id: string) => void
  onBack: () => void
  onNext: () => void
}) {
  const totalSelected = booking.selectedDishIds.length + booking.customItems.length

  return (
    <div className="animate-rise">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-[4px]">
        <h2 style={{ font: "700 22px/1.2 'Playfair Display',serif", color: 'var(--p-deep)', margin: 0 }}>
          {lang === 'kn' ? `${eventLabel} — ಮೆನು ಆಯ್ಕೆಮಾಡಿ` : `${eventLabel} — Build your menu`}
        </h2>
        <span className="text-[12.5px]" style={{ color: 'var(--p-muted)' }}>
          {lang === 'kn' ? `${totalSelected} ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ` : `${totalSelected} selected`}
        </span>
      </div>
      <p className="text-[13.5px] mb-[22px]" style={{ color: 'var(--p-muted)' }}>
        {lang === 'kn'
          ? 'ನಿಮಗೆ ಬೇಕಾದ ಭಕ್ಷ್ಯಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಪಟ್ಟಿಯಲ್ಲಿ ಇಲ್ಲದಿದ್ದರೆ, ಪ್ರತಿ ವಿಭಾಗದಲ್ಲಿ ಸೇರಿಸಬಹುದು.'
          : "Pick the dishes you'd like. Don't see something? Add it under any category."}
      </p>

      <div className="flex flex-col gap-[22px]">
        {foods.map((cat) => {
          const customForCat = booking.customItems.filter((c) => c.categoryId === cat.id)
          return (
            <div key={cat.id}>
              <div className="flex items-center gap-[10px] mb-[10px]">
                <div
                  style={{
                    width: 40,
                    height: 40,
                    flex: 'none',
                    borderRadius: 11,
                    border: '1.5px solid color-mix(in srgb,var(--p-gold) 45%,transparent)',
                    background: cat.foodtypeimage ? `center/cover no-repeat url(${cat.foodtypeimage})` : artFor(cat.foodType),
                  }}
                />
                <h3 style={{ margin: 0, font: "700 16.5px/1.2 'Playfair Display',serif", color: 'var(--p-deep)' }}>
                  {t(cat.foodType)}
                </h3>
              </div>

              <div className="grid gap-[9px]" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))' }}>
                {cat.dishlist.map((d) => {
                  const checked = booking.selectedDishIds.includes(d.id)
                  return (
                    <label
                      key={d.id}
                      className="flex items-center gap-[10px]"
                      style={{
                        padding: '10px 12px',
                        borderRadius: 11,
                        cursor: 'pointer',
                        background: checked ? 'color-mix(in srgb,var(--p-gold) 14%,var(--p-card))' : 'var(--p-card)',
                        border: `1.4px solid ${checked ? 'var(--p-gold-dark)' : 'color-mix(in srgb,var(--p-deep) 12%,transparent)'}`,
                      }}
                    >
                      <input type="checkbox" checked={checked} onChange={() => onToggleDish(d.id)} style={{ width: 16, height: 16, flex: 'none' }} />
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          flex: 'none',
                          borderRadius: 3,
                          border: `1.5px solid ${d.isVeg ? 'var(--p-veg)' : 'var(--p-nonveg)'}`,
                          background: `radial-gradient(circle,${d.isVeg ? 'var(--p-veg)' : 'var(--p-nonveg)'} 34%,transparent 36%)`,
                        }}
                      />
                      <span className="text-[13px] min-w-0 flex-1" style={{ color: 'var(--p-text)' }}>
                        {t(d.dishName)}
                      </span>
                    </label>
                  )
                })}

                {customForCat.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-[8px]"
                    style={{
                      padding: '10px 12px',
                      borderRadius: 11,
                      background: 'color-mix(in srgb,var(--p-rose) 14%,var(--p-card))',
                      border: '1.4px dashed var(--p-rose)',
                    }}
                  >
                    <span className="text-[13px] min-w-0 flex-1" style={{ color: 'var(--p-text)' }}>
                      {c.name}{' '}
                      <span style={{ fontSize: 10.5, color: 'var(--p-rose)', textTransform: 'uppercase' }}>
                        {lang === 'kn' ? '(ಹೊಸದು)' : '(added)'}
                      </span>
                    </span>
                    <button
                      onClick={() => onRemoveCustom(c.id)}
                      style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--p-muted)', fontSize: 16, lineHeight: 1 }}
                      aria-label="remove"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              {addingFor === cat.id ? (
                <div className="flex items-center gap-[8px] mt-[10px]">
                  <input
                    autoFocus
                    className="input flex-1 min-w-[160px]"
                    placeholder={lang === 'kn' ? 'ಹೊಸ ಭಕ್ಷ್ಯದ ಹೆಸರು' : 'New dish name'}
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newItemName.trim()) onAddCustom(cat.id, newItemName.trim())
                    }}
                    style={{ background: 'var(--p-bg)', color: 'var(--p-text)', border: '1px solid color-mix(in srgb,var(--p-deep) 20%,transparent)' }}
                  />
                  <button
                    className="btn btn-primary"
                    disabled={!newItemName.trim()}
                    onClick={() => onAddCustom(cat.id, newItemName.trim())}
                    style={{ borderColor: 'var(--p-deep)', color: 'var(--p-deep)' }}
                  >
                    {lang === 'kn' ? 'ಸೇರಿಸಿ' : 'Add'}
                  </button>
                  <button className="btn btn-secondary" onClick={() => setAddingFor(null)} style={{ borderColor: 'var(--p-muted)', color: 'var(--p-muted)' }}>
                    {lang === 'kn' ? 'ರದ್ದು' : 'Cancel'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingFor(cat.id)}
                  className="mt-[10px]"
                  style={{
                    border: '1.4px dashed color-mix(in srgb,var(--p-deep) 30%,transparent)',
                    background: 'transparent',
                    borderRadius: 10,
                    padding: '7px 13px',
                    cursor: 'pointer',
                    color: 'var(--p-deep)',
                    font: "600 12px/1 'Inter',sans-serif",
                  }}
                >
                  + {lang === 'kn' ? 'ಕಾಣೆಯಾದ ಐಟಂ ಸೇರಿಸಿ' : 'Add a missing item'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div
        className="flex items-center justify-between gap-[10px] flex-wrap"
        style={{ marginTop: 30, paddingTop: 18, borderTop: '1px solid color-mix(in srgb,var(--p-deep) 12%,transparent)' }}
      >
        <button className="btn btn-secondary" onClick={onBack} style={{ borderColor: 'var(--p-deep)', color: 'var(--p-deep)' }}>
          {lang === 'kn' ? '← ಹಿಂದಕ್ಕೆ' : '← Back'}
        </button>
        <button className="btn btn-primary" onClick={onNext} style={{ borderColor: 'var(--p-deep)', color: 'var(--p-deep)' }}>
          {lang === 'kn' ? 'ಪರಿಶೀಲನೆಗೆ ಮುಂದುವರಿಸಿ →' : 'Continue to review →'}
        </button>
      </div>
    </div>
  )
}

function ReviewStep({
  eventLabel,
  foods,
  selectedDishes,
  booking,
  lang,
  t,
  onBack,
  onContactChange,
  onSubmit,
}: {
  eventLabel: string
  foods: import('@/types').FoodCategory[]
  selectedDishes: import('@/types').Dish[]
  booking: import('@/types').BookingState
  lang: 'en' | 'kn'
  t: (s: string) => string
  onBack: () => void
  onContactChange: (patch: Partial<Pick<import('@/types').BookingState, 'contactName' | 'contactPhone' | 'contactNotes'>>) => void
  onSubmit: () => void
}) {
  const canSubmit = booking.contactName.trim() && booking.contactPhone.trim()

  return (
    <div className="animate-rise">
      <h2 style={{ font: "700 22px/1.2 'Playfair Display',serif", color: 'var(--p-deep)', margin: '0 0 4px' }}>
        {lang === 'kn' ? 'ನಿಮ್ಮ ಆಯ್ಕೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ' : 'Review your selection'}
      </h2>
      <p className="text-[13.5px] mb-[20px]" style={{ color: 'var(--p-muted)' }}>
        {lang === 'kn' ? 'ಈವೆಂಟ್:' : 'Event:'} <strong style={{ color: 'var(--p-deep)' }}>{eventLabel}</strong>
      </p>

      <div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', marginBottom: 26 }}>
        {foods.map((cat) => {
          const dishes = selectedDishes.filter((d) => cat.dishlist.some((cd) => cd.id === d.id))
          const custom = booking.customItems.filter((c) => c.categoryId === cat.id)
          if (!dishes.length && !custom.length) return null
          return (
            <div key={cat.id} style={{ background: 'var(--p-card)', borderRadius: 12, padding: '14px 16px', border: '1px solid color-mix(in srgb,var(--p-deep) 12%,transparent)' }}>
              <div className="font-semibold text-[13.5px] mb-[8px]" style={{ color: 'var(--p-deep)' }}>
                {t(cat.foodType)}
              </div>
              <ul className="list-none m-0 p-0 flex flex-col gap-[5px]">
                {dishes.map((d) => (
                  <li key={d.id} className="text-[12.5px]" style={{ color: 'var(--p-text)' }}>
                    • {t(d.dishName)}
                  </li>
                ))}
                {custom.map((c) => (
                  <li key={c.id} className="text-[12.5px]" style={{ color: 'var(--p-rose)' }}>
                    • {c.name} ({lang === 'kn' ? 'ಹೊಸದು' : 'added'})
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
        {!selectedDishes.length && !booking.customItems.length && (
          <p className="text-[13px]" style={{ color: 'var(--p-muted)' }}>
            {lang === 'kn' ? 'ಯಾವುದೇ ಐಟಂ ಆಯ್ಕೆ ಮಾಡಿಲ್ಲ.' : 'No items selected yet.'}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-[12px]" style={{ maxWidth: 460, marginBottom: 24 }}>
        <div className="field">
          <label>{lang === 'kn' ? 'ನಿಮ್ಮ ಹೆಸರು' : 'Your name'}</label>
          <input
            className="input"
            value={booking.contactName}
            onChange={(e) => onContactChange({ contactName: e.target.value })}
            style={{ background: 'var(--p-bg)', color: 'var(--p-text)', border: '1px solid color-mix(in srgb,var(--p-deep) 20%,transparent)' }}
          />
        </div>
        <div className="field">
          <label>{lang === 'kn' ? 'ಫೋನ್ ಸಂಖ್ಯೆ' : 'Phone number'}</label>
          <input
            className="input"
            value={booking.contactPhone}
            onChange={(e) => onContactChange({ contactPhone: e.target.value })}
            style={{ background: 'var(--p-bg)', color: 'var(--p-text)', border: '1px solid color-mix(in srgb,var(--p-deep) 20%,transparent)' }}
          />
        </div>
        <div className="field">
          <label>{lang === 'kn' ? 'ಹೆಚ್ಚುವರಿ ಟಿಪ್ಪಣಿಗಳು (ಐಚ್ಛಿಕ)' : 'Additional notes (optional)'}</label>
          <textarea
            className="input"
            value={booking.contactNotes}
            onChange={(e) => onContactChange({ contactNotes: e.target.value })}
            style={{ background: 'var(--p-bg)', color: 'var(--p-text)', border: '1px solid color-mix(in srgb,var(--p-deep) 20%,transparent)' }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-[10px] flex-wrap" style={{ paddingTop: 18, borderTop: '1px solid color-mix(in srgb,var(--p-deep) 12%,transparent)' }}>
        <button className="btn btn-secondary" onClick={onBack} style={{ borderColor: 'var(--p-deep)', color: 'var(--p-deep)' }}>
          {lang === 'kn' ? '← ಹಿಂದಕ್ಕೆ' : '← Back'}
        </button>
        <button
          className="btn btn-primary"
          disabled={!canSubmit}
          onClick={onSubmit}
          style={{ borderColor: 'var(--p-deep)', color: 'var(--p-deep)' }}
        >
          {lang === 'kn' ? 'ವಿನಂತಿ ಸಲ್ಲಿಸಿ' : 'Submit enquiry'}
        </button>
      </div>
    </div>
  )
}
