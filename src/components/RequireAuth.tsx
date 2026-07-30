import { useEffect, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchMe } from '@/features/auth/authSlice'

/**
 * Gate for the admin panel. A missing token redirects immediately; a stored
 * token is validated against /auth/me so a expired one cannot render the panel.
 * The 401 redirect itself is handled centrally in lib/api.ts.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const { token, admin, booting } = useAppSelector((s) => s.auth)

  useEffect(() => {
    if (token && !admin) dispatch(fetchMe())
  }, [token, admin, dispatch])

  if (!token) return <Navigate to="/login" replace />

  if (booting && !admin) {
    return (
      <div
        className="grid min-h-screen place-items-center"
        style={{ background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 14, opacity: 0.7 }}
      >
        Loading…
      </div>
    )
  }

  return <>{children}</>
}
