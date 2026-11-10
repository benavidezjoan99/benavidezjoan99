using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace ADAPlusListManager.Desktop.ViewModels;

public partial class MainViewModel : ViewModelBase
{
    public HomeViewModel Home { get; }
    public DevicesViewModel Devices { get; }
    public ImportViewModel Import { get; }
    public ListsViewModel Lists { get; }
    public HistoryViewModel History { get; }
    public ReportsViewModel Reports { get; }
    public DiagnosticsViewModel Diagnostics { get; }
    public SettingsViewModel Settings { get; }

    [ObservableProperty]
    private ViewModelBase _currentPage;

    [ObservableProperty]
    private string _statusText = "Listo";

    [ObservableProperty]
    private bool _isBusy;

    public MainViewModel(
        HomeViewModel home,
        DevicesViewModel devices,
        ImportViewModel import,
        ListsViewModel lists,
        HistoryViewModel history,
        ReportsViewModel reports,
        DiagnosticsViewModel diagnostics,
        SettingsViewModel settings)
    {
        Home = home;
        Devices = devices;
        Import = import;
        Lists = lists;
        History = history;
        Reports = reports;
        Diagnostics = diagnostics;
        Settings = settings;
        _currentPage = home;

        home.Attach(this);
        devices.Attach(this);
        import.Attach(this);
        lists.Attach(this);
        history.Attach(this);
        reports.Attach(this);
        diagnostics.Attach(this);
        settings.Attach(this);
    }

    [RelayCommand]
    private void Navigate(string page)
    {
        CurrentPage = page switch
        {
            "Home" => Home,
            "Devices" => Devices,
            "Import" => Import,
            "Lists" => Lists,
            "History" => History,
            "Reports" => Reports,
            "Diagnostics" => Diagnostics,
            "Settings" => Settings,
            _ => Home
        };
    }

    public void SetStatus(string text) => StatusText = text;
}

public abstract class PageViewModelBase : ViewModelBase
{
    protected MainViewModel? Shell { get; private set; }

    public void Attach(MainViewModel shell) => Shell = shell;

    protected void Status(string text) => Shell?.SetStatus(text);
}
