using ADAPlusListManager.Core.Interfaces;
using ADAPlusListManager.Core.Models;
using Microsoft.Extensions.Logging;

namespace ADAPlusListManager.Infrastructure.MTP;

/// <summary>
/// LINUX/NON-WINDOWS STUB: no simula almacenamiento MTP.
/// </summary>
public sealed class UnsupportedPlatformMtpStorageAccess : IMtpStorageAccess
{
    private readonly ILogger<UnsupportedPlatformMtpStorageAccess> _logger;

    public UnsupportedPlatformMtpStorageAccess(ILogger<UnsupportedPlatformMtpStorageAccess> logger)
    {
        _logger = logger;
    }

    public Task<bool> IsMtpAvailableAsync(string deviceId, CancellationToken cancellationToken = default)
    {
        _logger.LogWarning("MTP no soportado fuera de Windows.");
        return Task.FromResult(false);
    }

    public Task<IReadOnlyList<MtpObjectInfo>> ListChildrenAsync(string deviceId, string? parentObjectId, CancellationToken cancellationToken = default)
        => Task.FromResult<IReadOnlyList<MtpObjectInfo>>(Array.Empty<MtpObjectInfo>());

    public Task<MtpObjectInfo?> FindObjectByPathAsync(string deviceId, IEnumerable<string> pathSegments, CancellationToken cancellationToken = default)
        => Task.FromResult<MtpObjectInfo?>(null);

    public Task CopyObjectToLocalFileAsync(string deviceId, string objectId, string localFilePath, CancellationToken cancellationToken = default)
        => throw new PlatformNotSupportedException("Copia MTP solo disponible en Windows con WPD.");
}
