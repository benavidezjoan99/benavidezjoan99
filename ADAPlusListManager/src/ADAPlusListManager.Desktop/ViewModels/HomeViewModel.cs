using System.Collections.ObjectModel;
using ADAPlusListManager.Core.Interfaces;
using ADAPlusListManager.Core.Models;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace ADAPlusListManager.Desktop.ViewModels;

public partial class HomeViewModel : PageViewModelBase
{
    private readonly IUsbDeviceDetector _detector;
    private readonly IInventoryRepository _repo;
    private readonly IAuthorizedAdaConnector _ada;

    [ObservableProperty] private string _zebraStatus = "Desconocido";
    [ObservableProperty] private string _lastConnection = "—";
    [ObservableProperty] private string _lastImport = "—";
    [ObservableProperty] private int _listCount;
    [ObservableProperty] private int _itemCount;
    [ObservableProperty] private string _adaServerStatus = "";

    public ObservableCollection<string> QuickActions { get; } = new();

    public HomeViewModel(IUsbDeviceDetector detector, IInventoryRepository repo, IAuthorizedAdaConnector ada)
    {
        _detector = detector;
        _repo = repo;
        _ada = ada;
        AdaServerStatus = _ada.StatusMessage;
        QuickActions.Add("Detectar Zebra");
        QuickActions.Add("Importar DEMO");
        QuickActions.Add("Ver listados");
    }

    [RelayCommand]
    private async Task RefreshAsync()
    {
        Status("Actualizando inicio…");
        try
        {
            var zebra = await _detector.FindZebraEc50Async();
            if (zebra is null)
            {
                var all = await _detector.DetectDevicesAsync();
                ZebraStatus = all.Count == 0 ? "Zebra no conectado" : $"Dispositivos: {all.Count} (sin EC50 claro)";
            }
            else
            {
                ZebraStatus = $"Zebra conectado: {zebra.FriendlyName}";
                LastConnection = zebra.LastDetectedAt?.ToLocalTime().ToString("g") ?? "—";
            }

            var history = await _repo.GetImportHistoryAsync(1);
            LastImport = history.FirstOrDefault() is { } h
                ? $"{h.FileName} ({h.RecordCount} reg.) — {h.StartedAt.ToLocalTime():g}"
                : "Sin importaciones";

            var lists = await _repo.GetInventoryListsAsync();
            ListCount = lists.Count;
            ItemCount = lists.Sum(l => l.RecordCount);
            Status("Inicio actualizado");
        }
        catch (Exception ex)
        {
            ZebraStatus = "Error al detectar";
            Status(ex is PlatformNotSupportedException
                ? "Detección USB solo disponible en Windows."
                : "No se pudo actualizar el panel de inicio.");
        }
    }
}
