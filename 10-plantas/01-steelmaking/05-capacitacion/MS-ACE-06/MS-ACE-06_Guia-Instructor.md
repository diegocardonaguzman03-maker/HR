# MS-ACE-06 — Gases: CO, enriquecimiento de O₂, argón y N₂, gas natural

## Guía del instructor y contenido del curso

| Campo | Valor |
| --- | --- |
| Proceso | MS-ACE-06 — Gases: CO, enriquecimiento de O₂, argón y N₂, gas natural |
| Área | Acería · EAF, LF, ollas, CC1, CC2, redes de gases y patio |
| Serie | Seguridad |
| Manual base | `04-seguridad/MS-ACE-06-gases-co-o2-argon-gas-natural.md` v0.2 (borrador para validación; revisión de seguridad con observaciones · 2026-09-25) |
| Audiencia | Todo el personal de nave · S-01 · S-06 · S-12 · S-08 · S-15 · S-16 · S-21 · C-04 · C-16 |
| Presentación | MS-ACE-06_Capacitacion_AMMX.pptx (estándar AMMX) |
| Estado | Borrador para validación: no se usa en planta hasta validar los valores marcados |

## 1. Objetivo del curso

Tu detector es tu nariz: pórtalo encendido, probado y a ≤ 30 cm de la boca, y obedece sus alarmas

**Principio rector:** Porta tu detector y obedécelo.

**Por qué importa:** Ninguno de estos gases se ve y casi ninguno se huele. El CO a 1,600 ppm mata en menos de 2 h; el argón desplaza el oxígeno sin aviso; el O₂ alto hace que la ropa arda con violencia; el gas natural explota. El detector personal es la única forma de saberlo a tiempo.

## 2. Objetivos de aprendizaje

1. **Reconocer los cinco gases.** CO se mezcla; argón se acumula abajo; gas natural e H₂ suben; O₂ alto hace arder la ropa.
2. **Portar y probar el detector.** Bump test diario, batería ≥ 12 h, calibración vigente; encendido a ≤ 30 cm de la nariz y la boca.
3. **Responder a la alarma.** A1 (CO 25 ppm, O₂ fuera de 19.5–23.5 %, 10 % LEL): sal. A2 (CO 200 ppm, 20 % LEL): evacuación del sector.
4. **No rescatar sin ERA.** Si alguien cae en zona con gas: alarma y esperar a la brigada; reingreso solo con medición de C-16.

## 3. Plan de sesión

| Bloque | Min | Actividad | Recurso |
| --- | --- | --- | --- |
| 1. Apertura y por qué importa | 20 | Casos de intoxicación y asfixia; reglas | Láminas 1–2 |
| 2. Los cinco gases y dónde están | 40 | Mapa de gases en la nave; densidades | Láminas 3–7 |
| 3. Detector y límites | 50 | Práctica: bump test y colocación del detector | Láminas 8–9, detector |
| 4. Controles y EPP | 30 | Presión del horno y corte ESD | Láminas 10–11 |
| 5. Paso a paso y anormales | 50 | Simulacro de mesa: alarma A1 y A2 | Láminas 12–15 |
| 6. Evaluación teórica | 35 | Autoevaluación de 5 preguntas + retroalimentación | Lámina 16 |
| 7. Cierre y demostración | 15 | Plan de demostración práctica | Lámina 17 |

## 4. Contenido clave

### 4.1 Roles

| Rol | Qué hace con los gases | RACI |
| --- | --- | --- |
| C-16 Especialista de Seguridad | Dueño; mapa de detectores fijos; límites de alarma; NOM-010 | A |
| C-04 Jefe de Turno | Ordena evacuaciones de sector; coordina la respuesta | R |
| C-12 / S-21 Instrumentista | Mantiene y calibra detectores fijos y portátiles | R |
| S-01, S-06, S-12 Púlpitos | Vigilan detectores fijos y cortan el suministro de gas | R |
| S-16 Operador de Corte | Oxicorte sin fugas; revisa mangueras | R |
| Todo el personal de nave | Porta detector personal probado; obedece las alarmas | R |
| C-07 / C-08 Ingenieros de Proceso | Ajustes que reducen emisiones (horno −5 a −15 Pa) | C |

