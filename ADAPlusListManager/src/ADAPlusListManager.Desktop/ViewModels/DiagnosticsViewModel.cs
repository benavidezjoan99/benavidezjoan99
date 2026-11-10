using System.Collections.ObjectModel;
using ADAPlusListManager.Core.Interfaces;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Win32;

namespace ADAPlusListManager.Desktop.ViewModels;

public partial class DiagnosticsViewModel : PageViewModelBase
{
    private readonly IDiagnosticsService _diagnostics;

    public ObservableCollection<string> Lines { get; } = new();
    [ObservableProperty] private string _summary = "";

    public DiagnosticsViewModel(IDiagnosticsService diagnostics) => _diagnostics = diagnostics;

    [RelayCommand]
    private async Task CaptureAsync()
    {
        Lines.Clear();
        var snap = await _diagnostics.CaptureAsync();
        Summary = $"Capturado {snap.CapturedAt.ToLocalTime():G} — dispositivos: {snap.Devices.Count}";
        foreach (var d in snap.Devices)
            Lines.Add($"Dispositivo: {d.FriendlyName} | {d.Model} | MTP={d.MtpAvailable} | {d.State}");
        foreach (var m in snap.Messages) Lines.Add(m);
        foreach (var e in snap.SanitizedErrors) Lines.Add("ERROR: " + e);
        Status("Diagnóstico capturado");
    }

    [RelayCommand]
    private async Task ExportAsync()
    {
        var dlg = new SaveFileDialog { Filter = "Texto (*.txt)|*.txt", FileName = "diagnostico.txt" };
        if (dlg.ShowDialog() != true) return;
        await _diagnostics.ExportSanitizedAsync(dlg.FileName);
        Status("Diagnóstico exportado");
    }
}
