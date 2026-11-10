using System.Collections.ObjectModel;
using ADAPlusListManager.Core.Interfaces;
using ADAPlusListManager.Core.Models;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Win32;

namespace ADAPlusListManager.Desktop.ViewModels;

public partial class ReportsViewModel : PageViewModelBase
{
    private readonly IInventoryRepository _repo;
    private readonly IExportService _export;
    private readonly IPrintService _print;

    public ObservableCollection<InventoryList> Lists { get; } = new();
    public ObservableCollection<string> Printers { get; } = new();

    [ObservableProperty] private InventoryList? _selectedList;
    [ObservableProperty] private string? _selectedPrinter;
    [ObservableProperty] private string _message = "";
    [ObservableProperty] private string? _storeId;

    public ReportsViewModel(IInventoryRepository repo, IExportService export, IPrintService print)
    {
        _repo = repo;
        _export = export;
        _print = print;
    }

    [RelayCommand]
    private async Task ReloadAsync()
    {
        Lists.Clear();
        foreach (var l in await _repo.GetInventoryListsAsync()) Lists.Add(l);
        SelectedList = Lists.FirstOrDefault();

        Printers.Clear();
        foreach (var p in _print.GetInstalledPrinters()) Printers.Add(p);
        SelectedPrinter = Printers.FirstOrDefault();

        var settings = await _repo.GetSettingsAsync();
        StoreId = settings.StoreIdentifier;
        Status("Reportes listos");
    }

    [RelayCommand]
    private async Task ExportExcelAsync()
    {
        if (!TryGetRequest(out var request)) return;
        var dlg = new SaveFileDialog { Filter = "Excel (*.xlsx)|*.xlsx", FileName = "listado.xlsx" };
        if (dlg.ShowDialog() != true) return;
        await _export.ExportExcelAsync(request, dlg.FileName);
        Message = "Excel exportado.";
    }

    [RelayCommand]
    private async Task ExportCsvAsync()
    {
        if (!TryGetRequest(out var request)) return;
        var dlg = new SaveFileDialog { Filter = "CSV (*.csv)|*.csv", FileName = "listado.csv" };
        if (dlg.ShowDialog() != true) return;
        await _export.ExportCsvAsync(request, dlg.FileName);
        Message = "CSV exportado.";
    }

    [RelayCommand]
    private async Task ExportPdfAsync()
    {
        if (!TryGetRequest(out var request)) return;
        var dlg = new SaveFileDialog { Filter = "PDF (*.pdf)|*.pdf", FileName = "listado.pdf" };
        if (dlg.ShowDialog() != true) return;
        await _export.ExportPdfAsync(request, dlg.FileName);
        Message = "PDF exportado.";
    }

    [RelayCommand]
    private async Task PreviewAsync()
    {
        if (!TryGetRequest(out var request)) return;
        if (request.List.UnknownQuantityCount > 0)
            Message = $"Advertencia: {request.List.UnknownQuantityCount} registros sin cantidad verificada.";
        await _print.ShowPrintPreviewAsync(request);
    }

    [RelayCommand]
    private async Task PrintAsync()
    {
        if (!TryGetRequest(out var request)) return;
        if (request.List.UnknownQuantityCount > 0)
            Message = $"Advertencia antes de imprimir: {request.List.UnknownQuantityCount} cantidades desconocidas.";
        try
        {
            await _print.PrintAsync(request, SelectedPrinter);
            Message = "Enviado a impresión.";
        }
        catch (ADAPlusListManager.Core.Exceptions.PrinterUnavailableException)
        {
            Message = "No se encontró una impresora disponible. Selecciona otra impresora o exporta el listado a PDF.";
        }
    }

    private bool TryGetRequest(out ReportRequest request)
    {
        request = null!;
        if (SelectedList is null)
        {
            Message = "Selecciona un listado.";
            return false;
        }
        request = new ReportRequest
        {
            List = SelectedList,
            StoreIdentifier = StoreId,
            Title = SelectedList.IsDemo ? "MODO DEMOSTRACIÓN — Listado" : "Listado de mercancía"
        };
        return true;
    }
}
