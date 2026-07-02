import { SPECIMENS, SPECIMEN_MAP } from '@/data/specimens'
import type { Specimen } from '@/types/specimen'

/* Reverse-edge index: for a given specimen, which other specimens link TO it.
   Derived once from the existing `links` arrays — no new data to maintain. */
const BACKLINKS: Record<string, string[]> = {}
SPECIMENS.forEach(s => {
  s.links.forEach(target => {
    if (!BACKLINKS[target]) BACKLINKS[target] = []
    if (!BACKLINKS[target].includes(s.id)) BACKLINKS[target].push(s.id)
  })
})

export function backlinksFor(id: string): string[] {
  return BACKLINKS[id] ?? []
}

/** Outgoing + incoming, de-duped, self excluded, resolved to specimens. */
export function connectedThreads(id: string): Specimen[] {
  const s = SPECIMEN_MAP[id]
  if (!s) return []
  const ids = new Set<string>()
  s.links.forEach(l => ids.add(l))
  backlinksFor(id).forEach(l => ids.add(l))
  ids.delete(id)
  return Array.from(ids)
    .map(x => SPECIMEN_MAP[x])
    .filter(Boolean)
}

/** Prev/next through the canonical collection order. */
export function neighbours(id: string): { prev?: Specimen; next?: Specimen } {
  const i = SPECIMENS.findIndex(s => s.id === id)
  if (i === -1) return {}
  return {
    prev: i > 0 ? SPECIMENS[i - 1] : undefined,
    next: i < SPECIMENS.length - 1 ? SPECIMENS[i + 1] : undefined,
  }
}
