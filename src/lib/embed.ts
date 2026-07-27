export function embedUrl(url: string, autoplay: boolean): string {
  if (!url) return ''
  const y = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{6,})/)
  if (y) return `https://www.youtube.com/embed/${y[1]}?rel=0&modestbranding=1${autoplay ? '&autoplay=1' : ''}`
  const v = url.match(/vimeo\.com\/(\d+)/)
  if (v) return `https://player.vimeo.com/video/${v[1]}${autoplay ? '?autoplay=1' : ''}`
  return ''
}

export function videoHost(url: string): 'Vimeo' | 'YouTube' {
  return /vimeo/i.test(url) ? 'Vimeo' : 'YouTube'
}
