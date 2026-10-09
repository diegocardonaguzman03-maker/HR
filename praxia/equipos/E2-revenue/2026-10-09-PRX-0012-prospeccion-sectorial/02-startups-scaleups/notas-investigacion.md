# PRX-0012-S02 · Notas de investigación · Sector 02 Startups y scale-ups tecnológicas

> Owner: SAL-02 · Reporta a: SAL-01 · Revisión: RISK-01 (datos personales), QA-01 (calidad) · Fecha: 2026-10-09 · Estado: **borrador, incompleto frente a la meta**
> Base: `base-startups-scaleups.csv` (en esta misma carpeta)

## Mensaje clave
La base tiene **11 empresas y 16 decision makers**, todos con nombre tomado de una fuente pública con URL. La meta era de 20 a 25 empresas. No se alcanzó porque **se agotó el presupuesto de búsqueda web del turno**, que comparten todos los agentes (200 consultas). Además, **el proxy bloqueó WebFetch**, así que no se pudo abrir ninguna página para verificarla. Clasificación: cinco cuentas en prioridad A, cuatro en B y tres en C [PROPUESTA]. Ningún correo está verificado y ningún dato está listo para outreach.

## 1. Alcance y criterios [DEFINIDO por el brief]
- Países: México, Colombia, Brasil, Chile y Argentina. Serie B en adelante o más de 150 empleados. Fintech excluida (tiene su propio sector).
- Señal pública de discontinuidad entre 2024 y 2026: ronda grande, crecimiento o recorte de plantilla, nuevo CEO/CHRO/COO, expansión, adopción de IA declarada o M&A.
- Prioridad según la skill §3.3 y §8.2 [PROPUESTA de aplicación]:
  - **A**: trigger activo (≤ 12 meses o en curso), escala que estresa a la organización y presupuesto visible (ronda o capital reciente).
  - **B**: dos de esas tres condiciones, o un trigger de más de 12 meses.
  - **C**: trigger débil o no verificado, o la organización se está contrayendo y tiene poco presupuesto.
- `fit_icp_1a5`: juicio cualitativo con evidencia, explicado en `justificacion_fit`. No se calculó la fórmula ABM (§8.2) porque *Fit_Acceso* es desconocido en todas las cuentas: no hay relación previa documentada.

## 2. Método
1. Búsquedas web (WebSearch, modo estándar y extendido) en español, inglés y portugués, por empresa y por tipo de trigger. El conjunto inicial de candidatas salió del conocimiento del sector y se depuró con lo que mostraba la evidencia.
2. Para cada empresa se registró: trigger, URL de la fuente, fecha, dato de escala y decision makers **solo cuando una fuente pública los nombra con su cargo**.
3. No se consultó LinkedIn ni se hizo scraping de ninguna plataforma. La columna `contacto_linkedin_url` y `linkedin_empresa` quedan en [PENDIENTE] a propósito.
4. Correos: el patrón no se conoce en ninguna cuenta, así que todos van como `[patrón desconocido]@dominio`, con estado `NO VERIFICADO`. La verificación se hará con Hunter en Fase 2 y requiere aprobación previa.
5. Sin material GASM ni de empleadores del Founder.

### Consultas ejecutadas (resumen)
Kavak 2025 ronda, CEO, despidos y reestructura · Kavak nombramientos de personas y COO · Nowports 2025 · 99minutos 2025 ronda y expansión · Buk 2025 ronda y México · Buk CEO · Tractian 2025 ronda y México · Tractian CEO y cofundadores · Rappi 2025–2026 IPO, CEO, IA · Habi 2025 financiamiento México · NotCo 2025 CEO, despidos, IA · Tiendanube/Nuvemshop 2025 México e IA · Humand 2025–2026 ronda · QuintoAndar–Navent · Hotmart 2025 reestructura e IA · Mottu 2025 México · Platzi 2025–2026 · Truora 2025 · rondas LatAm 2026 (Serie B/C) · Series B México 2026 · scale-ups Brasil Serie C 2026 · Fracttal Serie C. En total fueron unas 25 consultas antes de agotar el límite.

## 3. Fuentes principales (por cuenta)
| Cuenta | Fuente del trigger | Fecha |
|---|---|---|
| Kavak | elceo.com (Serie F USD 300M) · hrtoday.in (Head of People & Culture) · emprendedor.com | feb-2026 · dic-2025 |
| Buk | theclinic.cl (USD 50M, Brasil, duplicar México) · ex-ante.cl (perfil del CEO) | ene-2025 |
| Tractian | mexicobusiness.news (Serie C USD 120M, I+D Monterrey) · bloomberglinea.com (fundadores) | dic-2024 |
| Hotmart | startups.com.br (reestructura −10%) · tecmundo.com.br | jul-2026 |
| Tiendanube | descubre.vc (oficinas en México, crecimiento 6x) · xataka.com.mx (USD 10M en IA) | abr-2026 |
| Rappi | bloomberglinea.com (IPO en evaluación para 2026) | [PENDIENTE] |
| Habi | bloomberg.com (USD 30M IFC/VPC) · idbinvest.org | abr-2024 · 2025 |
| Humand | forbesargentina.com (Serie A USD 66M) | feb-2026 |
| NotCo | df.cl (despidos, pivote a IA) · forbes.cl (cierre de NY) | jul-2026 · feb-2025 |
| 99minutos | [PENDIENTE] nota primaria de Freight99 · elreferente.es (Serie C 2022) | ago-2025 |
| Fracttal | [PENDIENTE] fuente primaria de la Serie C · getlatka.com (tamaño y CEO) | ene-2026 |

