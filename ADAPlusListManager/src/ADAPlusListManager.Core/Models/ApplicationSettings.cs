namespace ADAPlusListManager.Core.Models;

public sealed class ApplicationSettings
{
    public string Language { get; set; } = "es";
    public string Theme { get; set; } = "Light";
    public string? DataFolderPath { get; set; }
    public string? DefaultPrinterName { get; set; }
    public string PageSize { get; set; } = "A4";
    public string PageOrientation { get; set; } = "Portrait";
    public int TempFileRetentionHours { get; set; } = 24;
    public string? LastSelectedDeviceId { get; set; }
    public string? StoreIdentifier { get; set; }
    public bool DemoModeEnabled { get; set; }
}
