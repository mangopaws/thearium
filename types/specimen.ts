export type SpecimenType = 'organism' | 'system' | 'phenomenon' | 'process'
export type SpecimenStatus = 'live' | 'progress' | 'queued'

export interface Specimen {
  id: string
  name: string
  common: string
  type: SpecimenType
  status: SpecimenStatus
  desc: string
  quote?: string
  att?: string
  region: string
  first: string
  words: string
  links: string[]
  serial?: string
}

/* ───────── ENTRY CONTENT MODEL ─────────
   A specimen's long-form body is an ordered list of blocks.
   Inline syntax inside any text field:
     *italic*        → emphasis
     **bold**        → strong
     [label](id)     → link. If id matches a specimen id it becomes an
                       internal cross-reference; an http(s) id becomes an
                       external link.
*/
export type Block =
  | { kind: 'section'; title: string }
  | { kind: 'p'; text: string; lead?: boolean }
  | { kind: 'pullquote'; text: string; att?: string }
  | { kind: 'aside'; text: string }
  | { kind: 'figure'; mono: string; caption: string }

export interface Entry {
  /** specimen id this entry belongs to */
  id: string
  /** short standfirst shown under the title, before the body */
  standfirst: string
  /** ordered body blocks */
  body: Block[]
  /** optional closing field-note / colophon */
  colophon?: string
}
