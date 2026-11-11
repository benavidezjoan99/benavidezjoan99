using System.Globalization;
using System.Text.Json;
using ADAPlusListManager.Core.Interfaces;
using ADAPlusListManager.Core.Models;
using ADAPlusListManager.Core.Validation;
using Microsoft.Extensions.Logging;

namespace ADAPlusListManager.Infrastructure.Parsers;

/// <summary>
/// Flexible parser for observed Mango/ADA+ JSON shapes.
/// Field meanings remain provisional until a real authorized sample is validated.
/// Never invents quantities.
/// </summary>
public sealed class MangoJsonParser : IMangoJsonParser
{
    private readonly ILogger<MangoJsonParser> _logger;

    public MangoJsonParser(ILogger<MangoJsonParser> logger)
    {
        _logger = logger;
    }

    public async Task<ParseResult> ParseFileAsync(string filePath, bool isDemo = false, CancellationToken cancellationToken = default)
    {
        await using var stream = File.OpenRead(filePath);
        using var reader = new StreamReader(stream);
        var content = await reader.ReadToEndAsync(cancellationToken).ConfigureAwait(false);
        return Parse(content, Path.GetFileName(filePath), isDemo);
    }

    public ParseResult Parse(string jsonContent, string sourceFileName, bool isDemo = false)
    {
        if (string.IsNullOrWhiteSpace(jsonContent))
        {
            return Fail("El archivo está vacío.");
        }

        JsonDocument document;
        try
        {
            document = JsonDocument.Parse(jsonContent, new JsonDocumentOptions
            {
                AllowTrailingCommas = true,
                CommentHandling = JsonCommentHandling.Skip
            });
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "JSON inválido en {File}", sourceFileName);
            return Fail("Se encontró el archivo, pero su contenido no pudo interpretarse como un listado compatible.");
        }

