using ADAPlusListManager.Core.Models;

namespace ADAPlusListManager.Core.Interfaces;

public interface IInventoryRepository
{
    Task InitializeAsync(CancellationToken cancellationToken = default);
    Task SaveDeviceAsync(DeviceInfo device, CancellationToken cancellationToken = default);
    Task<string> SaveImportSessionAsync(ImportSession session, InventoryList list, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ImportSession>> GetImportHistoryAsync(int limit = 100, CancellationToken cancellationToken = default);
    Task<InventoryList?> GetInventoryListAsync(string listId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<InventoryList>> GetInventoryListsAsync(CancellationToken cancellationToken = default);
    Task<bool> ExistsByFileHashAsync(string sha256, CancellationToken cancellationToken = default);
    Task SaveSettingsAsync(ApplicationSettings settings, CancellationToken cancellationToken = default);
    Task<ApplicationSettings> GetSettingsAsync(CancellationToken cancellationToken = default);
}
