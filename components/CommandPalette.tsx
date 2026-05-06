'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { SPECIMENS } from '@/data/specimens'
import type { Specimen } from '@/types/specimen'

const TYPE_KEY: Record<string, string> = { organism: 'org', system: 'sys', phenomenon: 'phe', process: 'pro' }

interface Props {
  open: boolean
  onClose: () => void
  onSelectSpecimen: (id: string) => void
}

function getTypeColor(type: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--c-${TYPE_KEY[type]}`).trim()
}

function search(q: string): Specimen[] {
  const ql = q.trim().toLowerCase()
  if (!ql) {
    const nonQueued = SPECIMENS.filter(s => s.status !== 'queued').slice(0, 8)
    if (nonQueued.length < 8) {
      return [...nonQueued, ...SPECIMENS.filter(s => s.status === 'queued').slice(0, 8 - nonQueued.length)]
    }
    return nonQueued
  }
  return SPECIMENS
    .map(s => {
      const hay = `${s.name} ${s.common} ${s.type} ${s.region}`.toLowerCase()
      const score = hay.includes(ql) ? (hay.indexOf(ql) === 0 ? 2 : 1) : 0
      return { s, score }
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(x => x.s)
}

export default function CommandPalette({ open, onClose, onSelectSpecimen }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState<Specimen[]>([])
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    setRows(search(''))
    setIdx(0)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      const r = search('')
      setRows(r)
      setIdx(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  const onInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q)
    const r = search(q)
    setRows(r)
    setIdx(0)
  }, [])

  const navigate = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, rows.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && rows[idx]) { onSelectSpecimen(rows[idx].id); onClose() }
    if (e.key === 'Escape') onClose()
  }, [rows, idx, onSelectSpecimen, onClose])

  const select = useCallback((id: string) => {
    onSelectSpecimen(id)
    onClose()
  }, [onSelectSpecimen, onClose])

  return (
    <div className={`cmd-back${open ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="cmd-box">
        <div className="cmd-input">
          <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="8" cy="8" r="5.5"/>
            <line x1="16" y1="16" x2="12.2" y2="12.2"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by name, kind, or kinship…"
            autoComplete="off"
            value={query}
            onChange={onInput}
            onKeyDown={navigate}
          />
        </div>
        <div className="cmd-list">
          {rows.map((s, i) => (
            <div
              key={s.id}
              className={`cmd-row${i === idx ? ' sel' : ''}`}
              onMouseEnter={() => setIdx(i)}
              onClick={() => select(s.id)}
            >
              <span className="dot" style={{ background: open ? getTypeColor(s.type) : undefined }} />
              <div>
                <div className="lat"><em>{s.name}</em></div>
                <div className="com">{s.common}</div>
              </div>
              <div className="ty">{s.type}</div>
            </div>
          ))}
        </div>
        <div className="cmd-foot">
          <span><b>↑</b><b>↓</b> navigate</span>
          <span><b>↵</b> open</span>
          <span><b>esc</b> close</span>
        </div>
      </div>
    </div>
  )
}
