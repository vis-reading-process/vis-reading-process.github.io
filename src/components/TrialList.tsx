import type { Trial } from '../types'
import { CHART_NAME } from '../types'

export interface Filters {
  search: string
  chart: string
  accuracy: 'all' | 'correct' | 'incorrect'
  recon: 'all' | '0' | '1' | '2'
  stage: 'all' | 'A' | 'E' | 'C' | 'K'
  sketchCoded: boolean
}

export const DEFAULT_FILTERS: Filters = {
  search: '',
  chart: 'all',
  accuracy: 'all',
  recon: 'all',
  stage: 'all',
  sketchCoded: false,
}

interface Props {
  trials: Trial[]
  charts: string[]
  filters: Filters
  onFilters: (f: Filters) => void
  selectedId: string | null
  onSelect: (id: string) => void
}

export function TrialList({ trials, charts, filters, onFilters, selectedId, onSelect }: Props) {
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => onFilters({ ...filters, [k]: v })

  return (
    <aside className="sidebar">
      <div className="filters">
        <input
          type="search"
          placeholder="Search transcript, question, ID…"
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
        />
        <div className="filter-grid">
          <label>
            Chart
            <select value={filters.chart} onChange={(e) => set('chart', e.target.value)}>
              <option value="all">All</option>
              {charts.map((c) => (
                <option key={c} value={c}>
                  {CHART_NAME[c] ?? c}
                </option>
              ))}
            </select>
          </label>
          <label>
            Answer
            <select value={filters.accuracy} onChange={(e) => set('accuracy', e.target.value as Filters['accuracy'])}>
              <option value="all">All</option>
              <option value="incorrect">Incorrect</option>
              <option value="correct">Correct</option>
            </select>
          </label>
          <label>
            Reconstructable
            <select value={filters.recon} onChange={(e) => set('recon', e.target.value as Filters['recon'])}>
              <option value="all">All</option>
              <option value="2">2 · replayable</option>
              <option value="1">1 · partial</option>
              <option value="0">0 · none</option>
            </select>
          </label>
          <label>
            Has stage
            <select value={filters.stage} onChange={(e) => set('stage', e.target.value as Filters['stage'])}>
              <option value="all">Any</option>
              <option value="A">Attend / Encode</option>
              <option value="E">Extract</option>
              <option value="C">Compute</option>
              <option value="K">Prior knowledge</option>
            </select>
          </label>
        </div>
        <label className="check">
          <input type="checkbox" checked={filters.sketchCoded} onChange={(e) => set('sketchCoded', e.target.checked)} />
          Only trials coded with sketch (120)
        </label>
        <div className="count">
          {trials.length} trial{trials.length === 1 ? '' : 's'}
          <span className="hint">↑ ↓ to navigate</span>
        </div>
      </div>
      <ul className="trial-list" role="listbox" aria-label="Trials">
        {trials.map((t) => {
          const c = t.codings.text
          return (
            <li
              key={t.id}
              role="option"
              aria-selected={t.id === selectedId}
              className={t.id === selectedId ? 'selected' : ''}
              onClick={() => onSelect(t.id)}
              ref={t.id === selectedId ? (el) => el?.scrollIntoView({ block: 'nearest' }) : undefined}
            >
              <div className="row1">
                <span className={`acc-dot ${t.accuracy === 1 ? 'ok' : t.accuracy === 0 ? 'bad' : 'unk'}`} />
                <span className="qid">{t.qid}</span>
                <span className="stages">
                  {(['A', 'E', 'C', 'K'] as const).map((s) => (
                    <span key={s} className={`stage-pip s-${s} ${c?.steps.some((st) => stageOf(st.type) === s) ? 'on' : ''}`}>
                      {s}
                    </span>
                  ))}
                </span>
                {t.codings.sketch && <span className="tag-mini">sketch</span>}
              </div>
              <div className="row2">{t.explanation}</div>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

function stageOf(type: string) {
  return ({ ATTEND: 'A', ENCODE: 'A', EXTRACT: 'E', COMPUTE: 'C', KNOW: 'K' } as Record<string, string>)[type]
}
