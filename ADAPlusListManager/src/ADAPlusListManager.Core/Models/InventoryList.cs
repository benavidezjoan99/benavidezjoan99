namespace ADAPlusListManager.Core.Models;

public sealed class InventoryList
{
    public required string Id { get; init; }
    public required string Name { get; set; }
    public DateTimeOffset CreatedAt { get; init; } = DateTimeOffset.UtcNow;
    public string ListType { get; init; } = "Reposicion";
    public string Source { get; init; } = "unknown";
    public string Status { get; set; } = "imported";
    public bool IsDemo { get; init; }
    public IList<InventoryItem> Items { get; init; } = new List<InventoryItem>();

    public int RecordCount => Items.Count;
    public int UniqueReferenceCount => Items
        .Select(i => i.Reference)
        .Where(r => !string.IsNullOrWhiteSpace(r))
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .Count();
    public decimal? VerifiedUnitTotal
    {
        get
        {
            var withQty = Items.Where(i => i.Quantity.HasValue).ToList();
            if (withQty.Count == 0) return null;
            return withQty.Sum(i => i.Quantity!.Value);
        }
    }
    public int UnknownQuantityCount => Items.Count(i => !i.Quantity.HasValue);
}
