namespace ADAPlusListManager.Core.Models;

public enum ImportSessionStatus
{
    Pending = 0,
    Copying = 1,
    Parsing = 2,
    Succeeded = 3,
    Failed = 4,
    DuplicateSkipped = 5
}

public sealed class ImportSession
{
    public required string Id { get; init; }
    public DateTimeOffset StartedAt { get; init; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? CompletedAt { get; set; }
    public string Source { get; set; } = "mtp";
    public string? FileName { get; set; }
    public string? FileHashSha256 { get; set; }
    public ImportSessionStatus Status { get; set; } = ImportSessionStatus.Pending;
    public int RecordCount { get; set; }
    public string? ErrorMessage { get; set; }
    public string? DeviceId { get; set; }
    public bool IsDemo { get; init; }
    public string? InventoryListId { get; set; }
}
