import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { uid } from '@/lib/id'
import type { BookingCustomItem, BookingState } from '@/types'

const initialState: BookingState = {
  step: 'type',
  eventTypeId: '',
  customEventName: '',
  selectedDishIds: [],
  customItems: [],
  contactName: '',
  contactPhone: '',
  guestCount: '',
  eventDate: '',
  eventTime: '',
  contactNotes: '',
}

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    resetBooking() {
      return initialState
    },
    chooseEventType(state, action: PayloadAction<{ eventTypeId: string; preselectedDishIds: string[] }>) {
      state.eventTypeId = action.payload.eventTypeId
      state.customEventName = ''
      state.selectedDishIds = action.payload.preselectedDishIds
      state.customItems = []
      state.step = 'menu'
    },
    chooseCustomEvent(state, action: PayloadAction<string>) {
      state.eventTypeId = ''
      state.customEventName = action.payload
      state.selectedDishIds = []
      state.customItems = []
      state.step = 'menu'
    },
    /**
     * Drop selected ids that no longer exist in the catalogue. Selections are
     * held in Redux, so a dish id that changes or is deleted server-side would
     * otherwise linger as an unremovable phantom row.
     */
    pruneSelections(state, action: PayloadAction<string[]>) {
      const valid = new Set(action.payload)
      const kept = Array.from(new Set(state.selectedDishIds)).filter((id) => valid.has(id))
      if (kept.length !== state.selectedDishIds.length) state.selectedDishIds = kept
    },
    toggleDish(state, action: PayloadAction<string>) {
      const id = action.payload
      state.selectedDishIds = state.selectedDishIds.includes(id)
        ? state.selectedDishIds.filter((d) => d !== id)
        : [...state.selectedDishIds, id]
    },
    addCustomItem(state, action: PayloadAction<{ categoryId: string; name: string }>) {
      const item: BookingCustomItem = { id: uid(), categoryId: action.payload.categoryId, name: action.payload.name }
      state.customItems.push(item)
    },
    removeCustomItem(state, action: PayloadAction<string>) {
      state.customItems = state.customItems.filter((c) => c.id !== action.payload)
    },
    goToStep(state, action: PayloadAction<BookingState['step']>) {
      state.step = action.payload
    },
    setContact(
      state,
      action: PayloadAction<
        Partial<Pick<BookingState, 'contactName' | 'contactPhone' | 'guestCount' | 'eventDate' | 'eventTime' | 'contactNotes'>>
      >,
    ) {
      Object.assign(state, action.payload)
    },
    loadDraft(_state, action: PayloadAction<BookingState>) {
      return action.payload
    },
  },
})

const DRAFT_KEY = 'namma-sambrama:booking-draft'

export function getBookingDraft(): BookingState | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as BookingState
    if (parsed && typeof parsed === 'object' && (parsed.eventTypeId || parsed.customEventName || parsed.selectedDishIds?.length)) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

export function saveBookingDraft(state: BookingState) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(state))
  } catch {
    // ignore storage errors
  }
}

export function clearBookingDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    // ignore storage errors
  }
}

export const {
  resetBooking,
  pruneSelections,
  chooseEventType,
  chooseCustomEvent,
  toggleDish,
  addCustomItem,
  removeCustomItem,
  goToStep,
  setContact,
  loadDraft,
} = bookingSlice.actions
export default bookingSlice.reducer
