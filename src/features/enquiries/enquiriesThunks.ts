import { createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@/lib/api'
import type { Enquiry } from '@/types'

/** Payload the public booking page submits — server assigns id/status/createdAt. */
export type EnquiryDraft = Omit<Enquiry, 'id' | 'createdAt' | 'status'>

export const submitEnquiry = createAsyncThunk<Enquiry, EnquiryDraft, { rejectValue: string }>(
  'enquiries/submitEnquiry',
  async (draft, { rejectWithValue }) => {
    try {
      const { enquiry } = await api.post<{ enquiry: Enquiry }>('/public/enquiries', draft)
      return enquiry
    } catch (err) {
      return rejectWithValue((err as Error).message)
    }
  },
)

export const fetchEnquiries = createAsyncThunk<
  Enquiry[],
  { status?: Enquiry['status'] } | void,
  { rejectValue: string }
>('enquiries/fetchEnquiries', async (arg, { rejectWithValue }) => {
  try {
    const status = arg && 'status' in arg ? arg.status : undefined
    const query = status ? `?status=${status}` : ''
    const { enquiries } = await api.get<{ enquiries: Enquiry[] }>(
      `/admin/enquiries${query}`,
      true,
    )
    return enquiries
  } catch (err) {
    return rejectWithValue((err as Error).message)
  }
})

export const updateEnquiryStatus = createAsyncThunk<
  Enquiry,
  { id: string; status: Enquiry['status'] },
  { rejectValue: string }
>('enquiries/updateEnquiryStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const { enquiry } = await api.patch<{ enquiry: Enquiry }>(
      `/admin/enquiries/${id}/status`,
      { status },
    )
    return enquiry
  } catch (err) {
    return rejectWithValue((err as Error).message)
  }
})

export const removeEnquiry = createAsyncThunk<string, string, { rejectValue: string }>(
  'enquiries/removeEnquiry',
  async (id, { rejectWithValue }) => {
    try {
      await api.del(`/admin/enquiries/${id}`)
      return id
    } catch (err) {
      return rejectWithValue((err as Error).message)
    }
  },
)
