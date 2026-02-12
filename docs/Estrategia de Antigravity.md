Esta es la **Estrategia de "Vitaminización" de Antigravity** para construir SmartSeller/SmartDash.

El objetivo es transformar tu IDE (Antigravity) de un editor de código a un **Ingeniero de Producto** que conoce a fondo la API de Mercado Libre, la arquitectura "clínica" que definimos y las reglas de negocio, utilizando el protocolo MCP y NotebookLM como cerebro externo.

---

### 🏛️ Estrategia General: "Cerebro Híbrido"

1.  **NotebookLM (El Arquitecto):** Contiene la documentación masiva, los playbooks de reputación y la estrategia.
2.  **Antigravity (El Constructor):** Ejecuta código, conectado vía MCP a Mercado Libre para validar endpoints en tiempo real.
3.  **Gemini.md (La Constitución):** El archivo de contexto que reside en la raíz del proyecto para alinear a los agentes.

---

### 🔧 Paso 1: Configurar el "Cerebro" (NotebookLM)

Antigravity necesita consultar "fuentes de verdad" complejas sin alucinar.

**Acción:** Crea un Cuaderno en NotebookLM llamado **"SmartSeller Knowledge Base"**.
**Fuentes a cargar (URLs/PDFs):**
1.  **Documentación Oficial ML:** (Sube los PDFs generados de las páginas clave que identificamos: *Autenticación, Notificaciones, Orders, Questions, Reputation, Items*).
2.  **El Manifiesto del Proyecto:** Sube un PDF con la definición del "Health Score" y los "10 Escenarios Clínicos" que generamos en este chat.
3.  **Reglas Técnicas:** El archivo `gemini.md` (Constitución).

**Skill para el Agente (Prompt de Sistema para Antigravity):**
*Cuando necesites lógica de negocio compleja o reglas de reputación, consulta primero la nota 'Definiciones Clínicas' en mi NotebookLM antes de escribir código.*

**🔗 Prompts para "Vitaminizar" NotebookLM (copiar y pegar en el chat del cuaderno):**
> "Genera una especificación técnica en formato JSON Schema para el objeto 'DailySnapshot' considerando las métricas de: reputación, tiempo de respuesta de preguntas (SLA), y cobertura de stock. Basa los campos en los recursos disponibles de la API de Mercado Libre que tienes en las fuentes."

---

### 🤖 Paso 2: Vitaminizar Antigravity (Skills & MCP)

Para que Antigravity no solo "escriba código" sino que **verifique** contra Mercado Libre, usamos la configuración MCP que investigamos.

**Archivo de Configuración (`mcp_config.json`):**
Asegúrate de que Antigravity tenga acceso a la documentación y a la API real para tests.

```json
{
  "mcpServers": {
    "mercadolibre": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.mercadolibre.com/mcp",
        "18999" 
      ],
      "disabled": false
    }
  }
}
```
*(Nota: Recuerda el fix del puerto 18999 para el OAuth que encontramos en la investigación OSINT)*.

**Skill Activa:**
Ahora Antigravity tiene la skill `search_documentation`.
**Prompt de prueba en Antigravity:**
> "Usa la herramienta `search_documentation` para encontrar los límites de rate (rate limits) de las notificaciones de Mercado Libre y sugiéreme una configuración de 'backoff' para la cola de trabajos en NestJS."

---

### 🏗️ Paso 3: Stack de Desarrollo (Next.js, Vercel, Stitch)

Define los comandos para que el agente instale la estructura base correcta.

**Prompt Maestro para Antigravity (Inicio del Proyecto):**
Copia esto para iniciar el repo. Integra las decisiones de arquitectura (Nest para backend, Next para front).

```text
Actúa como Arquitecto de Software Senior. Vamos a inicializar el proyecto "SmartSeller".

Contexto:
- Objetivo: SaaS de monitoreo clínico para sellers de Mercado Libre.
- Stack: Monorepo (Turborepo).
  - Apps/Web: Next.js 14 (App Router), Tailwind, Shadcn/UI.
  - Apps/Backend: NestJS (para workers, colas BullMQ, OAuth).
  - DB: Supabase (Postgres).
  - Infra: Vercel (Web) + Google Cloud Run (Backend).

Tarea 1: Genera la estructura de carpetas del monorepo.
Tarea 2: Crea el archivo 'gemini.md' en la raíz con las reglas de "Excelencia Operativa" y "API-First" definidas anteriormente.
Tarea 3: Instala las dependencias clave para el manejo de colas (bullmq) y cliente HTTP (axios) en el backend.
```

**Integración con Stitch (Data Pipeline):**
Aunque usaremos ingestión propia para lo operativo, Stitch sirve para el histórico analítico.
**Prompt para configuración de ETL:**
> "Genera un esquema de configuración para Stitch Data que sincronice las tablas 'orders' y 'items' de Mercado Libre hacia un Data Warehouse (BigQuery) cada 6 horas. Define el JSON de configuración excluyendo PII (datos personales) del comprador."

---

### 🐙 Paso 4: Flujo de Trabajo con GitHub

Para mantener la calidad, Antigravity debe actuar como *Code Reviewer*.

**Skill de CI/CD (GitHub Actions):**
Pide a Antigravity que genere el workflow de "Golden Test".

**Prompt:**
> "Crea un archivo de GitHub Action `.github/workflows/golden-flow.yml`. Este test debe correr diariamente y verificar:
> 1. Que el refresh token de prueba se renueva correctamente contra la API de Mercado Libre.
> 2. Que un request a /users/me devuelve 200 OK.
> Usa secretos de repositorio para CLIENT_ID y CLIENT_SECRET."

---

### 🚀 Resumen del Kit de Inicio

| Herramienta | Función en SmartSeller | Prompt / Recurso Clave |
| :--- | :--- | :--- |
| **NotebookLM** | **Cerebro Clínico**. Contiene las reglas de negocio y documentación curada. | Prompt: *"Extrae los 5 criterios de riesgo de reputación y conviértelos en una función de TypeScript."* |
| **Antigravity (MCP)** | **Brazo Ejecutor**. Conectado a ML para validar endpoints. | Config: `mcp-remote` al puerto 18999. |
| **NestJS (Backend)** | **Sistema Nervioso**. Maneja OAuth, Colas y Webhooks. | Prompt: *"Crea un módulo 'MeliAuth' en NestJS con guards para validar scopes."* |
| **Supabase** | **Memoria**. Base de datos multi-tenant. | Prompt: *"Genera el DDL SQL para la tabla 'tenants' y 'health_scores' con RLS habilitado."* |
| **Gemini.md** | **Constitución**. Reglas éticas y técnicas. | Archivo en raíz del proyecto (ver respuesta anterior). |

Esta estrategia asegura que Antigravity no empiece en blanco, sino "vitaminizado" con el contexto de Mercado Libre, las reglas de negocio de SmartSeller y la capacidad técnica de verificar lo que escribe.