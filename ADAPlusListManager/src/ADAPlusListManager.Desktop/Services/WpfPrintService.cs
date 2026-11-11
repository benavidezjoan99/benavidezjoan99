using System.Printing;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Media;
using ADAPlusListManager.Core.Exceptions;
using ADAPlusListManager.Core.Interfaces;
using ADAPlusListManager.Core.Models;

namespace ADAPlusListManager.Desktop.Services;

public sealed class WpfPrintService : IPrintService
{
    public IReadOnlyList<string> GetInstalledPrinters()
    {
        try
        {
            var server = new LocalPrintServer();
            return server.GetPrintQueues()
                .Select(q => q.Name)
                .OrderBy(n => n)
                .ToList();
        }
        catch
        {
            return Array.Empty<string>();
        }
    }

    public Task PrintAsync(ReportRequest request, string? printerName = null, CancellationToken cancellationToken = default)
    {
        return Application.Current.Dispatcher.InvokeAsync(() =>
        {
            var doc = BuildDocument(request);
            var dialog = new PrintDialog();
            if (!string.IsNullOrWhiteSpace(printerName))
            {
                try
                {
                    var server = new LocalPrintServer();
                    dialog.PrintQueue = server.GetPrintQueue(printerName);
                }
                catch
                {
                    throw new PrinterUnavailableException();
                }
            }

            if (dialog.ShowDialog() != true)
                return;

            doc.PageWidth = dialog.PrintableAreaWidth;
            doc.PageHeight = dialog.PrintableAreaHeight;
            dialog.PrintDocument(((IDocumentPaginatorSource)doc).DocumentPaginator, request.Title);
        }).Task;
    }

    public Task ShowPrintPreviewAsync(ReportRequest request, CancellationToken cancellationToken = default)
    {
        return Application.Current.Dispatcher.InvokeAsync(() =>
        {
            var doc = BuildDocument(request);
            var viewer = new FlowDocumentScrollViewer
            {
                Document = doc,
                VerticalScrollBarVisibility = ScrollBarVisibility.Auto
            };
            var window = new Window
            {
                Title = "Vista previa de impresión",
                Content = viewer,
                Width = 900,
                Height = 700,
                WindowStartupLocation = WindowStartupLocation.CenterOwner,
                Owner = Application.Current.MainWindow
            };
            window.ShowDialog();
        }).Task;
    }

    private static FlowDocument BuildDocument(ReportRequest request)
    {
        var doc = new FlowDocument
        {
            FontFamily = new FontFamily("Segoe UI"),
            FontSize = 12,
            PagePadding = new Thickness(40)
        };

        doc.Blocks.Add(new Paragraph(new Run("ADA+ List Manager")) { FontSize = 18, FontWeight = FontWeights.SemiBold });
        doc.Blocks.Add(new Paragraph(new Run(request.Title)));
        if (request.List.IsDemo)
        {
            doc.Blocks.Add(new Paragraph(new Run("MODO DEMOSTRACIÓN — no son escaneos reales"))
            {
                Foreground = Brushes.DarkOrange
            });
        }
        if (!string.IsNullOrWhiteSpace(request.StoreIdentifier))
            doc.Blocks.Add(new Paragraph(new Run($"Tienda: {request.StoreIdentifier}")));
        doc.Blocks.Add(new Paragraph(new Run($"Fecha: {DateTime.Now:yyyy-MM-dd HH:mm} | Fuente: {request.List.Source}")));

        if (request.IncludeUnknownQuantityWarning && request.List.UnknownQuantityCount > 0)
        {
            doc.Blocks.Add(new Paragraph(new Run(
                $"Advertencia: {request.List.UnknownQuantityCount} registros sin cantidad verificada."))
            {
                Foreground = Brushes.DarkOrange
            });
        }

        var table = new Table();
        for (var i = 0; i < 6; i++)
            table.Columns.Add(new TableColumn());
        table.RowGroups.Add(new TableRowGroup());

        var header = new TableRow();
        foreach (var h in new[] { "Referencia", "Código", "Descripción", "Talla", "Color", "Cantidad" })
        {
            header.Cells.Add(new TableCell(new Paragraph(new Run(h) { FontWeight = FontWeights.Bold })));
        }
        table.RowGroups[0].Rows.Add(header);

        foreach (var item in request.List.Items)
        {
            var row = new TableRow();
            row.Cells.Add(new TableCell(new Paragraph(new Run(item.Reference ?? item.Model ?? ""))));
            row.Cells.Add(new TableCell(new Paragraph(new Run(item.Barcode ?? ""))));
            row.Cells.Add(new TableCell(new Paragraph(new Run(item.Description ?? ""))));
            row.Cells.Add(new TableCell(new Paragraph(new Run(item.SizeCode ?? ""))));
            row.Cells.Add(new TableCell(new Paragraph(new Run(item.ColorCode ?? ""))));
            row.Cells.Add(new TableCell(new Paragraph(new Run(item.Quantity?.ToString() ?? "—"))));
            table.RowGroups[0].Rows.Add(row);
        }

        doc.Blocks.Add(table);
        doc.Blocks.Add(new Paragraph(new Run(
            $"Registros: {request.List.RecordCount} | Referencias únicas: {request.List.UniqueReferenceCount} | Unidades verificadas: {request.List.VerifiedUnitTotal?.ToString() ?? "n/d"} | Cantidades desconocidas: {request.List.UnknownQuantityCount}")));
        return doc;
    }
}
