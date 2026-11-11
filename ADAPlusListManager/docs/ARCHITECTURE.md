# Arquitectura

## Capas

- **Desktop (WPF / MVVM):** UI en español, navegación lateral, ViewModels con CommunityToolkit.Mvvm, impresión WPF.
- **Core:** modelos normalizados, contratos (`IUsbDeviceDetector`, `IMtpStorageAccess`, `IMangoJsonParser`, …), validación y filtros.
- **Infrastructure:** WPD COM (Windows), stubs explícitos no-Windows, parser JSON, ClosedXML/CSV/QuestPDF, SQLite, diagnóstico.

## DI

`AddAdaPlusInfrastructure()` registra implementaciones reales en Windows y stubs documentados fuera de Windows. Desktop sustituye `IPrintService` por `WpfPrintService`.

## Independencia de adquisición

La UI no depende de MTP: puede importar desde dispositivo, archivo local o DEMO. Un futuro `IAuthorizedAdaConnector` configurado no requiere reescribir ViewModels de listados/exportación.
