# Future integrations

## Real-time plant data
`RealtimePlantDataProvider` (`src/sim/ProcessDataProvider.ts`) is a stub. To connect it:
1. Read from a plant historian or OPC UA gateway through a read-only API owned by TI/OT (never directly from control networks).
2. Map tags to the variable keys in [data-model.md](data-model.md) and derive `state` from events (power on, tap, ladle open, cast length).
3. Set `simulated: false`; the SIMULATED badge disappears only then.
4. Validation by `experto-operativo-metalurgia` and cybersecurity review are required before use.

## Learning platform (LMS)
- Emit xAPI statements (step completed, equipment inspected, level reached) to the Academia GASM LMS.
- Quiz mode per stage using the `whatCanGoWrong` and `impact` data.
- Link each equipment to its operation manual and training deck (Acería manuals and AMMX presentations in this repo).

## Content
- Spanish UI (Mexico) with a language switch; data files are ready for `es`/`en` fields.
- CC2 billet caster, Laminación and Minas as new "levels".
- GLB models from Engineering (see [3d-assets.md](3d-assets.md)).
- VR / large-screen mode for the training centre.
