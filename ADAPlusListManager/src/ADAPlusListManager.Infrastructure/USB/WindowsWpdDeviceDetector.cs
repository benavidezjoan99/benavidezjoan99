using System.Runtime.InteropServices;
using ADAPlusListManager.Core.Exceptions;
using ADAPlusListManager.Core.Interfaces;
using ADAPlusListManager.Core.Models;
using ADAPlusListManager.Infrastructure.MTP;
using System.Runtime.Versioning;
using Microsoft.Extensions.Logging;

namespace ADAPlusListManager.Infrastructure.USB;

/// <summary>
/// Real Windows Portable Devices enumeration via COM (PortableDeviceManager).
/// On non-Windows platforms this type is not registered; see <see cref="UnsupportedPlatformUsbDeviceDetector"/>.
/// </summary>
[SupportedOSPlatform("windows")]
public sealed class WindowsWpdDeviceDetector : IUsbDeviceDetector
{
    private readonly ILogger<WindowsWpdDeviceDetector> _logger;

    public WindowsWpdDeviceDetector(ILogger<WindowsWpdDeviceDetector> logger)
    {
        _logger = logger;
    }

    public Task<IReadOnlyList<DeviceInfo>> DetectDevicesAsync(CancellationToken cancellationToken = default)
    {
        EnsureWindows();
        cancellationToken.ThrowIfCancellationRequested();

        var results = new List<DeviceInfo>();
        try
        {
            var manager = (IPortableDeviceManager)new PortableDeviceManagerCom();
            manager.RefreshDeviceList();

            uint count = 0;
            manager.GetDevices(null, ref count);
            if (count == 0)
            {
                return Task.FromResult<IReadOnlyList<DeviceInfo>>(results);
            }

            var ids = new string[count];
            manager.GetDevices(ids, ref count);

            for (uint i = 0; i < count; i++)
            {
                cancellationToken.ThrowIfCancellationRequested();
                var id = ids[i];
                if (string.IsNullOrWhiteSpace(id)) continue;

                var friendly = ReadManagerString(manager.GetDeviceFriendlyName, id);
                var manufacturer = ReadManagerString(manager.GetDeviceManufacturer, id);
                var description = ReadManagerString(manager.GetDeviceDescription, id);

                var model = description;
                var isEc50 = LooksLikeZebraEc50(friendly, manufacturer, description, id);

                results.Add(new DeviceInfo
                {
                    Id = id,
                    WindowsDeviceId = id,
                    FriendlyName = friendly ?? description ?? id,
                    Manufacturer = manufacturer,
                    Model = model,
                    IsLikelyZebraEc50 = isEc50,
                    MtpAvailable = true, // presence in WPD list implies portable/MTP-capable stack
                    SharedStorageAvailable = false, // confirmed only after content open
                    State = DeviceConnectionState.Detected,
                    LastDetectedAt = DateTimeOffset.UtcNow,
                    StatusMessage = isEc50
                        ? "Dispositivo encontrado (posible Zebra EC50)."
                        : "Dispositivo portátil detectado."
                });
            }
        }
        catch (COMException ex)
        {
            _logger.LogError(ex, "Error COM al enumerar dispositivos WPD.");
            throw new AdaPlusException(
                "No se pudieron enumerar dispositivos portátiles. Comprueba que el servicio WPD de Windows esté disponible.",
                ex.Message,
                ex);
        }

        return Task.FromResult<IReadOnlyList<DeviceInfo>>(results);
    }

    public async Task<DeviceInfo?> FindZebraEc50Async(CancellationToken cancellationToken = default)
    {
        var devices = await DetectDevicesAsync(cancellationToken).ConfigureAwait(false);
        return devices.FirstOrDefault(d => d.IsLikelyZebraEc50)
               ?? devices.FirstOrDefault(d =>
                   (d.FriendlyName?.Contains("EC50", StringComparison.OrdinalIgnoreCase) ?? false));
    }

    private static bool LooksLikeZebraEc50(string? friendly, string? manufacturer, string? description, string id)
    {
        var blob = $"{friendly}|{manufacturer}|{description}|{id}";
        return blob.Contains("EC50", StringComparison.OrdinalIgnoreCase)
               || blob.Contains("EC500", StringComparison.OrdinalIgnoreCase)
               || (blob.Contains("Zebra", StringComparison.OrdinalIgnoreCase)
                   && blob.Contains("EC", StringComparison.OrdinalIgnoreCase));
    }

    private delegate void ManagerStringReader(string id, IntPtr buffer, ref uint length);

    private static string? ReadManagerString(ManagerStringReader reader, string deviceId)
    {
        uint length = 0;
        reader(deviceId, IntPtr.Zero, ref length);
        if (length == 0) return null;

        var ptr = Marshal.AllocCoTaskMem(checked((int)length * 2));
        try
        {
            reader(deviceId, ptr, ref length);
            return Marshal.PtrToStringUni(ptr);
        }
        finally
        {
            Marshal.FreeCoTaskMem(ptr);
        }
    }

    private static void EnsureWindows()
    {
        if (!OperatingSystem.IsWindows())
        {
            throw new PlatformNotSupportedException(
                "WindowsWpdDeviceDetector requiere Windows. En Linux se usa UnsupportedPlatformUsbDeviceDetector.");
        }
    }
}
