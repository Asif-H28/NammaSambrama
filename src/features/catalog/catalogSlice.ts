import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { EventType, FoodCategory } from '@/types'
import {
  fetchEvents,
  fetchFoods,
  saveEvent,
  removeEvent,
  saveFood,
  removeFood,
} from './catalogThunks'

export interface CatalogState {
  events: EventType[]
  foods: FoodCategory[]
  eventsLoaded: boolean
  foodsLoaded: boolean
  loading: boolean
  saving: boolean
  error: string | null
}

// MongoDB is the source of truth now — no seed data.
const initialState: CatalogState = {
  events: [],
  foods: [],
  eventsLoaded: false,
  foodsLoaded: false,
  loading: false,
  saving: false,
  error: null,
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
    clearCatalogError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false
        state.events = action.payload
        state.eventsLoaded = true
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to load event types'
        // Mark as settled even on failure — the public page gates its render on
        // this flag, and must not trap visitors on the loader forever.
        state.eventsLoaded = true
      })

      .addCase(fetchFoods.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFoods.fulfilled, (state, action) => {
        state.loading = false
        state.foods = action.payload
        state.foodsLoaded = true
      })
      .addCase(fetchFoods.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to load food categories'
        state.foodsLoaded = true
      })

      .addCase(saveEvent.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(saveEvent.fulfilled, (state, action) => {
        state.saving = false
        const rec = action.payload
        const idx = state.events.findIndex((e) => e.id === rec.id)
        if (idx >= 0) state.events[idx] = rec
        else state.events.unshift(rec)
      })
      .addCase(saveEvent.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload ?? 'Failed to save event type'
      })

      .addCase(removeEvent.fulfilled, (state, action) => {
        state.events = state.events.filter((e) => e.id !== action.payload)
      })
      .addCase(removeEvent.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to delete event type'
      })

      .addCase(saveFood.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(saveFood.fulfilled, (state, action) => {
        state.saving = false
        const rec = action.payload
        const idx = state.foods.findIndex((f) => f.id === rec.id)
        if (idx >= 0) state.foods[idx] = rec
        else state.foods.unshift(rec)
      })
      .addCase(saveFood.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload ?? 'Failed to save food category'
      })

      .addCase(removeFood.fulfilled, (state, action) => {
        state.foods = state.foods.filter((f) => f.id !== action.payload)
      })
      .addCase(removeFood.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to delete food category'
      })
  },
})

export const { upsertEvent, deleteEvent, upsertFood, deleteFood, clearCatalogError } =
  catalogSlice.actions
export default catalogSlice.reducer
