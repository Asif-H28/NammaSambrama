import { useEffect, useRef, useState } from 'react'
import type { PublicLang } from '@/hooks/usePublicLanguage'
import { NSLogo } from '@/components/brand/NSLogo'

const NAV = [
  { href: '#events', en: 'Events', kn: 'ಈವೆಂಟ್‌ಗಳು' },
  { href: '#menu', en: 'Menu', kn: 'ಮೆನು' },
  { href: '#process', en: 'How it works', kn: 'ಹೇಗೆ' },
  { href: '#contact', en: 'Contact', kn: 'ಸಂಪರ್ಕ' },
]

export function PublicHeader({
  lang,
  onLangChange,
}: {
  lang: PublicLang
  onLangChange: (lang: PublicLang) => void
}) {
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
      className="ps-nav flex items-center gap-[14px]"
      style={{
        padding: '11px clamp(16px,3vw,34px)',
        background: 'color-mix(in srgb, #0b1226 88%, transparent)',
        borderBottom: '1px solid color-mix(in srgb, var(--p-gold) 22%, transparent)',
      }}
    >
      {/* Brand mark */}
      <a href="#top" className="flex items-center gap-[10px] flex-none" style={{ textDecoration: 'none' }}>
        <NSLogo size={36} />
        <span
          style={{
            font: "700 15px/1 'Noto Sans Kannada',sans-serif",
            color: 'var(--p-gold-light)',
          }}
        >
          ನಮ್ಮ ಸಂಭ್ರಮ
        </span>
      </a>

      {/* Section links */}
      <nav className="ps-nav-links flex items-center gap-[24px]" style={{ marginLeft: 'clamp(12px,4vw,42px)' }}>
        {NAV.map((item) => (
          <a key={item.href} href={item.href} className="ps-navlink">
            {lang === 'kn' ? item.kn : item.en}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-[12px]" style={{ marginLeft: 'auto' }}>
        {/* Language toggle */}
        <div
          className="flex items-center flex-none"
          style={{
            borderRadius: 999,
            background: 'rgba(255,255,255,.07)',
            border: '1px solid rgba(255,255,255,.1)',
            padding: 3,
          }}
        >
          {(['kn', 'en'] as const).map((code) => (
            <button
              key={code}
              onClick={() => onLangChange(code)}
              style={{
                padding: '6px 13px',
                borderRadius: 999,
                border: 0,
                cursor: 'pointer',
                font: "600 11.5px/1 'Poppins',sans-serif",
                background:
                  lang === code
                    ? 'linear-gradient(150deg,var(--p-gold),var(--p-gold-dark))'
                    : 'transparent',
                color: lang === code ? '#12182c' : '#cfd3e5',
                transition: 'all .2s ease',
              }}
            >
              {code === 'kn' ? 'ಕನ್ನಡ' : 'English'}
            </button>
          ))}
        </div>

        {/* Account menu */}
        <div className="relative flex-none" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Account menu"
            className="grid place-items-center"
            style={{
              width: 33,
              height: 33,
              borderRadius: '50%',
              border: '1px solid color-mix(in srgb, var(--p-gold) 45%, transparent)',
              background: 'rgba(255,255,255,.08)',
              color: 'var(--p-gold-light)',
              cursor: 'pointer',
              font: "600 12px/1 'Poppins',sans-serif",
            }}
          >
            G
          </button>
          {menuOpen && (
            <div
              className="absolute flex flex-col"
              style={{
                top: 'calc(100% + 9px)',
                right: 0,
                minWidth: 172,
                borderRadius: 12,
                overflow: 'hidden',
                background: '#161c30',
                border: '1px solid color-mix(in srgb, var(--p-gold) 20%, transparent)',
                boxShadow: '0 16px 34px rgba(0,0,0,.45)',
                zIndex: 40,
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
                    padding: '11px 15px',
                    border: 0,
                    background: 'transparent',
                    color: '#e9e9ed',
                    cursor: 'pointer',
                    font: "500 13px/1 'Poppins',sans-serif",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(212,175,55,.12)')}
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
    </div>
  )
}
