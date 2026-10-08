# Política de seguridad

Este repositorio es **privado** y contiene el diseño del departamento de Capacitación y Desarrollo de GASM (empresa ficticia) y la aplicación **Francisco Command Center** (`apps/command-center/`).

## Versiones con soporte

| Componente | Soporte |
| --- | --- |
| `apps/command-center` en la rama de trabajo vigente (último commit) | ✅ |
| Builds publicados anteriormente (artifact o página web) | ❌ — se reemplazan con cada publicación |

## Cómo reportar una vulnerabilidad

- **No abras un issue público.** Usa *Security → Report a vulnerability* (reporte privado de GitHub) o escribe al dueño del repositorio.
- Incluye: componente afectado, pasos para reproducir, impacto y, si puedes, una propuesta de corrección.
- Respuesta inicial: **3 días hábiles**. Corrección de hallazgos críticos o altos: **7 días**; medios: **30 días**.
- Si el reporte se acepta, se corrige en una rama privada, se agrega una prueba y se documenta en el PR. Si se rechaza, se explica el motivo.

## Controles vigentes

**Repositorio (GitHub)**
- Repositorio privado; solo el dueño tiene acceso de escritura (`.github/CODEOWNERS`).
- Dependabot: actualizaciones semanales de dependencias npm y de GitHub Actions (`.github/dependabot.yml`).
- CI de seguridad en cada push y PR (`.github/workflows/security.yml`):
  - búsqueda de secretos en todo el historial con gitleaks;
  - `npm audit` (falla con severidad moderada o mayor);
  - typecheck y pruebas.
- Las Actions están fijadas por SHA de commit y corren con permisos de solo lectura.

**Desarrollo**
- Secretos: nunca en el código. Las llaves van en variables de entorno o en un `.env` local, que git ignora (solo se versiona `.env.example`).
- Página web: Content-Security-Policy estricta. Solo corren los scripts propios (fijados por hash) y la página solo puede conectarse a `api.anthropic.com` o a un gateway local o seguro (`wss:`). La llave de API del usuario se guarda únicamente en su navegador y solo se envía a Anthropic.
- Gateway (`server/gateway.ts`):
  - escucha en `127.0.0.1` por defecto;
  - exige `GATEWAY_TOKEN` (mínimo 24 caracteres) si se expone fuera de localhost;
  - lista de orígenes permitidos (`ALLOWED_ORIGINS`);
  - límite de tamaño y de frecuencia de mensajes;
  - validación de comandos y cabeceras de seguridad.
- PostgreSQL local publicado solo en `127.0.0.1`.
- La actividad de los agentes se etiqueta como `real`, `simulated` o `user`. Ningún agente toma decisiones: solo el Director decide (ver `CLAUDE.md`).

## Datos

- La información de GASM es ficticia y sirve para diseño y capacitación.
- No se deben subir datos personales reales de trabajadores (nombres, CURP, RFC, NSS, expedientes médicos o sindicales). Si se necesitan, se anonimizan antes de versionarlos. Referencia: LFPDPPP; verificar con Jurídico.
