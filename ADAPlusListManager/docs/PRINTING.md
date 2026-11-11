# Impresión y exportación

- **Impresión WPF:** `WpfPrintService` (`PrintDialog` + `FlowDocument`). Vista previa en ventana modal.
- **Excel:** ClosedXML; códigos como texto; mitigación de inyección de fórmulas.
- **CSV:** UTF-8 BOM; escape y mitigación `=`.
- **PDF:** QuestPDF (Community license).

Antes de imprimir, si hay cantidades desconocidas se muestra advertencia. Totales distinguen registros vs unidades verificadas.
