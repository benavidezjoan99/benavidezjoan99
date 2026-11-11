using ADAPlusListManager.Core.Models;

namespace ADAPlusListManager.Core.Interfaces;

public interface IExportService
{
    Task ExportExcelAsync(ReportRequest request, string outputPath, CancellationToken cancellationToken = default);
    Task ExportCsvAsync(ReportRequest request, string outputPath, CancellationToken cancellationToken = default);
    Task ExportPdfAsync(ReportRequest request, string outputPath, CancellationToken cancellationToken = default);
}
