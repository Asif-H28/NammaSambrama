import { createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@/lib/api'
import type { EventType, FoodCategory } from '@/types'

/**
 * Public reads go through the unauthenticated /public routes so the public
 * site and booking page work without a session. Writes always use /admin.
 */

export const fetchEvents = createAsyncThunk<EventType[], void, { rejectValue: string }>(
  'catalog/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const { events } = await api.get<{ events: EventType[] }>('/public/events')
      return events
    } catch (err) {
      return rejectWithValue((err as Error).message)
    }
  },
)

export const fetchFoods = createAsyncThunk<FoodCategory[], void, { rejectValue: string }>(
  'catalog/fetchFoods',
  async (_, { rejectWithValue }) => {
    try {
      const { foods } = await api.get<{ foods: FoodCategory[] }>('/public/foods')
      return foods
    } catch (err) {
      return rejectWithValue((err as Error).message)
    }
  },
)

export const saveEvent = createAsyncThunk<EventType, EventType, { rejectValue: string }>(
  'catalog/saveEvent',
  async (record, { rejectWithValue }) => {
    try {
      const { id, ...payload } = record
      // An id means the record already exists on the server
      const { event } = id
        ? await api.put<{ event: EventType }>(`/admin/events/${id}`, payload)
        : await api.post<{ event: EventType }>('/admin/events', payload, true)
      return event
    } catch (err) {
      return rejectWithValue((err as Error).message)
    }
  },
)

export const removeEvent = createAsyncThunk<string, string, { rejectValue: string }>(
  'catalog/removeEvent',
  async (id, { rejectWithValue }) => {
    try {
      await api.del(`/admin/events/${id}`)
      return id
    } catch (err) {
      return rejectWithValue((err as Error).message)
    }
  },
)

export const saveFood = createAsyncThunk<FoodCategory, FoodCategory, { rejectValue: string }>(
  'catalog/saveFood',
  async (record, { rejectWithValue }) => {
    try {
      const { id, ...payload } = record
      const { food } = id
        ? await api.put<{ food: FoodCategory }>(`/admin/foods/${id}`, payload)
        : await api.post<{ food: FoodCategory }>('/admin/foods', payload, true)
      return food
    } catch (err) {
      return rejectWithValue((err as Error).message)
    }
  },
)

export const removeFood = createAsyncThunk<string, string, { rejectValue: string }>(
  'catalog/removeFood',
  async (id, { rejectWithValue }) => {
    try {
      await api.del(`/admin/foods/${id}`)
      return id
    } catch (err) {
      return rejectWithValue((err as Error).message)
    }
  },
)

export interface DashboardStats {
  events: number
  foodCategories: number
  dishes: number
  enquiries: number
  enquiriesByStatus: { new: number; contacted: number; closed: number }
}

export const fetchDashboardStats = createAsyncThunk<
  DashboardStats,
  void,
  { rejectValue: string }
>('catalog/fetchDashboardStats', async (_, { rejectWithValue }) => {
  try {
    const { stats } = await api.get<{ stats: DashboardStats }>('/admin/dashboard/stats', true)
    return stats
  } catch (err) {
    return rejectWithValue((err as Error).message)
  }
})
