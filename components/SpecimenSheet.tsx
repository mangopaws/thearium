'use client'

import { useEffect, useCallback } from 'react'
import Link from 'next/link'
import { SPECIMEN_MAP } from '@/data/specimens'
import type { Specimen } from '@/types/specimen'

const TYPE_KEY: Record<string, string> = { organism: 'org', system: 'sys', phenomenon: 'phe', process: 'pro' }
const STATUS_LABEL: Record<string, string> = { live: 'Published', progress: 'In progress', queued: 'Queued' }

function getCss(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
function typeColor(type: string) {
  return getCss(`--c-${TYPE_KEY[type]}`)
}

function drawPlate(d: Specimen): string {
  const c = typeColor(d.type)
  const accent = getCss('--accent')
  const ink3 = getCss('--ink3')
  const ink4 = getCss('--ink4')
  const ink = getCss('--ink')
  const W = 480, H = 220
  let inner = ''

  inner += `<g stroke="${ink4}" stroke-width="0.5" opacity="0.18">`
  for (let x = 24; x < W; x += 24) inner += `<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`
  for (let y = 24; y < H; y += 24) inner += `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`
  inner += `</g>`

  inner += `<line x1="${W/2}" y1="0" x2="${W/2}" y2="${H}" stroke="${ink3}" stroke-width="0.5" stroke-dasharray="2 5"/>`
  inner += `<line x1="0" y1="${H/2}" x2="${W}" y2="${H/2}" stroke="${ink3}" stroke-width="0.5" stroke-dasharray="2 5"/>`

  const cx = W / 2, cy = H / 2
  if (d.type === 'organism') {
    inner += `<g transform="translate(${cx},${cy})">`
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      const x = Math.cos(a) * 40, y = Math.sin(a) * 40
      inner += `<ellipse cx="${x}" cy="${y}" rx="42" ry="18" transform="rotate(${a * 180 / Math.PI},${x},${y})" fill="none" stroke="${c}" stroke-width="1" opacity="0.45"/>`
    }
    inner += `<circle r="10" fill="${c}" opacity="0.85"/>`
    inner += `<circle r="22" fill="none" stroke="${c}" stroke-width="0.8" opacity="0.5"/>`
    inner += `</g>`
  } else if (d.type === 'system') {
    const pts = Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2 + 0.2
      const r = 50 + (i % 3) * 16
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
    })
    pts.forEach((p, i) => {
      pts.forEach((q, j) => {
        if (j > i && (i + j) % 2 === 0) inner += `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="${c}" stroke-width="0.5" opacity="0.4"/>`
      })
    })
    pts.forEach(p => {
      inner += `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="${c}" opacity="0.85"/>`
    })
  } else if (d.type === 'phenomenon') {
    inner += `<g transform="translate(${cx},${cy})">`
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2
      const r1 = 18 + (i % 3) * 8
      const r2 = 60 + (i % 4) * 12
      const x1 = Math.cos(a) * r1, y1 = Math.sin(a) * r1
      const x2 = Math.cos(a) * r2, y2 = Math.sin(a) * r2
      inner += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="0.7" opacity="${0.3 + (i % 3) * 0.15}"/>`
    }
    inner += `<circle r="14" fill="${c}" opacity="0.9"/>`
    inner += `<circle r="14" fill="none" stroke="${accent}" stroke-width="0.8" opacity="0.7"/>`
    inner += `</g>`
  } else {
    let path = `M${cx - 180},${cy} `
    for (let x = -180; x <= 180; x += 8) {
      const y = Math.sin(x * 0.05) * 26 + Math.sin(x * 0.13) * 10
      path += `L${cx + x},${cy + y} `
    }
    inner += `<path d="${path}" fill="none" stroke="${c}" stroke-width="1.4" opacity="0.75"/>`
    let path2 = `M${cx - 180},${cy} `
    for (let x = -180; x <= 180; x += 8) {
      const y = Math.sin(x * 0.05 + 1.2) * 18 + Math.sin(x * 0.18 + 0.6) * 6
      path2 += `L${cx + x},${cy + y + 10} `
    }
    inner += `<path d="${path2}" fill="none" stroke="${c}" stroke-width="0.8" opacity="0.45"/>`
    inner += `<circle cx="${cx}" cy="${cy}" r="6" fill="${c}"/>`
  }

  inner += `<text x="20" y="24" font-family="JetBrains Mono" font-size="9" fill="${ink3}" letter-spacing="2">PLATE · ${d.serial}</text>`
  inner += `<text x="${W - 20}" y="24" text-anchor="end" font-family="JetBrains Mono" font-size="9" fill="${ink3}" letter-spacing="2">${(d.region || '').toUpperCase()}</text>`
  inner += `<text x="20" y="${H - 16}" font-family="JetBrains Mono" font-size="9" fill="${ink3}" letter-spacing="2">${d.type.toUpperCase()}</text>`
  inner += `<text x="${W - 20}" y="${H - 16}" text-anchor="end" font-family="Instrument Serif" font-style="italic" font-size="18" fill="${ink}">${d.name}</text>`

  return inner
}

interface Props {
  selectedId: string | null
  onClose: () => void
  onSelectSpecimen: (id: string) => void
}

export default function SpecimenSheet({ selectedId, onClose, onSelectSpecimen }: Props) {
  const d = selectedId ? SPECIMEN_MAP[selectedId] : null
  const isOpen = !!d

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) onClose()
  }, [isOpen, onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <>
      <div className={`sheet-back${isOpen ? ' open' : ''}`} onClick={onClose} />
      <aside className={`sheet${isOpen ? ' open' : ''}`} aria-hidden={!isOpen}>
        {d && (
          <>
            <div className="sheet-head">
              <button className="sheet-close" aria-label="Close" onClick={onClose}>×</button>
              <div className="sh-tag">
                <span className="serial">{d.serial}</span>
                <span className="ty-dot" style={{ background: typeColor(d.type) }} />
                <span>{d.type[0].toUpperCase() + d.type.slice(1)}</span>
              </div>
              <div className="sh-bin"><em>{d.name}</em></div>
              <div className="sh-com">{d.common}</div>
            </div>

            <div className="sheet-plate">
              <div className="sh-stamp">PLATE · IN COLLECTION</div>
              <svg
                viewBox="0 0 480 220"
                preserveAspectRatio="xMidYMid meet"
                dangerouslySetInnerHTML={{ __html: drawPlate(d) }}
              />
            </div>

            <div className="sheet-body">
              <div className="sh-status">
                <span className={`sh-pill ${d.status}`}>
                  <span className="pulse" />
                  {STATUS_LABEL[d.status]}
                </span>
                <span className="sh-pill region">{d.region}</span>
              </div>

              <div className="sh-section">
                <div className="sh-h">Field note</div>
                <div className="sh-desc">{d.desc}</div>
                {d.quote && (
                  <div className="sh-quote">
                    <span>"{d.quote}"</span>
                    <span className="att">— {d.att}</span>
                  </div>
                )}
              </div>

              <div className="sh-section">
                <div className="sh-h">Index</div>
                <div className="sh-grid">
                  <div className="sh-cell"><div className="k">Catalogue</div><div className="v">{d.serial}</div></div>
                  <div className="sh-cell"><div className="k">Kind</div><div className="v" style={{ textTransform: 'capitalize' }}>{d.type}</div></div>
                  <div className="sh-cell"><div className="k">First entry</div><div className="v">{d.first}</div></div>
                  <div className="sh-cell"><div className="k">Length</div><div className="v">{d.words}</div></div>
                  <div className="sh-cell"><div className="k">Connections</div><div className="v">{d.links.length}</div></div>
                  <div className="sh-cell"><div className="k">Region</div><div className="v">{d.region}</div></div>
                </div>
              </div>

              <div className="sh-section">
                <div className="sh-h">Connected · <span style={{ fontWeight: 400 }}>{d.links.length}</span></div>
                <div className="sh-links">
                  {d.links.map(lid => {
                    const ln = SPECIMEN_MAP[lid]
                    if (!ln) return null
                    return (
                      <div key={lid} className="sh-link" onClick={() => onSelectSpecimen(lid)}>
                        <span className="dot" style={{ background: typeColor(ln.type) }} />
                        <div style={{ flex: 1 }}>
                          <div className="lat"><em>{ln.name}</em></div>
                          <div className="com">{ln.common} · {ln.type}</div>
                        </div>
                        <span className="arr">→</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="sh-actions">
                <Link href={`/specimens/${d.id}`} className="btn primary">Enter specimen →</Link>
                <button className="btn">⊕ Save</button>
                <button className="btn">↗ Share</button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
