using System.Collections.ObjectModel;
using ADAPlusListManager.Core.Interfaces;
using ADAPlusListManager.Core.Models;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace ADAPlusListManager.Desktop.ViewModels;

public partial class DevicesViewModel : PageViewModelBase
{
    private readonly IUsbDeviceDetector _detector;
    private readonly IMtpStorageAccess _mtp;
    private readonly IInventoryRepository _repo;
    private readonly IDiagnosticsService _diagnostics;

    public ObservableCollection<DeviceInfo> Devices { get; } = new();
    public ObservableCollection<MtpObjectInfo> ExploredObjects { get; } = new();

    [ObservableProperty] private DeviceInfo? _selectedDevice;
    [ObservableProperty] private string _detail = "Pulsa «Detectar Zebra».";
    [ObservableProperty] private bool _isExploring;

    public DevicesViewModel(
        IUsbDeviceDetector detector,
        IMtpStorageAccess mtp,
        IInventoryRepository repo,
        IDiagnosticsService diagnostics)
    {
        _detector = detector;
        _mtp = mtp;
        _repo = repo;
        _diagnostics = diagnostics;
    }

    [RelayCommand]
    private async Task DetectAsync()
    {
        Devices.Clear();
        ExploredObjects.Clear();
        Status("Detectando dispositivos…");
        try
        {
            var found = await _detector.DetectDevicesAsync();
            foreach (var d in found) Devices.Add(d);
            if (found.Count == 0)
            {
                Detail = "No se encontró ningún dispositivo Zebra compatible. Verifica el cable USB y desbloquea el dispositivo.";
                Status("Sin dispositivos");
            }
            else
            {
                SelectedDevice = found.FirstOrDefault(d => d.IsLikelyZebraEc50) ?? found[0];
                Detail = $"Dispositivos encontrados: {found.Count}";
                foreach (var d in found)
                    await _repo.SaveDeviceAsync(d);
                Status("Detección completada");
            }
            _diagnostics.AddMessage(Detail);
        }
        catch (PlatformNotSupportedException)
        {
            Detail = "La detección WPD/MTP requiere Windows. Este entorno no puede hablar con el Zebra.";
            Status("Plataforma no soportada");
        }
        catch (Exception ex)
        {
            Detail = "Error al detectar dispositivos.";
            _diagnostics.AddError(ex.GetType().Name + ": " + ex.Message);
            Status("Error de detección");
        }
    }

    [RelayCommand]
    private async Task ExploreAsync()
    {
        if (SelectedDevice is null)
        {
            Detail = "Selecciona un dispositivo primero.";
            return;
        }

        IsExploring = true;
        ExploredObjects.Clear();
        Status("Explorando almacenamiento…");
        try
        {
            var mtp = await _mtp.IsMtpAvailableAsync(SelectedDevice.Id);
            if (!mtp)
            {
                Detail = "Windows detectó el dispositivo, pero el almacenamiento no está disponible. Comprueba el modo de transferencia USB.";
                Status("MTP no disponible");
                return;
            }

            SelectedDevice.SharedStorageAvailable = true;
            SelectedDevice.State = DeviceConnectionState.Ready;

            var children = await _mtp.ListChildrenAsync(SelectedDevice.Id, null);
            foreach (var c in children) ExploredObjects.Add(c);

            var mango = await _mtp.FindObjectByPathAsync(SelectedDevice.Id, new[] { "Internal shared storage", "Mango" })
                        ?? await FindMangoLooseAsync(SelectedDevice.Id);

            if (mango is null)
            {
                Detail = "No se encontró la carpeta Mango en el almacenamiento compartido del dispositivo.";
            }
            else
            {
                var files = await _mtp.ListChildrenAsync(SelectedDevice.Id, mango.ObjectId);
                ExploredObjects.Clear();
                foreach (var f in files) ExploredObjects.Add(f);
                var hasLastRepo = files.Any(f => f.Name.Equals("lastRepo.json", StringComparison.OrdinalIgnoreCase));
                Detail = hasLastRepo
                    ? "Archivo lastRepo.json encontrado en carpeta Mango."
                    : "Carpeta Mango encontrada; lastRepo.json no está presente.";
            }
            Status("Exploración terminada");
        }
        catch (PlatformNotSupportedException)
        {
            Detail = "Exploración MTP solo disponible en Windows.";
        }
        catch (Exception ex)
        {
            Detail = "Error al explorar el almacenamiento.";
            _diagnostics.AddError(ex.Message);
        }
        finally
        {
            IsExploring = false;
        }
    }

    private async Task<MtpObjectInfo?> FindMangoLooseAsync(string deviceId)
    {
        var top = await _mtp.ListChildrenAsync(deviceId, null);
        foreach (var storage in top.Where(t => t.IsFolder))
        {
            var children = await _mtp.ListChildrenAsync(deviceId, storage.ObjectId);
            var mango = children.FirstOrDefault(c => c.IsFolder && c.Name.Equals("Mango", StringComparison.OrdinalIgnoreCase));
            if (mango != null) return mango;
        }
        return null;
    }
}