### 4.2 Flujo del proceso

1. **Bump test:** Batería ≥ 12 h; calibración vigente
2. **Portar:** Autocero en aire limpio; ≤ 30 cm
3. **Vigilar:** Fijos en HMI; horno −5 a −15 Pa
4. **A1:** Sal a verde; avisa lugar y lectura
5. **A2:** C-04 evacúa el sector; corte ESD
6. **Sin ERA no:** Alarma y espera a la brigada
7. **Reingreso:** CO < 25 ppm, O₂ OK, < 10 % LEL
8. **Entregar:** Descarga de picos y carga

### 4.3 Equipos

| Equipo | Función | Especificación clave | Verificar antes |
| --- | --- | --- | --- |
| Detector personal multigás | Protección individual | O₂, CO, LEL, H₂S; alarmas A1/A2 | Bump test diario |
| Detectores fijos de CO | Plataformas, torreta, casa de bolsas | Sirena y luz local y en púlpito | Prueba con gas mensual [Supuesto] |
| Detectores fijos de O₂ | Estaciones de Ar/N₂/O₂, fosas, LF | Alarma < 19.5 % y > 23.5 % | Prueba mensual [Supuesto] |
| Detectores fijos de LEL | Gas natural, precalentadores | 10 % y 20 % LEL; corte a 20 % | Prueba mensual |
| Válvulas ESD de GN y O₂ | Corte remoto del suministro | Cierre ≤ 5 s [Validar con OEM] | Prueba trimestral [Supuesto] |
| Arrestaflamas y antirretorno | Oxicorte y precalentadores | En cada línea | Inspección mensual |
| ERA | Rescate y reingreso | ≥ 30 min | Presión ≥ 90 % |

### 4.4 Parámetros

| Gas | A1: acción individual | A2: acción de sector | Referencia |
| --- | --- | --- | --- |
| CO | 25 ppm: sal | 200 ppm: evacuar sector | NOM-010 [Verificar] |
| O₂ bajo | < 19.5 %: sal | Fijo < 19.5 %: evacuar | NOM-033 |
| O₂ alto | > 23.5 %: sal, sin chispas | Fijo: aislar O₂, evacuar | NOM-033 |
| Gas natural / H₂ | 10 % LEL: sal, corta gas | 20 % LEL: evacuar, corte | NOM-033 |
| Confinado: entrada | < 10 % LEL | Caliente: ≤ 1 % lectura | MS-ACE-05 |
| Presión del horno | −5 a −15 Pa | > 0 Pa: alejar personal | FT-ACE-001 |
| Reingreso | CO < 25 ppm | O₂ OK y < 10 % LEL | Mide C-16 |

> CO: IDLH 1,200 ppm (NIOSH); 200 ppm = techo NIOSH. Todos los valores normativos [Verificar con la NOM vigente / SSO].

### 4.5 Seguridad: controles críticos

- ★ **Detector personal probado y bien puesto:** Bump test diario; encendido en aire limpio; a ≤ 30 cm de nariz y boca, sin cubrir con ropa.
- ★ **Horno en depresión:** DES en operación y presión −5 a −15 Pa. Si es positiva: reducir O₂ y potencia y alejar al personal de la puerta.
- ★ **Corte remoto y arrestaflamas:** Válvulas ESD de gas natural y O₂; arrestaflamas y antirretorno en oxicorte y precalentadores.
- ★ **Rescate solo con ERA:** Nadie entra a una zona con gas sin ERA. Alarma, esperar a la brigada; reingreso con medición de C-16.

**EPP:** Detector multigás encendido a ≤ 30 cm de la boca · Ropa sin grasa ni aceite cerca de O₂ · Prohibido soplar la ropa con oxígeno · Respirador P100 para humos según evaluación · ERA solo para brigada en rescate y reingreso

