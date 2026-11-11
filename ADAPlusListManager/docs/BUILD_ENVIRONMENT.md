# Entorno de build de este agente

- SO del agente: Linux (Ubuntu)
- SDK instalado: **.NET 8.0.428** (`dotnet --list-sdks`)
- Decisión de TFM: `net8.0` / `net8.0-windows` (** .NET 8 LTS **)
- Motivo frente a .NET 10: el SDK 10 no está presente en el agente; .NET 8 LTS es la opción más segura para Toshiba/POS.

## Qué compiló aquí

| Proyecto | Resultado en Linux |
|---|---|
| `ADAPlusListManager.Core` | OK (Release) |
| `ADAPlusListManager.Infrastructure` | OK (Release) |
| `ADAPlusListManager.Tests` | OK — **11/11** tests Passed |
| `ADAPlusListManager.Desktop` (WPF) | **No compilable aquí** — `NETSDK1100` (target Windows). Requiere máquina Windows con workload/packs WPF. |

El código fuente Desktop (XAML + ViewModels + DI + impresión WPF) está completo en el repositorio.

## Comandos verificados en este agente

```bash
dotnet build src/ADAPlusListManager.Core -c Release
dotnet build src/ADAPlusListManager.Infrastructure -c Release
dotnet test tests/ADAPlusListManager.Tests -c Release
```

## En Windows (validación pendiente de hardware)

```bash
dotnet build ADAPlusListManager.sln -c Release
dotnet run --project src/ADAPlusListManager.Desktop
```

No se ejecutaron pruebas físicas con Zebra EC50 USB/MTP en este agente.
