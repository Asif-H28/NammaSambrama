import { useAppSelector } from '@/store/hooks'
import { VideoDialog } from '@/components/layout/VideoDialog'
import { PublicSite } from '@/pages/PublicSite'

export function PublicSitePage() {
  const theme = useAppSelector((s) => s.ui.theme)
  const mode = useAppSelector((s) => s.ui.mode)

  return (
    <div
      data-theme={theme}
      data-mode={mode}
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: 15, minHeight: '100vh' }}
    >
      <PublicSite standalone />
      <VideoDialog />
    </div>
  )
}
