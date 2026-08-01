import { useMemo, useState } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { openVideo } from '@/features/ui/uiSlice'
import type { GalleryItem } from '@/types'

interface GallerySectionProps {
  items: GalleryItem[]
  kn: boolean
}

export function GallerySection({ items, kn }: GallerySectionProps) {
  const dispatch = useAppDispatch()
  const [filterType, setFilterType] = useState<'all' | 'photo' | 'video'>('all')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryItem | null>(null)

  // Filter out any items that are marked as showInPublic: false
  const publicItems = useMemo(
    () => items.filter((it) => it.showInPublic !== false),
    [items],
  )

  const categories = useMemo(() => {
    const cats = new Set<string>()
    publicItems.forEach((it) => {
      if (it.eventType) cats.add(it.eventType)
    })
    return ['all', ...Array.from(cats)]
  }, [publicItems])

  const filteredItems = useMemo(() => {
    return publicItems.filter((it) => {
      const matchType = filterType === 'all' || it.type === filterType
      const matchCat = activeCategory === 'all' || it.eventType === activeCategory
      return matchType && matchCat
    })
  }, [publicItems, filterType, activeCategory])

  if (publicItems.length === 0) return null

  return (
    <section
      id="gallery"
      style={{
        padding: 'clamp(56px,7vw,84px) 24px',
        background: 'linear-gradient(180deg, var(--p-bg) 0%, color-mix(in srgb, var(--p-deep) 4%, var(--p-bg)) 100%)',
        borderTop: '1px solid color-mix(in srgb, var(--p-gold) 15%, transparent)',
        borderBottom: '1px solid color-mix(in srgb, var(--p-gold) 15%, transparent)',
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 1180 }}>
        {/* Section Header */}
        <div className="text-center" style={{ marginBottom: 36 }}>
          <div
            className="inline-block"
            style={{
              font: "600 12px/1 'Poppins',sans-serif",
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              color: 'var(--p-gold-dark)',
              marginBottom: 10,
            }}
          >
            {kn ? 'ನಮ್ಮ ಗ್ಯಾಲರಿ' : 'Event Gallery'}
          </div>
          <h2
            style={{
              margin: '0 0 12px',
              font: "700 clamp(26px,4vw,38px)/1.2 'Playfair Display',serif",
              color: 'var(--p-deep)',
            }}
          >
            {kn ? 'ನಮ್ಮ ಅದ್ಭುತ ನೆನಪುಗಳು' : 'Memories & Highlights'}
          </h2>
          <p
            className="mx-auto"
            style={{
              maxWidth: 580,
              margin: 0,
              fontSize: 14.5,
              lineHeight: 1.65,
              color: 'var(--p-muted)',
            }}
          >
            {kn
              ? 'ನಮ್ಮ ಇತ್ತೀಚಿನ ಆಚರಣೆಗಳ ಫೋಟೋಗಳು ಮತ್ತು ವೀಡಿಯೊಗಳನ್ನು ವೀಕ್ಷಿಸಿ.'
              : 'Browse photos and videos from our recent grand event celebrations.'}
          </p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3" style={{ marginBottom: 36 }}>
          {/* Type Filters */}
          <div
            className="flex items-center p-1"
            style={{
              borderRadius: 999,
              background: 'color-mix(in srgb, var(--p-gold) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--p-gold) 25%, transparent)',
            }}
          >
            {[
              { id: 'all', en: 'All Media', kn: 'ಎಲ್ಲಾ' },
              { id: 'photo', en: 'Photos 📷', kn: 'ಫೋಟೋಗಳು 📷' },
              { id: 'video', en: 'Videos 🎥', kn: 'ವೀಡಿಯೊಗಳು 🎥' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilterType(t.id as any)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 999,
                  border: 'none',
                  background: filterType === t.id ? 'linear-gradient(150deg,var(--p-deep),var(--p-deeper))' : 'transparent',
                  color: filterType === t.id ? 'var(--p-gold-light)' : 'var(--p-deep)',
                  font: "600 12.5px/1 'Poppins',sans-serif",
                  cursor: 'pointer',
                  transition: 'all .2s ease',
                }}
              >
                {kn ? t.kn : t.en}
              </button>
            ))}
          </div>

          {/* Event Category Chips if available */}
          {categories.length > 2 && (
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    border: '1px solid color-mix(in srgb, var(--p-gold) 30%, transparent)',
                    background: activeCategory === cat ? 'var(--p-gold-light)' : 'transparent',
                    color: activeCategory === cat ? 'var(--p-deeper)' : 'var(--p-muted)',
                    font: "600 12px/1 'Poppins',sans-serif",
                    cursor: 'pointer',
                    transition: 'all .2s ease',
                  }}
                >
                  {cat === 'all' ? (kn ? 'ಎಲ್ಲಾ ವಿಭಾಗಗಳು' : 'All Categories') : cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Gallery Grid */}
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          }}
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="ps-reveal group relative overflow-hidden text-left"
              style={{
                borderRadius: 20,
                background: 'var(--p-card, #ffffff)',
                border: '1px solid color-mix(in srgb, var(--p-gold) 25%, transparent)',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'transform .25s ease, box-shadow .25s ease',
              }}
              onClick={() => {
                if (item.type === 'photo') {
                  setLightboxPhoto(item)
                } else if (item.type === 'video' && item.youtubeUrl) {
                  dispatch(
                    openVideo({
                      url: item.youtubeUrl,
                      title: item.title,
                    }),
                  )
                }
              }}
            >
              {/* Media Thumbnail */}
              <div
                className="relative overflow-hidden"
                style={{ height: 260, background: '#0b1226' }}
              >
                {item.type === 'photo' ? (
                  <img
                    src={item.imageUrl}
                    alt={item.eventType || 'Photo'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform .4s ease',
                    }}
                    className="group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full relative flex items-center justify-center">
                    <img
                      src={
                        item.youtubeId
                          ? `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`
                          : ''
                      }
                      alt={item.eventType || 'Video'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.85,
                        transition: 'transform .4s ease',
                      }}
                      className="group-hover:scale-105"
                    />
                    {/* Glowing Play Icon */}
                    <div
                      style={{
                        position: 'absolute',
                        width: 54,
                        height: 54,
                        borderRadius: '50%',
                        background: 'linear-gradient(150deg,var(--p-gold-light),var(--p-gold) 50%,var(--p-gold-dark))',
                        color: '#12182c',
                        display: 'grid',
                        placeItems: 'center',
                        boxShadow: '0 8px 20px rgba(212,175,55,0.6)',
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Badge Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    padding: '5px 12px',
                    borderRadius: 999,
                    background: 'rgba(11, 18, 38, 0.85)',
                    backdropFilter: 'blur(8px)',
                    color: 'var(--p-gold-light)',
                    fontSize: 11.5,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.05em',
                    border: '1px solid color-mix(in srgb, var(--p-gold) 35%, transparent)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  }}
                >
                  {item.type === 'photo' ? '📷 Photo' : '🎥 Video'}
                  {item.eventType && item.eventType !== 'General' ? ` · ${item.eventType}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Photo Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="mn-modal"
          onClick={() => setLightboxPhoto(null)}
          style={{ zIndex: 120, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)' }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative flex flex-col items-center justify-center p-4 max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxPhoto(null)}
              style={{
                position: 'absolute',
                top: -40,
                right: 0,
                color: '#ffffff',
                fontSize: 28,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
            <img
              src={lightboxPhoto.imageUrl}
              alt={lightboxPhoto.eventType || 'Photo'}
              style={{
                maxHeight: '80vh',
                maxWidth: '100%',
                objectFit: 'contain',
                borderRadius: 16,
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            />
          </div>
        </div>
      )}
    </section>
  )
}
