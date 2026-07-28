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
  },
})

export const {
  resetBooking,
  chooseEventType,
  chooseCustomEvent,
  toggleDish,
  addCustomItem,
  removeCustomItem,
  goToStep,
  setContact,
} = bookingSlice.actions
export default bookingSlice.reducer
