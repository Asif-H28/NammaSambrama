import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { showToast } from '@/features/ui/uiSlice'
import {
  fetchAdminGallery,
  toggleEnableGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from '@/features/gallery/galleryThunks'
import type { GalleryItem } from '@/types'

const EVENT_TYPES = ['General', 'Weddings', 'Ceremonies', 'Milestones', 'Corporate', 'Social']

export function GallerySettings() {
  const dispatch = useAppDispatch()
  const enableGallery = useAppSelector((s) => s.gallery.enableGallery)
  const items = useAppSelector((s) => s.gallery.items)
  const loaded = useAppSelector((s) => s.gallery.loaded)
  const saving = useAppSelector((s) => s.gallery.saving)

  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos')
  const [showAddModal, setShowAddModal] = useState(false)

  // Add Item form state
  const [itemType, setItemType] = useState<'photo' | 'video'>('photo')
  const [_, setTitle] = useState('')
  const [__, setDescription] = useState('')
  const [eventType, setEventType] = useState('General')
  const [showInPublic, setShowInPublic] = useState(true)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!loaded) dispatch(fetchAdminGallery())
  }, [loaded, dispatch])

  const openAddModal = (type: 'photo' | 'video') => {
    setItemType(type)
    setTitle('')
    setDescription('')
    setEventType('General')
    setShowInPublic(true)
    setYoutubeUrl('')
    setPhotoFile(null)
    setPhotoPreview('')
    setShowAddModal(true)
  }

  const handlePhotoSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      dispatch(showToast('Please select a valid image file'))
      return
    }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleCreate = async () => {
    if (itemType === 'photo' && !photoFile) {
      dispatch(showToast('Please select a photo to upload'))
      return
    }

    if (itemType === 'video' && !youtubeUrl.trim()) {
      dispatch(showToast('Please enter a YouTube video URL'))
      return
    }

    const autoTitle =
      itemType === 'photo'
        ? photoFile
          ? photoFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ')
          : `${eventType} Photo`
        : `${eventType} Video`

    try {
      await dispatch(
        createGalleryItem({
          type: itemType,
          title: autoTitle,
          description: '',
          eventType,
          showInPublic,
          youtubeUrl: itemType === 'video' ? youtubeUrl.trim() : undefined,
          imageFile: itemType === 'photo' && photoFile ? photoFile : undefined,
        }),
      ).unwrap()

      setShowAddModal(false)
      dispatch(showToast(`${itemType === 'photo' ? 'Photo' : 'Video'} added to gallery ✓`))
    } catch (err) {
      dispatch(showToast(String(err)))
    }
  }

  const handleToggleVisibility = async (item: GalleryItem) => {
    try {
      await dispatch(
        updateGalleryItem({
          id: item.id,
          showInPublic: !item.showInPublic,
        }),
      ).unwrap()
      dispatch(showToast(`Item visibility set to ${!item.showInPublic ? 'Public' : 'Hidden'} ✓`))
    } catch (err) {
      dispatch(showToast(String(err)))
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteGalleryItem(id)).unwrap()
      dispatch(showToast('Gallery item deleted ✓'))
    } catch (err) {
      dispatch(showToast(String(err)))
    }
  }

  const handleToggleEnableGallery = async () => {
    try {
      await dispatch(toggleEnableGallery(!enableGallery)).unwrap()
      dispatch(
        showToast(
          !enableGallery
            ? 'Gallery enabled on public site ✓'
            : 'Gallery disabled on public site ✓',
        ),
      )
    } catch (err) {
      dispatch(showToast(String(err)))
    }
  }

  const photos = items.filter((it) => it.type === 'photo')
  const videos = items.filter((it) => it.type === 'video')

  return (
    <div className="animate-rise">
      {/* Page Header */}
      <div className="gal-head mb-[22px]">
        <div>
          <div
            className="text-[11px] uppercase font-semibold"
            style={{ letterSpacing: '.12em', color: 'var(--color-accent)' }}
          >
            Media Library
          </div>
          <h2 style={{ margin: '4px 0 2px', fontSize: 30, color: 'var(--color-text)' }}>Event Gallery</h2>
          <p className="m-0 text-[13px]" style={{ color: 'var(--color-neutral-400)' }}>
            Manage event photos and YouTube videos to showcase on the public website.
          </p>
        </div>

        {/* Global Enable Gallery Switch */}
        <div
          className="gal-switch flex items-center gap-4 p-[12px_18px]"
          style={{
            borderRadius: 'var(--radius-lg)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-divider)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          <div className="gal-switch-txt text-right">
            <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--color-text)' }}>
              Enable Gallery in Public Page
            </div>
            <div style={{ fontSize: 11.5, color: enableGallery ? 'var(--color-accent)' : 'var(--color-neutral-500)' }}>
              {enableGallery ? '● Visible to site visitors' : '○ Hidden from public site'}
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleEnableGallery}
            style={{
              width: 48,
              height: 26,
              flex: 'none',
              borderRadius: 999,
              background: enableGallery ? 'var(--color-accent)' : 'var(--color-neutral-700)',
              position: 'relative',
              cursor: 'pointer',
              border: 'none',
              transition: 'background .2s ease',
              boxShadow: enableGallery ? '0 0 12px color-mix(in srgb,var(--color-accent) 40%,transparent)' : 'none',
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#ffffff',
                position: 'absolute',
                top: 3,
                left: enableGallery ? 25 : 3,
                transition: 'left .2s ease',
              }}
            />
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div
        className="gal-tabs border-b mb-6"
        style={{ borderColor: 'var(--color-divider)' }}
      >
        <div className="gal-tablist">
          <button
            onClick={() => setActiveTab('photos')}
            className="flex items-center gap-2"
            style={{
              padding: '12px 20px',
              font: "600 14px/1 'Poppins',sans-serif",
              borderBottom: `2px solid ${activeTab === 'photos' ? 'var(--color-accent)' : 'transparent'}`,
              color: activeTab === 'photos' ? 'var(--color-accent)' : 'var(--color-neutral-400)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all .15s ease',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            Photos ({photos.length})
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            className="flex items-center gap-2"
            style={{
              padding: '12px 20px',
              font: "600 14px/1 'Poppins',sans-serif",
              borderBottom: `2px solid ${activeTab === 'videos' ? 'var(--color-accent)' : 'transparent'}`,
              color: activeTab === 'videos' ? 'var(--color-accent)' : 'var(--color-neutral-400)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all .15s ease',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m10 9 5 3-5 3V9z" />
            </svg>
            Videos ({videos.length})
          </button>
        </div>

        <button
          onClick={() => openAddModal(activeTab === 'photos' ? 'photo' : 'video')}
          className="gal-add btn btn-primary flex items-center gap-2"
          style={{
            padding: '10px 18px',
            whiteSpace: 'nowrap',
            fontSize: 13.5,
            fontWeight: 600,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(150deg,var(--color-accent-500),var(--color-accent-700))',
            color: '#ffffff',
            boxShadow: '0 4px 14px color-mix(in srgb, var(--color-accent) 35%, transparent)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {activeTab === 'photos' ? 'Add Event Photo' : 'Add YouTube Video'}
        </button>
      </div>

      {/* ── PHOTOS TAB ── */}
      {activeTab === 'photos' && (
        <div>
          {photos.length === 0 ? (
            <div
              className="gal-empty card text-center p-12"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)' }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 opacity-40" style={{ color: 'var(--color-neutral-400)' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
              <h3 style={{ fontSize: 18, margin: '0 0 6px', color: 'var(--color-text)' }}>No Photos Added Yet</h3>
              <p className="m-0 text-[13px] mb-4" style={{ color: 'var(--color-neutral-400)' }}>
                Upload event photos to showcase in your public site gallery.
              </p>
              <button onClick={() => openAddModal('photo')} className="btn btn-primary" style={{ padding: '9px 20px' }}>
                + Add Photo
              </button>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {photos.map((item) => (
                <div
                  key={item.id}
                  className="card overflow-hidden flex flex-col justify-between"
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    padding: 0,
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-divider)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  }}
                >
                  <div className="relative" style={{ height: 210, background: '#000000' }}>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        padding: '4px 10px',
                        borderRadius: 999,
                        background: item.showInPublic ? '#16a34a' : 'rgba(0,0,0,0.75)',
                        color: '#ffffff',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {item.showInPublic ? 'Public' : 'Hidden'}
                    </div>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span
                        style={{
                          fontSize: 11.5,
                          textTransform: 'uppercase',
                          letterSpacing: '.06em',
                          color: 'var(--color-accent)',
                          fontWeight: 600,
                          display: 'block',
                        }}
                      >
                        📷 Photo · {item.eventType || 'General'}
                      </span>
                    </div>

                    <div
                      className="flex items-center justify-between gap-2 mt-4 pt-3 border-t"
                      style={{ borderColor: 'var(--color-divider)' }}
                    >
                      <label className="flex items-center gap-2 cursor-pointer text-[12px]" style={{ color: 'var(--color-neutral-300)' }}>
                        <input
                          type="checkbox"
                          checked={item.showInPublic}
                          onChange={() => handleToggleVisibility(item)}
                        />
                        Show in public
                      </label>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn btn-secondary btn-icon text-red-400"
                        title="Delete photo"
                        style={{ width: 32, height: 32 }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── VIDEOS TAB ── */}
      {activeTab === 'videos' && (
        <div>
          {videos.length === 0 ? (
            <div
              className="gal-empty card text-center p-12"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)' }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 opacity-40" style={{ color: 'var(--color-neutral-400)' }}>
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m10 9 5 3-5 3V9z" />
              </svg>
              <h3 style={{ fontSize: 18, margin: '0 0 6px', color: 'var(--color-text)' }}>No YouTube Videos Added</h3>
              <p className="m-0 text-[13px] mb-4" style={{ color: 'var(--color-neutral-400)' }}>
                Add YouTube video links to feature event highlights on your site.
              </p>
              <button onClick={() => openAddModal('video')} className="btn btn-primary" style={{ padding: '9px 20px' }}>
                + Add Video
              </button>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((item) => (
                <div
                  key={item.id}
                  className="card overflow-hidden flex flex-col justify-between"
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    padding: 0,
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-divider)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  }}
                >
                  {/* YouTube Embed / Thumbnail */}
                  <div className="relative" style={{ height: 210, background: '#000000' }}>
                    {item.youtubeId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${item.youtubeId}`}
                        title={item.title}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xs">
                        No Preview Available
                      </div>
                    )}
                    <div
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        padding: '4px 10px',
                        borderRadius: 999,
                        background: item.showInPublic ? '#16a34a' : 'rgba(0,0,0,0.75)',
                        color: '#ffffff',
                        fontSize: 11,
                        fontWeight: 600,
                        pointerEvents: 'none',
                      }}
                    >
                      {item.showInPublic ? 'Public' : 'Hidden'}
                    </div>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span
                        style={{
                          fontSize: 11.5,
                          textTransform: 'uppercase',
                          letterSpacing: '.06em',
                          color: 'var(--color-accent)',
                          fontWeight: 600,
                          display: 'block',
                        }}
                      >
                        🎥 Video · {item.eventType || 'General'}
                      </span>
                    </div>

                    <div
                      className="flex items-center justify-between gap-2 mt-4 pt-3 border-t"
                      style={{ borderColor: 'var(--color-divider)' }}
                    >
                      <label className="flex items-center gap-2 cursor-pointer text-[12px]" style={{ color: 'var(--color-neutral-300)' }}>
                        <input
                          type="checkbox"
                          checked={item.showInPublic}
                          onChange={() => handleToggleVisibility(item)}
                        />
                        Show in public
                      </label>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn btn-secondary btn-icon text-red-400"
                        title="Delete video"
                        style={{ width: 32, height: 32 }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ADD ITEM MODAL ── */}
      {showAddModal &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              background: 'rgba(10, 14, 26, 0.82)',
              backdropFilter: 'blur(10px)',
              overflowY: 'auto',
            }}
            onClick={() => setShowAddModal(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 500,
                maxHeight: 'calc(100vh - 40px)',
                borderRadius: 20,
                background: '#161e31',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                margin: 'auto',
                color: '#f8fafc',
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flex: 'none',
                  background: '#0f172a',
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 2px', fontSize: 19, fontWeight: 700, color: '#ffffff' }}>
                    {itemType === 'photo' ? 'Add Event Photo' : 'Add YouTube Video'}
                  </h3>
                  <p style={{ margin: 0, fontSize: 12.5, color: '#94a3b8' }}>
                    {itemType === 'photo' ? 'Upload an image file to show in public site gallery' : 'Enter YouTube video link to showcase'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: '1px solid #334155',
                    background: '#1e293b',
                    color: '#f8fafc',
                    cursor: 'pointer',
                    fontSize: 18,
                    display: 'grid',
                    placeItems: 'center',
                    transition: 'all .15s ease',
                  }}
                >
                  ×
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto', flex: 1, minHeight: 0 }}>
                {/* Type Switcher */}
                <div
                  style={{
                    display: 'flex',
                    gap: 4,
                    padding: 4,
                    borderRadius: 10,
                    background: '#0f172a',
                    border: '1px solid #334155',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setItemType('photo')}
                    style={{
                      flex: 1,
                      padding: '9px',
                      borderRadius: 8,
                      border: 'none',
                      background: itemType === 'photo' ? 'linear-gradient(150deg, #6366f1, #4f46e5)' : 'transparent',
                      color: itemType === 'photo' ? '#ffffff' : '#94a3b8',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all .2s ease',
                      boxShadow: itemType === 'photo' ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none',
                    }}
                  >
                    📷 Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemType('video')}
                    style={{
                      flex: 1,
                      padding: '9px',
                      borderRadius: 8,
                      border: 'none',
                      background: itemType === 'video' ? 'linear-gradient(150deg, #6366f1, #4f46e5)' : 'transparent',
                      color: itemType === 'video' ? '#ffffff' : '#94a3b8',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all .2s ease',
                      boxShadow: itemType === 'video' ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none',
                    }}
                  >
                    🎥 Video
                  </button>
                </div>

                {/* Event Type Category */}
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: '#cbd5e1', marginBottom: 6 }}>
                    Event Category
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 8,
                      border: '1px solid #334155',
                      background: '#0f172a',
                      color: '#f8fafc',
                      fontSize: 13.5,
                      outline: 'none',
                    }}
                  >
                    {EVENT_TYPES.map((cat) => (
                      <option key={cat} value={cat} style={{ background: '#0f172a', color: '#f8fafc' }}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Photo File upload */}
                {itemType === 'photo' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: '#cbd5e1', marginBottom: 6 }}>
                      Image File *
                    </label>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) handlePhotoSelect(f)
                      }}
                    />
                    <div
                      onClick={() => fileRef.current?.click()}
                      style={{
                        padding: photoPreview ? 12 : 28,
                        borderRadius: 10,
                        border: '2px dashed #6366f1',
                        background: '#0f172a',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'border-color .2s ease',
                      }}
                    >
                      {photoPreview ? (
                        <div className="flex flex-col items-center gap-2">
                          <img
                            src={photoPreview}
                            alt="Preview"
                            style={{ maxHeight: 180, borderRadius: 8, objectFit: 'contain' }}
                          />
                          <span style={{ fontSize: 12, color: '#818cf8', fontWeight: 600 }}>
                            Click to change photo
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-center">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="m21 15-5-5L5 21" />
                          </svg>
                          <span style={{ fontSize: 13.5, color: '#f8fafc', fontWeight: 500 }}>
                            Click or drag image file here to upload
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* YouTube URL input */}
                {itemType === 'video' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: '#cbd5e1', marginBottom: 6 }}>
                      YouTube Video URL *
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 8,
                        border: '1px solid #334155',
                        background: '#0f172a',
                        color: '#f8fafc',
                        fontSize: 13.5,
                        outline: 'none',
                      }}
                    />
                  </div>
                )}

                {/* Show in Public toggle */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#f1f5f9' }}>
                  <input
                    type="checkbox"
                    checked={showInPublic}
                    onChange={(e) => setShowInPublic(e.target.checked)}
                    style={{ accentColor: '#6366f1', width: 16, height: 16 }}
                  />
                  Show this item in public gallery immediately
                </label>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 8,
                      border: '1px solid #334155',
                      background: '#1e293b',
                      color: '#f8fafc',
                      fontSize: 13.5,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleCreate}
                    style={{
                      padding: '10px 22px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'linear-gradient(150deg, #6366f1, #4f46e5)',
                      color: '#ffffff',
                      fontSize: 13.5,
                      fontWeight: 600,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {saving ? 'Saving...' : 'Add to Gallery'}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