Las URL completas están en el CSV (`fuente_trigger_url`, `fuente_contacto_url`, `notas`).

## 4. Exclusiones y descartes
| Empresa | Motivo |
|---|---|
| Nowports (MX) | No se encontró señal entre 2024 y 2026. La última ronda es la Serie C de 2022 |
| Truora (CO) | Serie A de 2022, sin señal reciente; no cumple el umbral de etapa |
| QuintoAndar (BR) | La compra de Navent/Inmuebles24 cerró en 2021–2022, fuera de la ventana. No se encontró trigger reciente |
| Mottu (BR) | La Serie C y la entrada a México son de 2023, fuera de la ventana. Re-investigar 2025–2026 |
| Platzi (CO) | No se encontró despido, reestructura ni cambio de CEO. La IA aparece como producto, no como transformación interna |
| Clip, Plata, ARQ, Pomelo, Mendel, Félix Pago, minu, Betterfly | Son fintech, insurtech o financieras: van al sector 04 |
| netLex (BR), Take Blip (BR) | Su expansión a México es anterior a 2024 o no tiene URL atribuible. Quedan en backlog |

## 5. Limitaciones (leer antes de usar la base)
1. **Cobertura incompleta**: 11 de 20–25 empresas. El límite compartido de búsquedas se agotó a mitad del trabajo.
2. **No hubo verificación de página**: WebFetch falló porque el proxy rechazó la conexión por política. Todos los datos vienen de extractos y resúmenes del buscador asociados a una URL. Antes de cualquier uso, alguien debe abrir cada URL y confirmar el dato y la fecha.
3. **Vigencia de los cargos**: varias fuentes de contacto son anteriores a 2025. Están marcadas en `notas`: Santiago Sosa, João Pedro Resende, Juan Cruz de la Rúa y Leonardo Vieira.
4. **Fuentes de terceros**: getlatka.com y startupintros.com son agregadores. Los contactos de Fracttal y 99minutos dependen de ellos y requieren una fuente primaria.
5. **Dominios**: solo tractian.com, kavak.com y habi.co aparecieron en las fuentes. Los demás están marcados `[verificar]`.
6. **Tamaño**: la plantilla de Kavak, Buk, Rappi, Habi, Humand y 99minutos está en [PENDIENTE]. En el caso de Humand, el criterio de 150 o más empleados no está confirmado.

## 6. Top-5 cuentas [PROPUESTA]
| # | Cuenta | Trigger | Por qué ahora | Servicio PRAXIA sugerido | Comprador probable |
|---|---|---|---|---|---|
| 1 | **Kavak** (MX) | Serie F de USD 300M (feb-2026) y nuevo Head of People & Culture (dic-2025) | Pasa de crecimiento agresivo a un modelo rentable con IPO en el horizonte, y llega un líder de personas nuevo: es la ventana de los primeros 100 días | A Transformation Diagnostic → D Organizational Effectiveness Advisory | Head of People & Culture (champion) y CEO (economic buyer) |
| 2 | **Hotmart** (BR) | Reestructura con −10% de plantilla (jul-2026) y la IA como pilar estratégico | Tiene que ejecutar con menos gente y adoptar IA de forma transversal: es el Adoption Gap en su forma pura | C AI Adoption Accelerator · A Diagnostic | CEO; el líder de People está [PENDIENTE] |
| 3 | **Tractian** (BR/EE.UU./MX) | Serie C de USD 120M con la mitad destinada a México: I+D en Monterrey y nueva oficina en 2026 | Contratación acelerada y nuevos líderes en un hub joven | E Leadership & Capability Transformation · B Adoption Architecture | CEO y CCO; el líder de People está [PENDIENTE] |
| 4 | **Tiendanube** (AR/BR/MX) | Expansión en México (abr-2026) y USD 10M en su ecosistema de IA | La empresa vende IA, pero su propia adopción interna y el escalamiento en México no están medidos | C AI Adoption Accelerator · E | CEO (la fuente es previa; confirmar) |
| 5 | **Buk** (CL) | USD 50M (ene-2025), entrada a Brasil y plan de duplicar el equipo en México | La expansión multi-país estresa a los mandos medios. Puede ser cliente o aliado | E Leadership & Capability · D | CEO |

Filtros de la skill: las cinco cuentas tienen un problema económico plausible de más de USD 20k: costo de ejecución lenta, productividad después de un recorte o retención en un hub nuevo. **No se presentan cifras de costo**, porque no hay datos del cliente.

