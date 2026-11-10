using System.Security.Cryptography;
using ADAPlusListManager.Core.Exceptions;
using ADAPlusListManager.Core.Interfaces;
using ADAPlusListManager.Core.Models;
using Microsoft.Extensions.Logging;

namespace ADAPlusListManager.Infrastructure.Importers;

public sealed class FileImporter : IFileImporter
{
    private static readonly string[] MangoPath = { "Internal shared storage", "Mango" };
    private static readonly string[] MangoPathAlt = { "Almacenamiento compartido interno", "Mango" };
    private static readonly string[] LastRepoName = { "lastRepo.json" };

    private readonly IMtpStorageAccess _mtp;
    private readonly IMangoJsonParser _parser;
    private readonly ITempFileService _tempFiles;
    private readonly IInventoryRepository _repository;
    private readonly IDiagnosticsService _diagnostics;
    private readonly ILogger<FileImporter> _logger;

    public FileImporter(
        IMtpStorageAccess mtp,
        IMangoJsonParser parser,
        ITempFileService tempFiles,
        IInventoryRepository repository,
        IDiagnosticsService diagnostics,
        ILogger<FileImporter> logger)
    {
        _mtp = mtp;
        _parser = parser;
        _tempFiles = tempFiles;
        _repository = repository;
        _diagnostics = diagnostics;
        _logger = logger;
    }

    public async Task<ImportSession> ImportFromLocalFileAsync(string localFilePath, bool isDemo, CancellationToken cancellationToken = default)
    {
        var session = new ImportSession
        {
            Id = Guid.NewGuid().ToString("N"),
            Source = isDemo ? "demo" : "local-file",
            FileName = Path.GetFileName(localFilePath),
            IsDemo = isDemo,
            Status = ImportSessionStatus.Parsing
        };

        if (!File.Exists(localFilePath))
        {
            session.Status = ImportSessionStatus.Failed;
            session.ErrorMessage = "Archivo local no encontrado.";
            session.CompletedAt = DateTimeOffset.UtcNow;
            return session;
        }

        session.FileHashSha256 = await ComputeSha256Async(localFilePath, cancellationToken).ConfigureAwait(false);

        if (!isDemo && await _repository.ExistsByFileHashAsync(session.FileHashSha256, cancellationToken).ConfigureAwait(false))
        {
            session.Status = ImportSessionStatus.DuplicateSkipped;
            session.ErrorMessage = "Este archivo ya fue importado anteriormente (mismo hash).";
            session.CompletedAt = DateTimeOffset.UtcNow;
            return session;
        }

        var parse = await _parser.ParseFileAsync(localFilePath, isDemo, cancellationToken).ConfigureAwait(false);
        if (!parse.Success)
        {
            session.Status = ImportSessionStatus.Failed;
            session.ErrorMessage = parse.ErrorMessage ?? "Archivo inválido.";
            session.CompletedAt = DateTimeOffset.UtcNow;
            _diagnostics.AddError(session.ErrorMessage);
            return session;
        }

        if (parse.Items.Count == 0)
        {
            session.Status = ImportSessionStatus.Failed;
            session.ErrorMessage = "No se importaron registros válidos.";
            session.CompletedAt = DateTimeOffset.UtcNow;
            return session;
        }

        var list = new InventoryList
        {
            Id = Guid.NewGuid().ToString("N"),
            Name = isDemo ? "MODO DEMOSTRACIÓN — " + session.FileName : session.FileName ?? "Listado",
            Source = session.Source,
            IsDemo = isDemo,
            Items = parse.Items.ToList()
        };

        session.RecordCount = list.RecordCount;
        session.Status = ImportSessionStatus.Succeeded;
        session.CompletedAt = DateTimeOffset.UtcNow;
        session.InventoryListId = list.Id;

        await _repository.SaveImportSessionAsync(session, list, cancellationToken).ConfigureAwait(false);
        _diagnostics.AddMessage($"Importación correcta: {session.RecordCount} registros desde {session.FileName}.");
        return session;
    }

