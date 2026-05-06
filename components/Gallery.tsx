'use client'

import { SPECIMENS } from '@/data/specimens'
import type { Specimen } from '@/types/specimen'

const TYPE_KEY: Record<string, string> = { organism: 'org', system: 'sys', phenomenon: 'phe', process: 'pro' }

interface Props {
  onSelectSpecimen: (id: string) => void
}

export default function Gallery({ onSelectSpecimen }: Props) {
  const ordered = [...SPECIMENS].sort((a, b) => {
    const rank: Record<string, number> = { live: 0, progress: 1, queued: 2 }
    return rank[a.status] - rank[b.status]
  })

  return (
    <footer className="gal">
      <div className="gal-head">
        <div className="lbl">In the Galleries</div>
        <div className="ttl">Currently on view</div>
      </div>
      <div className="gal-strip">
        {ordered.map(s => (
          <GalCard key={s.id} s={s} onOpen={() => onSelectSpecimen(s.id)} />
        ))}
      </div>
    </footer>
  )
}

function GalCard({ s, onOpen }: { s: Specimen; onOpen: () => void }) {
  const statText = s.status === 'live' ? 'PUBLISHED' : s.status === 'progress' ? 'IN PROGRESS' : 'QUEUED'
  const statColor = s.status === 'live' ? 'var(--accent)' : s.status === 'progress' ? 'var(--ink2)' : 'var(--ink4)'

  return (
    <div
      className="gal-card"
      style={{ '--card-color': `var(--c-${TYPE_KEY[s.type]})` } as React.CSSProperties}
      onClick={onOpen}
    >
      <div className="ix">
        <span>{s.serial}</span>
        <span className="stat" style={{ color: statColor }}>{statText}</span>
      </div>
      <div className="lat">{s.name}</div>
      <div className="com">{s.common}</div>
      <div className="desc">{s.desc}</div>
    </div>
  )
}
