'use client'

import { SPECIMENS } from '@/data/specimens'

const TYPES = ['organism', 'system', 'phenomenon', 'process'] as const
type SpecimenType = typeof TYPES[number]

interface Props {
  activeTypes: Set<string>
  onToggleType: (type: string) => void
}

export default function Legend({ activeTypes, onToggleType }: Props) {
  const counts: Record<string, number> = {}
  TYPES.forEach(t => { counts[t] = SPECIMENS.filter(s => s.type === t).length })

  return (
    <div className="legend">
      {TYPES.map(type => (
        <div
          key={type}
          className={`leg-row${activeTypes.has(type) ? '' : ' dim'}`}
          data-type={type}
          onClick={() => onToggleType(type)}
        >
          <span className="dot" style={{ background: `var(--c-${typeKey(type)})` }} />
          {label(type)}
          <span className="ct">{counts[type]}</span>
        </div>
      ))}
    </div>
  )
}

function typeKey(t: SpecimenType) {
  return { organism: 'org', system: 'sys', phenomenon: 'phe', process: 'pro' }[t]
}

function label(t: SpecimenType) {
  return { organism: 'Organisms', system: 'Systems', phenomenon: 'Phenomena', process: 'Processes' }[t]
}
