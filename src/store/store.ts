import { configureStore } from '@reduxjs/toolkit'
import catalogReducer from '@/features/catalog/catalogSlice'
import uiReducer from '@/features/ui/uiSlice'
import formsReducer from '@/features/forms/formsSlice'

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    ui: uiReducer,
    forms: formsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
