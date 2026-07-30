import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Enquiry } from '@/types'
import {
  fetchEnquiries,
  submitEnquiry,
  updateEnquiryStatus,
  removeEnquiry,
} from './enquiriesThunks'

export interface EnquiriesState {
  items: Enquiry[]
  loaded: boolean
  loading: boolean
  submitting: boolean
  error: string | null
}

// Server-backed now — no seed data.
const initialState: EnquiriesState = {
  items: [],
  loaded: false,
  loading: false,
  submitting: false,
  error: null,
}

const enquiriesSlice = createSlice({
  name: 'enquiries',
  initialState,
  reducers: {
    setEnquiryStatus(state, action: PayloadAction<{ id: string; status: Enquiry['status'] }>) {
      const rec = state.items.find((e) => e.id === action.payload.id)
      if (rec) rec.status = action.payload.status
    },
    replaceEnquiries(state, action: PayloadAction<Enquiry[]>) {
      state.items = action.payload
    },
    clearEnquiriesError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnquiries.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEnquiries.fulfilled, (state, action) => {
        state.loading = false
        state.loaded = true
        state.items = action.payload
      })
      .addCase(fetchEnquiries.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to load enquiries'
      })

      .addCase(submitEnquiry.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(submitEnquiry.fulfilled, (state, action) => {
        state.submitting = false
        state.items.unshift(action.payload)
      })
      .addCase(submitEnquiry.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload ?? 'Failed to submit enquiry'
      })

      .addCase(updateEnquiryStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((e) => e.id === action.payload.id)
        if (idx >= 0) state.items[idx] = action.payload
      })
      .addCase(updateEnquiryStatus.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to update status'
      })

      .addCase(removeEnquiry.fulfilled, (state, action) => {
        state.items = state.items.filter((e) => e.id !== action.payload)
      })
      .addCase(removeEnquiry.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to delete enquiry'
      })
  },
})

export const { setEnquiryStatus, replaceEnquiries, clearEnquiriesError } = enquiriesSlice.actions
export default enquiriesSlice.reducer
