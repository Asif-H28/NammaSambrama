import { configureStore } from '@reduxjs/toolkit'
import catalogReducer, { type CatalogState } from '@/features/catalog/catalogSlice'
import uiReducer from '@/features/ui/uiSlice'
import formsReducer from '@/features/forms/formsSlice'
import bookingReducer from '@/features/booking/bookingSlice'
import enquiriesReducer, { replaceEnquiries, type EnquiriesState } from '@/features/enquiries/enquiriesSlice'
import type { ThemeKey, ThemeMode } from '@/types'

const CATALOG_KEY = 'namma-sambrama:catalog'
const THEME_KEY = 'namma-sambrama:theme'
export const ENQUIRIES_KEY = 'namma-sambrama:enquiries'

function loadCatalog(): CatalogState | undefined {
  try {
    const raw = localStorage.getItem(CATALOG_KEY)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

function loadTheme(): { theme: ThemeKey; mode: ThemeMode } | undefined {
  try {
    const raw = localStorage.getItem(THEME_KEY)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

function loadEnquiries(): EnquiriesState | undefined {
  try {
    const raw = localStorage.getItem(ENQUIRIES_KEY)
    return raw ? { items: JSON.parse(raw) } : undefined
  } catch {
    return undefined
  }
}

const savedCatalog = loadCatalog()
const savedTheme = loadTheme()
const savedEnquiries = loadEnquiries()

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    ui: uiReducer,
    forms: formsReducer,
    booking: bookingReducer,
    enquiries: enquiriesReducer,
  },
  preloadedState: {
    catalog: savedCatalog ?? catalogReducer(undefined, { type: '@@INIT' }),
    ui: { ...uiReducer(undefined, { type: '@@INIT' }), ...savedTheme },
    enquiries: savedEnquiries ?? enquiriesReducer(undefined, { type: '@@INIT' }),
  },
})

store.subscribe(() => {
  const state = store.getState()
  try {
    localStorage.setItem(CATALOG_KEY, JSON.stringify(state.catalog))
    localStorage.setItem(THEME_KEY, JSON.stringify({ theme: state.ui.theme, mode: state.ui.mode }))
    localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(state.enquiries.items))
  } catch {
    // ignore quota/storage errors
  }
})

window.addEventListener('storage', (e) => {
  if (e.key !== ENQUIRIES_KEY || !e.newValue) return
  try {
    store.dispatch(replaceEnquiries(JSON.parse(e.newValue)))
  } catch {
    // ignore malformed storage payload
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
