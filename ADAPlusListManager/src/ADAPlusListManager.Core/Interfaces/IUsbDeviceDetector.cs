using ADAPlusListManager.Core.Models;

namespace ADAPlusListManager.Core.Interfaces;

public interface IUsbDeviceDetector
{
    Task<IReadOnlyList<DeviceInfo>> DetectDevicesAsync(CancellationToken cancellationToken = default);
    Task<DeviceInfo?> FindZebraEc50Async(CancellationToken cancellationToken = default);
}
