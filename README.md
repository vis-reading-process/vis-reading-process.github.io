# VLAT Process Explorer

React + Vite + TypeScript dashboard for browsing the pilot re-code of Nobre et al. (CHI '24) explanations
into step traces (`../pilot_recode`).

```bash
python3 scripts/build_data.py   # bundle trials, codes, charts, sketches into public/
npm install
npm run dev
```

- **Left:** trial list with filters for chart, correctness, reconstructability, stage, sketch-coded and text search. Navigate with ↑/↓ or j/k. The selected trial is kept in the URL hash.
- **Center:** question, participant answer, correctness, time, and Nobre et al.'s barrier codes. Below that, the VLAT chart with the participant's annotation drawn over it, with a toggle and an opacity slider.
- **Right:** the participant's transcript, with each coded step's evidence highlighted by step type. Steps with an error tag get a wavy red underline. Hover or click a highlight to link it to the matching step in the trace, and vice versa. Use the legend chips to show or hide step types. Tabs switch between the text-only coder, the text + sketch coder (120 trials) and the second reliability coder (100 trials).

The annotation canvas is 500×200 and gets stretched over the whole chart. This is the same alignment the authors' `process_images.js` uses for their composites.
Re-run `scripts/build_data.py` after updating anything in `../pilot_recode/out/`.
