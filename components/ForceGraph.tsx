'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { SPECIMENS, SPECIMEN_MAP } from '@/data/specimens'
import type { Specimen } from '@/types/specimen'

const TYPE_KEY: Record<string, string> = { organism: 'org', system: 'sys', phenomenon: 'phe', process: 'pro' }
const STATUS_LABEL: Record<string, string> = { live: 'Published', progress: 'In progress', queued: 'Queued' }

// D3 sim nodes must extend SimulationNodeDatum
type SimNode = Specimen & d3.SimulationNodeDatum

interface GraphLink extends d3.SimulationLinkDatum<SimNode> {
  source: string | SimNode
  target: string | SimNode
  sourceType: string
  isLive: boolean
}

function getCss(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
function typeColor(type: string) {
  return getCss(`--c-${TYPE_KEY[type]}`)
}
function nodeR(d: SimNode) {
  if (d.status === 'live') return 12
  if (d.status === 'progress') return 9
  return 6
}
function sourceId(l: GraphLink) {
  return typeof l.source === 'object' ? (l.source as SimNode).id : l.source as string
}
function targetId(l: GraphLink) {
  return typeof l.target === 'object' ? (l.target as SimNode).id : l.target as string
}

function buildLinks(nodes: SimNode[]): GraphLink[] {
  const nodeById = new Map(nodes.map(n => [n.id, n]))
  const linkSet = new Set<string>()
  const links: GraphLink[] = []
  SPECIMENS.forEach(s => {
    (s.links || []).forEach(tid => {
      if (!nodeById.has(tid)) return
      const key = [s.id, tid].sort().join('|')
      if (!linkSet.has(key)) {
        linkSet.add(key)
        links.push({
          source: s.id, target: tid,
          sourceType: s.type,
          isLive: s.status === 'live' || SPECIMEN_MAP[tid].status === 'live',
        })
      }
    })
  })
  return links
}

interface Props {
  selectedId: string | null
  onSelectSpecimen: (id: string) => void
  onHoverSpecimen: (common: string | null) => void
  activeTypes: Set<string>
  theme: string
  onReady?: (recenter: () => void) => void
}

export default function ForceGraph({ selectedId, onSelectSpecimen, onHoverSpecimen, activeTypes, theme, onReady }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const hoverElRef = useRef<HTMLDivElement>(null)
  const selectedIdRef = useRef<string | null>(null)

  // Mutable D3 state stored in refs (not React state)
  const nodeGroupsRef = useRef<d3.Selection<SVGGElement, SimNode, SVGGElement, unknown> | null>(null)
  const linkBaseRef = useRef<d3.Selection<SVGPathElement, GraphLink, SVGGElement, unknown> | null>(null)
  const linkHiRef = useRef<d3.Selection<SVGPathElement, GraphLink, SVGGElement, unknown> | null>(null)
  const labelElsRef = useRef<d3.Selection<SVGGElement, SimNode, SVGGElement, unknown> | null>(null)
  const queuedLabelsRef = useRef<d3.Selection<SVGGElement, SimNode, SVGGElement, unknown> | null>(null)
  const curElsRef = useRef<d3.Selection<SVGCircleElement, GraphLink, SVGGElement, unknown> | null>(null)
  const simRef = useRef<d3.Simulation<SimNode, GraphLink> | null>(null)
  const nodesRef = useRef<SimNode[]>([])

  // ── Initialize D3 once
  useEffect(() => {
    if (window.innerWidth < 768) return
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const gPar = svg.select<SVGGElement>('#parallax')
    const gLinkB = svg.select<SVGGElement>('#links-base')
    const gLinkH = svg.select<SVGGElement>('#links-hi')
    const gCurr = svg.select<SVGGElement>('#currents')
    const gNode = svg.select<SVGGElement>('#nodes')
    const gLab = svg.select<SVGGElement>('#labels')

    let W = window.innerWidth
    let H = window.innerHeight

    const nodes: SimNode[] = SPECIMENS.map(s => ({ ...s }))
    const links = buildLinks(nodes)
    nodesRef.current = nodes

    // Build a quick lookup for sim nodes
    const nodeById = new Map(nodes.map(n => [n.id, n]))

    // ── Simulation
    const sim = d3.forceSimulation<SimNode, GraphLink>(nodes)
      .force('link', d3.forceLink<SimNode, GraphLink>(links).id(d => d.id)
        .distance(d => d.isLive ? 150 : 105)
        .strength(0.32))
      .force('charge', d3.forceManyBody<SimNode>()
        .strength(d => d.status === 'live' ? -400 : d.status === 'progress' ? -260 : -170)
        .distanceMax(450))
      .force('center', d3.forceCenter(W / 2, H / 2 - 40).strength(0.05))
      .force('coll', d3.forceCollide<SimNode>(d => nodeR(d) + 26))
      .force('bounds', () => {
        const b = { x0: 60, x1: W - 60, y0: 220, y1: H - 180 }
        nodes.forEach(d => {
          if (d.x != null) d.x = Math.max(b.x0, Math.min(b.x1, d.x))
          if (d.y != null) d.y = Math.max(b.y0, Math.min(b.y1, d.y))
        })
      })
      .alphaDecay(0.020)
      .velocityDecay(0.46)
    simRef.current = sim

    // ── Links
    const linkBaseEls = gLinkB.selectAll<SVGPathElement, GraphLink>('path')
      .data(links).enter().append('path').attr('class', 'link link-base')
    linkBaseRef.current = linkBaseEls

    const linkHiEls = gLinkH.selectAll<SVGPathElement, GraphLink>('path')
      .data(links.filter(l => l.isLive)).enter().append('path')
      .attr('class', 'link link-hi')
      .style('stroke', d => typeColor(SPECIMEN_MAP[sourceId(d)].type))
      .style('opacity', 0.35)
    linkHiRef.current = linkHiEls

    // ── Nodes
    const nodeGroups = gNode.selectAll<SVGGElement, SimNode>('g')
      .data(nodes).enter().append('g')
      .attr('class', d => `nodeG ${d.status}`)
      .style('color', d => typeColor(d.type))
      .call(d3.drag<SVGGElement, SimNode>()
        .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.1).restart(); d.fx = d.x; d.fy = d.y })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y })
        .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null })
      )
    nodeGroupsRef.current = nodeGroups

    nodeGroups.append('circle').attr('class', 'halo').attr('r', d => nodeR(d) + 18)

    nodeGroups.filter(d => d.status === 'live').append('circle').attr('class', 'ring')
      .attr('r', d => nodeR(d) + 4).style('stroke-width', 0.8).style('opacity', 0.55)
    nodeGroups.filter(d => d.status === 'progress').append('circle').attr('class', 'ring')
      .attr('r', d => nodeR(d) + 3).style('stroke-width', 0.6).style('stroke-dasharray', '2 3').style('opacity', 0.6)
    nodeGroups.filter(d => d.status === 'queued').append('circle').attr('class', 'ring')
      .attr('r', d => nodeR(d) + 2).style('stroke-width', 0.5).style('opacity', 0.30)

    nodeGroups.append('circle').attr('class', 'core').attr('r', d => nodeR(d))
      .style('fill', d => d.status === 'queued' ? getCss('--bg') : typeColor(d.type))
      .style('stroke', d => typeColor(d.type))
      .style('stroke-width', d => d.status === 'queued' ? 1.2 : 0)
      .style('fill-opacity', d => d.status === 'queued' ? 1 : d.status === 'progress' ? 0.55 : 0.95)

    nodeGroups.filter(d => d.status === 'live').append('circle').attr('class', 'mark')
      .attr('r', 2.2).style('fill', getCss('--bg-card')).style('pointer-events', 'none')

    // ── Labels
    const labelEls = gLab.selectAll<SVGGElement, SimNode>('g.label-l')
      .data(nodes.filter(d => d.status !== 'queued')).enter()
      .append('g').attr('class', 'label-l')
      .style('opacity', d => d.status === 'live' ? 1 : 0.85)
    labelElsRef.current = labelEls
    labelEls.append('text').attr('class', 'node-label').attr('text-anchor', 'middle')
      .attr('dy', d => nodeR(d) + 22).text(d => d.common)
    labelEls.append('text').attr('class', 'node-sub').attr('text-anchor', 'middle')
      .attr('dy', d => nodeR(d) + 38).text(d => d.region)

    const queuedLabels = gLab.selectAll<SVGGElement, SimNode>('g.label-q')
      .data(nodes.filter(d => d.status === 'queued')).enter()
      .append('g').attr('class', 'label-q').style('opacity', 0)
    queuedLabelsRef.current = queuedLabels
    queuedLabels.append('text').attr('class', 'node-label').attr('text-anchor', 'middle')
      .attr('dy', d => nodeR(d) + 20).text(d => d.common)

    // ── Currents
    const curEls = gCurr.selectAll<SVGCircleElement, GraphLink>('circle')
      .data(links.filter(l => l.isLive)).enter()
      .append('circle').attr('class', 'current').attr('r', 1.8)
      .style('fill', d => typeColor(SPECIMEN_MAP[sourceId(d)].type))
    curElsRef.current = curEls

    // ── Arc path
    function arcD(d: GraphLink) {
      const s = d.source as SimNode, t = d.target as SimNode
      const dx = (t.x ?? 0) - (s.x ?? 0), dy = (t.y ?? 0) - (s.y ?? 0)
      const dr = Math.sqrt(dx * dx + dy * dy) * 1.6
      return `M${s.x ?? 0},${s.y ?? 0}A${dr},${dr} 0 0,1 ${t.x ?? 0},${t.y ?? 0}`
    }

    // ── Tick
    sim.on('tick', () => {
      linkBaseEls.attr('d', arcD)
      linkHiEls.attr('d', arcD)
      nodeGroups.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`)
      labelEls.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`)
      queuedLabels.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`)
    })

    // ── Currents animation
    let tt = 0
    let rafCurr = 0
    function animateCurrents() {
      tt = (tt + 0.0035) % 1
      curEls.each(function(d, i) {
        const s = d.source as SimNode, t = d.target as SimNode
        const sx = s.x ?? 0, sy = s.y ?? 0, tx = t.x ?? 0, ty = t.y ?? 0
        const phase = (tt + i * 0.13) % 1
        const x = sx + (tx - sx) * phase
        const y = sy + (ty - sy) * phase
        const nx = -(ty - sy), ny = (tx - sx)
        const len = Math.sqrt(nx * nx + ny * ny) || 1
        const arcAmp = -Math.sqrt((tx - sx) ** 2 + (ty - sy) ** 2) * 0.18 * Math.sin(Math.PI * phase)
        this.setAttribute('cx', String(x + (nx / len) * arcAmp))
        this.setAttribute('cy', String(y + (ny / len) * arcAmp))
      })
      rafCurr = requestAnimationFrame(animateCurrents)
    }
    rafCurr = requestAnimationFrame(animateCurrents)

    // ── Parallax
    let pxX = 0, pyY = 0
    function onMouseMove(e: MouseEvent) {
      const dx = e.clientX / W - 0.5, dy = e.clientY / H - 0.5
      pxX += (dx * 8 - pxX) * 0.06
      pyY += (dy * 8 - pyY) * 0.06
      gPar.attr('transform', `translate(${(-pxX).toFixed(2)},${(-pyY).toFixed(2)})`)
    }
    window.addEventListener('mousemove', onMouseMove)

    // ── Highlight helpers
    function highlight(d: SimNode) {
      const ids = new Set([d.id, ...(d.links || [])])
      nodeGroups.classed('dim', n => !ids.has(n.id))
      linkBaseEls
        .classed('dim', l => sourceId(l) !== d.id && targetId(l) !== d.id)
        .classed('lit', l => sourceId(l) === d.id || targetId(l) === d.id)
      labelEls.style('opacity', n => ids.has(n.id) ? 1 : 0.18)
      queuedLabels.style('opacity', n => ids.has(n.id) ? 1 : 0)
    }
    function clearHighlight() {
      nodeGroups.classed('dim', false)
      linkBaseEls.classed('dim', false).classed('lit', false)
      labelEls.style('opacity', d => d.status === 'live' ? 1 : 0.85)
      queuedLabels.style('opacity', 0)
    }

    // ── Node events
    const hover = hoverElRef.current
    nodeGroups
      .on('mouseenter', (_e, d) => {
        if (hover) {
          const bin = hover.querySelector('#hv-bin')
          const com = hover.querySelector('#hv-com')
          const ty = hover.querySelector('#hv-ty')
          const st = hover.querySelector('#hv-stat')
          if (bin) bin.textContent = d.name
          if (com) com.textContent = d.common
          if (ty) ty.textContent = d.type
          if (st) { st.textContent = STATUS_LABEL[d.status]; st.className = 'stat-' + d.status }
          hover.classList.add('on')
        }
        highlight(d)
        onHoverSpecimen(d.common)
      })
      .on('mousemove', function(e: MouseEvent) {
        if (!hover) return
        let x = e.clientX + 18, y = e.clientY + 18
        if (x + 320 > W) x = e.clientX - 320
        if (y + 140 > H) y = e.clientY - 140
        hover.style.left = x + 'px'
        hover.style.top = y + 'px'
      })
      .on('mouseleave', () => {
        if (hover) hover.classList.remove('on')
        onHoverSpecimen(null)
        const sel = selectedIdRef.current
        if (!sel) clearHighlight()
        else { const sd = nodeById.get(sel); if (sd) highlight(sd) }
      })
      .on('click', (_e, d) => { onSelectSpecimen(d.id); sim.alpha(0.18).restart() })

    // ── Resize
    function onResize() {
      W = window.innerWidth; H = window.innerHeight
      sim.force('center', d3.forceCenter(W / 2, H / 2 - 40).strength(0.05))
      sim.alpha(0.25).restart()
    }
    window.addEventListener('resize', onResize)

    setTimeout(() => sim.alpha(0.5).restart(), 100)

    if (onReady) {
      onReady(() => {
        nodes.forEach(d => { d.fx = null; d.fy = null })
        sim.alpha(0.6).restart()
      })
    }

    return () => {
      sim.stop()
      cancelAnimationFrame(rafCurr)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Sync selectedId → highlight
  useEffect(() => {
    selectedIdRef.current = selectedId
    const nodeGroups = nodeGroupsRef.current
    const linkBaseEls = linkBaseRef.current
    const labelEls = labelElsRef.current
    const queuedLabels = queuedLabelsRef.current
    if (!nodeGroups) return

    if (!selectedId) {
      nodeGroups.classed('dim', false)
      linkBaseEls?.classed('dim', false).classed('lit', false)
      labelEls?.style('opacity', d => d.status === 'live' ? 1 : 0.85)
      queuedLabels?.style('opacity', 0)
      return
    }
    const d = nodesRef.current.find(n => n.id === selectedId)
    if (!d) return
    const ids = new Set([d.id, ...(d.links || [])])
    nodeGroups.classed('dim', n => !ids.has(n.id))
    linkBaseEls
      ?.classed('dim', l => sourceId(l) !== d.id && targetId(l) !== d.id)
      .classed('lit', l => sourceId(l) === d.id || targetId(l) === d.id)
    labelEls?.style('opacity', n => ids.has(n.id) ? 1 : 0.18)
    queuedLabels?.style('opacity', n => ids.has(n.id) ? 1 : 0)
  }, [selectedId])

  // ── Sync activeTypes → opacity
  useEffect(() => {
    const nodeGroups = nodeGroupsRef.current
    const linkBaseEls = linkBaseRef.current
    if (!nodeGroups) return
    nodeGroups.style('opacity', d => activeTypes.has(d.type) ? 1 : 0.10)
    linkBaseEls?.style('opacity', l => {
      const sn = SPECIMEN_MAP[sourceId(l)], tn = SPECIMEN_MAP[targetId(l)]
      return (activeTypes.has(sn?.type) && activeTypes.has(tn?.type)) ? 0.10 : 0.03
    })
  }, [activeTypes])

  // ── Sync theme → re-read CSS vars for inline D3 styles
  useEffect(() => {
    const nodeGroups = nodeGroupsRef.current
    const linkHiEls = linkHiRef.current
    const curEls = curElsRef.current
    if (!nodeGroups) return
    setTimeout(() => {
      nodeGroups.style('color', d => typeColor(d.type))
      nodeGroups.select<SVGCircleElement>('.core')
        .style('fill', d => d.status === 'queued' ? getCss('--bg') : typeColor(d.type))
        .style('stroke', d => typeColor(d.type))
      nodeGroups.select<SVGCircleElement>('.mark').style('fill', getCss('--bg-card'))
      linkHiEls?.style('stroke', d => typeColor(SPECIMEN_MAP[sourceId(d)].type))
      curEls?.style('fill', d => typeColor(SPECIMEN_MAP[sourceId(d)].type))
    }, 80)
  }, [theme])

  return (
    <>
      <div id="viz">
        <svg ref={svgRef} preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="vignette-grad" cx="0.5" cy="0.5" r="0.7">
              <stop offset="65%" stopColor="transparent" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.10)" />
            </radialGradient>
          </defs>
          <g id="parallax">
            <g id="links-base"></g>
            <g id="links-hi"></g>
            <g id="currents"></g>
            <g id="nodes"></g>
            <g id="labels"></g>
          </g>
          <rect width="100%" height="100%" fill="url(#vignette-grad)" pointerEvents="none" />
        </svg>
      </div>

      <div id="hover" ref={hoverElRef}>
        <div className="hv-box">
          <div className="hv-bin" id="hv-bin"></div>
          <div className="hv-com" id="hv-com"></div>
          <div className="hv-meta">
            <span id="hv-ty"></span>
            <span id="hv-stat"></span>
          </div>
        </div>
      </div>
    </>
  )
}
