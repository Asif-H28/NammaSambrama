import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { api, getToken, setToken, clearSession, ADMIN_KEY } from '@/lib/api'

export interface Admin {
  id: string
  username: string
  email: string
  isVerified: boolean
}

type SignupStage = 'form' | 'otp'

export interface AuthState {
  token: string | null
  admin: Admin | null
  /** True until the stored token has been validated against the server. */
  booting: boolean
  loading: boolean
  error: string | null
  signupStage: SignupStage
  /** Email address awaiting OTP verification. */
  pendingEmail: string
  otpExpiresInSeconds: number
  /** Server has no email provider configured — OTP is in its console. */
  devMode: boolean
  /** Why email delivery fell back, when devMode is true. */
  deliveryError: string | null
}

function loadAdmin(): Admin | null {
  try {
    const raw = localStorage.getItem(ADMIN_KEY)
    return raw ? (JSON.parse(raw) as Admin) : null
  } catch {
    return null
  }
}

function persistAdmin(admin: Admin) {
  try {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin))
  } catch {
    // ignore storage errors
  }
}

const initialState: AuthState = {
  token: getToken(),
  admin: loadAdmin(),
  booting: Boolean(getToken()),
  loading: false,
  error: null,
  signupStage: 'form',
  pendingEmail: '',
  otpExpiresInSeconds: 300,
  devMode: false,
  deliveryError: null,
}

interface OtpResponse {
  message: string
  email: string
  expiresInSeconds: number
  devMode: boolean
  deliveryError?: string
}

interface AuthResponse {
  message: string
  token: string
  admin: Admin
}

export const sendOtp = createAsyncThunk<
  OtpResponse,
  { username: string; password: string; email: string },
  { rejectValue: string }
>('auth/sendOtp', async (body, { rejectWithValue }) => {
  try {
    return await api.post<OtpResponse>('/auth/send-otp', body)
  } catch (err) {
    return rejectWithValue((err as Error).message)
  }
})

export const resendOtp = createAsyncThunk<OtpResponse, string, { rejectValue: string }>(
  'auth/resendOtp',
  async (email, { rejectWithValue }) => {
    try {
      return await api.post<OtpResponse>('/auth/resend-otp', { email })
    } catch (err) {
      return rejectWithValue((err as Error).message)
    }
  },
)

export const verifyOtp = createAsyncThunk<
  AuthResponse,
  { email: string; otp: string },
  { rejectValue: string }
>('auth/verifyOtp', async (body, { rejectWithValue }) => {
  try {
    return await api.post<AuthResponse>('/auth/verify-otp', body)
  } catch (err) {
    return rejectWithValue((err as Error).message)
  }
})

export const login = createAsyncThunk<
  AuthResponse,
  { username: string; password: string },
  { rejectValue: string }
>('auth/login', async (body, { rejectWithValue }) => {
  try {
    return await api.post<AuthResponse>('/auth/login', body)
  } catch (err) {
    return rejectWithValue((err as Error).message)
  }
})

/** Validates the stored token on app boot. */
export const fetchMe = createAsyncThunk<{ admin: Admin }, void, { rejectValue: string }>(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      return await api.get<{ admin: Admin }>('/auth/me', true)
    } catch (err) {
      return rejectWithValue((err as Error).message)
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      clearSession()
      state.token = null
      state.admin = null
      state.error = null
      state.signupStage = 'form'
      state.pendingEmail = ''
    },
    clearAuthError(state) {
      state.error = null
    },
    backToSignupForm(state) {
      state.signupStage = 'form'
      state.error = null
    },
    setPendingEmail(state, action: PayloadAction<string>) {
      state.pendingEmail = action.payload
    },
  },
  extraReducers: (builder) => {
    const pending = (state: AuthState) => {
      state.loading = true
      state.error = null
    }
    const failed = (state: AuthState, action: { payload?: string; error: { message?: string } }) => {
      state.loading = false
      state.error = action.payload ?? action.error.message ?? 'Something went wrong'
    }

    const authed = (state: AuthState, action: PayloadAction<AuthResponse>) => {
      state.loading = false
      state.error = null
      state.token = action.payload.token
      state.admin = action.payload.admin
      state.signupStage = 'form'
      state.pendingEmail = ''
      setToken(action.payload.token)
      persistAdmin(action.payload.admin)
    }

    builder
      .addCase(sendOtp.pending, pending)
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.loading = false
        state.signupStage = 'otp'
        state.pendingEmail = action.payload.email
        state.otpExpiresInSeconds = action.payload.expiresInSeconds
        state.devMode = action.payload.devMode
        state.deliveryError = action.payload.deliveryError ?? null
      })
      .addCase(sendOtp.rejected, failed)

      .addCase(resendOtp.pending, pending)
      .addCase(resendOtp.fulfilled, (state, action) => {
        state.loading = false
        state.otpExpiresInSeconds = action.payload.expiresInSeconds
        state.devMode = action.payload.devMode
        state.deliveryError = action.payload.deliveryError ?? null
      })
      .addCase(resendOtp.rejected, failed)

      .addCase(verifyOtp.pending, pending)
      .addCase(verifyOtp.fulfilled, authed)
      .addCase(verifyOtp.rejected, failed)

      .addCase(login.pending, pending)
      .addCase(login.fulfilled, authed)
      .addCase(login.rejected, failed)

      .addCase(fetchMe.pending, (state) => {
        state.booting = true
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.booting = false
        state.admin = action.payload.admin
        persistAdmin(action.payload.admin)
      })
      .addCase(fetchMe.rejected, (state) => {
        // api.ts already cleared storage and redirected on a 401
        state.booting = false
        state.token = null
        state.admin = null
      })
  },
})

export const { logout, clearAuthError, backToSignupForm, setPendingEmail } = authSlice.actions
export default authSlice.reducer
