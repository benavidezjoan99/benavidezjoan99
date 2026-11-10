using System.Windows;
using ADAPlusListManager.Core.Interfaces;
using ADAPlusListManager.Desktop.Services;
using ADAPlusListManager.Desktop.ViewModels;
using ADAPlusListManager.Desktop.Views;
using ADAPlusListManager.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace ADAPlusListManager.Desktop;

public partial class App : Application
{
    private ServiceProvider? _services;

    protected override async void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        var sc = new ServiceCollection();
        sc.AddLogging(b => b.AddDebug().SetMinimumLevel(LogLevel.Information));
        sc.AddAdaPlusInfrastructure();
        sc.AddSingleton<IPrintService, WpfPrintService>();

        sc.AddSingleton<MainViewModel>();
        sc.AddSingleton<HomeViewModel>();
        sc.AddSingleton<DevicesViewModel>();
        sc.AddSingleton<ImportViewModel>();
        sc.AddSingleton<ListsViewModel>();
        sc.AddSingleton<HistoryViewModel>();
        sc.AddSingleton<ReportsViewModel>();
        sc.AddSingleton<DiagnosticsViewModel>();
        sc.AddSingleton<SettingsViewModel>();
        sc.AddSingleton<MainWindow>();

        _services = sc.BuildServiceProvider();

        var repo = _services.GetRequiredService<IInventoryRepository>();
        await repo.InitializeAsync();

        var window = _services.GetRequiredService<MainWindow>();
        window.DataContext = _services.GetRequiredService<MainViewModel>();
        window.Show();
    }

    protected override void OnExit(ExitEventArgs e)
    {
        _services?.Dispose();
        base.OnExit(e);
    }
}
