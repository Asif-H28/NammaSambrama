import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { closeVideo } from '@/features/ui/uiSlice'
import { embedUrl } from '@/lib/embed'

export function VideoDialog() {
  const dispatch = useAppDispatch()
  const video = useAppSelector((s) => s.ui.video)

  if (!video) return null

  return (
    <div
      className="fixed inset-0 grid place-items-center p-4 z-50"
      style={{ background: 'color-mix(in srgb,var(--color-bg) 86%,transparent)', backdropFilter: 'blur(4px)' }}
      onClick={() => dispatch(closeVideo())}
    >
      <div
        className="flex flex-col gap-[11px]"
        style={{ width: 'min(920px,100%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[10.5px] uppercase" style={{ letterSpacing: '.12em', color: 'var(--color-accent)' }}>
              Event film
            </div>
            <div style={{ font: "500 19px/1.25 var(--font-heading)" }}>{video.title}</div>
          </div>
          <button className="btn btn-secondary btn-icon" title="Close" onClick={() => dispatch(closeVideo())}>
            ×
          </button>
        </div>
        <div
          className="relative overflow-hidden"
          style={{
            paddingTop: '56.25%',
            borderRadius: 'var(--radius-lg)',
            background: '#000',
            boxShadow: '0 0 0 1px var(--color-neutral-500), 0 16px 40px rgba(0,0,0,0.65)',
          }}
        >
          <iframe
            src={embedUrl(video.url, true)}
            title="Event film"
            allow="autoplay;encrypted-media;picture-in-picture;fullscreen"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  )
}
