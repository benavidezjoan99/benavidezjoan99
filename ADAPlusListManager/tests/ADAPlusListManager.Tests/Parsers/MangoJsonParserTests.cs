using ADAPlusListManager.Infrastructure.Parsers;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;

namespace ADAPlusListManager.Tests.Parsers;

public class MangoJsonParserTests
{
    private readonly MangoJsonParser _parser = new(NullLogger<MangoJsonParser>.Instance);

    [Fact]
    public void Parse_ValidArray_MapsFields_WithoutInventingQuantity()
    {
        var json = File.ReadAllText(Sample("lastRepo.demo.json"));
        var result = _parser.Parse(json, "lastRepo.demo.json", isDemo: true);

        result.Success.Should().BeTrue();
        result.Items.Should().HaveCount(4);
        result.Items[0].Barcode.Should().Be("0840000000001");
        result.Items[0].Quantity.Should().Be(2);
        result.Items[1].Quantity.Should().BeNull("null EANCANT must stay unknown");
        result.Items[3].Quantity.Should().BeNull("missing EANCANT must stay unknown");
        result.Items.Should().OnlyContain(i => i.IsDemoData);
    }

    [Fact]
    public void Parse_PreservesLeadingZerosInBarcode()
    {
        var json = File.ReadAllText(Sample("lastRepo.demo.json"));
        var result = _parser.Parse(json, "demo.json", true);
        result.Items.Should().Contain(i => i.Barcode == "0001234567890");
    }

    [Fact]
    public void Parse_InvalidJson_FailsGracefully()
    {
        var json = File.ReadAllText(Sample("lastRepo.invalid.json"));
        var result = _parser.Parse(json, "bad.json");
        result.Success.Should().BeFalse();
        result.Items.Should().BeEmpty();
    }

    [Fact]
    public void Parse_EmptyArray_SucceedsWithNoItems()
    {
        var result = _parser.Parse("[]", "empty.json");
        result.Success.Should().BeTrue();
        result.Items.Should().BeEmpty();
    }

    [Fact]
    public void Parse_NestedItemsRoot_Works()
    {
        var json = File.ReadAllText(Sample("lastRepo.nested-root.json"));
        var result = _parser.Parse(json, "nested.json", true);
        result.Success.Should().BeTrue();
        result.Items.Should().ContainSingle();
        result.Items[0].Quantity.Should().Be(3);
    }

    private static string Sample(string name)
    {
        var root = FindRepoRoot();
        return Path.Combine(root, "samples", "demo", name);
    }

    private static string FindRepoRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir != null)
        {
            if (Directory.Exists(Path.Combine(dir.FullName, "samples", "demo")))
                return dir.FullName;
            dir = dir.Parent;
        }
        throw new DirectoryNotFoundException("samples/demo not found");
    }
}
