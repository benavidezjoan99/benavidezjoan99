namespace ADAPlusListManager.Core.Models;

public sealed class ReportRequest
{
    public required InventoryList List { get; init; }
    public string? StoreIdentifier { get; init; }
    public string Title { get; init; } = "Listado de mercancía";
    public bool IncludeUnknownQuantityWarning { get; init; } = true;
}
