using ADAPlusListManager.Core.Interfaces;

namespace ADAPlusListManager.Infrastructure.Diagnostics;

public sealed class TempFileService : ITempFileService
{
    public string TempRoot { get; }

    public TempFileService(string? root = null)
    {
        TempRoot = root ?? Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "ADAPlusListManager",
            "temp");
        Directory.CreateDirectory(TempRoot);
    }

    public string CreateTempFilePath(string preferredFileName)
    {
        var safe = string.Join("_", preferredFileName.Split(Path.GetInvalidFileNameChars()));
        var name = $"{DateTime.UtcNow:yyyyMMddHHmmssfff}_{Guid.NewGuid():N}_{safe}";
        return Path.Combine(TempRoot, name);
    }

    public Task CleanupExpiredAsync(TimeSpan maxAge, CancellationToken cancellationToken = default)
    {
        if (!Directory.Exists(TempRoot)) return Task.CompletedTask;
        var threshold = DateTime.UtcNow - maxAge;
        foreach (var file in Directory.EnumerateFiles(TempRoot))
        {
            cancellationToken.ThrowIfCancellationRequested();
            try
            {
                var info = new FileInfo(file);
                if (info.LastWriteTimeUtc < threshold)
                    info.Delete();
            }
            catch
            {
                // best effort
            }
        }
        return Task.CompletedTask;
    }
}