### 4.6 Calidad

| Qué se controla | Criterio | Cómo y cuándo | Si falla |
| --- | --- | --- | --- |
| Bump test y calibración | Pasa; calibración vigente | Diario; registro | Detector fuera de uso |
| Descarga de detectores | Picos > 25 ppm CO investigados | Al entregar el detector | Exposición sin atender |
| Detectores fijos | Mapa y prueba mensual | C-16 / S-21 | Zona sin detección |
| Válvulas ESD | Cierre probado | Trimestral [Supuesto] | Fuga sin corte |
| Evaluación NOM-010 | Agentes químicos y exámenes | C-16 y servicio médico | Exposición crónica |
| Sello de argón en CC | Sin entrada de aire | Continuo en HMI | Reoxidación, N₂ alto |

### 4.7 Paso a paso

| # | Paso | Cómo hacerlo y qué medir | Criterio | ★ | Rol |
| --- | --- | --- | --- | --- | --- |
| 1 | Recoge y prueba tu detector | Bump test en la estación; batería ≥ 12 h y fecha de calibración vigente | Pasa la prueba | ★ | Todos |
| 2 | Pórtalo bien | Enciéndelo en aire limpio (autocero); a ≤ 30 cm de nariz y boca, sin cubrirlo | Visible y encendido | ★ | Todos |
| 3 | Revisa fijos en HMI | Al inicio del turno: sin fallas ni alarmas activas | Todos en línea |  | Púlpitos |
| 4 | Vigila la presión del horno | −5 a −15 Pa; si es positiva, aleja al personal de la puerta y de la bóveda | Presión negativa | ★ | S-01 |
| 5 | Responde a A1 | CO 25 ppm, O₂ fuera de 19.5–23.5 % o 10 % LEL: sal a verde; avisa lugar y lectura | Salida inmediata | ★ | Todos |
| 6 | Responde a A2 | CO 200 ppm, 20 % LEL o alarma de fijo: C-04 evacúa el sector y corta el gas por ESD | Sector evacuado | ★ | C-04, púlpitos |
| 7 | No rescates sin ERA | Si alguien cae en zona con gas: alarma, no entres, espera a la brigada | Sin víctimas adicionales | ★ | Todos |
| 8 | Reingresa con medición | C-16 o brigada con ERA mide: CO < 25 ppm, O₂ 19.5–23.5 %, < 10 % LEL; caliente ≤ 1 % | Lecturas registradas | ★ | C-16 |
| 9 | Revisa oxicorte | Mangueras, arrestaflamas y antirretorno antes de encender; secuencia OEM; agua jabonosa en frío | Sin fugas | ★ | S-16/S-15/S-08 |
| 10 | Entrega el detector | Descarga los datos de picos de exposición y ponlo a cargar | Datos registrados |  | Todos |

### 4.8 Condiciones anormales

| Síntoma | Acción inmediata | Avisar a |
| --- | --- | --- |
| Dolor de cabeza o mareo sin alarma | Sal a aire limpio; servicio médico; revisa el detector | C-04, médico |
| Persona inconsciente en LF o fosa | Alarma; no entres sin ERA; brigada | C-04 |
| Llama o chispas anormales en ropa | Aléjate; sin ignición; aísla O₂ | C-04 |
| Olor a gas o sonido de fuga | Sal; no operes interruptores; ESD | C-04 |
| Detector fijo en falla | Detector portátil en la zona hasta su reparación | S-21 |
| Presión positiva del horno | Reduce O₂ y potencia; evacúa la plataforma | C-05, C-12 |

## 5. Evaluación

### 5.1 Autoevaluación teórica (mínimo 4 de 5 correctas)

1. Tu detector marca CO 25 ppm. ¿Qué haces?
   a) Sigo trabajando
   b) Salgo a zona verde y aviso
   c) Apago el detector

2. ¿Con qué lectura de CO C-04 evacúa el sector?
   a) 50 ppm
   b) 200 ppm
   c) 1,200 ppm

