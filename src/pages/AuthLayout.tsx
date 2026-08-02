import type { ReactNode } from 'react'
import { useAppSelector } from '@/store/hooks'
import { NSLogo } from '@/components/brand/NSLogo'

/** Shared themed shell for the login / signup screens. */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}) {
  const theme = useAppSelector((s) => s.ui.theme)
  const mode = useAppSelector((s) => s.ui.mode)

  return (
    <div
      data-theme={theme}
      data-mode={mode}
      className="auth-shell"
      style={{ fontFamily: 'var(--font-body)', fontSize: 15 }}
    >
      {/* Ambient background */}
      <span className="auth-aurora" aria-hidden="true" />
      <span className="auth-grid" aria-hidden="true" />

      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">
            <NSLogo size={62} />
          </div>
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
        </div>

        <div className="auth-rule" aria-hidden="true" />

        {children}

        {footer && <div className="auth-footer">{footer}</div>}
      </div>
    </div>
  )
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <div className="auth-field-error">{message}</div>
}

export function FormAlert({ message }: { message: string }) {
  return (
    <div role="alert" className="auth-alert">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-none">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16.5v.01" />
      </svg>
      <span>{message}</span>
    </div>
  )
}
