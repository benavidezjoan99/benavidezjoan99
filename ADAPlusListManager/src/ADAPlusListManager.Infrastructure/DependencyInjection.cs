using ADAPlusListManager.Core.Interfaces;
using ADAPlusListManager.Core.Services;
using ADAPlusListManager.Infrastructure.Diagnostics;
using ADAPlusListManager.Infrastructure.Exporters;
using ADAPlusListManager.Infrastructure.Importers;
using ADAPlusListManager.Infrastructure.Integrations;
using ADAPlusListManager.Infrastructure.MTP;
using ADAPlusListManager.Infrastructure.Parsers;
using ADAPlusListManager.Infrastructure.Persistence;
using ADAPlusListManager.Infrastructure.Printing;
using ADAPlusListManager.Infrastructure.USB;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace ADAPlusListManager.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddAdaPlusInfrastructure(
        this IServiceCollection services,
        string? databasePath = null)
    {
        services.AddSingleton<IListFilterService, ListFilterService>();
        services.AddSingleton<IMangoJsonParser, MangoJsonParser>();
        services.AddSingleton<IExportService, ExportService>();
        services.AddSingleton<IAuthorizedAdaConnector, UnconfiguredAdaConnector>();
        services.AddSingleton<ITempFileService>(_ => new TempFileService());
        services.AddSingleton<IDiagnosticsService, DiagnosticsService>();
        services.AddSingleton<IFileImporter, FileImporter>();

        if (OperatingSystem.IsWindows())
        {
            services.AddSingleton<IUsbDeviceDetector, WindowsWpdDeviceDetector>();
            services.AddSingleton<IMtpStorageAccess, WindowsWpdMtpStorageAccess>();
        }
        else
        {
            // LINUX STUB — explicit, no fake Zebra
            services.AddSingleton<IUsbDeviceDetector, UnsupportedPlatformUsbDeviceDetector>();
            services.AddSingleton<IMtpStorageAccess, UnsupportedPlatformMtpStorageAccess>();
        }

        // Desktop overrides this with WpfPrintService when hosted in WPF.
        services.AddSingleton<IPrintService, NullPrintService>();

        var db = databasePath ?? Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "ADAPlusListManager",
            "data",
            "ada-plus.db");

        services.AddSingleton<IInventoryRepository>(sp =>
            new SqliteInventoryRepository(db, sp.GetRequiredService<ILogger<SqliteInventoryRepository>>()));

        return services;
    }
}
