# Limitaciones conocidas

1. **Sin muestra completa real** de `lastRepo.json`: el mapeo de campos es provisional.
2. **Cantidades:** solo se muestran si el JSON las aporta de forma interpretable; nunca se inventan.
3. **WPF / WPD:** requieren Windows; en Linux solo compilan Core/Infrastructure/Tests.
4. **COM WPD:** implementado y listo para validar; no probado aún con hardware real en este agente.
5. **API ADA+:** no configurada (sin endpoints documentados).
6. **Archivos `.p12` / DB internas del Zebra:** fuera de alcance a propósito.
7. Si `lastRepo.json` no contiene el listado completo que necesita la tienda, la app debe informar la limitación; no obliga a reescanear como “solución”.
