import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { goScreen, openPreview } from '@/features/ui/uiSlice'
import {
  patchEvent,
  setEventIcon,
  addFoodLine,
  changeFoodLine,
  removeFoodLine,
  addDesignLine,
  changeDesignLine,
  removeDesignLine,
} from '@/features/forms/formsSlice'
import { commitEvent } from '@/features/forms/formsThunks'
import { eventErrors } from '@/lib/validate'
import { ART, artFor, EventIcon, ICON_KEYS, ICON_LABELS } from '@/data/icons'
import { embedUrl, videoHost } from '@/lib/embed'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useImageUpload } from '@/hooks/useImageUpload'

export function EventForm() {
  const dispatch = useAppDispatch()
  const f = useAppSelector((s) => s.forms.event)
  const validate = useAppSelector((s) => s.ui.validate)
  const saving = useAppSelector((s) => s.catalog.saving)
  const { uploadImage, uploading } = useImageUpload()

  const err = validate ? eventErrors(f) : {}
  const hasErrors = validate && Object.keys(err).length > 0

  // Split layout shows every section at once.
  const showBasics = true
  const showMedia = true
  const showFood = true
  const showDesign = true

  const errStyle = (bad?: boolean): React.CSSProperties =>
    bad
      ? { borderColor: 'var(--t-danger-bd)', background: 'color-mix(in srgb,var(--t-danger-bd) 14%,transparent)' }
      : {}

  const formGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1.45fr) minmax(0,1fr)',
    gap: 14,
    alignItems: 'start',
  }

  const previewArt = f.eventImage
    ? `center/cover no-repeat url(${f.eventImage})`
    : f.eventIcon
      ? ART[f.eventIcon]
      : artFor(f.eventTitle || 'event')

  // Uploads to Azure Blob and stores the returned URL + blob id
  const pickImage = (file: File | undefined) =>
    uploadImage(file, ({ url, publicId }) =>
      dispatch(patchEvent({ eventImage: url, eventImageId: publicId })),
    )

  const hasVideo = !!f.eventVideo && !err.video

  return (
    <div className="animate-rise">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-[16px]">
        <div>
          <button className="btn btn-ghost mb-1" onClick={() => dispatch(goScreen('events'))}>
            ← Event types
          </button>
          <h2 className="m-0" style={{ fontSize: 28 }}>
            {f.id ? 'Edit event type' : 'New event type'}
          </h2>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <button className="btn btn-secondary" onClick={() => dispatch(openPreview())}>
            Preview
          </button>
          <button
            className="btn btn-primary"
            disabled={saving || uploading}
            onClick={() => dispatch(commitEvent())}
          >
            {saving ? 'Saving…' : 'Publish'}
          </button>
        </div>
      </div>

      {hasErrors && (
        <div
          className="mb-[14px] text-[13px]"
          style={{
            padding: '11px 13px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--t-danger-bd)',
            background: 'color-mix(in srgb,var(--t-danger-bd) 18%,transparent)',
            color: 'var(--t-danger-fg)',
          }}
        >
          Fill the required fields marked in red before publishing.
        </div>
      )}

      <div className="app-split" style={formGridStyle}>
        <div className="flex flex-col gap-[14px] min-w-0">
          {showBasics && (
            <section className="card elev-sm p-[18px] gap-[14px]">
              <div className="flex items-center gap-[9px]">
                <span
                  className="grid place-items-center text-[11px]"
                  style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--color-accent-800)', color: 'var(--color-accent-100)' }}
                >
                  1
                </span>
                <h5 className="m-0">Basics</h5>
              </div>
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
                <div className="field">
                  <label>
                    Event type <span style={{ color: 'var(--color-accent)' }}>*</span>
                  </label>
                  <Input
                    list="typeList"
                    placeholder="Wedding"
                    value={f.eventType}
                    onChange={(e) => dispatch(patchEvent({ eventType: e.target.value }))}
                    style={errStyle(err.type)}
                  />
                  <datalist id="typeList">
                    <option value="Wedding" />
                    <option value="Engagement" />
                    <option value="Birthday" />
                    <option value="Baby Shower" />
                    <option value="Corporate" />
                    <option value="School &amp; College" />
                  </datalist>
                  {err.type && (
                    <div className="text-[11.5px] mt-1" style={{ color: 'var(--t-danger)' }}>
                      Event type is required
                    </div>
                  )}
                </div>
                <div className="field">
                  <label>
                    Event title <span style={{ color: 'var(--color-accent)' }}>*</span>
                  </label>
                  <Input
                    placeholder="Traditional Muhurtha Wedding"
                    value={f.eventTitle}
                    onChange={(e) => dispatch(patchEvent({ eventTitle: e.target.value }))}
                    style={errStyle(err.title)}
                  />
                  {err.title && (
                    <div className="text-[11.5px] mt-1" style={{ color: 'var(--t-danger)' }}>
                      Give this event a title customers will recognise
                    </div>
                  )}
                </div>
              </div>
              <div className="field">
                <label>Event description</label>
                <Textarea
                  placeholder="One or two lines that set the mood…"
                  value={f.eventDescription}
                  onChange={(e) => dispatch(patchEvent({ eventDescription: e.target.value.slice(0, 180) }))}
                />
                <div className="flex justify-end text-[11px] mt-[3px]" style={{ color: 'var(--color-neutral-500)' }}>
                  {f.eventDescription.length} / 180
                </div>
              </div>
              <div className="field">
                <label>
                  Event icon <span style={{ color: 'var(--color-accent)' }}>*</span>
                </label>
                <div className="flex gap-2 flex-wrap mt-[2px]">
                  {ICON_KEYS.map((k) => (
                    <button
                      key={k}
                      title={ICON_LABELS[k]}
                      onClick={() => dispatch(setEventIcon(k))}
                      style={{
                        width: 44,
                        height: 44,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: 10,
                        cursor: 'pointer',
                        border: `1px solid ${f.eventIcon === k ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                        background:
                          f.eventIcon === k
                            ? 'color-mix(in srgb, var(--color-accent) 16%, transparent)'
                            : 'var(--color-neutral-900)',
                        color: f.eventIcon === k ? 'var(--color-accent-300)' : 'var(--color-neutral-400)',
                      }}
                    >
                      <EventIcon name={k} />
                    </button>
                  ))}
                </div>
                {err.icon && (
                  <div className="text-[11.5px] mt-[6px]" style={{ color: 'var(--t-danger)' }}>
                    Pick an icon for the card
                  </div>
                )}
              </div>
            </section>
          )}

          {showFood && (
            <section className="card elev-sm p-[18px] gap-[12px]">
              <div className="flex items-center gap-[9px]">
                <span
                  className="grid place-items-center text-[11px]"
                  style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--color-accent-800)', color: 'var(--color-accent-100)' }}
                >
                  3
                </span>
                <h5 className="m-0">Food menu lines</h5>
                <span className="text-muted text-[12px] ml-auto">shown in the left column of the public card</span>
              </div>
              <div className="flex flex-col gap-2">
                {f.foodMenu.map((ln) => (
                  <div key={ln.id} className="flex gap-2 items-center">
                    <span
                      className="flex-none rounded-full"
                      style={{ width: 6, height: 6, background: 'var(--p-rose)' }}
                    />
                    <Input
                      placeholder="e.g. Banana-leaf sit-down feast"
                      value={ln.text}
                      onChange={(e) => dispatch(changeFoodLine({ id: ln.id, text: e.target.value }))}
                    />
                    <button
                      className="btn btn-secondary btn-icon"
                      title="Remove line"
                      onClick={() => dispatch(removeFoodLine(ln.id))}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button className="btn btn-secondary self-start" onClick={() => dispatch(addFoodLine())}>
                + Add menu line
              </button>
            </section>
          )}

          {showDesign && (
            <section className="card elev-sm p-[18px] gap-[12px]">
              <div className="flex items-center gap-[9px]">
                <span
                  className="grid place-items-center text-[11px]"
                  style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--color-accent-800)', color: 'var(--color-accent-100)' }}
                >
                  4
                </span>
                <h5 className="m-0">Event design lines</h5>
                <span className="text-muted text-[12px] ml-auto">décor, stage and lighting</span>
              </div>
              <div className="flex flex-col gap-2">
                {f.eventDesign.map((ln) => (
                  <div key={ln.id} className="flex gap-2 items-center">
                    <span
                      className="flex-none rounded-full"
                      style={{ width: 6, height: 6, background: 'var(--p-gold)' }}
                    />
                    <Input
                      placeholder="e.g. Silk-and-jasmine mandap"
                      value={ln.text}
                      onChange={(e) => dispatch(changeDesignLine({ id: ln.id, text: e.target.value }))}
                    />
                    <button
                      className="btn btn-secondary btn-icon"
                      title="Remove line"
                      onClick={() => dispatch(removeDesignLine(ln.id))}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button className="btn btn-secondary self-start" onClick={() => dispatch(addDesignLine())}>
                + Add design line
              </button>
            </section>
          )}
        </div>

        <div className="flex flex-col gap-[14px] min-w-0">
          {showMedia && (
            <section className="card elev-sm p-[18px] gap-[14px]">
              <div className="flex items-center gap-[9px]">
                <span
                  className="grid place-items-center text-[11px]"
                  style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--color-accent-800)', color: 'var(--color-accent-100)' }}
                >
                  2
                </span>
                <h5 className="m-0">Media</h5>
              </div>

              <div className="field">
                <label>Event image</label>
                <label
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    pickImage(e.dataTransfer.files[0])
                  }}
                  className="block cursor-pointer p-[6px]"
                  style={{
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px dashed var(--color-neutral-700)',
                    background: 'var(--color-neutral-900)',
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => pickImage(e.target.files?.[0])}
                  />
                  {uploading ? (
                    <div
                      className="grid place-items-center text-[13px]"
                      style={{ height: 132, opacity: 0.7 }}
                    >
                      Uploading…
                    </div>
                  ) : f.eventImage ? (
                    <img
                      src={f.eventImage}
                      alt=""
                      style={{ width: '100%', height: 132, objectFit: 'cover', borderRadius: 6 }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-[5px] text-center" style={{ padding: '22px 10px' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: 'var(--color-accent)' }} strokeWidth="1.6">
                        <path d="M4 16l4-5 4 4 3-3 5 6" />
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <circle cx="8.5" cy="9" r="1.5" />
                      </svg>
                      <div className="text-[13px]">
                        Drop a photo here <span className="text-muted">or click to browse</span>
                      </div>
                      <div className="text-[11px]" style={{ color: 'var(--color-neutral-500)' }}>
                        JPG or PNG, landscape, min 1200px wide
                      </div>
                    </div>
                  )}
                </label>
                <div className="flex gap-2 mt-2 items-center">
                  <Input
                    placeholder="…or paste an image URL"
                    value={f.eventImage.indexOf('data:') === 0 ? '' : f.eventImage}
                    onChange={(e) => dispatch(patchEvent({ eventImage: e.target.value }))}
                  />
                  {f.eventImage && (
                    <button className="btn btn-secondary" onClick={() => dispatch(patchEvent({ eventImage: '' }))}>
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="field">
                <label>Event video (YouTube or Vimeo link)</label>
                <Input
                  placeholder="https://youtu.be/…"
                  value={f.eventVideo}
                  onChange={(e) => dispatch(patchEvent({ eventVideo: e.target.value }))}
                />
                {hasVideo && (
                  <div
                    className="flex items-center gap-[9px] mt-2 p-2"
                    style={{ borderRadius: 'var(--radius-md)', background: 'var(--color-neutral-900)' }}
                  >
                    <span
                      className="grid place-items-center"
                      style={{ width: 34, height: 34, borderRadius: 7, background: 'var(--color-accent-800)', color: 'var(--color-accent-100)' }}
                    >
                      ▶
                    </span>
                    <div className="text-[12px] min-w-0">
                      <div>{videoHost(f.eventVideo)} link attached</div>
                      <div
                        className="text-muted overflow-hidden text-ellipsis whitespace-nowrap"
                        style={{ maxWidth: 220 }}
                      >
                        {f.eventVideo}
                      </div>
                    </div>
                  </div>
                )}
                {hasVideo && (
                  <div
                    className="relative overflow-hidden mt-[9px]"
                    style={{ paddingTop: '56.25%', borderRadius: 'var(--radius-md)', background: '#000', boxShadow: '0 0 0 1px var(--color-neutral-800)' }}
                  >
                    <iframe
                      src={embedUrl(f.eventVideo, false)}
                      title="Event film"
                      allow="encrypted-media;picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full border-0"
                    />
                  </div>
                )}
                {err.video && (
                  <div className="text-[11.5px] mt-1" style={{ color: 'var(--t-danger)' }}>
                    Only YouTube or Vimeo links are supported
                  </div>
                )}
              </div>
            </section>
          )}

          {(
            <section
              className="card elev-sm p-[14px] gap-[10px]"
              style={{ background: 'linear-gradient(160deg,var(--color-section),var(--color-surface) 70%)' }}
            >
              <div className="text-[10.5px] uppercase" style={{ letterSpacing: '.1em', color: 'var(--color-accent-300)' }}>
                Public card preview
              </div>
              <div
                className="overflow-hidden"
                style={{ background: 'var(--p-card)', borderRadius: 10, color: 'var(--p-text)', fontFamily: "'Poppins',sans-serif" }}
              >
                <div style={{ height: 5, background: 'linear-gradient(90deg,var(--p-gold-dark),var(--p-gold))' }} />
                <div style={{ height: 128, background: previewArt }} />
                <div style={{ padding: '13px 14px' }}>
                  <span
                    className="inline-block uppercase mb-[7px]"
                    style={{
                      font: "600 9.5px/1 'Poppins',sans-serif",
                      letterSpacing: '.1em',
                      padding: '4px 9px',
                      borderRadius: 999,
                      background: 'color-mix(in srgb,var(--p-rose) 20%,transparent)',
                      color: 'var(--p-rose)',
                    }}
                  >
                    {f.eventType || 'Event type'}
                  </span>
                  <div style={{ font: "700 17px/1.25 'Playfair Display',serif", color: 'var(--p-deep)' }}>
                    {f.eventTitle || 'Your event title appears here'}
                  </div>
                  <p style={{ margin: '5px 0 0', fontSize: 12.5, lineHeight: 1.45, color: 'var(--p-muted)' }}>
                    {f.eventDescription || 'The description you write shows up right here on the card.'}
                  </p>
                </div>
              </div>
              <div className="text-[11.5px]" style={{ color: 'var(--color-neutral-300)' }}>
                Updates as you type.
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
