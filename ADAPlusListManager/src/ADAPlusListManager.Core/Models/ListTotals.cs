namespace ADAPlusListManager.Core.Models;

public sealed class ListTotals
{
    public int RecordCount { get; init; }
    public int UniqueReferenceCount { get; init; }
    public decimal? VerifiedUnitTotal { get; init; }
    public int UnknownQuantityCount { get; init; }
}
