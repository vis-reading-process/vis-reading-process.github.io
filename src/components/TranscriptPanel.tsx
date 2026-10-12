import { useMemo } from 'react'
import type { Coding, StepType } from '../types'
import { STEP_TYPES } from '../types'
import { isSketchEvidence, segmentTranscript } from '../highlight'
import { formatArgs } from '../format'

interface Props {
  explanation: string
  coding: Coding | undefined
  hovered: number | null
  onHover: (i: number | null) => void
  pinned: number | null
  onPin: (i: number | null) => void
  visibleTypes: Set<StepType>
  onToggleType: (t: StepType) => void
}

export function TranscriptPanel({ explanation, coding, hovered, onHover, pinned, onPin, visibleTypes, onToggleType }: Props) {
  const steps = coding?.steps ?? []
  const { segments, unmatched } = useMemo(() => segmentTranscript(explanation, steps), [explanation, steps])
  const active = hovered ?? pinned
  const presentTypes = new Set(steps.map((s) => s.type))

  return (
    <>
      <section className="card">
        <header className="card-head">
          <h2>Transcript</h2>
          <div className="legend">
            {STEP_TYPES.filter((t) => presentTypes.has(t)).map((t) => (
              <button
                key={t}
                className={`legend-chip t-${t} ${visibleTypes.has(t) ? '' : 'off'}`}
                onClick={() => onToggleType(t)}
                title={visibleTypes.has(t) ? `Hide ${t} highlights` : `Show ${t} highlights`}
              >
                {t.toLowerCase()}
              </button>
            ))}
          </div>
        </header>
        <p className="transcript">
          {segments.map((seg, k) => {
            const shown = seg.steps.filter((i) => visibleTypes.has(steps[i].type))
            if (!shown.length) return <span key={k}>{seg.text}</span>
            const primary = shown[shown.length - 1]
            const s = steps[primary]
            const isActive = active !== null && shown.includes(active)
            const dim = active !== null && !isActive
            return (
              <mark
                key={k}
                className={`hl t-${s.type} ${s.error ? 'has-error' : ''} ${isActive ? 'active' : ''} ${dim ? 'dim' : ''} ${shown.length > 1 ? 'overlap' : ''}`}
                onMouseEnter={() => onHover(primary)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onPin(pinned === primary ? null : primary)}
                title={shown.map((i) => `${i + 1}. ${steps[i].type}${steps[i].error ? ` [${steps[i].error}]` : ''}`).join('\n')}
              >
                {seg.text}
              </mark>
            )
          })}
        </p>
        {unmatched.length > 0 && (
          <p className="muted small">
            {unmatched.length} step quote{unmatched.length > 1 ? 's' : ''} not found verbatim in transcript (marked ⚠ below).
          </p>
        )}
      </section>

      <section className="card">
        <header className="card-head">
          <h2>Step trace</h2>
          {coding && (
            <div className="trace-meta">
              <span className={`recon r${coding.reconstructable}`}>
                reconstructable {coding.reconstructable}
              </span>
              {coding.order_evidenced && <span className="pill">order evidenced</span>}
              {coding.error_localizable && <span className="pill err">error localizable</span>}
            </div>
          )}
        </header>
        {!coding ? (
          <p className="muted">Not coded by this coder.</p>
        ) : steps.length === 0 ? (
          <p className="muted">No process steps coded.</p>
        ) : (
          <ol className="steps">
            {steps.map((s, i) => {
              const sketchOnly = isSketchEvidence(s.evidence_quote)
              const isActive = active === i
              return (
                <li
                  key={i}
                  className={`step t-${s.type} ${isActive ? 'active' : ''} ${pinned === i ? 'pinned' : ''} ${
                    coding.first_error_step === i ? 'first-error' : ''
                  }`}
                  onMouseEnter={() => onHover(i)}
                  onMouseLeave={() => onHover(null)}
                  onClick={() => onPin(pinned === i ? null : i)}
                >
                  <div className="step-head">
                    <span className="step-n">{i + 1}</span>
                    <span className={`type-badge t-${s.type}`}>{s.type}</span>
                    {s.error && <span className="err-badge">{s.error}</span>}
                    {sketchOnly && <span className="tag-mini">from sketch</span>}
                    {unmatched.includes(i) && <span className="warn" title="Quote not found verbatim">⚠</span>}
                  </div>
                  {formatArgs(s.args) && <div className="step-args">{formatArgs(s.args)}</div>}
                  {s.evidence_quote && <div className="step-quote">“{s.evidence_quote.replace(/^SKETCH:\s*/i, '')}”</div>}
                </li>
              )
            })}
          </ol>
        )}
        {coding?.sketch_adds && coding.sketch_adds.length > 0 && (
          <div className="sketch-adds">
            <span className="muted small">Sketch adds:</span>
            {coding.sketch_adds.map((a) => (
              <span key={a} className="pill">
                {a.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
        {coding?.notes && <p className="notes">{coding.notes}</p>}
      </section>
    </>
  )
}
