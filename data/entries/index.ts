import type { Entry } from '@/types/specimen'
import { sugarMaple } from './sugar-maple'

/* ───────── ENTRY REGISTRY ─────────
   Add one import + one line here to publish a new specimen entry.
   A specimen with no entry falls back to its index card + "in preparation".
*/
const ENTRIES: Entry[] = [
  sugarMaple,
]

export const ENTRY_MAP: Record<string, Entry> = {}
ENTRIES.forEach(e => { ENTRY_MAP[e.id] = e })

export function getEntry(id: string): Entry | undefined {
  return ENTRY_MAP[id]
}

/** A specimen is truly published only when a written entry exists. */
export function isPublished(id: string): boolean {
  return id in ENTRY_MAP
}
