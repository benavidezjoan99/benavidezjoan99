using System.Globalization;
using System.Text;
using ADAPlusListManager.Core.Interfaces;
using ADAPlusListManager.Core.Models;
using ClosedXML.Excel;
using Microsoft.Extensions.Logging;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ADAPlusListManager.Infrastructure.Exporters;

public sealed class ExportService : IExportService
{
    private readonly ILogger<ExportService> _logger;

    static ExportService()
    {
        // Community license for open-source / evaluation usage.
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public ExportService(ILogger<ExportService> logger)
    {
        _logger = logger;
    }

    public Task ExportExcelAsync(ReportRequest request, string outputPath, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        Directory.CreateDirectory(Path.GetDirectoryName(outputPath)!);

        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Listado");

        sheet.Cell(1, 1).Value = request.Title;
        sheet.Cell(2, 1).Value = "ADA+ List Manager";
        sheet.Cell(3, 1).Value = request.List.IsDemo ? "MODO DEMOSTRACIÓN" : "Importación";
        sheet.Cell(4, 1).Value = $"Generado: {DateTime.Now:yyyy-MM-dd HH:mm}";
        if (!string.IsNullOrWhiteSpace(request.StoreIdentifier))
            sheet.Cell(5, 1).Value = $"Tienda: {request.StoreIdentifier}";

        const int headerRow = 7;
        var headers = new[] { "Referencia", "Código", "Descripción", "Talla", "Color", "Cantidad" };
        for (var c = 0; c < headers.Length; c++)
            sheet.Cell(headerRow, c + 1).Value = headers[c];

        var row = headerRow + 1;
        foreach (var item in request.List.Items)
        {
            cancellationToken.ThrowIfCancellationRequested();
            sheet.Cell(row, 1).Value = item.Reference ?? item.Model ?? "";
            // Force barcode as text to preserve leading zeros / avoid formula injection.
            sheet.Cell(row, 2).SetValue(item.Barcode ?? "");
            sheet.Cell(row, 2).Style.NumberFormat.Format = "@";
            if (!string.IsNullOrEmpty(item.Barcode) && item.Barcode.StartsWith('='))
                sheet.Cell(row, 2).SetValue("'" + item.Barcode);
            sheet.Cell(row, 3).Value = item.Description ?? "";
            sheet.Cell(row, 4).Value = item.SizeCode ?? "";
            sheet.Cell(row, 5).Value = item.ColorCode ?? "";
            if (item.Quantity.HasValue)
                sheet.Cell(row, 6).Value = item.Quantity.Value;
            else
                sheet.Cell(row, 6).Value = "";
            row++;
        }

        row += 1;
        sheet.Cell(row, 1).Value = "Registros";
        sheet.Cell(row, 2).Value = request.List.RecordCount;
        row++;
        sheet.Cell(row, 1).Value = "Referencias únicas";
        sheet.Cell(row, 2).Value = request.List.UniqueReferenceCount;
        row++;
        sheet.Cell(row, 1).Value = "Unidades verificadas";
        sheet.Cell(row, 2).Value = request.List.VerifiedUnitTotal?.ToString(CultureInfo.InvariantCulture) ?? "(desconocido)";
        row++;
        sheet.Cell(row, 1).Value = "Cantidades desconocidas";
        sheet.Cell(row, 2).Value = request.List.UnknownQuantityCount;

        sheet.Columns().AdjustToContents();
        workbook.SaveAs(outputPath);
        _logger.LogInformation("Excel exportado a {Path}", outputPath);
        return Task.CompletedTask;
    }

    public Task ExportCsvAsync(ReportRequest request, string outputPath, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        Directory.CreateDirectory(Path.GetDirectoryName(outputPath)!);

        var sb = new StringBuilder();
        sb.AppendLine("Referencia,Codigo,Descripcion,Talla,Color,Cantidad");
        foreach (var item in request.List.Items)
        {
            cancellationToken.ThrowIfCancellationRequested();
            sb.Append(Escape(item.Reference ?? item.Model));
            sb.Append(',');
            sb.Append(Escape(item.Barcode));
            sb.Append(',');
            sb.Append(Escape(item.Description));
            sb.Append(',');
            sb.Append(Escape(item.SizeCode));
            sb.Append(',');
            sb.Append(Escape(item.ColorCode));
            sb.Append(',');
            sb.AppendLine(item.Quantity?.ToString(CultureInfo.InvariantCulture) ?? "");
        }

        File.WriteAllText(outputPath, sb.ToString(), new UTF8Encoding(encoderShouldEmitUTF8Identifier: true));
        return Task.CompletedTask;
    }

    public Task ExportPdfAsync(ReportRequest request, string outputPath, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        Directory.CreateDirectory(Path.GetDirectoryName(outputPath)!);

        var list = request.List;
        Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Column(col =>
                {
                    col.Item().Text("ADA+ List Manager").SemiBold().FontSize(16);
                    col.Item().Text(request.Title);
                    if (list.IsDemo)
                        col.Item().Text("MODO DEMOSTRACIÓN — no son escaneos reales").FontColor(Colors.Orange.Darken2);
                    if (!string.IsNullOrWhiteSpace(request.StoreIdentifier))
                        col.Item().Text($"Tienda: {request.StoreIdentifier}");
                    col.Item().Text($"Fecha: {DateTime.Now:yyyy-MM-dd HH:mm} | Fuente: {list.Source} | Id: {list.Id}");
                    if (request.IncludeUnknownQuantityWarning && list.UnknownQuantityCount > 0)
                        col.Item().Text($"Advertencia: {list.UnknownQuantityCount} registros sin cantidad verificada.")
                            .FontColor(Colors.Orange.Medium);
                });

                page.Content().PaddingVertical(10).Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(3);
                        columns.RelativeColumn(1);
                        columns.RelativeColumn(1);
                        columns.RelativeColumn(1);
                    });

