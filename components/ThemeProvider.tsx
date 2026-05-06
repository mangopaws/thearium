'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const THEMES = ['twilight', 'night', 'mist'] as const
type Theme = typeof THEMES[number]

const THEME_LABELS: Record<Theme, string> = { twilight: 'Twilight', night: 'Night', mist: 'Mist' }
const THEME_GLYPHS: Record<Theme, string> = { twilight: '◐', night: '●', mist: '○' }

interface ThemeCtx {
  theme: Theme
  label: string
  glyph: string
  cycleTheme: () => void
}

const ThemeContext = createContext<ThemeCtx>({
  theme: 'twilight',
  label: 'Twilight',
  glyph: '◐',
  cycleTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('twilight')

  useEffect(() => {
    const saved = localStorage.getItem('arium-theme') as Theme | null
    if (saved && THEMES.includes(saved)) {
      setTheme(saved)
      document.documentElement.dataset.theme = saved
    }
  }, [])

  const cycleTheme = useCallback(() => {
    setTheme(cur => {
      const next = THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length]
      document.documentElement.dataset.theme = next
      localStorage.setItem('arium-theme', next)
      return next
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, label: THEME_LABELS[theme], glyph: THEME_GLYPHS[theme], cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
