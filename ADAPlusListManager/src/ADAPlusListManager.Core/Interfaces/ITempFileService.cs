namespace ADAPlusListManager.Core.Interfaces;

public interface ITempFileService
{
    string CreateTempFilePath(string preferredFileName);
    Task CleanupExpiredAsync(TimeSpan maxAge, CancellationToken cancellationToken = default);
    string TempRoot { get; }
}
