namespace ADAPlusListManager.Core.Models;

public sealed class DiagnosticSnapshot
{
    public DateTimeOffset CapturedAt { get; init; } = DateTimeOffset.UtcNow;
    public IReadOnlyList<DeviceInfo> Devices { get; init; } = Array.Empty<DeviceInfo>();
    public IReadOnlyList<string> DetectedFiles { get; init; } = Array.Empty<string>();
    public IReadOnlyList<string> Messages { get; init; } = Array.Empty<string>();
    public IReadOnlyList<string> SanitizedErrors { get; init; } = Array.Empty<string>();
}
