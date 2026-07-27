const PHOTO_BY_TYPE: Record<string, string> = {
  wedding: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=70&auto=format&fit=crop',
  engagement: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&q=70&auto=format&fit=crop',
  birthday: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=70&auto=format&fit=crop',
  'baby shower': 'https://images.unsplash.com/photo-1544476915-ed1370594142?w=800&q=70&auto=format&fit=crop',
  corporate: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=70&auto=format&fit=crop',
  graduation: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=70&auto=format&fit=crop',
  anniversary: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=70&auto=format&fit=crop',
  housewarming: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=70&auto=format&fit=crop',
}

export function photoForEventType(eventType: string): string | undefined {
  const key = eventType.trim().toLowerCase()
  return PHOTO_BY_TYPE[key]
}
