import type { Trial } from '../types'

interface Props {
  trial: Trial
  showSketch: boolean
  onShowSketch: (v: boolean) => void
  opacity: number
  onOpacity: (v: number) => void
}

export function ChartView({ trial, showSketch, onShowSketch, opacity, onOpacity }: Props) {
  return (
    <section className="chart-panel">
      <div className="chart-toolbar">
        <label className="check">
          <input
            type="checkbox"
            checked={showSketch}
            disabled={!trial.sketchImg}
            onChange={(e) => onShowSketch(e.target.checked)}
          />
          Participant annotation
        </label>
        <label className="slider">
          Opacity
          <input
            type="range"
            min={0.2}
            max={1}
            step={0.05}
            value={opacity}
            disabled={!showSketch || !trial.sketchImg}
            onChange={(e) => onOpacity(Number(e.target.value))}
          />
        </label>
        {!trial.sketchImg && <span className="muted">No annotation for this trial</span>}
      </div>
      <div className="chart-frame">
        <img className="chart-img" src={trial.chartImg} alt={`${trial.chart} chart`} />
        {showSketch && trial.sketchImg && (
          // The annotation canvas (500×200) is stretched over the full chart, as in the
          // authors' compositing script (process_images.js). Strokes are recolored via a mask.
          <div
            className="sketch-overlay"
            style={{
              opacity,
              WebkitMaskImage: `url("${trial.sketchImg}")`,
              maskImage: `url("${trial.sketchImg}")`,
            }}
            aria-label="Participant annotation"
          />
        )}
      </div>
    </section>
  )
}
