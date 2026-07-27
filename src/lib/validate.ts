import type { EventType } from '@/types'

export interface EventErrors {
  type?: boolean
  title?: boolean
  icon?: boolean
  video?: boolean
}

export function eventErrors(f: EventType): EventErrors {
  const e: EventErrors = {}
  if (!f.eventType.trim()) e.type = true
  if (!f.eventTitle.trim()) e.title = true
  if (!f.eventIcon) e.icon = true
  if (f.eventVideo && !/youtu\.?be|vimeo/i.test(f.eventVideo)) e.video = true
  return e
}
