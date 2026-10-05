# Lista de verificación de validación industrial — Validation Board (ADX-14)

**Uso:** se llena antes de liberar cualquier versión. Una sola casilla de **Seguridad** sin cumplir **bloquea** la liberación (veto ADX-04). Estado de esta versión (MVP 0.1): ver `qa-report.md` §4.

## A. Contenido
| # | Criterio | Responsable | Verificación |
|---|---|---|---|
| A1 | Ningún objeto está en `PLANT_APPROVED` sin firmas de Seguridad y Operaciones | ADX-14 | `check:content` + prueba `content.test.ts` |
| A2 | Todo límite, setpoint, temperatura, presión, adición, parámetro de vaciado, paso de LOTO, enclavamiento, bypass, emergencia o secuencia crítica está como `SME_REQUIRED` o `PLACEHOLDER` | ADX-02/03/04 | Revisión manual + prueba de variables y peligros |
| A3 | El contenido general está separado del aprobado por planta (chip de estado visible en cada pieza) | ADX-08 | Revisión UI |
| A4 | Toda pieza cita sus fuentes (`sourceIds`) | ADX-01 | `check:content` |
| A5 | El contexto GASM es correcto (D-010: DRI ≈95–100 %, retornos ≤5 %, sin chatarra comprada) | ADX-02 | Revisión manual |
| A6 | Los IDs, hotspots y nodos 3D son consistentes | ADX-09 | `check:content` con `eaf.nodes.json` |

## B. Seguridad (veto)
| # | Criterio | Verificación |
|---|---|---|
| B1 | El aviso permanente es visible en todas las vistas y no se puede cerrar | e2e (arranque) + prueba de componente |
| B2 | La información crítica nunca va solo por color: texto + icono + color | Revisión UI + prueba de accesibilidad e2e |
| B3 | La plataforma no certifica competencia (evaluación, práctica y PDFs lo dicen) | Pruebas de evaluación e2e y de componente |
| B4 | La WI DEMO se muestra con un aviso «no es una instrucción aprobada» y marca de agua en el PDF | Prueba EJECUTAR + PDF |
| B5 | El asistente no da valores de planta, se niega a dar bypass y dice «No tengo una fuente aprobada para esa información.» | `assistant.test.ts` + e2e |
| B6 | Los pasos de ALTO y escalamiento están presentes en la WI | Revisión manual |
| B7 | Las animaciones (arco y regulación) están rotuladas como DEMO o ilustrativas | Revisión UI |
| B8 | La validación de referencias pasa sin errores | `check:content` |

## C. Formación
| # | Criterio |
|---|---|
| C1 | Los objetivos de cada módulo son medibles y están alineados con las preguntas |
| C2 | La evaluación cubre los objetivos y las recomendaciones apuntan a módulos existentes |
| C3 | El lenguaje es apto para personal de nuevo ingreso (frases cortas, glosario) |
| C4 | La evidencia (xAPI) no incluye datos personales ni texto libre |

## D. Técnica
| # | Criterio |
|---|---|
| D1 | `npm run typecheck`, `npm test`, `npm run e2e` y `npm run build` en verde |
| D2 | El presupuesto 3D se cumple (ver `3d-asset-guidelines.md`) |
| D3 | La accesibilidad cumple: teclado, nombres accesibles, *reduced motion*, sin desborde en móvil |

## Firmas
| Función | Agente/rol | Resultado | Fecha |
|---|---|---|---|
| Metalurgia | ADX-02 | | |
| Operaciones | ADX-03 | | |
| Seguridad (veto) | ADX-04 | | |
| Mantenimiento | ADX-05 | | |
| Formación | ADX-07 | | |
| Producto | ADX-01 | | |
| Decisión final | **Director de C&D** | | |
