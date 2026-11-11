# USB / MTP (WPD)

## Enfoque

Acceso mediante **Windows Portable Devices (COM)**:

- `PortableDeviceManager` — enumeración
- `PortableDevice` / `IPortableDeviceContent` — árbol de objetos
- `IPortableDeviceResources.GetStream` — copia de solo lectura a disco local

**No** se usa `Directory.GetFiles` sobre letras de unidad como único mecanismo MTP.

## Plataformas

| Plataforma | Clase | Comportamiento |
|---|---|---|
| Windows | `WindowsWpdDeviceDetector`, `WindowsWpdMtpStorageAccess` | COM real |
| Linux/otros | `UnsupportedPlatformUsbDeviceDetector`, `UnsupportedPlatformMtpStorageAccess` | Lista vacía / `PlatformNotSupportedException` — **sin simular Zebra** |

## Rutas buscadas

- `Internal shared storage/Mango/lastRepo.json`
- Variante ES `Almacenamiento compartido interno/Mango`
- Recorrido destorages de primer nivel buscando carpeta `Mango`

## Validación pendiente

La integración COM debe validarse en la Toshiba con un EC50 físico. Este entorno Linux **no** ejecutó pruebas USB reales.
