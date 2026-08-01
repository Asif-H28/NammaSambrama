import { configureStore } from '@reduxjs/toolkit'
import catalogReducer from '@/features/catalog/catalogSlice'
import uiReducer from '@/features/ui/uiSlice'
import formsReducer from '@/features/forms/formsSlice'
import bookingReducer from '@/features/booking/bookingSlice'
import enquiriesReducer from '@/features/enquiries/enquiriesSlice'
import authReducer from '@/features/auth/authSlice'
import paymentReducer from '@/features/payment/paymentSlice'
import galleryReducer from '@/features/gallery/gallerySlice'
import type { ThemeKey, ThemeMode } from '@/types'

const THEME_KEY = 'namma-sambrama:theme'

// Catalog and enquiries are no longer cached in localStorage — MongoDB is the
// source of truth and the slices fetch on mount. Only local UI preferences
// are persisted.
function loadTheme(): { theme: ThemeKey; mode: ThemeMode } | undefined {
  try {
    const raw = localStorage.getItem(THEME_KEY)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

const savedTheme = loadTheme()

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    ui: uiReducer,
    forms: formsReducer,
    booking: bookingReducer,
    enquiries: enquiriesReducer,
    auth: authReducer,
    payment: paymentReducer,
    gallery: galleryReducer,
  },
  preloadedState: {
    ui: { ...uiReducer(undefined, { type: '@@INIT' }), ...savedTheme },
  },
})

store.subscribe(() => {
  const state = store.getState()
  try {
    localStorage.setItem(
      THEME_KEY,
      JSON.stringify({ theme: state.ui.theme, mode: state.ui.mode }),
    )
  } catch {
    // ignore quota/storage errors
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
