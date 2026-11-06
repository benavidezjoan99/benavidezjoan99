# ObraCalc PR — Estimador de costos de construcción

App web **local-first** para estimar el presupuesto de una **casa nueva** en **Puerto Rico** (moneda **USD**). Interfaz en español (`es-PR`). Guarda proyectos en SQLite en tu máquina.

> Evoluciona desde CasaCalc PR (MVP). Fase 1: branding ObraCalc, motores puros de cálculo, import CSV de catálogo, tests Vitest.  
> Estimación orientativa — no es cotización de contratista. El catálogo semilla usa precios placeholder de retail EE.UU./PR; **no hay scraping ni APIs “en vivo” fingidas**. Cada precio lleva fuente y fecha.

## Cómo correr en local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

La base SQLite se crea sola en `data/obracalc.sqlite` al primer request (incluido el catálogo semilla). Si existía `data/casacalc.sqlite` del MVP, se copia automáticamente.

Otros comandos:

```bash
npm test        # Vitest — engines (QuantityTakeoff, Pricing, Labor, Estimation)
npm run build   # build de producción
npm start       # servir el build
npm run lint
npm run db:seed # reinicializa SQLite + catálogo semilla
```

## Qué incluye (Fase 1)

- Branding **ObraCalc PR**
- CRUD proyectos + ambientes + líneas de materiales
- Motores puros (sin React / sin I/O):
  - `QuantityTakeoffEngine` — bloques, hormigón, piso, pintura, gypsum (+ sugerencias MVP)
  - `PricingEngine` + `PriceResolver` (override > manual > csv > seed)
  - `LaborCostEngine` — `%` materiales, hourly / unit / fixed (stubs)
  - `EstimationEngine` — totales sin doble conteo + contingencia
- Catálogo semilla (~53 ítems) claramente marcado como demo / estimación
- **Import y export CSV** del catálogo; export CSV del presupuesto
- Persistencia **SQLite** local (sin Supabase)
- i18n mínimo `es-PR`
- Tests Vitest con ejemplos verificados a mano

## Supabase Auth = Fase 1b (diferido)

Sin variables de entorno, la app arranca en **SQLite local**. Para Auth + Postgres más adelante:

```bash
# .env.local (nunca commitear) — ver .env.example
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # solo servidor
```

Cuando esas keys existan: schema Postgres + RLS + login (Fase 1b / 2). Hoy no hay proyecto Supabase configurado en este entorno.

## Qué no incluye

- Remodelar UI (modo bloqueado con mensaje claro)
- Auth / multi-usuario / snapshots de versión
- Plantas 2D / 3D / planner
- Scraping o “precios en vivo” de retailers
- PDF profesional, PWA completa, AI
- Despliegue VPS (previsto más adelante)

## Rutas principales

| Ruta | Uso |
|------|-----|
| `/` | Lista de proyectos + import/export catálogo |
| `/proyectos/nuevo` | Alta de proyecto (construir) |
| `/proyectos/[id]` | Edición: datos, ambientes, materiales, totales |
| `/api/projects` | CRUD proyectos |
| `/api/projects/[id]/export` | Descarga CSV presupuesto |
| `/api/catalog` | GET catálogo JSON; `?format=csv` export; POST import CSV |

## Stack

- Next.js 15 (App Router) + TypeScript strict + Tailwind 4
- Dominio: `src/domain/engines/*`
- Providers de precio: `src/providers/pricing/*` (Manual + CSV)
- SQLite vía `better-sqlite3` + Drizzle ORM → `data/obracalc.sqlite`
- Vitest para motores

## Arquitectura rápida

```
espacios → QuantityTakeoffEngine → qty
        → PricingEngine → líneas $
        → LaborCostEngine → labor
        → EstimationEngine → totales / breakdown
```
