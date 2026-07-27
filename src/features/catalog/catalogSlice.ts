import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { SEED_EVENTS, SEED_FOODS } from '@/data/seed'
import type { EventType, FoodCategory } from '@/types'

export interface CatalogState {
  events: EventType[]
  foods: FoodCategory[]
}

const initialState: CatalogState = {
  events: SEED_EVENTS,
  foods: SEED_FOODS,
}

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    upsertEvent(state, action: PayloadAction<EventType>) {
      const rec = action.payload
      const idx = state.events.findIndex((e) => e.id === rec.id)
      if (idx >= 0) state.events[idx] = rec
      else state.events.unshift(rec)
    },
    deleteEvent(state, action: PayloadAction<string>) {
      state.events = state.events.filter((e) => e.id !== action.payload)
    },
    upsertFood(state, action: PayloadAction<FoodCategory>) {
      const rec = action.payload
      const idx = state.foods.findIndex((f) => f.id === rec.id)
      if (idx >= 0) state.foods[idx] = rec
      else state.foods.unshift(rec)
    },
    deleteFood(state, action: PayloadAction<string>) {
      state.foods = state.foods.filter((f) => f.id !== action.payload)
    },
  },
})

export const { upsertEvent, deleteEvent, upsertFood, deleteFood } = catalogSlice.actions
export default catalogSlice.reducer
