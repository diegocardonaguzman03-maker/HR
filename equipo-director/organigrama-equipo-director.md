# Organigrama del Equipo del Director — Estructura v2

> Estructura pedida por el Director: **4 expertos de staff + 2 gerencias por segmento de personal** (sindicalizado y confianza), cada una con su equipo dividido en **Procesos** y **Servicio a Clientes Internos**. **El Director decide.** Cada rol tiene un subagente en `.claude/agents/`.

```mermaid
flowchart TB
    DIR["DIRECTOR DE C&D<br/>(usuario — toma las decisiones)"]:::dir

    subgraph STAFF["Staff de expertos (asesoría y visto bueno transversal)"]
        E1["Experto en Capacitación de<br/>Seguridad y Salud (acero y minas)<br/><i>experto-seguridad-salud</i>"]:::exp
        E2["Experto en Liderazgo y<br/>Gestión del Cambio<br/><i>experto-liderazgo-cambio</i>"]:::exp
        E3["Experto en Documentación y<br/>Mejora de Procesos<br/><i>experto-documentacion-mejora</i>"]:::exp
        E4["Experto en Relaciones Laborales y<br/>Capacitación Sindicalizada<br/><i>experto-relaciones-laborales</i>"]:::exp
    end

    DIR --- STAFF
    DIR --> GS["Gerente de C&D<br/>Personal Sindicalizado (≈ 6,100)<br/><i>gerente-personal-sindicalizado</i>"]:::mgr
    DIR --> GC["Gerente de C&D<br/>Empleados Directos / Confianza (≈ 2,400)<br/><i>gerente-personal-confianza</i>"]:::mgr

    GS --> SP["Célula de Procesos<br/><i>sind-procesos</i><br/>DNC · DC-2 · DC-3/DC-4 · certificación ·<br/>OJT · LMS · logística · proveedores"]:::team
    GS --> SS["Célula de Servicio a Clientes Internos<br/><i>sind-servicio-clientes</i><br/>Minas · Peletizadora · Acería ·<br/>Laminación · Mantenimiento"]:::team

    GC --> CP["Célula de Procesos<br/><i>conf-procesos</i><br/>Talento y sucesión · IDP · cohortes ·<br/>N3/N4 y ROI · onboarding · becas"]:::team
    GC --> CS["Célula de Servicio a Clientes Internos<br/><i>conf-servicio-clientes</i><br/>Mandos de operación · Ingeniería ·<br/>Finanzas · TI/OT · Comercial · RH"]:::team

    E4 -. "visto bueno laboral" .-> GS
    E1 -. "visto bueno de seguridad" .-> GS
    E2 -. "calidad de programas de liderazgo" .-> GC
    E3 -. "estándar de procesos y documentos" .-> SP
    E3 -. "estándar de procesos y documentos" .-> CP

    classDef dir fill:#0d47a1,color:#fff,stroke:#0b3c86
    classDef exp fill:#6a1b9a,color:#fff,stroke:#4a148c
    classDef mgr fill:#1976d2,color:#fff,stroke:#0d47a1
    classDef team fill:#ef6c00,color:#fff,stroke:#bf360c
```

## 1. Roles y responsabilidades

| Rol | Responde por | Decide | Propone al Director |
|---|---|---|---|
| **Director (usuario)** | Estrategia, presupuesto, políticas, relación con la Dirección General y con el sindicato | **Todo lo que compromete recursos, políticas, acuerdos o comunicaciones externas** | – |
| **Experto Seguridad y Salud** | Calidad técnica de la capacitación en SST, riesgos críticos y NOMs | Visto bueno de seguridad (puede **bloquear** un entregable por riesgo) | Estándares, certificaciones, acciones tras incidentes |
| **Experto Liderazgo y Cambio** | Programas de liderazgo y planes de cambio | Visto bueno de calidad en liderazgo y cambio | Programas, planes de cambio y de comunicación |
| **Experto Documentación y Mejora** | Procesos TD-P, control documental, auditoría y mejora | Visto bueno de proceso | Procedimientos, A3, hallazgos de auditoría |
| **Experto Relaciones Laborales** | Cumplimiento de la LFT/CCT, CMCAP, relación con el sindicato en temas de capacitación | Visto bueno laboral (puede **bloquear** un entregable por riesgo legal) | Posiciones de negociación, actas, estrategias |
| **Gerente Sindicalizado** | Resultados de capacitación del personal sindicalizado | Asignación del trabajo en su equipo, prioridades operativas dentro del plan aprobado | Plan, presupuesto y cambios del segmento |
| **Gerente Confianza** | Resultados de desarrollo del personal de confianza | Asignación del trabajo en su equipo, prioridades dentro del plan aprobado | Plan, presupuesto y cambios del segmento |
| **Células de Procesos** | Que los procesos funcionen con evidencia y datos | Ejecución del proceso según el procedimiento | Mejoras de proceso (A3) |
| **Células de Servicio a Clientes** | Satisfacción y resultados de las áreas cliente | Clasificar y canalizar solicitudes | Soluciones a la medida para cada área |

## 2. Qué puede entregar cada rol

| Entregable | Expertos | Gerentes | Células de procesos | Células de servicio |
|---|---|---|---|---|
| Informe ejecutivo | ✔ técnico | ✔ del segmento | ✔ de cumplimiento y datos | ✔ por área cliente |
| Propuesta | ✔ | ✔ (consolida) | ✔ mejoras | ✔ soluciones a la medida |
| Presentación | ✔ | ✔ | ✔ | ✔ |
| Plan de acción | ✔ | ✔ | ✔ | ✔ |
| Plan de mejora A3 | ✔ (lidera Documentación) | ✔ | ✔ | ✔ |
| Seguimiento de objetivos | ✔ de su tema | ✔ consolidado | ✔ KPIs de proceso | ✔ KPIs por cliente |

## 3. Flujo típico de un encargo del Director

```mermaid
sequenceDiagram
    participant D as Director
    participant G as Gerente(s)
    participant C as Células (Procesos / Servicio)
    participant E as Expertos
    D->>G: Encargo (qué, para cuándo, formato)
    G->>C: Reparto: datos y procesos / voz del cliente
    C-->>G: Insumos
    G->>E: Revisión cruzada (laboral, seguridad, proceso, cambio)
    E-->>G: Visto bueno u observaciones
    G->>D: Entregable con opciones y recomendación
    D->>G: DECISIÓN
    G->>C: Plan de acción + registro de la decisión + seguimiento
```

## 4. Relación con el diseño de 64 plazas

**Decidido (D-001): opción C, híbrido.** El acomodo de cada plaza anterior, los custodios del conocimiento de la estructura anterior y el plan de transición están en [estructura-hibrida.md](estructura-hibrida.md).
