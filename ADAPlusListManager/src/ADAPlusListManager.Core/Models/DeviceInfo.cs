namespace ADAPlusListManager.Core.Models;

public enum DeviceConnectionState
{
    Unknown = 0,
    NotConnected = 1,
    Detected = 2,
    UsbChargeOnly = 3,
    MtpUnavailable = 4,
    Ready = 5,
    Locked = 6,
    AccessDenied = 7,
    Disconnected = 8,
    Error = 9
}

public sealed class DeviceInfo
{
    public required string Id { get; init; }
    public string? FriendlyName { get; init; }
    public string? Manufacturer { get; init; }
    public string? Model { get; init; }
    public string? WindowsDeviceId { get; init; }
    public bool IsLikelyZebraEc50 { get; init; }
    public bool MtpAvailable { get; init; }
    public bool SharedStorageAvailable { get; init; }
    public DeviceConnectionState State { get; set; } = DeviceConnectionState.Unknown;
    public DateTimeOffset? LastDetectedAt { get; set; }
    public string? StatusMessage { get; set; }
}
