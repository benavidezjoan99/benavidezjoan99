using ADAPlusListManager.Core.Interfaces;
using ADAPlusListManager.Core.Models;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace ADAPlusListManager.Desktop.ViewModels;

public partial class SettingsViewModel : PageViewModelBase
{
    private readonly IInventoryRepository _repo;
    private readonly IAuthorizedAdaConnector _ada;
    private readonly ITempFileService _temp;

    [ObservableProperty] private string _theme = "Light";
    [ObservableProperty] private string _language = "es";
    [ObservableProperty] private string _pageSize = "A4";
    [ObservableProperty] private string _orientation = "Portrait";
    [ObservableProperty] private int _retentionHours = 24;
    [ObservableProperty] private string? _storeIdentifier;
    [ObservableProperty] private string? _defaultPrinter;
    [ObservableProperty] private string _dataFolder = "";
    [ObservableProperty] private string _adaStatus = "";
    [ObservableProperty] private string _dotnetChoice = ".NET 8 LTS (elegido por compatibilidad Toshiba / SDK disponible en CI Linux)";

    public SettingsViewModel(IInventoryRepository repo, IAuthorizedAdaConnector ada, ITempFileService temp)
    {
        _repo = repo;
        _ada = ada;
        _temp = temp;
        AdaStatus = ada.StatusMessage;
        DataFolder = _temp.TempRoot;
    }

    [RelayCommand]
    private async Task LoadAsync()
    {
        var s = await _repo.GetSettingsAsync();
        Theme = s.Theme;
        Language = s.Language;
        PageSize = s.PageSize;
        Orientation = s.PageOrientation;
        RetentionHours = s.TempFileRetentionHours;
        StoreIdentifier = s.StoreIdentifier;
        DefaultPrinter = s.DefaultPrinterName;
        if (!string.IsNullOrWhiteSpace(s.DataFolderPath)) DataFolder = s.DataFolderPath;
    }

    [RelayCommand]
    private async Task SaveAsync()
    {
        var s = new ApplicationSettings
        {
            Theme = Theme,
            Language = Language,
            PageSize = PageSize,
            PageOrientation = Orientation,
            TempFileRetentionHours = RetentionHours,
            StoreIdentifier = StoreIdentifier,
            DefaultPrinterName = DefaultPrinter,
            DataFolderPath = DataFolder
        };
        await _repo.SaveSettingsAsync(s);
        await _temp.CleanupExpiredAsync(TimeSpan.FromHours(Math.Max(1, RetentionHours)));
        Status("Configuración guardada");
    }
}
