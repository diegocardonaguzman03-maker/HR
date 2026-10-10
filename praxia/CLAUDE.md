# PRAXIA — reglas de trabajo en esta carpeta

Todo lo que se haga dentro de `praxia/` es trabajo de **PRAXIA** (Human & AI Transformation Advisory), no de GASM.

1. **Fuente rectora:** `00-fuentes/PRAXIA_Skill_Business_Brand_OS.md` (también disponible como skill `praxia`). Hay que leerla antes de producir cualquier activo. La precedencia de fuentes, las etiquetas [DEFINIDO]/[TRABAJADO]/[PROPUESTA]/[PENDIENTE], las reglas de oro y el QA de §17 son obligatorios.
2. **El usuario decide.** Los agentes analizan, recomiendan y preparan. Ninguna PROPUESTA ni PENDIENTE se presenta como decisión tomada.
3. **Separación de GASM:** las reglas del `CLAUDE.md` raíz (Director de C&D, plantillas GASM, flujo de expertos GASM) **no aplican** aquí. Tampoco se usa contenido, cifras, nombres ni material de las carpetas GASM del repositorio (regla de oro 3 de la skill: no usar información de empleadores actuales o anteriores ni de terceros).
4. **Cero datos inventados:** no hay clientes, facturación, testimonios ni casos confirmados. El AGI no tiene fórmula validada.
5. **Sistema visual vigente:** Brand Guidelines v1.0 (skill §14): Graphite #0C0D12, Ivory #F5F2EC, Indigo #5B4BFF, Violet #8B5CF6, Clay #E9663C, con Space Grotesk, Inter y Space Mono. Los HEX de los decks y del tablero de exploración en `00-fuentes/` son versiones reemplazadas.
6. `00-fuentes/` es de solo lectura. Los entregables nuevos van en `equipos/<equipo>/`.

## Equipo y orquestación
- El diseño del equipo está en `01-equipo/diseno-del-equipo.md`: 28 agentes en 8 equipos y activación por fases [PROPUESTA, decisión D-P01]. El estándar que siguen todos los agentes está en `01-equipo/estandar-comun-agentes.md`.
- Los agentes están en `.claude/agents/praxia-*.md` (un archivo por ID, por ejemplo `praxia-sal-03`).
- **La sesión principal orquesta** según `00-fuentes/paquete-agentes/SYSTEM_ORCHESTRATOR.md`. Recibe el encargo, le asigna un ID `PRX-NNNN`, arma el brief y elige el flujo. Lanza a los agentes dueños (en paralelo cuando los pasos son independientes) y respeta la fase de activación vigente con la tabla de cobertura (§5). Pasa el resultado por QA-01, y por RISK-01 cuando aplica. Consolida un solo entregable con «Decisión requerida del Founder».
- Los entregables van en `equipos/<equipo>/AAAA-MM-DD-PRX-NNNN-tema/`. Las decisiones se anotan en `01-equipo/registro-de-decisiones.md`.
