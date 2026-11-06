# CasaCalc PR — Calculadora de gastos para construir

App web **local-first** para estimar el presupuesto de una **casa nueva** en **Puerto Rico** (moneda **USD**). Interfaz en español. Guarda proyectos en SQLite en tu máquina.

> Estimación orientativa — no es cotización de contratista. El catálogo semilla usa precios placeholder de retail EE.UU./PR; no hay scraping ni APIs de ferreterías.

## Cómo correr en local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

La base SQLite se crea sola en `data/casacalc.sqlite` al primer request (incluido el catálogo semilla).

Otros comandos:

```bash
npm run build   # build de producción
npm start       # servir el build
npm run lint
```

## Qué incluye este MVP

- Crear / editar proyecto (nombre, municipio PR, m², fecha, % mano de obra, % imprevistos)
- Ambientes con cantidades y m²
- Materiales sugeridos por ambiente desde catálogo semilla
- Precios unitarios y cantidades editables
- Totales: materiales, mano de obra, imprevistos, gran total, USD/m²
- Persistencia SQLite
- Export CSV del presupuesto

## Qué no incluye (aún)

- **Remodelar:** el campo `mode` en proyectos admite la extensión; la UI/flujo de remodelación llega después. Ver `src/lib/modes.ts`.
- Plantas 2D/3D
- Scraping o APIs en vivo de retailers
- Despliegue en VPS (previsto más adelante; mismo stack Node + SQLite)

## Rutas principales

| Ruta | Uso |
|------|-----|
| `/` | Lista de proyectos |
| `/proyectos/nuevo` | Alta de proyecto (construir) |
| `/proyectos/[id]` | Edición: datos, ambientes, materiales, totales |
| `/api/projects` | CRUD proyectos |
| `/api/projects/[id]/export` | Descarga CSV |
| `/api/catalog` | Catálogo semilla |

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- SQLite vía `better-sqlite3` + Drizzle ORM
- Datos locales en `data/` (ignorado por git)

## Notas de producto

- Prioridad actual: **construir**. Remodelar = fase siguiente.
- Región: Puerto Rico · USD.
- Despliegue en VPS propio: más adelante (Docker / Node + reverse proxy).
