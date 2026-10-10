# PRAXIA — Registro de decisiones

> Lo mantiene CEO-01 con la sesión orquestadora. **Solo el Founder decide.** Una decisión pasa a «Decidida» únicamente cuando el Founder la confirma por escrito en la conversación.

## Decididas

| ID | Fecha | Decisión | Fuente |
|---|---|---|---|
| D-P00 | 2026-10-09 | Iniciar el diseño del equipo con el paquete de 28 agentes y la skill PRAXIA como fuentes | Instrucción del Founder en el chat («go») |
| D-P01 | 2026-10-09 | **Opción C: los 28 agentes quedan activos desde hoy.** No se siguió la recomendación A; el riesgo de saturación del Founder queda registrado (ver `diseno-del-equipo.md` §8) | Instrucción del Founder en el chat («move with option C») |
| D-P04 | 2026-10-09 | Construir el **PRAXIA Command Center** según el PRD v3.0, empezando por la Fase 0 y la Fase 1 (slice vertical del ciclo de ingresos) | Instrucción del Founder en el chat, PRD v3.0 |
| D-P08 | 2026-10-09 | **El repositorio sigue público** y el Command Center se publica en githack (`apps/praxia-command-center/static/command-center.html`). Opción C: las bases de PRX-0012 se quedan en el repo. El Founder considera que no se comparte información privada. Nota de registro: las bases nombran empresas reales y ejecutivos tomados de comunicados y notas públicas, sin correos verificados ni datos privados | Instrucción del Founder en el chat («Déjalo como está») |

## Pendientes

| ID | Tema | Opciones | Recomendación | Fecha límite sugerida | Documento |
|---|---|---|---|---|---|
| D-P02 | Nombres de los servicios | Skill §5.1 · `SERVICE_PORTFOLIO.md` | Skill §5.1 | 2026-10-16 | `diseno-del-equipo.md` §7 |
| D-P05 | Qué mide la meta de USD 10k/mes | A ingreso reconocido · B cobranza neta de IVA · C contratado | A como principal, con B a la vista (FIN-01, QA-01) | 2026-10-16 | `apps/praxia-command-center/docs/FINANCIAL_DEFINITIONS.md` |
| D-P06 | Idioma de la interfaz del Command Center | A inglés (y traducir las fichas de agentes) · B español completo · C bilingüe ES/EN | Pendiente de su preferencia; hoy la UI está en inglés y las fichas en español | 2026-10-16 | `docs/ROADMAP.md` |
| D-P07 | Cuándo usar los datos reales de prospectos para un primer contacto | A congelar · B piloto ≤10 contactos residentes en México, 1:1 por el Founder · C contactar ya (redacción vigente de RISK-01, ver la bandeja) | A hoy y B al cumplir las condiciones de RISK-01 | 2026-10-16 | `praxia/equipos/E8-gobierno/2026-10-09-PRX-0013-consolidacion-crm/RISK-01-privacidad.md` |
| D-P03 | Backlog de negocio (PRX-0001 a PRX-0007); el Founder priorizó el Command Center (D-P04) y este backlog sigue sin decidir | Aprobar todo · aprobar una parte · replantear | Aprobar y arrancar PRX-0002, PRX-0006 y PRX-0007 | 2026-10-16 | `diseno-del-equipo.md` §6 |

<!-- inbox:start (generado por artifact/decisions-sync.mts; no editar a mano) -->
## Pendientes en la bandeja del Command Center

Al 2026-10-10: 22 decisiones esperan al Founder en **Approvals**. Se registran arriba en cuanto el Founder elige una opción.

