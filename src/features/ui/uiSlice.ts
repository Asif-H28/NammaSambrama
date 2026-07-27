import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { FormSection, Layout, Screen, ThemeKey } from '@/types'

interface VideoState {
  url: string
  title: string
}

interface UiState {
  screen: Screen
  layout: Layout
  section: FormSection
  theme: ThemeKey
  showThemePicker: boolean
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
  layout: 'steps',
  section: 'basics',
  theme: 'blurple',
  showThemePicker: true,
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
    setLayout(state, action: PayloadAction<Layout>) {
      state.layout = action.payload
      if (action.payload === 'steps') state.section = 'basics'
    },
    setSection(state, action: PayloadAction<FormSection>) {
      state.section = action.payload
    },
    setTheme(state, action: PayloadAction<ThemeKey>) {
      state.theme = action.payload
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
