# Backlog de la fase 2 — ACERÍA DIGITAL ACADEMY

**Mensaje clave:** el MVP demostró la arquitectura con una etapa, un sistema y una instrucción. La fase 2 tiene dos frentes. Primero, **convertir contenido DEMO y borrador en contenido aprobado por planta**, lo cual depende de los SME. Segundo, **escalar a la cadena completa D-010**: Peletizadora, HYL, Midrex, EAF, horno olla y colada continua.

| # | Épica | Valor | Dependencia | Esfuerzo [Supuesto] | Prioridad |
|---|---|---|---|---|---|
| F2-01 | **Taller de validación SME**: llenar los ≈200 campos `SME_REQUIRED` del EAF con procedimientos aprobados y firmas de Seguridad y Operaciones | Habilita el contenido `PLANT_APPROVED` | Superintendencia EAF, Seguridad, C-07 | 3–4 semanas | Alta |
| F2-02 | Flujo de aprobación en la app: registro de firmas (quién, cuándo, versión) y bloqueo de PLANT_APPROVED sin ellas | Control documental ISO | F2-01, Documentación y Mejora | 2 semanas | Alta |
| F2-03 | Modelo 3D desde CAD o escaneo de la planta real, con el mismo contrato de nodos | Realismo y transferencia | Ingeniería (planos) | 4–6 semanas | Media |
| F2-04 | Etapas 01, 02, 04, 05 y 06 con su sistema principal y su WI (carga de DRI, escoria espumosa, EBT, horno olla) | Cobertura completa del EAF | F2-01 | 6 semanas | Alta |
| F2-05 | Módulos de Peletizadora, HYL, Midrex y colada continua (CC1, CC2) | Cadena D-010 | Catálogos PEL/RD | 3 meses | Media |
| F2-06 | Asistente RAG con LLM (`AnswerProvider` remoto) restringido a documentos aprobados, con citas, negativa y registro de preguntas sin datos personales | Respuestas más naturales | F2-01, TI/Ciberseguridad, aviso de privacidad | 4 semanas | Media |
| F2-07 | Integración con LRS/LMS: envío xAPI con consentimiento y paquete SCORM | Evidencia en el expediente | TI, CMCAP para sindicalizados | 2–3 semanas | Media |
| F2-08 | Videos reales grabados en planta, con subtítulos y audiodescripción | Calidad didáctica | Seguridad (permiso de grabación) | 4 semanas | Media |
| F2-09 | Modo PERFORM con ilustraciones por paso (renders del GLB) e impresión del job aid | Uso en piso | F2-01 | 2 semanas | Media |
| F2-10 | Escenarios de decisión ("¿qué haces si…?") con ramificación y retroalimentación | Nivel 3 de práctica | F2-01 | 3 semanas | Baja |
| F2-11 | Modo sin conexión (PWA) para tabletas de piso | Disponibilidad | TI | 1 semana | Baja |
| F2-12 | Multilenguaje (inglés para contratistas y proveedores OEM) | Alcance | — | 1 semana | Baja |
| F2-13 | Texturas KTX2 y LODs para el modelo de planta real | Rendimiento con modelos pesados | F2-03 | 1 semana | Media |
| F2-14 | Tablero de C&D: avance por cohorte (agregado y anónimo) | Gestión | F2-07, Relaciones Laborales | 2 semanas | Baja |

**Reglas que se mantienen:**
- La plataforma nunca certifica competencia.
- Nada NO VALIDADO se presenta como aprobado.
- El uso con personal sindicalizado pasa por `experto-relaciones-laborales`, porque los resultados no se vinculan a escalafón sin acuerdo con la CMCAP.
