import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { goScreen, showToast } from '@/features/ui/uiSlice'
import { startFood } from '@/features/forms/formsSlice'
import { fetchFoods, removeFood } from '@/features/catalog/catalogThunks'
import { artFor } from '@/data/icons'
import type { FoodCategory } from '@/types'

export function FoodCategories() {
  const dispatch = useAppDispatch()
  const foods = useAppSelector((s) => s.catalog.foods)
  const loading = useAppSelector((s) => s.catalog.loading)
  const foodsLoaded = useAppSelector((s) => s.catalog.foodsLoaded)

  useEffect(() => {
    if (!foodsLoaded) dispatch(fetchFoods())
  }, [foodsLoaded, dispatch])
  const totalDishes = foods.reduce((n, c) => n + c.dishlist.length, 0)

  const editFood = (c: FoodCategory) => {
    dispatch(startFood(c))
    dispatch(goScreen('food-form'))
  }

  return (
    <div className="animate-rise">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-[18px]">
        <div>
          <div className="text-[11px] uppercase" style={{ letterSpacing: '.12em', color: 'var(--color-accent)' }}>
            Catalogue
          </div>
          <h2 style={{ margin: '4px 0 2px', fontSize: 30 }}>Food Categories</h2>
          <p className="text-muted m-0 text-[13px]">
            {foods.length} cuisines · {totalDishes} dishes on the public menu.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            dispatch(startFood())
            dispatch(goScreen('food-form'))
          }}
        >
          + Add food category
        </button>
      </div>

      <div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))' }}>
        {foods.map((c) => (
          <article key={c.id} className="card elev-sm p-0 gap-0 overflow-hidden">
            <div
              style={{
                height: 96,
                background: c.foodtypeimage ? `center/cover no-repeat url(${c.foodtypeimage})` : artFor(c.foodType),
              }}
            />
            <div className="flex flex-col gap-[9px] p-[13px_14px]">
              <div className="flex items-center gap-2">
                <div className="card-title flex-1">{c.foodType}</div>
                <span className="tag tag-accent-2">{c.dishlist.length} dishes</span>
              </div>
              <div className="flex flex-wrap gap-[5px]">
                {c.dishlist.slice(0, 4).map((d) => (
                  <span
                    key={d.id}
                    className="text-[11.5px]"
                    style={{
                      padding: '3px 9px',
                      borderRadius: 6,
                      background: d.isVeg
                        ? 'color-mix(in srgb,var(--t-veg) 20%,transparent)'
                        : 'color-mix(in srgb,var(--t-nonveg) 20%,transparent)',
                      color: d.isVeg ? 'var(--t-veg-fg)' : 'var(--t-danger-fg)',
                    }}
                  >
                    {d.dishName}
                  </span>
                ))}
                {c.dishlist.length > 4 && (
                  <span className="text-muted text-[11.5px] self-center">+{c.dishlist.length - 4} more</span>
                )}
              </div>
              <div className="flex gap-[6px] pt-[9px]" style={{ borderTop: '1px solid var(--color-divider)' }}>
                <button className="btn btn-secondary flex-1" onClick={() => editFood(c)}>
                  Edit dishes
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ color: 'var(--t-danger)' }}
                  onClick={() => {
                    dispatch(removeFood(c.id))
                    dispatch(showToast('Food category removed'))
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {loading && foods.length === 0 && (
        <p className="text-muted text-center" style={{ padding: '34px 0' }}>
          Loading food categories…
        </p>
      )}
      {!loading && foods.length === 0 && (
        <p className="text-muted text-center" style={{ padding: '34px 0' }}>
          No food categories yet — create your first one.
        </p>
      )}
    </div>
  )
}
