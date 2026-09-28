# Steel Learning Twin: from scrap to steel slab

An interactive 3D learning twin of an EAF melt shop and a continuous slab caster, for the Academia GASM. It follows one heat through the whole route:

**scrap and DRI → electric arc furnace → tapping → ladle furnace → transfer and turret → tundish → mold → strand (secondary cooling, solidification, straightening) → torch cutting → slab.**

All process values are **SIMULATED TRAINING DATA**. They are educational references, not operating limits of any real plant.

## Shareable links
- **Public web page** (anyone, any browser, no login): `web/index.html` served by githack. Link pattern:
  `https://rawcdn.githack.com/diegocardonaguzman03-maker/HR/<commit>/apps/steel-twin/web/index.html`
  Rebuild with `npm run build:web`, commit, and use the new commit hash.
- **Claude artifact** (private until shared from its Share menu): https://claude.ai/artifact/WHMRHneTGWGYcHBT5NrJZN, built with `npm run build:share`.
- **GitHub Pages** (optional, permanent URL): Settings → Pages → Deploy from branch → select this branch and `/ (root)`; the app is then at `https://diegocardonaguzman03-maker.github.io/HR/apps/steel-twin/web/`.

## Run locally
```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production build in dist/
npm run build:share  # one self-contained HTML in dist-share/ (used for the link)
npm run typecheck
```

## How to play
| Input | Action |
|---|---|
| Start screen | **Start mission** (guided tour), **Free explore**, **Follow the steel** |
| Drag / right-drag / wheel | Rotate / pan / zoom (touch: drag, two-finger pan, pinch) |
| W A S D, Q / E, Shift | Fly the camera, down/up, faster |
| Click or tap a machine | Info panel; enter **component mode** for isolation and exploded view |
| Space · N · B · R | Play/pause · next · previous · restart |
| X · T · L · V · C · M · Tab · H | X-ray · temperature · layers · views · solidification · minimap · stage list · help |
| 1 – 0 | Camera presets |

## Features (MVP)
- Plant overview with 12 selectable equipment groups, hover tooltip and click-to-inspect info panel with 5 learning depths (what / how / variables / what can go wrong / safety·quality·reliability·productivity).
- Guided process with a deterministic 19-state machine (vacuum treatment optional, disabled by default) grouped into 11 stages, timeline, speed 0.5–4×.
- Material state model (11 states), steel marker and "Follow the steel" camera.
- X-ray mode: solid shell vs liquid core in the strand, liquid steel in ladle, tundish and mold.
- Solidification panel: cross-section at any distance from the meniscus, e = K·√t profile and metallurgical length.
- 10 layers: process flow, equipment, steel flow, temperature, water, gas, electrical, safety, quality, maintenance.
- Game HUD: mission card, step banner, minimap, controls help, responsive layout for phones.

## Documentation
- [docs/architecture.md](docs/architecture.md): modules, data flow, state
- [docs/process-flow.md](docs/process-flow.md): the 19 steps and 11 stages
- [docs/process-assumptions.md](docs/process-assumptions.md): values and their classification
- [docs/equipment-model.md](docs/equipment-model.md): equipment data schema
- [docs/3d-assets.md](docs/3d-assets.md): proxy geometry and how to replace it with GLB
- [docs/data-model.md](docs/data-model.md): types, snapshot and data provider
- [docs/future-integrations.md](docs/future-integrations.md): real-time plant data, LMS, languages
