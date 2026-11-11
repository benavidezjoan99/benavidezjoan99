using System.Collections.ObjectModel;
using ADAPlusListManager.Core.Interfaces;
using ADAPlusListManager.Core.Models;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Win32;

namespace ADAPlusListManager.Desktop.ViewModels;

public partial class ImportViewModel : PageViewModelBase
{
    private readonly IFileImporter _importer;
    private readonly IMangoJsonParser _parser;
    private readonly IUsbDeviceDetector _detector;
    private readonly IInventoryRepository _repo;

    [ObservableProperty] private string _statusMessage = "Selecciona un origen.";
    [ObservableProperty] private bool _isDemoMode;
    [ObservableProperty] private ParseResult? _preview;
    [ObservableProperty] private ImportSession? _lastSession;

    public ObservableCollection<FieldMappingPreview> MappingRows { get; } = new();
    public ObservableCollection<InventoryItem> PreviewItems { get; } = new();

    public ImportViewModel(
        IFileImporter importer,
        IMangoJsonParser parser,
        IUsbDeviceDetector detector,
        IInventoryRepository repo)
    {
        _importer = importer;
        _parser = parser;
        _detector = detector;
        _repo = repo;
    }

    [RelayCommand]
    private async Task ImportFromDeviceAsync()
    {
        Status("Buscando Zebra…");
        try
        {
            var device = await _detector.FindZebraEc50Async()
                         ?? (await _detector.DetectDevicesAsync()).FirstOrDefault();
            if (device is null)
            {
                StatusMessage = "No se encontró ningún dispositivo Zebra compatible. Verifica el cable USB y desbloquea el dispositivo.";
                Status("Sin dispositivo");
                return;
            }

            StatusMessage = "Obteniendo lastRepo.json…";
            var session = await _importer.ImportLastRepoFromDeviceAsync(device.Id);
            ApplySession(session);
        }
        catch (Exception ex)
        {
            StatusMessage = ex is ADAPlusListManager.Core.Exceptions.AdaPlusException ada ? ada.UserMessage : "Error al importar desde el dispositivo.";
            Status("Importación fallida");
        }
    }

    [RelayCommand]
    private async Task ImportLocalFileAsync()
    {
        var dlg = new OpenFileDialog
        {
            Filter = "JSON (*.json)|*.json|Todos (*.*)|*.*",
            Title = "Seleccionar archivo JSON"
        };
        if (dlg.ShowDialog() != true) return;

        Status("Importando archivo…");
        try
        {
            // Preview first
            Preview = await _parser.ParseFileAsync(dlg.FileName, IsDemoMode);
            MappingRows.Clear();
            PreviewItems.Clear();
            if (Preview?.MappingPreview != null)
                foreach (var m in Preview.MappingPreview) MappingRows.Add(m);
            if (Preview?.Items != null)
                foreach (var i in Preview.Items.Take(50)) PreviewItems.Add(i);

            if (Preview is not { Success: true } || Preview.Items.Count == 0)
            {
                StatusMessage = Preview?.ErrorMessage
                    ?? "Se encontró el archivo, pero su contenido no pudo interpretarse como un listado compatible.";
                Status("Archivo inválido");
                return;
            }

            var session = await _importer.ImportFromLocalFileAsync(dlg.FileName, IsDemoMode);
            ApplySession(session);
        }
        catch (Exception)
        {
            StatusMessage = "Error al importar el archivo local.";
            Status("Error");
        }
    }

    [RelayCommand]
    private async Task LoadDemoAsync()
    {
        IsDemoMode = true;
        var candidates = new[]
        {
            System.IO.Path.GetFullPath(System.IO.Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "samples", "demo", "lastRepo.demo.json")),
            System.IO.Path.GetFullPath(System.IO.Path.Combine(AppContext.BaseDirectory, "samples", "demo", "lastRepo.demo.json")),
            System.IO.Path.Combine(Environment.CurrentDirectory, "samples", "demo", "lastRepo.demo.json")
        };

        var path = candidates.FirstOrDefault(System.IO.File.Exists);
        if (path is null)
        {
            StatusMessage = "No se encontró samples/demo/lastRepo.demo.json. Copia el sample junto al ejecutable o abre el archivo manualmente.";
            return;
        }

        Preview = await _parser.ParseFileAsync(path, isDemo: true);
        MappingRows.Clear();
        PreviewItems.Clear();
        foreach (var m in Preview.MappingPreview) MappingRows.Add(m);
        foreach (var i in Preview.Items) PreviewItems.Add(i);

        var session = await _importer.ImportFromLocalFileAsync(path, isDemo: true);
        ApplySession(session);
        StatusMessage = "MODO DEMOSTRACIÓN — datos sintéticos, no son escaneos reales.";
    }

    private void ApplySession(ImportSession session)
    {
        LastSession = session;
        if (session.Status == ImportSessionStatus.Succeeded)
        {
            StatusMessage = $"Archivo importado correctamente: {session.RecordCount} registros" +
                            (session.IsDemo ? " (MODO DEMOSTRACIÓN)." : ".");
            Status("Importación correcta");
        }
        else if (session.Status == ImportSessionStatus.DuplicateSkipped)
        {
            StatusMessage = session.ErrorMessage ?? "Duplicado omitido.";
            Status("Duplicado");
        }
        else
        {
            StatusMessage = session.ErrorMessage ?? "Importación fallida.";
            Status("Fallida");
        }
    }
}
