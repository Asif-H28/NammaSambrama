import { createSlice } from '@reduxjs/toolkit'
import type { PaymentSettings } from '@/types'
import {
  fetchPaymentSettings,
  fetchPublicPayment,
  savePaymentSettings,
  deletePaymentQr,
} from './paymentThunks'

export interface PaymentState {
  data: PaymentSettings | null
  loaded: boolean
  loading: boolean
  saving: boolean
  error: string | null
}

const initialState: PaymentState = {
  data: null,
  loaded: false,
  loading: false,
  saving: false,
  error: null,
}

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPaymentError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      /* -------- fetchPaymentSettings (admin) -------- */
      .addCase(fetchPaymentSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPaymentSettings.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
        state.loaded = true
      })
      .addCase(fetchPaymentSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to load payment settings'
        state.loaded = true
      })

      /* -------- fetchPublicPayment (public) -------- */
      .addCase(fetchPublicPayment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPublicPayment.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
        state.loaded = true
      })
      .addCase(fetchPublicPayment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to load payment info'
        state.loaded = true
      })

      /* -------- savePaymentSettings -------- */
      .addCase(savePaymentSettings.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(savePaymentSettings.fulfilled, (state, action) => {
        state.saving = false
        state.data = action.payload
      })
      .addCase(savePaymentSettings.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload ?? 'Failed to save payment settings'
      })

      /* -------- deletePaymentQr -------- */
      .addCase(deletePaymentQr.fulfilled, (state, action) => {
        state.data = action.payload
      })
      .addCase(deletePaymentQr.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to delete QR image'
      })
  },
})

export const { clearPaymentError } = paymentSlice.actions
export default paymentSlice.reducer
