namespace ADAPlusListManager.Core.Models;

public sealed class MtpObjectInfo
{
    public required string ObjectId { get; init; }
    public required string Name { get; init; }
    public bool IsFolder { get; init; }
    public ulong? SizeBytes { get; init; }
    public string? ParentId { get; init; }
    public string? PersistentPath { get; init; }
}
