"""Bundle pilot_recode trials + step codes + images into dashboard/public/.

Run from the dashboard dir:  python3 scripts/build_data.py
"""
import glob
import json
import math
import os
import shutil

import pandas as pd

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RECODE = os.path.join(ROOT, "pilot_recode")
SUPP = os.path.join(ROOT, "supplementary 2")
PUBLIC = os.path.join(ROOT, "dashboard", "public")


def load(pattern):
    rows = [json.loads(l) for f in sorted(glob.glob(os.path.join(RECODE, pattern))) for l in open(f) if l.strip()]
    return {r["trial_id"]: r for r in rows}


def clean(v):
    if isinstance(v, float) and math.isnan(v):
        return None
    return v


def main():
    t = pd.read_csv(os.path.join(RECODE, "trials.csv"))
    items = json.load(open(os.path.join(RECODE, "items.json")))
    codings = {"text": load("out/text_*.jsonl"), "sketch": load("out/sketch_*.jsonl"),
               "coder2": load("out/reliability_coder2.jsonl")}

    os.makedirs(os.path.join(PUBLIC, "charts"), exist_ok=True)
    os.makedirs(os.path.join(PUBLIC, "sketches"), exist_ok=True)
    for f in glob.glob(os.path.join(SUPP, "analysis", "charts", "*.png")):
        shutil.copy(f, os.path.join(PUBLIC, "charts", os.path.basename(f)))

    trials = []
    for _, r in t.iterrows():
        sketch = None
        if isinstance(r.sketch, str) and os.path.exists(r.sketch):
            sketch = f"sketches/{r.trial_id}.png"
            shutil.copy(r.sketch, os.path.join(PUBLIC, sketch))
        trials.append(dict(
            id=r.trial_id, qid=r.qid, chart=r.chart, pid=r.pid,
            question=items[r.qid]["question"],
            answer=json.loads(r.answer),
            accuracy=clean(r.Accuracy), time=clean(r.time),
            explanation=r.explanation,
            nobreCodes=[c.strip() for c in r.nobre_codes.split(";")] if isinstance(r.nobre_codes, str) and r.nobre_codes else [],
            chartImg=f"charts/{r.chart}.png", sketchImg=sketch,
            codings={k: v[r.trial_id] for k, v in codings.items() if r.trial_id in v},
        ))
    json.dump(trials, open(os.path.join(PUBLIC, "data.json"), "w"))
    print(f"{len(trials)} trials; sketches {sum(1 for x in trials if x['sketchImg'])}; "
          f"with sketch coding {sum(1 for x in trials if 'sketch' in x['codings'])}")


if __name__ == "__main__":
    main()
