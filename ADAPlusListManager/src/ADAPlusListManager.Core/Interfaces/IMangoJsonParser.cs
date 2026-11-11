using ADAPlusListManager.Core.Models;

namespace ADAPlusListManager.Core.Interfaces;

public interface IMangoJsonParser
{
    ParseResult Parse(string jsonContent, string sourceFileName, bool isDemo = false);
    Task<ParseResult> ParseFileAsync(string filePath, bool isDemo = false, CancellationToken cancellationToken = default);
}
