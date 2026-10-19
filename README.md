# 一点一点 · 数学第一周

A Chinese, visual-first interactive refresher on propositions, quantifiers, implication, counterexamples and proof. Built with Astro, plain CSS, inline SVG, and browser JavaScript. No external fonts, runtime dependencies, analytics, or remote API calls.

## Run

Node 24 recommended. Run `npm ci`, then `npm run dev`. Production: `npm run check:js && npm run build`. Preview with `npm run preview` and open `/math/`.

## Publish

GitHub repository: `Yikai-Liao/math`. Astro is configured with site `https://yikai-liao.github.io` and base `/math`. GitHub Pages source must be **GitHub Actions**. Push to `main` runs `.github/workflows/deploy.yml`, builds static output in `dist`, and deploys it using official Astro and GitHub Pages actions.

## Lesson interactions

1. Sentence classification, shuffled options, explanatory feedback.
2. Six-object quantifier world, color toggles, step-by-step scan with a counterexample stop.
3. People/books matrix distinguishing ∀∃ from ∃∀.
4. Four implication cases, manual and pausable timed playback.
5. Prime-polynomial counterexample explorer, real trial-division testing, pausable sequential scan and inspected-range tracking.
6. Three-step even-sum proof with grouped-dot diagram.
7. Three randomized multiple-choice exercises and a final explanation prompt.

Progress is stored only in `localStorage` on the current browser and can be cleared. Native buttons support keyboard/touch. Colors have text equivalents. Reduced-motion preferences suppress ambient animation and transitions; lesson playback is always explicitly started and pausable, and pauses when the tab becomes hidden.

## Structure

- `src/pages/index.astro`: lesson content and semantic structure
- `public/style.css`: responsive visual design
- `public/app.js`: interactions and local progress
- `astro.config.mjs`: Pages path configuration
