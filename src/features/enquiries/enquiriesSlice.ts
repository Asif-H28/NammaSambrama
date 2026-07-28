import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { SEED_ENQUIRIES } from '@/data/seed'
import type { Enquiry } from '@/types'

export interface EnquiriesState {
  items: Enquiry[]
}

const initialState: EnquiriesState = {
  items: SEED_ENQUIRIES,
}

const enquiriesSlice = createSlice({
  name: 'enquiries',
  initialState,
  reducers: {
    addEnquiry(state, action: PayloadAction<Enquiry>) {
      state.items.unshift(action.payload)
    },
    setEnquiryStatus(state, action: PayloadAction<{ id: string; status: Enquiry['status'] }>) {
      const rec = state.items.find((e) => e.id === action.payload.id)
      if (rec) rec.status = action.payload.status
    },
    replaceEnquiries(state, action: PayloadAction<Enquiry[]>) {
      state.items = action.payload
    },
  },
})

export const { addEnquiry, setEnquiryStatus, replaceEnquiries } = enquiriesSlice.actions
export default enquiriesSlice.reducer
