# Despliegue

En una máquina Windows con SDK:

```bash
dotnet publish src/ADAPlusListManager.Desktop -c Release -r win-x64 --self-contained true -o publish/win-x64
```

Para Toshiba x86 (si aplica):

```bash
dotnet publish src/ADAPlusListManager.Desktop -c Release -r win-x86 --self-contained true -o publish/win-x86
```

No requiere Visual Studio en el equipo destino si se publica self-contained. La instalación no debe modificar firewall, registro ni el POS sin autorización.
