import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { FormSection, Layout, Screen, ThemeKey, ThemeMode } from '@/types'

interface VideoState {
  url: string
  title: string
}

interface UiState {
  screen: Screen
  layout: Layout
  section: FormSection
  theme: ThemeKey
  mode: ThemeMode
  query: string
  diet: 'all' | 'veg' | 'nonveg'
  publicFilter: string
  validate: boolean
  previewOpen: boolean
  toast: string
  video: VideoState | null
}

const initialState: UiState = {
  screen: 'dashboard',
  layout: 'split',
  section: 'basics',
  theme: 'obsidian',
  mode: 'dark',
  query: '',
  diet: 'all',
  publicFilter: 'all',
  validate: false,
  previewOpen: false,
  toast: '',
  video: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    goScreen(state, action: PayloadAction<Screen>) {
      state.screen = action.payload
      state.previewOpen = false
      state.validate = false
    },
    // The form ships a single split layout; kept as a no-op so any
    // remaining dispatch stays harmless.
    setLayout(state) {
      state.layout = 'split'
    },
    setSection(state, action: PayloadAction<FormSection>) {
      state.section = action.payload
    },
    setTheme(state, action: PayloadAction<ThemeKey>) {
      state.theme = action.payload
    },
    // The console ships a single dark theme, so mode is pinned to 'dark'.
    // Kept as a no-op reducer so any remaining dispatch stays harmless.
    toggleMode(state) {
      state.mode = 'dark'
    },
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload
    },
    setDiet(state, action: PayloadAction<'all' | 'veg' | 'nonveg'>) {
      state.diet = action.payload
    },
    setPublicFilter(state, action: PayloadAction<string>) {
      state.publicFilter = action.payload
    },
    setValidate(state, action: PayloadAction<boolean>) {
      state.validate = action.payload
    },
    openPreview(state) {
      state.previewOpen = true
    },
    closePreview(state) {
      state.previewOpen = false
    },
    showToast(state, action: PayloadAction<string>) {
      state.toast = action.payload
    },
    clearToast(state) {
      state.toast = ''
    },
    openVideo(state, action: PayloadAction<VideoState>) {
      state.video = action.payload
    },
    closeVideo(state) {
      state.video = null
    },
  },
})

export const {
  goScreen,
  setLayout,
  setSection,
  setTheme,
  toggleMode,
  setQuery,
  setDiet,
  setPublicFilter,
  setValidate,
  openPreview,
  closePreview,
  showToast,
  clearToast,
  openVideo,
  closeVideo,
} = uiSlice.actions
export default uiSlice.reducer
