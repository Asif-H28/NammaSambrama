import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
          {/* Public site — no authentication */}
          <Route path="/public" element={<PublicSitePage />} />
          <Route path="/book" element={<BookingPage />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Admin panel — requires a valid JWT */}
          <Route
            path="/*"
            element={
              <RequireAuth>
                <App />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
