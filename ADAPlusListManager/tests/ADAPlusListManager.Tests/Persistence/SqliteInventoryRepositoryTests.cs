using ADAPlusListManager.Core.Models;
using ADAPlusListManager.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;

namespace ADAPlusListManager.Tests.Persistence;

public class SqliteInventoryRepositoryTests
{
    [Fact]
    public async Task Save_And_Reload_List_And_PreventDuplicateHash()
    {
        var db = Path.Combine(Path.GetTempPath(), "ada-plus-tests", Guid.NewGuid().ToString("N"), "test.db");
        var repo = new SqliteInventoryRepository(db, NullLogger<SqliteInventoryRepository>.Instance);
        await repo.InitializeAsync();

        var list = new InventoryList
        {
            Id = Guid.NewGuid().ToString("N"),
            Name = "Lista",
            Items = { new InventoryItem { Id = "i1", Barcode = "01", Reference = "A", Quantity = 1 } }
        };
        var session = new ImportSession
        {
            Id = Guid.NewGuid().ToString("N"),
            FileName = "lastRepo.json",
            FileHashSha256 = "ABC123",
            Status = ImportSessionStatus.Succeeded,
            RecordCount = 1,
            InventoryListId = list.Id
        };

        await repo.SaveImportSessionAsync(session, list);
        (await repo.ExistsByFileHashAsync("ABC123")).Should().BeTrue();

        var loaded = await repo.GetInventoryListAsync(list.Id);
        loaded.Should().NotBeNull();
        loaded!.Items.Should().ContainSingle(i => i.Barcode == "01" && i.Quantity == 1);

        var history = await repo.GetImportHistoryAsync();
        history.Should().Contain(h => h.Id == session.Id);
    }
}