        using (document)
        {
            var elements = EnumerateItemElements(document.RootElement).ToList();
            if (elements.Count == 0)
            {
                return new ParseResult
                {
                    Success = true,
                    Items = Array.Empty<InventoryItem>(),
                    Warnings = new[] { "El JSON es válido pero no contiene registros de artículos reconocibles." },
                    IsDemo = isDemo
                };
            }

            var items = new List<InventoryItem>();
            var previews = new List<FieldMappingPreview>();
            var warnings = new List<string>();

            for (var i = 0; i < elements.Count; i++)
            {
                var element = elements[i];
                if (element.ValueKind != JsonValueKind.Object) continue;

                var mapped = MapItem(element, sourceFileName, isDemo, i);
                items.Add(mapped.Item);
                previews.AddRange(mapped.Previews);
                warnings.AddRange(InventoryItemValidator.Validate(mapped.Item)
                    .Select(w => $"Fila {i + 1}: {w}"));
            }

            if (items.Count == 0)
            {
                return Fail("No se encontraron objetos de artículo compatibles en el JSON.");
            }

            if (items.Any(x => !x.Quantity.HasValue))
            {
                warnings.Add("Los artículos fueron importados, pero no se encontraron cantidades verificables para todos los registros.");
            }

            return new ParseResult
            {
                Success = true,
                Items = items,
                MappingPreview = previews.Take(40).ToList(),
                Warnings = warnings.Distinct().ToList(),
                IsDemo = isDemo
            };
        }
    }

    private static IEnumerable<JsonElement> EnumerateItemElements(JsonElement root)
    {
        switch (root.ValueKind)
        {
            case JsonValueKind.Array:
                foreach (var el in root.EnumerateArray())
                    yield return el;
                yield break;

            case JsonValueKind.Object:
                foreach (var candidate in new[] { "items", "Items", "data", "Data", "records", "ReceptionLin", "lines", "Lines" })
                {
                    if (root.TryGetProperty(candidate, out var arr) && arr.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var el in arr.EnumerateArray())
                            yield return el;
                        yield break;
                    }
                }

                // Single object that looks like a line
                if (root.TryGetProperty("EAN", out _) || root.TryGetProperty("EANCOD", out _) || root.TryGetProperty("Modelo", out _))
                {
                    yield return root;
                    yield break;
                }

                // Object-of-objects
                foreach (var prop in root.EnumerateObject())
                {
                    if (prop.Value.ValueKind == JsonValueKind.Object)
                        yield return prop.Value;
                    else if (prop.Value.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var el in prop.Value.EnumerateArray())
                            if (el.ValueKind == JsonValueKind.Object)
                                yield return el;
                    }
                }
                yield break;
        }
    }

    private static (InventoryItem Item, List<FieldMappingPreview> Previews) MapItem(
        JsonElement element,
        string sourceFile,
        bool isDemo,
        int index)
    {
        var original = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
        Flatten(element, "", original);

        JsonElement? eanNode = null;
        if (element.TryGetProperty("EAN", out var ean) && ean.ValueKind == JsonValueKind.Object)
            eanNode = ean;

        JsonElement? modeloNode = null;
        if (element.TryGetProperty("Modelo", out var modelo) && modelo.ValueKind == JsonValueKind.Object)
            modeloNode = modelo;

        string? Get(params string[] paths)
        {
            foreach (var path in paths)
            {
                if (original.TryGetValue(path, out var v) && !string.IsNullOrWhiteSpace(v))
                    return v;
            }
            return null;
        }

        var barcode = Get("EAN.EANCOD", "EANCOD", "EAN.Barcode", "Barcode");
        var reference = Get("EAN.EANMODE", "EANMODE", "Modelo.MODMODE", "MODMODE", "Reference");
        var model = Get("Modelo.MODMODE", "MODMODE", "Model");
        var description = Get("Modelo.MODDESC", "MODDESC", "Description");
        var sizeCode = Get("EAN.EANTALL", "EANTALL", "SizeCode");
        var colorCode = Get("EAN.EANCOL", "EANCOL", "ColorCode");
        var qtyRaw = Get("EAN.EANCANT", "EANCANT", "Quantity");
        var scanRaw = Get("ScanDate", "Fecha", "Date");

        decimal? quantity = TryParseQuantity(qtyRaw);
        DateTime? scanDate = TryParseDate(scanRaw);

        var previews = new List<FieldMappingPreview>
        {
            Preview("EAN.EANCOD / EANCOD", barcode, "Barcode", barcode, "provisional"),
            Preview("EAN.EANMODE / EANMODE", reference, "Reference", reference, "provisional"),
            Preview("Modelo.MODDESC / MODDESC", description, "Description", description, "provisional"),
            Preview("EAN.EANTALL / EANTALL", sizeCode, "SizeCode", sizeCode, "provisional — código, no talla comercial"),
            Preview("EAN.EANCOL / EANCOL", colorCode, "ColorCode", colorCode, "provisional — código, no color comercial"),
            Preview("EAN.EANCANT / EANCANT", qtyRaw, "Quantity", quantity?.ToString(CultureInfo.InvariantCulture), quantity.HasValue ? "provisional" : "unknown")
        };

        var item = new InventoryItem
        {
            Id = Guid.NewGuid().ToString("N"),
            Barcode = barcode,
            Reference = reference,
            Model = model,
            Description = description,
            SizeCode = sizeCode,
            ColorCode = colorCode,
            Quantity = quantity,
            ScanDate = scanDate,
            SourceFile = sourceFile,
            RawJsonFragment = element.GetRawText(),
            IsDemoData = isDemo,
            OriginalFields = original
        };

        return (item, previews);

        static FieldMappingPreview Preview(string originalField, string? originalValue, string target, string? interpreted, string status) =>
            new()
            {
                OriginalField = originalField,
                OriginalValue = originalValue,
                TargetColumn = target,
                InterpretedValue = interpreted,
                ValidationStatus = status
            };
    }

    private static void Flatten(JsonElement element, string prefix, IDictionary<string, string?> bag)
    {
        switch (element.ValueKind)
        {
            case JsonValueKind.Object:
                foreach (var prop in element.EnumerateObject())
                {
                    var key = string.IsNullOrEmpty(prefix) ? prop.Name : $"{prefix}.{prop.Name}";
                    Flatten(prop.Value, key, bag);
                }
                break;
            case JsonValueKind.Array:
                bag[prefix] = element.GetRawText();
                break;
            case JsonValueKind.String:
                bag[prefix] = element.GetString();
                break;
            case JsonValueKind.Number:
                bag[prefix] = element.GetRawText();
                break;
            case JsonValueKind.True:
            case JsonValueKind.False:
                bag[prefix] = element.GetBoolean().ToString();
                break;
            case JsonValueKind.Null:
            case JsonValueKind.Undefined:
                bag[prefix] = null;
                break;
        }
    }

    /// <summary>
    /// Parses quantity only when explicitly present and numeric. Does not default to 1.
    /// </summary>
    private static decimal? TryParseQuantity(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return null;
        if (decimal.TryParse(raw, NumberStyles.Number, CultureInfo.InvariantCulture, out var inv))
            return inv;
        if (decimal.TryParse(raw, NumberStyles.Number, CultureInfo.GetCultureInfo("es-ES"), out var es))
            return es;
        return null;
    }

    private static DateTime? TryParseDate(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return null;
        if (DateTime.TryParse(raw, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out var dt))
            return dt;
        if (DateTime.TryParse(raw, CultureInfo.GetCultureInfo("es-ES"), DateTimeStyles.AssumeLocal, out dt))
            return dt;
        return null;
    }

    private static ParseResult Fail(string message) => new()
    {
        Success = false,
        ErrorMessage = message,
        Items = Array.Empty<InventoryItem>()
    };
}
