export type StepType =
  | 'PLAN'
  | 'ATTEND'
  | 'ENCODE'
  | 'EXTRACT'
  | 'COMPUTE'
  | 'KNOW'
  | 'MONITOR'
  | 'ANSWER'

export interface Step {
  i: number
  type: StepType
  args: Record<string, unknown> | null
  error: string | null
  evidence_quote: string | null
}

export interface Coding {
  trial_id: string
  steps: Step[]
  n_steps: number
  stages_present: string[]
  order_evidenced: boolean
  reconstructable: 0 | 1 | 2
  first_error_step: number | null
  error_localizable: boolean | null
  sketch_adds?: string[]
  notes?: string
}

export type CoderKey = 'text' | 'sketch' | 'coder2'

export interface Trial {
  id: string
  qid: string
  chart: string
  pid: string
  question: string
  answer: Record<string, string>
  accuracy: 0 | 1 | null
  time: number | null
  explanation: string
  nobreCodes: string[]
  chartImg: string
  sketchImg: string | null
  codings: Partial<Record<CoderKey, Coding>>
}

export const STEP_TYPES: StepType[] = ['PLAN', 'ATTEND', 'ENCODE', 'EXTRACT', 'COMPUTE', 'KNOW', 'MONITOR', 'ANSWER']

export const STAGE_OF: Partial<Record<StepType, 'A' | 'E' | 'C' | 'K'>> = {
  ATTEND: 'A',
  ENCODE: 'A',
  EXTRACT: 'E',
  COMPUTE: 'C',
  KNOW: 'K',
}

export const CODER_LABEL: Record<CoderKey, string> = {
  text: 'Text only',
  sketch: 'Text + sketch',
  coder2: 'Coder 2 (text)',
}

export const CHART_NAME: Record<string, string> = {
  AC: 'Area chart (A)',
  AC2: 'Area chart (B)',
  BC: 'Bar chart',
  BuC: 'Bubble chart',
  CC: 'Choropleth',
  HC: 'Histogram (A)',
  HC2: 'Histogram (B)',
  LC: 'Line chart',
  PC: 'Pie chart',
  SA: 'Stacked area',
  SB: 'Stacked bar',
  SB100: '100% stacked bar',
  SP: 'Scatterplot',
  TM: 'Treemap',
}
