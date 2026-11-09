# ObraCalc PR — Estimador de costos de construcción

App web **local-first** para estimar el presupuesto de una **casa nueva** en **Puerto Rico** (moneda **USD**). Interfaz en español (`es-PR`). Guarda proyectos en SQLite en tu máquina.

> Estimación orientativa — no es cotización de contratista. El catálogo semilla usa precios **DEMO/seed** de retail EE.UU./PR; **no hay scraping ni APIs “en vivo” fingidas**. Cada precio lleva **fuente** y **fecha**.

## Cómo correr en local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

La base SQLite se crea sola en `data/obracalc.sqlite` al primer request (incluido el catálogo semilla enriquecido). Si existía `data/casacalc.sqlite` del MVP, se copia automáticamente; los SKUs semilla nuevos se añaden sin pisar precios CSV/manual.

Otros comandos:

```bash
npm test                 # Vitest — engines + validación CSV
npm run build
npm start
npm run lint
npm run db:seed          # reinicializa SQLite + catálogo semilla DEMO
npm run catalog:import -- path/to/catalog.csv            # valida CSV
npm run catalog:import -- path/to/catalog.csv --apply    # valida + importa (source=csv)
```

## Catálogo y precios (Fase A)

| Pieza | Rol |
|-------|-----|
| Semilla `src/lib/catalog-seed.ts` | ~90 SKUs PR/US por categoría; `source=seed` + fecha DEMO |
| `ManualProvider` / `CsvImportProvider` | Adaptadores → registros con fuente + fecha |
| `PricingEngine` / `resolvePrice` | override > manual > csv > provider:* > seed |
| UI `/catalogo` | Filtro por categoría + búsqueda; muestra fuente/fecha |
| CSV import | Valida columnas, categorías y unidades; marca `source=csv` |

**No incluye:** scraping, HTTP a retailers, ni Supabase (sigue siendo SQLite local).

## Qué incluye

- Branding **ObraCalc PR**
- CRUD proyectos + ambientes + líneas de materiales
- Takeoff dimensional cuando el ambiente tiene m²
- Motores puros: QuantityTakeoff, Pricing, Labor, Estimation
- Catálogo filtrable + import/export CSV con validación
- Persistencia **SQLite** local
- i18n mínimo `es-PR`
- Tests Vitest

## Rutas principales

| Ruta | Uso |
|------|-----|
| `/` | Lista de proyectos + acceso a catálogo |
| `/catalogo` | Catálogo filtrable (categoría + búsqueda) + CSV |
| `/proyectos/nuevo` | Alta de proyecto (construir) |
| `/proyectos/[id]` | Edición: datos, ambientes, materiales, totales |
| `/api/catalog` | GET JSON; `?format=csv` export; POST import; `?validate=1` dry-run |

## Stack

- Next.js 15 (App Router) + TypeScript strict + Tailwind 4
- Dominio: `src/domain/engines/*`
- Providers de precio: `src/providers/pricing/*` (Manual + CSV + validate)
- SQLite vía `better-sqlite3` + Drizzle ORM → `data/obracalc.sqlite`
- Vitest
