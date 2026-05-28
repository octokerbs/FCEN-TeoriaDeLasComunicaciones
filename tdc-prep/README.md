# TdC · Centro de estudio

App interactiva para preparar el final de **Teoría de las Comunicaciones** (FCEN-UBA).

- Lecturas didácticas por capa con diagramas SVG
- Multiple choice diario
- Simulacro de examen con 5 preguntas a desarrollar
- Corrección automática con **Gemini** usando rubric explícito
- Dashboard de progreso por tema

---

## Cómo arrancar

### 1. Variables de entorno

```bash
cp .env.example .env
# Editar .env y agregar tu GEMINI_API_KEY
```

### 2. Levantar todo con un solo comando

```bash
npm run up
# o equivalente:
# docker compose up -d
```

Esto arranca dos contenedores:

- **`tdc-prep-db`** → Postgres 16 en `localhost:5433`
- **`tdc-prep-app`** → Next.js dev server en `localhost:3000`

El contenedor `app`, al arrancar, automáticamente:

1. Espera a que Postgres esté `healthy`.
2. Aplica el schema (`prisma db push`).
3. Genera el cliente Prisma.
4. Corre el seed (topics + secciones + preguntas).
5. Levanta el dev server con hot-reload.

La primera vez tarda 30–60 s (build de la imagen + seed). Después, `up` arranca en segundos.

### 3. Abrir la app

```bash
open http://localhost:3000
```

### Comandos útiles

```bash
npm run up         # arrancar todo (postgres + app)
npm run down       # bajar todo
npm run logs       # seguir logs del frontend
npm run rebuild    # bajar, reconstruir imagen y volver a subir
npm run db:up      # solo Postgres (para correr Next localmente)
docker compose exec app sh        # entrar al container del frontend
docker compose exec postgres psql -U tdc tdc_prep   # entrar a psql
```

### Hot-reload

El código fuente está bind-mounteado al contenedor (`./:/app`), así que cualquier
cambio en `src/` o `content/` se refleja en vivo sin reiniciar el container. Los
volúmenes anónimos para `node_modules` y `.next` evitan que se pisen las
artefactos del host (Darwin) con los del container (Linux).

---

## Estructura

```
content/             # markdown por tema (sección "Aprender")
prisma/
  schema.prisma      # modelo de datos
  seed.ts            # entry point del seed
  seed-topics.ts     # los 20 topics
  seed-questions.ts  # banco de preguntas (MCQ + OPEN)
src/
  app/
    page.tsx                  # dashboard
    aprender/                 # lecturas
    practicar/                # MCQ + a desarrollar
    examen/                   # simulacro
    progreso/                 # gráficas
    api/grade/                # endpoint Gemini
    api/sessions/             # guardar resultados
  components/
    diagrams/                 # SVGs (OSI, TCP, RSA, Shannon, ...)
    questions/                # MCQRunner, OpenRunner
    learning/                 # MarkdownContent, DiagramSlot
    progress/                 # ProgressSparkline
  lib/
    db.ts                     # cliente Prisma
    gemini.ts                 # cliente Gemini con rubric
    utils.ts                  # helpers
```

---

## Diseño

Estética: dark mode, monospace para código, sans para prosa. Acentos coloridos por capa
(cyan para Shannon, verde para enlace, amarillo para red, naranja para transporte, magenta
para aplicación, rojo para cripto/seguridad).

---

## Comandos útiles

```bash
npm run db:up        # arrancar Postgres
npm run db:down      # bajar Postgres
npm run db:studio    # Prisma Studio
npm run db:seed      # re-cargar contenido (idempotente)
```

---

## Cómo agregar preguntas

Editá `prisma/seed-questions.ts` y volvé a correr `npm run db:seed`. El seed limpia
las preguntas anteriores y reinserta todas.

## Cómo agregar diagramas

1. Creá un componente en `src/components/diagrams/Foo.tsx` (export default).
2. Agregalo al map en `src/components/learning/DiagramSlot.tsx`.
3. Referencialo en el markdown con `{{diagram: Foo}}`.

---

Hecho con Next.js 15 · Prisma 6 · React 19 · Tailwind 3 · Gemini API.
