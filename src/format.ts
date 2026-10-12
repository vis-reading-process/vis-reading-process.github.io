export function formatArgs(args: Record<string, unknown> | null): string {
  if (!args) return ''
  return Object.entries(args)
    .filter(([, v]) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && !v.length))
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
    .join(' · ')
}

export function formatAnswer(answer: Record<string, string>): string {
  const vals = Object.entries(answer)
  if (!vals.length) return '—'
  if (vals.length === 1) return String(vals[0][1])
  return vals.map(([k, v]) => `${k.replace(/^.*?_/, '#')}: ${v}`).join('   ')
}
