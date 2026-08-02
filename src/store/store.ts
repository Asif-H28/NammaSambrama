import { configureStore } from '@reduxjs/toolkit'
import catalogReducer from '@/features/catalog/catalogSlice'
import uiReducer from '@/features/ui/uiSlice'
import formsReducer from '@/features/forms/formsSlice'
import bookingReducer from '@/features/booking/bookingSlice'
import enquiriesReducer from '@/features/enquiries/enquiriesSlice'
import authReducer from '@/features/auth/authSlice'
import paymentReducer from '@/features/payment/paymentSlice'
import galleryReducer from '@/features/gallery/gallerySlice'

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
    // The console now ships a single dark theme. Any previously persisted
    // theme/mode (e.g. 'blurple' + 'light') is ignored so old localStorage
    // values can't resurrect a palette that no longer exists.
    ui: { ...uiReducer(undefined, { type: '@@INIT' }), theme: 'obsidian', mode: 'dark' },
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
