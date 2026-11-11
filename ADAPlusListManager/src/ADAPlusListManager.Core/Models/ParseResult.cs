namespace ADAPlusListManager.Core.Models;

public sealed class ParseResult
{
    public bool Success { get; init; }
    public string? ErrorMessage { get; init; }
    public IReadOnlyList<InventoryItem> Items { get; init; } = Array.Empty<InventoryItem>();
    public IReadOnlyList<FieldMappingPreview> MappingPreview { get; init; } = Array.Empty<FieldMappingPreview>();
    public IReadOnlyList<string> Warnings { get; init; } = Array.Empty<string>();
    public bool IsDemo { get; init; }
}
