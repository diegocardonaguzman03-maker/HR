# Acceso al piloto sin link público (decisión D-017)

**Mensaje clave:** el repositorio pasa a privado y el link público (githack) deja de funcionar. Para el piloto del 12 al 16 de octubre **[Supuesto]** hay dos vías. La preferida es que TI publique la academia en la intranet. El respaldo es abrirla directamente desde el disco de los 2 equipos del piloto. Las dos vías usan el mismo paquete: `academia-digital-piloto-v2.1.zip` (≈ 11 MB comprimido; es la carpeta `apps/academy/web/` del repositorio).

> Este entorno de capacitación apoya el aprendizaje y no sustituye procedimientos operativos aprobados, instrucciones de trabajo, permisos, supervisión ni requisitos de seguridad.

## Vía 1 (preferida): publicar en la intranet — TI (TD-16/TD-17)
1. Descomprimir el paquete en una carpeta de un servidor web interno. Son solo archivos estáticos: no lleva base de datos, servidor de aplicaciones ni instalación.
2. Publicar esa carpeta como un sitio de **solo intranet** (sin acceso desde internet), con HTTPS.
3. Confirmar que los PDF se sirven como `application/pdf`. La mayoría de los servidores lo hace por defecto.
4. Abrir el sitio desde un equipo de la sala de capacitación y correr el checklist del §4 del kit.
5. Entregar a Capacitación y Desarrollo la dirección interna, que reemplaza al link de githack en el kit.

**Datos y privacidad:** la academia no envía datos a ningún servidor. El avance y el registro se guardan solo en el navegador de cada equipo, y el botón «Borrar mis datos de este equipo y terminar» los elimina (RL-L-11).

## Vía 2 (respaldo): abrir desde el disco del equipo — instructor
1. Copiar `academia-digital-piloto-v2.1.zip` a cada equipo del piloto y descomprimirlo, por ejemplo en `C:\AcademiaGASM\`.
2. Abrir `index.html` con Chrome o Edge (doble clic o «Abrir con»).
3. Verificar que la escena 3D carga. Si no aparece, activar en el navegador «Usar aceleración por hardware cuando esté disponible» y reiniciarlo.
4. En «Procedimientos», los PDF se abren en otra pestaña. La misión sigue abierta en la primera.

**Probado el 2026-10-08:** abierto desde el disco, sin servidor ni internet, la misión LOTO carga con su escena 3D y el checklist se abre en otra pestaña sin cerrar la misión. Sin internet, el texto usa las fuentes del sistema; no afecta el contenido.

## Lo que no cambia
- Solo personal de confianza, solo DEMO, sin DC-3 y con los datos borrados entre sesiones (kit, §2).
- El paquete no se entrega impreso ni se copia a equipos fuera del piloto (riesgo R7 de la presentación al comité).

## Decisión requerida del Director
No hay una decisión nueva. D-017 ya está aprobada y lo pendiente es ejecución:

| Acción | Responsable | Fecha límite **[Supuesto]** |
|---|---|---|
| Hacer privado el repositorio en GitHub | Director (dueño de la cuenta) | Antes de la sesión del comité |
| Publicar en la intranet (vía 1) | TI (TD-16/TD-17) | 2026-10-09, junto con la preparación de equipos |
| Copiar el paquete a los 2 equipos como respaldo (vía 2) | Instructor (ADX-01) | 2026-10-09 |
