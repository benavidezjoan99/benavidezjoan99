using ADAPlusListManager.Core.Interfaces;
using ADAPlusListManager.Core.Models;

namespace ADAPlusListManager.Core.Services;

public sealed class ListFilterService : IListFilterService
{
    public IReadOnlyList<InventoryItem> Filter(
        IEnumerable<InventoryItem> items,
        string? search,
        string? reference,
        string? sizeCode,
        string? colorCode)
    {
        IEnumerable<InventoryItem> query = items;

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            query = query.Where(i =>
                Contains(i.Barcode, s) ||
                Contains(i.Reference, s) ||
                Contains(i.Description, s) ||
                Contains(i.Model, s) ||
                Contains(i.SizeCode, s) ||
                Contains(i.ColorCode, s));
        }

        if (!string.IsNullOrWhiteSpace(reference))
        {
            var r = reference.Trim();
            query = query.Where(i => Contains(i.Reference, r) || Contains(i.Model, r));
        }

        if (!string.IsNullOrWhiteSpace(sizeCode))
        {
            var z = sizeCode.Trim();
            query = query.Where(i => string.Equals(i.SizeCode, z, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(colorCode))
        {
            var c = colorCode.Trim();
            query = query.Where(i => string.Equals(i.ColorCode, c, StringComparison.OrdinalIgnoreCase));
        }

        return query.ToList();
    }

    public ListTotals CalculateTotals(IEnumerable<InventoryItem> items)
    {
        var list = items.ToList();
        var withQty = list.Where(i => i.Quantity.HasValue).ToList();
        return new ListTotals
        {
            RecordCount = list.Count,
            UniqueReferenceCount = list
                .Select(i => i.Reference)
                .Where(r => !string.IsNullOrWhiteSpace(r))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Count(),
            VerifiedUnitTotal = withQty.Count == 0 ? null : withQty.Sum(i => i.Quantity!.Value),
            UnknownQuantityCount = list.Count(i => !i.Quantity.HasValue)
        };
    }

    private static bool Contains(string? value, string search) =>
        !string.IsNullOrEmpty(value) &&
        value.Contains(search, StringComparison.OrdinalIgnoreCase);
}
