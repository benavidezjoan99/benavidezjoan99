using ADAPlusListManager.Core.Models;

namespace ADAPlusListManager.Core.Interfaces;

public interface IFileImporter
{
    Task<ImportSession> ImportFromLocalFileAsync(string localFilePath, bool isDemo, CancellationToken cancellationToken = default);
    Task<ImportSession> ImportLastRepoFromDeviceAsync(string deviceId, CancellationToken cancellationToken = default);
}
