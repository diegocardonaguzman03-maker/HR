# Plantilla — Etapa de proceso (`ProcessStage` en `processes.json`)

| Campo | Qué escribir | Regla |
|---|---|---|
| `id` | `stage.<clave>` | Del catálogo de `content-schema.md` |
| `order`, `code` | 1…n, "01"… | Orden del flujo |
| `name`, `shortName` | Nombre completo y corto | Español de México |
| `summary`, `purpose` | Qué pasa y para qué | Educativo y general |
| `inputs`, `outputs` | Lista | Sin cifras de planta |
| `equipmentIds`, `hazardIds` | IDs existentes | Las valida `check:content` |
| `variables[]` | `{name, why, value}` | **`value` siempre `SME_REQUIRED: …`** mientras no exista un documento aprobado |
| `operatorDecisions`, `dependencies` | Lista | Decisiones generales; los criterios numéricos son SME_REQUIRED |
| `nextStageId` | ID o `null` | Encadena el mapa |
| `camera` | `{position, target}` en metros, con la plataforma en y = 0 | La define ADX-09 |
| `status` | GENERAL_EDUCATIONAL · DRAFT_NOT_VALIDATED · SME_REQUIRED | PLANT_APPROVED necesita firmas de Seguridad y Operaciones |
| `sourceIds` | `src.*` | Toda etapa cita su fuente |

**Revisan:** ADX-02 Metalurgia, ADX-03 Operaciones y ADX-04 Seguridad (veto en `hazardIds`).

```json
{ "id": "stage.ejemplo", "order": 1, "code": "01", "name": "…", "shortName": "…", "summary": "…", "purpose": "…",
  "inputs": ["…"], "outputs": ["…"], "equipmentIds": ["eq.…"],
  "variables": [{ "name": "…", "why": "…", "value": "SME_REQUIRED: <dato> — lo da <rol/documento>" }],
  "operatorDecisions": ["…"], "dependencies": ["…"], "hazardIds": ["haz.…"], "nextStageId": null,
  "camera": { "position": [10, 8, 10], "target": [0, 2, 0] }, "status": "GENERAL_EDUCATIONAL", "sourceIds": ["src.industry-general"] }
```
