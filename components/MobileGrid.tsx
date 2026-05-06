'use client'

import { SPECIMENS } from '@/data/specimens'
import type { Specimen, SpecimenType } from '@/types/specimen'

const TYPE_KEY: Record<string, string> = { organism: 'org', system: 'sys', phenomenon: 'phe', process: 'pro' }
const TYPE_LABEL: Record<string, string> = { organism: 'Organisms', system: 'Systems', phenomenon: 'Phenomena', process: 'Processes' }
const TYPES: SpecimenType[] = ['organism', 'system', 'phenomenon', 'process']

interface Props {
  onSelectSpecimen: (id: string) => void
}

export default function MobileGrid({ onSelectSpecimen }: Props) {
  return (
    <div className="mobile-grid">
      {TYPES.map(type => {
        const group = SPECIMENS.filter(s => s.type === type)
        return (
          <div key={type} className="mobile-section">
            <div className="mobile-section-header">
              <span className="dot" style={{ background: `var(--c-${TYPE_KEY[type]})` }} />
              {TYPE_LABEL[type]}
            </div>
            {group.map(s => (
              <MobileCard key={s.id} s={s} onOpen={() => onSelectSpecimen(s.id)} />
            ))}
          </div>
        )
      })}
    </div>
  )
}

function MobileCard({ s, onOpen }: { s: Specimen; onOpen: () => void }) {
  return (
    <div
      className="mobile-card"
      style={{ '--card-color': `var(--c-${TYPE_KEY[s.type]})` } as React.CSSProperties}
      onClick={onOpen}
    >
      <div className="mc-name">{s.name}</div>
      <div className="mc-common">{s.common}</div>
      <div className="mc-desc">{s.desc}</div>
      <div className="mc-badge">
        <span className="dot" style={{ background: `var(--c-${TYPE_KEY[s.type]})` }} />
        {s.type} · {s.status}
      </div>
    </div>
  )
}