                    table.Header(header =>
                    {
                        header.Cell().Text("Referencia").SemiBold();
                        header.Cell().Text("Código").SemiBold();
                        header.Cell().Text("Descripción").SemiBold();
                        header.Cell().Text("Talla").SemiBold();
                        header.Cell().Text("Color").SemiBold();
                        header.Cell().Text("Cant.").SemiBold();
                    });

                    foreach (var item in list.Items)
                    {
                        table.Cell().Text(item.Reference ?? item.Model ?? "");
                        table.Cell().Text(item.Barcode ?? "");
                        table.Cell().Text(item.Description ?? "");
                        table.Cell().Text(item.SizeCode ?? "");
                        table.Cell().Text(item.ColorCode ?? "");
                        table.Cell().Text(item.Quantity?.ToString(CultureInfo.InvariantCulture) ?? "—");
                    }
                });

                page.Footer().AlignCenter().Text(text =>
                {
                    text.Span($"Registros: {list.RecordCount} | Refs: {list.UniqueReferenceCount} | Unidades verif.: {list.VerifiedUnitTotal?.ToString(CultureInfo.InvariantCulture) ?? "n/d"} | Desconocidas: {list.UnknownQuantityCount} | Página ");
                    text.CurrentPageNumber();
                    text.Span(" / ");
                    text.TotalPages();
                });
            });
        }).GeneratePdf(outputPath);

        return Task.CompletedTask;
    }

    private static string Escape(string? value)
    {
        value ??= "";
        if (value.Contains('"') || value.Contains(',') || value.Contains('\n'))
            return "\"" + value.Replace("\"", "\"\"") + "\"";
        // Mitigate CSV formula injection
        if (value.StartsWith('=') || value.StartsWith('+') || value.StartsWith('-') || value.StartsWith('@'))
            return "\"" + value.Replace("\"", "\"\"") + "\"";
        return value;
    }
}
