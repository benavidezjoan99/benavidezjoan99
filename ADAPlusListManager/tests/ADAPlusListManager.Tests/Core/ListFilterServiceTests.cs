using ADAPlusListManager.Core.Models;
using ADAPlusListManager.Core.Services;
using FluentAssertions;

namespace ADAPlusListManager.Tests.Core;

public class ListFilterServiceTests
{
    [Fact]
    public void Totals_Distinguish_Records_And_UnknownQuantities()
    {
        var svc = new ListFilterService();
        var items = new[]
        {
            new InventoryItem { Id = "1", Reference = "A", Quantity = 2 },
            new InventoryItem { Id = "2", Reference = "A", Quantity = null },
            new InventoryItem { Id = "3", Reference = "B", Quantity = 1 }
        };

        var totals = svc.CalculateTotals(items);
        totals.RecordCount.Should().Be(3);
        totals.UniqueReferenceCount.Should().Be(2);
        totals.VerifiedUnitTotal.Should().Be(3);
        totals.UnknownQuantityCount.Should().Be(1);
    }
}
