using ADAPlusListManager.Core.Models;
using ADAPlusListManager.Infrastructure.Exporters;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;

namespace ADAPlusListManager.Tests.Exporters;

public class ExportServiceTests
{
    [Fact]
    public async Task ExportCsv_And_Excel_And_Pdf_CreateFiles()
    {
        var list = new InventoryList
        {
            Id = "L1",
            Name = "Test",
            IsDemo = true,
            Items =
            {
                new InventoryItem { Id = "1", Reference = "R1", Barcode = "0001", Description = "Demo", Quantity = 2, IsDemoData = true },
                new InventoryItem { Id = "2", Reference = "R2", Barcode = "=1+1", Description = "Formula", Quantity = null, IsDemoData = true }
            }
        };
        var request = new ReportRequest { List = list, Title = "Prueba" };
        var svc = new ExportService(NullLogger<ExportService>.Instance);
        var dir = Path.Combine(Path.GetTempPath(), "ada-plus-tests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(dir);

        var csv = Path.Combine(dir, "a.csv");
        var xlsx = Path.Combine(dir, "a.xlsx");
        var pdf = Path.Combine(dir, "a.pdf");

        await svc.ExportCsvAsync(request, csv);
        await svc.ExportExcelAsync(request, xlsx);
        await svc.ExportPdfAsync(request, pdf);

        File.Exists(csv).Should().BeTrue();
        File.Exists(xlsx).Should().BeTrue();
        File.Exists(pdf).Should().BeTrue();
        var csvText = await File.ReadAllTextAsync(csv);
        csvText.Should().Contain("0001");
    }
}
