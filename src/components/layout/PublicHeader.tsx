import { useEffect, useRef, useState } from 'react'
import type { PublicLang } from '@/hooks/usePublicLanguage'
import { NSLogo } from '@/components/brand/NSLogo'

const NAV = [
  { href: '#events', en: 'Events', kn: 'ಈವೆಂಟ್‌ಗಳು' },
  { href: '#menu', en: 'Menu', kn: 'ಮೆನು' },
  { href: '#payment', en: 'Payment', kn: 'ಪಾವತಿ' },
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

  // Close on outside click and on Escape
  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
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

      {/* Desktop section links */}
      <nav className="ps-nav-links flex items-center gap-[24px]" style={{ marginLeft: 'clamp(12px,4vw,42px)' }}>
        {NAV.map((item) => (
          <a key={item.href} href={item.href} className="ps-navlink">
            {lang === 'kn' ? item.kn : item.en}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-[10px]" style={{ marginLeft: 'auto' }}>
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

        {/* Hamburger — mobile only, mirrors the desktop nav links */}
        <div className="ps-burger-wrap relative flex-none" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={lang === 'kn' ? 'ಮೆನು' : 'Menu'}
            aria-expanded={menuOpen}
            className="ps-burger grid place-items-center"
          >
            <span className={`ps-burger-ico ${menuOpen ? 'is-open' : ''}`}>
              <i />
              <i />
              <i />
            </span>
          </button>

          {menuOpen && (
            <div className="ps-burger-menu">
              {NAV.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                  {lang === 'kn' ? item.kn : item.en}
                </a>
              ))}
              <a
                href="/book"
                className="is-cta"
                onClick={() => setMenuOpen(false)}
              >
                {lang === 'kn' ? 'ಈವೆಂಟ್ ಬುಕ್ ಮಾಡಿ' : 'Book an Event'}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