3. ¿Dónde se acumula el argón?
   a) Arriba, en el techo
   b) Abajo: fosas y sótanos
   c) Se mezcla igual

4. Hueles gas natural cerca de un precalentador. ¿Qué NO haces?
   a) Salir del área
   b) Operar un interruptor
   c) Avisar a C-04

5. ¿A qué distancia de la nariz y la boca va el detector personal?
   a) ≤ 30 cm
   b) En la cintura
   c) En el casco trasero

**Clave de respuestas:**

1. b) Salgo a zona verde y aviso — A1: CO 25 ppm, sal a aire limpio y avisa. No reingreses hasta < 25 ppm.
2. b) 200 ppm — A2: 200 ppm (techo NIOSH), evacuación del sector; solo brigada con ERA.
3. b) Abajo: fosas y sótanos — Densidad 1.38: baja y desplaza el O₂ sin olor ni aviso.
4. b) Operar un interruptor — Un interruptor puede ser la chispa. Sal, avisa y corta el gas con la válvula ESD.
5. a) ≤ 30 cm — En la zona respiratoria, ≤ 30 cm y sin cubrir con ropa, para leer lo que respiras.

### 5.2 Evaluación práctica de competencia (TD-P07)

Nivel requerido: **L** (escala ILUO).

| Rol | ILUO | Teoría | OJT supervisado | Vigencia |
| --- | --- | --- | --- | --- |
| Todo el personal de nave | L | 4 h | Demostración | 12 meses |
| S-01, S-06, S-12 Púlpitos | U | 6 h | 5 eventos o simulador | 24 meses |
| S-08, S-15, S-16 Oxicorte | U | 6 h | 10 encendidos | 24 meses |
| S-21 Detectores | O | 16 h | 10 calibraciones | 24 meses |
| C-04, C-16 | O | 8 h | Simulacro | 24 meses |

Lista de verificación de pasos ★ (todos deben demostrarse correctamente):

- [ ] Hace el bump test y porta el detector en la zona respiratoria
- [ ] Explica las alarmas CO 25/200 ppm, O₂ 19.5/23.5 %, 10/20 % LEL y su acción
- [ ] Sabe que el argón no se huele y se acumula abajo
- [ ] Se niega a rescatar sin ERA y activa la alarma
- [ ] Revisa arrestaflamas, antirretornos y mangueras antes de encender oxicorte
- [ ] En púlpito vigila la presión del horno y aleja al personal si es positiva

Resultado: ☐ Competente (registro en IMaS y DC-3/SIRCE en ≤ 10 días hábiles) · ☐ Aún no competente (OJT dirigido y nueva evaluación).

## 6. Reglas que no se negocian

- **Porta tu detector y obedécelo.** Probado, encendido y en la zona respiratoria todo el turno.
- **A1 sales tú; A2 sale el sector.** CO 25/200 ppm; O₂ 19.5–23.5 %; gas natural 10/20 % LEL.
- **Nunca rescates sin ERA.** Alarma y brigada. Un rescate improvisado multiplica las víctimas.
- **Nunca soples la ropa con oxígeno.** La ropa enriquecida con O₂ arde con violencia.

## 7. Por confirmar

- Umbrales CO 25/200 ppm con NOM-010 vigente (alternativa conservadora: 50 ppm para sector)
- Frecuencia de prueba de detectores fijos y de válvulas ESD; cierre ≤ 5 s (OEM)
- Calibración de detectores portátiles según fabricante

## 8. Validación

| Revisión | Responsable | Estado |
| --- | --- | --- |
| Técnica (operación, metalurgia y control de proceso) | experto-operativo-metalurgia | Pendiente |
| Seguridad | experto-seguridad-salud | visto bueno — 2026-09-25 |
| Laboral (roles, certificación, escalafón) | experto-relaciones-laborales | Pendiente |
| Diseño instruccional y formato | experto-documentacion-mejora | Pendiente |
| Aprobación | Director de C&D | Pendiente |

