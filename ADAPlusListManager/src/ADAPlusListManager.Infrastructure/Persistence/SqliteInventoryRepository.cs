using ADAPlusListManager.Core.Interfaces;
using ADAPlusListManager.Core.Models;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Logging;

namespace ADAPlusListManager.Infrastructure.Persistence;

public sealed class SqliteInventoryRepository : IInventoryRepository
{
    private readonly string _dbPath;
    private readonly ILogger<SqliteInventoryRepository> _logger;

    public SqliteInventoryRepository(string dbPath, ILogger<SqliteInventoryRepository> logger)
    {
        _dbPath = dbPath;
        _logger = logger;
    }

    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(_dbPath)!);
        await using var conn = Open();
        await conn.OpenAsync(cancellationToken).ConfigureAwait(false);
        var sql = """
            CREATE TABLE IF NOT EXISTS Devices (
              Id TEXT PRIMARY KEY,
              Name TEXT,
              Model TEXT,
              LastDetectedAt TEXT
            );
            CREATE TABLE IF NOT EXISTS ImportSessions (
              Id TEXT PRIMARY KEY,
              StartedAt TEXT NOT NULL,
              CompletedAt TEXT,
              Source TEXT,
              FileName TEXT,
              FileHashSha256 TEXT,
              Status TEXT,
              RecordCount INTEGER,
              ErrorMessage TEXT,
              DeviceId TEXT,
              IsDemo INTEGER,
              InventoryListId TEXT
            );
            CREATE UNIQUE INDEX IF NOT EXISTS IX_ImportSessions_Hash
              ON ImportSessions(FileHashSha256) WHERE FileHashSha256 IS NOT NULL AND IsDemo = 0;
            CREATE TABLE IF NOT EXISTS InventoryLists (
              Id TEXT PRIMARY KEY,
              CreatedAt TEXT NOT NULL,
              ListType TEXT,
              Name TEXT,
              Source TEXT,
              Status TEXT,
              IsDemo INTEGER
            );
            CREATE TABLE IF NOT EXISTS InventoryItems (
              Id TEXT PRIMARY KEY,
              ListId TEXT NOT NULL,
              Reference TEXT,
              Barcode TEXT,
              Model TEXT,
              Description TEXT,
              SizeCode TEXT,
              ColorCode TEXT,
              Quantity TEXT,
              FOREIGN KEY(ListId) REFERENCES InventoryLists(Id)
            );
            CREATE TABLE IF NOT EXISTS ApplicationSettings (
              Id INTEGER PRIMARY KEY CHECK (Id = 1),
              Json TEXT NOT NULL
            );
            """;
        await using var cmd = conn.CreateCommand();
        cmd.CommandText = sql;
        await cmd.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
        _logger.LogInformation("SQLite inicializado en {Path}", _dbPath);
    }

    public async Task SaveDeviceAsync(DeviceInfo device, CancellationToken cancellationToken = default)
    {
        await using var conn = Open();
        await conn.OpenAsync(cancellationToken).ConfigureAwait(false);
        await using var cmd = conn.CreateCommand();
        cmd.CommandText = """
            INSERT INTO Devices(Id, Name, Model, LastDetectedAt)
            VALUES ($id, $name, $model, $last)
            ON CONFLICT(Id) DO UPDATE SET
              Name = excluded.Name,
              Model = excluded.Model,
              LastDetectedAt = excluded.LastDetectedAt;
            """;
        cmd.Parameters.AddWithValue("$id", device.Id);
        cmd.Parameters.AddWithValue("$name", (object?)device.FriendlyName ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$model", (object?)device.Model ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$last", (device.LastDetectedAt ?? DateTimeOffset.UtcNow).ToString("O"));
        await cmd.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
    }

    public async Task<string> SaveImportSessionAsync(ImportSession session, InventoryList list, CancellationToken cancellationToken = default)
    {
        await using var conn = Open();
        await conn.OpenAsync(cancellationToken).ConfigureAwait(false);
        await using var tx = (SqliteTransaction)await conn.BeginTransactionAsync(cancellationToken).ConfigureAwait(false);

        await using (var listCmd = conn.CreateCommand())
        {
            listCmd.Transaction = tx;
            listCmd.CommandText = """
                INSERT INTO InventoryLists(Id, CreatedAt, ListType, Name, Source, Status, IsDemo)
                VALUES ($id, $created, $type, $name, $source, $status, $demo);
                """;
            listCmd.Parameters.AddWithValue("$id", list.Id);
            listCmd.Parameters.AddWithValue("$created", list.CreatedAt.ToString("O"));
            listCmd.Parameters.AddWithValue("$type", list.ListType);
            listCmd.Parameters.AddWithValue("$name", list.Name);
            listCmd.Parameters.AddWithValue("$source", list.Source);
            listCmd.Parameters.AddWithValue("$status", list.Status);
            listCmd.Parameters.AddWithValue("$demo", list.IsDemo ? 1 : 0);
            await listCmd.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
        }

        foreach (var item in list.Items)
        {
            await using var itemCmd = conn.CreateCommand();
            itemCmd.Transaction = tx;
            itemCmd.CommandText = """
                INSERT INTO InventoryItems(Id, ListId, Reference, Barcode, Model, Description, SizeCode, ColorCode, Quantity)
                VALUES ($id, $list, $ref, $bar, $model, $desc, $size, $color, $qty);
                """;
            itemCmd.Parameters.AddWithValue("$id", item.Id);
            itemCmd.Parameters.AddWithValue("$list", list.Id);
            itemCmd.Parameters.AddWithValue("$ref", (object?)item.Reference ?? DBNull.Value);
            itemCmd.Parameters.AddWithValue("$bar", (object?)item.Barcode ?? DBNull.Value);
            itemCmd.Parameters.AddWithValue("$model", (object?)item.Model ?? DBNull.Value);
            itemCmd.Parameters.AddWithValue("$desc", (object?)item.Description ?? DBNull.Value);
            itemCmd.Parameters.AddWithValue("$size", (object?)item.SizeCode ?? DBNull.Value);
            itemCmd.Parameters.AddWithValue("$color", (object?)item.ColorCode ?? DBNull.Value);
            itemCmd.Parameters.AddWithValue("$qty", item.Quantity.HasValue ? item.Quantity.Value.ToString(System.Globalization.CultureInfo.InvariantCulture) : DBNull.Value);
            await itemCmd.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
        }

        await using (var sessionCmd = conn.CreateCommand())
        {
            sessionCmd.Transaction = tx;
            sessionCmd.CommandText = """
                INSERT INTO ImportSessions(Id, StartedAt, CompletedAt, Source, FileName, FileHashSha256, Status, RecordCount, ErrorMessage, DeviceId, IsDemo, InventoryListId)
                VALUES ($id, $start, $end, $source, $file, $hash, $status, $count, $err, $device, $demo, $list);
                """;
            sessionCmd.Parameters.AddWithValue("$id", session.Id);
            sessionCmd.Parameters.AddWithValue("$start", session.StartedAt.ToString("O"));
            sessionCmd.Parameters.AddWithValue("$end", (object?)session.CompletedAt?.ToString("O") ?? DBNull.Value);
            sessionCmd.Parameters.AddWithValue("$source", session.Source);
            sessionCmd.Parameters.AddWithValue("$file", (object?)session.FileName ?? DBNull.Value);
            sessionCmd.Parameters.AddWithValue("$hash", (object?)session.FileHashSha256 ?? DBNull.Value);
            sessionCmd.Parameters.AddWithValue("$status", session.Status.ToString());
            sessionCmd.Parameters.AddWithValue("$count", session.RecordCount);
            sessionCmd.Parameters.AddWithValue("$err", (object?)session.ErrorMessage ?? DBNull.Value);
            sessionCmd.Parameters.AddWithValue("$device", (object?)session.DeviceId ?? DBNull.Value);
            sessionCmd.Parameters.AddWithValue("$demo", session.IsDemo ? 1 : 0);
            sessionCmd.Parameters.AddWithValue("$list", (object?)session.InventoryListId ?? list.Id);
            await sessionCmd.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
        }

        await tx.CommitAsync(cancellationToken).ConfigureAwait(false);
        return list.Id;
    }

    public async Task<IReadOnlyList<ImportSession>> GetImportHistoryAsync(int limit = 100, CancellationToken cancellationToken = default)
    {
        await using var conn = Open();
        await conn.OpenAsync(cancellationToken).ConfigureAwait(false);
        await using var cmd = conn.CreateCommand();
        cmd.CommandText = """
            SELECT Id, StartedAt, CompletedAt, Source, FileName, FileHashSha256, Status, RecordCount, ErrorMessage, DeviceId, IsDemo, InventoryListId
            FROM ImportSessions
            ORDER BY StartedAt DESC
            LIMIT $limit;
            """;
        cmd.Parameters.AddWithValue("$limit", limit);
        var list = new List<ImportSession>();
        await using var reader = await cmd.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        while (await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
        {
            list.Add(new ImportSession
            {
                Id = reader.GetString(0),
                StartedAt = DateTimeOffset.Parse(reader.GetString(1)),
                CompletedAt = reader.IsDBNull(2) ? null : DateTimeOffset.Parse(reader.GetString(2)),
                Source = reader.IsDBNull(3) ? "" : reader.GetString(3),
                FileName = reader.IsDBNull(4) ? null : reader.GetString(4),
                FileHashSha256 = reader.IsDBNull(5) ? null : reader.GetString(5),
                Status = Enum.TryParse<ImportSessionStatus>(reader.GetString(6), out var st) ? st : ImportSessionStatus.Failed,
                RecordCount = reader.GetInt32(7),
                ErrorMessage = reader.IsDBNull(8) ? null : reader.GetString(8),
                DeviceId = reader.IsDBNull(9) ? null : reader.GetString(9),
                IsDemo = reader.GetInt32(10) == 1,
                InventoryListId = reader.IsDBNull(11) ? null : reader.GetString(11)
            });
        }
        return list;
    }

    public async Task<InventoryList?> GetInventoryListAsync(string listId, CancellationToken cancellationToken = default)
    {
        await using var conn = Open();
        await conn.OpenAsync(cancellationToken).ConfigureAwait(false);

        await using var listCmd = conn.CreateCommand();
        listCmd.CommandText = "SELECT Id, CreatedAt, ListType, Name, Source, Status, IsDemo FROM InventoryLists WHERE Id = $id;";
        listCmd.Parameters.AddWithValue("$id", listId);
        await using var listReader = await listCmd.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        if (!await listReader.ReadAsync(cancellationToken).ConfigureAwait(false))
            return null;

        var list = new InventoryList
        {
            Id = listReader.GetString(0),
            CreatedAt = DateTimeOffset.Parse(listReader.GetString(1)),
            ListType = listReader.GetString(2),
            Name = listReader.GetString(3),
            Source = listReader.GetString(4),
            Status = listReader.GetString(5),
            IsDemo = listReader.GetInt32(6) == 1
        };
        await listReader.CloseAsync().ConfigureAwait(false);

        await using var itemsCmd = conn.CreateCommand();
        itemsCmd.CommandText = """
            SELECT Id, Reference, Barcode, Model, Description, SizeCode, ColorCode, Quantity
            FROM InventoryItems WHERE ListId = $id;
            """;
        itemsCmd.Parameters.AddWithValue("$id", listId);
        await using var itemsReader = await itemsCmd.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        while (await itemsReader.ReadAsync(cancellationToken).ConfigureAwait(false))
        {
            decimal? qty = null;
            if (!itemsReader.IsDBNull(7)
                && decimal.TryParse(itemsReader.GetString(7), System.Globalization.NumberStyles.Number,
                    System.Globalization.CultureInfo.InvariantCulture, out var parsed))
            {
                qty = parsed;
            }

            list.Items.Add(new InventoryItem
            {
                Id = itemsReader.GetString(0),
                Reference = itemsReader.IsDBNull(1) ? null : itemsReader.GetString(1),
                Barcode = itemsReader.IsDBNull(2) ? null : itemsReader.GetString(2),
                Model = itemsReader.IsDBNull(3) ? null : itemsReader.GetString(3),
                Description = itemsReader.IsDBNull(4) ? null : itemsReader.GetString(4),
                SizeCode = itemsReader.IsDBNull(5) ? null : itemsReader.GetString(5),
                ColorCode = itemsReader.IsDBNull(6) ? null : itemsReader.GetString(6),
                Quantity = qty,
                IsDemoData = list.IsDemo
            });
        }

        return list;
    }

    public async Task<IReadOnlyList<InventoryList>> GetInventoryListsAsync(CancellationToken cancellationToken = default)
    {
        await using var conn = Open();
        await conn.OpenAsync(cancellationToken).ConfigureAwait(false);
        await using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT Id FROM InventoryLists ORDER BY CreatedAt DESC;";
        var ids = new List<string>();
        await using var reader = await cmd.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        while (await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
            ids.Add(reader.GetString(0));

        var lists = new List<InventoryList>();
        foreach (var id in ids)
        {
            var list = await GetInventoryListAsync(id, cancellationToken).ConfigureAwait(false);
            if (list != null) lists.Add(list);
        }
        return lists;
    }

    public async Task<bool> ExistsByFileHashAsync(string sha256, CancellationToken cancellationToken = default)
    {
        await using var conn = Open();
        await conn.OpenAsync(cancellationToken).ConfigureAwait(false);
        await using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT 1 FROM ImportSessions WHERE FileHashSha256 = $h AND IsDemo = 0 AND Status = 'Succeeded' LIMIT 1;";
        cmd.Parameters.AddWithValue("$h", sha256);
        var result = await cmd.ExecuteScalarAsync(cancellationToken).ConfigureAwait(false);
        return result is not null;
    }

    public async Task SaveSettingsAsync(ApplicationSettings settings, CancellationToken cancellationToken = default)
    {
        var json = System.Text.Json.JsonSerializer.Serialize(settings);
        await using var conn = Open();
        await conn.OpenAsync(cancellationToken).ConfigureAwait(false);
        await using var cmd = conn.CreateCommand();
        cmd.CommandText = """
            INSERT INTO ApplicationSettings(Id, Json) VALUES (1, $json)
            ON CONFLICT(Id) DO UPDATE SET Json = excluded.Json;
            """;
        cmd.Parameters.AddWithValue("$json", json);
        await cmd.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
    }

    public async Task<ApplicationSettings> GetSettingsAsync(CancellationToken cancellationToken = default)
    {
        await using var conn = Open();
        await conn.OpenAsync(cancellationToken).ConfigureAwait(false);
        await using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT Json FROM ApplicationSettings WHERE Id = 1;";
        var json = (string?)await cmd.ExecuteScalarAsync(cancellationToken).ConfigureAwait(false);
        if (string.IsNullOrWhiteSpace(json))
            return new ApplicationSettings();
        return System.Text.Json.JsonSerializer.Deserialize<ApplicationSettings>(json) ?? new ApplicationSettings();
    }

    private SqliteConnection Open() => new($"Data Source={_dbPath}");
}
