import { eventErrors } from '@/lib/validate'
import { goScreen, setValidate, showToast, closePreview } from '@/features/ui/uiSlice'
import { saveEvent, saveFood } from '@/features/catalog/catalogThunks'
import type { AppDispatch, RootState } from '@/store/store'

export function commitEvent() {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const f = getState().forms.event
    const err = eventErrors(f)
    if (Object.keys(err).length) {
      dispatch(setValidate(true))
      dispatch(closePreview())
      return
    }

    const isUpdate = Boolean(f.id)
    const rec = {
      ...f,
      foodMenu: f.foodMenu.filter((l) => l.text.trim()),
      eventDesign: f.eventDesign.filter((l) => l.text.trim()),
    }

    const result = await dispatch(saveEvent(rec))

    if (saveEvent.rejected.match(result)) {
      dispatch(showToast(result.payload ?? 'Failed to save event type'))
      return
    }

    dispatch(goScreen('events'))
    dispatch(showToast(isUpdate ? 'Event type updated — live on the public site' : 'Event type published'))
  }
}

export function commitFood() {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const g = getState().forms.food
    if (!g.foodType.trim()) {
      dispatch(setValidate(true))
      dispatch(closePreview())
      return
    }

    const isUpdate = Boolean(g.id)
    const rec = {
      ...g,
      dishlist: g.dishlist.filter((d) => d.dishName.trim()),
    }

    const result = await dispatch(saveFood(rec))

    if (saveFood.rejected.match(result)) {
      dispatch(showToast(result.payload ?? 'Failed to save food category'))
      return
    }

    dispatch(goScreen('foods'))
    dispatch(showToast(isUpdate ? 'Food category updated' : 'Food category published'))
  }
}
