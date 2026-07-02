import Link from 'next/link'
import { SPECIMENS, SPECIMEN_MAP } from '@/data/specimens'
import { getEntry, isPublished } from '@/data/entries'
import { connectedThreads, neighbours } from '@/lib/threads'
import EntryBody from '@/components/EntryBody'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return SPECIMENS.map(s => ({ id: s.id }))
}

interface Props {
  params: { id: string }
}

const TYPE_KEY: Record<string, string> = { organism: 'org', system: 'sys', phenomenon: 'phe', process: 'pro' }

export default function SpecimenPage({ params }: Props) {
  const s = SPECIMEN_MAP[params.id]
  if (!s) notFound()

  const entry = getEntry(s.id)
  const threads = connectedThreads(s.id)
  const { prev, next } = neighbours(s.id)
  const typeKey = TYPE_KEY[s.type]
  const statusLabel = isPublished(s.id)
    ? 'Published'
    : s.status === 'progress' ? 'In progress' : 'In preparation'

  return (
    <div style={{ height: '100vh', overflowY: 'auto', background: 'var(--bg)', color: 'var(--ink)' }}>
      <article style={{
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        padding: '72px 32px 96px',
        maxWidth: 720,
        margin: '0 auto',
      }}>
        {/* ── breadcrumb / meta line ── */}
        <div style={{
          fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase',
          color: 'var(--ink3)', marginBottom: 28,
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>← The Arium</Link>
          <span>·</span>
          <span style={{ background: `var(--c-${typeKey})`, borderRadius: '50%', width: 8, height: 8, display: 'inline-block' }} />
          <span>{s.type}</span>
          <span>·</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.serial}</span>
        </div>

        {/* ── title block ── */}
        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 'clamp(44px, 7vw, 78px)', lineHeight: 0.95,
          letterSpacing: '-0.025em', fontStyle: 'italic', fontWeight: 400,
          marginBottom: 10,
        }}>{s.name}</h1>
        <div style={{
          fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase',
          color: 'var(--ink3)', marginBottom: 36,
        }}>{s.common}</div>

        {/* ── standfirst or index desc ── */}
        <p style={{
          fontFamily: "'Fraunces', serif", fontWeight: 300,
          fontSize: 21, lineHeight: 1.6, color: 'var(--ink)',
          marginBottom: 40, paddingBottom: 40, borderBottom: '1px solid var(--rule)',
        }}>{entry ? entry.standfirst : s.desc}</p>

        {/* ── body ── */}
        {entry ? (
          <>
            <EntryBody blocks={entry.body} />
            {entry.colophon && (
              <div style={{
                marginTop: 56, paddingTop: 20, borderTop: '1px solid var(--rule)',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink3)',
                lineHeight: 1.8,
              }}>{entry.colophon}</div>
            )}
          </>
        ) : (
          <div style={{
            padding: '22px 24px', background: 'var(--bg-card)',
            border: '1px solid var(--rule2)', borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: `var(--c-${typeKey})`, flexShrink: 0 }} />
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontSize: 16, color: 'var(--ink2)' }}>
              This specimen is catalogued but its full entry is {statusLabel.toLowerCase()}. Follow a connected thread below, or return to the atlas.
            </div>
          </div>
        )}

        {/* ── specimen data strip ── */}
        <dl style={{
          marginTop: 56, display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 20,
          paddingTop: 24, borderTop: '1px solid var(--rule)',
        }}>
          {[
            ['Status', statusLabel],
            ['Region', s.region],
            ['First catalogued', s.first],
            ['Extent', s.words],
          ].map(([k, v]) => (
            <div key={k}>
              <dt style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
                letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink4)', marginBottom: 6,
              }}>{k}</dt>
              <dd style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontSize: 16, color: 'var(--ink2)' }}>{v}</dd>
            </div>
          ))}
        </dl>

        {/* ── connected threads ── */}
        {threads.length > 0 && (
          <section style={{ marginTop: 56 }}>
            <h2 style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 400,
              letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--ink3)',
              marginBottom: 18,
            }}>Connected threads · {threads.length}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {threads.map(t => {
                const tk = TYPE_KEY[t.type]
                return (
                  <Link key={t.id} href={`/specimens/${t.id}`} style={{
                    display: 'block', padding: '16px 18px', background: 'var(--bg-card)',
                    border: '1px solid var(--rule)', borderRadius: 12, textDecoration: 'none',
                    color: 'inherit',
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
                      letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink4)',
                    }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: `var(--c-${tk})` }} />
                      {t.serial}
                    </div>
                    <div style={{
                      fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                      fontSize: 20, lineHeight: 1.05, marginBottom: 2,
                    }}>{t.name}</div>
                    <div style={{
                      fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink3)',
                    }}>{t.common}</div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* ── prev / next ── */}
        <nav style={{
          marginTop: 56, paddingTop: 24, borderTop: '1px solid var(--rule)',
          display: 'flex', justifyContent: 'space-between', gap: 16,
        }}>
          {prev ? (
            <Link href={`/specimens/${prev.id}`} style={navStyle}>
              <span style={navLabel}>← Previous</span>
              <span style={navName}>{prev.name}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/specimens/${next.id}`} style={{ ...navStyle, textAlign: 'right', alignItems: 'flex-end' }}>
              <span style={navLabel}>Next →</span>
              <span style={navName}>{next.name}</span>
            </Link>
          ) : <span />}
        </nav>
      </article>
    </div>
  )
}

const navStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 6, textDecoration: 'none', color: 'inherit', maxWidth: '48%',
}
const navLabel: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
  letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink4)',
}
const navName: React.CSSProperties = {
  fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 19, lineHeight: 1.05,
}
