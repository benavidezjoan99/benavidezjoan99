# Descubrimiento de esquema JSON

Campos observados visualmente en `lastRepo.json` (sin copia completa autorizada aún):

| Campo | Uso provisional |
|---|---|
| `EAN.EANCOD` / `EANCOD` | Código de barras (texto) |
| `EAN.EANMODE` / `EANMODE` | Referencia posible |
| `EAN.EANTALL` | Código de talla (no S/M/L comercial) |
| `EAN.EANCOL` | Código de color |
| `EAN.EANCANT` | Cantidad posible; **null/ausente = desconocida** |
| `Modelo.MODDESC` | Descripción |
| `Modelo.MODMODE` | Modelo/referencia |

El parser (`MangoJsonParser`) acepta array raíz, objeto con `items`/`data`, u objeto único. Conserva campos originales aplanados. **Nunca asigna cantidad 1 por defecto.**
