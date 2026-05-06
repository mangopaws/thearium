import Link from 'next/link'
import { SPECIMENS, SPECIMEN_MAP } from '@/data/specimens'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return SPECIMENS.map(s => ({ id: s.id }))
}

interface Props {
  params: { id: string }
}

export default function SpecimenPage({ params }: Props) {
  const s = SPECIMEN_MAP[params.id]
  if (!s) notFound()

  const typeKey: Record<string, string> = { organism: 'org', system: 'sys', phenomenon: 'phe', process: 'pro' }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--ink)',
      fontFamily: "'Inter Tight', system-ui, sans-serif",
      padding: '80px 32px 60px',
      maxWidth: 720,
      margin: '0 auto',
    }}>
      <div style={{
        fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase',
        color: 'var(--ink3)', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>← The Arium</Link>
        <span>·</span>
        <span style={{ background: `var(--c-${typeKey[s.type]})`, borderRadius: '50%', width: 8, height: 8, display: 'inline-block' }} />
        <span>{s.type}</span>
        <span>·</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.serial}</span>
      </div>

      <div style={{
        fontFamily: "'Instrument Serif', serif",
        fontSize: 'clamp(40px, 6vw, 72px)',
        lineHeight: 0.95,
        letterSpacing: '-0.025em',
        fontStyle: 'italic',
        marginBottom: 8,
      }}>
        {s.name}
      </div>

      <div style={{
        fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase',
        color: 'var(--ink3)', marginBottom: 32,
      }}>
        {s.common}
      </div>

      <div style={{
        fontFamily: "'Fraunces', serif",
        fontWeight: 300,
        fontSize: 20,
        lineHeight: 1.55,
        color: 'var(--ink2)',
        marginBottom: 40,
      }}>
        {s.desc}
      </div>

      <div style={{
        padding: '20px 24px',
        background: 'var(--bg-card)',
        border: '1px solid var(--rule2)',
        borderRadius: 12,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: `var(--c-${typeKey[s.type]})`, flexShrink: 0,
        }} />
        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontSize: 16, color: 'var(--ink2)' }}>
          Full entry coming soon — this specimen is {s.status === 'live' ? 'published' : s.status === 'progress' ? 'in progress' : 'queued'}.
        </div>
      </div>
    </div>
  )
}
