using ADAPlusListManager.Core.Models;

namespace ADAPlusListManager.Core.Interfaces;

public interface IListFilterService
{
    IReadOnlyList<InventoryItem> Filter(
        IEnumerable<InventoryItem> items,
        string? search,
        string? reference,
        string? sizeCode,
        string? colorCode);

    ListTotals CalculateTotals(IEnumerable<InventoryItem> items);
}
