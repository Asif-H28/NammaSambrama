import { configureStore } from '@reduxjs/toolkit'
import catalogReducer, { type CatalogState } from '@/features/catalog/catalogSlice'
import uiReducer from '@/features/ui/uiSlice'
import formsReducer from '@/features/forms/formsSlice'
import bookingReducer from '@/features/booking/bookingSlice'
import type { ThemeKey, ThemeMode } from '@/types'

const CATALOG_KEY = 'namma-sambrama:catalog'
const THEME_KEY = 'namma-sambrama:theme'

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

const savedCatalog = loadCatalog()
const savedTheme = loadTheme()

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    ui: uiReducer,
    forms: formsReducer,
    booking: bookingReducer,
  },
  preloadedState: {
    catalog: savedCatalog ?? catalogReducer(undefined, { type: '@@INIT' }),
    ui: { ...uiReducer(undefined, { type: '@@INIT' }), ...savedTheme },
  },
})

store.subscribe(() => {
  const state = store.getState()
  try {
    localStorage.setItem(CATALOG_KEY, JSON.stringify(state.catalog))
    localStorage.setItem(THEME_KEY, JSON.stringify({ theme: state.ui.theme, mode: state.ui.mode }))
  } catch {
    // ignore quota/storage errors
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
