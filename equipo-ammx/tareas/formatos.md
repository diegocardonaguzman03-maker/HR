# Formatos del equipo AMMX

Todos los agentes usan estos formatos sin cambiarles la estructura.

## 1. Ficha de proyecto en el tablero (Coordinador)
```
ID: C2
Proyecto: SAFETS — instructores internos de seguridad
Dueño: Uziel | Apoyos: Alex, Alejandro, ATLAS
Prioridad de cartera: P1–P5 / sin prioridad | Urgencia: U0–U4
Estado: 🟢 / 🟡 / 🔴 / ⚪ / 🔵 + texto (ej. En ejecución jun–dic 2026)
Madurez: Probado / En piloto / Conceptual
Último avance: [fecha] — [qué se hizo]
Siguiente paso: [acción concreta] — [responsable] — [fecha]
Bloqueo: [ninguno / descripción]
Decisión pendiente de Diego: [ninguna / pregunta concreta con opciones]
Próxima fecha crítica: [fecha] — [qué ocurre]
```

## 2. Recordatorio
```
RECORDATORIO — [ID de proyecto o tarea]
Qué: [evento o compromiso]
Cuándo: [fecha y hora]
Qué falta: [lista corta]
Quién lo tiene: [agente]
Qué necesita hacer Diego: [nada / acción concreta]
```

## 3. Escalamiento
```
ESCALAMIENTO — [ID]
Situación: [una línea]
Impacto si no se resuelve: [una línea]
Opciones: A) ... B) ... C) ...
Consecuencia de cada opción: A) ... B) ... C) ...
Recomendación del equipo: [opción y por qué]
Posiciones distintas (si las hay): [agente — posición en 3 líneas]
Fecha límite para decidir: [fecha]
```

## 4. Challenge
```
CHALLENGE — [agente] sobre [ID o entregable]
Problema detectado: [una línea]
Evidencia: [dato, documento o razonamiento]
Impacto: [qué pasa si no se corrige]
Recomendación: [qué hacer en su lugar]
```

## 5. Dictamen de ATLAS (Experto de Operaciones)
```
[Experto de Operaciones — ATLAS] Dictamen sobre [ID]
Resultado: Alineado / Ajustar / No viable en operación
Razones operativas:
1. ...
Correcciones propuestas:
1. ...
Datos a validar con Operaciones del sitio: [lista o ninguno]
Impacto operativo de la iniciativa: seguridad / disponibilidad / productividad / calidad / costo — [una línea]
```

## 6. Dictamen de AEGIS (Auditor)
Rúbrica de 12 criterios (une la rúbrica de 9 criterios del prompt v1.0 y los 10 de AEGIS). Cada criterio: **Cumple / Corregir / Bloquea**.

| # | Criterio | Qué revisa |
|---|---|---|
| 1 | Responde lo pedido | Resuelve la tarea tal como Diego la pidió |
| 2 | Veracidad | Ninguna cifra, nombre, proveedor, política o caso inventado. Fuentes presentes |
| 3 | Evidencia | Cada dato marcado Confirmado / Supuesto / Por confirmar; cifras internas "Ilustrativa"; madurez Probado / En piloto / Conceptual |
| 4 | Consistencia | Cifras, nombres y fechas iguales en todo el documento y con tablero y cartera |
| 5 | Calidad de datos | Fuente confiable, fecha de corte, línea base antes de declarar impacto |
| 6 | Estándar de redacción | Cumple 4.1 y 4.2 al pie de la letra |
| 7 | Normativa, privacidad y uso de IA | Sin riesgo laboral, legal o de privacidad; nada sensible en el repositorio público (4.7); la IA no es fuente de verdad en temas de seguridad |
| 8 | Seguridad operacional | No hay riesgo de que el material lleve a un acto inseguro; conocer ≠ competente ≠ autorizado |
| 9 | Realidad operativa y escalabilidad | Dictamen de ATLAS cuando toca la operación; se puede implementar y escalar |
| 10 | Alineación al negocio e impacto | Conecta con P1–P5 y con un resultado medible |
| 11 | Diseño y experiencia de usuario | Cumple 4.5 y 4.6; legible al primer vistazo; el usuario final realmente lo podrá usar |
| 12 | Accionable y listo para usar | Queda claro qué decide Diego y qué sigue; no es plantilla ni borrador con huecos sin marcar |

```
[Auditor — AEGIS] Dictamen sobre [ID]
Resultado: Aprobado / Aprobado con cambios / Bloqueado
Criterios: 1 ✔ · 2 ✔ · 3 ✎ · ... (✔ Cumple · ✎ Corregir · ✖ Bloquea)
Correcciones (por línea, sección o lámina):
1. [ubicación] — [qué corregir]
Error recurrente del agente (si aplica): [texto]
```

## 7. Morning Brief (diario)
```
AMMX — MORNING BRIEF · [fecha]
🔴 Crítico (máx. 3)
- ...
🟠 Atención
- ...
🟢 En curso
- ...
Decisiones que necesita Diego (máx. 3)
- [ID] pregunta — opciones — fecha límite
Hoy
- vence / reuniones / entregas
Agentes trabajando
| Agente | Proyecto | Tarea | Estado | Siguiente entrega |
Siguiente mejor acción: [una acción y por qué tiene el mayor impacto]
```
Regla: si es miércoles, la sección "Hoy" solo lleva avances de diseño de P1 y temas U0.

## 8. Command Center (cartera completa)
| Proyecto | Dueño | Estado | Avance | Riesgo | Siguiente hito | Decisión pendiente |
|---|---|---|---|---|---|---|

Estados permitidos: 🟢 En curso · 🟡 Atención · 🔴 En riesgo · ⚪ Sin iniciar · 🔵 Bloqueado.
"Avance" solo se expresa en % si hay un plan con hitos que lo respalde; si no, se escribe la etapa (ej. "Diseño", "Piloto").

## 9. Actualización de memoria
```
ACTUALIZACIÓN DE MEMORIA — [fecha]
Proyecto / tarea:
Información nueva:
Decisión:
Dueño:
Fecha:
Siguiente paso:
Riesgo:
```

## 10. Ficha de reunión (martes)
```
FICHA DE REUNIÓN — [stakeholder] · [fecha]
Objetivo de la reunión: [una línea]
Decisión que buscamos: [una línea]
Mensajes clave (máx. 3):
Preguntas a hacer (máx. 3):
Riesgos y cómo atenderlos:
Material de apoyo: [archivo]
Después de la reunión: [qué registra el Coordinador]
```
