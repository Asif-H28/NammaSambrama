import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { store } from '@/store/store'
import './index.css'
import App from './App.tsx'
import { PublicSitePage } from './pages/PublicSitePage.tsx'
import { BookingPage } from './pages/BookingPage.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { SignupPage } from './pages/SignupPage.tsx'
import { RequireAuth } from './components/RequireAuth.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Public site — the default landing page, no authentication */}
          <Route path="/" element={<PublicSitePage />} />
          <Route path="/book" element={<BookingPage />} />
          {/* Legacy path kept so existing links keep working */}
          <Route path="/public" element={<Navigate to="/" replace />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/whitehouse" element={<SignupPage />} />

          {/* Admin panel — requires a valid JWT */}
          <Route
            path="/admin/*"
            element={
              <RequireAuth>
                <App />
              </RequireAuth>
            }
          />

          {/* Anything else falls back to the public site */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
