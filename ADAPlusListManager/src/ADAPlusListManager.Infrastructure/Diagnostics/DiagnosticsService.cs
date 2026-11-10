using System.Text;
using ADAPlusListManager.Core.Interfaces;
using ADAPlusListManager.Core.Models;
using Microsoft.Extensions.Logging;

namespace ADAPlusListManager.Infrastructure.Diagnostics;

public sealed class DiagnosticsService : IDiagnosticsService
{
    private readonly IUsbDeviceDetector _detector;
    private readonly ILogger<DiagnosticsService> _logger;
    private readonly List<string> _messages = new();
    private readonly List<string> _errors = new();
    private readonly object _gate = new();

    public DiagnosticsService(IUsbDeviceDetector detector, ILogger<DiagnosticsService> logger)
    {
        _detector = detector;
        _logger = logger;
    }

    public void AddMessage(string message)
    {
        lock (_gate) _messages.Add($"{DateTimeOffset.Now:O} {message}");
        _logger.LogInformation("{Message}", message);
    }

    public void AddError(string sanitizedError)
    {
        lock (_gate) _errors.Add($"{DateTimeOffset.Now:O} {sanitizedError}");
        _logger.LogWarning("{Error}", sanitizedError);
    }

    public async Task<DiagnosticSnapshot> CaptureAsync(CancellationToken cancellationToken = default)
    {
        IReadOnlyList<DeviceInfo> devices;
        try
        {
            devices = await _detector.DetectDevicesAsync(cancellationToken).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            devices = Array.Empty<DeviceInfo>();
            AddError("Error al capturar dispositivos: " + ex.GetType().Name);
        }

        lock (_gate)
        {
            return new DiagnosticSnapshot
            {
                Devices = devices.ToList(),
                DetectedFiles = Array.Empty<string>(),
                Messages = _messages.ToList(),
                SanitizedErrors = _errors.ToList()
            };
        }
    }

    public async Task ExportSanitizedAsync(string outputPath, CancellationToken cancellationToken = default)
    {
        var snap = await CaptureAsync(cancellationToken).ConfigureAwait(false);
        var sb = new StringBuilder();
        sb.AppendLine("ADA+ List Manager — Diagnóstico sanitizado");
        sb.AppendLine(snap.CapturedAt.ToString("O"));
        sb.AppendLine();
        sb.AppendLine("Dispositivos:");
        foreach (var d in snap.Devices)
        {
            sb.AppendLine($"- Name={d.FriendlyName}; Model={d.Model}; Manufacturer={d.Manufacturer}; EC50={d.IsLikelyZebraEc50}; State={d.State}");
        }
        sb.AppendLine();
        sb.AppendLine("Mensajes:");
        foreach (var m in snap.Messages) sb.AppendLine(m);
        sb.AppendLine();
        sb.AppendLine("Errores:");
        foreach (var e in snap.SanitizedErrors) sb.AppendLine(e);

        Directory.CreateDirectory(Path.GetDirectoryName(outputPath)!);
        await File.WriteAllTextAsync(outputPath, sb.ToString(), cancellationToken).ConfigureAwait(false);
    }
}