## 7. Riesgos y conflictos de interés
- **Conflicto de interés [PENDIENTE de declarar por el Founder]**: Tractian y Fracttal venden a industria pesada y acerera. Si el empleador actual o anterior del Founder es cliente de alguna de ellas, hay que declararlo antes de contactarla.
- **Fintech excluida**: el caso de crédito del Founder viene de una fintech y no se cruza con este sector.
- **Datos personales**: 16 nombres con cargo, tomados de prensa y de dos agregadores. No hay correos, teléfonos ni perfiles personales. Cargar estos datos queda **bloqueado hasta que se resuelva D-P07** (checklist de RISK-01). Base legal propuesta: interés legítimo B2B, pendiente de validar por RISK-01 o un abogado. Se requiere aviso de privacidad y opt-out antes de cualquier contacto (LFPDPPP, LGPD en Brasil, Ley 1581 en Colombia, Ley 19.628 en Chile y Ley 25.326 en Argentina). *Requiere revisión de un abogado en la jurisdicción aplicable.*
- **Ningún mensaje se envía** sin la aprobación del Founder (RACI).

## 8. Backlog para completar 20–25 cuentas (candidatas sin investigar; no usar como dato)
Son nombres para la siguiente ronda de búsqueda. No se afirma ningún trigger. Brasil: Wellhub, Olist, Loft, Cayena, Unico, Loggi, Kovi, Mottu, netLex, Take Blip. México: Jüsto, Runa, Merama (BR/MX), Skydropx. Colombia: La Haus, Frubana, Melonn, Ontop. Chile: Talana, Lemontech, Houm. Argentina: Agrofy, Despegar (adquirida por Prosus; evaluar si es scale-up o va al sector 03).

## Decisión requerida del Founder
**Tema:** cómo cerrar el déficit de cobertura del sector 02 (11 de 20–25 empresas).

| Opción | Descripción | Esfuerzo | Riesgo |
|---|---|---|---|
| **A** | Abrir un turno nuevo de SAL-02 con presupuesto de búsqueda y WebFetch habilitado para: (1) verificar las 16 URL existentes y (2) investigar el backlog del §8 hasta llegar a 20–25 cuentas | 1 sesión de agente | Bajo |
| **B** | Aceptar las 11 cuentas actuales y concentrar el esfuerzo en las cinco A para preparar discovery | Ninguno adicional | El deck del sector se apoya en una base corta |
| **C** | Pedir a RES-01 que comparta su evidencia del sector (`00-evidencia/`) y completar con ella | Coordinación | Se mezclan dueños de la evidencia |

**Recomendación:** A. Además, que el Founder declare los posibles conflictos de interés con Tractian y Fracttal (§7).
**Costo:** solo tiempo de agente; no hay gasto. **Fecha límite sugerida:** 2026-10-16, antes de cerrar los decks de PRX-0012.

## Handoff
```json
{"brief_id":"PRX-0012-S02","owner":"SAL-02","objective":"Base de 20–25 scale-ups tecnológicas LatAm (no fintech) con trigger 2024–2026 y hasta 3 decision makers con fuente pública",
 "deliverable":"praxia/equipos/E2-revenue/2026-10-09-PRX-0012-prospeccion-sectorial/02-startups-scaleups/base-startups-scaleups.csv; .../notas-investigacion.md",
 "evidence_and_sources":["elceo.com Kavak Serie F feb-2026","hrtoday.in Kavak Head of People dic-2025","theclinic.cl Buk ene-2025","ex-ante.cl Buk CEO","mexicobusiness.news Tractian Serie C dic-2024","bloomberglinea.com Tractian fundadores","startups.com.br Hotmart jul-2026","descubre.vc Tiendanube abr-2026","bloomberglinea.com Rappi IPO","bloomberg.com Habi abr-2024","idbinvest.org Habi","forbesargentina.com Humand feb-2026","df.cl NotCo jul-2026","forbes.cl NotCo feb-2025","elreferente.es 99minutos","getlatka.com Fracttal","startupintros.com 99minutos"],
 "assumptions":["Criterios A/B/C aplicados como PROPUESTA sobre skill §3.3/§8.2","Fit_Acceso desconocido en todas las cuentas, así que no se calculó la fórmula ABM","Datos tomados de extractos del buscador; páginas no abiertas por bloqueo del proxy"],
 "risks":["Cobertura 11/20–25 por agotamiento del presupuesto compartido de búsqueda","Cargos posiblemente desactualizados (Sosa, Resende, de la Rúa, Vieira)","Dos contactos dependen de agregadores de terceros","Triggers de 99minutos y Fracttal sin fuente primaria [PENDIENTE]","Conflicto de interés por declarar (Tractian, Fracttal)","Datos personales bloqueados hasta D-P07"],
 "decisions_needed":["Cerrar el déficit de cobertura: opción A/B/C (fecha límite 2026-10-16)","Declaración de conflictos de interés del Founder","D-P07 antes de cargar contactos"],
 "next_owner":"RISK-01","review_status":"borrador"}
```
