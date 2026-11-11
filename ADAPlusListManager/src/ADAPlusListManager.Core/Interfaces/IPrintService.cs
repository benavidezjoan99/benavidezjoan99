using ADAPlusListManager.Core.Models;

namespace ADAPlusListManager.Core.Interfaces;

public interface IPrintService
{
    IReadOnlyList<string> GetInstalledPrinters();
    Task PrintAsync(ReportRequest request, string? printerName = null, CancellationToken cancellationToken = default);
    Task ShowPrintPreviewAsync(ReportRequest request, CancellationToken cancellationToken = default);
}
