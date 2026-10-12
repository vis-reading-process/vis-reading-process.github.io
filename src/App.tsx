import { useEffect, useMemo, useState } from 'react'
import type { CoderKey, StepType, Trial } from './types'
import { CHART_NAME, CODER_LABEL, STAGE_OF, STEP_TYPES } from './types'
import { DEFAULT_FILTERS, TrialList, type Filters } from './components/TrialList'
import { ChartView } from './components/ChartView'
import { TranscriptPanel } from './components/TranscriptPanel'
import { formatAnswer } from './format'

const CODERS: CoderKey[] = ['text', 'sketch', 'coder2']

export default function App() {
  const [trials, setTrials] = useState<Trial[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [selectedId, setSelectedId] = useState<string | null>(() => decodeURIComponent(location.hash.slice(1)) || null)
  const [coder, setCoder] = useState<CoderKey>('text')
  const [hovered, setHovered] = useState<number | null>(null)
  const [pinned, setPinned] = useState<number | null>(null)
  const [showSketch, setShowSketch] = useState(true)
  const [opacity, setOpacity] = useState(0.85)
  const [visibleTypes, setVisibleTypes] = useState<Set<StepType>>(new Set(STEP_TYPES))

  useEffect(() => {
    fetch('data.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`data.json: ${r.status}`))))
      .then((d: Trial[]) => setTrials(d))
      .catch((e) => setError(String(e)))
  }, [])

  const charts = useMemo(() => [...new Set((trials ?? []).map((t) => t.chart))].sort(), [trials])

  const filtered = useMemo(() => {
    if (!trials) return []
    const q = filters.search.trim().toLowerCase()
    return trials.filter((t) => {
      const c = t.codings.text
      if (filters.chart !== 'all' && t.chart !== filters.chart) return false
      if (filters.accuracy === 'correct' && t.accuracy !== 1) return false
      if (filters.accuracy === 'incorrect' && t.accuracy !== 0) return false
      if (filters.recon !== 'all' && String(c?.reconstructable) !== filters.recon) return false
      if (filters.stage !== 'all' && !c?.steps.some((s) => STAGE_OF[s.type] === filters.stage)) return false
      if (filters.sketchCoded && !t.codings.sketch) return false
      if (q && !`${t.id} ${t.qid} ${t.question} ${t.explanation}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [trials, filters])

  // keep a valid selection
  useEffect(() => {
    if (!filtered.length) return
    if (!selectedId || !filtered.some((t) => t.id === selectedId)) setSelectedId(filtered[0].id)
  }, [filtered, selectedId])

  const trial = filtered.find((t) => t.id === selectedId) ?? null

  // deep-link the selected trial via the URL hash
  useEffect(() => {
    if (selectedId) history.replaceState(null, '', `#${encodeURIComponent(selectedId)}`)
  }, [selectedId])

  // reset per-trial interaction state; fall back to an available coder
  useEffect(() => {
    setHovered(null)
    setPinned(null)
    if (trial && !trial.codings[coder]) setCoder('text')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trial?.id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, select, textarea')) return
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'j' && e.key !== 'k') return
      e.preventDefault()
      const i = filtered.findIndex((t) => t.id === selectedId)
      const next = e.key === 'ArrowDown' || e.key === 'j' ? i + 1 : i - 1
      if (next >= 0 && next < filtered.length) setSelectedId(filtered[next].id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [filtered, selectedId])

  const toggleType = (t: StepType) =>
    setVisibleTypes((prev) => {
      const n = new Set(prev)
      if (n.has(t)) n.delete(t)
      else n.add(t)
      return n
    })

  if (error) return <div className="empty">Failed to load data: {error}. Run <code>python3 scripts/build_data.py</code>.</div>
  if (!trials) return <div className="empty">Loading…</div>

  return (
    <div className="app">
      <header className="topbar">
        <h1>Process-level VLAT explorer</h1>
        <span className="muted">Nobre et al. 2024 explanations, re-coded into step traces</span>
      </header>
      <TrialList
        trials={filtered}
        charts={charts}
        filters={filters}
        onFilters={setFilters}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      {!trial ? (
        <main className="empty">No trials match these filters.</main>
      ) : (
        <>
          <main className="center">
            <section className="card response">
              <div className="resp-head">
                <span className="qid big">{trial.qid}</span>
                <span className="muted">{CHART_NAME[trial.chart] ?? trial.chart}</span>
                <span className="muted mono small">{trial.id.replace(`${trial.qid}_`, '')}</span>
              </div>
              <p className="question">{trial.question}</p>
              <div className="answer-row">
                <div>
                  <div className="label">Participant answer</div>
                  <div className="answer">{formatAnswer(trial.answer)}</div>
                </div>
                <span className={`verdict ${trial.accuracy === 1 ? 'ok' : trial.accuracy === 0 ? 'bad' : 'unk'}`}>
                  {trial.accuracy === 1 ? 'Correct' : trial.accuracy === 0 ? 'Incorrect' : 'Unscored'}
                </span>
                {trial.time !== null && (
                  <div>
                    <div className="label">Time</div>
                    <div>{trial.time.toFixed(1)} s</div>
                  </div>
                )}
              </div>
              <div className="nobre">
                <span className="label">Nobre et al. codes</span>
                {trial.nobreCodes.length ? (
                  trial.nobreCodes.map((c) => (
                    <span key={c} className="pill">
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="muted small">none</span>
                )}
              </div>
            </section>
            <ChartView
              trial={trial}
              showSketch={showSketch}
              onShowSketch={setShowSketch}
              opacity={opacity}
              onOpacity={setOpacity}
            />
          </main>
          <aside className="right">
            <div className="coder-tabs" role="tablist">
              {CODERS.map((k) => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={coder === k}
                  className={coder === k ? 'active' : ''}
                  disabled={!trial.codings[k]}
                  onClick={() => setCoder(k)}
                >
                  {CODER_LABEL[k]}
                </button>
              ))}
            </div>
            <TranscriptPanel
              explanation={trial.explanation}
              coding={trial.codings[coder]}
              hovered={hovered}
              onHover={setHovered}
              pinned={pinned}
              onPin={setPinned}
              visibleTypes={visibleTypes}
              onToggleType={toggleType}
            />
          </aside>
        </>
      )}
    </div>
  )
}
