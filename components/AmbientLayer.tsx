'use client'

import { useEffect, useRef } from 'react'

interface Mote {
  x: number; y: number; r: number
  vx: number; vy: number; o: number; ph: number
}

export default function AmbientLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const motesRef = useRef<Mote[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = canvas.getContext('2d')!

    function size() {
      canvas!.width = window.innerWidth * devicePixelRatio
      canvas!.height = window.innerHeight * devicePixelRatio
      canvas!.style.width = window.innerWidth + 'px'
      canvas!.style.height = window.innerHeight + 'px'
    }
    size()

    motesRef.current = Array.from({ length: 38 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 0.4 + Math.random() * 1.4,
      vy: 0.05 + Math.random() * 0.18,
      vx: (Math.random() - 0.5) * 0.10,
      o: 0.15 + Math.random() * 0.45,
      ph: Math.random() * Math.PI * 2,
    }))

    function getCss(name: string) {
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    }

    function draw(t: number) {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)
      const dpr = devicePixelRatio
      ctx.fillStyle = getCss('--ink3')

      motesRef.current.forEach(m => {
        m.x += m.vx
        m.y -= m.vy
        if (m.y < -10) m.y = window.innerHeight + 10
        if (m.x < -10) m.x = window.innerWidth + 10
        if (m.x > window.innerWidth + 10) m.x = -10
        const flicker = 0.7 + 0.3 * Math.sin(t * 0.001 + m.ph)
        ctx.globalAlpha = m.o * flicker
        ctx.beginPath()
        ctx.arc(m.x * dpr, m.y * dpr, m.r * dpr, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    window.addEventListener('resize', size)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', size)
    }
  }, [])

  return (
    <>
      <div className="ambient">
        <div className="orb a" />
        <div className="orb b" />
        <div className="orb c" />
      </div>
      <div className="grain" />
      <canvas ref={canvasRef} className="motes" />
    </>
  )
}
