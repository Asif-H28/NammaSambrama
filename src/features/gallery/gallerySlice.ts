import { createSlice } from '@reduxjs/toolkit'
import type { GalleryItem } from '@/types'
import {
  fetchPublicGallery,
  fetchAdminGallery,
  toggleEnableGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from './galleryThunks'

export interface GalleryState {
  enableGallery: boolean
  items: GalleryItem[]
  loaded: boolean
  loading: boolean
  saving: boolean
  error: string | null
}

const initialState: GalleryState = {
  enableGallery: true,
  items: [],
  loaded: false,
  loading: false,
  saving: false,
  error: null,
}

const gallerySlice = createSlice({
  name: 'gallery',
  initialState,
  reducers: {
    clearGalleryError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      /* -------- fetchPublicGallery -------- */
      .addCase(fetchPublicGallery.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPublicGallery.fulfilled, (state, action) => {
        state.loading = false
        state.enableGallery = action.payload.enableGallery
        state.items = action.payload.items
        state.loaded = true
      })
      .addCase(fetchPublicGallery.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to load gallery'
        state.loaded = true
      })

      /* -------- fetchAdminGallery -------- */
      .addCase(fetchAdminGallery.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAdminGallery.fulfilled, (state, action) => {
        state.loading = false
        state.enableGallery = action.payload.enableGallery
        state.items = action.payload.items
        state.loaded = true
      })
      .addCase(fetchAdminGallery.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to load gallery settings'
        state.loaded = true
      })

      /* -------- toggleEnableGallery -------- */
      .addCase(toggleEnableGallery.fulfilled, (state, action) => {
        state.enableGallery = action.payload
      })
      .addCase(toggleEnableGallery.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to update gallery setting'
      })

      /* -------- createGalleryItem -------- */
      .addCase(createGalleryItem.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(createGalleryItem.fulfilled, (state, action) => {
        state.saving = false
        state.items.unshift(action.payload)
      })
      .addCase(createGalleryItem.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload ?? 'Failed to create gallery item'
      })

      /* -------- updateGalleryItem -------- */
      .addCase(updateGalleryItem.fulfilled, (state, action) => {
        const index = state.items.findIndex((it) => it.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updateGalleryItem.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to update gallery item'
      })

      /* -------- deleteGalleryItem -------- */
      .addCase(deleteGalleryItem.fulfilled, (state, action) => {
        state.items = state.items.filter((it) => it.id !== action.payload)
      })
      .addCase(deleteGalleryItem.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to delete gallery item'
      })
  },
})

export const { clearGalleryError } = gallerySlice.actions
export default gallerySlice.reducer
