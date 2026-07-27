import { useEffect, useRef, useState } from 'react'
import type { PublicLang } from '@/hooks/usePublicLanguage'

export function PublicHeader({ lang, onLangChange }: { lang: PublicLang; onLangChange: (lang: PublicLang) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  return (
    <div
      className="flex items-center justify-end gap-[14px]"
      style={{ padding: '10px 20px', background: '#1b1e2f', borderBottom: '1px solid var(--color-divider)' }}
    >
      <div
        className="flex items-center"
        style={{ borderRadius: 999, background: 'rgba(255,255,255,.08)', padding: 3 }}
      >
        {(['kn', 'en'] as const).map((code) => (
          <button
            key={code}
            onClick={() => onLangChange(code)}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              border: 0,
              cursor: 'pointer',
              font: "600 12px/1 'Inter',sans-serif",
              background: lang === code ? 'var(--color-accent, #9184d9)' : 'transparent',
              color: lang === code ? '#161826' : '#cfd3e5',
            }}
          >
            {code === 'kn' ? 'ಕನ್ನಡ' : 'English'}
          </button>
        ))}
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="grid place-items-center"
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,.2)',
            background: 'rgba(255,255,255,.08)',
            color: '#e9e9ed',
            cursor: 'pointer',
            font: "600 12px/1 'Inter',sans-serif",
          }}
        >
          G
        </button>
        {menuOpen && (
          <div
            className="absolute flex flex-col"
            style={{
              top: 'calc(100% + 8px)',
              right: 0,
              minWidth: 168,
              borderRadius: 10,
              overflow: 'hidden',
              background: '#232532',
              border: '1px solid rgba(255,255,255,.12)',
              boxShadow: '0 12px 28px rgba(0,0,0,.35)',
              zIndex: 20,
            }}
          >
            {[
              lang === 'kn' ? 'ಪ್ರೊಫೈಲ್' : 'Profile',
              lang === 'kn' ? 'ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು' : 'My Bookings',
              lang === 'kn' ? 'ಲಾಗ್ ಔಟ್' : 'Logout',
            ].map((item) => (
              <button
                key={item}
                className="text-left"
                style={{
                  padding: '10px 14px',
                  border: 0,
                  background: 'transparent',
                  color: '#e9e9ed',
                  cursor: 'pointer',
                  font: "500 13px/1 'Inter',sans-serif",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
