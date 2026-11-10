# Proceso de importación

1. Origen: MTP (`lastRepo.json`), archivo local o DEMO.
2. Copia a carpeta temporal de la aplicación (solo lectura del dispositivo).
3. Hash SHA-256; si ya existe importación exitosa no-demo con el mismo hash → `DuplicateSkipped`.
4. Parseo flexible + previsualización de mapeo.
5. Persistencia SQLite solo si hay registros válidos.
6. Mensaje de éxito únicamente tras comprobar registros importados.
