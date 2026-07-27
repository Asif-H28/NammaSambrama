import { uid } from '@/lib/id'
import { eventErrors } from '@/lib/validate'
import { goScreen, setValidate, showToast, closePreview } from '@/features/ui/uiSlice'
import { upsertEvent, upsertFood } from '@/features/catalog/catalogSlice'
import type { AppDispatch, RootState } from '@/store/store'

export function commitEvent() {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const f = getState().forms.event
    const err = eventErrors(f)
    if (Object.keys(err).length) {
      dispatch(setValidate(true))
      dispatch(closePreview())
      return
    }
    const rec = {
      ...f,
      id: f.id || uid(),
      foodMenu: f.foodMenu.filter((l) => l.text.trim()),
      eventDesign: f.eventDesign.filter((l) => l.text.trim()),
    }
    dispatch(upsertEvent(rec))
    dispatch(goScreen('events'))
    dispatch(showToast(f.id ? 'Event type updated — live on the public site' : 'Event type published'))
  }
}

export function commitFood() {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const g = getState().forms.food
    if (!g.foodType.trim()) {
      dispatch(setValidate(true))
      dispatch(closePreview())
      return
    }
    const rec = {
      ...g,
      id: g.id || uid(),
      dishlist: g.dishlist.filter((d) => d.dishName.trim()),
    }
    dispatch(upsertFood(rec))
    dispatch(goScreen('foods'))
    dispatch(showToast(g.id ? 'Food category updated' : 'Food category published'))
  }
}