| ID | Decisión | Opciones | Recomendación | Fecha límite | Planteada por |
|---|---|---|---|---|---|
| COM-01-brief | Distribución del brief interno semanal de PRX-0013 | A Distribuirlo hoy, dentro del repositorio · B Distribuirlo después de la revisión de QA-01, el 15 de octubre · C Esperar al entregable consolidado del 16 de octubre | A | 2026-10-12 | COM-01 |
| D-P05 | D-P05 · Qué mide la meta de USD 10k al mes | A Ingreso reconocido, promedio móvil de 3 meses, con el cobrado neto de IVA siempre a la vista · B Cobrado neto de IVA · C Contratado | A | 2026-10-16 | FIN-01, CEO-01, COM-01 |
| D-P06 | D-P06 · Idioma de la interfaz del Command Center | A Todo en inglés · B Todo en español · C Bilingüe con i18n | B | 2026-10-16 | UI-01, COM-01 |
| OPS-01-higiene | Alcance de la higiene semanal del pipeline | A SOP completo (las 8 revisiones) desde el lunes 12 de octubre · B Modo ligero (revisiones 1, 2, 6, 7 y 8) hasta la primera oportunidad real; después, el SOP completo · C Higiene quincenal | B | 2026-10-16 | OPS-01 |
| D-P02 | D-P02 · Catálogo de servicios mientras siguen abiertos los nombres | A Usar el catálogo A–G y anotar la oferta de §5.2 en description · B Alinear el catálogo de serviceId a las ofertas de §5.2 · C Esperar a cerrar D-P02 | A | 2026-10-16 | SAL-03, DEL-03, MKT-01, COM-01, CEO-01 |
| L-02 | L-02 · Bloquear actividad saliente sin base legal evaluada | A Bloquear hasta que RISK-01 evalúe la base legal (DEV-02) y encargar a DEV-01 los huecos G1–G6 (DAT-01) · B Permitir con aviso y auditoría (DEV-02) o solo reporte manual en /tablero, sin cambiar código (DAT-01) · C Permitir, como hoy (DEV-02), o posponer el diccionario hasta cerrar D-P07 (DAT-01) | A | 2026-10-16 | DEV-02, DAT-01, RISK-01, COM-01 |
| MKT-01-primera-ola | Alcance y ritmo de la primera ola de contacto | A Activar todo: T1 de los seis sectores (36 cuentas) en lotes de 10 (MKT-01) o las 20 del top-20 en tres olas (SAL-02) · B Activar un subconjunto: T1 de los sectores 01–03, 18 cuentas (MKT-01), o solo la Ola 1 (SAL-02); el resto a nurture · C Solo contenido (T2/T3 para todos) hasta cerrar D-P07 (MKT-01) | B | 2026-10-16 | MKT-01, SAL-02 |
| MKT-02-borradores | Primeros mensajes de LinkedIn para cinco cuentas T1 | A Aprobar los cinco; enviar por LinkedIn tras D-P07 y la verificación de URL, en orden Softtek, GNP, Nemak, Palacio, Kavak · B Aprobar solo los de 01–03 (Softtek, Nemak y Kavak); GNP y Palacio de Hierro quedan listos para la segunda ola · C Pedir otra versión con otro ángulo o con otras cuentas (p. ej., BanBajío en lugar de GNP) | A | 2026-10-16 | MKT-02 |
| CEO-01-foco-30d | Uso de los próximos 30 días: congelar funciones del CRM y vender | A Congelar funciones nuevas del CRM (solo correcciones) y vender: prioridades 1 a 5 y revisión de pipeline de los lunes · B Seguir construyendo el Command Center y contactar después · C Repartir el esfuerzo a la mitad | A | 2026-10-16 | CEO-01, COM-01 |
| RES-01-verificacion-url | Verificación visual de las cifras A1–A21 antes del primer envío | A El Founder abre las 15 URL y marca OK en el CRM · B Una sesión con acceso web abre las URL y QA-01 deja registro · C El primer contacto sale sin cifras | A | 2026-10-16 | RES-01 |
| CRM-campos-prospeccion | Origen, competencia e intake de IA: notas estructuradas o campos nuevos | A Solo notas con formato fijo, sin cambiar el esquema (prefijo en subject, líneas [CI], plantilla de intake) · B Campos o tablas nuevas ya: originChannel/originContentId, account_competitors y columnas de intake · C Notas ahora y campos después: al terminar EXP-01 (MKT-03) o con 5 diagnósticos reales (DEL-03) | C | 2026-10-16 | MKT-03, RES-02, DEL-03 |
| D-P07 | D-P07 · Cuándo usar los datos reales de prospectos para un primer contacto | A Congelar el contacto: los datos quedan como investigación de solo lectura hasta cerrar las condiciones §3 de RISK-01 · B Piloto acotado: hasta 10 contactos que residan en México, 1:1 por el Founder, con condiciones 1–6 y 9; sin UE, Brasil ni Colombia · C Contactar ya: sin aviso de privacidad, sin responsable y sin bloqueo en el CRM | A | 2026-10-16 | RISK-01, QA-01, SAL-02, COM-01, CEO-01, FIN-01, DEV-01, MKT-02, MKT-03, DAT-01 |
| COI-conflictos | Declaración de conflictos de interés en cuentas marcadas | A Declarar por escrito, cuenta por cuenta, si hay conflicto; la cuenta conserva su tier y nadie la contacta hasta confirmarlo · B Excluir todas las cuentas marcadas con posible conflicto | A | 2026-10-16 | STR-01, SAL-02, MKT-02 |
| DEL-02-scorecard | Registro del Adoption Scorecard por contrato | A Dos tablas nuevas (adoption_indicators y adoption_measurements) con historial, validación de G0 y semáforo calculado · B Un campo JSON adoption_scorecard en contracts: más rápido, sin serie de tiempo ni validaciones confiables · C El Scorecard queda fuera del Command Center, en documentos por proyecto | A | 2026-10-16 | DEL-02 |
| D-P09 | D-P09 · Quién escribe en la base del Artifact (escritor único) | A Un solo escritor: el mirror o el motor escriben y la página solo lee el CRM · B Varios escritores con versiones y leases: la página también edita · C Dejar todo como está; se aceptan pérdidas silenciosas de datos | A | 2026-10-16 | DEV-01, COM-01 |
| HR-01-capacidad | Tope de revisión del Founder y política del primer asociado | A Cola semanal de máximo 5 piezas (≤ 3 h) de QA-01; banco de Analysts desde la 1.ª propuesta; contratación por proyecto al firmar · B Asociado con anticipo mensual desde ya · C Sin asociado hasta tener 2 diagnósticos; el Founder cubre el campo | A | 2026-10-16 | HR-01 |
| SAL-01-etapas-fit | Etapas con evidencia, fit 1–5 y campos de calificación del CRM | A Aprobar etapas, fit 1–5 con topes y las brechas 1 a 8 como backlog (incluye calificación y valor en juego) · B Aprobar etapas y fit, pero registrar la calificación en notas, sin control automático · C Aplazar hasta cerrar D-P05 y D-P07; el pipeline sigue sin reglas | A | 2026-10-16 | SAL-01, SAL-03 |
| DEL-01-handoff-onboarding | Handoff a kickoff (G0) y onboarding de 30 días tras la firma | A Adoptar hoy con registro manual: tareas H1–H9, aprobaciones y notas de salud con el esquema actual · B A ahora y automatizar después: tareas al firmar y campo de salud del cliente (DEV-01, Projects v1) · C Esperar a Projects v1 (DEL-01); CX-01 plantea y descarta una hoja externa | B | 2026-10-16 | DEL-01, CX-01 |
| DSN-01-onepager | Formato del one-pager sectorial de seguimiento | A PDF carta vertical con un renderizador nuevo: lo más legible por correo y en papel · B Una lámina 16:9 con el layout actual: más rápida, pero se lee mal en el teléfono y en papel · C docx con la receta §15.3, fuera del builder: duplica tokens y contenido | A | 2026-10-16 | DSN-01 |
| STR-01-tiers | Regla de tiers A/B/C para las 117 cuentas del CRM | A Adoptar la regla de STR-01 tal como está (10×Fit + 10×Trigger + 5×Sector): 16 A, 24 B y 77 C · B Usar la fórmula ABM de §8.2, que pide que el Founder indique primero con qué cuentas tiene acceso · C Conservar la prioridad de PRX-0012: 36 cuentas A, con criterios distintos según el analista | A | 2026-10-16 | STR-01 |
| UX-01-cambios | Cambios del flujo lead-to-cash en el Command Center | A Construir los 5 cambios en orden: oportunidad por cuenta, aprobación de primer contacto, nota de discovery, puertas y kickoff · B Solo 1 y 2 (oportunidad por cuenta Tier 1 y aprobación de primer contacto) para mover las 117 cuentas · C Posponer todo y operar con el flujo manual actual | B | 2026-10-16 | UX-01 |
| PR-01-aliados | Política de aliados para el Horizonte 1 | A Solo registrar aliados como «identificado», sin conversaciones · B Registrar y permitir referidos recíprocos sin comisión, con el Founder como único contacto · C B más comisiones o co-venta | B | 2026-10-16 | PR-01 |
<!-- inbox:end -->

## Abiertas desde la skill §16 (sin fecha todavía)
- Razón social, país, estructura fiscal y titularidad de los activos
- Registro de la marca PRAXIA y del Adoption Gap Index; dominio y correo (se cubre en PRX-0007)
- Fórmula y validación del AGI
- Definición de la meta de USD 10k: facturación, cobranza, utilidad o ingreso personal
- Verticales prioritarias y oferta ancla definitiva (se cubre en PRX-0002)
- Re-exportar los logos con el clay oficial
