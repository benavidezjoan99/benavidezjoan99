using ADAPlusListManager.Core.Exceptions;
using ADAPlusListManager.Core.Interfaces;
using ADAPlusListManager.Core.Models;

namespace ADAPlusListManager.Infrastructure.Printing;

/// <summary>
/// Fallback when WPF print stack is unavailable (e.g. unit tests / non-desktop hosts).
/// Real printing is implemented in Desktop as WpfPrintService.
/// </summary>
public sealed class NullPrintService : IPrintService
{
    public IReadOnlyList<string> GetInstalledPrinters() => Array.Empty<string>();

    public Task PrintAsync(ReportRequest request, string? printerName = null, CancellationToken cancellationToken = default)
        => throw new PrinterUnavailableException();

    public Task ShowPrintPreviewAsync(ReportRequest request, CancellationToken cancellationToken = default)
        => throw new PrinterUnavailableException();
}