    public async Task<ImportSession> ImportLastRepoFromDeviceAsync(string deviceId, CancellationToken cancellationToken = default)
    {
        var session = new ImportSession
        {
            Id = Guid.NewGuid().ToString("N"),
            Source = "mtp",
            DeviceId = deviceId,
            FileName = "lastRepo.json",
            Status = ImportSessionStatus.Copying
        };

        if (!await _mtp.IsMtpAvailableAsync(deviceId, cancellationToken).ConfigureAwait(false))
        {
            throw new MtpUnavailableException();
        }

        var file = await FindLastRepoAsync(deviceId, cancellationToken).ConfigureAwait(false)
                   ?? throw new LastRepoNotFoundException();

        var tempPath = _tempFiles.CreateTempFilePath("lastRepo.json");
        session.Status = ImportSessionStatus.Copying;
        _diagnostics.AddMessage("Copiando lastRepo.json (solo lectura)...");

        await _mtp.CopyObjectToLocalFileAsync(deviceId, file.ObjectId, tempPath, cancellationToken).ConfigureAwait(false);

        if (!File.Exists(tempPath) || new FileInfo(tempPath).Length == 0)
        {
            throw new TransferInterruptedException();
        }

        var imported = await ImportFromLocalFileAsync(tempPath, isDemo: false, cancellationToken).ConfigureAwait(false);
        imported.DeviceId = deviceId;
        imported.Source = "mtp";
        return imported;
    }

    private async Task<MtpObjectInfo?> FindLastRepoAsync(string deviceId, CancellationToken ct)
    {
        foreach (var rootPath in new[] { MangoPath, MangoPathAlt })
        {
            // Try full path including storage root name variants.
            var mango = await _mtp.FindObjectByPathAsync(deviceId, rootPath, ct).ConfigureAwait(false);
            if (mango is null)
            {
                // Search top-level for a storage + Mango folder without assuming exact storage label.
                var top = await _mtp.ListChildrenAsync(deviceId, null, ct).ConfigureAwait(false);
                foreach (var storage in top.Where(t => t.IsFolder))
                {
                    var children = await _mtp.ListChildrenAsync(deviceId, storage.ObjectId, ct).ConfigureAwait(false);
                    var mangoFolder = children.FirstOrDefault(c =>
                        c.IsFolder && string.Equals(c.Name, "Mango", StringComparison.OrdinalIgnoreCase));
                    if (mangoFolder is null) continue;

                    var files = await _mtp.ListChildrenAsync(deviceId, mangoFolder.ObjectId, ct).ConfigureAwait(false);
                    var hit = files.FirstOrDefault(f =>
                        !f.IsFolder && string.Equals(f.Name, "lastRepo.json", StringComparison.OrdinalIgnoreCase));
                    if (hit != null) return hit;
                }

                continue;
            }

            var inMango = await _mtp.ListChildrenAsync(deviceId, mango.ObjectId, ct).ConfigureAwait(false);
            var found = inMango.FirstOrDefault(f =>
                !f.IsFolder && string.Equals(f.Name, "lastRepo.json", StringComparison.OrdinalIgnoreCase));
            if (found != null) return found;
        }

        // Distinguish missing Mango folder vs missing file when possible
        var storages = await _mtp.ListChildrenAsync(deviceId, null, ct).ConfigureAwait(false);
        var anyMango = false;
        foreach (var storage in storages.Where(s => s.IsFolder))
        {
            var children = await _mtp.ListChildrenAsync(deviceId, storage.ObjectId, ct).ConfigureAwait(false);
            if (children.Any(c => c.IsFolder && c.Name.Equals("Mango", StringComparison.OrdinalIgnoreCase)))
                anyMango = true;
        }

        if (!anyMango) throw new MangoFolderNotFoundException();
        return null;
    }

    private static async Task<string> ComputeSha256Async(string path, CancellationToken ct)
    {
        await using var stream = File.OpenRead(path);
        var hash = await SHA256.HashDataAsync(stream, ct).ConfigureAwait(false);
        return Convert.ToHexString(hash);
    }
}
