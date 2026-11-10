using ADAPlusListManager.Core.Models;

namespace ADAPlusListManager.Core.Interfaces;

/// <summary>
/// Authentic MTP access. Must not rely solely on System.IO drive letters.
/// </summary>
public interface IMtpStorageAccess
{
    Task<bool> IsMtpAvailableAsync(string deviceId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MtpObjectInfo>> ListChildrenAsync(string deviceId, string? parentObjectId, CancellationToken cancellationToken = default);
    Task<MtpObjectInfo?> FindObjectByPathAsync(string deviceId, IEnumerable<string> pathSegments, CancellationToken cancellationToken = default);
    Task CopyObjectToLocalFileAsync(string deviceId, string objectId, string localFilePath, CancellationToken cancellationToken = default);
}
