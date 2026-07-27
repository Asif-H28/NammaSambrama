const cache = new Map<string, string>()

async function translateOne(text: string): Promise<string> {
  const trimmed = text.trim()
  if (!trimmed) return text
  if (cache.has(trimmed)) return cache.get(trimmed)!

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=kn&dt=t&q=${encodeURIComponent(trimmed)}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`translate failed: ${res.status}`)
    const data = await res.json()
    const translated = data[0].map((chunk: [string]) => chunk[0]).join('')
    cache.set(trimmed, translated)
    return translated
  } catch {
    return text
  }
}

export async function translateBatch(texts: string[]): Promise<Record<string, string>> {
  const unique = Array.from(new Set(texts.map((t) => t.trim()).filter(Boolean)))
  const results = await Promise.all(unique.map((t) => translateOne(t)))
  const map: Record<string, string> = {}
  unique.forEach((t, i) => {
    map[t] = results[i]
  })
  return map
}
