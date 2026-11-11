using System.Runtime.InteropServices;
using System.Runtime.InteropServices.ComTypes;
using ADAPlusListManager.Core.Exceptions;
using ADAPlusListManager.Core.Interfaces;
using ADAPlusListManager.Core.Models;
using System.Runtime.Versioning;
using Microsoft.Extensions.Logging;

namespace ADAPlusListManager.Infrastructure.MTP;

/// <summary>
/// Read-only MTP access through Windows Portable Devices COM.
/// Never writes, deletes, renames, or moves objects on the device.
/// </summary>
[SupportedOSPlatform("windows")]
public sealed class WindowsWpdMtpStorageAccess : IMtpStorageAccess
{
    private static readonly PropertyKey ResourceDefault = new(new Guid("E81E79BE-34F0-41BF-B539-F565A0A5C3AC"), 0);

    private readonly ILogger<WindowsWpdMtpStorageAccess> _logger;

    public WindowsWpdMtpStorageAccess(ILogger<WindowsWpdMtpStorageAccess> logger)
    {
        _logger = logger;
    }

    public Task<bool> IsMtpAvailableAsync(string deviceId, CancellationToken cancellationToken = default)
    {
        EnsureWindows();
        try
        {
            using var session = OpenSession(deviceId);
            return Task.FromResult(session.Content != null);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "MTP no disponible para {DeviceId}", SanitizeId(deviceId));
            return Task.FromResult(false);
        }
    }

    public Task<IReadOnlyList<MtpObjectInfo>> ListChildrenAsync(
        string deviceId,
        string? parentObjectId,
        CancellationToken cancellationToken = default)
    {
        EnsureWindows();
        cancellationToken.ThrowIfCancellationRequested();
        var parent = string.IsNullOrWhiteSpace(parentObjectId) ? "DEVICE" : parentObjectId;
        using var session = OpenSession(deviceId);
        var list = EnumerateChildren(session, parent, cancellationToken);
        return Task.FromResult<IReadOnlyList<MtpObjectInfo>>(list);
    }

    public async Task<MtpObjectInfo?> FindObjectByPathAsync(
        string deviceId,
        IEnumerable<string> pathSegments,
        CancellationToken cancellationToken = default)
    {
        EnsureWindows();
        string? currentParent = "DEVICE";
        MtpObjectInfo? current = null;

        foreach (var segment in pathSegments)
        {
            cancellationToken.ThrowIfCancellationRequested();
            var children = await ListChildrenAsync(deviceId, currentParent, cancellationToken).ConfigureAwait(false);
            current = children.FirstOrDefault(c =>
                string.Equals(c.Name, segment, StringComparison.OrdinalIgnoreCase));
            if (current is null)
            {
                return null;
            }

            currentParent = current.ObjectId;
        }

        return current;
    }

    public Task CopyObjectToLocalFileAsync(
        string deviceId,
        string objectId,
        string localFilePath,
        CancellationToken cancellationToken = default)
    {
        EnsureWindows();
        cancellationToken.ThrowIfCancellationRequested();

        Directory.CreateDirectory(Path.GetDirectoryName(localFilePath)!);

        using var session = OpenSession(deviceId);
        session.Content.Transfer(out var resources);
        uint bufferSize = 1024 * 1024;
        var key = ResourceDefault;
        resources.GetStream(objectId, ref key, 0 /* STGM_READ */, ref bufferSize, out var streamObj);

        if (streamObj is not IStream comStream)
        {
            throw new TransferInterruptedException();
        }

        try
        {
            using var file = File.Create(localFilePath);
            var buffer = new byte[Math.Max((int)bufferSize, 64 * 1024)];
            var readPtr = Marshal.AllocHGlobal(sizeof(int));
            try
            {
                while (true)
                {
                    cancellationToken.ThrowIfCancellationRequested();
                    Marshal.WriteInt32(readPtr, 0);
                    comStream.Read(buffer, buffer.Length, readPtr);
                    var read = Marshal.ReadInt32(readPtr);
                    if (read <= 0) break;
                    file.Write(buffer, 0, read);
                }
            }
            finally
            {
                Marshal.FreeHGlobal(readPtr);
            }

            file.Flush();
            if (file.Length == 0)
            {
                _logger.LogWarning("Copia MTP produjo archivo vacío: {Path}", localFilePath);
            }
        }
        catch (OperationCanceledException)
        {
            TryDelete(localFilePath);
            throw;
        }
        catch (Exception ex)
        {
            TryDelete(localFilePath);
            _logger.LogError(ex, "Error al copiar objeto MTP {ObjectId}", objectId);
            throw new TransferInterruptedException();
        }

        return Task.CompletedTask;
    }

    private List<MtpObjectInfo> EnumerateChildren(DeviceSession session, string parentId, CancellationToken ct)
    {
        session.Content.EnumObjects(0, parentId, null!, out var enumerator);
        var results = new List<MtpObjectInfo>();
        var batch = new string[32];

        while (true)
        {
            ct.ThrowIfCancellationRequested();
            uint fetched = 0;
            enumerator.Next((uint)batch.Length, batch, ref fetched);
            if (fetched == 0) break;

            for (uint i = 0; i < fetched; i++)
            {
                var objectId = batch[i];
                results.Add(ReadObjectInfo(session, objectId, parentId));
            }
        }

        return results;
    }

    private static MtpObjectInfo ReadObjectInfo(DeviceSession session, string objectId, string parentId)
    {
        session.Content.Properties(out var props);
        props.GetValues(objectId, null!, out var values);

        string? name = null;
        try
        {
            var key = WpdPropertyKeys.ObjectName;
            values.GetStringValue(ref key, out name);
        }
        catch { /* property may be missing */ }

        Guid contentType = Guid.Empty;
        try
        {
            var key = WpdPropertyKeys.ObjectContentType;
            values.GetGuidValue(ref key, out contentType);
        }
        catch { }

        ulong? size = null;
        try
        {
            var key = WpdPropertyKeys.ObjectSize;
            values.GetUnsignedLargeIntegerValue(ref key, out var raw);
            size = raw;
        }
        catch { }

        var isFolder = contentType == WpdContentTypes.Folder
                       || contentType == WpdContentTypes.FunctionalObject;

        return new MtpObjectInfo
        {
            ObjectId = objectId,
            Name = name ?? objectId,
            IsFolder = isFolder,
            SizeBytes = size,
            ParentId = parentId
        };
    }

    private static DeviceSession OpenSession(string deviceId)
    {
        try
        {
            var device = (IPortableDevice)new PortableDeviceCom();
            var clientInfo = (IPortableDeviceValues)new PortableDeviceValuesCom();

            // WPD_CLIENT_* keys from PortableDevice.h
            var clientName = new PropertyKey(new Guid("204D9F0C-2292-4080-9F42-40664EFC238A"), 2);
            var major = new PropertyKey(new Guid("204D9F0C-2292-4080-9F42-40664EFC238A"), 3);
            var minor = new PropertyKey(new Guid("204D9F0C-2292-4080-9F42-40664EFC238A"), 4);
            var revision = new PropertyKey(new Guid("204D9F0C-2292-4080-9F42-40664EFC238A"), 5);
            var security = new PropertyKey(new Guid("204D9F0C-2292-4080-9F42-40664EFC238A"), 6);

            clientInfo.SetStringValue(ref clientName, "ADAPlusListManager");
            clientInfo.SetUnsignedIntegerValue(ref major, 1);
            clientInfo.SetUnsignedIntegerValue(ref minor, 0);
            clientInfo.SetUnsignedIntegerValue(ref revision, 0);
            clientInfo.SetUnsignedIntegerValue(ref security, 0);

            device.Open(deviceId, clientInfo);
            device.Content(out var content);
            return new DeviceSession(device, content);
        }
        catch (COMException ex) when ((uint)ex.ErrorCode == 0x80070005)
        {
            throw new AdaPlusException(
                "Acceso denegado al dispositivo. Desbloquea el Zebra y confirma el modo de transferencia de archivos.",
                ex.Message,
                ex);
        }
        catch (COMException)
        {
            throw new MtpUnavailableException();
        }
    }

    private static void EnsureWindows()
    {
        if (!OperatingSystem.IsWindows())
        {
            throw new PlatformNotSupportedException(
                "WindowsWpdMtpStorageAccess requiere Windows. Ver UnsupportedPlatformMtpStorageAccess.");
        }
    }

    private static string SanitizeId(string id) =>
        id.Length <= 24 ? id : id[..24] + "…";

    private static void TryDelete(string path)
    {
        try { if (File.Exists(path)) File.Delete(path); } catch { /* best effort */ }
    }

    private sealed class DeviceSession : IDisposable
    {
        public IPortableDevice Device { get; }
        public IPortableDeviceContent Content { get; }

        public DeviceSession(IPortableDevice device, IPortableDeviceContent content)
        {
            Device = device;
            Content = content;
        }

        public void Dispose()
        {
            try { Device.Close(); } catch { }
            if (Marshal.IsComObject(Device)) Marshal.FinalReleaseComObject(Device);
        }
    }
}
