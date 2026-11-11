using ADAPlusListManager.Core.Interfaces;
using ADAPlusListManager.Core.Models;
using Microsoft.Extensions.Logging;

namespace ADAPlusListManager.Infrastructure.USB;

/// <summary>
/// LINUX/NON-WINDOWS STUB: WPD COM no está disponible fuera de Windows.
/// No simula un Zebra. Devuelve lista vacía con mensaje explícito.
/// </summary>
public sealed class UnsupportedPlatformUsbDeviceDetector : IUsbDeviceDetector
{
    private readonly ILogger<UnsupportedPlatformUsbDeviceDetector> _logger;

    public UnsupportedPlatformUsbDeviceDetector(ILogger<UnsupportedPlatformUsbDeviceDetector> logger)
    {
        _logger = logger;
    }

    public Task<IReadOnlyList<DeviceInfo>> DetectDevicesAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogWarning("Detección USB/WPD no soportada en esta plataforma ({OS}).", RuntimeInformationOs());
        return Task.FromResult<IReadOnlyList<DeviceInfo>>(Array.Empty<DeviceInfo>());
    }

    public Task<DeviceInfo?> FindZebraEc50Async(CancellationToken cancellationToken = default)
        => Task.FromResult<DeviceInfo?>(null);

    private static string RuntimeInformationOs() =>
        $"{System.Runtime.InteropServices.RuntimeInformation.OSDescription}";
}
