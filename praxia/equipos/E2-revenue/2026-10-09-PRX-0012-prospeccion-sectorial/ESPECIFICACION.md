# PRX-0012 · Prospección sectorial y decks por sector

> Encargo del Founder (9 oct 2026): deck con la marca PRAXIA para compartir con clientes potenciales, trabajado por el equipo comercial con Diseño y Marketing; base de prospectos con decision makers organizada por sector; en cada sector un deck personalizado y una base de contactos.

## Equipos y dueños
| Pieza | Dueño | Colaboran |
|---|---|---|
| Evidencia por sector (`00-evidencia/`) | RES-01 | — |
| Bases de prospectos por sector (`NN-sector/base-*.csv`) | SAL-02 (una instancia por sector) | SAL-01 (criterios) |
| Narrativa y contenido de decks (`deck-builder/content/*.json`) | MKT-02 | SAL-03 (oferta y CTA), RES-01 (cifras) |
| Construcción de decks (`deck-builder/`, `NN-sector/deck-*.pptx`) | DSN-01 | MKT-01 (marca) |
| Revisión | QA-01 (calidad y marca), RISK-01 (datos personales y claims) | — |

## Sectores (Horizonte 1: México primero, LatAm y multinacionales con operación regional) [PROPUESTA]
01 Manufactura e industria · 02 Startups y scale-ups tecnológicas · 03 High tech, software y servicios TI · 04 Servicios financieros y fintech · 05 Retail, consumo y e-commerce · 06 Logística y cadena de suministro

## Reglas de datos (skill §8.2, no negociables)
- No fabricar ni comprar datos personales. Nombres de personas **solo con fuente pública** (URL) y fecha de consulta.
- Correos: **solo patrón de dominio** (p. ej. `nombre.apellido@empresa.com`) marcado **NO VERIFICADO**. Nunca afirmar que un correo existe. La verificación se hará con Hunter (integración de Fase 2) antes de cualquier envío.
- Toda empresa lleva fuente del trigger o del dato de fit. Lo que no se pudo verificar se marca [PENDIENTE].
- Nada se envía. Ningún contacto se carga al Command Center hasta cerrar la decisión D-P07 (checklist de RISK-01).
- Sin datos ni material de empleadores actuales o anteriores del Founder ni de las carpetas GASM del repositorio. Señalar posibles conflictos de interés.

## Formato de la base (CSV UTF-8, una fila por contacto; empresas sin contacto identificado = una fila con contacto vacío)
`sector, empresa, pais_sede, presencia_mx_latam, tamano_aprox, sitio_web, dominio, linkedin_empresa, trigger_detectado, fuente_trigger_url, fecha_fuente, fit_icp_1a5, justificacion_fit, servicio_praxia_sugerido, prioridad (A/B/C), contacto_nombre, contacto_cargo, contacto_linkedin_url, fuente_contacto_url, fecha_consulta_contacto, email_patron, estado_email, base_legal, notas`
- `estado_email` = `NO VERIFICADO` siempre. `base_legal` = `Interés legítimo B2B — pendiente validación RISK-01/abogado`.
- `servicio_praxia_sugerido`: A Transformation Diagnostic · B Adoption Architecture · C AI Adoption Accelerator · D Organizational Effectiveness Advisory · E Leadership & Capability Transformation · F Transformation Analytics · G Strategic Advisory Retainer.

## Decks
- Idioma: español (cliente Horizonte 1). Marca: Brand Guidelines v1.0 (skill §14, §15.2). Logo: SVG de referencia marcado provisional hasta tener los PNG oficiales.
- Estructura base: pitch deck de la skill §9.1 (8–12 láminas), adaptado por sector: el momento del sector → el Adoption Gap en ese sector → costo de la brecha (solo cifras con fuente) → qué hacemos → método (SENSE·ALIGN·ADOPT·SUSTAIN) → punto de entrada (diagnóstico) → ofertas relevantes → quién está detrás → siguiente paso.
- Sin clientes, casos, testimonios ni ROI inventados. Precios: solo rango exploratorio del diagnóstico si el Founder lo aprueba; por defecto "inversión según alcance".
- Contacto: praxia.com y hello@praxia.com están [PENDIENTE]; usar un marcador visible para que el Founder ponga su canal real antes de enviar.
