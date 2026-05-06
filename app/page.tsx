'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import AmbientLayer from '@/components/AmbientLayer'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Legend from '@/components/Legend'
import Gallery from '@/components/Gallery'
import CommandPalette from '@/components/CommandPalette'
import SpecimenSheet from '@/components/SpecimenSheet'
import MobileGrid from '@/components/MobileGrid'
import { useTheme } from '@/components/ThemeProvider'

const ForceGraph = dynamic(() => import('@/components/ForceGraph'), { ssr: false })

const ALL_TYPES = new Set(['organism', 'system', 'phenomenon', 'process'])

export default function Home() {
  const { theme } = useTheme()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [nowName, setNowName] = useState<string | null>(null)
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set(ALL_TYPES))
  const recenterRef = useRef<(() => void) | null>(null)

  const handleReady = useCallback((fn: () => void) => { recenterRef.current = fn }, [])
  const openCmd = useCallback(() => setCmdOpen(true), [])
  const closeCmd = useCallback(() => setCmdOpen(false), [])
  const closeSheet = useCallback(() => setSelectedId(null), [])

  const selectSpecimen = useCallback((id: string) => {
    setSelectedId(id)
    setCmdOpen(false)
  }, [])

  const toggleType = useCallback((type: string) => {
    setActiveTypes(cur => {
      const all = Array.from(ALL_TYPES)
      if (cur.size === 1 && cur.has(type)) return new Set(ALL_TYPES)
      if (cur.size === all.length) return new Set([type])
      const next = new Set(cur)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      if (next.size === 0) return new Set(ALL_TYPES)
      return next
    })
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && !cmdOpen) { e.preventDefault(); setCmdOpen(true) }
      if (e.key === 'Escape') {
        if (cmdOpen) setCmdOpen(false)
        else if (selectedId) setSelectedId(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [cmdOpen, selectedId])

  return (
    <>
      <AmbientLayer />

      <ForceGraph
        selectedId={selectedId}
        onSelectSpecimen={selectSpecimen}
        onHoverSpecimen={setNowName}
        activeTypes={activeTypes}
        theme={theme}
        onReady={handleReady}
      />

      <MobileGrid onSelectSpecimen={selectSpecimen} />

      <Header onOpenCmd={openCmd} onRecenter={() => recenterRef.current?.()} />
      <Hero nowName={nowName} />
      <Legend activeTypes={activeTypes} onToggleType={toggleType} />
      <Gallery onSelectSpecimen={selectSpecimen} />

      <CommandPalette
        open={cmdOpen}
        onClose={closeCmd}
        onSelectSpecimen={selectSpecimen}
      />

      <SpecimenSheet
        selectedId={selectedId}
        onClose={closeSheet}
        onSelectSpecimen={selectSpecimen}
      />
    </>
  )
}
