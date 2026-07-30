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

const STEPS = [
  { key: 'type', en: 'Event', kn: 'ಈವೆಂಟ್' },
  { key: 'menu', en: 'Menu', kn: 'ಮೆನು' },
  { key: 'review', en: 'Review', kn: 'ಪರಿಶೀಲನೆ' },
] as const

const fieldStyle = {
  background: 'var(--p-bg)',
  color: 'var(--p-text)',
  border: '1.4px solid color-mix(in srgb,var(--p-deep) 18%,transparent)',
}

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
      <Toast />
    </div>
  )
}

function BookingHero({ lang, stepIndex }: { lang: 'en' | 'kn'; stepIndex: number }) {
  return (
    <div
      className="relative overflow-hidden text-center"
      style={{
        padding: '46px 24px 34px',
        background: 'linear-gradient(160deg,var(--p-deeper),var(--p-deep) 55%,var(--p-deep-2))',
      }}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(720px 220px at 50% 0%,color-mix(in srgb,var(--p-gold) 26%,transparent),transparent 70%)' }}
      />
      {/* decorative floating motifs for festivity */}
      <div className="absolute" style={{ left: '8%', top: '18%', fontSize: 26, opacity: 0.35, transform: 'rotate(-12deg)' }}>✦</div>
      <div className="absolute" style={{ right: '10%', top: '30%', fontSize: 20, opacity: 0.3, transform: 'rotate(14deg)' }}>✦</div>
      <div className="absolute" style={{ left: '18%', bottom: '14%', fontSize: 16, opacity: 0.25 }}>✦</div>
      <div className="absolute" style={{ right: '20%', bottom: '20%', fontSize: 22, opacity: 0.28, transform: 'rotate(-8deg)' }}>✦</div>

      <div className="relative">
        <p
          className="uppercase m-0"
          style={{ font: "700 11px/1 'Poppins',sans-serif", letterSpacing: '.24em', color: 'var(--p-gold)', marginBottom: 10 }}
        >
          {lang === 'kn' ? '✨ ಬುಕಿಂಗ್ ಪ್ರಾರಂಭಿಸಿ ✨' : '✨ Start your booking ✨'}
        </p>
        <h1
          className="m-0"
          style={{ font: "700 clamp(26px,4vw,38px)/1.2 'Playfair Display',serif", color: 'var(--p-gold-light)', textShadow: '0 2px 8px rgba(0,0,0,.5)' }}
        >
          {lang === 'kn' ? 'ನಿಮ್ಮ ಕನಸಿನ ಆಚರಣೆಯನ್ನು ವಿನ್ಯಾಸಗೊಳಿಸಿ' : 'Design your dream celebration'}
        </h1>
        <p
          style={{
            maxWidth: 480,
            margin: '10px auto 0',
            fontSize: 14.5,
            textAlign: 'center',
            color: 'rgba(255,255,255,.75)',
            fontFamily: "'Poppins',sans-serif",
          }}
        >
          {lang === 'kn'
            ? 'ಕೆಲವು ಸುಲಭ ಹಂತಗಳಲ್ಲಿ ನಿಮ್ಮ ಪರಿಪೂರ್ಣ ಈವೆಂಟ್ ಮೆನುವನ್ನು ರಚಿಸಿ.'
            : "A few easy steps to craft the perfect menu for your special day."}
        </p>

        <div className="flex items-center justify-center gap-[8px] flex-wrap" style={{ marginTop: 26 }}>
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-[8px]">
              <div
                className="flex items-center gap-[8px]"
                style={{
                  padding: '8px 16px',
                  borderRadius: 999,
                  background: i <= stepIndex ? 'var(--p-gold)' : 'rgba(255,255,255,.08)',
                  color: i <= stepIndex ? 'var(--p-deeper)' : 'rgba(255,255,255,.55)',
                  font: "700 12.5px/1 'Poppins',sans-serif",
                  boxShadow: i === stepIndex ? '0 0 0 5px color-mix(in srgb,var(--p-gold) 25%,transparent)' : 'none',
                  transition: 'box-shadow .25s ease',
                }}
              >
                <span
                  className="grid place-items-center"
                  style={{
                    width: 19,
                    height: 19,
                    borderRadius: '50%',
                    fontSize: 10.5,
                    background: i <= stepIndex ? 'var(--p-deeper)' : 'transparent',
                    color: i <= stepIndex ? 'var(--p-gold-light)' : 'rgba(255,255,255,.55)',
                    border: i <= stepIndex ? 'none' : '1.4px solid rgba(255,255,255,.4)',
                  }}
                >
                  {i + 1}
                </span>
                {lang === 'kn' ? s.kn : s.en}
              </div>
              {i < STEPS.length - 1 && (
                <span style={{ width: 24, height: 1.5, background: i < stepIndex ? 'var(--p-gold)' : 'rgba(255,255,255,.25)', borderRadius: 2 }} />
              )}
            </div>
          ))}
        </div>
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
      <h2 className="text-center" style={{ font: "700 30px/1.2 'Playfair Display',serif", color: 'var(--p-deep)', margin: '0 0 8px' }}>
        {lang === 'kn' ? 'ನಾವು ಏನನ್ನು ಆಚರಿಸುತ್ತಿದ್ದೇವೆ?' : 'What are we celebrating? 🎊'}
      </h2>
      <p
        style={{
          fontSize: 14.5,
          textAlign: 'center',
          color: 'var(--p-muted)',
          margin: '0 auto 34px',
          maxWidth: 480,
        }}
      >
        {lang === 'kn'
          ? 'ಪಟ್ಟಿಯಲ್ಲಿ ಇಲ್ಲದಿದ್ದರೆ, ಕೆಳಗೆ ನಿಮ್ಮ ಈವೆಂಟ್ ಹೆಸರನ್ನು ಸೇರಿಸಿ.'
          : "Tap a celebration below to get started — or tell us your own, and we'll build the menu together."}
      </p>

      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))' }}>
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
              className="group relative flex flex-col overflow-hidden text-left"
              style={{
                borderRadius: 20,
                border: '2px solid transparent',
                cursor: 'pointer',
                height: 230,
                background: bg,
                boxShadow: '0 18px 36px -18px color-mix(in srgb,var(--p-deep) 65%,transparent)',
                transition: 'transform .25s cubic-bezier(.2,.9,.3,1.2), box-shadow .25s ease, border-color .25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'
                e.currentTarget.style.boxShadow = '0 26px 48px -16px color-mix(in srgb,var(--p-deep) 70%,transparent)'
                e.currentTarget.style.borderColor = 'var(--p-gold)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 18px 36px -18px color-mix(in srgb,var(--p-deep) 65%,transparent)'
                e.currentTarget.style.borderColor = 'transparent'
              }}
            >
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(195deg,transparent 28%,rgba(0,0,0,.78) 100%)' }}
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                style={{ background: 'linear-gradient(160deg,color-mix(in srgb,var(--p-gold) 22%,transparent),transparent 55%)', transition: 'opacity .25s ease' }}
              />
              <div
                className="absolute grid place-items-center"
                style={{
                  left: 14,
                  top: 14,
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: 'color-mix(in srgb,var(--p-gold) 92%,transparent)',
                  color: 'var(--p-deeper)',
                  boxShadow: '0 6px 16px rgba(0,0,0,.35)',
                }}
              >
                <EventIcon name={ev.eventIcon} />
              </div>
              <div className="relative mt-auto" style={{ padding: '0 18px 18px' }}>
                <div style={{ font: "700 19px/1.25 'Playfair Display',serif", color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,.55)' }}>
                  {t(type)}
                </div>
                <div
                  className="flex items-center gap-[6px]"
                  style={{ marginTop: 8, font: "700 12px/1 'Poppins',sans-serif", color: 'var(--p-gold-light)' }}
                >
                  <span
                    className="grid place-items-center transition-transform group-hover:translate-x-[3px]"
                    style={{ transition: 'transform .2s ease' }}
                  >
                    {lang === 'kn' ? 'ಆಯ್ಕೆಮಾಡಿ' : 'Choose this'} →
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mx-auto flex items-center gap-[10px]" style={{ margin: '38px 0 20px', maxWidth: 560 }}>
        <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,color-mix(in srgb,var(--p-deep) 30%,transparent))' }} />
        <span
          className="uppercase flex-none"
          style={{ font: "700 11.5px/1 'Poppins',sans-serif", letterSpacing: '.14em', color: 'var(--p-gold-dark)', padding: '0 4px' }}
        >
          {lang === 'kn' ? 'ಅಥವಾ' : 'or something else?'}
        </span>
        <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,color-mix(in srgb,var(--p-deep) 30%,transparent),transparent)' }} />
      </div>

      <div
        className="mx-auto flex items-center gap-[14px] flex-wrap"
        style={{
          maxWidth: 560,
          padding: 20,
          borderRadius: 18,
          background: 'linear-gradient(150deg,color-mix(in srgb,var(--p-gold) 14%,var(--p-card)),var(--p-card))',
          border: '2px dashed color-mix(in srgb,var(--p-gold-dark) 55%,transparent)',
          boxShadow: '0 14px 30px -20px color-mix(in srgb,var(--p-deep) 40%,transparent)',
        }}
      >
        <div
          className="grid place-items-center flex-none"
          style={{ width: 42, height: 42, borderRadius: 12, background: 'color-mix(in srgb,var(--p-gold) 24%,transparent)', color: 'var(--p-gold-dark)', fontSize: 18 }}
        >
          ✎
        </div>
        <input
          className="input flex-1 min-w-[180px]"
          placeholder={lang === 'kn' ? 'ನಿಮ್ಮ ಈವೆಂಟ್ ಹೆಸರನ್ನು ಬರೆಯಿರಿ...' : "Have something else in mind? Type it here..."}
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customName.trim()) onCustomSubmit()
          }}
          style={fieldStyle}
        />
        <button
          className="btn"
          disabled={!customName.trim()}
          onClick={onCustomSubmit}
          style={{
            background: customName.trim() ? 'var(--p-gold)' : 'transparent',
            color: customName.trim() ? 'var(--p-deeper)' : 'var(--p-muted)',
            border: `1.5px solid ${customName.trim() ? 'var(--p-gold)' : 'var(--p-muted)'}`,
            fontWeight: 700,
          }}
        >
          {lang === 'kn' ? 'ಮುಂದುವರಿಸಿ →' : 'Continue →'}
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
      <div
        className="flex items-center justify-between flex-wrap gap-3"
        style={{
          marginBottom: 6,
          padding: '18px 22px',
          borderRadius: 18,
          background: 'linear-gradient(150deg,color-mix(in srgb,var(--p-gold) 12%,var(--p-card)),var(--p-card))',
          border: '1.5px solid color-mix(in srgb,var(--p-gold-dark) 28%,transparent)',
          boxShadow: '0 12px 26px -20px color-mix(in srgb,var(--p-deep) 40%,transparent)',
        }}
      >
        <div>
          <p className="uppercase m-0" style={{ font: "700 10.5px/1 'Poppins',sans-serif", letterSpacing: '.16em', color: 'var(--p-gold-dark)', marginBottom: 5 }}>
            {lang === 'kn' ? '🎈 ನಿಮ್ಮ ಈವೆಂಟ್' : '🎈 Your event'}
          </p>
          <h2 style={{ font: "700 23px/1.2 'Playfair Display',serif", color: 'var(--p-deep)', margin: 0 }}>
            {eventLabel}
          </h2>
        </div>
        <span
          className="flex items-center gap-[7px]"
          style={{
            padding: '9px 18px',
            borderRadius: 999,
            background: totalSelected ? 'var(--p-deep)' : 'color-mix(in srgb,var(--p-deep) 10%,transparent)',
            color: totalSelected ? 'var(--p-gold-light)' : 'var(--p-muted)',
            font: "700 13.5px/1 'Poppins',sans-serif",
          }}
        >
          🍽️ {lang === 'kn' ? `${totalSelected} ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ` : `${totalSelected} item${totalSelected === 1 ? '' : 's'} selected`}
        </span>
      </div>
      <p className="text-[14px]" style={{ color: 'var(--p-muted)', margin: '16px 0 28px' }}>
        {lang === 'kn'
          ? 'ನಿಮಗೆ ಬೇಕಾದ ಭಕ್ಷ್ಯಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಪಟ್ಟಿಯಲ್ಲಿ ಇಲ್ಲದಿದ್ದರೆ, ಪ್ರತಿ ವಿಭಾಗದಲ್ಲಿ ಸೇರಿಸಬಹುದು.'
          : "Pick the dishes you'd like — tap a card to add it to your menu. Don't see something? Add it under any category."}
      </p>

      <div className="flex flex-col gap-[30px]">
        {foods.map((cat) => {
          const customForCat = booking.customItems.filter((c) => c.categoryId === cat.id)
          const catSelected = cat.dishlist.filter((d) => booking.selectedDishIds.includes(d.id)).length + customForCat.length
          return (
            <div key={cat.id}>
              <div className="flex items-center gap-[12px] mb-[14px]">
                <div
                  style={{
                    width: 48,
                    height: 48,
                    flex: 'none',
                    borderRadius: 13,
                    border: '2px solid color-mix(in srgb,var(--p-gold) 50%,transparent)',
                    background: cat.foodtypeimage ? `center/cover no-repeat url(${cat.foodtypeimage})` : artFor(cat.foodType),
                    boxShadow: '0 6px 14px -8px color-mix(in srgb,var(--p-deep) 50%,transparent)',
                  }}
                />
                <h3 style={{ margin: 0, font: "700 18px/1.2 'Playfair Display',serif", color: 'var(--p-deep)' }}>
                  {t(cat.foodType)}
                </h3>
                {catSelected > 0 && (
                  <span
                    className="grid place-items-center"
                    style={{ minWidth: 24, height: 24, padding: '0 7px', borderRadius: 999, background: 'var(--p-gold)', color: 'var(--p-deeper)', font: "700 11.5px/1 'Poppins',sans-serif" }}
                  >
                    {catSelected}
                  </span>
                )}
                <span style={{ flex: 1, height: 1, background: 'color-mix(in srgb,var(--p-deep) 10%,transparent)' }} />
              </div>

              <div className="grid gap-[10px]" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))' }}>
                {cat.dishlist.map((d) => {
                  const checked = booking.selectedDishIds.includes(d.id)
                  return (
                    <label
                      key={d.id}
                      className="flex items-center gap-[11px]"
                      style={{
                        padding: '12px 14px',
                        borderRadius: 13,
                        cursor: 'pointer',
                        background: checked ? 'color-mix(in srgb,var(--p-gold) 16%,var(--p-card))' : 'var(--p-card)',
                        border: `2px solid ${checked ? 'var(--p-gold-dark)' : 'color-mix(in srgb,var(--p-deep) 12%,transparent)'}`,
                        boxShadow: checked ? '0 6px 16px -10px color-mix(in srgb,var(--p-gold-dark) 60%,transparent)' : 'none',
                        transition: 'all .15s ease',
                      }}
                    >
                      <span
                        className="grid place-items-center flex-none"
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 6,
                          background: checked ? 'var(--p-gold)' : 'transparent',
                          border: `1.6px solid ${checked ? 'var(--p-gold)' : 'color-mix(in srgb,var(--p-deep) 35%,transparent)'}`,
                          color: 'var(--p-deeper)',
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {checked ? '✓' : ''}
                      </span>
                      <input type="checkbox" checked={checked} onChange={() => onToggleDish(d.id)} style={{ display: 'none' }} />
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
                      <span className="text-[13.5px] min-w-0 flex-1" style={{ color: 'var(--p-text)', fontWeight: checked ? 600 : 400 }}>
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
                      padding: '12px 14px',
                      borderRadius: 13,
                      background: 'color-mix(in srgb,var(--p-rose) 16%,var(--p-card))',
                      border: '2px dashed var(--p-rose)',
                    }}
                  >
                    <span className="text-[13.5px] min-w-0 flex-1" style={{ color: 'var(--p-text)', fontWeight: 600 }}>
                      {c.name}{' '}
                      <span style={{ fontSize: 10.5, color: 'var(--p-rose)', textTransform: 'uppercase', fontWeight: 700 }}>
                        {lang === 'kn' ? '(ಹೊಸದು)' : '(added)'}
                      </span>
                    </span>
                    <button
                      onClick={() => onRemoveCustom(c.id)}
                      style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--p-muted)', fontSize: 18, lineHeight: 1 }}
                      aria-label="remove"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              {addingFor === cat.id ? (
                <div className="flex items-center gap-[8px] mt-[12px]">
                  <input
                    autoFocus
                    className="input flex-1 min-w-[160px]"
                    placeholder={lang === 'kn' ? 'ಹೊಸ ಭಕ್ಷ್ಯದ ಹೆಸರು' : 'New dish name'}
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newItemName.trim()) onAddCustom(cat.id, newItemName.trim())
                    }}
                    style={fieldStyle}
                  />
                  <button
                    className="btn"
                    disabled={!newItemName.trim()}
                    onClick={() => onAddCustom(cat.id, newItemName.trim())}
                    style={{
                      background: newItemName.trim() ? 'var(--p-gold)' : 'transparent',
                      color: newItemName.trim() ? 'var(--p-deeper)' : 'var(--p-muted)',
                      border: `1.5px solid ${newItemName.trim() ? 'var(--p-gold)' : 'var(--p-muted)'}`,
                      fontWeight: 700,
                    }}
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
                  className="mt-[12px]"
                  style={{
                    border: '1.6px dashed color-mix(in srgb,var(--p-gold-dark) 45%,transparent)',
                    background: 'color-mix(in srgb,var(--p-gold) 6%,transparent)',
                    borderRadius: 11,
                    padding: '8px 15px',
                    cursor: 'pointer',
                    color: 'var(--p-gold-dark)',
                    font: "700 12.5px/1 'Poppins',sans-serif",
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
        style={{ marginTop: 34, paddingTop: 20, borderTop: '1px solid color-mix(in srgb,var(--p-deep) 12%,transparent)' }}
      >
        <button className="btn btn-secondary" onClick={onBack} style={{ borderColor: 'var(--p-deep)', color: 'var(--p-deep)' }}>
          {lang === 'kn' ? '← ಹಿಂದಕ್ಕೆ' : '← Back'}
        </button>
        <button
          className="btn"
          onClick={onNext}
          style={{ background: 'var(--p-gold)', color: 'var(--p-deeper)', border: '1.5px solid var(--p-gold)', fontWeight: 700 }}
        >
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
  onContactChange: (
    patch: Partial<
      Pick<import('@/types').BookingState, 'contactName' | 'contactPhone' | 'guestCount' | 'eventDate' | 'eventTime' | 'contactNotes'>
    >,
  ) => void
  onSubmit: () => void
}) {
  const canSubmit =
    booking.contactName.trim() &&
    booking.contactPhone.trim() &&
    booking.guestCount.trim() &&
    booking.eventDate.trim()
  const totalItems = selectedDishes.length + booking.customItems.length

  return (
    <div className="animate-rise">
      <h2 className="text-center" style={{ font: "700 28px/1.2 'Playfair Display',serif", color: 'var(--p-deep)', margin: '0 0 8px' }}>
        {lang === 'kn' ? 'ನಿಮ್ಮ ಆಯ್ಕೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ✨' : "You're almost there! ✨"}
      </h2>
      <p className="text-center text-[14px]" style={{ color: 'var(--p-muted)', margin: '0 0 28px' }}>
        {lang === 'kn' ? 'ಈವೆಂಟ್:' : 'Celebrating:'}{' '}
        <strong style={{ color: 'var(--p-deep)' }}>{eventLabel}</strong>
        {' · '}
        {lang === 'kn' ? `${totalItems} ಐಟಂಗಳು` : `${totalItems} item${totalItems === 1 ? '' : 's'} chosen`}
      </p>

      <div
        className="grid gap-[16px] mx-auto"
        style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,320px))', justifyContent: 'center', marginBottom: 34 }}
      >
        {foods.map((cat) => {
          const dishes = selectedDishes.filter((d) => cat.dishlist.some((cd) => cd.id === d.id))
          const custom = booking.customItems.filter((c) => c.categoryId === cat.id)
          if (!dishes.length && !custom.length) return null
          return (
            <div
              key={cat.id}
              style={{
                background: 'var(--p-card)',
                borderRadius: 15,
                padding: '16px 18px',
                border: '1.5px solid color-mix(in srgb,var(--p-gold-dark) 22%,transparent)',
                boxShadow: '0 10px 22px -18px color-mix(in srgb,var(--p-deep) 50%,transparent)',
              }}
            >
              <div className="flex items-center gap-[8px] font-semibold text-[14px] mb-[10px]" style={{ color: 'var(--p-deep)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--p-gold-dark)' }} />
                {t(cat.foodType)}
              </div>
              <ul className="list-none m-0 p-0 flex flex-col gap-[7px]">
                {dishes.map((d) => (
                  <li key={d.id} className="flex items-center gap-[7px] text-[13px]" style={{ color: 'var(--p-text)' }}>
                    <span style={{ color: 'var(--p-gold-dark)' }}>✓</span> {t(d.dishName)}
                  </li>
                ))}
                {custom.map((c) => (
                  <li key={c.id} className="flex items-center gap-[7px] text-[13px]" style={{ color: 'var(--p-rose)' }}>
                    <span>✓</span> {c.name}{' '}
                    <span style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 700 }}>
                      {lang === 'kn' ? '(ಹೊಸದು)' : '(added)'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
        {!selectedDishes.length && !booking.customItems.length && (
          <p className="text-[13.5px]" style={{ color: 'var(--p-muted)' }}>
            {lang === 'kn' ? 'ಯಾವುದೇ ಐಟಂ ಆಯ್ಕೆ ಮಾಡಿಲ್ಲ.' : 'No items selected yet.'}
          </p>
        )}
      </div>

      <div
        className="mx-auto"
        style={{
          maxWidth: 520,
          padding: 24,
          borderRadius: 20,
          background: 'linear-gradient(150deg,color-mix(in srgb,var(--p-gold) 8%,var(--p-card)),var(--p-card))',
          border: '1.5px solid color-mix(in srgb,var(--p-gold-dark) 25%,transparent)',
          boxShadow: '0 16px 34px -22px color-mix(in srgb,var(--p-deep) 45%,transparent)',
        }}
      >
        <p className="uppercase m-0" style={{ font: "700 11px/1 'Poppins',sans-serif", letterSpacing: '.14em', color: 'var(--p-gold-dark)', marginBottom: 4 }}>
          {lang === 'kn' ? '📞 ಸಂಪರ್ಕ ವಿವರಗಳು' : '📞 Your contact details'}
        </p>
        <p className="text-[13px]" style={{ color: 'var(--p-muted)', margin: '0 0 18px' }}>
          {lang === 'kn' ? 'ನಾವು ನಿಮ್ಮನ್ನು ಶೀಘ್ರದಲ್ಲೇ ಸಂಪರ್ಕಿಸುತ್ತೇವೆ.' : "We'll get back to you shortly to confirm the details."}
        </p>

        <div className="flex flex-col gap-[14px]">
          <div className="field">
            <label style={{ color: 'var(--p-deep)', fontWeight: 600 }}>{lang === 'kn' ? 'ನಿಮ್ಮ ಹೆಸರು' : 'Your name'}</label>
            <input
              className="input"
              placeholder={lang === 'kn' ? 'ಉದಾ. ಸುರೇಶ್ ಕುಮಾರ್' : 'e.g. Suresh Kumar'}
              value={booking.contactName}
              onChange={(e) => onContactChange({ contactName: e.target.value })}
              style={fieldStyle}
            />
          </div>
          <div className="field">
            <label style={{ color: 'var(--p-deep)', fontWeight: 600 }}>{lang === 'kn' ? 'ಫೋನ್ ಸಂಖ್ಯೆ' : 'Phone number'}</label>
            <input
              className="input"
              placeholder={lang === 'kn' ? 'ಉದಾ. 98765 43210' : 'e.g. 98765 43210'}
              value={booking.contactPhone}
              onChange={(e) => onContactChange({ contactPhone: e.target.value })}
              style={fieldStyle}
            />
          </div>
          <div className="field">
            <label style={{ color: 'var(--p-deep)', fontWeight: 600 }}>
              {lang === 'kn' ? 'ಅತಿಥಿಗಳ ಸಂಖ್ಯೆ' : 'Number of guests attending'}
            </label>
            <input
              className="input"
              type="number"
              min={1}
              inputMode="numeric"
              placeholder={lang === 'kn' ? 'ಉದಾ. 150' : 'e.g. 150'}
              value={booking.guestCount}
              onChange={(e) => onContactChange({ guestCount: e.target.value })}
              style={fieldStyle}
            />
          </div>
          <div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))' }}>
            <div className="field">
              <label style={{ color: 'var(--p-deep)', fontWeight: 600 }}>
                {lang === 'kn' ? 'ಈವೆಂಟ್ ದಿನಾಂಕ' : 'Event date'}
              </label>
              <input
                className="input"
                type="date"
                value={booking.eventDate}
                onChange={(e) => onContactChange({ eventDate: e.target.value })}
                style={fieldStyle}
              />
            </div>
            <div className="field">
              <label style={{ color: 'var(--p-deep)', fontWeight: 600 }}>
                {lang === 'kn' ? 'ಸಮಯ (ಐಚ್ಛಿಕ)' : 'Time (optional)'}
              </label>
              <input
                className="input"
                type="time"
                value={booking.eventTime}
                onChange={(e) => onContactChange({ eventTime: e.target.value })}
                style={fieldStyle}
              />
            </div>
          </div>
          <div className="field">
            <label style={{ color: 'var(--p-deep)', fontWeight: 600 }}>
              {lang === 'kn' ? 'ಹೆಚ್ಚುವರಿ ಟಿಪ್ಪಣಿಗಳು (ಐಚ್ಛಿಕ)' : 'Additional notes (optional)'}
            </label>
            <textarea
              className="input"
              placeholder={lang === 'kn' ? 'ಸ್ಥಳ...' : 'Venue...'}
              value={booking.contactNotes}
              onChange={(e) => onContactChange({ contactNotes: e.target.value })}
              style={fieldStyle}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-[10px] flex-wrap" style={{ marginTop: 30, paddingTop: 20, borderTop: '1px solid color-mix(in srgb,var(--p-deep) 12%,transparent)' }}>
        <button className="btn btn-secondary" onClick={onBack} style={{ borderColor: 'var(--p-deep)', color: 'var(--p-deep)' }}>
          {lang === 'kn' ? '← ಹಿಂದಕ್ಕೆ' : '← Back'}
        </button>
        <button
          className="btn"
          disabled={!canSubmit}
          onClick={onSubmit}
          style={{
            background: canSubmit ? 'var(--p-gold)' : 'transparent',
            color: canSubmit ? 'var(--p-deeper)' : 'var(--p-muted)',
            border: `1.5px solid ${canSubmit ? 'var(--p-gold)' : 'var(--p-muted)'}`,
            fontWeight: 700,
            padding: '11px 22px',
          }}
        >
          {lang === 'kn' ? 'ವಿನಂತಿ ಸಲ್ಲಿಸಿ ✓' : 'Submit enquiry ✓'}
        </button>
      </div>
    </div>
  )
}
