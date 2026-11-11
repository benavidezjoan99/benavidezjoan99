# Pruebas

```bash
dotnet test tests/ADAPlusListManager.Tests
```

Cubierto con mocks/xUnit: parser (válido/inválido/vacío/anidado/ceros/cantidades), filtros/totales, SQLite, exportación CSV/XLSX/PDF, detector USB mockeado.

**No ejecutado aquí:** detección física WPD ni transferencia MTP con EC50.
