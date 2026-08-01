import { createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@/lib/api'
import type { GalleryData, GalleryItem } from '@/types'

/**
 * Public: fetch public gallery settings and items (no auth).
 */
export const fetchPublicGallery = createAsyncThunk<
  GalleryData,
  void,
  { rejectValue: string }
>('gallery/fetchPublicGallery', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<GalleryData>('/public/gallery')
    return res
  } catch (err) {
    return rejectWithValue((err as Error).message)
  }
})

/**
 * Admin: fetch all gallery items and settings for admin management.
 */
export const fetchAdminGallery = createAsyncThunk<
  GalleryData,
  void,
  { rejectValue: string }
>('gallery/fetchAdminGallery', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<GalleryData>('/admin/gallery', true)
    return res
  } catch (err) {
    return rejectWithValue((err as Error).message)
  }
})

/**
 * Admin: toggle global enableGallery flag.
 */
export const toggleEnableGallery = createAsyncThunk<
  boolean,
  boolean,
  { rejectValue: string }
>('gallery/toggleEnableGallery', async (enableGallery, { rejectWithValue }) => {
  try {
    const res = await api.put<{ enableGallery: boolean }>(
      '/admin/gallery/settings',
      { enableGallery },
      true,
    )
    return res.enableGallery
  } catch (err) {
    return rejectWithValue((err as Error).message)
  }
})

/**
 * Admin: create gallery photo or video item.
 * Supports image file upload for photos.
 */
export const createGalleryItem = createAsyncThunk<
  GalleryItem,
  {
    type: 'photo' | 'video'
    title: string
    description?: string
    eventType?: string
    showInPublic?: boolean
    youtubeUrl?: string
    imageFile?: File
  },
  { rejectValue: string }
>(
  'gallery/createGalleryItem',
  async (
    { type, title, description, eventType, showInPublic, youtubeUrl, imageFile },
    { rejectWithValue },
  ) => {
    try {
      const token = localStorage.getItem('namma-sambrama:token')
      const root =
        ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:5000').replace(
          /\/$/,
          '',
        ) + '/api/nammasambrama'

      const form = new FormData()
      form.append('type', type)
      form.append('title', title)
      if (description) form.append('description', description)
      if (eventType) form.append('eventType', eventType)
      if (showInPublic !== undefined) form.append('showInPublic', String(showInPublic))
      if (youtubeUrl) form.append('youtubeUrl', youtubeUrl)
      if (imageFile) form.append('file', imageFile)

      const res = await fetch(`${root}/admin/gallery/items`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })

      const payload = await res.json()
      if (!res.ok) throw new Error(payload.error || 'Failed to create gallery item')
      return payload.item as GalleryItem
    } catch (err) {
      return rejectWithValue((err as Error).message)
    }
  },
)

/**
 * Admin: update gallery item (e.g. toggle showInPublic flag, title, video URL).
 */
export const updateGalleryItem = createAsyncThunk<
  GalleryItem,
  {
    id: string
    title?: string
    description?: string
    eventType?: string
    showInPublic?: boolean
    youtubeUrl?: string
    imageFile?: File
  },
  { rejectValue: string }
>(
  'gallery/updateGalleryItem',
  async (
    { id, title, description, eventType, showInPublic, youtubeUrl, imageFile },
    { rejectWithValue },
  ) => {
    try {
      const token = localStorage.getItem('namma-sambrama:token')
      const root =
        ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:5000').replace(
          /\/$/,
          '',
        ) + '/api/nammasambrama'

      const form = new FormData()
      if (title !== undefined) form.append('title', title)
      if (description !== undefined) form.append('description', description)
      if (eventType !== undefined) form.append('eventType', eventType)
      if (showInPublic !== undefined) form.append('showInPublic', String(showInPublic))
      if (youtubeUrl !== undefined) form.append('youtubeUrl', youtubeUrl)
      if (imageFile) form.append('file', imageFile)

      const res = await fetch(`${root}/admin/gallery/items/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })

      const payload = await res.json()
      if (!res.ok) throw new Error(payload.error || 'Failed to update gallery item')
      return payload.item as GalleryItem
    } catch (err) {
      return rejectWithValue((err as Error).message)
    }
  },
)

/**
 * Admin: delete gallery item.
 */
export const deleteGalleryItem = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('gallery/deleteGalleryItem', async (id, { rejectWithValue }) => {
  try {
    await api.del<{ success: boolean }>(`/admin/gallery/items/${id}`)
    return id
  } catch (err) {
    return rejectWithValue((err as Error).message)
  }
})
