namespace ADAPlusListManager.Core.Models;

public sealed class FieldMappingPreview
{
    public required string OriginalField { get; init; }
    public string? OriginalValue { get; init; }
    public required string TargetColumn { get; init; }
    public string? InterpretedValue { get; init; }
    public string ValidationStatus { get; init; } = "provisional";
    public string? Notes { get; init; }
}
