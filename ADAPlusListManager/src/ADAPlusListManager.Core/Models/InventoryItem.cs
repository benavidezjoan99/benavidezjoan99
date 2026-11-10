namespace ADAPlusListManager.Core.Models;

/// <summary>
/// Normalized inventory row derived from ADA+/Mango JSON.
/// Quantities are never invented: null means unknown/unverified.
/// Barcodes stay as text to preserve leading zeros.
/// </summary>
public sealed class InventoryItem
{
    public required string Id { get; init; }
    public string? Barcode { get; init; }
    public string? Reference { get; init; }
    public string? Model { get; init; }
    public string? Description { get; init; }
    public string? SizeCode { get; init; }
    public string? ColorCode { get; init; }
    public decimal? Quantity { get; init; }
    public DateTime? ScanDate { get; init; }
    public string? SourceFile { get; init; }
    public string? RawJsonFragment { get; init; }
    public bool IsDemoData { get; init; }
    public IReadOnlyDictionary<string, string?> OriginalFields { get; init; }
        = new Dictionary<string, string?>();
}
