# ADA+ List Manager

Aplicación de escritorio Windows (WPF) para recuperar, visualizar, filtrar, exportar e imprimir listados de artículos escaneados en dispositivos Zebra EC50 usados con ADA+/Mango en tienda.

**Nombre provisional.** No incluye logos ni marcas gráficas propietarias.

## Requisitos

| Componente | Notas |
|---|---|
| **SDK / runtime** | **.NET 8 LTS** (`net8.0` / `net8.0-windows`) |
| SO de ejecución | Windows 10/11 (x64; x86 posible con publish específico) |
| Hardware opcional | Zebra EC50 conectado por USB en modo transferencia de archivos (MTP) |

### Por qué .NET 8 (no .NET 10)

En el entorno de desarrollo/CI actual solo está disponible el SDK **8.0.x**. .NET 8 es LTS y maximiza compatibilidad con equipos Toshiba de tienda. Si más adelante el parque Windows y el SDK lo permiten, se puede evaluar subir de TFM.

## Estructura

```text
ADAPlusListManager/
  src/ADAPlusListManager.Desktop      # WPF + MVVM (solo Windows)
  src/ADAPlusListManager.Core         # Modelos, interfaces, filtros
  src/ADAPlusListManager.Infrastructure # WPD/MTP, parser, SQLite, export
  tests/ADAPlusListManager.Tests
  docs/
  samples/demo/
```

## Compilar

```bash
# Librerías y tests (Linux o Windows)
dotnet build src/ADAPlusListManager.Core
dotnet build src/ADAPlusListManager.Infrastructure
dotnet test tests/ADAPlusListManager.Tests

# Cliente WPF (solo Windows)
dotnet build src/ADAPlusListManager.Desktop
dotnet run --project src/ADAPlusListManager.Desktop
```

En Linux, el proyecto Desktop (`net8.0-windows` + WPF) **no compila**. Core, Infrastructure y Tests sí.

## Flujo de uso (Windows + Zebra)

1. Conectar el EC50 por USB y desbloquearlo (modo transferencia de archivos).
2. Abrir ADA+ List Manager.
3. **Dispositivos → Detectar Zebra → Explorar almacenamiento**.
4. **Obtener listados → Obtener desde Zebra** (o importar JSON / DEMO).
5. Revisar en **Listados**, exportar/imprimir en **Reportes**.

## Seguridad (resumen)

- Solo lectura sobre el Zebra (nunca escribe/borra/renombra en `Mango`).
- No toca archivos `.p12` ni credenciales.
- No hay API ADA+ inventada; el conector queda *no configurado*.
- El modo DEMO está etiquetado explícitamente.

## Documentación

Ver carpeta [`docs/`](docs/).

## Limitaciones conocidas

Ver [`docs/KNOWN_LIMITATIONS.md`](docs/KNOWN_LIMITATIONS.md).
