using ADAPlusListManager.Core.Models;

namespace ADAPlusListManager.Core.Interfaces;

public interface IDiagnosticsService
{
    void AddMessage(string message);
    void AddError(string sanitizedError);
    Task<DiagnosticSnapshot> CaptureAsync(CancellationToken cancellationToken = default);
    Task ExportSanitizedAsync(string outputPath, CancellationToken cancellationToken = default);
}
