import type { ReactNode } from 'react'
import { useAppSelector } from '@/store/hooks'

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
      className="flex min-h-screen items-center justify-center"
      style={{
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-body)',
        fontSize: 15,
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-divider)',
          borderRadius: 14,
          padding: '30px 28px',
        }}
      >
        <div className="flex items-center gap-[10px]" style={{ marginBottom: 22 }}>
          <div
            className="grid flex-none place-items-center"
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: 'linear-gradient(150deg,var(--color-accent-500),var(--color-accent-700))',
              font: "700 15px/1 'Noto Sans Kannada',sans-serif",
              color: 'var(--color-accent-100)',
            }}
          >
            ನ
          </div>
          <div>
            <div style={{ font: '500 16px/1.2 var(--font-heading)' }}>{title}</div>
            <div style={{ fontSize: 12, opacity: 0.65 }}>{subtitle}</div>
          </div>
        </div>

        {children}

        {footer && (
          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid var(--color-divider)',
              fontSize: 13,
              textAlign: 'center',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <div style={{ fontSize: 12, color: '#ef4444', marginTop: 5 }}>{message}</div>
  )
}

export function FormAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      style={{
        fontSize: 13,
        color: '#ef4444',
        background: 'color-mix(in srgb, #ef4444 12%, transparent)',
        border: '1px solid color-mix(in srgb, #ef4444 35%, transparent)',
        borderRadius: 9,
        padding: '9px 12px',
        marginBottom: 14,
      }}
    >
      {message}
    </div>
  )
}
