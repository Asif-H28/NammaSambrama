import type { IconKey } from '@/types'

export const ICON_LABELS: Record<IconKey, string> = {
  rings: 'Wedding rings',
  cake: 'Cake',
  ring: 'Engagement ring',
  baby: 'Baby',
  briefcase: 'Corporate',
  grad: 'Graduation',
  music: 'Music & DJ',
  camera: 'Photography',
  plant: 'Décor',
}

export const ICON_KEYS = Object.keys(ICON_LABELS) as IconKey[]

const strokeProps = {
  viewBox: '0 0 24 24',
  width: 20,
  height: 20,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
}

export function EventIcon({ name }: { name: IconKey | '' }) {
  if (!name) return <span className="flex opacity-50 text-[13px]">—</span>
  switch (name) {
    case 'rings':
      return (
        <svg {...strokeProps}>
          <circle cx="9" cy="14" r="5" />
          <circle cx="15" cy="14" r="5" />
          <path d="M9 9 7 4M15 9l2-5" />
        </svg>
      )
    case 'cake':
      return (
        <svg {...strokeProps}>
          <path d="M4 21h16M5 21v-6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6M8 13V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4M12 4v3" />
        </svg>
      )
    case 'ring':
      return (
        <svg {...strokeProps}>
          <circle cx="12" cy="15" r="6" />
          <path d="M12 9 9 3h6l-3 6Z" />
        </svg>
      )
    case 'baby':
      return (
        <svg {...strokeProps}>
          <circle cx="12" cy="8" r="4" />
          <path d="M8 12c-3 1-4 4-4 8h16c0-4-1-7-4-8" />
        </svg>
      )
    case 'briefcase':
      return (
        <svg {...strokeProps}>
          <rect x="3" y="8" width="18" height="12" rx="1.5" />
          <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      )
    case 'grad':
      return (
        <svg {...strokeProps} strokeLinejoin="round">
          <path d="M2 9 12 4l10 5-10 5-10-5Z" />
          <path d="M6 11.5V17c0 1.5 3 3 6 3s6-1.5 6-3v-5.5" />
        </svg>
      )
    case 'music':
      return (
        <svg {...strokeProps}>
          <path d="M9 18V5l11-2v13" />
          <circle cx="6.5" cy="18" r="2.5" />
          <circle cx="17.5" cy="16" r="2.5" />
        </svg>
      )
    case 'camera':
      return (
        <svg {...strokeProps} strokeLinejoin="round">
          <path d="M4 8h3l2-3h6l2 3h3v11H4Z" />
          <circle cx="12" cy="13" r="3.5" />
        </svg>
      )
    case 'plant':
      return (
        <svg {...strokeProps} strokeLinejoin="round">
          <path d="M12 21v-8" />
          <path d="M12 13c0-4 3-6 7-6 0 4-3 6-7 6Z" />
          <path d="M12 15c0-3-3-5-6-5 0 3 3 5 6 5Z" />
          <path d="M8 21h8" />
        </svg>
      )
  }
}

// Generated motif artwork — layered CSS art in the active theme's palette.
const rangoli =
  'radial-gradient(circle at 18% 26%,color-mix(in srgb,var(--p-card) 70%,transparent) 0 3px,transparent 4px),radial-gradient(circle at 50% 18%,color-mix(in srgb,var(--p-card) 55%,transparent) 0 2.5px,transparent 3.5px),radial-gradient(circle at 82% 30%,color-mix(in srgb,var(--p-card) 70%,transparent) 0 3px,transparent 4px),radial-gradient(circle at 34% 62%,color-mix(in srgb,var(--p-card) 45%,transparent) 0 2px,transparent 3px),radial-gradient(circle at 68% 70%,color-mix(in srgb,var(--p-card) 45%,transparent) 0 2px,transparent 3px)'
const rays =
  'repeating-conic-gradient(from 200deg at 50% 118%,color-mix(in srgb,var(--p-gold-light) 42%,transparent) 0 3deg,transparent 3deg 9deg)'
const ribs =
  'repeating-linear-gradient(74deg,color-mix(in srgb,var(--p-deep) 12%,transparent) 0 1.5px,transparent 1.5px 13px)'
const arch =
  'radial-gradient(120% 78% at 50% 106%,color-mix(in srgb,var(--p-gold) 46%,transparent) 0 42%,color-mix(in srgb,var(--p-gold-dark) 32%,transparent) 42% 47%,transparent 48%)'
const petals =
  'repeating-conic-gradient(from 0deg at 22% 24%,color-mix(in srgb,var(--p-card) 42%,transparent) 0 14deg,transparent 14deg 30deg),repeating-conic-gradient(from 12deg at 78% 72%,color-mix(in srgb,var(--p-card) 34%,transparent) 0 14deg,transparent 14deg 30deg)'
const lamps =
  'radial-gradient(circle at 14% 78%,color-mix(in srgb,var(--p-gold-light) 80%,transparent) 0 4px,transparent 9px),radial-gradient(circle at 38% 86%,color-mix(in srgb,var(--p-gold-light) 70%,transparent) 0 3px,transparent 8px),radial-gradient(circle at 62% 86%,color-mix(in srgb,var(--p-gold-light) 70%,transparent) 0 3px,transparent 8px),radial-gradient(circle at 86% 78%,color-mix(in srgb,var(--p-gold-light) 80%,transparent) 0 4px,transparent 9px)'
const bunting =
  'repeating-linear-gradient(135deg,color-mix(in srgb,var(--p-rose) 55%,transparent) 0 11px,color-mix(in srgb,var(--p-gold) 55%,transparent) 11px 22px)'

export const ART: Record<IconKey, string> = {
  rings: arch + ',' + lamps + ',linear-gradient(150deg,var(--p-art-a),var(--p-art-b) 78%)',
  cake: bunting + ',' + rangoli + ',linear-gradient(150deg,var(--p-gold-light),var(--p-art-b) 82%)',
  ring: petals + ',linear-gradient(150deg,var(--p-art-a),var(--p-rose) 120%)',
  baby: rangoli + ',linear-gradient(155deg,var(--p-art-a),var(--p-art-b) 92%)',
  briefcase: rays + ',linear-gradient(150deg,var(--p-deep-2),var(--p-deep))',
  grad: ribs + ',linear-gradient(150deg,var(--p-art-b),var(--p-deep) 150%)',
  music: rays + ',' + lamps + ',linear-gradient(150deg,var(--p-deep),var(--p-deep-2) 90%)',
  camera: arch + ',linear-gradient(150deg,var(--p-art-a),var(--p-gold-dark))',
  plant: ribs + ',' + petals + ',linear-gradient(150deg,var(--p-art-a),var(--p-gold) 140%)',
}
const ART_KEYS = Object.keys(ART) as IconKey[]

// deterministic art for anything without an icon (cuisines, dishes)
export function artFor(name: string): string {
  const hash = Math.abs(
    String(name).split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7),
  )
  return ART[ART_KEYS[hash % ART_KEYS.length]]
}
