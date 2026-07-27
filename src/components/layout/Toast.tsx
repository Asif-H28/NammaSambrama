import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearToast } from '@/features/ui/uiSlice'

export function Toast() {
  const dispatch = useAppDispatch()
  const toast = useAppSelector((s) => s.ui.toast)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => dispatch(clearToast()), 2600)
    return () => clearTimeout(t)
  }, [toast, dispatch])

  if (!toast) return null

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-[60] flex items-center gap-[9px] animate-rise text-[13px]"
      style={{
        bottom: 26,
        padding: '11px 16px',
        borderRadius: 999,
        background: 'var(--color-accent-800)',
        color: 'var(--color-accent-100)',
        boxShadow: '0 0 0 1px var(--color-neutral-700), 0 6px 18px rgba(0,0,0,0.55)',
      }}
    >
      <span
        className="rounded-full"
        style={{ width: 7, height: 7, background: 'var(--color-accent-400)' }}
      />
      {toast}
    </div>
  )
}
