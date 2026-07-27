import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { goScreen, openPreview } from '@/features/ui/uiSlice'
import { patchFood, addDish, patchDish, removeDish } from '@/features/forms/formsSlice'
import { commitFood } from '@/features/forms/formsThunks'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function FoodForm() {
  const dispatch = useAppDispatch()
  const g = useAppSelector((s) => s.forms.food)
  const validate = useAppSelector((s) => s.ui.validate)

  const errFoodType = validate && !g.foodType.trim()

  const readImage = (file: File | undefined, cb: (dataUrl: string) => void) => {
    if (!file) return
    const r = new FileReader()
    r.onload = () => cb(r.result as string)
    r.readAsDataURL(file)
  }

  return (
    <div className="animate-rise">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-[16px]">
        <div>
          <button className="btn btn-ghost mb-1" onClick={() => dispatch(goScreen('foods'))}>
            ← Food categories
          </button>
          <h2 className="m-0" style={{ fontSize: 28 }}>
            {g.id ? 'Edit food category' : 'New food category'}
          </h2>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => dispatch(openPreview())}>
            Preview
          </button>
          <button className="btn btn-primary" onClick={() => dispatch(commitFood())}>
            Publish
          </button>
        </div>
      </div>

      {errFoodType && (
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

      <div
        className="app-split grid gap-[14px] items-start"
        style={{ gridTemplateColumns: 'minmax(0,1fr) 300px' }}
      >
        <div className="flex flex-col gap-[14px] min-w-0">
          <section className="card elev-sm p-[18px] gap-[12px]">
            <h5 className="m-0">Category</h5>
            <div className="field">
              <label>
                Food type <span style={{ color: 'var(--color-accent)' }}>*</span>
              </label>
              <Input
                placeholder="North Indian"
                value={g.foodType}
                onChange={(e) => dispatch(patchFood({ foodType: e.target.value }))}
                style={
                  errFoodType
                    ? { borderColor: 'var(--t-danger-bd)', background: 'color-mix(in srgb,var(--t-danger-bd) 14%,transparent)' }
                    : {}
                }
              />
              {errFoodType && (
                <div className="text-[11.5px] mt-1" style={{ color: 'var(--t-danger)' }}>
                  Food type is required
                </div>
              )}
            </div>
          </section>

          <section className="card elev-sm p-[18px] gap-[12px]">
            <div className="flex items-center gap-[9px]">
              <h5 className="m-0">Dish list</h5>
              <span className="text-muted text-[12px] ml-auto">{g.dishlist.length} dishes in this category</span>
            </div>
            <div className="flex flex-col gap-[10px]">
              {g.dishlist.map((d) => (
                <div
                  key={d.id}
                  className="grid gap-[11px] items-start"
                  style={{
                    gridTemplateColumns: '74px minmax(0,1fr)',
                    padding: 11,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-neutral-900)',
                  }}
                >
                  <label
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      readImage(e.dataTransfer.files[0], (img) => dispatch(patchDish({ id: d.id, patch: { dishImage: img } })))
                    }}
                    className="cursor-pointer grid place-items-center"
                    style={{
                      width: 74,
                      height: 74,
                      borderRadius: 8,
                      border: `1.4px dashed ${d.dishImage ? 'transparent' : 'var(--color-neutral-700)'}`,
                      background: d.dishImage ? `center/cover no-repeat url(${d.dishImage})` : 'var(--t-well)',
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => readImage(e.target.files?.[0], (img) => dispatch(patchDish({ id: d.id, patch: { dishImage: img } })))}
                    />
                    {!d.dishImage && (
                      <span className="text-[10.5px] text-center leading-tight" style={{ color: 'var(--color-neutral-500)' }}>
                        Drop
                        <br />
                        photo
                      </span>
                    )}
                  </label>
                  <div className="flex flex-col gap-2 min-w-0">
                    <div className="flex gap-2 items-center min-w-0">
                      <Input
                        placeholder="Dish name"
                        value={d.dishName}
                        onChange={(e) => dispatch(patchDish({ id: d.id, patch: { dishName: e.target.value } }))}
                        className="flex-1 min-w-0"
                      />
                      <button
                        className="btn btn-secondary btn-icon flex-none"
                        title="Remove dish"
                        onClick={() => dispatch(removeDish(d.id))}
                      >
                        ×
                      </button>
                    </div>
                    <div className="seg self-start" style={{ maxWidth: '100%' }}>
                      <label className={cn('seg-opt', d.isVeg && 'is-active')}>
                        <input
                          type="radio"
                          name={`veg-${d.id}`}
                          className="sr-only"
                          checked={d.isVeg}
                          onChange={() => dispatch(patchDish({ id: d.id, patch: { isVeg: true } }))}
                        />
                        <span
                          className="inline-block flex-none"
                          style={{ width: 9, height: 9, borderRadius: 2, border: '1.5px solid var(--p-veg)' }}
                        />
                        Veg
                      </label>
                      <label className={cn('seg-opt', !d.isVeg && 'is-active')}>
                        <input
                          type="radio"
                          name={`veg-${d.id}`}
                          className="sr-only"
                          checked={!d.isVeg}
                          onChange={() => dispatch(patchDish({ id: d.id, patch: { isVeg: false } }))}
                        />
                        <span
                          className="inline-block flex-none"
                          style={{ width: 9, height: 9, borderRadius: 2, border: '1.5px solid var(--t-nonveg)' }}
                        />
                        Non-veg
                      </label>
                    </div>
                    <Input
                      placeholder="Short description (optional)"
                      value={d.dishDescription}
                      onChange={(e) => dispatch(patchDish({ id: d.id, patch: { dishDescription: e.target.value } }))}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-secondary self-start" onClick={() => dispatch(addDish())}>
              + Add dish
            </button>
          </section>
        </div>

        <section className="card elev-sm p-[18px] gap-[12px]">
          <h5 className="m-0">Category image</h5>
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              readImage(e.dataTransfer.files[0], (d) => dispatch(patchFood({ foodtypeimage: d })))
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
              onChange={(e) => readImage(e.target.files?.[0], (d) => dispatch(patchFood({ foodtypeimage: d })))}
            />
            {g.foodtypeimage ? (
              <img
                src={g.foodtypeimage}
                alt=""
                style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }}
              />
            ) : (
              <div className="flex flex-col items-center gap-[5px] text-center" style={{ padding: '20px 10px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: 'var(--color-accent)' }} strokeWidth="1.6">
                  <path d="M4 16l4-5 4 4 3-3 5 6" />
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                </svg>
                <div className="text-[13px]">Drop cuisine photo</div>
              </div>
            )}
          </label>
          <Input
            placeholder="…or paste an image URL"
            value={g.foodtypeimage.indexOf('data:') === 0 ? '' : g.foodtypeimage}
            onChange={(e) => dispatch(patchFood({ foodtypeimage: e.target.value }))}
          />
          <p className="text-muted m-0 text-[12px]">Used as the banner behind this cuisine on the public menu.</p>
        </section>
      </div>
    </div>
  )
}
