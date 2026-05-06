'use client'

interface Props {
  nowName: string | null
}

export default function Hero({ nowName }: Props) {
  return (
    <div className="hero">
      <div className="eyebrow">
        <span className="live" />
        Currently exploring
      </div>
      <h1>
        A living atlas <em>of</em>{' '}
        <span className="accent">connected things.</span>
      </h1>
      <p className="lede">
        Each specimen is a thread. Pull one and watch the world reorganize itself —
        organisms, systems, phenomena, and the quiet processes that bind them.
      </p>
      <div className={`now${nowName ? ' on' : ''}`}>
        <span className="nowDot" />
        <span>Looking at <em>{nowName || '—'}</em></span>
      </div>
    </div>
  )
}
