import type { Step } from './types'

export interface Segment {
  text: string
  /** indices into the steps array whose evidence covers this segment */
  steps: number[]
}

export function isSketchEvidence(q: string | null): boolean {
  return !!q && q.trim().toUpperCase().startsWith('SKETCH')
}

/** Find [start, end) of quote in text: exact, then case-insensitive, then whitespace-insensitive. */
function locate(text: string, quote: string, from: number): [number, number] | null {
  let i = text.indexOf(quote, from)
  if (i < 0) i = text.indexOf(quote)
  if (i >= 0) return [i, i + quote.length]

  const lt = text.toLowerCase()
  const lq = quote.toLowerCase()
  i = lt.indexOf(lq)
  if (i >= 0) return [i, i + quote.length]

  // whitespace-insensitive: build a regex with \s+ between tokens
  const tokens = quote.trim().split(/\s+/).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  if (!tokens.length) return null
  const m = new RegExp(tokens.join('\\s+'), 'i').exec(text)
  return m ? [m.index, m.index + m[0].length] : null
}

export interface Located {
  segments: Segment[]
  /** steps whose text quote could not be found in the transcript */
  unmatched: number[]
}

export function segmentTranscript(text: string, steps: Step[]): Located {
  const ranges: { start: number; end: number; step: number }[] = []
  const unmatched: number[] = []
  let cursor = 0
  steps.forEach((s, idx) => {
    const q = s.evidence_quote
    if (!q || isSketchEvidence(q)) return
    const r = locate(text, q, cursor)
    if (!r) {
      unmatched.push(idx)
      return
    }
    ranges.push({ start: r[0], end: r[1], step: idx })
    cursor = r[0]
  })

  const cuts = new Set<number>([0, text.length])
  ranges.forEach((r) => {
    cuts.add(r.start)
    cuts.add(r.end)
  })
  const points = [...cuts].sort((a, b) => a - b)
  const segments: Segment[] = []
  for (let k = 0; k < points.length - 1; k++) {
    const [a, b] = [points[k], points[k + 1]]
    if (a === b) continue
    segments.push({
      text: text.slice(a, b),
      steps: ranges.filter((r) => r.start <= a && r.end >= b).map((r) => r.step),
    })
  }
  return { segments, unmatched }
}
