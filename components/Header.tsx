'use client'

import { useTheme } from './ThemeProvider'

interface Props {
  onOpenCmd: () => void
  onRecenter: () => void
}

export default function Header({ onOpenCmd, onRecenter }: Props) {
  const { label, glyph, cycleTheme } = useTheme()

  return (
    <header className="top">
      <div className="brand">
        <span className="mark" />
        <span className="word">The <em>Arium</em></span>
        <span className="vol">Vol. III · Living Encyclopedia</span>
      </div>
      <div className="top-r">
        <button className="btn" onClick={onOpenCmd}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="6" cy="6" r="4.5"/>
            <line x1="12.5" y1="12.5" x2="9.5" y2="9.5"/>
          </svg>
          Search the index
          <span className="kbd">/</span>
        </button>
        <button className="btn" onClick={cycleTheme}>
          <span>{glyph}</span>
          <span>{label}</span>
        </button>
        <button className="btn primary" onClick={onRecenter}>↻ Recenter</button>
      </div>
    </header>
  )
}
