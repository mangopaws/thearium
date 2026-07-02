import React from 'react'
import Link from 'next/link'
import type { Block } from '@/types/specimen'
import { SPECIMEN_MAP } from '@/data/specimens'

/* ───────── INLINE PARSER ─────────
   Supports **strong**, *em*, and [label](target).
   target = specimen id  → internal cross-reference (accent, dotted underline)
   target = http(s)://…  → external link */
function parseInline(text: string, keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    const key = `${keyBase}-${i++}`
    if (m[1] !== undefined) {
      nodes.push(<strong key={key} style={{ fontWeight: 500, color: 'var(--ink)' }}>{parseInline(m[1], key)}</strong>)
    } else if (m[2] !== undefined) {
      nodes.push(<em key={key}>{parseInline(m[2], key)}</em>)
    } else if (m[3] !== undefined && m[4] !== undefined) {
      const label = m[3]
      const target = m[4]
      const isExternal = /^https?:\/\//.test(target)
      const known = SPECIMEN_MAP[target]
      if (isExternal) {
        nodes.push(
          <a key={key} href={target} target="_blank" rel="noopener noreferrer"
             style={linkStyle}>{label}</a>
        )
      } else if (known) {
        nodes.push(
          <Link key={key} href={`/specimens/${target}`} style={xrefStyle} title={known.common}>{label}</Link>
        )
      } else {
        nodes.push(label)
      }
    }
    last = re.lastIndex
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

const linkStyle: React.CSSProperties = {
  color: 'var(--accent)', textDecoration: 'underline',
  textUnderlineOffset: 3, textDecorationThickness: 1,
}
const xrefStyle: React.CSSProperties = {
  color: 'var(--accent)', textDecoration: 'underline dotted',
  textUnderlineOffset: 4, textDecorationThickness: 1, fontStyle: 'italic',
}

export default function EntryBody({ blocks }: { blocks: Block[] }) {
  let leadRendered = false
  return (
    <div>
      {blocks.map((b, idx) => {
        const key = `b-${idx}`
        switch (b.kind) {
          case 'section':
            return (
              <h2 key={key} style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11, fontWeight: 400, letterSpacing: '0.28em',
                textTransform: 'uppercase', color: 'var(--ink3)',
                margin: '52px 0 20px', paddingBottom: 10,
                borderBottom: '1px solid var(--rule)',
              }}>{b.title}</h2>
            )
          case 'p': {
            const isLead = b.lead && !leadRendered
            if (isLead) leadRendered = true
            return (
              <p key={key} className={isLead ? 'arium-lead' : undefined} style={{
                fontFamily: "'Fraunces', serif", fontWeight: 300,
                fontSize: isLead ? 22 : 19, lineHeight: 1.72,
                color: isLead ? 'var(--ink)' : 'var(--ink2)',
                margin: '0 0 22px',
              }}>{parseInline(b.text, key)}</p>
            )
          }
          case 'pullquote':
            return (
              <blockquote key={key} style={{
                margin: '44px 0', paddingLeft: 24,
                borderLeft: '2px solid var(--accent)',
              }}>
                <div style={{
                  fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                  fontSize: 'clamp(24px, 3.4vw, 32px)', lineHeight: 1.28,
                  letterSpacing: '-0.01em', color: 'var(--ink)',
                }}>{parseInline(b.text, key)}</div>
                {b.att && (
                  <div style={{
                    marginTop: 14, fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase',
                    color: 'var(--ink3)',
                  }}>{b.att}</div>
                )}
              </blockquote>
            )
          case 'aside':
            return (
              <aside key={key} style={{
                margin: '26px 0', padding: '18px 22px',
                background: 'var(--bg-card)', border: '1px solid var(--rule)',
                borderRadius: 12, fontFamily: "'Fraunces', serif", fontWeight: 300,
                fontSize: 16, lineHeight: 1.6, color: 'var(--ink2)',
              }}>{parseInline(b.text, key)}</aside>
            )
          case 'figure':
            return (
              <figure key={key} style={{ margin: '36px 0' }}>
                <pre style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                  lineHeight: 1.6, color: 'var(--ink2)', background: 'var(--bg-card)',
                  border: '1px solid var(--rule2)', borderRadius: 12,
                  padding: '22px 24px', overflowX: 'auto', whiteSpace: 'pre',
                }}>{b.mono}</pre>
                <figcaption style={{
                  marginTop: 12, fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: 'var(--ink3)',
                }}>{parseInline(b.caption, key)}</figcaption>
              </figure>
            )
        }
      })}
    </div>
  )
}
