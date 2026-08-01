import { createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@/lib/api'
import type { PaymentSettings } from '@/types'

/**
 * Admin-only: fetch saved payment settings (authenticated).
 */
export const fetchPaymentSettings = createAsyncThunk<
  PaymentSettings | null,
  void,
  { rejectValue: string }
>('payment/fetchPaymentSettings', async (_, { rejectWithValue }) => {
  try {
    const { payment } = await api.get<{ payment: PaymentSettings | null }>(
      '/admin/payment',
      true,
    )
    return payment
  } catch (err) {
    return rejectWithValue((err as Error).message)
  }
})

/**
 * Public: fetch payment info for the public site (no auth).
 */
export const fetchPublicPayment = createAsyncThunk<
  PaymentSettings | null,
  void,
  { rejectValue: string }
>('payment/fetchPublicPayment', async (_, { rejectWithValue }) => {
  try {
    const { payment } = await api.get<{ payment: PaymentSettings | null }>(
      '/public/payment',
    )
    return payment
  } catch (err) {
    return rejectWithValue((err as Error).message)
  }
})

/**
 * Admin-only: save payment settings with optional QR image upload.
 * Uses multipart/form-data when a file is present.
 */
export const savePaymentSettings = createAsyncThunk<
  PaymentSettings,
  { upiId: string; payeeName: string; qrFile?: File },
  { rejectValue: string }
>('payment/savePaymentSettings', async ({ upiId, payeeName, qrFile }, { rejectWithValue }) => {
  try {
    const form = new FormData()
    form.append('upiId', upiId)
    form.append('payeeName', payeeName)
    if (qrFile) form.append('file', qrFile)

    const token = localStorage.getItem('namma-sambrama:token')
    const root =
      ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:5000').replace(
        /\/$/,
        '',
      ) + '/api/nammasambrama'

    const res = await fetch(`${root}/admin/payment`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })

    const payload = await res.json()
    if (!res.ok) throw new Error(payload.error || 'Failed to save payment settings')
    return payload.payment as PaymentSettings
  } catch (err) {
    return rejectWithValue((err as Error).message)
  }
})

/**
 * Admin-only: delete QR image from storage.
 */
export const deletePaymentQr = createAsyncThunk<
  PaymentSettings,
  void,
  { rejectValue: string }
>('payment/deletePaymentQr', async (_, { rejectWithValue }) => {
  try {
    const { payment } = await api.del<{ payment: PaymentSettings }>('/admin/payment/qr')
    return payment
  } catch (err) {
    return rejectWithValue((err as Error).message)
  }
})
