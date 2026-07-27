import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { store } from '@/store/store'
import './index.css'
import App from './App.tsx'
import { PublicSitePage } from './pages/PublicSitePage.tsx'
import { BookingPage } from './pages/BookingPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/public" element={<PublicSitePage />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
